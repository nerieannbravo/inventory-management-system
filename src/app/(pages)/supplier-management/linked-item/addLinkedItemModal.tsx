import React, { useState, useEffect } from "react";

import {
    showItemSaveConfirmation, showItemSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";
import { getItems } from "@/app/lib/api";

import "@/styles/forms.css";

export interface LinkedItemForm {
    itemId: string; // InventoryItem.itemId (string ID like ITEM-001)
    itemName: string;
    itemCategory: string;
    canonicalUnit: string; // Item's canonical unit (read-only)
    canonicalUnitId: number; // Item's canonical unit measure ID
    supplierUnitMeasureId: number; // Supplier's unit for this item
    supplierUnitName: string; // Supplier's unit name (display only)
    conversionFactor: number; // Multiplier: supplier unit -> canonical unit
    unitPrice: number; // Price per supplier unit
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
        itemId: "",
        itemName: "",
        itemCategory: "",
        canonicalUnit: "",
        canonicalUnitId: 0,
        supplierUnitMeasureId: 0,
        supplierUnitName: "",
        conversionFactor: 1,
        unitPrice: 0,
        averageDeliveryTime: null,
        notes: null
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [unitMeasures, setUnitMeasures] = useState<any[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [loadingUnits, setLoadingUnits] = useState(true);

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

    // Fetch unit measures from API
    useEffect(() => {
        const fetchUnitMeasures = async () => {
            try {
                setLoadingUnits(true);
                const response = await fetch('/api/unit-measure');
                const data = await response.json();
                if (data.success) {
                    setUnitMeasures(data.unitMeasures || []);
                }
            } catch (err) {
                console.error('Error fetching unit measures:', err);
            } finally {
                setLoadingUnits(false);
            }
        };
        fetchUnitMeasures();
    }, []);

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [linkedItemForm]);

    const handleChange = (field: string, value: any) => {
        setLinkedItemForm((prev) => ({ ...prev, [field]: value }));

        // When item is selected, populate related fields from API data
        if (field === "itemName") {
            const selected = items.find(i => i.itemName === value);
            if (selected) {
                // Extract unit measure information properly
                const unitMeasureName = selected.unitMeasure?.abbreviation || selected.unitMeasure?.unitName || "";
                const unitMeasureId = selected.unitMeasure?.id || selected.unitMeasureId || 0;
                
                // Extract category information properly
                const categoryName = selected.category?.categoryName || "";
                
                setLinkedItemForm(prev => ({
                    ...prev,
                    itemId: selected.itemId,
                    itemCategory: categoryName,
                    canonicalUnit: unitMeasureName,
                    canonicalUnitId: unitMeasureId,
                    // Default supplier unit to canonical unit
                    supplierUnitMeasureId: unitMeasureId,
                    supplierUnitName: unitMeasureName,
                    conversionFactor: 1
                }));
            }
        }

        // When supplier unit is selected, update the supplier unit name
        if (field === "supplierUnitMeasureId") {
            const selected = unitMeasures.find(u => u.id === parseInt(value));
            if (selected) {
                setLinkedItemForm(prev => ({
                    ...prev,
                    supplierUnitName: selected.abbreviation || selected.unitName || ""
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

        if (!linkedItemForm.itemName) errors.itemName = "Item name is required";
        if (!linkedItemForm.itemCategory) errors.itemCategory = "Item category is required";
        if (!linkedItemForm.supplierUnitMeasureId || linkedItemForm.supplierUnitMeasureId === 0) {
            errors.supplierUnitMeasureId = "Supplier unit measure is required";
        }
        if (linkedItemForm.unitPrice <= 0) errors.unitPrice = "Unit price must be greater than zero";
        if (linkedItemForm.conversionFactor <= 0) {
            errors.conversionFactor = "Conversion factor must be greater than zero";
        }

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
                    {/* Item Name */}
                    <div className="form-group">
                        <label>Item Name <span className="required">*</span></label>
                        <select
                            className={formErrors?.itemName ? "invalid-input" : ""}
                            value={linkedItemForm.itemName}
                            onChange={(e) => handleChange("itemName", e.target.value)}
                            disabled={loadingItems}
                        >
                            <option value="" disabled>
                                {loadingItems ? "Loading items..." : "Select item name..."}
                            </option>
                            {items.map((item, index) => (
                                <option key={item.id || `item-${index}`} value={item.itemName}>
                                    {item.itemName}
                                </option>
                            ))}
                        </select>
                        <p className="add-error-message">{formErrors?.itemName}</p>
                    </div>

                    <div className="form-row">
                        {/* Item Category (Read-only) */}
                        <div className="form-group">
                            <label>Item Category</label>
                            <input
                                type="text"
                                value={linkedItemForm.itemCategory}
                                placeholder="Category"
                                disabled
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                        </div>

                        {/* Canonical Unit (Read-only) */}
                        <div className="form-group">
                            <label>Item's Canonical Unit</label>
                            <input
                                type="text"
                                value={linkedItemForm.canonicalUnit}
                                placeholder="Canonical unit measure"
                                disabled
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                            <p className="field-hint">This is the standard unit for this item in inventory</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Supplier Unit Measure */}
                        <div className="form-group">
                            <label>Supplier's Unit Measure <span className="required">*</span></label>
                            <select
                                className={formErrors?.supplierUnitMeasureId ? "invalid-input" : ""}
                                value={linkedItemForm.supplierUnitMeasureId || ""}
                                onChange={(e) => handleChange("supplierUnitMeasureId", e.target.value)}
                                disabled={loadingUnits || !linkedItemForm.itemName}
                            >
                                <option value="" disabled>
                                    {loadingUnits ? "Loading units..." : "Select supplier unit..."}
                                </option>
                                {unitMeasures.map((unit, index) => (
                                    <option key={unit.id || `unit-${index}`} value={unit.id}>
                                        {unit.unitName} ({unit.abbreviation})
                                    </option>
                                ))}
                            </select>
                            <p className="add-error-message">{formErrors?.supplierUnitMeasureId}</p>
                            <p className="field-hint">Unit that supplier uses for this item</p>
                        </div>

                        {/* Conversion Factor */}
                        <div className="form-group">
                            <label>Conversion Factor <span className="required">*</span></label>
                            <input
                                className={formErrors?.conversionFactor ? "invalid-input" : ""}
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={linkedItemForm.conversionFactor || ""}
                                onChange={(e) => handleChange("conversionFactor", parseFloat(e.target.value) || 1)}
                                placeholder="e.g., 1"
                                disabled={!linkedItemForm.itemName}
                            />
                            <p className="add-error-message">{formErrors?.conversionFactor}</p>
                            <p className="field-hint">
                                {linkedItemForm.supplierUnitName && linkedItemForm.canonicalUnit
                                    ? `1 ${linkedItemForm.supplierUnitName} = ${linkedItemForm.conversionFactor} ${linkedItemForm.canonicalUnit}`
                                    : "Multiplier from supplier unit to canonical unit"}
                            </p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Unit Price */}
                        <div className="form-group">
                            <label>Unit Price (per supplier unit) <span className="required">*</span></label>
                            <input
                                className={formErrors?.unitPrice ? "invalid-input" : ""}
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={linkedItemForm.unitPrice || ""}
                                onChange={(e) => handleChange("unitPrice", parseFloat(e.target.value) || 0)}
                                placeholder="Enter unit price..."
                            />
                            <p className="add-error-message">{formErrors?.unitPrice}</p>
                            {linkedItemForm.supplierUnitName && linkedItemForm.unitPrice > 0 && (
                                <p className="field-hint">₱{linkedItemForm.unitPrice.toFixed(2)} per {linkedItemForm.supplierUnitName}</p>
                            )}
                        </div>

                        {/* Average Delivery Time */}
                        <div className="form-group">
                            <label>Average Delivery Time</label>
                            <input
                                type="text"
                                value={linkedItemForm.averageDeliveryTime ?? ""}
                                onChange={(e) => handleChange("averageDeliveryTime", e.target.value)}
                                placeholder="e.g., 3-5 days"
                            />
                            <p className="field-hint">Typical lead time from this supplier</p>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={linkedItemForm.notes ?? ""}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            placeholder="Additional notes about this supplier-item relationship..."
                            rows={3}
                        />
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
