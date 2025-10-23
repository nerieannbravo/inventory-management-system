import React, { useState, useEffect } from "react";

import SearchableDropdown from "@/components/searchableDropdown";

import {
    showSupplierUpdateConfirmation, showSupplierUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

interface EditLinkedSupplierModalProps {
    item: {
        id: number;
        linkedSupplierName: string;
        supplierUnitMeasure: string;
        conversionFactor: number;
        unitPrice: number;
        deliveryTime: string;
        supplierStatus: string;
        notes: string;
    };
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

export default function EditLinkedSupplierModal({ item, onSave, onClose }: EditLinkedSupplierModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        linkedSupplierName: item.linkedSupplierName,
        supplierUnitMeasure: item.supplierUnitMeasure,
        conversionFactor: item.conversionFactor,
        unitPrice: item.unitPrice,
        deliveryTime: item.deliveryTime,
        supplierStatus: item.supplierStatus,
        notes: item.notes
    });

    // State to track if form is dirty (has changes)
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [originalData] = useState({ ...formData });

    // Add formErrors state
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Define supplier options
    const supplierOptions = [
        { id: 1, label: "Supplier 1", value: "Supplier 1" },
        { id: 2, label: "Supplier 2", value: "Supplier 2" },
        { id: 3, label: "Supplier 3", value: "Supplier 3" },
        { id: 4, label: "Supplier 4", value: "Supplier 4" },
        { id: 5, label: "Supplier 5", value: "Supplier 5" },
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
        if (!formData.supplierUnitMeasure) errors.supplierUnitMeasure = "Supplier unit measure is required";
        if (!formData.conversionFactor) errors.conversionFactor = "Conversion factor is required";
        if (!formData.unitPrice) {
            errors.unitPrice = "Unit price is required";
        } else if (formData.unitPrice <= 0) {
            errors.unitPrice = "Unit price must be greater than 0";
        }
        // if (!formData.deliveryTime) errors.deliveryTime = "Delivery time is required";

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
                        <label className="required">Supplier Name</label>
                        <SearchableDropdown
                            options={supplierOptions}
                            value={formData.linkedSupplierName}
                            onChange={(selected, customValue) => {
                                const value = selected ? selected.value : customValue || "";
                                handleChange("linkedSupplierName", value);
                            }}
                            placeholder="Search or select supplier..."
                            error={formErrors?.linkedSupplierName}
                            allowCustom={false}
                            noResultsText="No suppliers found"
                        />
                    </div>

                    <div className="form-row">
                        {/* Supplier Unit Measure */}
                        <div className="form-group">
                            <label className="required">Supplier's Unit Measure</label>
                            <SearchableDropdown
                                options={unitMeasureOptions}
                                value={formData.supplierUnitMeasure}
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
                                value={formData.conversionFactor || ""}
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
                                value={formData.unitPrice || ""}
                                onChange={(e) => handleChange("unitPrice", Number(e.target.value))}
                                placeholder="Enter unit price here..."
                            />
                            <p className="edit-error-message">{formErrors?.unitPrice}</p>
                        </div>

                        {/* Delivery Time */}
                        <div className="form-group">
                            <label>Average Delivery Time</label>
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