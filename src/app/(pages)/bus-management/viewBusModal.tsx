import "@/styles/forms.css";

interface ViewBusModalProps {
    item: {
        id: number,
        bodyNumber: string,
        bodyBuilder: string,
        busType: string,
        busStatus: string,
        condition: string,
        // Additional fields would be included in a real application
    };
    formatStatus: (status: string) => string;
    onClose: () => void;
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
                            <p>NGJ 4213</p>
                        </div>

                        <div className="form-group">
                            <label>Body Number</label>
                            <p>{formatStatus(item.bodyNumber)}</p>
                        </div>
                    </div>

                    {/* Body Builder and Bus Type */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Body Builder</label>
                            <p>{formatStatus(item.bodyBuilder)}</p>
                        </div>

                        <div className="form-group">
                            <label>Bus Type</label>
                            <p>{item.busType}</p>
                        </div>
                    </div>

                    {/* Manufacturer, Model, Year Model */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Manufacturer</label>
                            <p>Iveco</p>
                        </div>

                        <div className="form-group">
                            <label>Model</label>
                            <p>Raize</p>
                        </div>

                        <div className="form-group">
                            <label>Year Model</label>
                            <p>2016</p>
                        </div>

                        
                    </div>

                    {/* Chasis Number and Engine Number */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Chasis Number</label>
                            <p>PCMA1LJ04KS060128</p>
                        </div>

                        <div className="form-group">
                            <label>Engine Number</label>
                            <p>001642353</p>
                        </div>
                    </div>

                    {/* Condition, Seat Capacity and Status */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Condition</label>
                            <p>{formatStatus(item.condition)}</p>
                        </div>

                        <div className="form-group">
                            <label>Seat Capacity</label>
                            <p>45</p>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <p>{formatStatus(item.busStatus)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {item.condition === "Second Hand" && (
                <>
                    <p className="bus-details-title">II. Second Hand Details</p>
                    <div className="modal-content view">
                        <div className="view-order-form">

                            {/* Acquisition Date and Aquisition Method */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Acquisition Date</label>
                                    <p>January 10, 2020</p>
                                </div>

                                <div className="form-group">
                                    <label>Aquisition Method</label>
                                    <p>Purchased</p>
                                </div>
                            </div>

                            {/* Previous Owner and Previous Owner Contact */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Previous Owner</label>
                                    <p>Nerie Ann Bravo</p>
                                </div>

                                <div className="form-group">
                                    <label>Previous Owner Contact</label>
                                    <p>09123456789</p>
                                </div>
                            </div>

                            {/* Source and Odometer Reading */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Source</label>
                                    <p>Dealership</p>
                                </div>

                                <div className="form-group">
                                    <label>Odometer Reading</label>
                                    <p>102938</p>
                                </div>
                            </div>

                            {/* Warranty Expiration Date and Registration Status */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Warranty Expiration Date</label>
                                    <p>January 17, 2020</p>
                                </div>

                                <div className="form-group">
                                    <label>Registration Status</label>
                                    <p>Registered</p>
                                </div>
                            </div>

                            {/* Last Registration Date and Last Maintenance Date */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Last Registration Date</label>
                                    <p>March 19, 2016</p>
                                </div>

                                <div className="form-group">
                                    <label>Last Maintenance Date </label>
                                    <p>December 12, 2019</p>
                                </div>
                            </div>

                            {/* Initial Status Condition/Notes*/}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Initial Status Condition/Notes</label>
                                    <p>Good Condition</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {item.condition === "Brand New" && (
                <>
                    <p className="bus-details-title">II. Brand New Details</p>
                    <div className="modal-content view">
                        <div className="view-order-form">

                            {/* Acquisition Date and Aquisition Method */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Acquisition Date</label>
                                    <p>January 10, 2020</p>
                                </div>

                                <div className="form-group">
                                    <label>Aquisition Method</label>
                                    <p>Purchased</p>
                                </div>
                            </div>

                            {/* Dealer Name and Dealer Contact */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Dealer Name</label>
                                    <p>Iveco Quezon City</p>
                                </div>

                                <div className="form-group">
                                    <label>Dealer Contact</label>
                                    <p>09123456789</p>
                                </div>
                            </div>

                            {/* Warranty Expiration Date and Registration Status */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Warranty Expiration Date</label>
                                    <p>January 17, 2020</p>
                                </div>

                                <div className="form-group">
                                    <label>Registration Status</label>
                                    <p>Registered</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <p className="bus-details-title">III. Document Attachments</p>
            <div className="modal-content view">
                <div className="view-order-form">

                    {/* OR/CR Attachments */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>OR/CR Attachments</label>
                            <div className="uploaded-document-item">
                                {/* Example: Replace with dynamic document list */}
                                <a href="#" target="_blank" rel="noopener noreferrer" className="document-link">
                                    OR-2020.pdf
                                </a>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="document-link">
                                    CR-2020.pdf
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Other Documents */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Other Documents</label>
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

                </div>
            </div>

        </>
    );
}