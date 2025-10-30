import "@/styles/forms.css";

interface ViewSupplierModalProps {
    supplier: {
        id: number;
        supplier_name: string,
        contact_number: string,
        street: string,
        barangay: string,
        city: string,
        province: string,
        email: string,
        status: string,
        remarks: string,
        // Additional fields would be included in a real application
    };
    formatStatus: (status: string) => string;
    onClose: () => void;
}

export default function ViewSupplierModal({ supplier, formatStatus, onClose }: ViewSupplierModalProps) {
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
                        <p>{supplier.supplier_name}</p>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Contact Number</label>
                            <p>{supplier.contact_number}</p>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <p>{supplier.email}</p>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <p>{formatStatus(supplier.status)}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Street</label>
                            <p>{supplier.street}</p>
                        </div>

                        <div className="form-group">
                            <label>Barangay</label>
                            <p>{supplier.barangay}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <p>{supplier.city}</p>
                        </div>

                        <div className="form-group">
                            <label>Province</label>
                            <p>{supplier.province}</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Remarks/Notes</label>
                        {supplier.remarks ? (
                            <p>{supplier.remarks}</p>
                        ) : (
                            <p className="no-records" style={{ color: "red" }}>No remarks available</p>
                        )}
                    </div>
                </div>
            </div >

            <p className="details-title">Linked supplier/s</p>
            <table className="modal-table">
                <thead className="modal-table-heading">
                    <tr>
                        <th>Supplier Name</th>
                        <th>Unit Measure</th>
                        <th>Unit Price</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody className="modal-table-body">
                    <tr>
                        <td>supplier 1</td>
                        <td>pcs</td>
                        <td>250</td>
                        <td>Consumable</td>
                    </tr>
                </tbody>
            </table>

        </>
    );
}