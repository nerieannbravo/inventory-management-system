import "@/styles/forms.css";

interface ViewBusDisposalModalProps {
    item: {
        id: number,
        bodyNumber: string,
        busDisposalMethod: string,
        busDisposalDate: string,
        // viewitional fields would be included in a real application
    };
    // formatStatus: (status: string) => string;
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
                <form className="view-bus-disposal-form">
                    <div className="form-row">
                        {/* Body Number */}
                        <div className="form-group">
                            <label>Body Number</label>
                            <p>{item.bodyNumber}</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* For view bus detais */}
            <p className="bus-details-title">I. Bus Details</p>
            <div className="modal-content view">
                <form className="view-bus-disposal-form">
                    {/* Plate number, body builder, and bus type */}
                    <div className="form-row">
                        {/* Plate Number */}
                        <div className="form-group">
                            <label>Plate Number</label>
                            <p>NGJ 4213</p>
                        </div>

                        {/* Body Builder */}
                        <div className="form-group">
                            <label>Body Builder</label>
                            <p>Agila</p>
                        </div>

                        {/* Bus Type */}
                        <div className="form-group">
                            <label>Bus Type</label>
                            <p>Airconditioned</p>
                        </div>
                    </div>

                    {/* Manufacturer, model, and year model */}
                    <div className="form-row">
                        {/* Manufacturer */}
                        <div className="form-group">
                            <label>Manufacturer</label>
                            <p>Iveco</p>
                        </div>

                        {/* Model */}
                        <div className="form-group">
                            <label>Model</label>
                            <p>Raize</p>
                        </div>

                        {/* Year Model */}
                        <div className="form-group">
                            <label>Year</label>
                            <p>2019</p>
                        </div>
                    </div>

                    {/* Seat capacity, chasis number, and engine number */}
                    <div className="form-row">
                        {/* Seat Capacity */}
                        <div className="form-group">
                            <label>Seat Capacity</label>
                            <p>NGJ 4213</p>
                        </div>

                        {/* Chassis Number */}
                        <div className="form-group">
                            <label>Chassis Number</label>
                            <p>78HKJUAAY81971</p>
                        </div>

                        {/* Engine Number */}
                        <div className="form-group">
                            <label>Engine Number</label>
                            <p>HAU892DJ292</p>
                        </div>
                    </div>

                </form>
            </div>

            {/* For disposal detais */}
            <p className="bus-details-title">II. Disposal Details</p>
            <div className="modal-content view">
                <form className="view-bus-disposal-form">
                    {/* disposal date and type */}
                    <div className="form-row">
                        {/* Disposal Date */}
                        <div className="form-group">
                            <label>Disposal Date</label>
                            <p>{item.busDisposalDate}</p>
                        </div>

                        {/* Disposal Method */}
                        <div className="form-group">
                            <label>Disposal Method</label>
                            <p>{item.busDisposalMethod}</p>
                        </div>
                    </div>

                    {/* Reason for Disposal */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Reason for Disposal</label>
                            <p>Not usable</p>
                        </div>
                    </div>

                    {/* Attachments */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Attachments</label>
                            <div className="uploaded-document-item">
                                {/* Example: Replace with dynamic document list */}
                                <a href="#" target="_blank" rel="noopener noreferrer" className="document-link">
                                    Warranty.pdf
                                </a>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="document-link">
                                    Insurance.pdf
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Remarks</label>
                            <p>None</p>
                        </div>
                    </div>

                </form >
            </div >

        </>
    );
}