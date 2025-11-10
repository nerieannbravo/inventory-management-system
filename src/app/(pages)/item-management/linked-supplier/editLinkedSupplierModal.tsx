import React, { useState, useEffect } from "react";

import {
    showSupplierUpdateConfirmation, showSupplierUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

 interface EditLinkedSupplierModalProps {
    item: {
        id: number;
        linkedSupplierName: string;
        unit : { unit_id: number; abbreviation: string; unit_name: string };
        unitPrice: number;
        deliveryTime: string;
        notes: string;
    };
    // the numeric id of the parent Item (items.id) so we can identify the supplier-item composite
    itemId?: number;
    onSave: (updatedItem: { id: number; linkedSupplierName: string; unitId?: number; unitPrice: number; deliveryTime: string; notes: string; unitAbbrev?: string }) => void;
    onClose: () => void;
}

export default function EditLinkedSupplierModal({ item, itemId, onSave, onClose }: EditLinkedSupplierModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        linkedSupplierName: item.linkedSupplierName,
        unitId: item.unit.unit_id,
        unitPrice: item.unitPrice,
        deliveryTime: item.deliveryTime,
        notes: item.notes
    });

    // State to track if form is dirty (has changes)
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [originalData] = useState({ ...formData });

    // Add formErrors state
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [units, setUnits] = useState<Array<{ id: number; unit_name: string; abbreviation: string }>>([]);
    const [listsLoading, setListsLoading] = useState(true);
    const [listsError, setListsError] = useState<string | null>(null);
    

    // Check if form data has changed from original
    useEffect(() => {
        const hasChanges = JSON.stringify(originalData) !== JSON.stringify(formData);
        setIsFormDirty(hasChanges);
    }, [formData, originalData]);

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Validate inputs
        if (!formData.linkedSupplierName) errors.linkedSupplierName = "Supplier name is required";
        if (formData.unitPrice <= 0) errors.unitPrice = "Unit price must be greater than 0";
        if (!formData.deliveryTime) errors.deliveryTime = "Delivery time is required";
        if (units.length > 0 && !formData.unitId) errors.unitId = 'Unit is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showSupplierUpdateConfirmation(formData.linkedSupplierName);
        if (result.isConfirmed) {
            // If parent itemId is not provided (e.g. Add Item modal), do a local save only
            if (!itemId) {
                onSave({ ...formData, unitAbbrev: selectedUnit ? selectedUnit.abbreviation : '' });
                await showSupplierUpdatedSuccess();
                return;
            }

            // Call PATCH API to update supplier-item
            try {
                setSubmitting(true);
                const res = await fetch('/api/supplier-items', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        supplier_id: formData.id,
                        item_id: itemId,
                        unit_id: formData.unitId,
                        unit_price: formData.unitPrice,
                        delivery_time: formData.deliveryTime,
                        note: formData.notes
                    })
                });

                const body = await res.json().catch(() => ({}));
                if (!res.ok) {
                    const msg = body?.error ?? `Failed to update supplier (${res.status})`;
                    alert(String(msg));
                    return;
                }

                // include unit abbreviation so parent/table can display authoritative unit info
                onSave({ ...formData, unitAbbrev: selectedUnit ? selectedUnit.abbreviation : '' });
                await showSupplierUpdatedSuccess();
            } catch (err) {
                console.error('Failed to update supplier-item', err);
                alert('Failed to update supplier.');
            } finally {
                setSubmitting(false);
            }
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

    // Fetch units for the unit select and to display unit abbreviation near price
    useEffect(() => {
        let mounted = true;
        const fetchUnits = async () => {
            setListsLoading(true);
            setListsError(null);
            try {
                const res = await fetch('/api/units');
                const body = await res.json().catch(() => ({}));
                if (res.ok && body?.units) {
                    if (mounted) setUnits(body.units);
                } else {
                    if (mounted) setListsError('Failed to load units');
                }
            } catch (err) {
                console.error('Failed to fetch units', err);
                if (mounted) setListsError('Failed to load units');
            } finally {
                if (mounted) setListsLoading(false);
            }
        };

        fetchUnits();
        return () => { mounted = false; };
    }, []);

    const selectedUnit = units.find(u => u.id === Number(formData.unitId));

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
                        <input disabled
                            className={formErrors?.linkedSupplierName ? "invalid-input" : ""}
                            type="text"
                            value={formData.linkedSupplierName}
                            onChange={(e) => handleChange("linkedSupplierName", e.target.value)}
                            placeholder="Enter supplier name here..."
                        />
                        <p className="edit-error-message">{formErrors?.linkedSupplierName}</p>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Unit</label>
                            <select
                                className={formErrors?.unitId ? "invalid-input" : ""}
                                value={formData.unitId ?? ''}
                                onChange={(e) => handleChange('unitId', e.target.value)}
                                disabled={listsLoading}
                            >
                                <option value="" disabled>Select unit...</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>{u.unit_name} ({u.abbreviation})</option>
                                ))}
                            </select>
                            <p className="edit-error-message">{formErrors?.unitId || listsError}</p>
                        </div>

                        {/* Unit Price */}
                        <div className="form-group">
                            <label>Unit Price</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                    className={formErrors?.unitPrice ? "invalid-input" : ""}
                                    type="number"
                                    value={formData.unitPrice || ""}
                                    onChange={(e) => handleChange("unitPrice", Number(e.target.value))}
                                    placeholder="Enter unit price here..."
                                />
                            </div>
                            <p className="edit-error-message">{formErrors?.unitPrice}</p>
                        </div>

                        {/* Delivery Time */}
                        <div className="form-group">
                            <label>Delivery Time</label>
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
                <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={!isFormDirty || submitting}>
                    <i className="ri-save-3-line" /> Update
                </button>
            </div>

        </>
    );
}