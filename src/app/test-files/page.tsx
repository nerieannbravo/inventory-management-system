"use client";

import { useState } from 'react';

export default function TestFilesPage() {
  const [testResult, setTestResult] = useState<string>('');

  const testFileAccess = async () => {
    try {
      // Test with one of the existing files
      const response = await fetch('/api/upload/1750443699340-Resume.pdf');
      if (response.ok) {
        setTestResult('✅ File access successful!');
      } else {
        setTestResult(`❌ File access failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>File Serving Test</h1>
      <button onClick={testFileAccess} style={{ padding: '10px 20px', margin: '10px 0' }}>
        Test File Access
      </button>
      <div style={{ marginTop: '20px' }}>
        <p><strong>Test Result:</strong> {testResult}</p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Available Test Files:</h2>
        <ul>
          <li><a href="/api/upload/1750443699340-Resume.pdf" target="_blank">1750443699340-Resume.pdf</a></li>
          <li><a href="/api/upload/1750443702039-Resume.pdf" target="_blank">1750443702039-Resume.pdf</a></li>
          <li><a href="/api/upload/lllll-school-id.jpg" target="_blank">lllll-school-id.jpg</a></li>
        </ul>
      </div>
    </div>
  );
} 