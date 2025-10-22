import React, { useState, useEffect } from "react";

import {
    showItemUpdateConfirmation, showItemUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

interface EditLinkedItemModalProps {
    item: {
        id: number;
        linkedItemName: string;
        itemCategory: string;
        itemUnit: string;
        unitPrice: number;
    };
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

export default function EditLinkedItemModal({ item, onSave, onClose }: EditLinkedItemModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        linkedItemName: item.linkedItemName,
        itemCategory: item.itemCategory,
        itemUnit: item.itemUnit,
        unitPrice: item.unitPrice
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
        if (!formData.linkedItemName) errors.linkedItemName = "Item name is required";
        if (!formData.itemCategory) errors.itemCategory = "Item category is required";
        if (!formData.itemUnit) errors.itemUnit = "Item unit is required";
        if (formData.unitPrice <= 0) errors.unitPrice = "Unit price must be greater than 0";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showItemUpdateConfirmation(formData.linkedItemName);
        if (result.isConfirmed) {
            onSave(formData);
            await showItemUpdatedSuccess();
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
                <h1 className="modal-title">Edit Linked Item</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* Edit Linked Item Form */}
            <div className="modal-content edit">
                <form className="edit-form">
                    {/* Linked Item Name */}
                    <div className="form-group">
                        <label>Item Name</label>
                        <input disabled
                            className={formErrors?.linkedItemName ? "invalid-input" : ""}
                            type="text"
                            value={formData.linkedItemName}
                            onChange={(e) => handleChange("linkedItemName", e.target.value)}
                            placeholder="Enter item name here..."
                        />
                        <p className="edit-error-message">{formErrors?.linkedItemName}</p>
                    </div>

                    <div className="form-row">
                        {/* Unit Measure */}
                        <div className="form-group">
                            <label className="required">Unit Measure</label>
                            <input
                                className={formErrors?.itemUnit ? "invalid-input" : ""}
                                type="text"
                                value={formData.itemUnit}
                                onChange={(e) => handleChange("itemUnit", e.target.value)}
                                placeholder="Enter unit measure here..."
                            />
                            <p className="edit-error-message">{formErrors?.itemUnit}</p>
                        </div>

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

                        {/* Category */}
                        <div className="form-group">
                            <label>Category</label>
                            <select disabled
                                className={formErrors?.itemCategory ? "invalid-input" : ""}
                                value={formData.itemCategory || ""}
                                onChange={(e) => handleChange("itemCategory", e.target.value)}
                            >
                                <option value="" disabled>Select category...</option>
                                <option value="Consumable">Consumable</option>
                                <option value="Tool">Tool</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Machine">Machine</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.itemCategory}</p>
                        </div>
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