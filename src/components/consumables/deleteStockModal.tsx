import React from "react";

interface DeleteStockModalProps {
  item: {
    id: number;
    name: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteStockModal({ item, onConfirm, onCancel }: DeleteStockModalProps) {
  return (
    <>
      <div className="modal-heading">
        <h1 className="modal-title">Confirm Deletion</h1>
      </div>

      <div className="modal-content delete">
        <p>
          Are you sure you want to delete <strong>{item.name}</strong>?
        </p>
        <div className="modal-actions delete">
        <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="delete-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </>
  );
}