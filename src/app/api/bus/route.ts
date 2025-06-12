import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { generateId } from "../../lib/idGenerator";
// import { BusType, BusStatus, BodyBuilder } from "@prisma/client";

// ===============================
// GET: Fetch all buses that are not deleted
// Returns each bus with its linked inventory item details including current stock
// ===============================
export async function GET() {
  try {
    // Query buses that are not marked as deleted
    const buses = await prisma.bus.findMany({
      where: { isdeleted: false },
      select: {
        bus_id: true,
        plate_number: true,
        body_number: true,
        body_builder: true,
        bus_type: true,
        manufacturer: true,
        status: true,
        chasis_number: true,
        engine_number: true,
        seat_capacity: true,
        purchase_price: true,
        purchase_date: true,
        date_created: true,
        date_updated: true,
        created_by: true,

        // Include linked inventory item details
        inventoryItem: {
          select: {
            item_id: true,
            item_name: true,
            status: true,
            reorder_level: true,
            current_stock: true, // <-- Show current stock count of the bus inventory item
            category: {
              select: {
                category_id: true,
                category_name: true,
              },
            },
          },
        },
      },
    });

    // Return successful JSON response with buses data
    return NextResponse.json({ success: true, buses });
  } catch (error: any) {
    // Log and return error response if query fails
    console.error("❌ Error fetching buses:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ===============================
// POST: Create a new bus and link it to an inventory item
// ===============================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Incoming request:", body);

    // Destructure input fields and assign default status
    const {
      plate_number,
      body_number,
      body_builder,
      bus_type,
      manufacturer,
      status = "active",
      chasis_number,
      engine_number,
      seat_capacity,
    } = body;

    // Validate required fields
    const requiredFields: Record<string, unknown> = {
      plate_number,
      body_number,
      body_builder,
      bus_type,
      manufacturer,
      seat_capacity,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        return NextResponse.json(
          { success: false, error: `${key} is required` },
          { status: 400 }
        );
      }
    }

    // Normalize input values (case-insensitive mapping)
    const normalize = (str: unknown): string =>
      typeof str === "string" ? str.trim().toLowerCase() : "";

    // Maps for valid enum values
    const statusMap: Record<string, any> = {
      active: "ACTIVE",
      decommissioned: "DECOMMISSIONED",
      under_maintenance: "UNDER_MAINTENANCE",
    };

    const bodyBuilderMap: Record<string, any> = {
      agila: "AGILA",
      hilltop: "HILLTOP",
      rbm: "RBM",
      darj: "DARJ",
    };

    const busTypeMap: Record<string, any> = {
      airconditioned: "AIRCONDITIONED",
      ordinary: "ORDINARY",
    };

    // Get normalized enum values or fallbacks
    const normalizedStatusKey = statusMap[normalize(status)] || "AVAILABLE";
    const builderKey = normalize(body_builder);
    const busTypeKey = normalize(bus_type);
    const normalizedBuilderMap = bodyBuilderMap[builderKey] || null;
    const normalizedTypeMap = busTypeMap[busTypeKey] || null;

    // Validate body builder and bus type
    if (!normalizedBuilderMap || !normalizedTypeMap) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid body_builder or bus_type. Valid options: BodyBuilder - ${Object.keys(bodyBuilderMap).join(", ")} | BusType - ${Object.keys(busTypeMap).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check for existing bus with duplicate identifiers
    const existingBus = await prisma.bus.findFirst({
      where: {
        OR: [
          { plate_number },
          { body_number },
          { chasis_number },
          { engine_number },
        ],
      },
    });

    if (existingBus) {
      const duplicateField = Object.keys(requiredFields).find(
        (key) => existingBus[key as keyof typeof existingBus] === body[key]
      );

      return NextResponse.json(
        {
          success: false,
          error: `Duplicate ${duplicateField} detected.`,
        },
        { status: 409 }
      );
    }

    // Fetch the "Bus" inventory category
    const busCategory = await prisma.category.findFirst({
      where: { category_name: "Bus", isdeleted: false },
    });

    if (!busCategory) {
      return NextResponse.json(
        { success: false, error: "Bus category not found" },
        { status: 400 }
      );
    }

    // Generate unique IDs for bus and inventory item (with retries)
    let item_id = "";
    let bus_id = "";
    let attempt = 0;
    const maxAttempts = 10;

    while (attempt < maxAttempts) {
      item_id = await generateId("inventoryItem", "ITEM");
      bus_id = await generateId("bus", "BUS");

      const [busExists, itemExists] = await Promise.all([
        prisma.bus.findUnique({ where: { bus_id } }),
        prisma.inventoryItem.findUnique({ where: { item_id } }),
      ]);

      if (!busExists && !itemExists) break;

      attempt++;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (attempt === maxAttempts) {
      return NextResponse.json(
        { success: false, error: "Failed to generate unique IDs" },
        { status: 500 }
      );
    }

    // Transaction: create new bus and update or create inventory item
    const newBus = await prisma.$transaction(async (tx) => {
      // Check if "Bus" inventory item already exists
      const existingInventory = await tx.inventoryItem.findFirst({
        where: {
          category_id: busCategory.category_id,
          item_name: "Bus",
          isdeleted: false,
        },
      });

      let item_id_to_use = "";

      if (existingInventory) {
        // Increment stock only if new bus is ACTIVE
        if (normalizedStatusKey === "ACTIVE") {
          await tx.inventoryItem.update({
            where: { item_id: existingInventory.item_id },
            data: { current_stock: { increment: 1 } },
          });
        }

        item_id_to_use = existingInventory.item_id;
      } else {
        // No existing inventory item: create new with initial stock
        const initialStock = normalizedStatusKey === "ACTIVE" ? 1 : 0;
        const created = await tx.inventoryItem.create({
          data: {
            item_id,
            item_name: "Bus",
            category_id: busCategory.category_id,
            unit_measure: "unit",
            reorder_level: 0,
            current_stock: initialStock,
            status: "AVAILABLE",
            created_by: "USR-00001",
          },
        });
        item_id_to_use = created.item_id;
      }

      // Create new bus entry
      return await tx.bus.create({
        data: {
          bus_id,
          item_id: item_id_to_use,
          plate_number,
          body_number,
          body_builder: normalizedBuilderMap,
          bus_type: normalizedTypeMap,
          manufacturer,
          status: normalizedStatusKey,
          chasis_number,
          engine_number,
          seat_capacity: parseInt(seat_capacity.toString()),
          created_by: 1,
        },
      });
    });

    return NextResponse.json({ success: true, data: newBus });
  } catch (error: any) {
    console.error("❌ POST Error:", error);

    // Handle Prisma duplicate entry error
    if (error.code === "P2002") {
      const target = error.meta?.target?.[0] ?? "unknown field";
      return NextResponse.json(
        {
          success: false,
          error: `Duplicate entry detected in field: ${target}`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}




// ===============================
// PUT: Update bus details (Only editable fields)
// ===============================
export async function PUT(request: NextRequest) {
  try {
    const { bus_id, bus_type, seat_capacity, status } = await request.json();

    if (!bus_id || bus_id === "undefined") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid bus_id" },
        { status: 400 }
      );
    }

    const updated = await prisma.bus.update({
      where: { bus_id: String(bus_id) },
      data: {
        bus_type: bus_type,
        seat_capacity: seat_capacity,
        status: status,
      },
    });
    return NextResponse.json({
      success: true,
      bus: updated,
      message: "Bus updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
