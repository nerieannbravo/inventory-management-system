export async function uploadFile(file: File, bodyNumber: string): Promise<{ url: string, name: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('body_number', bodyNumber);
    
    const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'File upload failed with no details' }));
        throw new Error(errorData.error || 'File upload failed');
    }
    
    const data = await res.json();
    return { url: data.url, name: data.name };
} 