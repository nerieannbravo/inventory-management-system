import React, { useState, useEffect } from "react";

import SearchableDropdown from "@/components/searchableDropdown";

import {
    showSupplierSaveConfirmation, showSupplierSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

export interface LinkedSupplierForm {
    linkedSupplierName: string;
    supplierUnitMeasure: string;
    conversionFactor: number;
    unitPrice: number;
    deliveryTime: string;
    supplierStatus: string;
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
        supplierUnitMeasure: "",
        conversionFactor: 0,
        unitPrice: 0,
        deliveryTime: "",
        supplierStatus: "",
        notes: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

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
        if (!linkedSupplierForm.supplierUnitMeasure) errors.supplierUnitMeasure = "Supplier unit measure is required";
        if (!linkedSupplierForm.conversionFactor) errors.conversionFactor = "Conversion factor is required";
        if (!linkedSupplierForm.unitPrice) {
            errors.unitPrice = "Unit price is required";
        } else if (linkedSupplierForm.unitPrice <= 0) {
            errors.unitPrice = "Unit price must be greater than 0";
        }
        // if (!linkedSupplierForm.deliveryTime) errors.deliveryTime = "Delivery time is required";

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

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            <div className="modal-content add">
                <form className="add-form">
                    {/* Linked Supplier Name */}
                    <div className="form-group">
                        <label className="required">Supplier Name</label>
                        <SearchableDropdown
                            options={supplierOptions}
                            value={linkedSupplierForm.linkedSupplierName}
                            onChange={(selected, customValue) => {
                                const value = selected ? selected.value : customValue || "";
                                handleChange("linkedSupplierName", value);
                            }}
                            placeholder="Search supplier..."
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
                                value={linkedSupplierForm.supplierUnitMeasure}
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
                                value={linkedSupplierForm.conversionFactor || ""}
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
                                value={linkedSupplierForm.unitPrice || ""}
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
                <button type="submit" className="submit-btn" onClick={handleSubmit}>
                    <i className="ri-save-3-line" /> Save
                </button>
            </div>
        </>
    );
}