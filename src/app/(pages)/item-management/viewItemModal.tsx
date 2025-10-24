import "@/styles/forms.css";
import ActionButtons from "@/components/actionButtons";

interface ViewItemModalProps {
    item: {
        id: number;
        itemName: string,
        itemUnitMeasure: string,
        itemCategory: string,
        itemStatus: string,
        // Additional fields would be included in a real application
    };
    formatStatus: (status: string) => string;
    onClose: () => void;
}

export default function ViewItemModal({ item, formatStatus, onClose }: ViewItemModalProps) {
    return (
        <>
            <button className="close-modal-btn view" onClick={onClose}>
                <i className="ri-close-line"></i>
            </button>

            <div className="modal-heading">
                <h1 className="modal-title">View Item</h1>
            </div>

            <div className="modal-content view">
                <div className="view-form">
                    <div className="form-group">
                        <label>Item Name</label>
                        <p>{item.itemName}</p>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <p>{item.itemUnitMeasure}</p>
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <p>{item.itemCategory}</p>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <p>{formatStatus(item.itemStatus)}</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <p>Description...</p>
                    </div>
                </div>
            </div >

            <div className="details-header">
                <p className="details-title">Linked Supplier/s</p>
            </div>
            
            <div className="modal-table-wrapper">
                <div className="modal-table-container">
                    <table className="modal-table">
                        <thead className="modal-table-heading">
                            <tr>
                                <th>Supplier Name</th>
                                <th>Supplier Unit</th>
                                <th>Conversion</th>
                                <th>Unit Price</th>
                                <th>Delivery Time</th>
                                <th>Status</th>
                                {/* <th>Actions</th> */}
                            </tr>
                        </thead>
                        <tbody className="modal-table-body">
                            <tr>
                                <td>Supplier 1</td>
                                <td>set</td>
                                <td>1 set = 3 pcs</td>
                                <td>₱100.00</td>
                                <td>5 days</td>
                                <td className="table-status">
                                    <span className={`chip ${"active"}`}>
                                        Active
                                    </span>
                                </td>
                                {/* <td>
                                    <ActionButtons
                                        onToggleStar={() => handleTogglePreferred(supplierItem.id)}
                                        isStarred={supplierItem.isPreferred}
                                    />
                                </td> */}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}