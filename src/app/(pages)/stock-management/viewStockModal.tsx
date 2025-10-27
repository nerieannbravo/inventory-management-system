import { useState } from "react";
import { showDeleteExpiredConfirmation, showDeleteExpiredSuccess, showDeleteExpiredError } from "@/utils/sweetAlert";
import "@/styles/forms.css";
import ActionButtons from "@/components/actionButtons";

interface Batch {
	id: number,
	quantity: number,
	expirationDate: string,
	dateAdded: string,
	deletable?: boolean,
}

interface ViewStockModalProps {
	item: {
		id: number,
		itemName: string,
		currentStock: number,
		unitMeasure: string,
		category: string,
		status: string,
		reorderLevel: number,
		batches?: Batch[],
	};
	formatStatus: (status: string) => string;
	onClose: () => void;
}

export default function ViewStockModal({ item, formatStatus, onClose }: ViewStockModalProps) {
	// manage batches locally so UI updates after delete
	const [batches, setBatches] = useState<Batch[]>(
		item.batches ?? [
			{ id: 1, quantity: 20, expirationDate: "November 14, 2026", dateAdded: "March 16, 2025", deletable: true },
			{ id: 2, quantity: 14, expirationDate: "January 23, 2025", dateAdded: "August 22, 2024", deletable: false },
		]
	);

	const handleRemoveExpired = async (batchId: number) => {
		const result = await showDeleteExpiredConfirmation();
		if (!result.isConfirmed) return;

		setBatches(prev => prev.filter(b => b.id !== batchId));
		await showDeleteExpiredSuccess();
	};

	return (
		<>
			<button className="close-modal-btn view" onClick={onClose}>
				<i className="ri-close-line"></i>
			</button>

			<div className="modal-heading">
				<h1 className="modal-title">View Stock</h1>
				<div>
					<p className="modal-date-time">Date Created: mm/dd/yyyy</p>
					<p className="modal-date-time">Date Updated: mm/dd/yyyy</p>
				</div>
			</div>

			<div className="modal-content view">
				<div className="view-form">
					<div className="form-group">
						<label>Item Name</label>
						<p>{item.itemName}</p>
					</div>
					
					<div className="form-row">
						<div className="form-group">
							<label>Current Stock</label>
							<p>{item.currentStock}</p>
						</div>

						<div className="form-group">
							<label>Unit Measure</label>
							<p>{item.unitMeasure}</p>
						</div>

						<div className="form-group">
							<label>Reorder Level</label>
							<p>{item.reorderLevel}</p>
						</div>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label>Category</label>
							<p>{item.category}</p>
						</div>

						<div className="form-group">
							<label>Status</label>
							<p>{formatStatus(item.status)}</p>
						</div>
					</div>
				</div>
			</div>

			<div className="details-header">
				<p className="details-title">Batch/es</p>
			</div>

			<div className="modal-table-wrapper">
				<div className="modal-table-container">
					<table className="modal-table">
						<thead className="modal-table-heading">
							<tr>
								<th>Quantity</th>
								<th>Expiration Date</th>
								<th>Date Added</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody className="modal-table-body">
							{batches.map(batch => (
								<tr key={batch.id}>
									<td>{batch.quantity}</td>
									<td>{batch.expirationDate}</td>
									<td>{batch.dateAdded}</td>
									<td>
										<ActionButtons
											onDelete={() => {
												if (!batch.deletable) {
													showDeleteExpiredError("This batch cannot be deleted because it has not expired yet.");
													return;
												}
												handleRemoveExpired(batch.id);
											}}
											disableDelete={!batch.deletable}
										/>

									</td>
								</tr>
							))}
							{batches.length === 0 && (
								<tr>
									<td colSpan={4} className="no-data">No batches available</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
}