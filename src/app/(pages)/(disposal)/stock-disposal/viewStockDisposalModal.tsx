import "@/styles/forms.css";
import { FileList } from "@/components/fileList";

interface ViewStockDisposalModalProps {
    item: {
        id: number,
        itemName: string,
        category: string,
        sku: string,
        disposalMethod: string,
        disposalDate: string,
        // Additional fields would be included in a real application
    };
    onClose: () => void;
}

export default function ViewStockDisposalModal({ item, onClose }: ViewStockDisposalModalProps) {
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
                            <p>{item.sku}</p>
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
                            <p>{item.itemName}</p>
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label>Category</label>
                            <p>{item.category}</p>
                        </div>
                    </div>

                    {/* Quantity, Unit measure, and expiration date */}
                    <div className="form-row">
                        {/* Quantity */}
                        <div className="form-group">
                            <label>Quantity</label>
                            <p>10</p>
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <p>Gallon</p>
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
                            <p>{item.disposalDate}</p>
                        </div>

                        {/* Disposal Method */}
                        <div className="form-group">
                            <label>Disposal Method</label>
                            <p>{item.disposalMethod}</p>
                        </div>
                    </div>

                    {/* Quantity disposal and unit measure */}
                    <div className="form-row">
                        {/* Disposal Date */}
                        <div className="form-group">
                            <label>Disposal Quantity</label>
                            <p>10</p>
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <p>Gallon</p>
                        </div>
                    </div>

                    {/* Reason for Disposal */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Reason for Disposal</label>
                            <p>Not usable because it is expired</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Remarks</label>
                            <p>None</p>
                        </div>
                    </div>

                </form >
            </div >

        </>
    );
}