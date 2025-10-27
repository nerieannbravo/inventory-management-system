import "@/styles/forms.css";
import { FileList } from "@/components/fileList";

interface ViewOrderModalProps {
    item: {
        id: number;
        isApproved: boolean;
        itemName: string;
        requestedQuantity: number;
        approvedQuantity: number;
        receivedQuantity: number;
        usableQuantity: number;
        unitMeasure: string;
        estimatedUnitCost: number;
        actualUnitCost: number;
        itemOrderStatus: string;
        adjustmentReason: string;
        attachmentFiles: File[];
    };
    formatStatus: (status: string) => string;
    onClose: () => void;
}

export default function ViewItemOrderModal({ item, formatStatus, onClose }: ViewOrderModalProps) {
    const estimatedAmount = item.estimatedUnitCost * item.approvedQuantity;
    const actualAmount = item.actualUnitCost * item.approvedQuantity;

    return (
        <>
            <button className="close-modal-btn view" onClick={onClose}>
                <i className="ri-close-line"></i>
            </button>

            <div className="modal-heading">
                <h1 className="modal-title">View Item Order</h1>
            </div>

            <div className="modal-content view">
                <div className="view-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Item Name</label>
                            <p>{item.itemName}</p>
                        </div>

                        <div className="form-group">
                            <label>Unit Measure</label>
                            <p>{item.unitMeasure}</p>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <p>{formatStatus(item.itemOrderStatus)}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Requested Quantity</label>
                            <p>{item.requestedQuantity}</p>
                        </div>

                        <div className="form-group">
                            <label>Approved Quantity</label>
                            <p>{item.approvedQuantity}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Received Quantity</label>
                            <p>{item.receivedQuantity}</p>
                        </div>

                        <div className="form-group">
                            <label>Usable Quantity</label>
                            <p>{item.usableQuantity}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Estimated Unit Cost</label>
                            <p>₱{item.estimatedUnitCost.toFixed(2)}</p>
                        </div>

                        <div className="form-group">
                            <label>Actual Unit Cost</label>
                            <p>₱{item.actualUnitCost.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Estimated Amount</label>
                            <p>₱{estimatedAmount.toFixed(2)}</p>
                        </div>

                        <div className="form-group">
                            <label>Actual Amount</label>
                            <p>₱{actualAmount.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Adjustment Reason</label>
                        <p>{item.adjustmentReason || "N/A"}</p>
                    </div>
                </div>
            </div>

            <p className="details-title">File Attachment/s</p>
            {/* File Attachments */}
            <div className="form-row">
                <div className="form-group">
                    <FileList
                        files={[
                            { name: 'Attachment_1.pdf' },
                            { name: 'Canvas.png' }
                        ]}
                        onFileClick={(file) => {
                            // Temporary opening of file
                            window.open(file.url, '_blank');
                        }}
                    />
                </div>
            </div>
        </>
    );
}
