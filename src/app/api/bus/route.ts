import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { generateId } from '@/app/lib/idGenerator';
import type { BodyBuilder, BusType, BusStatus, BusCondition, AcquisitionMethod, RegistrationStatus, BusSource } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      bus: busForm,
      secondHandDetails,
      brandNewDetails,
      busOtherFiles
    } = data;

    // Generate bus_id
    const bus_id = await generateId('bus', 'BUS');

    // Map frontend values to Prisma enums
    const bodyBuilderMap = {
      'agila': 'AGILA',
      'hilltop': 'HILLTOP',
      'rbm': 'RBM',
      'darj': 'DARJ',
    };
    const busTypeMap = {
      'airconditioned': 'AIRCONDITIONED',
      'ordinary': 'ORDINARY',
    };
    const busStatusMap = {
      'active': 'ACTIVE',
      'decommissioned': 'DECOMMISSIONED',
      'under_maintenance': 'UNDER_MAINTENANCE',
    };
    const busConditionMap = {
      'brand-new': 'BRAND_NEW',
      'second-hand': 'SECOND_HAND',
    };
    const acquisitionMethodMap = {
      'purchased': 'PURCHASED',
      'leased': 'LEASED',
      'donated': 'DONATED',
    };
    const registrationStatusMap = {
      'registered': 'REGISTERED',
      'not_registered': 'NOT_REGISTERED',
      'needs_renewal': 'NEEDS_RENEWAL',
      'expired': 'EXPIRED',
    };

    const busSourceMap = {
      'dealership': 'DEALERSHIP',
      'auction': 'AUCTION',
      'private-individual': 'PRIVATE_INDIVIDUAL',
    };

    // Helper function to safely map string to enum
    function mapEnum<T extends Record<string, string>>(map: T, value: unknown, fallback: string): string {
      if (typeof value === 'string') {
        const key = value.toLowerCase();
        if (key in map) return map[key];
      }
      return fallback;
    }

    let createdBus;
    if (busForm.condition === 'second-hand' && !secondHandDetails) {
      createdBus = await prisma.bus.create({
        data: {
          bus_id,
          item_id: "ITEM-00001", // Make sure to provide item_id from frontend or generate if needed
          plate_number: busForm.plate_number,
          body_number: busForm.body_number,
          body_builder: mapEnum(bodyBuilderMap, busForm.bodyBuilder, 'AGILA') as BodyBuilder,
          bus_type: mapEnum(busTypeMap, busForm.bus_type, 'ORDINARY') as BusType,
          manufacturer: busForm.manufacturer,
          status: mapEnum(busStatusMap, busForm.status, 'ACTIVE') as BusStatus,
          chasis_number: busForm.chasis_number,
          engine_number: busForm.engine_number,
          seat_capacity: Number(busForm.seat_capacity),
          model: busForm.model,
          year_model: Number(busForm.year_model),
          condition: mapEnum(busConditionMap, busForm.condition, 'BRAND_NEW') as BusCondition,
          acquisition_date: new Date(busForm.acquisition_date),
          acquisition_method: mapEnum(acquisitionMethodMap, busForm.acquisition_method, 'PURCHASED') as AcquisitionMethod,
          warranty_expiration_date: busForm.warranty_expiration_date ? new Date(busForm.warranty_expiration_date) : null,
          registration_status: mapEnum(registrationStatusMap, busForm.registration_status, 'REGISTERED') as RegistrationStatus,
          date_created: new Date(),
          created_by: 1, // Replace with actual user ID if available
          secondHandDetails: {
            create: {
              previous_owner: busForm.previous_owner || null,
              previous_owner_contact: busForm?.previous_owner_contact || null,
              source: mapEnum(busSourceMap, busForm.source, 'DEALERSHIP') as BusSource,
              odometer_reading: Number(busForm.odometer_reading),
              last_registration_date: new Date(busForm.last_registration_date),
              last_maintenance_date: new Date(busForm.last_maintenance_date),
              bus_condition_notes: busForm?.bus_condition_notes || null,
            }
          }
        }
      });
    } else if (busForm.condition === 'brand-new' && !brandNewDetails) {
      createdBus = await prisma.bus.create({
        data: {
          bus_id,
          item_id: "ITEM-00001", // Make sure to provide item_id from frontend or generate if needed
          plate_number: busForm.plate_number,
          body_number: busForm.body_number,
          body_builder: mapEnum(bodyBuilderMap, busForm.bodyBuilder, 'AGILA') as BodyBuilder,
          bus_type: mapEnum(busTypeMap, busForm.bus_type, 'ORDINARY') as BusType,
          manufacturer: busForm.manufacturer,
          status: mapEnum(busStatusMap, busForm.status, 'ACTIVE') as BusStatus,
          chasis_number: busForm.chasis_number,
          engine_number: busForm.engine_number,
          seat_capacity: Number(busForm.seat_capacity),
          model: busForm.model,
          year_model: Number(busForm.year_model),
          condition: mapEnum(busConditionMap, busForm.condition, 'BRAND_NEW') as BusCondition,
          acquisition_date: new Date(busForm.acquisition_date),
          acquisition_method: mapEnum(acquisitionMethodMap, busForm.acquisition_method, 'PURCHASED') as AcquisitionMethod,
          warranty_expiration_date: busForm.warranty_expiration_date ? new Date(busForm.warranty_expiration_date) : null,
          registration_status: mapEnum(registrationStatusMap, busForm.registration_status, 'REGISTERED') as RegistrationStatus,
          date_created: new Date(),
          created_by: 1, // Replace with actual user ID if available
          brandNewDetails: {
            create: {
              dealer_name: busForm.dealer_name,
              dealer_contact: busForm.dealer_contact,
            }
          }
        }
      });
    }

    // Always create BusOtherFiles after the bus is created
    if (createdBus && Array.isArray(busOtherFiles) && busOtherFiles.length > 0) {
      for (const file of busOtherFiles) {
        await prisma.busOtherFiles.create({
          data: {
            bus_files_id: await generateId('busOtherFiles', 'FILE'), // Unique id for each file
            file_name: file.file_name,
            file_type: file.file_type,
            file_url: file.file_url,
            date_uploaded: new Date(),
            bus_id: createdBus.bus_id, // Link file to the created bus
          }
        });
      }
    }

    if (createdBus) {
      // Count all buses using item_id 'ITEM-00001'
      const busCount = await prisma.bus.count({
        where: { item_id: 'ITEM-00001' }
      });
      // Update current_stock in inventoryItem
      await prisma.inventoryItem.update({
        where: { item_id: 'ITEM-00001' },
        data: { current_stock: busCount }
      });
      return NextResponse.json({ success: true, bus_id: createdBus.bus_id });
    }

  } catch (error) {
    console.error(error);
    let message = 'Unknown error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const buses = await prisma.bus.findMany({
      include: {
        secondHandDetails: true,
        brandNewDetails: true,
        busOtherFiles: true,
      },
    });
    return NextResponse.json({ success: true, buses });
  } catch (error) {
    console.error('❌ Error fetching buses:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { bus_id, newlyUploadedFiles, busOtherFiles, ...busData } = data;

    if (!bus_id || bus_id === "undefined") {
      return NextResponse.json({ success: false, error: "Missing or invalid bus_id" }, { status: 400 });
    }

    // TODO: Add data validation here (e.g., using Zod)

    // Separate details for easier handling
    const { secondHandDetails, brandNewDetails, ...mainBusData } = busData;

    // 1. Update the main bus details
    await prisma.bus.update({
      where: { bus_id: String(bus_id) },
      data: {
        ...mainBusData,
        // Ensure nested details are not passed to the top-level update
        secondHandDetails: undefined,
        brandNewDetails: undefined,
      },
    });

    // 2. Update nested details if they exist using upsert
    if (secondHandDetails) {
      await prisma.secondHandDetails.upsert({
        where: { s_bus_id: String(bus_id) },
        update: secondHandDetails,
        create: {
          s_bus_id: String(bus_id),
          ...secondHandDetails,
        },
      });
    }
    
    if (brandNewDetails) {
      await prisma.brandNewDetails.upsert({
        where: { b_bus_id: String(bus_id) },
        update: brandNewDetails,
        create: {
          b_bus_id: String(bus_id),
          ...brandNewDetails,
        },
      });
    }

    // 3. Handle file updates
    // Get the original files from the DB
    const originalFiles = await prisma.busOtherFiles.findMany({
      where: { bus_id: String(bus_id) },
    });

    const clientFileIds = busOtherFiles.map((file: any) => file.bus_files_id);

    // Identify files to be deleted
    const filesToDelete = originalFiles.filter(
      (dbFile) => !clientFileIds.includes(dbFile.bus_files_id)
    );

    // Delete files that were removed in the UI
    for (const fileToDelete of filesToDelete) {
      await prisma.busOtherFiles.delete({
        where: { bus_files_id: fileToDelete.bus_files_id },
      });
      // TODO: Add logic here to delete the actual file from storage
    }

    // 4. Handle newly uploaded files
    if (newlyUploadedFiles && newlyUploadedFiles.length > 0) {
      for (const file of newlyUploadedFiles) {
        if (file.file_type === 'CR') {
          // Check if CR file already exists in the database
          const existingCRFile = await prisma.busOtherFiles.findFirst({
            where: { 
              bus_id: String(bus_id),
              file_type: 'CR'
            }
          });

          if (existingCRFile) {
            // Update existing CR file
            await prisma.busOtherFiles.update({
              where: { bus_files_id: existingCRFile.bus_files_id },
              data: {
                file_name: file.file_name,
                file_url: file.file_url,
                date_uploaded: new Date(),
              },
            });
          } else {
            // Create new CR file
            await prisma.busOtherFiles.create({
              data: {
                bus_files_id: await generateId('busOtherFiles', 'FILE'),
                file_name: file.file_name,
                file_type: file.file_type,
                file_url: file.file_url,
                bus_id: String(bus_id),
              },
            });
          }
        } else {
          // For other file types, just create new
          await prisma.busOtherFiles.create({
            data: {
              bus_files_id: await generateId('busOtherFiles', 'FILE'),
              file_name: file.file_name,
              file_type: file.file_type,
              file_url: file.file_url,
              bus_id: String(bus_id),
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Bus updated successfully' });

  } catch (error) {
    console.error('Error updating bus:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// // ===============================
// // POST: Create a new bus and link it to an inventory item
// // ===============================
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     console.log("Incoming request:", body);

//     // Destructure input fields and assign default status
//     const {
//       plate_number,
//       body_number,
//       body_builder,
//       bus_type,
//       manufacturer,
//       status = "active",
//       chasis_number,
//       engine_number,
//       seat_capacity,
//     } = body;

//     // Validate required fields
//     const requiredFields: Record<string, unknown> = {
//       plate_number,
//       body_number,
//       body_builder,
//       bus_type,
//       manufacturer,
//       seat_capacity,
//     };

//     for (const [key, value] of Object.entries(requiredFields)) {
//       if (!value || (typeof value === "string" && value.trim() === "")) {
//         return NextResponse.json(
//           { success: false, error: `${key} is required` },
//           { status: 400 }
//         );
//       }
//     }

//     // Normalize input values (case-insensitive mapping)
//     const normalize = (str: unknown): string =>
//       typeof str === "string" ? str.trim().toLowerCase() : "";

//     // Maps for valid enum values
//     const statusMap: Record<string, any> = {
//       active: "ACTIVE",
//       decommissioned: "DECOMMISSIONED",
//       under_maintenance: "UNDER_MAINTENANCE",
//     };

//     const bodyBuilderMap: Record<string, any> = {
//       agila: "AGILA",
//       hilltop: "HILLTOP",
//       rbm: "RBM",
//       darj: "DARJ",
//     };

//     const busTypeMap: Record<string, any> = {
//       airconditioned: "AIRCONDITIONED",
//       ordinary: "ORDINARY",
//     };

//     // Get normalized enum values or fallbacks
//     const normalizedStatusKey = statusMap[normalize(status)] || "AVAILABLE";
//     const builderKey = normalize(body_builder);
//     const busTypeKey = normalize(bus_type);
//     const normalizedBuilderMap = bodyBuilderMap[builderKey] || null;
//     const normalizedTypeMap = busTypeMap[busTypeKey] || null;

//     // Validate body builder and bus type
//     if (!normalizedBuilderMap || !normalizedTypeMap) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: `Invalid body_builder or bus_type. Valid options: BodyBuilder - ${Object.keys(bodyBuilderMap).join(", ")} | BusType - ${Object.keys(busTypeMap).join(", ")}`,
//         },
//         { status: 400 }
//       );
//     }

//     // Check for existing bus with duplicate identifiers
//     const existingBus = await prisma.bus.findFirst({
//       where: {
//         OR: [
//           { plate_number },
//           { body_number },
//           { chasis_number },
//           { engine_number },
//         ],
//       },
//     });

//     if (existingBus) {
//       const duplicateField = Object.keys(requiredFields).find(
//         (key) => existingBus[key as keyof typeof existingBus] === body[key]
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           error: `Duplicate ${duplicateField} detected.`,
//         },
//         { status: 409 }
//       );
//     }

//     // Fetch the "Bus" inventory category
//     const busCategory = await prisma.category.findFirst({
//       where: { category_name: "Bus", isdeleted: false },
//     });

//     if (!busCategory) {
//       return NextResponse.json(
//         { success: false, error: "Bus category not found" },
//         { status: 400 }
//       );
//     }

//     // Generate unique IDs for bus and inventory item (with retries)
//     let item_id = "";
//     let bus_id = "";
//     let attempt = 0;
//     const maxAttempts = 10;

//     while (attempt < maxAttempts) {
//       item_id = await generateId("inventoryItem", "ITEM");
//       bus_id = await generateId("bus", "BUS");

//       const [busExists, itemExists] = await Promise.all([
//         prisma.bus.findUnique({ where: { bus_id } }),
//         prisma.inventoryItem.findUnique({ where: { item_id } }),
//       ]);

//       if (!busExists && !itemExists) break;

//       attempt++;
//       await new Promise((resolve) => setTimeout(resolve, 100));
//     }

//     if (attempt === maxAttempts) {
//       return NextResponse.json(
//         { success: false, error: "Failed to generate unique IDs" },
//         { status: 500 }
//       );
//     }

//     // Transaction: create new bus and update or create inventory item
//     const newBus = await prisma.$transaction(async (tx) => {
//       // Check if "Bus" inventory item already exists
//       const existingInventory = await tx.inventoryItem.findFirst({
//         where: {
//           category_id: busCategory.category_id,
//           item_name: "Bus",
//           isdeleted: false,
//         },
//       });

//       let item_id_to_use = "";

//       if (existingInventory) {
//         // Increment stock only if new bus is ACTIVE
//         if (normalizedStatusKey === "ACTIVE") {
//           await tx.inventoryItem.update({
//             where: { item_id: existingInventory.item_id },
//             data: { current_stock: { increment: 1 } },
//           });
//         }

//         item_id_to_use = existingInventory.item_id;
//       } else {
//         // No existing inventory item: create new with initial stock
//         const initialStock = normalizedStatusKey === "ACTIVE" ? 1 : 0;
//         const created = await tx.inventoryItem.create({
//           data: {
//             item_id,
//             item_name: "Bus",
//             category_id: busCategory.category_id,
//             unit_measure: "unit",
//             reorder_level: 0,
//             current_stock: initialStock,
//             status: "AVAILABLE",
//             created_by: "USR-00001",
//           },
//         });
//         item_id_to_use = created.item_id;
//       }

//       // Create new bus entry
//       return await tx.bus.create({
//         data: {
//           bus_id,
//           item_id: item_id_to_use,
//           plate_number,
//           body_number,
//           body_builder: normalizedBuilderMap,
//           bus_type: normalizedTypeMap,
//           manufacturer,
//           status: normalizedStatusKey,
//           chasis_number,
//           engine_number,
//           seat_capacity: parseInt(seat_capacity.toString()),
//           created_by: 1,
//         },
//       });
//     });

//     return NextResponse.json({ success: true, data: newBus });
//   } catch (error: any) {
//     console.error("❌ POST Error:", error);

//     // Handle Prisma duplicate entry error
//     if (error.code === "P2002") {
//       const target = error.meta?.target?.[0] ?? "unknown field";
//       return NextResponse.json(
//         {
//           success: false,
//           error: `Duplicate entry detected in field: ${target}`,
//         },
//         { status: 409 }
//       );
//     }

//     return NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
