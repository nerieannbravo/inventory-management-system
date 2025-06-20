import "@/styles/forms.css";

interface ViewStockMaintenanceModalProps {
    item: {
        id: number,
        sku: string,
        itemName: string,
        stockMaintenanceType: string,
        stockMaintenanceDate: string,
        stockMaintenanceStatus: string,
        // viewitional fields would be included in a real application
    };
    formatStatus: (status: string) => string;
    onClose: () => void;
}

export default function ViewStockMaintenanceModal({ item, formatStatus, onClose }: ViewStockMaintenanceModalProps) {
    return (
        <>
            <button className="close-modal-btn view" onClick={onClose}>
                <i className="ri-close-line"></i>
            </button>

            <div className="modal-heading">
                <h1 className="modal-title">View Bus Maintenance Details</h1>
            </div>

            <div className="modal-content view">
                <form className="view-stock-maintenance-form">
                    <div className="form-row">
                        {/* SKU */}
                        <div className="form-group">
                            <label>SKU</label>
                            <p>{item.sku}</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* For view stock detais */}
            <p className="bus-details-title">I. Stock Details</p>
            <div className="modal-content view">
                <form className="view-stock-maintenance-form">
                    {/* Item Name and category */}
                    <div className="form-row">
                        {/* Item Name */}
                        <div className="form-group">
                            <label>Item Name</label>
                            <p>Lining</p>
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label>Category</label>
                            <p>Equipment</p>
                        </div>
                    </div>

                    {/* Current Stocks, Unit Measure, and Expiration Date */}
                    <div className="form-row">
                        {/* Current Stocks */}
                        <div className="form-group">
                            <label>Current Stocks</label>
                            <p>50</p>
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <p>pieces</p>
                        </div>

                        {/* Expiration Date */}
                        <div className="form-group">
                            <label>Expiration Date</label>
                            <p>N/A</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* For maintenance detais */}
            <p className="bus-details-title">II. Maintenance Details</p>
            <div className="modal-content view">
                <form className="view-stock-maintenance-form">
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
                            <p>{item.stockMaintenanceType}</p>
                        </div>
                    </div>

                    {/* Maintenance Quantity, Unit Measure and Status */}
                    <div className="form-row">
                        {/* Maintenance Quantity */}
                        <div className="form-group">
                            <label>Maintenance Quantity</label>
                            <p>3</p>
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <p>pieces</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <p>{formatStatus(item.stockMaintenanceStatus)}</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Remarks</label>
                            <p>For bus maintenance</p>
                        </div>
                    </div>

                </form >
            </div >

            {/* For maintenance detais */}
            <p className="bus-details-title">III. Used Items</p>
            <div className="modal-content view">
                <form className="view-stock-maintenance-form">
                    {/* Used Stocks */}

                    {/* Commented - For loop */}
                    {/* {busMaintenanceForm.items?.map((item, idx) => ( */}
                        {/* <div className="form-row" key={idx}> */}

                            <div className="form-row">
                            {/* Item Name */}
                            <div className="form-group">
                                <label>Item Name</label>
                                <p>Hammer</p>
                            </div>

                            {/* Quantity */}
                            <div className="form-group">
                                <label>Quantity</label>
                                <p>1</p>
                            </div>

                            {/* Unit Measure */}
                            <div className="form-group">
                                <label>Unit Measure</label>
                                <p>pieces</p>
                            </div>

                        </div>
                    {/* ))} */}

                </form >
            </div >

            {/* For mechanic detais */}
            <p className="bus-details-title">IV. Mechanic Details</p>
            <div className="modal-content view">
                <form className="view-stock-maintenance-form">
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
                            <p>I maintain the lining </p>
                        </div>
                    </div>


                </form >
            </div >


        </>
    );
}