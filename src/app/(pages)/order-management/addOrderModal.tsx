import React, { useState, useEffect } from "react";
import ConfirmationPopup from "@/components/confirmationPopup";
import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface OrderForm {
    itemName: string,
    ordQuantity: number,
    ordStatus: string,
    ordReason: string,
}

interface FormError {
    [key: string]: string;
}

interface AddOrderModalProps {
    onSave: (orderForm: OrderForm) => void;
    onClose: () => void;
}

export default function AddOrderModal({ onSave, onClose }: AddOrderModalProps) {
    // Initial order form state
    const [orderForm, setOrderForm] = useState<OrderForm>({
        itemName: "",
        ordQuantity: 0,
        ordStatus: "pending",
        ordReason: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
    const [showClosingConfirmation, setShowClosingConfirmation] = useState(false);

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [orderForm]);

    const handleChange = (field: string, value: any) => {
        setOrderForm((prev) => ({ ...prev, [field]: value }));

        // Clear the error for that field
        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!orderForm.itemName) errors.itemName = "Item name is required";
        if (orderForm.ordQuantity <= 0) errors.ordQuantity = "Quantity must be more than 0";
        if (!orderForm.ordStatus) errors.ordStatus = "Order status is required";
        if (!orderForm.ordReason) errors.ordReason = "Order reason is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = validateForm();
        if (isValid) {
            setShowSaveConfirmation(true);
        }
    };

    const handleConfirmSave = () => {
        onSave(orderForm);
    };

    const handleClose = () => {
        if (isDirty) {
            setShowClosingConfirmation(true);
        } else {
            onClose();
        }
    };

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Add Order</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            <div className="modal-content add">
                <form className="add-order-form">
                    <div className="form-row">
                        <div className="form-column">
                            {/* Item Name */}
                            <div className="form-group">
                                <label>Item Name</label>
                                <input
                                    className={formErrors?.itemName ? "invalid-input" : ""}
                                    type="text"
                                    value={orderForm.itemName}
                                    onChange={(e) => handleChange("itemName", e.target.value)}
                                    placeholder="Enter item name here..."
                                />
                                <p className="add-error-message">{formErrors?.itemName}</p>
                            </div>

                            {/* Quantity */}
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    className={formErrors?.ordQuantity ? "invalid-input" : ""}
                                    type="number"
                                    min="0"
                                    value={orderForm.ordQuantity}
                                    onChange={(e) => handleChange("ordQuantity", Number(e.target.value))}
                                />
                                <p className="add-error-message">{formErrors?.ordQuantity}</p>
                            </div>

                            {/* Status */}
                            <div className="form-group">
                                <label>Status</label>
                                <select disabled value={orderForm.ordStatus}>
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
                            <textarea
                                className={`order ${formErrors?.ordReason ? "invalid-input" : ""}`}
                                value={orderForm.ordReason}
                                onChange={(e) => handleChange("ordReason", e.target.value)}
                                placeholder="Enter request reason here..."
                            >
                            </textarea>
                            <p className="add-error-message">{formErrors?.ordReason}</p>
                        </div>
                    </div>
                </form>
            </div>

            <div className="modal-actions add">
                <button type="submit" className="submit-btn" onClick={handleSubmit}>
                    <i className="ri-save-3-line" /> Save
                </button>
            </div>

            {/* Save Confirmation */}
            <ConfirmationPopup
                isOpen={showSaveConfirmation}
                onClose={() => setShowSaveConfirmation(false)}
                onConfirm={handleConfirmSave}
                title="Confirm Save"
                message="Are you sure you want to save this order request?"
                confirmText="Save"
                cancelText="Cancel"
                variant="success"
            />

            {/* Close Confirmation */}
            <ConfirmationPopup
                isOpen={showClosingConfirmation}
                onClose={() => setShowClosingConfirmation(false)}
                onConfirm={onClose}
                title="Unsaved Changes"
                message="You have unsaved changes. Are you sure you want to close without saving?"
                confirmText="Close Without Saving"
                cancelText="Continue Editing"
                variant="warning"
            />
        </>
    );
}