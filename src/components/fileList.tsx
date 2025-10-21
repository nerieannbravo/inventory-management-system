import { formatFileSize, getFileIcon, getFileType } from "@/utils/fileHelpers";

interface FileListProps {
    files: Array<{ name: string; size?: number; url?: string }>;
    showRemove?: boolean;
    onRemove?: (index: number) => void;
    onFileClick?: (file: { name: string; size?: number; url?: string }, index: number) => void;
}

export function FileList({ files, showRemove = false, onRemove, onFileClick }: FileListProps) {
    return (
        <div className="uploaded-files-container">
            <ul className="uploaded-files-list">
                {files.map((file, idx) => (
                    <li 
                        key={idx} 
                        className="file-item"
                        onClick={() => onFileClick?.(file, idx)}
                        style={{ cursor: onFileClick ? 'pointer' : 'default' }}
                    >
                        <div className={`file-icon ${getFileType(file.name)}`}>
                            <i className={getFileIcon(file.name)} />
                        </div>
                        <div className="file-info">
                            <p className="file-name">{file.name}</p>
                            {file.size && <p className="file-size">{formatFileSize(file.size)}</p>}
                        </div>
                        {showRemove && (
                            <button
                                type="button"
                                className="remove-file-button"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering onFileClick
                                    onRemove?.(idx);
                                }}
                                aria-label={`Remove ${file.name}`}
                            >
                                ✕
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}