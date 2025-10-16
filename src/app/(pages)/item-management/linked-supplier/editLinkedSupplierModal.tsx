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
        supplierId: item.supplier?.supplierId || "", // IMPORTANT: Must use string supplierId from supplier object (e.g., "SUP-4002")
        linkedSupplierName: item.supplier?.supplierName || item.linkedSupplierName || "",
        supplierUnitMeasureId: item.supplierUnitMeasureId,
        supplierUnitName: item.supplierUnitName || "",
        conversionFactor: item.conversionFactor || 1,
        unitPrice: item.unitPrice,
        averageDeliveryTime: item.averageDeliveryTime || item.deliveryTime || "",
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

    // Searchable dropdown states
    const [supplierSearchTerm, setSupplierSearchTerm] = useState<string>(formData.linkedSupplierName);
    const [unitSearchTerm, setUnitSearchTerm] = useState<string>("");
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

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

    // Check if form data has changed from original
    useEffect(() => {
        const hasChanges = JSON.stringify(originalData) !== JSON.stringify(formData);
        setIsFormDirty(hasChanges);
    }, [formData, originalData]);

    // Initialize unit search term when unit measures load
    useEffect(() => {
        if (unitMeasures.length > 0 && formData.supplierUnitMeasureId) {
            const unit = unitMeasures.find(u => u.id === formData.supplierUnitMeasureId);
            if (unit) {
                setUnitSearchTerm(unit.abbreviation || unit.unitName);
            }
        }
    }, [unitMeasures, formData.supplierUnitMeasureId]);

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
        return suppliers
            .filter(supplier => 
                supplier.supplierName.toLowerCase().includes(supplierSearchTerm.toLowerCase())
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
        setFormData(prev => ({
            ...prev,
            linkedSupplierName: supplier.supplierName,
            supplierId: supplier.supplierId
        }));
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
        setFormData(prev => ({
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
                        <p className="edit-error-message">{formErrors?.linkedSupplierName}</p>
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