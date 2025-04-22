import React from "react";

interface ViewStockModalProps {
  item: {
    id: number;
    name: string;
    stock: number;
    unit: string;
    status: string;
    reorder: number;
    // Additional fields would be included in a real application
  };
  formatStatus: (status: string) => string;
}

export default function ViewStockModal({ item, formatStatus }: ViewStockModalProps) {
  return (
    <>
      <div className="modal-heading">
        <h1 className="modal-title">{item.name}</h1>
      </div>

      <div className="modal-content view">
        <div className="modal-view-properties">
          <strong>Current Stock:</strong>
          <strong>Unit Price:</strong>
          <strong>Reorder Level:</strong>
          <strong>Status:</strong>
          <strong>Expiration Date:</strong>
          <strong>Date Added:</strong>
        </div>

        <div className="modal-view-values">
          <p>{item.stock} {item.unit}</p>
          <p>Php 100.00</p>
          <p>{item.reorder}</p>
          <p>{formatStatus(item.status)}</p>
          <p>April 29, 2027</p>
          <p>April 1, 2024</p>
        </div>
      </div>
    </>
  );
}