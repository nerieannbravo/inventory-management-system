import "@/styles/forms.css";

interface ViewBusMaintenanceModalProps {
    item: {
        id: number,
        bodyNumber: string,
        busMaintenanceType: string,
        busMaintenanceDate: string,
        busMaintenanceStatus: string,
        // viewitional fields would be included in a real application
    };
    formatStatus: (status: string) => string;
    onClose: () => void;
}

export default function ViewBusMaintenanceModal({ item, formatStatus, onClose }: ViewBusMaintenanceModalProps) {
    return (
        <>
            <button className="close-modal-btn view" onClick={onClose}>
                <i className="ri-close-line"></i>
            </button>

            <div className="modal-heading">
                <h1 className="modal-title">View Bus Maintenance Details</h1>
            </div>

            <div className="modal-content view">
                <form className="view-bus-maintenance-form">
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
                <form className="view-bus-maintenance-form">
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

            {/* For maintenance detais */}
            <p className="bus-details-title">II. Maintenance Details</p>
            <div className="modal-content view">
                <form className="view-bus-maintenance-form">
                    {/* Maintenance date and type */}
                    <div className="form-row">
                        {/* Maintenance Date */}
                        <div className="form-group">
                            <label>Maintenance Date</label>
                            <p>March 19, 2024</p>
                        </div>

                        {/* Maintenance Type */}
                        <div className="form-group">
                            <label>Maintenance Type</label>
                            <p>{item.busMaintenanceType}</p>
                        </div>
                    </div>

                    {/* Odometer reading and status */}
                    <div className="form-row">
                        {/* Odometer Reading */}
                        <div className="form-group">
                            <label>Odometer Reading</label>
                            <p>150000</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <p>{formatStatus(item.busMaintenanceStatus)}</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Remarks</label>
                            <p>Changed oil</p>
                        </div>
                    </div>

                </form >
            </div >

            {/* For maintenance detais */}
            <p className="bus-details-title">III. Used Items</p>
            <div className="modal-content view">
                <form className="view-bus-maintenance-form">
                    {/* Used Stocks */}

                    {/* Commented - For loop */}
                    {/* {busMaintenanceForm.items?.map((item, idx) => ( */}
                        {/* <div className="form-row" key={idx}> */}

                            <div className="form-row">
                            {/* Item Name */}
                            <div className="form-group">
                                <label>Item Name</label>
                                <p>Fuel</p>
                            </div>

                            {/* Quantity */}
                            <div className="form-group">
                                <label>Quantity</label>
                                <p>3</p>
                            </div>

                            {/* Unit Measure */}
                            <div className="form-group">
                                <label>Unit Measure</label>
                                <p>Gallon</p>
                            </div>

                        </div>
                    {/* ))} */}

                </form >
            </div >

            {/* For mechanic detais */}
            <p className="bus-details-title">IV. Mechanic Details</p>
            <div className="modal-content view">
                <form className="view-bus-maintenance-form">
                    {/* Employee name and department */}
                    <div className="form-row">
                        {/* Employee Department */}
                        <div className="form-group">
                            <label>Employee Department</label>
                            <p>Maintenance</p>
                        </div>

                        {/* Employee Name */}
                        <div className="form-group">
                            <label>Employee Name</label>
                            <p>John Doe</p>
                        </div>
                    </div>

                    {/* Work Description */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Work Description</label>
                            <p>I changed the </p>
                        </div>
                    </div>


                </form >
            </div >


        </>
    );
}