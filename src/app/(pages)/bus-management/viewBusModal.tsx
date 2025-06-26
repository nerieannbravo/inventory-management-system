import "@/styles/forms.css";

interface SecondHandDetails {
	previous_owner: string | null;
	previous_owner_contact: string | null;
	source: string | null;
	odometer_reading: number | null;
	last_registration_date: string | null;
	last_maintenance_date: string | null;
	bus_condition_notes: string | null;
}

interface BrandNewDetails {
	dealer_name: string | null;
	dealer_contact: string | null;
}

interface BusOtherFiles {
	bus_files_id: string;
	file_name: string;
	file_type: string;
	file_url: string;
	date_uploaded: string;
}

interface Bus {
	bus_id: string;
	plate_number: string;
	body_number: string;
	body_builder: string;
	bus_type: string;
	manufacturer: string;
	model?: string;
	year_model?: number;
	status: string;
	chasis_number: string;
	engine_number: string;
	seat_capacity: number;
	condition: string;
	acquisition_date?: string;
	acquisition_method?: string;
	warranty_expiration_date?: string;
	registration_status?: string;
	secondHandDetails?: SecondHandDetails | null;
	brandNewDetails?: BrandNewDetails | null;
	busOtherFiles?: BusOtherFiles[];
}

interface ViewBusModalProps {
	item: Bus;
	formatStatus: (status: string) => string;
	onClose: () => void;
}

function formatCondition(condition: string) {
	switch (condition) {
		case "BRAND_NEW":
			return "Brand New";
		case "SECOND_HAND":
			return "Second Hand";
		default:
			return condition;
	}
}

function formatBodyBuilder(builder: string) {
	switch (builder) {
		case "AGILA": return "Agila";
		case "HILLTOP": return "Hilltop";
		case "RBM": return "RBM";
		case "DARJ": return "DARJ";
		default: return builder;
	}
}

function formatBusType(type: string) {
	switch (type) {
		case "AIRCONDITIONED": return "Airconditioned";
		case "ORDINARY": return "Ordinary";
		default: return type;
	}
}

function formatBusStatus(status: string) {
	switch (status) {
		case "ACTIVE": return "Active";
		case "DECOMMISSIONED": return "Decommissioned";
		case "UNDER_MAINTENANCE": return "Under Maintenance";
		default: return status;
	}
}

function formatAcquisitionMethod(method: string) {
	switch (method) {
		case "PURCHASED": return "Purchased";
		case "LEASED": return "Leased";
		case "DONATED": return "Donated";
		default: return method;
	}
}

function formatRegistrationStatus(status: string) {
	switch (status) {
		case "REGISTERED": return "Registered";
		case "NOT_REGISTERED": return "Not Registered";
		case "NEEDS_RENEWAL": return "Needs Renewal";
		case "EXPIRED": return "Expired";
		default: return status;
	}
}

function formatBusSource(source: string) {
	switch (source) {
		case "DEALERSHIP": return "Dealership";
		case "AUCTION": return "Auction";
		case "PRIVATE_INDIVIDUAL": return "Private Individual";
		default: return source;
	}
}

