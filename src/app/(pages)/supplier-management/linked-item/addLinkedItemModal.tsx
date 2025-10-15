import React, { useState, useEffect } from "react";

import {
    showItemSaveConfirmation, showItemSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";
import { getItems } from "@/app/lib/api";

import "@/styles/forms.css";

export interface LinkedItemForm {
    linkedItemName: string;
    itemCategory: string;
    itemUnit: string;
    unitPrice: number;
    // optional normalized fields
    itemId?: string;
    averageDeliveryTime?: string | null;
    notes?: string | null;
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

    // enhance initial state with optional props
    useEffect(() => {
        setLinkedItemForm(prev => ({ ...prev, itemId: prev.itemId ?? undefined, averageDeliveryTime: prev.averageDeliveryTime ?? null, notes: prev.notes ?? null }));
    }, []);

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);

    // Fetch items from API
    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoadingItems(true);
                const data = await getItems();
                if (data.success) {
                    setItems(data.items || []);
                }
            } catch (err) {
                console.error('Error fetching items:', err);
            } finally {
                setLoadingItems(false);
            }
        };
        fetchItems();
    }, []);

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [linkedItemForm]);

    const handleChange = (field: string, value: any) => {
        setLinkedItemForm((prev) => ({ ...prev, [field]: value }));

        // When item is selected, populate related fields from API data
        if (field === "linkedItemName") {
            const selected = items.find(i => i.itemName === value);
            if (selected) {
                setLinkedItemForm(prev => ({
                    ...prev,
                    itemId: selected.itemId,
                    itemCategory: selected.category?.categoryName || "",
                    itemUnit: selected.unitMeasure || ""
                }));
            }
        }

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
            </div>

            <div className="modal-content add">
                <form className="add-form">
                    {/* Linked Item Name */}
                    <div className="form-group">
                        <label>Item Name</label>
                        <select
                            className={formErrors?.linkedItemName ? "invalid-input" : ""}
                            value={linkedItemForm.linkedItemName}
                            onChange={(e) => handleChange("linkedItemName", e.target.value)}
                            disabled={loadingItems}
                        >
                            <option value="" disabled>
                                {loadingItems ? "Loading items..." : "Select item name..."}
                            </option>
                            {items.map((item) => (
                                <option key={item.id} value={item.itemName}>
                                    {item.itemName}
                                </option>
                            ))}
                        </select>
                        <p className="add-error-message">{formErrors?.linkedItemName}</p>
                    </div>

                    <div className="form-row">
                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <input
                                className={formErrors?.itemUnit ? "invalid-input" : ""}
                                type="text"
                                value={linkedItemForm.itemUnit}
                                onChange={(e) => handleChange("itemUnit", e.target.value)}
                                placeholder="Enter unit measure here..."
                                disabled
                            />
                            <p className="add-error-message">{formErrors?.itemUnit}</p>
                        </div>

                        {/* Unit Price */}
                        <div className="form-group">
                            <label>Unit Price</label>
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
                            <label>Item Category</label>
                            <input
                                className={formErrors?.itemCategory ? "invalid-input" : ""}
                                type="text"
                                value={linkedItemForm.itemCategory}
                                onChange={(e) => handleChange("itemCategory", e.target.value)}
                                placeholder="Category"
                                disabled
                            />
                            <p className="add-error-message">{formErrors?.itemCategory}</p>
                        </div>
                        {/* External ItemId (optional) */}
                        <div className="form-group">
                            <label>Item ID (optional)</label>
                            <input
                                type="text"
                                value={linkedItemForm.itemId || ""}
                                onChange={(e) => handleChange("itemId", e.target.value)}
                                placeholder="External item identifier (e.g., ITEM-001)"
                            />
                        </div>

                        {/* Avg Delivery Time */}
                        <div className="form-group">
                            <label>Average Delivery Time (optional)</label>
                            <input
                                type="text"
                                value={linkedItemForm.averageDeliveryTime ?? ""}
                                onChange={(e) => handleChange("averageDeliveryTime", e.target.value)}
                                placeholder="e.g., 3 days"
                            />
                        </div>

                        {/* Notes */}
                        <div className="form-group">
                            <label>Notes (optional)</label>
                            <input
                                type="text"
                                value={linkedItemForm.notes ?? ""}
                                onChange={(e) => handleChange("notes", e.target.value)}
                                placeholder="Notes about this supplier-item relation"
                            />
                        </div>
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
