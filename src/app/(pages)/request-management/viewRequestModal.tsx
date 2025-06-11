import "@/styles/forms.css";

interface ViewRequestModalProps {
	request: {
		request_id: string;
		emp_id: string;
		empName: string;
		emp_first_name: string;
		emp_last_name: string;
		item_id: string;
		inventoryItem: {
			item_id: string;
			item_name: string;
		};
		request_type: string;
		quantity: number;
		status: string;
		req_purpose: string;
		expected_return_date?: string;
		actual_return_date?: string;
		date_created: string;
		date_updated?: string;
		created_by: string;
	};
	formatStatus: (status: string) => string;
	formatType: (type: string) => string;
	onClose: () => void;
}

export default function ViewRequestModal({ request, formatStatus, formatType, onClose }: ViewRequestModalProps) {
	
	return (
		<>
			<button className="close-modal-btn view" onClick={onClose}>
				<i className="ri-close-line"></i>
			</button>

			<div className="modal-heading">
				<h1 className="modal-title">View Request</h1>
			</div>

			<div className="modal-content view">
				<div className="view-request-form">
					<div className="form-group">
						<label>Employee Name</label>
						<p>{request.empName}</p>
					</div>

					<div className="form-group">
						<label>Item Name</label>
						<p>{request.inventoryItem.item_name}</p>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label>Request Type</label>
							<p>{formatType(request.request_type)}</p>
						</div>

						<div className="form-group">
							<label>Requested Quantity</label>
							<p>{request.quantity}</p>
						</div>

						<div className="form-group">
							<label>Status</label>
							<p>{formatStatus(request.status)}</p>
						</div>
					</div>

					<div className="form-group">
						<label>Request Purpose</label>
						<p>{request.req_purpose}</p>
					</div>

					<div className="form-group">
						<label>Request Date</label>
						<p>{request.date_created
							? new Date(request.date_created).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})
							: ''}
						</p>
					</div>

					{request.request_type === "BORROW" && (
						<div className="form-row">
							<div className="form-group">
								<label>Expected Return Date</label>
								<p>{request.expected_return_date
									? new Date(request.expected_return_date).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})
									: ''}
								</p>
							</div>

							{request.status !== "not-returned" && (
								<div className="form-group">
									<label>Actual Return Date</label>
									<p>{request.actual_return_date
										? new Date(request.actual_return_date).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})
										: 'Not Returned Yet'}
									</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</>
	);
}