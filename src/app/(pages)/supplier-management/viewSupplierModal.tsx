import "@/styles/forms.css";

interface ViewSupplierModalProps {
    item: {
        id: number;
        supplierName: string,
        supplierAddress: string,
        supplierContactPerson: string,
        supplierContact: string,
        supplierEmail: string,
        supplierStatus: string,
        supplierRemarks: string,
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
                            <label>Contact Person</label>
                            <p>Lee Soo Man</p>
                        </div>

                        <div className="form-group">
                            <label>Contact Number</label>
                            <p>{item.supplierContact}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <p>{item.supplierEmail}</p>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <p>{formatStatus(item.supplierStatus)}</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Supplier Address</label>
                        <p>{item.supplierAddress}</p>
                    </div>

                    <div className="form-group">
                        <label>Remarks</label>
                        <p>Remarks...</p>
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
                                <th>Category</th>
                                <th>Supplier Unit</th>
                                <th>Conversion</th>
                                <th>Unit Price</th>
                                <th>Delivery Time</th>
                                <th>Notes</th>
                                {/* <th>Actions</th> */}
                            </tr>
                        </thead>
                        <tbody className="modal-table-body">
                            <tr>
                                <td>Item 1</td>
                                <td>Consumable</td>
                                <td>set</td>
                                <td>1</td>
                                <td>₱100.00</td>
                                <td>5 days</td>
                                <td>Notes here</td>
                                {/* <td>
                                    <ActionButtons
                                        onToggleStar={() => handleTogglePreferred(linkedItem.id)}
                                        isStarred={linkedItem.isPreferred}
                                    />
                                </td> */}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div >
        </>
    );
}