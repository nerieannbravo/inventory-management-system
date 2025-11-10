import React, { useState, useEffect } from "react";

import ModalManager from "@/components/modalManager";
import ActionButtons from "@/components/actionButtons";
import AddLinkedSupplierModal, { LinkedSupplierForm } from "./linked-supplier/addLinkedSupplierModal";
import EditLinkedSupplierModal from "./linked-supplier/editLinkedSupplierModal";

import {
    showItemSaveConfirmation, showItemSavedSuccess,
    showCloseWithoutSavingConfirmation,
    showDeleteLinkedSupplierConfirmation, showDeleteLinkedSupplierSuccess
} from "@/utils/sweetAlert";
import { showItemSaveError } from "@/utils/sweetAlert";

import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface ItemForm {
    item_name: string,
    item_unit: string,
    item_category: string,
    item_status: string,
    description: string,
}

interface FormError {
    [key: string]: string;
}

interface AddItemModalProps {
    onSave: (createdItem: Record<string, unknown>) => void;
    onClose: () => void;
    preloadedUnits?: Array<{ id: number; unit_name: string; abbreviation: string }>;
    preloadedCategories?: Array<{ id: number; category_id: string; category_name: string }>;
}

// Linked suppliers will be loaded from the server when available.

export default function AddItemModal({ onSave, onClose, preloadedUnits, preloadedCategories }: AddItemModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // State for linked suppliers list (initially empty). For the Add modal there
    // won't be any linked suppliers until the item is created and linked.
    const [linkedSuppliers, setLinkedSuppliers] = useState<LinkedSupplierRow[]>([]);

    // Initial item form state
    const [itemForm, setItemForm] = useState<ItemForm>({
        item_name: "",
        item_unit: "",
        item_category: "",
        item_status: "",
        description: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [units, setUnits] = useState<Array<{ id: number; unit_name: string; abbreviation: string }>>(preloadedUnits ?? []);
    const [categories, setCategories] = useState<Array<{ id: number; category_id: string; category_name: string }>>(preloadedCategories ?? []);
    const [listsLoading, setListsLoading] = useState(!(preloadedUnits && preloadedCategories));

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [itemForm]);

    // Fetch units and categories when modal mounts
    useEffect(() => {
        // If preloaded props were passed, don't fetch again
        if (preloadedUnits && preloadedCategories) return;

        let mounted = true;
        const fetchLists = async () => {
            setListsLoading(true);
            try {
                const [uRes, cRes] = await Promise.all([
                    fetch('/api/units'),
                    fetch('/api/category'),
                ]);

                const uBody = await uRes.json().catch(() => ({}));
                const cBody = await cRes.json().catch(() => ({}));

                if (mounted) {
                    if (uRes.ok && uBody?.units) setUnits(uBody.units);
                    else setApiError(prev => (prev ? prev + ' Units failed to load.' : 'Units failed to load.'));

                    if (cRes.ok && cBody?.categories) setCategories(cBody.categories);
                    else setApiError(prev => (prev ? prev + ' Categories failed to load.' : 'Categories failed to load.'));
                }
            } catch (err) {
                console.error('Failed to fetch units/categories', err);
                if (mounted) setApiError('Failed to load unit or category lists.');
            } finally {
                if (mounted) setListsLoading(false);
            }
        };

        fetchLists();

        return () => { mounted = false; };
    }, [preloadedUnits, preloadedCategories]);

    const handleChange = (field: string, value: string) => {
        setItemForm((prev) => ({ ...prev, [field]: value }));

        // Clear the error for that field
        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!itemForm.item_name) errors.item_name = "Item name is required";
        if (!itemForm.item_unit) errors.item_unit = "Item unit is required";
        if (!itemForm.item_category) errors.item_category = "Item category is required";
        if (!itemForm.item_status) errors.item_status = "Item status is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showItemSaveConfirmation();
        if (!result.isConfirmed) return;

        // Map UI status values to backend enum
        const statusMap: Record<string, string> = {
            sold: 'ACTIVE',
            traded: 'INACTIVE',
            Active: 'ACTIVE',
            Inactive: 'INACTIVE'
        };

        const unitId = Number(itemForm.item_unit);
        if (Number.isNaN(unitId) || unitId <= 0) {
            setFormErrors(prev => ({ ...prev, item_unit: 'Please select a valid unit (id).' }));
            return;
        }
        const categoryId = Number(itemForm.item_category);
        if (Number.isNaN(categoryId) || categoryId <= 0) {
            setFormErrors(prev => ({ ...prev, item_category: 'Please select a valid category (id).' }));
            return;
        }

        const payload = {
            item_name: itemForm.item_name,
            unit_id: unitId,
            category_id: categoryId,
            status: statusMap[itemForm.item_status] ?? undefined,
            description: itemForm.description ?? undefined,
        };

        try {
            setIsSubmitting(true);
            const res = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const body = await res.json().catch(() => ({}));
            if (res.status === 201) {
                const created = body;
                // pass created item to parent so the UI can insert it
                onSave(created);
                await showItemSavedSuccess();
                window.location.reload();
                closeModal();
            } else if (res.status === 409) {
                const msg = body?.error ?? 'Item name already exists';
                // Show SweetAlert for duplicate name and do not render the inline error message
                await showItemSaveError(String(msg));
            } else {
                const msg = body?.error ?? `Failed to save item (status ${res.status})`;
                setApiError(String(msg));
            }
        } catch (err) {
            console.error('Failed to POST /api/items', err);
            setApiError('An error occurred while saving the item.');
        } finally {
            setIsSubmitting(false);
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

    // Modal management for supplier actions (add, edit, delete, etc.)
    type LinkedSupplierRow = {
        id: number;
        supplierId?: number | string; // optional reference to Supplier.id (if selected)
        linkedSupplierName: string;
        unitPrice: number;
        unit: { unit_id: number; abbreviation: string; unit_name: string };
        deliveryTime: string;
        lastUpdated: string;
        notes: string;
    };

    const openModal = (mode: "add-linkedSupplier" | "edit-linkedSupplier" | "delete-linkedSupplier", rowData?: LinkedSupplierRow) => {
        let content;

        switch (mode) {
            case "add-linkedSupplier":
                content = (
                    <AddLinkedSupplierModal
                        onSave={handleAddLinkedSupplier}
                        onClose={closeModal}
                    />
                );
                break;
            case "edit-linkedSupplier":
                if (rowData) {
                    content = (
                        <EditLinkedSupplierModal
                            item={rowData}
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
    const handleAddLinkedSupplier = (linkedSupplierForm: LinkedSupplierForm & { unitAbbrev?: string; unitId?: number; supplierId?: number | string }) => {
        // Add the new supplier to the list (local/optimistic). Keep supplierId if present
        const newSupplier: LinkedSupplierRow = {
            id: linkedSuppliers.length + 1,
            supplierId: linkedSupplierForm.supplierId,
            linkedSupplierName: linkedSupplierForm.linkedSupplierName,
            unitPrice: linkedSupplierForm.unitPrice,
            unit: linkedSupplierForm.unitId ? { unit_id: linkedSupplierForm.unitId, abbreviation: linkedSupplierForm.unitAbbrev ?? '', unit_name: '' } : { unit_id: 0, abbreviation: '', unit_name: '' },
            deliveryTime: linkedSupplierForm.deliveryTime,
            lastUpdated: new Date().toLocaleDateString("en-US"),
            notes: linkedSupplierForm.notes
        };
        setLinkedSuppliers([...linkedSuppliers, newSupplier]);
        closeModal();
    };

    // Handle edit linked supplier
    const handleEditLinkedSupplier = (updatedSupplier: LinkedSupplierForm & { id: number; unitAbbrev?: string; unitId?: number }) => {
        // Edit the supplier to the list (local/optimistic)
        setLinkedSuppliers(prevSuppliers =>
            prevSuppliers.map(supplier =>
                supplier.id === updatedSupplier.id
                    ? {
                        ...supplier,
                        linkedSupplierName: updatedSupplier.linkedSupplierName,
                        unitPrice: updatedSupplier.unitPrice,
                        unit: updatedSupplier.unitId ? { unit_id: updatedSupplier.unitId, abbreviation: updatedSupplier.unitAbbrev ?? '', unit_name: '' } : supplier.unit ?? { unit_id: 0, abbreviation: '', unit_name: '' },
                        deliveryTime: updatedSupplier.deliveryTime,
                        notes: updatedSupplier.notes,
                        lastUpdated: new Date().toLocaleDateString("en-US")
                    }
                    : supplier
            )
        );
        closeModal();
    };

    // Handle delete linked supplier
    const handleDeleteSupplier = async (supplierId: number) => {
        const result = await showDeleteLinkedSupplierConfirmation();
        if (result.isConfirmed) {
            setLinkedSuppliers(linkedSuppliers.filter(supplier => supplier.id !== supplierId));
            await showDeleteLinkedSupplierSuccess();
        }
        closeModal();
    };

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Add Item</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* For Item Details */}
            <div className="modal-content add">
                <form className="add-form">
                    {/* Item Name */}
                    <div className="form-group">
                        <label>Item Name</label>
                        <input
                            className={formErrors?.item_name ? "invalid-input" : ""}
                            type="text"
                            value={itemForm.item_name}
                            onChange={(e) => handleChange("item_name", e.target.value)}
                            placeholder="Enter item name here..."
                        />
                        <p className="add-error-message">{formErrors?.item_name}</p>
                    </div>

                    <div className="form-row">
                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <select
                                    value={itemForm.item_unit}
                                    onChange={(e) => handleChange("item_unit", e.target.value)}
                                    className={formErrors?.item_unit ? "invalid-input" : ""}
                                    disabled={listsLoading}
                                >
                                    <option value="" disabled>{listsLoading ? 'Loading units...' : 'Select unit measure...'}</option>
                                    {units.map(u => (
                                        <option key={u.id} value={String(u.id)}>{u.unit_name} ({u.abbreviation})</option>
                                    ))}
                                </select>
                                {listsLoading && <small style={{ color: '#666' }}>Loading…</small>}
                                </div>
                            <p className="add-error-message">{formErrors?.item_unit}</p>
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label>Category</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <select
                                value={itemForm.item_category}
                                onChange={(e) => handleChange("item_category", e.target.value)}
                                className={formErrors?.item_category ? "invalid-input" : ""}
                                disabled={listsLoading}
                            >
                                <option value="" disabled>{listsLoading ? 'Loading categories...' : 'Select category...'}</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.category_name}</option>
                                ))}
                            </select>
                                {listsLoading && <small style={{ color: '#666' }}>Loading…</small>}
                                </div>
                            <p className="add-error-message">{formErrors?.item_category}</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={itemForm.item_status}
                                onChange={(e) => handleChange("item_status", e.target.value)}
                                className={formErrors?.item_status ? "invalid-input" : ""}
                            >
                                <option value="" disabled>Select status...</option>
                                <option value="sold">Active</option>
                                <option value="traded">Inactive</option>
                            </select>
                            <p className="add-error-message">{formErrors?.item_status}</p>
                        </div>
                    </div>

                    {/* Item Description */}
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className={formErrors?.description ? "invalid-input" : ""}
                            value={itemForm.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Enter item description here..."
                        >
                        </textarea>
                        <p className="add-error-message">{formErrors?.description}</p>
                    </div>
                </form>
            </div>

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
                    {linkedSuppliers.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="no-records">No supplier added.</td>
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

                    <div className="modal-actions">
                        {apiError && <p className="add-error-message" style={{ color: 'red' }}>{apiError}</p>}
                        <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
                            <i className="ri-save-3-line" /> {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>

            {/* Dynamic Modal Manager */}
            <ModalManager
                isOpen={isModalOpen}
                onClose={closeModal}
                modalContent={modalContent}
            />
        </>
    );
}