export default function ViewBusModal({ item, formatStatus, onClose }: ViewBusModalProps) {
	return (
		<>
			<button className="close-modal-btn view" onClick={onClose}>
				<i className="ri-close-line"></i>
			</button>

			<div className="modal-heading">
				<h1 className="modal-title">View Bus</h1>
			</div>

			<p className="bus-details-title">I. Basic Identification</p>
			<div className="modal-content view">
				<div className="view-order-form">
					{/* Plate number and Body number */}
					<div className="form-row">
						<div className="form-group">
							<label>Plate Number</label>
							<p>{item.plate_number || '-'}</p>
						</div>
						<div className="form-group">
							<label>Body Number</label>
							<p>{item.body_number || '-'}</p>
						</div>
					</div>
					{/* Body Builder and Bus Type */}
					<div className="form-row">
						<div className="form-group">
							<label>Body Builder</label>
							<p>{formatBodyBuilder(item.body_builder)}</p>
						</div>
						<div className="form-group">
							<label>Bus Type</label>
							<p>{formatBusType(item.bus_type)}</p>
						</div>
					</div>
					{/* Manufacturer, Model, Year Model */}
					<div className="form-row">
						<div className="form-group">
							<label>Manufacturer</label>
							<p>{item.manufacturer || '-'}</p>
						</div>
						<div className="form-group">
							<label>Model</label>
							<p>{item.model || '-'}</p>
						</div>
						<div className="form-group">
							<label>Year Model</label>
							<p>{item.year_model || '-'}</p>
						</div>
					</div>
					{/* Chasis Number and Engine Number */}
					<div className="form-row">
						<div className="form-group">
							<label>Chasis Number</label>
							<p>{item.chasis_number || '-'}</p>
						</div>
						<div className="form-group">
							<label>Engine Number</label>
							<p>{item.engine_number || '-'}</p>
						</div>
					</div>
					{/* Condition, Seat Capacity and Status */}
					<div className="form-row">
						<div className="form-group">
							<label>Condition</label>
							<p>{formatCondition(item.condition)}</p>
						</div>
						<div className="form-group">
							<label>Seat Capacity</label>
							<p>{item.seat_capacity || '-'}</p>
						</div>
						<div className="form-group">
							<label>Status</label>
							<p>{formatBusStatus(item.status)}</p>
						</div>
					</div>
				</div>
			</div>

			{item.condition?.toLowerCase().includes("second") && item.secondHandDetails && (
				<>
					<p className="bus-details-title">II. Second Hand Details</p>
					<div className="modal-content view">
						<div className="view-order-form">
							<div className="form-row">
								<div className="form-group">
									<label>Acquisition Date</label>
									<p>{item.acquisition_date ? new Date(item.acquisition_date).toLocaleDateString() : '-'}</p>
								</div>
								<div className="form-group">
									<label>Acquisition Method</label>
									<p>{formatAcquisitionMethod(item.acquisition_method || '')}</p>
								</div>
							</div>
							<div className="form-row">
								<div className="form-group">
									<label>Previous Owner</label>
									<p>{item.secondHandDetails.previous_owner || '-'}</p>
								</div>
								<div className="form-group">
									<label>Previous Owner Contact</label>
									<p>{item.secondHandDetails.previous_owner_contact || '-'}</p>
								</div>
							</div>
							<div className="form-row">
								<div className="form-group">
									<label>Source</label>
									<p>{formatBusSource(item.secondHandDetails.source || '')}</p>
								</div>
								<div className="form-group">
									<label>Odometer Reading</label>
									<p>{item.secondHandDetails.odometer_reading ?? '-'}</p>
								</div>
							</div>
							<div className="form-row">
								<div className="form-group">
									<label>Warranty Expiration Date</label>
									<p>{item.warranty_expiration_date ? new Date(item.warranty_expiration_date).toLocaleDateString() : '-'}</p>
								</div>
								<div className="form-group">
									<label>Registration Status</label>
									<p>{formatRegistrationStatus(item.registration_status || '')}</p>
								</div>
							</div>
							<div className="form-row">
								<div className="form-group">
									<label>Last Registration Date</label>
									<p>{item.secondHandDetails.last_registration_date ? new Date(item.secondHandDetails.last_registration_date).toLocaleDateString() : '-'}</p>
								</div>
								<div className="form-group">
									<label>Last Maintenance Date</label>
									<p>{item.secondHandDetails.last_maintenance_date ? new Date(item.secondHandDetails.last_maintenance_date).toLocaleDateString() : '-'}</p>
								</div>
							</div>
							<div className="form-row">
								<div className="form-group">
									<label>Initial Status Condition/Notes</label>
									<p>{item.secondHandDetails.bus_condition_notes || '-'}</p>
								</div>
							</div>
						</div>
					</div>
				</>
			)}

			{item.condition?.toLowerCase().includes("brand") && item.brandNewDetails && (
				<>
					<p className="bus-details-title">II. Brand New Details</p>
					<div className="modal-content view">
						<div className="view-order-form">
							<div className="form-row">
								<div className="form-group">
									<label>Acquisition Date</label>
									<p>{item.acquisition_date ? new Date(item.acquisition_date).toLocaleDateString() : '-'}</p>
								</div>
								<div className="form-group">
									<label>Acquisition Method</label>
									<p>{formatAcquisitionMethod(item.acquisition_method || '')}</p>
								</div>
							</div>
							<div className="form-row">
								<div className="form-group">
									<label>Dealer Name</label>
									<p>{item.brandNewDetails.dealer_name || '-'}</p>
								</div>
								<div className="form-group">
									<label>Dealer Contact</label>
									<p>{item.brandNewDetails.dealer_contact || '-'}</p>
								</div>
							</div>
							<div className="form-row">
								<div className="form-group">
									<label>Warranty Expiration Date</label>
									<p>{item.warranty_expiration_date ? new Date(item.warranty_expiration_date).toLocaleDateString() : '-'}</p>
								</div>
								<div className="form-group">
									<label>Registration Status</label>
									<p>{formatRegistrationStatus(item.registration_status || '')}</p>
								</div>
							</div>
						</div>
					</div>
				</>
			)}

			<p className="bus-details-title">III. Document Attachments</p>
			<div className="modal-content view">
				<div className="view-order-form">
					<div className="form-row">
						<div className="form-group">
							<label>Attachments</label>
							<div className="view-documents-list">
								{item.busOtherFiles && item.busOtherFiles.length > 0 ? (
									item.busOtherFiles.map(file => {
										if (!file.file_url || typeof file.file_url !== 'string') {
											return (
												<div key={file.bus_files_id} className="view-document-item error">
													{file.file_name} (URL missing)
												</div>
											);
										}

										// Extract the filename from the URL. This is robust against different path formats.
										const filename = file.file_url.split('/').filter(Boolean).pop();

										if (!filename) {
											return (
												<div key={file.bus_files_id} className="view-document-item error">
													{file.file_name} (Invalid URL format)
												</div>
											);
										}

										const fileUrl = `/api/upload?file=${filename}`;

										return (
											<a
												key={file.bus_files_id}
												href={fileUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="view-document-item link"
											>
												<span>{file.file_name}</span>
												<i className="ri-external-link-line"></i>
											</a>
										);
									})
								) : (
									<div className="view-document-item no-files">No attachments</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}