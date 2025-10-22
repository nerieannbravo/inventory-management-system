import "@/styles/forms.css";

interface ViewSupplierModalProps {
    item: {
        id: number;
        supplierName: string,
        supplierStreet: string,
        supplierBarangay: string,
        supplierCity: string,
        supplierProvince: string,
        supplierContact: string,
        supplierEmail: string,
        supplierStatus: string,
        // Additional fields would be included in a real application
    };
    formatStatus: (status: string) => string;
    onClose: () => void;
}

export default function ViewSupplierModal({ item, formatStatus, onClose }: ViewSupplierModalProps) {
    return (
        <>
            <button className="close-modal-btn view" onClick={onClose}>
                <i className="ri-close-line"></i>
            </button>

            <div className="modal-heading">
                <h1 className="modal-title">View Supplier</h1>
            </div>

            <div className="modal-content view">
                <div className="view-form">
                    <div className="form-group">
                        <label>Supplier Name</label>
                        <p>{item.supplierName}</p>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Contact Number</label>
                            <p>{item.supplierContact}</p>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <p>{item.supplierEmail}</p>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <p>{formatStatus(item.supplierStatus)}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Street</label>
                            <p>178 Don Fabian Extension</p>
                        </div>

                        <div className="form-group">
                            <label>Barangay</label>
                            <p>Commonwealth</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <p>Quezon City</p>
                        </div>

                        <div className="form-group">
                            <label>Province</label>
                            <p>Metro Manila</p>
                        </div>
                    </div>
                </div>
            </div >

            <p className="details-title">Linked Item/s</p>
            <div className="modal-table-wrapper">
                <div className="modal-table-container">
                    <table className="modal-table">
                        <thead className="modal-table-heading">
                            <tr>
                                <th>Item Name</th>
                                <th>Unit Measure</th>
                                <th>Unit Price</th>
                                <th>Category</th>
                            </tr>
                        </thead>
                        <tbody className="modal-table-body">
                            <tr>
                                <td>Item 1</td>
                                <td>pcs</td>
                                <td>250</td>
                                <td>Consumable</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div >
        </>
    );
}