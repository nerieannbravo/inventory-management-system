import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { generateId } from '@/app/lib/idGenerator';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ bus_id: string }> }
) {
  try {
    const { bus_id: busId } = await params;
    const data = await req.json();
    const { newlyUploadedFiles, busOtherFiles, ...busData } = data;

    // TODO: Add data validation here (e.g., using Zod)

    // Separate details for easier handling
    const { secondHandDetails, brandNewDetails, ...mainBusData } = busData;

    // 1. Update the main bus details
    await prisma.bus.update({
      where: { bus_id: busId },
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
        where: { s_bus_id: busId },
        update: secondHandDetails,
        create: {
          s_bus_id: busId,
          ...secondHandDetails,
        },
      });
    }
    
    if (brandNewDetails) {
      await prisma.brandNewDetails.upsert({
        where: { b_bus_id: busId },
        update: brandNewDetails,
        create: {
          b_bus_id: busId,
          ...brandNewDetails,
        },
      });
    }

    // 3. Handle file updates
    // Get the original files from the DB
    const originalFiles = await prisma.busOtherFiles.findMany({
      where: { bus_id: busId },
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
              bus_id: busId,
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
                bus_id: busId,
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
              bus_id: busId,
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