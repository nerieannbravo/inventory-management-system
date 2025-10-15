import React, { useState, useEffect } from "react";

import {
    showItemUpdateConfirmation, showItemUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";
import { getItems } from "@/app/lib/api";

import "@/styles/forms.css";

interface EditLinkedItemModalProps {
    item: {
        id: number;
        itemId: string;
        itemName: string;
        itemCategory: string;
        canonicalUnit: string;
        canonicalUnitId: number;
        supplierUnitMeasureId: number;
        supplierUnitName: string;
        conversionFactor: number;
        unitPrice: number;
        averageDeliveryTime?: string | null;
        notes?: string | null;
    };
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

export default function EditLinkedItemModal({ item, onSave, onClose }: EditLinkedItemModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        itemId: item.itemId,
        itemName: item.itemName,
        itemCategory: item.itemCategory,
        canonicalUnit: item.canonicalUnit,
        canonicalUnitId: item.canonicalUnitId,
        supplierUnitMeasureId: item.supplierUnitMeasureId,
        supplierUnitName: item.supplierUnitName,
        conversionFactor: item.conversionFactor,
        unitPrice: item.unitPrice,
        averageDeliveryTime: item.averageDeliveryTime ?? null,
        notes: item.notes ?? null
    });

    // State to track if form is dirty (has changes)
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [originalData] = useState({ ...formData });

    // Add formErrors state
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch unit measures
    const [unitMeasures, setUnitMeasures] = useState<any[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(true);

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

        // When supplier unit is selected, update the supplier unit name
        if (field === "supplierUnitMeasureId") {
            const selected = unitMeasures.find(u => u.id === parseInt(value));
            if (selected) {
                setFormData(prev => ({
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
        const errors: Record<string, string> = {};

        // Validate inputs
        if (!formData.itemName) errors.itemName = "Item name is required";
        if (!formData.supplierUnitMeasureId || formData.supplierUnitMeasureId === 0) {
            errors.supplierUnitMeasureId = "Supplier unit measure is required";
        }
        if (formData.conversionFactor <= 0) {
            errors.conversionFactor = "Conversion factor must be greater than zero";
        }
        if (formData.unitPrice <= 0) errors.unitPrice = "Unit price must be greater than zero";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showItemUpdateConfirmation(formData.itemName);
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
                    {/* Item Name (Read-only) */}
                    <div className="form-group">
                        <label>Item Name</label>
                        <input
                            type="text"
                            value={formData.itemName}
                            disabled
                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                        <p className="field-hint">Item cannot be changed. Delete and re-add if needed.</p>
                    </div>

                    <div className="form-row">
                        {/* Item Category (Read-only) */}
                        <div className="form-group">
                            <label>Item Category</label>
                            <input
                                type="text"
                                value={formData.itemCategory}
                                disabled
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                        </div>

                        {/* Canonical Unit (Read-only) */}
                        <div className="form-group">
                            <label>Item's Canonical Unit</label>
                            <input
                                type="text"
                                value={formData.canonicalUnit}
                                disabled
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                            <p className="field-hint">Standard inventory unit</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Supplier Unit Measure */}
                        <div className="form-group">
                            <label>Supplier's Unit Measure <span className="required">*</span></label>
                            <select
                                className={formErrors?.supplierUnitMeasureId ? "invalid-input" : ""}
                                value={formData.supplierUnitMeasureId || ""}
                                onChange={(e) => handleChange("supplierUnitMeasureId", e.target.value)}
                                disabled={loadingUnits}
                            >
                                <option value="" disabled>
                                    {loadingUnits ? "Loading units..." : "Select supplier unit..."}
                                </option>
                                {unitMeasures.map((unit: any) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.unitName} ({unit.abbreviation})
                                    </option>
                                ))}
                            </select>
                            <p className="edit-error-message">{formErrors?.supplierUnitMeasureId}</p>
                        </div>

                        {/* Conversion Factor */}
                        <div className="form-group">
                            <label>Conversion Factor <span className="required">*</span></label>
                            <input
                                className={formErrors?.conversionFactor ? "invalid-input" : ""}
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={formData.conversionFactor || ""}
                                onChange={(e) => handleChange("conversionFactor", parseFloat(e.target.value) || 1)}
                                placeholder="e.g., 1"
                            />
                            <p className="edit-error-message">{formErrors?.conversionFactor}</p>
                            <p className="field-hint">
                                1 {formData.supplierUnitName} = {formData.conversionFactor} {formData.canonicalUnit}
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
                                value={formData.unitPrice || ""}
                                onChange={(e) => handleChange("unitPrice", parseFloat(e.target.value) || 0)}
                                placeholder="Enter unit price..."
                            />
                            <p className="edit-error-message">{formErrors?.unitPrice}</p>
                            {formData.unitPrice > 0 && (
                                <p className="field-hint">₱{formData.unitPrice.toFixed(2)} per {formData.supplierUnitName}</p>
                            )}
                        </div>

                        {/* Average Delivery Time */}
                        <div className="form-group">
                            <label>Average Delivery Time</label>
                            <input
                                type="text"
                                value={formData.averageDeliveryTime ?? ""}
                                onChange={(e) => handleChange("averageDeliveryTime", e.target.value)}
                                placeholder="e.g., 3-5 days"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={formData.notes ?? ""}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            placeholder="Additional notes..."
                            rows={3}
                        />
                    </div>

                    {/* Hidden field to preserve itemId */}
                    <input type="hidden" value={formData.itemId} />
                </form>
            </div>

            <div className="modal-actions">
                <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={!isFormDirty}>
                    <i className="ri-save-3-line" /> Update
                </button>
            </div>

        </>
    );
}