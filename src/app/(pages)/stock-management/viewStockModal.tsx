import { showDeleteExpiredConfirmation, showDeleteExpiredSuccess } from "@/utils/sweetAlert";
import "@/styles/forms.css";

interface ViewStockModalProps {
	item: {
		id: number;
		name: string;
		quantity: number;
		unit: string;
		category: string;
		status: string;
		reorder: number;
		// Additional fields would be included in a real application
	};
	formatStatus: (status: string) => string;
	onClose: () => void;
}

export default function ViewStockModal({ item, formatStatus, onClose }: ViewStockModalProps) {
	const handleRemoveExpired = async () => {
		const result = await showDeleteExpiredConfirmation();
		if (result.isConfirmed) {
			await showDeleteExpiredSuccess();
			// onClose();
		}
	};

	return (
		<>
			<button className="close-modal-btn view" onClick={onClose}>
				<i className="ri-close-line"></i>
			</button>

			<div className="modal-heading">
				<h1 className="modal-title">{item.name}</h1>
			</div>

			<h1 className="modal-subtitle">Overview</h1>

			<div className="modal-content view">
				<div className="view-stock-form">
					<div className="form-row">
						<div className="form-group">
							<label>Quantity</label>
							<p>{item.quantity}</p>
						</div>

						<div className="form-group">
							<label>Unit Measure</label>
							<p>{item.unit}</p>
						</div>

						<div className="form-group">
							<label>Reorder Level</label>
							<p>{item.reorder}</p>
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

			<h1 className="modal-subtitle">Batches</h1>

			<div className="modal-content view">
				<div className="view-stock-form">
					<div className="form-row">
						<div className="form-group">
							<label>Quantity</label>
							<p>20</p>
						</div>

						<div className="form-group">
							<label>Expiration Date</label>
							<p>March 2, 2027</p>
						</div>

						<div className="form-group">
							<label>Date Added</label>
							<p>April 22, 2025</p>
						</div>
					</div>
				</div>
			</div>

			{/* Expired Batch */}
			<div className="modal-content view-expired">
				<div className="view-stock-form">
					<div className="form-row">
						<div className="form-group">
							<label>Quantity</label>
							<p className="text-expired">50</p>
						</div>

						<div className="form-group">
							<label>Expiration Date</label>
							<p className="text-expired">May 23, 2025</p>
						</div>

						<div className="form-group">
							<label>Date Added</label>
							<p className="text-expired">February 9, 2025</p>
						</div>

						<div className="remove-btn-wrapper expired">
							<button
								type="button"
								className="remove-stock-btn"
								onClick={handleRemoveExpired}
							>
								<i className="ri-delete-bin-line" />
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="modal-content view">
				<div className="view-stock-form">
					<div className="form-row">
						<div className="form-group">
							<label>Quantity</label>
							<p>20</p>
						</div>

						<div className="form-group">
							<label>Expiration Date</label>
							<p>March 2, 2027</p>
						</div>

						<div className="form-group">
							<label>Date Added</label>
							<p>April 22, 2025</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}