import React from "react";
import "@/styles/actionButtons.css";

interface ActionButtonsProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleStar?: () => void;
    isStarred?: boolean;
    disableView?: boolean;
    disableEdit?: boolean;
    disableDelete?: boolean;
    disableStar?: boolean;
}

const ActionButtons = ({
    onView,
    onEdit,
    onDelete,
    onToggleStar,
    isStarred = false,
    disableView = false,
    disableEdit = false,
    disableDelete = false,
    disableStar = false
}: ActionButtonsProps) => {
    return (
        <div className="action-buttons">
            {onToggleStar && (
                <button
                    className={`action-btn star${disableStar ? ' disabled' : ''}${isStarred ? ' starred' : ''}`}
                    onClick={onToggleStar}
                    title={isStarred ? "Remove from Preferred" : "Mark as Preferred"}
                >
                    {isStarred ? <i className="ri-star-fill"></i> : <i className="ri-star-line"></i>}
                </button>
            )}
            {onView && (
                <button
                    className={`action-btn view${disableView ? ' disabled' : ''}`}
                    onClick={onView}
                    title="View"
                >
                    <i className="ri-eye-line"></i>
                </button>
            )}
            {onEdit && (
                <button
                    className={`action-btn edit${disableEdit ? ' disabled' : ''}`}
                    onClick={onEdit}
                    title="Edit"
                >
                    <i className="ri-edit-2-line"></i>
                </button>
            )}
            {onDelete && (
                <button
                    className={`action-btn delete${disableDelete ? ' disabled' : ''}`}
                    onClick={onDelete}
                    title="Delete"
                >
                    <i className="ri-delete-bin-line"></i>
                </button>
            )}
        </div>
    );
};

export default ActionButtons;