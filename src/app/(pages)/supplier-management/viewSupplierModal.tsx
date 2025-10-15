import "@/styles/forms.css";

interface ViewSupplierModalProps {
    item: {
        id: number;
        supplierId?: string;
        supplierName: string;
        contactPerson?: string;
        phone?: string;
        email?: string;
        street?: string;
        barangay?: string;
        city?: string;
        province?: string;
        status: string;
        remarks?: string;
        linkedItems?: Array<{
            id: number;
            itemId?: string;
            itemName?: string;
            unitMeasure?: string;
            unitPrice: number;
            averageDeliveryTime?: string;
            notes?: string;
        }>;
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
                        <label>Supplier ID</label>
                        <p>{item.supplierId || 'N/A'}</p>
                    </div>

                    <div className="form-group">
                        <label>Supplier Name</label>
                        <p>{item.supplierName}</p>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Contact Person</label>
                            <p>{item.contactPerson || 'N/A'}</p>
                        </div>

                        <div className="form-group">
                            <label>Contact Number</label>
                            <p>{item.phone || 'N/A'}</p>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <p>{item.email || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Street</label>
                            <p>{item.street || 'N/A'}</p>
                        </div>

                        <div className="form-group">
                            <label>Barangay</label>
                            <p>{item.barangay || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <p>{item.city || 'N/A'}</p>
                        </div>

                        <div className="form-group">
                            <label>Province</label>
                            <p>{item.province || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Status</label>
                            <p>{formatStatus(item.status)}</p>
                        </div>
                    </div>

                    {item.remarks && (
                        <div className="form-group">
                            <label>Remarks</label>
                            <p>{item.remarks}</p>
                        </div>
                    )}
                </div>
            </div >

            <p className="details-title">Linked Item/s ({item.linkedItems?.length || 0})</p>
            {item.linkedItems && item.linkedItems.length > 0 ? (
                <table className="modal-table">
                    <thead className="modal-table-heading">
                        <tr>
                            <th>Item ID</th>
                            <th>Item Name</th>
                            <th>Unit Measure</th>
                            <th>Unit Price</th>
                            <th>Delivery Time</th>
                        </tr>
                    </thead>
                    <tbody className="modal-table-body">
                        {item.linkedItems.map((linkedItem, index) => (
                            <tr key={linkedItem.id || index}>
                                <td>{linkedItem.itemId || 'N/A'}</td>
                                <td>{linkedItem.itemName || 'N/A'}</td>
                                <td>{linkedItem.unitMeasure || 'N/A'}</td>
                                <td>₱{linkedItem.unitPrice?.toFixed(2) || '0.00'}</td>
                                <td>{linkedItem.averageDeliveryTime || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No linked items found</p>
            )}

        </>
    );
}