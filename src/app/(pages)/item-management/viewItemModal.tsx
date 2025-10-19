import "@/styles/forms.css";

interface ViewItemModalProps {
    item: {
        id: number;
        itemName: string,
        itemUnit: string,
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
                            <p>{item.itemUnit}</p>
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

            <p className="details-title">Linked Supplier/s</p>
            <table className="modal-table">
                <thead className="modal-table-heading">
                    <tr>
                        <th>Supplier Name</th>
                        <th>Unit Price</th>
                        <th>Average Delivery Time</th>
                        <th>Last Updated</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody className="modal-table-body">
                    <tr>
                        <td>Supplier 1</td>
                        <td>100</td>
                        <td>3 days</td>
                        <td>11/20/2024</td>
                        <td className="table-ellipsis">Notes here...</td>
                    </tr>
                </tbody>
            </table>

        </>
    );
}