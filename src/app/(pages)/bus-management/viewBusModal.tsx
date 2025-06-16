import "@/styles/forms.css";

interface ViewBusModalProps {
	item: {
		bus_id: number;
		plate_number: string;
		body_number: string;
		body_builder: string;
		bus_type: string;
		manufacturer: string;
		seat_capacity: number;
		status: string;
		chasis_number: string;
		engine_number: string;
	};
	onClose: () => void;
}

// Helper function to capitalize the first letter
const capitalize = (str: string) =>
	str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export default function ViewBusModal({ item, onClose }: ViewBusModalProps) {
	// Capitalizes status for display
	const formatStatus = (status: string) => {
		switch (status.toLowerCase()) {
			case "active":
				return "Active";
			case "decommissioned":
				return "Decommissioned";
			case "under-maintenance":
				return "Under Maintenance";
			default:
				return capitalize(status);
		}
	};

	// Capitalizes body builder with exceptions
	const formatBodyBuilder = (builder: string) => {
		const keepUppercase = ["RBM", "DARJ"];
		return keepUppercase.includes(builder.toUpperCase())
			? builder.toUpperCase()
			: capitalize(builder);
	};

	const formatBusType = capitalize;
	const formatManufacturer = capitalize;

	return (
		<>
			<button className="close-modal-btn view" onClick={onClose}>
				<i className="ri-close-line"></i>
			</button>

			<div className="modal-heading">
				<h1 className="modal-title">View Bus</h1>
			</div>

			<div className="modal-content view">
				<div className="view-order-form">
					<div className="form-row">
						<div className="form-group">
							<label>Plate Number</label>
							<p>{item.plate_number}</p>
						</div>
						<div className="form-group">
							<label>Body Number</label>
							<p>{item.body_number}</p>
						</div>
					</div>

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

					<div className="form-row">
						<div className="form-group">
							<label>Manufacturer</label>
							<p>{formatManufacturer(item.manufacturer)}</p>
						</div>
						<div className="form-group">
							<label>Seat Capacity</label>
							<p>{item.seat_capacity}</p>
						</div>
						<div className="form-group">
							<label>Status</label>
							<p>{formatStatus(item.status)}</p>
						</div>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label>Chassis Number</label>
							<p>{item.chasis_number || "Detail Not Available"}</p>
						</div>
						<div className="form-group">
							<label>Engine Number</label>
							<p>{item.engine_number || "Detail Not Available"}</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
