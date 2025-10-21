export const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
    if (['txt', 'doc', 'docx'].includes(ext || '')) return 'text';
    return 'other';
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileIcon = (filename: string): string => {
    const type = getFileType(filename);
    const icons: Record<string, string> = {
        pdf: 'ri-file-pdf-2-line',
        image: 'ri-image-line',
        text: 'ri-file-text-line',
        other: 'ri-file-line'
    };
    return icons[type] || 'ri-file-line';
};