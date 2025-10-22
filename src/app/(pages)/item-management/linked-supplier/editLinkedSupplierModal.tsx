import React, { useState, useEffect } from "react";

import {
    showSupplierUpdateConfirmation, showSupplierUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

interface EditLinkedSupplierModalProps {
    item: {
        id: number;
        linkedSupplierName: string;
        unitPrice: number;
        deliveryTime: string;
        notes: string;
    };
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

export default function EditLinkedSupplierModal({ item, onSave, onClose }: EditLinkedSupplierModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        linkedSupplierName: item.linkedSupplierName,
        unitPrice: item.unitPrice,
        deliveryTime: item.deliveryTime,
        notes: item.notes
    });

    // State to track if form is dirty (has changes)
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [originalData] = useState({ ...formData });

    // Add formErrors state
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

        // Validate inputs
        if (!formData.linkedSupplierName) errors.linkedSupplierName = "Supplier name is required";
        if (formData.unitPrice <= 0) errors.unitPrice = "Unit price must be greater than 0";
        if (!formData.deliveryTime) errors.deliveryTime = "Delivery time is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showSupplierUpdateConfirmation(formData.linkedSupplierName);
        if (result.isConfirmed) {
            onSave(formData);
            await showSupplierUpdatedSuccess();
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

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Edit Linked Supplier</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* Edit Linked Supplier Form */}
            <div className="modal-content edit">
                <form className="edit-form">
                    {/* Linked Supplier Name */}
                    <div className="form-group">
                        <label>Supplier Name</label>
                        <input disabled
                            className={formErrors?.linkedSupplierName ? "invalid-input" : ""}
                            type="text"
                            value={formData.linkedSupplierName}
                            onChange={(e) => handleChange("linkedSupplierName", e.target.value)}
                            placeholder="Enter supplier name here..."
                        />
                        <p className="edit-error-message">{formErrors?.linkedSupplierName}</p>
                    </div>

                    <div className="form-row">
                        {/* Unit Price */}
                        <div className="form-group">
                            <label className="required">Unit Price</label>
                            <input
                                className={formErrors?.unitPrice ? "invalid-input" : ""}
                                type="number"
                                value={formData.unitPrice || ""}
                                onChange={(e) => handleChange("unitPrice", Number(e.target.value))}
                                placeholder="Enter unit price here..."
                            />
                            <p className="edit-error-message">{formErrors?.unitPrice}</p>
                        </div>

                        {/* Delivery Time */}
                        <div className="form-group">
                            <label className="required">Delivery Time</label>
                            <input
                                className={formErrors?.deliveryTime ? "invalid-input" : ""}
                                type="text"
                                value={formData.deliveryTime}
                                onChange={(e) => handleChange("deliveryTime", e.target.value)}
                                placeholder="Enter delivery time here..."
                            />
                            <p className="edit-error-message">{formErrors?.deliveryTime}</p>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            className={formErrors?.notes ? "invalid-input" : ""}
                            value={formData.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            placeholder="Enter additional notes here..."
                        />
                        <p className="edit-error-message"></p>
                    </div>
                </form >
            </div >

            <div className="modal-actions">
                <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={!isFormDirty}>
                    <i className="ri-save-3-line" /> Update
                </button>
            </div>

        </>
    );
}