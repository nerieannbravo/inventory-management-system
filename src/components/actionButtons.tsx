import React from "react";
import "@/styles/actionButtons.css";

interface ActionButtonsProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onSend?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    onToggleStar?: () => void;
    isStarred?: boolean;
    disableView?: boolean;
    disableEdit?: boolean;
    disableDelete?: boolean;
    disableSend?: boolean;
    disableApprove?: boolean;
    disableReject?: boolean;
    disableStar?: boolean;
}

const ActionButtons = ({
    onView,
    onEdit,
    onDelete,
    onSend,
    onApprove,
    onReject,
    onToggleStar,
    isStarred = false,
    disableView = false,
    disableEdit = false,
    disableDelete = false,
    disableSend = false,
    disableApprove = false,
    disableReject = false,
    disableStar = false
}: ActionButtonsProps) => {
    return (
        <div className="action-buttons">
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
                    onClick={disableEdit ? undefined : onEdit}
                    title={disableEdit ? "Cannot edit this" : "Edit"}
                    disabled={disableEdit}
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
            {onSend && (
                <button
                    className={`action-btn send${disableSend ? ' disabled' : ''}`}
                    onClick={disableSend ? undefined : onSend}
                    title={disableSend ? "Cannot send at this status" : "Send"}
                    disabled={disableSend}
                >
                    <i className="ri-send-plane-line"></i>
                </button>
            )}
            {onApprove && (
                <button
                    className={`action-btn approve${disableApprove ? ' disabled' : ''}`}
                    onClick={disableApprove ? undefined : onApprove}
                    title={disableApprove ? "Cannot approve at this status" : "Approve"}
                    disabled={disableApprove}
                >
                    <i className="ri-check-line"></i>
                </button>
            )}
            {onReject && (
                <button
                    className={`action-btn reject${disableReject ? ' disabled' : ''}`}
                    onClick={disableReject ? undefined : onReject}
                    title={disableReject ? "Cannot reject at this status" : "Reject"}
                    disabled={disableReject}
                >
                    <i className="ri-close-line"></i>
                </button>
            )}
            {onToggleStar && (
                <button
                    className={`action-btn star${disableStar ? ' disabled' : ''}${isStarred ? ' starred' : ''}`}
                    onClick={onToggleStar}
                    title={isStarred ? "Remove from Preferred" : "Mark as Preferred"}
                >
                    {isStarred ? <i className="ri-star-fill"></i> : <i className="ri-star-line"></i>}
                </button>
            )}
        </div>
    );
};

export default ActionButtons;