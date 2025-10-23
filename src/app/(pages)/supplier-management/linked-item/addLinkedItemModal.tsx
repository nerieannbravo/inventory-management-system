import React, { useState, useEffect } from "react";

import SearchableDropdown from "@/components/searchableDropdown";

import {
    showItemSaveConfirmation, showItemSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

export interface LinkedItemForm {
    linkedItemName: string;
    itemCategory: string;
    itemUnitMeasure: string;
    supplierUnitMeasure: string;
    conversionFactor: number;
    unitPrice: number;
    deliveryTime: string;
    notes: string;
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
        itemUnitMeasure: "",
        supplierUnitMeasure: "",
        conversionFactor: 0,
        unitPrice: 0,
        deliveryTime: "",
        notes: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    // Define item options
    const itemOptions = [
        { id: 1, label: "Item 1", value: "Item 1" },
        { id: 2, label: "Item 2", value: "Item 2" },
        { id: 3, label: "Item 3", value: "Item 3" },
        { id: 4, label: "Item 4", value: "Item 4" },
        { id: 5, label: "Item 5", value: "Item 5" },
    ];

    // Define unit measure options
    const unitMeasureOptions = [
        { id: 1, label: "Bags (bag)", value: "bag" },
        { id: 2, label: "Bottles (btl)", value: "btl" },
        { id: 3, label: "Boxes (box)", value: "box" },
        { id: 4, label: "Cans (can)", value: "can" },
        { id: 5, label: "Cartons (ctn)", value: "ctn" },
        { id: 6, label: "Centimeters (cm)", value: "cm" },
        { id: 7, label: "Gallons (gal)", value: "gal" },
        { id: 8, label: "Grams (g)", value: "g" },
        { id: 9, label: "Kilograms (kg)", value: "kg" },
        { id: 10, label: "Liters (L)", value: "L" },
        { id: 11, label: "Meters (m)", value: "m" },
        { id: 12, label: "Pairs (pr)", value: "pr" },
        { id: 13, label: "Pieces (pcs)", value: "pcs" },
        { id: 14, label: "Rolls (roll)", value: "roll" },
        { id: 15, label: "Sets (set)", value: "set" },
    ];

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

        if (!linkedItemForm.linkedItemName) errors.linkedItemName = "Item name is required";
        // if (!linkedItemForm.itemCategory) errors.itemCategory = "Item category is required";
        // if (!linkedItemForm.itemUnitMeasure) errors.itemUnitMeasure = "Item unit is required";
        if (!linkedItemForm.supplierUnitMeasure) errors.supplierUnitMeasure = "Supplier unit measure is required";
        if (!linkedItemForm.conversionFactor) errors.conversionFactor = "Conversion factor is required";
        if (!linkedItemForm.unitPrice) {
            errors.unitPrice = "Unit price is required";
        } else if (linkedItemForm.unitPrice <= 0) {
            errors.unitPrice = "Unit price must be greater than 0";
        }
        // if (!linkedItemForm.deliveryTime) errors.deliveryTime = "Delivery time is required";

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
                        <SearchableDropdown
                            options={itemOptions}
                            value={linkedItemForm.linkedItemName}
                            onChange={(selected, customValue) => {
                                const value = selected ? selected.value : customValue || "";
                                handleChange("linkedItemName", value);
                            }}
                            placeholder="Search or select item..."
                            error={formErrors?.linkedItemName}
                            allowCustom={false}
                            noResultsText="No items found"
                        />
                    </div>

                    <div className="form-row">
                        {/* Item Category */}
                        <div className="form-group">
                            <label className="required">Item Category</label>
                            <input disabled
                                className={formErrors?.itemCategory ? "invalid-input" : ""}
                                type="text"
                                value={linkedItemForm.itemCategory}
                                onChange={(e) => handleChange("itemCategory", e.target.value)}
                                placeholder="Item category here..."
                            />
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label className="required">Item's Canonical Unit</label>
                            <input disabled
                                className={formErrors?.itemUnitMeasure ? "invalid-input" : ""}
                                type="number"
                                value={linkedItemForm.itemUnitMeasure || ""}
                                onChange={(e) => handleChange("itemUnitMeasure", parseFloat(e.target.value))}
                                placeholder="Canonical unit here..."
                            />
                            <p className="add-error-message"></p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Supplier Unit Measure */}
                        <div className="form-group">
                            <label className="required">Supplier's Unit Measure</label>
                            <SearchableDropdown
                                options={unitMeasureOptions}
                                value={linkedItemForm.supplierUnitMeasure}
                                onChange={(selected, customValue) => {
                                    const value = selected ? selected.value : customValue || "";
                                    handleChange("supplierUnitMeasure", value);
                                }}
                                placeholder="Search unit measure..."
                                error={formErrors?.supplierUnitMeasure}
                                allowCustom={false}
                                noResultsText="No unit measure found"
                            />
                        </div>

                        {/* Conversion Factor */}
                        <div className="form-group">
                            <label className="required">Conversion Factor</label>
                            <input
                                className={formErrors?.conversionFactor ? "invalid-input" : ""}
                                type="number"
                                step={0.01}
                                min={0.01}
                                value={linkedItemForm.conversionFactor || ""}
                                onChange={(e) => handleChange("conversionFactor", Number(e.target.value))}
                                placeholder="Enter conversion factor here..."
                            />
                            <p className="add-error-message">{formErrors?.conversionFactor}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Unit Price */}
                        <div className="form-group">
                            <label className="required">Unit Price (per supplier unit)</label>
                            <input
                                className={formErrors?.unitPrice ? "invalid-input" : ""}
                                type="number"
                                step={0.01}
                                min={0.01}
                                value={linkedItemForm.unitPrice || ""}
                                onChange={(e) => handleChange("unitPrice", Number(e.target.value))}
                                placeholder="Enter unit price here..."
                            />
                            <p className="add-error-message">{formErrors?.unitPrice}</p>
                        </div>

                        {/* Delivery Time */}
                        <div className="form-group">
                            <label>Average Delivery Time</label>
                            <input
                                className={formErrors?.deliveryTime ? "invalid-input" : ""}
                                type="text"
                                value={linkedItemForm.deliveryTime}
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
                            value={linkedItemForm.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            placeholder="Enter additional notes here..."
                        />
                        <p className="add-error-message"></p>
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
