import { BusDisposal } from "@/app/lib/fetchDisposals";
import "@/styles/forms.css";

interface ViewBusDisposalModalProps {
    item: BusDisposal;
    onClose: () => void;
}

export default function ViewBusDisposalModal({ item, onClose }: ViewBusDisposalModalProps) {
    return (
        <>
            <button className="close-modal-btn view" onClick={onClose}>
                <i className="ri-close-line"></i>
            </button>

            <div className="modal-heading">
                <h1 className="modal-title">View Bus Disposal Details</h1>
            </div>

            <div className="modal-content view">
                <form className="view-form">
                    <div className="form-row">
                        {/* Body Number */}
                        <div className="form-group">
                            <label>Body Number</label>
                            <p>{item.bus.body_number}</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* For view bus details */}
            <p className="details-title">I. Bus Details</p>
            <div className="modal-content view">
                <form className="view-form">
                    {/* Plate number, body builder, and bus type */}
                    <div className="form-row">
                        {/* Plate Number */}
                        <div className="form-group">
                            <label>Plate Number</label>
                            <p>{item.bus.plate_number}</p>
                        </div>

                        {/* Body Builder */}
                        <div className="form-group">
                            <label>Body Builder</label>
                            <p>{item.bus.body_builder}</p>
                        </div>

                        {/* Bus Type */}
                        <div className="form-group">
                            <label>Bus Type</label>
                            <p>{item.bus.bus_type}</p>
                        </div>
                    </div>

                    {/* Manufacturer, model, and year model */}
                    <div className="form-row">
                        {/* Manufacturer */}
                        <div className="form-group">
                            <label>Manufacturer</label>
                            <p>{item.bus.manufacturer}</p>
                        </div>

                        {/* Model */}
                        <div className="form-group">
                            <label>Model</label>
                            <p>{item.bus.model}</p>
                        </div>

                        {/* Year */}
                        <div className="form-group">
                            <label>Year</label>
                            <p>{item.bus.year_model}</p>
                        </div>
                    </div>

                    {/* Seat capacity, chasis number, and engine number */}
                    <div className="form-row">
                        {/* Seat Capacity */}
                        <div className="form-group">
                            <label>Seat Capacity</label>
                            <p>{item.bus.seat_capacity}</p>
                        </div>

                        {/* Chassis Number */}
                        <div className="form-group">
                            <label>Chassis Number</label>
                            <p>{item.bus.chasis_number}</p>
                        </div>

                        {/* Engine Number */}
                        <div className="form-group">
                            <label>Engine Number</label>
                            <p>{item.bus.engine_number}</p>
                        </div>
                    </div>

                </form>
            </div>

            {/* For disposal details */}
            <p className="details-title">II. Disposal Details</p>
            <div className="modal-content view">
                <form className="view-form">
                    {/* disposal date and method */}
                    <div className="form-row">
                        {/* Disposal Date */}
                        <div className="form-group">
                            <label>Disposal Date</label>
                            <p>{new Date(item.disposal_date).toLocaleDateString()}</p>
                        </div>

                        {/* Disposal Method */}
                        <div className="form-group">
                            <label>Disposal Method</label>
                            <p style={{textTransform: 'capitalize'}}>{item.disposal_method.toLowerCase()}</p>
                        </div>
                    </div>

                    {/* Reason for Disposal */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Reason for Disposal</label>
                            <p>{item.reason}</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Remarks</label>
                            <p>{item.remarks || "None"}</p>
                        </div>
                    </div>

                </form >
            </div >

        </>
    );
}