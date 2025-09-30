import "@/styles/forms.css";

interface ViewStockDisposalModalProps {
    item: any;
    // formatStatus: (status: string) => string;
    onClose: () => void;
}

export default function ViewStockDisposalModal({ item, onClose }: ViewStockDisposalModalProps) {
    const data = (item && item.raw) ? item.raw : item;

    const sku = item?.sku || data?.item_id || data?.inventoryItem?.item_id || '';
    const category = item?.category || data?.inventoryItem?.category?.category_name || '';
    const itemName = data?.inventoryItem?.item_name || item?.itemName || '';
    const quantity = data?.quantity ?? 0;
    const disposalDate = data?.disposal_date ? new Date(data.disposal_date).toLocaleDateString() : item?.stockDisposalDate;

    return (
        <>
            <button className="close-modal-btn view" onClick={onClose}>
                <i className="ri-close-line"></i>
            </button>

            <div className="modal-heading">
                <h1 className="modal-title">View Stock Disposal Details</h1>
            </div>

            <div className="modal-content view">
                <form className="view-form">
                    <div className="form-row">
                        {/* SKU */}
                        <div className="form-group">
                            <label>SKU</label>
                            <p>{sku}</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* For view stock detais */}
            <p className="details-title">I. Stock Details</p>
            <div className="modal-content view">
                <form className="view-form">
                    {/* Item name and category*/}
                    <div className="form-row">
                        {/* Item Name */}
                        <div className="form-group">
                            <label>Item Name</label>
                            <p>{itemName}</p>
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label>Category</label>
                            <p>{category}</p>
                        </div>
                    </div>

                    {/* Quantity, Unit measure, and expiration date */}
                    <div className="form-row">
                        {/* Quantity */}
                        <div className="form-group">
                            <label>Quantity</label>
                            <p>{quantity}</p>
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <p>{data?.inventoryItem?.unit_measure || 'pcs'}</p>
                        </div>

                        {/* Expiration Date */}
                        <div className="form-group">
                            <label>Expiration Date</label>
                            <p>April 12, 2025</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* For disposal detais */}
            <p className="details-title">II. Disposal Details</p>
            <div className="modal-content view">
                <form className="view-form">
                    {/* disposal date and type */}
                    <div className="form-row">
                        {/* Disposal Date */}
                        <div className="form-group">
                            <label>Disposal Date</label>
                            <p>{disposalDate}</p>
                        </div>

                        {/* Disposal Method */}
                        <div className="form-group">
                            <label>Disposal Method</label>
                            <p>{data?.disposal_method || ''}</p>
                        </div>
                    </div>

                    {/* Quantity disposal and unit measure */}
                    <div className="form-row">
                        {/* Disposal Date */}
                        <div className="form-group">
                            <label>Disposal Quantity</label>
                            <p>{quantity}</p>
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <p>{data?.inventoryItem?.unit_measure || 'pcs'}</p>
                        </div>
                    </div>

                    {/* Reason for Disposal */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Reason for Disposal</label>
                            <p>{data?.reason || item?.stockDisposalReason || ''}</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Remarks</label>
                            <p>{data?.remarks || item?.stockDisposalRemarks || 'None'}</p>
                        </div>
                    </div>

                </form >
            </div >

        </>
    );
}