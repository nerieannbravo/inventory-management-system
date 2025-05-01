import React from "react";

import "@/styles/forms.css";

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
			<div className="modal-heading delete">
				<i className="ri-delete-bin-line"></i>
				<h1 className="modal-title">Confirm Deletion</h1>
			</div>

			<div className="modal-content delete">
				<p>
					Are you sure you want to delete "{item.name}"? 
					<br />You will not be able to undo this.
				</p>
			</div>
			<div className="modal-actions delete">
				<button className="cancel-btn" onClick={onCancel}>
					Cancel
				</button>
				<button className="delete-btn" onClick={onConfirm}>
					Delete
				</button>
			</div>
		</>
	);
}