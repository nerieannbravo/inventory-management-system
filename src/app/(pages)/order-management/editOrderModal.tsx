import React, { useState, useEffect } from "react";

import ConfirmationPopup from "@/components/confirmationPopup";

import "@/styles/forms.css";

interface EditOrderModalProps {
    item: {
        id: number;
        itemName: string;
        ordQuantity: number,
        ordReqDate: string,
        ordStatus: string,
        // Additional fields would be included in a real application
    };
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

export default function EditOrderModal({ item, onSave, onClose }: EditOrderModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        itemName: item.itemName,
        ordQuantity: 0, // Default value, would be populated from item in a real app
        ordStatus: item.ordStatus,
        ordReason: ""
    });

    // State to track if form is dirty (has changes)
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [originalData] = useState({ ...formData });

    // Add formErrors state
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Confirmation dialog states
    const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

    // Check if form data has changed from original
    useEffect(() => {
        const hasChanges = JSON.stringify(originalData) !== JSON.stringify(formData);
        setIsFormDirty(hasChanges);
    }, [formData, originalData]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Validate status
        if (!formData.ordStatus) errors.ordStatus = "Order status is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = validateForm();
        if (!isValid) return;

        // Show update confirmation instead of updating immediately
        setShowUpdateConfirmation(true);
    };

    const handleConfirmUpdate = () => {
        onSave(formData);
    };

    const handleClose = () => {
        if (isFormDirty) {
            setShowCloseConfirmation(true);
        } else {
            onClose();
        }
    };

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Edit Request</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* Edit Order Form */}
            <div className="modal-content edit">
                <form className="edit-order-form" id="edit-order-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-column">
                            {/* Item Name */}
                            <div className="form-group">
                                <label>Item Name</label>
                                <input disabled
                                    className={formErrors?.itemName ? "invalid-input" : ""}
                                    type="text"
                                    value={formData.itemName}
                                    onChange={(e) => handleChange("itemName", e.target.value)}
                                />
                                <p className="edit-error-message"></p>
                            </div>

                            {/* Quantity */}
                            <div className="form-group">
                                <label>Quantity</label>
                                <input disabled
                                    className={formErrors?.ordQuantity ? "invalid-input" : ""}
                                    type="number"
                                    min="0"
                                    value={formData.ordQuantity}
                                    onChange={(e) => handleChange("ordQuantity", Number(e.target.value))}
                                />
                                <p className="add-error-message"></p>
                            </div>

                            {/* Status */}
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    className={formErrors?.ordStatus ? "invalid-input" : ""}
                                    value={formData.ordStatus}
                                    onChange={(e) => handleChange("ordStatus", e.target.value)}
                                >
                                    <option value="" disabled>Select status...</option>
                                    <option value="completed">Completed</option>
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <p className="add-error-message">{formErrors?.ordStatus}</p>
                            </div>
                        </div>

                        {/* Request Reason */}
                        <div className="form-group">
                            <label>Reason for Order Request</label>
                            <textarea disabled
                                className={`order ${formErrors?.ordReason ? "invalid-input" : ""}`}
                                value={formData.ordReason}
                                onChange={(e) => handleChange("ordReason", e.target.value)}
                            >
                            </textarea>
                            <p className="add-error-message">{formErrors?.ordReason}</p>
                        </div>
                    </div>
                </form>
            </div>

            <div className="modal-actions">
                <button type="submit" className="submit-btn" form="edit-order-form">
                    <i className="ri-save-3-line" /> Update
                </button>
            </div>

            {/* Update Confirmation Dialog */}
            <ConfirmationPopup
                isOpen={showUpdateConfirmation}
                onClose={() => setShowUpdateConfirmation(false)}
                onConfirm={handleConfirmUpdate}
                title="Confirm Update"
                message={`Are you sure you want to update the order details for "${formData.itemName}"?`}
                confirmText="Update"
                cancelText="Cancel"
                variant="success"
            />

            {/* Close Without Saving Dialog */}
            <ConfirmationPopup
                isOpen={showCloseConfirmation}
                onClose={() => setShowCloseConfirmation(false)}
                onConfirm={onClose}
                title="Unsaved Changes"
                message="You have unsaved changes. Are you sure you want to close without updating?"
                confirmText="Close Without Saving"
                cancelText="Continue Editing"
                variant="warning"
            />
        </>
    );
}