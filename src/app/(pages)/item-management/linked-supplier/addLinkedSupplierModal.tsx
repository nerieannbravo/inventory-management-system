import React, { useState, useEffect } from "react";

import {
    showSupplierSaveConfirmation, showSupplierSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";
import { getSuppliers } from "@/app/lib/api";

import "@/styles/forms.css";

export interface LinkedSupplierForm {
    supplierId?: string;
    linkedSupplierName: string;
    supplierUnitMeasureId: number;
    supplierUnitName?: string;
    conversionFactor: number;
    unitPrice: number;
    averageDeliveryTime: string;
    notes: string;
    supplier?: any; // Full supplier object with status
}

interface FormError {
    [key: string]: string;
}

interface AddLinkedSupplierModalProps {
    existingLinkedSuppliers?: any[];
    onClose: () => void;
    onSave: (linkedSupplierForm: LinkedSupplierForm) => void;
}

export default function AddLinkedSupplierModal({ existingLinkedSuppliers = [], onClose, onSave }: AddLinkedSupplierModalProps) {
    const [linkedSupplierForm, setLinkedSupplierForm] = useState<LinkedSupplierForm>({
        supplierId: "",
        linkedSupplierName: "",
        supplierUnitMeasureId: 0,
        supplierUnitName: "",
        conversionFactor: 1,
        unitPrice: 0,
        averageDeliveryTime: "",
        notes: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null); // Store full supplier object
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);
    const [unitMeasures, setUnitMeasures] = useState<any[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(true);

    // Search states for searchable dropdowns
    const [supplierSearchTerm, setSupplierSearchTerm] = useState<string>("");
    const [unitSearchTerm, setUnitSearchTerm] = useState<string>("");
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    // Fetch suppliers from API (only ACTIVE and FLAGGED)
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                setLoadingSuppliers(true);
                const data = await getSuppliers();
                if (data.success) {
                    // Filter to only include ACTIVE and FLAGGED suppliers
                    const activeSuppliers = (data.suppliers || []).filter(
                        (s: any) => s.status === 'ACTIVE' || s.status === 'FLAGGED'
                    );
                    setSuppliers(activeSuppliers);
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

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [linkedSupplierForm]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.searchable-dropdown')) {
                setShowSupplierDropdown(false);
                setShowUnitDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter and sort functions for searchable dropdowns
    const getFilteredSuppliers = () => {
        // Get IDs of already linked suppliers
        const linkedSupplierIds = new Set(
            existingLinkedSuppliers.map((ls: any) => ls.supplierId)
        );

        return suppliers
            .filter(supplier => 
                // Filter by search term
                supplier.supplierName.toLowerCase().includes(supplierSearchTerm.toLowerCase()) &&
                // Exclude already linked suppliers
                !linkedSupplierIds.has(supplier.supplierId)
            )
            .sort((a, b) => a.supplierName.localeCompare(b.supplierName));
    };

    const getFilteredUnits = () => {
        return unitMeasures
            .filter(unit => 
                unit.unitName.toLowerCase().includes(unitSearchTerm.toLowerCase()) ||
                unit.abbreviation?.toLowerCase().includes(unitSearchTerm.toLowerCase())
            )
            .sort((a, b) => a.unitName.localeCompare(b.unitName));
    };

    const handleSupplierSelect = (supplier: any) => {
        setLinkedSupplierForm(prev => ({
            ...prev,
            linkedSupplierName: supplier.supplierName,
            supplierId: supplier.supplierId
        }));
        setSelectedSupplier(supplier); // Store full supplier object with status
        setSupplierSearchTerm(supplier.supplierName);
        setShowSupplierDropdown(false);
        
        // Clear error if exists
        if (formErrors.linkedSupplierName) {
            const newErrors = { ...formErrors };
            delete newErrors.linkedSupplierName;
            setFormErrors(newErrors);
        }
    };

    const handleUnitSelect = (unit: any) => {
        setLinkedSupplierForm(prev => ({
            ...prev,
            supplierUnitMeasureId: unit.id,
            supplierUnitName: unit.abbreviation || unit.unitName || ""
        }));
        setUnitSearchTerm(unit.abbreviation || unit.unitName);
        setShowUnitDropdown(false);
        
        // Clear error if exists
        if (formErrors.supplierUnitMeasureId) {
            const newErrors = { ...formErrors };
            delete newErrors.supplierUnitMeasureId;
            setFormErrors(newErrors);
        }
    };

    const handleChange = (field: string, value: any) => {
        setLinkedSupplierForm((prev) => ({ ...prev, [field]: value }));

        // When supplier is selected, also store the supplierId
        if (field === "linkedSupplierName") {
            const selected = suppliers.find(s => s.supplierName === value);
            if (selected) {
                setLinkedSupplierForm((prev) => ({ ...prev, supplierId: selected.supplierId }));
            }
        }

        // When supplier unit is selected, update the supplier unit name
        if (field === "supplierUnitMeasureId") {
            const selected = unitMeasures.find(u => u.id === parseInt(value));
            if (selected) {
                setLinkedSupplierForm((prev) => ({
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

        if (!linkedSupplierForm.linkedSupplierName) errors.linkedSupplierName = "Supplier name is required";
        if (!linkedSupplierForm.supplierUnitMeasureId || linkedSupplierForm.supplierUnitMeasureId === 0) {
            errors.supplierUnitMeasureId = "Supplier unit measure is required";
        }
        if (linkedSupplierForm.conversionFactor <= 0) {
            errors.conversionFactor = "Conversion factor must be greater than zero";
        }
        if (linkedSupplierForm.unitPrice <= 0) errors.unitPrice = "Unit price must be greater than 0";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showSupplierSaveConfirmation();
        if (result.isConfirmed) {
            onSave({ ...linkedSupplierForm, supplier: selectedSupplier });
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
                        <div className="searchable-dropdown">
                            <input
                                type="text"
                                className={formErrors?.linkedSupplierName ? "invalid-input" : ""}
                                value={supplierSearchTerm}
                                onChange={(e) => {
                                    setSupplierSearchTerm(e.target.value);
                                    setShowSupplierDropdown(true);
                                }}
                                onFocus={() => setShowSupplierDropdown(true)}
                                placeholder={loadingSuppliers ? "Loading suppliers..." : "Search supplier name..."}
                                disabled={loadingSuppliers}
                            />
                            {showSupplierDropdown && !loadingSuppliers && (
                                <div className="dropdown-list">
                                    {getFilteredSuppliers().length > 0 ? (
                                        getFilteredSuppliers().map((supplier) => (
                                            <div
                                                key={supplier.id}
                                                className="dropdown-item"
                                                onClick={() => handleSupplierSelect(supplier)}
                                            >
                                                {supplier.supplierName}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="dropdown-item disabled">
                                            No suppliers found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="add-error-message">{formErrors?.linkedSupplierName}</p>
                    </div>

                    <div className="form-row">
                        {/* Supplier Unit Measure */}
                        <div className="form-group">
                            <label>Supplier Unit Measure <span className="required">*</span></label>
                            <div className="searchable-dropdown">
                                <input
                                    type="text"
                                    className={formErrors?.supplierUnitMeasureId ? "invalid-input" : ""}
                                    value={unitSearchTerm}
                                    onChange={(e) => {
                                        setUnitSearchTerm(e.target.value);
                                        setShowUnitDropdown(true);
                                    }}
                                    onFocus={() => setShowUnitDropdown(true)}
                                    placeholder={loadingUnits ? "Loading units..." : "Search unit measure..."}
                                    disabled={loadingUnits}
                                />
                                {showUnitDropdown && !loadingUnits && (
                                    <div className="dropdown-list">
                                        {getFilteredUnits().length > 0 ? (
                                            getFilteredUnits().map((unit) => (
                                                <div
                                                    key={unit.id}
                                                    className="dropdown-item"
                                                    onClick={() => handleUnitSelect(unit)}
                                                >
                                                    {unit.abbreviation} - {unit.unitName}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="dropdown-item disabled">
                                                No units found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="add-error-message">{formErrors?.supplierUnitMeasureId}</p>
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
                                value={linkedSupplierForm.conversionFactor || ""}
                                onChange={(e) => handleChange("conversionFactor", parseFloat(e.target.value) || 1)}
                                placeholder="e.g., 1"
                            />
                            <p className="add-error-message">{formErrors?.conversionFactor}</p>
                            <p className="field-hint">
                                How many canonical units equal 1 supplier unit
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
                                value={linkedSupplierForm.unitPrice || ""}
                                onChange={(e) => handleChange("unitPrice", parseFloat(e.target.value) || 0)}
                                placeholder="Enter unit price..."
                            />
                            <p className="add-error-message">{formErrors?.unitPrice}</p>
                            {linkedSupplierForm.unitPrice > 0 && (
                                <p className="field-hint">₱{linkedSupplierForm.unitPrice.toFixed(2)} per {linkedSupplierForm.supplierUnitName}</p>
                            )}
                        </div>

                        {/* Average Delivery Time */}
                        <div className="form-group">
                            <label>Average Delivery Time</label>
                            <input
                                type="text"
                                value={linkedSupplierForm.averageDeliveryTime}
                                onChange={(e) => handleChange("averageDeliveryTime", e.target.value)}
                                placeholder="e.g., 3-5 days"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={linkedSupplierForm.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            placeholder="Additional notes..."
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
