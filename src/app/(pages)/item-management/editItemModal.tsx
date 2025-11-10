"use client";

import React, { useState, useEffect, useCallback } from "react";

import ModalManager from "@/components/modalManager";
import ActionButtons from "@/components/actionButtons";
import AddLinkedSupplierModal, { LinkedSupplierForm } from "./linked-supplier/addLinkedSupplierModal";
import EditLinkedSupplierModal from "./linked-supplier/editLinkedSupplierModal";

import {
    showItemUpdateConfirmation, showItemUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation,
    showDeleteLinkedSupplierConfirmation, showDeleteLinkedSupplierSuccess
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

type ItemFormData = {
    id: number;
    item_name: string;
    item_unit: string;
    item_category: string;
    status: string;
    description: string;
};

interface EditItemModalProps {
    item: {
        id: number;
        item_name: string,
        item_unit: string,
        item_category: string,
        status: string,
        // Additional fields would be included in a real application
    };
    onSave: (updatedItem: ItemFormData) => void;
    onClose: () => void;
}

export default function EditItemModal({ item, onSave, onClose }: EditItemModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // Linked supplier row type used by this component
    type LinkedSupplierRow = {
        id: number; // will hold supplier.id from DB
        supplier_id?: number;
        item_id?: number;
        linkedSupplierName: string;
        unitPrice: number;
        unitAbbrev?: string;
        unit: { unit_id: number; abbreviation: string; unit_name: string };
        deliveryTime: string;
        lastUpdated: string;
        notes: string;
    };

    // State for linked suppliers list (fetched from API)
    const [linkedSuppliers, setLinkedSuppliers] = useState<LinkedSupplierRow[]>([]);
    const [suppliersLoading, setSuppliersLoading] = useState(false);
    const [suppliersError, setSuppliersError] = useState<string | null>(null);

    // Initial item form state
    const [formData, setFormData] = useState<ItemFormData>({
        id: item.id,
        item_name: item.item_name,
        item_unit: item.item_unit,
        item_category: item.item_category,
        // accept either `status` or `status` from different callers
        status: (item as unknown as Record<string, unknown>).status as string ?? (item as unknown as Record<string, unknown>).status as string ?? "",
        // accept existing description if provided
        description: (item as unknown as Record<string, unknown>).description as string ?? ""
    });

    // Keep form in sync if parent updates the item prop
    useEffect(() => {
        setFormData({
            id: item.id,
            item_name: item.item_name,
            item_unit: item.item_unit,
            item_category: item.item_category,
            status: (item as unknown as Record<string, unknown>).status as string ?? (item as unknown as Record<string, unknown>).status as string ?? "",
            description: (item as unknown as Record<string, unknown>).description as string ?? ""
        });
    }, [item]);

    // State to track if form is dirty (has changes)
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [originalData] = useState({ ...formData });

    // Add formErrors state
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Check if form data has changed from original
    useEffect(() => {
        const hasChanges = JSON.stringify(originalData) !== JSON.stringify(formData);
        setIsFormDirty(hasChanges);
    }, [formData, originalData]);

    const handleChange = (field: keyof ItemFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Validate inputs
    if (!formData.item_name) errors.item_name = "Item name is required";
    if (!formData.item_unit) errors.item_unit = "Item unit is required";
    if (!formData.item_category) errors.item_category = "Item category is required";
    if (!formData.status) errors.status = "Item status is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showItemUpdateConfirmation(formData.item_name);
        if (result.isConfirmed) {
            onSave(formData);
            await showItemUpdatedSuccess();
            window.location.reload();
        }
    };

    const handleClose = async () => {
        if (!isFormDirty) {
            onClose();
            window.location.reload();
            return;
        }

        const result = await showCloseWithoutUpdatingConfirmation();
        if (result.isConfirmed) {
            onClose();
        }
    };

    // Modal management for supplier actions (add, edit, delete, etc.)
    const openModal = (mode: "add-linkedSupplier" | "edit-linkedSupplier" | "delete-linkedSupplier", rowData?: LinkedSupplierRow) => {
        let content;

        switch (mode) {
            case "add-linkedSupplier":
                content = (
                    <AddLinkedSupplierModal
                        onSave={handleAddLinkedSupplier}
                        onClose={closeModal}
                        itemId={item.id}
                    />
                );
                break;
                case "edit-linkedSupplier":
                    if (rowData) {
                        content = (
                            <EditLinkedSupplierModal
                                item={rowData}
                                itemId={item.id}
                                onSave={handleEditLinkedSupplier}
                                onClose={closeModal}
                            />
                        );
                    } else {
                        content = null;
                    }
                    break;
            case "delete-linkedSupplier":
                if (rowData) {
                    handleDeleteSupplier(rowData.id);
                }
            default:
                content = null;
        }

        setModalContent(content);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };

    // Handle add linked supplier
    const handleAddLinkedSupplier = async (linkedSupplierForm: LinkedSupplierForm & { unitAbbrev?: string; unitId?: number }) => {
        // optimistic UI so user sees immediate change
            const newSupplier: LinkedSupplierRow = {
                id: linkedSuppliers.length + 1,
                linkedSupplierName: linkedSupplierForm.linkedSupplierName,
                unitPrice: linkedSupplierForm.unitPrice,
                unitAbbrev: linkedSupplierForm.unitAbbrev ?? linkedSuppliers[0]?.unitAbbrev,
                unit: linkedSupplierForm.unitId ? { unit_id: linkedSupplierForm.unitId, abbreviation: linkedSupplierForm.unitAbbrev ?? '', unit_name: '' } : { unit_id: 0, abbreviation: '', unit_name: '' },
                deliveryTime: linkedSupplierForm.deliveryTime,
                lastUpdated: new Date().toLocaleDateString("en-US"),
                notes: linkedSupplierForm.notes
            };
        setLinkedSuppliers(prev => ([...prev, newSupplier]));
        closeModal();

        // refresh from server to get authoritative data (in case child modal performed API calls)
        try {
            await fetchLinkedSuppliers();
        } catch (err) {
            console.error('Refresh after add failed', err);
        }
    };

    // Fetch linked suppliers for this item (extract so we can re-use after add/edit/delete)
    const fetchLinkedSuppliers = useCallback(async () => {
        let mounted = true;
        interface SupplierItemResp {
            id?: number;
            // supplier include now contains id and supplier_name per API
            supplier?: { id?: number; supplier_name?: string };
            // item relation may include numeric id
            item?: { id?: number; item_id?: string; item_name?: string };
            unit?: { id?: number; abbreviation?: string; unit_name?: string };
            unit_abbreviation?: string;
            unit_price?: number;
            delivery_time?: string;
            note?: string;
            date_updated?: string;
            date_created?: string;
        }

        setSuppliersLoading(true);
        setSuppliersError(null);
        try {
            const res = await fetch(`/api/supplier-items?item_id=${item.id}`);
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = body?.error ?? `Failed to load linked suppliers (${res.status})`;
                if (mounted) setSuppliersError(String(msg));
                return;
            }

            const data = body?.data ?? [];
            const mapped = (data as SupplierItemResp[]).map((si, idx) => ({
                // use supplier.id as the row id so downstream code can treat `id` as supplier id
                id: si.supplier?.id ?? idx,
                supplier_id: si.supplier?.id ?? undefined,
                // item relation may include numeric id; fallback to parent `item.id`
                item_id: si.item?.id ?? item.id,
                linkedSupplierName: si.supplier?.supplier_name ?? 'Unknown',
                unitPrice: si.unit_price ?? 0,
                unitAbbrev: si.unit?.abbreviation ?? si.unit_abbreviation ?? '',
                unit: {
                    unit_id: si.unit?.id ?? 0,
                    abbreviation: si.unit?.abbreviation ?? si.unit_abbreviation ?? '',
                    unit_name: si.unit?.unit_name ?? ''
                },
                deliveryTime: si.delivery_time ?? '',
                lastUpdated: si.date_updated ? new Date(si.date_updated).toLocaleDateString() : (si.date_created ? new Date(si.date_created).toLocaleDateString() : ''),
                notes: si.note ?? ''
            }));

            if (mounted) setLinkedSuppliers(mapped);
        } catch (err) {
            console.error('Failed to fetch supplier-items for item', item.id, err);
            setSuppliersError('Failed to load linked suppliers.');
        } finally {
            setSuppliersLoading(false);
        }
        return () => { mounted = false; };
    }, [item.id]);

    useEffect(() => {
        // initial load
        fetchLinkedSuppliers();
    }, [fetchLinkedSuppliers]);

    // Handle edit linked supplier
    const handleEditLinkedSupplier = async (updatedSupplier: LinkedSupplierForm & { id: number }) => {
        console.log("Updating supplier:", updatedSupplier);

        // optimistic update
        setLinkedSuppliers(prevSuppliers =>
            prevSuppliers.map(supplier =>
                supplier.id === updatedSupplier.id
                    ? {
                        ...supplier,
                        linkedSupplierName: updatedSupplier.linkedSupplierName,
                        unitPrice: updatedSupplier.unitPrice,
                        deliveryTime: updatedSupplier.deliveryTime,
                        notes: updatedSupplier.notes,
                        lastUpdated: new Date().toLocaleDateString("en-US")
                    }
                    : supplier
            )
        );
        closeModal();

        // refresh authoritative data
        try {
            await fetchLinkedSuppliers();
        } catch (err) {
            console.error('Refresh after edit failed', err);
        }
    };

    // Handle delete linked supplier
    const handleDeleteSupplier = async (supplierId: number) => {
        const result = await showDeleteLinkedSupplierConfirmation();
        if (!result.isConfirmed) {
            closeModal();
            return;
        }

        try {
            const res = await fetch('/api/supplier-items', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ supplier_id: supplierId, item_id: item.id })
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = body?.error ?? `Failed to delete supplier (${res.status})`;
                alert(String(msg));
                return;
            }

            // success - refresh authoritative list
            await showDeleteLinkedSupplierSuccess();
            try {
                await fetchLinkedSuppliers();
            } catch (err) {
                console.error('Refresh after delete failed', err);
            }
        } catch (err) {
            console.error('Failed to delete supplier-item', err);
            alert('Failed to delete linked supplier.');
        } finally {
            closeModal();
        }
    };

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Edit Item</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* Edit Item Form */}
            <div className="modal-content edit">
                <form className="edit-form">
                    {/* Item Name */}
                    <div className="form-group">
                        <label>Item Name</label>
                        <input
                            className={formErrors?.item_name ? "invalid-input" : ""}
                            type="text"
                            value={formData.item_name}
                            onChange={(e) => handleChange("item_name", e.target.value)}
                            placeholder="Enter item name here..."
                        />
                        <p className="edit-error-message">{formErrors?.item_name}</p>
                    </div>

                    <div className="form-row">
                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <input disabled
                                className={formErrors?.item_unit ? "invalid-input" : ""}
                                type="text"
                                value={formData.item_unit || ""}
                                onChange={(e) => handleChange("item_unit", e.target.value)}
                                placeholder="Enter unit measure here..."
                            />
                            <p className="edit-error-message">{formErrors?.item_unit}</p>
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label>Category</label>
                            <input disabled
                                className={formErrors?.item_category ? "invalid-input" : ""}
                                type="text"
                                value={formData.item_category || ""}
                                onChange={(e) => handleChange("item_category", e.target.value)}
                                placeholder="Enter category here..."
                            />
                            <p className="edit-error-message">{formErrors?.item_category}</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                className={formErrors?.status ? "invalid-input" : ""}
                                value={formData.status || ""}
                                onChange={(e) => handleChange("status", e.target.value)}
                            >
                                <option value="" disabled>Select status...</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.itemStatus}</p>
                        </div>
                    </div>

                    {/* Item Description */}
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                                className={`order ${formErrors?.description ? "invalid-input" : ""}`}
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                placeholder="Enter item description here..."
                            >
                            </textarea>
                            <p className="edit-error-message">{formErrors?.ordReason}</p>
                    </div>
                </form >
            </div >
            <div className="modal-actions">
                <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={!isFormDirty}>
                    <i className="ri-save-3-line" /> Update
                </button>
            </div>
            <br/>
            <br/>

            {/* Linked Suppliers */}
            <div className="details-header">
                <p className="details-title">Linked Supplier/s</p>
                     <button className="modal-table-add-btn" onClick={() => openModal("add-linkedSupplier")}>
                        <i className="ri-add-line" /> Add Supplier
                    </button>
            </div>

            {/* Table */}
            <table className="modal-table">
                <thead className="modal-table-heading">
                    <tr>
                        <th>Supplier Name</th>
                        <th>Unit Price</th>
                        <th>Average Delivery Time</th>
                        <th>Last Updated</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody className="modal-table-body">
                    {suppliersLoading ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center' }}>Loading linked suppliers…</td>
                        </tr>
                    ) : suppliersError ? (
                        <tr>
                            <td colSpan={6} style={{ color: 'red' }}>{suppliersError}</td>
                        </tr>
                    ) : linkedSuppliers.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="no-records">No linked suppliers found.</td>
                        </tr>
                    ) : (
                        linkedSuppliers.map(supplier => (
                            <tr key={supplier.id}>
                                <td>{supplier.linkedSupplierName}</td>
                                <td>{supplier.unitPrice}</td>
                                <td>{supplier.deliveryTime}</td>
                                <td>{supplier.lastUpdated}</td>
                                <td>{supplier.notes}</td>
                                <td>
                                    <ActionButtons
                                        onEdit={() => openModal("edit-linkedSupplier", supplier)}
                                        onDelete={() => openModal("delete-linkedSupplier", supplier)}
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Dynamic Modal Manager */}
            <ModalManager
                isOpen={isModalOpen}
                onClose={closeModal}
                modalContent={modalContent}
            />
        </>
    );
}