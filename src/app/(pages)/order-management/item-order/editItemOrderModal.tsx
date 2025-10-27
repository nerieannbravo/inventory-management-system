import React, { useState, useEffect } from "react";
import { FileList } from "@/components/fileList";

import {
    showItemOrderUpdateConfirmation, showItemOrderUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

interface EditItemOrderModalProps {
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
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

export default function EditItemOrderModal({ item, onSave, onClose }: EditItemOrderModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        itemName: item.itemName,
        requestedQuantity: item.requestedQuantity,
        approvedQuantity: item.approvedQuantity,
        receivedQuantity: item.receivedQuantity || 0,
        usableQuantity: item.usableQuantity,
        unitMeasure: item.unitMeasure,
        estimatedUnitCost: item.estimatedUnitCost,
        actualUnitCost: item.actualUnitCost || 0,
        itemOrderStatus: item.itemOrderStatus || "",
        adjustmentReason: item.adjustmentReason,
        attachmentFiles: item.attachmentFiles
    });

    // State to track if form is dirty (has changes)
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [originalData] = useState({ ...formData });

    // Add formErrors state
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Track if the item was originally received (to keep status dropdown enabled)
    const wasOriginallyReceived = useState(
        item.itemOrderStatus.toLowerCase() === 'received'
    )[0];

    // Track if status was just changed to received in this session
    const [statusChangedToReceived, setStatusChangedToReceived] = useState(false);

    // Check if form data has changed from original
    useEffect(() => {
        const hasChanges = JSON.stringify(originalData) !== JSON.stringify(formData);
        setIsFormDirty(hasChanges);

        // Track if status was just changed to received
        if (formData.itemOrderStatus.toLowerCase() === 'received' &&
            originalData.itemOrderStatus.toLowerCase() !== 'received') {
            setStatusChangedToReceived(true);
        } else if (formData.itemOrderStatus.toLowerCase() !== 'received') {
            setStatusChangedToReceived(false);
        }
    }, [formData, originalData]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when field is changed
        if (formErrors[field]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Validate inputs
        if (!formData.itemOrderStatus) {
            errors.itemOrderStatus = "Status is required";
        }

        // If status is "received", validate received quantity and actual unit cost
        if (formData.itemOrderStatus.toLowerCase() === 'received') {
            if (!formData.receivedQuantity || formData.receivedQuantity <= 0) {
                errors.receivedQuantity = "Received quantity is required and must be greater than 0";
            }
            if (!formData.actualUnitCost || formData.actualUnitCost <= 0) {
                errors.actualUnitCost = "Actual unit cost is required and must be greater than 0";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showItemOrderUpdateConfirmation(formData.itemName);
        if (result.isConfirmed) {
            onSave(formData);
            await showItemOrderUpdatedSuccess();
        }
    };

    const handleClose = async () => {
        if (!isFormDirty) {
            onClose();
            return;
        }

        const result = await showCloseWithoutUpdatingConfirmation();
        if (result.isConfirmed) {
            onClose();
        }
    };

    // Determine if status dropdown should be disabled
    // Disabled if: status is received AND it wasn't just changed from pending/adjusted in this session
    const isStatusDisabled = formData.itemOrderStatus.toLowerCase() === 'received' &&
        !statusChangedToReceived;

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Edit Item Order</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* Edit Item Order Form */}
            <div className="modal-content edit">
                <form className="edit-form">
                    <div className="form-row">
                        {/* Item Name */}
                        <div className="form-group">
                            <label>Item Name</label>
                            <input disabled
                                type="text"
                                value={formData.itemName}
                            />
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <input disabled
                                type="text"
                                value={formData.unitMeasure}
                            />
                        </div>

                        {/* Item Order Status */}
                        <div className="form-group">
                            <label className="required">Status</label>
                            <select
                                className={formErrors?.itemOrderStatus ? "invalid-input" : ""}
                                value={formData.itemOrderStatus || ""}
                                onChange={(e) => handleChange("itemOrderStatus", e.target.value)}
                                disabled={isStatusDisabled}
                            >
                                <option value="" disabled>Select status...</option>
                                {['pending', 'adjusted'].includes(originalData.itemOrderStatus.toLowerCase()) ? (
                                    // If original status is pending or adjusted, show that status + received option
                                    <>
                                        {originalData.itemOrderStatus.toLowerCase() === 'pending' && (
                                            <option value="pending">Pending</option>
                                        )}
                                        {originalData.itemOrderStatus.toLowerCase() === 'adjusted' && (
                                            <option value="adjusted">Adjusted</option>
                                        )}
                                        <option value="received">Received</option>
                                    </>
                                ) : (
                                    // Otherwise show all options
                                    <>
                                        <option value="pending">Pending</option>
                                        <option value="adjusted">Adjusted</option>
                                        <option value="received">Received</option>
                                        <option value="closed">Closed</option>
                                        <option value="partial">Partial</option>
                                        <option value="to-be-refunded">To be Refunded</option>
                                        <option value="to-be-replaced">To be Replaced</option>
                                    </>
                                )}
                            </select>
                            <p className="edit-error-message">{formErrors?.itemOrderStatus}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Approved Quantity */}
                        <div className="form-group">
                            <label>Approved Quantity</label>
                            <input disabled
                                type="number"
                                value={formData.approvedQuantity}
                            />
                            <p className="edit-error-message"></p>
                        </div>

                        {/* Received Quantity */}
                        <div className="form-group">
                            <label className={formData.itemOrderStatus.toLowerCase() === 'received' ? "required" : ""}>
                                Received Quantity
                            </label>
                            <input
                                className={formErrors?.receivedQuantity ? "invalid-input" : ""}
                                type="number"
                                step="0.1"
                                min="0"
                                value={formData.receivedQuantity || ""}
                                onChange={(e) => handleChange("receivedQuantity", Number(e.target.value))}
                                placeholder="Enter received quantity here..."
                            />
                            <p className="edit-error-message">{formErrors?.receivedQuantity}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Estimated Unit Cost */}
                        <div className="form-group">
                            <label>Estimated Unit Cost</label>
                            <input disabled
                                type="text"
                                value={formData.estimatedUnitCost}
                            />
                        </div>

                        {/* Actual Unit Cost */}
                        <div className="form-group">
                            <label className={formData.itemOrderStatus.toLowerCase() === 'received' ? "required" : ""}>
                                Actual Unit Cost
                            </label>
                            <input
                                className={formErrors?.actualUnitCost ? "invalid-input" : ""}
                                type="number"
                                step={0.01}
                                min={0.01}
                                value={formData.actualUnitCost || ""}
                                onChange={(e) => handleChange("actualUnitCost", Number(e.target.value))}
                                placeholder="Enter actual unit cost here..."
                            />
                            <p className="edit-error-message">{formErrors?.actualUnitCost}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Estimated Amount */}
                        <div className="form-group">
                            <label>Estimated Amount</label>
                            <input disabled
                                type="text"
                                value={(formData.approvedQuantity * formData.estimatedUnitCost).toFixed(2)}
                            />
                        </div>

                        {/* Actual Amount */}
                        <div className="form-group">
                            <label>Actual Amount</label>
                            <input disabled
                                type="text"
                                value={(formData.approvedQuantity * formData.actualUnitCost).toFixed(2)}
                            />
                            <p className="edit-error-message"></p>
                        </div>
                    </div>

                    {/* Adjustment Reason */}
                    <div className="form-group">
                        <label>Adjustment Reason</label>
                        <input disabled
                            type="text"
                            value={formData.adjustmentReason || "N/A"}
                        />
                    </div>
                </form>
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

            <div className="modal-actions">
                <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={!isFormDirty}>
                    <i className="ri-save-3-line" /> Update
                </button>
            </div>
        </>
    );
}