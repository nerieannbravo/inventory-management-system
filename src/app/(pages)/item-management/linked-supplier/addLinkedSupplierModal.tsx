"use client";
import React, { useState, useEffect } from "react";

import {
    showSupplierSaveConfirmation, showSupplierSavedSuccess,
    showCloseWithoutSavingConfirmation, showRestoreDeletedSupplierConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

export interface LinkedSupplierForm {
    linkedSupplierName: string;
    unitPrice: number;
    deliveryTime: string;
    notes: string;
    // optional ids for backend persistence
    supplierId?: number;
    unitId?: number;
}

interface FormError {
    [key: string]: string;
}

interface AddLinkedSupplierModalProps {
    onClose: () => void;
    onSave: (linkedSupplierForm: LinkedSupplierForm) => void;
    // optional: when provided, modal will persist the linked supplier to that item id
    itemId?: number | string;
}

export default function AddLinkedSupplierModal({ onClose, onSave, itemId }: AddLinkedSupplierModalProps) {
    const [linkedSupplierForm, setLinkedSupplierForm] = useState<LinkedSupplierForm>({
        linkedSupplierName: "",
        unitPrice: 0,
        deliveryTime: "",
        notes: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);
    const [suppliers, setSuppliers] = useState<Array<{ id: number; supplier_id: string; supplier_name: string }>>([]);
    const [units, setUnits] = useState<Array<{ id: number; unit_name: string; abbreviation: string }>>([]);
    const [listsLoading, setListsLoading] = useState(false);

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [linkedSupplierForm]);

    // fetch supplier and unit lists for selects (extract so we can refresh)
    useEffect(() => { fetchLists(); }, []);

    async function fetchLists() {
        let mounted = true;
        setListsLoading(true);
        try {
            // If itemId is provided, also fetch existing supplier-links for this item so we can exclude already-linked suppliers
            const requests = [fetch('/api/suppliers'), fetch('/api/units')];
            if (itemId) requests.push(fetch(`/api/supplier-items?item_id=${encodeURIComponent(String(itemId))}`));

            const [sRes, uRes, siRes] = await Promise.all(requests as Promise<Response>[]);
            const sBody = await sRes.json().catch(() => ({}));
            const uBody = await uRes.json().catch(() => ({}));
            const siBody = siRes ? await siRes.json().catch(() => ({})) : null;
            if (!mounted) return;
            console.debug('suppliers fetch', { ok: sRes.ok, body: sBody });
            console.debug('units fetch', { ok: uRes.ok, body: uBody });

            // Suppliers: accept multiple shapes
            let supplierList: Array<{ id: number; supplier_id?: string; supplier_name?: string }> = [];
            if (Array.isArray(sBody.suppliers)) supplierList = sBody.suppliers;
            else if (Array.isArray(sBody.data)) supplierList = sBody.data;
            else if (Array.isArray(sBody)) supplierList = sBody;

            // If we fetched supplier-items for this item, build a set of supplier ids that are already linked and not deleted
            const alreadyLinkedSupplierIds = new Set<number>();
            if (siBody && Array.isArray(siBody.data)) {
                for (const si of siBody.data) {
                    // si may include supplier object or supplier_id value
                    if (si && !si.isdeleted) {
                        const sup = si.supplier ?? null;
                        const supId = sup?.id ?? (si.supplier_id ?? si.supplierId ?? null);
                        if (supId) alreadyLinkedSupplierIds.add(Number(supId));
                    }
                }
            }

            // Filter out already-linked suppliers (only when not deleted)
            if (supplierList.length > 0) {
                const filtered = supplierList.filter(s => !alreadyLinkedSupplierIds.has(Number(s.id)));
                setSuppliers(filtered as Array<{ id: number; supplier_id: string; supplier_name: string }>);
            }

            // Units: accept multiple shapes
            let unitList: Array<{ id: number; unit_name?: string; abbreviation?: string }> = [];
            if (Array.isArray(uBody.units)) unitList = uBody.units;
            else if (Array.isArray(uBody.data)) unitList = uBody.data;
            else if (Array.isArray(uBody)) unitList = uBody;
            if (unitList.length > 0) setUnits(unitList as Array<{ id: number; unit_name: string; abbreviation: string }>);
        } catch (err) {
            console.error('Failed to load supplier/unit lists', err);
        } finally {
            setListsLoading(false);
            mounted = false;
        }
    }

    const handleChange = (field: string, value: string | number | undefined) => {
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

        if (!linkedSupplierForm.linkedSupplierName) errors.linkedSupplierName = "Supplier is required";
        if (linkedSupplierForm.unitPrice <= 0) errors.unitPrice = "Unit price must be greater than 0";
        if (!linkedSupplierForm.deliveryTime) errors.deliveryTime = "Delivery time is required";

        // If units list is available, ensure a unit is chosen via unitId
        if (units.length > 0 && !linkedSupplierForm.unitId) errors.unitId = 'Unit is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showSupplierSaveConfirmation();
        if (!result.isConfirmed) return;

        // If itemId was provided, persist to backend
        if (itemId) {
            try {
                const payload: Record<string, unknown> = {
                    item_id: Number(itemId),
                    supplier_id: linkedSupplierForm.supplierId,
                    unit_id: linkedSupplierForm.unitId ?? undefined,
                    unit_price: linkedSupplierForm.unitPrice,
                    delivery_time: linkedSupplierForm.deliveryTime,
                    note: linkedSupplierForm.notes ?? undefined,
                };

                const res = await fetch('/api/supplier-items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const body = await res.json().catch(() => ({}));
                if (!res.ok) {
                    // If backend indicates a deleted existing record, offer to restore instead of failing
                    if (body?.deleted === true) {
                        const supplierName = body?.supplier?.supplier_name ?? linkedSupplierForm.linkedSupplierName ?? '';
                        const restoreResult = await showRestoreDeletedSupplierConfirmation(supplierName);
                        if (restoreResult.isConfirmed) {
                            try {
                                const restoreRes = await fetch('/api/supplier-items', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ supplier_id: body.supplier_id ?? linkedSupplierForm.supplierId, item_id: Number(itemId), restore: true }),
                                });
                                const restoreBody = await restoreRes.json().catch(() => ({}));
                                if (!restoreRes.ok) {
                                    setFormErrors({ submit: restoreBody?.error ?? `Failed to restore (status ${restoreRes.status})` });
                                    return;
                                }

                                // Normalise restored response for parent
                                const updated = restoreBody?.data ?? restoreBody;
                                onSave({
                                    id: updated?.supplier_id ?? updated?.supplier_id ?? Date.now(),
                                    linkedSupplierName: updated?.supplier?.supplier_name ?? linkedSupplierForm.linkedSupplierName,
                                    unitId: updated?.unit_id ?? linkedSupplierForm.unitId,
                                    unitAbbrev: (updated?.unit?.abbreviation) ?? (selectedUnit ? selectedUnit.abbreviation : ''),
                                    unitPrice: updated?.unit_price ?? linkedSupplierForm.unitPrice,
                                    deliveryTime: updated?.delivery_time ?? linkedSupplierForm.deliveryTime,
                                    notes: updated?.note ?? linkedSupplierForm.notes,
                                } as LinkedSupplierForm & { unitId?: number; unitAbbrev?: string });

                                await showSupplierSavedSuccess();
                                onClose();
                                return;
                            } catch (err) {
                                console.error('Failed to restore supplier-item', err);
                                setFormErrors({ submit: 'Failed to restore linked supplier' });
                                return;
                            }
                        }
                        // if user declined to restore, show message and return
                        setFormErrors({ submit: 'Operation cancelled. Supplier link exists but was deleted.' });
                        return;
                    }

                    setFormErrors({ submit: body?.error ?? `Failed to save (status ${res.status})` });
                    return;
                }

                // Normalize returned data for parent; include unit id and abbreviation so parent can display authoritative values
                onSave({
                    id: body.supplier_id ?? body.id ?? Date.now(),
                    linkedSupplierName: body.supplierName ?? linkedSupplierForm.linkedSupplierName,
                    unitId: body.unit_id ?? linkedSupplierForm.unitId,
                    unitAbbrev: body.unit?.abbreviation ?? body.unit_abbreviation ?? (selectedUnit ? selectedUnit.abbreviation : ''),
                    unitPrice: body.unit_price ?? linkedSupplierForm.unitPrice,
                    deliveryTime: body.delivery_time ?? linkedSupplierForm.deliveryTime,
                    notes: body.note ?? linkedSupplierForm.notes,
                } as LinkedSupplierForm & { unitId?: number; unitAbbrev?: string });
            } catch (err) {
                console.error('Failed to POST supplier-item', err);
                setFormErrors({ submit: 'Failed to save linked supplier' });
                return;
            }
        } else {
            // local-only mode - include unit metadata
            onSave({
                ...linkedSupplierForm,
                unitAbbrev: selectedUnit ? selectedUnit.abbreviation : undefined,
            } as LinkedSupplierForm & { unitAbbrev?: string });
        }

        await showSupplierSavedSuccess();
        onClose();
    };

    const selectedUnit = units.find(u => u.id === Number(linkedSupplierForm.unitId));

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
                        <select
                            className={formErrors?.linkedSupplierName ? "invalid-input" : ""}
                            value={linkedSupplierForm.supplierId ?? ''}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                handleChange('supplierId', Number.isNaN(id) ? undefined : id);
                                // also store name for display
                                const found = suppliers.find(s => s.id === id);
                                handleChange('linkedSupplierName', found ? found.supplier_name : '');
                            }}
                        >
                            {listsLoading ? (
                                <option value="" disabled>Loading suppliers...</option>
                            ) : suppliers.length === 0 ? (
                                <>
                                    <option value="" disabled>No suppliers found</option>
                                </>
                            ) : (
                                <>
                                    <option value="" disabled>Select supplier name...</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.supplier_name}</option>
                                    ))}
                                </>
                            )}
                        </select>
                        <p className="add-error-message">{formErrors?.linkedSupplierName}</p>
                    </div>

                    <div className="form-row">
                        {/* Unit select (if units loaded) */}
                        {units.length > 0 && (
                            <div className="form-group">
                                <label>Unit</label>
                                <select
                                    value={linkedSupplierForm.unitId ?? ''}
                                    onChange={(e) => handleChange('unitId', Number(e.target.value))}
                                >
                                    <option value="" disabled>Select unit...</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>{u.unit_name} ({u.abbreviation})</option>
                                    ))}
                                </select>
                                <p className="add-error-message">{formErrors?.unitId}</p>
                            </div>
                        )}
                        {/* Unit Price */}
                        <div className="form-group">
                            <label>Unit Price</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                    className={formErrors?.unitPrice ? "invalid-input" : ""}
                                    type="number"
                                    value={linkedSupplierForm.unitPrice || ""}
                                    onChange={(e) => handleChange("unitPrice", Number(e.target.value))}
                                    placeholder="Enter unit price here..."
                                />
                            </div>
                            <p className="add-error-message">{formErrors?.unitPrice}</p>
                        </div>

                        {/* Delivery Time */}
                        <div className="form-group">
                            <label>Delivery Time</label>
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
