import React, { useState, useEffect } from "react";

import {
    showSupplierUpdateConfirmation, showSupplierUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";
import { getSuppliers } from "@/app/lib/api";

import "@/styles/forms.css";

interface EditLinkedSupplierModalProps {
    item: {
        id: number;
        supplierId: number;
        supplier?: {
            supplierId: string;
            supplierName: string;
        };
        linkedSupplierName?: string;
        supplierUnitMeasureId: number;
        supplierUnitName?: string;
        conversionFactor: number;
        unitPrice: number;
        averageDeliveryTime?: string;
        deliveryTime?: string;
        isPreferred: boolean;
        notes?: string;
    };
    itemCategory?: string;
    itemUnitMeasure?: string;
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

export default function EditLinkedSupplierModal({ item, itemCategory, itemUnitMeasure, onSave, onClose }: EditLinkedSupplierModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        supplierId: item.supplierId,
        linkedSupplierName: item.supplier?.supplierName || item.linkedSupplierName || "",
        supplierUnitMeasureId: item.supplierUnitMeasureId,
        supplierUnitName: item.supplierUnitName || "",
        conversionFactor: item.conversionFactor || 1,
        unitPrice: item.unitPrice,
        averageDeliveryTime: item.averageDeliveryTime || item.deliveryTime || "",
        isPreferred: item.isPreferred ?? false,
        notes: item.notes || ""
    });

    // State to track if form is dirty (has changes)
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [originalData] = useState({ ...formData });

    // Add formErrors state
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch suppliers
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);
    const [unitMeasures, setUnitMeasures] = useState<any[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(true);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                setLoadingSuppliers(true);
                const data = await getSuppliers();
                if (data.success) {
                    setSuppliers(data.suppliers || []);
                }
            } catch (err) {
                console.error('Error fetching suppliers:', err);
            } finally {
                setLoadingSuppliers(false);
            }
        };
        fetchSuppliers();
    }, []);

    // Fetch unit measures
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

        // When supplier is selected, also store the supplierId
        if (field === "linkedSupplierName") {
            const selected = suppliers.find(s => s.supplierName === value);
            if (selected) {
                setFormData(prev => ({ ...prev, supplierId: selected.supplierId }));
            }
        }

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
        if (!formData.linkedSupplierName) errors.linkedSupplierName = "Supplier name is required";
        if (!formData.supplierUnitMeasureId || formData.supplierUnitMeasureId === 0) {
            errors.supplierUnitMeasureId = "Supplier unit measure is required";
        }
        if (formData.conversionFactor <= 0) {
            errors.conversionFactor = "Conversion factor must be greater than zero";
        }
        if (formData.unitPrice <= 0) errors.unitPrice = "Unit price must be greater than 0";

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
                        <select
                            className={formErrors?.linkedSupplierName ? "invalid-input" : ""}
                            value={formData.linkedSupplierName}
                            onChange={(e) => handleChange("linkedSupplierName", e.target.value)}
                            disabled={loadingSuppliers}
                        >
                            <option value="" disabled>
                                {loadingSuppliers ? "Loading suppliers..." : "Select supplier name..."}
                            </option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.supplierName}>
                                    {supplier.supplierName}
                                </option>
                            ))}
                        </select>
                        <p className="edit-error-message">{formErrors?.linkedSupplierName}</p>
                    </div>

                    <div className="form-row">
                        {/* Supplier Unit Measure */}
                        <div className="form-group">
                            <label>Supplier Unit Measure <span className="required">*</span></label>
                            <select
                                className={formErrors?.supplierUnitMeasureId ? "invalid-input" : ""}
                                value={formData.supplierUnitMeasureId || ""}
                                onChange={(e) => handleChange("supplierUnitMeasureId", parseInt(e.target.value))}
                                disabled={loadingUnits}
                            >
                                <option value="" disabled>
                                    {loadingUnits ? "Loading units..." : "Select unit measure..."}
                                </option>
                                {unitMeasures.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.abbreviation || unit.unitName}
                                    </option>
                                ))}
                            </select>
                            <p className="edit-error-message">{formErrors?.supplierUnitMeasureId}</p>
                            <p className="field-hint">The unit measure used by this supplier</p>
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
                                1 {formData.supplierUnitName} = {formData.conversionFactor} {itemUnitMeasure}
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

                    {/* Is Preferred */}
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.isPreferred}
                                onChange={(e) => handleChange("isPreferred", e.target.checked)}
                            />
                            <span>Mark as Preferred Supplier for this Item</span>
                        </label>
                        <p className="field-hint">Designate this supplier as the preferred source for this item</p>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={formData.notes ?? ""}
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