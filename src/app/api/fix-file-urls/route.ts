import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    // Get all bus files
    const busFiles = await prisma.busOtherFiles.findMany();
    
    const results = [];
    
    for (const file of busFiles) {
      let needsUpdate = false;
      let newUrl = file.file_url;
      
      // Check if URL needs to be updated
      if (file.file_url.startsWith('/upload/')) {
        // Convert /upload/filename to /api/upload/filename
        newUrl = file.file_url.replace('/upload/', '/api/upload/');
        needsUpdate = true;
      } else if (file.file_url.startsWith('/upload/')) {
        // Convert /uploads/filename to /api/upload/filename
        newUrl = file.file_url.replace('/upload/', '/api/upload/');
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await prisma.busOtherFiles.update({
          where: { bus_files_id: file.bus_files_id },
          data: { file_url: newUrl }
        });
        
        results.push({
          file_id: file.bus_files_id,
          old_url: file.file_url,
          new_url: newUrl,
          updated: true
        });
      } else {
        results.push({
          file_id: file.bus_files_id,
          url: file.file_url,
          updated: false
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      total_files: busFiles.length,
      results 
    });
    
  } catch (error) {
    console.error('Error fixing file URLs:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 