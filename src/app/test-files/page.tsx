"use client";

import { useState, useEffect } from 'react';

export default function TestFiles() {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/upload?file=1750443699340-Resume.pdf');
        if (response.ok) {
          console.log('File exists');
        }
      } catch (error) {
        console.error('Error fetching file:', error);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Files</h1>
      <p className="mb-4">Testing file upload and serving functionality</p>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test File Links:</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><a href="/api/upload?file=1750443699340-Resume.pdf" target="_blank">1750443699340-Resume.pdf</a></li>
          <li><a href="/api/upload?file=1750443702039-Resume.pdf" target="_blank">1750443702039-Resume.pdf</a></li>
          <li><a href="/api/upload?file=lllll-school-id.jpg" target="_blank">lllll-school-id.jpg</a></li>
        </ul>
      </div>
    </div>
  );
} 