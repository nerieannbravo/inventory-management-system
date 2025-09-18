import React, { useState, useEffect } from "react";

import {
    showSupplierSaveConfirmation, showSupplierSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

export interface LinkedSupplierForm {
    linkedSupplierName: string;
    unitPrice: number;
    deliveryTime: string;
    notes: string;
}

interface FormError {
    [key: string]: string;
}

interface AddLinkedSupplierModalProps {
    onClose: () => void;
    onSave: (linkedSupplierForm: LinkedSupplierForm) => void;
}

export default function AddLinkedSupplierModal({ onClose, onSave }: AddLinkedSupplierModalProps) {
    const [linkedSupplierForm, setLinkedSupplierForm] = useState<LinkedSupplierForm>({
        linkedSupplierName: "",
        unitPrice: 0,
        deliveryTime: "",
        notes: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [linkedSupplierForm]);

    const handleChange = (field: string, value: any) => {
        setLinkedSupplierForm((prev) => ({ ...prev, [field]: value }));

        // Clear the error for that field
        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!linkedSupplierForm.linkedSupplierName) errors.linkedSupplierName = "Supplier name is required";
        if (linkedSupplierForm.unitPrice <= 0) errors.unitPrice = "Unit price must be greater than 0";
        if (!linkedSupplierForm.deliveryTime) errors.deliveryTime = "Delivery time is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showSupplierSaveConfirmation();
        if (result.isConfirmed) {
            onSave(linkedSupplierForm);
            await showSupplierSavedSuccess();
            onClose();
        }
    };

    const handleClose = async () => {
        if (!isDirty) {
            onClose();
            return;
        }

        const result = await showCloseWithoutSavingConfirmation();
        if (result.isConfirmed) {
            onClose();
        }
    };

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Add Linked Supplier</h1>
            </div>

            <div className="modal-content add">
                <form className="add-form">
                    {/* Linked Supplier Name */}
                    <div className="form-group">
                        <label>Supplier Name</label>
                        <select
                            className={formErrors?.linkedSupplierName ? "invalid-input" : ""}
                            value={linkedSupplierForm.linkedSupplierName}
                            onChange={(e) => handleChange("linkedSupplierName", e.target.value)}
                        >
                            <option value="" disabled>Select supplier name...</option>
                            <option value="Kang Seulgi">Kang Seulgi</option>
                            <option value="Leo Lee">Leo Lee</option>
                            <option value="Zhang Jiahao">Zhang Jiahao</option>
                        </select>
                        <p className="add-error-message">{formErrors?.linkedSupplierName}</p>
                    </div>

                    <div className="form-row">
                        {/* Unit Price */}
                        <div className="form-group">
                            <label>Unit Price</label>
                            <input
                                className={formErrors?.unitPrice ? "invalid-input" : ""}
                                type="number"
                                value={linkedSupplierForm.unitPrice || ""}
                                onChange={(e) => handleChange("unitPrice", Number(e.target.value))}
                                placeholder="Enter unit price here..."
                            />
                            <p className="add-error-message">{formErrors?.unitPrice}</p>
                        </div>

                        {/* Delivery Time */}
                        <div className="form-group">
                            <label>Delivery Time</label>
                            <input
                                className={formErrors?.deliveryTime ? "invalid-input" : ""}
                                type="text"
                                value={linkedSupplierForm.deliveryTime}
                                onChange={(e) => handleChange("deliveryTime", e.target.value)}
                                placeholder="e.g. 1 week"
                            />
                            <p className="add-error-message">{formErrors?.deliveryTime}</p>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={linkedSupplierForm.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            placeholder="Enter additional notes here..."
                        />
                        <p className="add-error-message"></p>
                    </div>


                </form >
            </div >

            <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleClose}>
                    Cancel
                </button>
                <button type="submit" className="submit-btn" onClick={handleSubmit}>
                    <i className="ri-save-3-line" /> Save
                </button>
            </div>
        </>
    );
}
