import React, { useState, useEffect } from "react";

import {
    showItemSaveConfirmation, showItemSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

export interface LinkedItemForm {
    linkedItemName: string;
    itemCategory: string;
    itemUnit: string;
    unitPrice: number;
}

interface FormError {
    [key: string]: string;
}

interface AddLinkedItemModalProps {
    onClose: () => void;
    onSave: (linkedItemForm: LinkedItemForm) => void;
}

export default function AddLinkedItemModal({ onClose, onSave }: AddLinkedItemModalProps) {
    const [linkedItemForm, setLinkedItemForm] = useState<LinkedItemForm>({
        linkedItemName: "",
        itemCategory: "",
        itemUnit: "",
        unitPrice: 0
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [linkedItemForm]);

    const handleChange = (field: string, value: any) => {
        setLinkedItemForm((prev) => ({ ...prev, [field]: value }));

        // Clear the error for that field
        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!linkedItemForm.linkedItemName) errors.linkedItemName = "Supplier name is required";
        if (!linkedItemForm.itemCategory) errors.itemCategory = "Item category is required";
        if (!linkedItemForm.itemUnit) errors.itemUnit = "Item unit is required";
        if (linkedItemForm.unitPrice <= 0) errors.unitPrice = "Unit price must be greater than zero";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showItemSaveConfirmation();
        if (result.isConfirmed) {
            onSave(linkedItemForm);
            await showItemSavedSuccess();
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
                <h1 className="modal-title">Add Linked Item</h1>
                
                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            <div className="modal-content add">
                <form className="add-form">
                    {/* Linked Item Name */}
                    <div className="form-group">
                        <label className="required">Item Name</label>
                        <select
                            className={formErrors?.linkedItemName ? "invalid-input" : ""}
                            value={linkedItemForm.linkedItemName}
                            onChange={(e) => handleChange("linkedItemName", e.target.value)}
                        >
                            <option value="" disabled>Select item name...</option>
                            <option value="Fuel Filter">Fuel Filter</option>
                            <option value="Break Pad">Break Pad</option>
                            <option value="Tire">Tire</option>
                        </select>
                        <p className="add-error-message">{formErrors?.linkedItemName}</p>
                    </div>

                    <div className="form-row">
                        {/* Unit Measure */}
                        <div className="form-group">
                            <label className="required">Unit Measure</label>
                            <input
                                className={formErrors?.itemUnit ? "invalid-input" : ""}
                                type="text"
                                value={linkedItemForm.itemUnit}
                                onChange={(e) => handleChange("itemUnit", e.target.value)}
                                placeholder="Enter unit measure here..."
                            />
                            <p className="add-error-message">{formErrors?.itemUnit}</p>
                        </div>

                        {/* Unit Price */}
                        <div className="form-group">
                            <label className="required">Unit Price</label>
                            <input
                                className={formErrors?.unitPrice ? "invalid-input" : ""}
                                type="number"
                                value={linkedItemForm.unitPrice || ""}
                                onChange={(e) => handleChange("unitPrice", parseFloat(e.target.value))}
                                placeholder="Enter unit price here..."
                            />
                            <p className="add-error-message">{formErrors?.unitPrice}</p>
                        </div>

                        {/* Item Category */}
                        <div className="form-group">
                            <label className="required">Item Category</label>
                            <select
                                className={formErrors?.itemCategory ? "invalid-input" : ""}
                                value={linkedItemForm.itemCategory}
                                onChange={(e) => handleChange("itemCategory", e.target.value)}
                            >
                                <option value="" disabled>Select category...</option>
                                <option value="Consumable">Consumable</option>
                                <option value="Tool">Tool</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Machine">Machine</option>
                            </select>
                            <p className="add-error-message">{formErrors?.itemCategory}</p>
                        </div>
                    </div>
                </form >
            </div >

            <div className="modal-actions">
                <button type="submit" className="submit-btn" onClick={handleSubmit}>
                    <i className="ri-save-3-line" /> Save
                </button>
            </div>
        </>
    );
}
