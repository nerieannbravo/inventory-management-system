import React, { useState, useEffect } from "react";

import ModalManager from "@/components/modalManager";
import ActionButtons from "@/components/actionButtons";
import AddLinkedItemModal, { LinkedItemForm } from "./linked-item/addLinkedItemModal";
import EditLinkedItemModal from "./linked-item/editLinkedItemModal";

import {
    showSupplierUpdateConfirmation, showSupplierUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation,
    showDeleteLinkedItemConfirmation, showDeleteLinkedItemSuccess
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

interface EditSupplierModalProps {
    item: {
        id: number;
        supplierId?: string;
        supplierName: string;
        contactPerson?: string;
        phone?: string;
        email?: string;
        street?: string;
        barangay?: string;
        city?: string;
        province?: string;
        status: string;
        remarks?: string;
        linkedItems?: any[];
    };
    onSave: (updatedItem: any & { linkedItems?: any[] }) => void;
    onClose: () => void;
}

export default function EditSupplierModal({ item, onSave, onClose }: EditSupplierModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [activeRow, setActiveRow] = useState<any>(null);

    // State for linked items list - initialize from item.linkedItems
    const [linkedItems, setLinkedItems] = useState<any[]>(() => {
        // Transform API data to match component expected format
        return (item.linkedItems || []).map((li: any) => ({
            id: li.id || Date.now() + Math.random(), // Ensure unique ID
            itemId: li.itemId || li.item_id,
            itemName: li.itemName || li.item_name,
            itemCategory: li.itemCategory || li.category || '',
            canonicalUnit: li.canonicalUnit || li.canonical_unit || '',
            canonicalUnitId: li.canonicalUnitId || li.canonical_unit_id || 0,
            supplierUnitMeasureId: li.supplierUnitMeasureId || li.supplier_unit_measure_id || 0,
            supplierUnitName: li.supplierUnitName || li.supplier_unit_name || '',
            conversionFactor: li.conversionFactor || li.conversion_factor || 1,
            unitPrice: li.unitPrice || li.unit_price || 0,
            averageDeliveryTime: li.averageDeliveryTime || li.average_delivery_time || null,
            isPreferred: li.isPreferred ?? li.is_preferred ?? false,
            notes: li.notes || null
        }));
    });

    // Initial supplier form state
    const [formData, setFormData] = useState({
        id: item.id,
        supplierId: item.supplierId || "",
        supplierName: item.supplierName,
        contactPerson: item.contactPerson || "",
        phone: item.phone || "",
        email: item.email || "",
        street: item.street || "",
        barangay: item.barangay || "",
        city: item.city || "",
        province: item.province || "",
        status: item.status,
        remarks: item.remarks || "",
    });

    // State to track if form is dirty (has changes)
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [originalData] = useState({ ...formData });
    const [originalLinkedItems] = useState(JSON.stringify(linkedItems));

    // Add formErrors state
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Check if form data or linked items have changed from original
    useEffect(() => {
        const formChanged = JSON.stringify(originalData) !== JSON.stringify(formData);
        const linkedItemsChanged = originalLinkedItems !== JSON.stringify(linkedItems);
        setIsFormDirty(formChanged || linkedItemsChanged);
    }, [formData, linkedItems, originalData, originalLinkedItems]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Validate inputs
        if (!formData.supplierName) errors.supplierName = "Supplier name is required";
        if (!formData.phone) {
            errors.phone = "Contact number is required";
        } else if (!/^\d{11}$/.test(formData.phone)) {
            errors.phone = "Contact number must be 11 digits";
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Valid email format is required";
        }
        if (!formData.status) errors.status = "Status is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showSupplierUpdateConfirmation(formData.supplierName);
        if (result.isConfirmed) {
            // normalize linked items shape before saving - must match API expected format
            const normalizedLinked = linkedItems.map((li: any) => ({
                item_id: li.itemId, // Use item_id for API
                supplierUnitMeasureId: li.supplierUnitMeasureId,
                conversionFactor: li.conversionFactor,
                unitPrice: Number(li.unitPrice) || 0,
                averageDeliveryTime: li.averageDeliveryTime ?? null,
                notes: li.notes ?? null,
                isPreferred: li.isPreferred ?? false,
            })).filter((x: any) => x.item_id != null);

            onSave({ ...formData, linkedItems: normalizedLinked });
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

    // Modal management for item actions (add, edit, delete, etc.)
    const openModal = (mode: "add-linkedItem" | "edit-linkedItem" | "delete-linkedItem", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-linkedItem":
                // Get currently linked item IDs (excluding soft-deleted)
                const currentlyLinkedItemIds = linkedItems.map(li => li.itemId).filter(Boolean);
                
                content = (
                    <AddLinkedItemModal
                        supplierId={item.id}
                        currentlyLinkedItemIds={currentlyLinkedItemIds}
                        onSave={handleAddLinkedItem}
                        onClose={closeModal}
                    />
                );
                break;
            case "edit-linkedItem":
                content = (
                    <EditLinkedItemModal
                        item={rowData}
                        onSave={handleEditLinkedItem}
                        onClose={closeModal}
                    />
                );
                break;
            case "delete-linkedItem":
                if (rowData) {
                    handleDeleteItem(rowData.id);
                }
            default:
                content = null;
        }

        setModalContent(content);
        setActiveRow(rowData || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
        setActiveRow(null);
    };

    // Handle add linked item
    const handleAddLinkedItem = (linkedItemForm: LinkedItemForm) => {
        console.log("New item:", linkedItemForm);

        // Add the new item to the list with full schema
        const newItem = {
            id: Date.now() + Math.random(), // Ensure unique ID
            itemId: linkedItemForm.itemId,
            itemName: linkedItemForm.itemName,
            itemCategory: linkedItemForm.itemCategory,
            canonicalUnit: linkedItemForm.canonicalUnit,
            canonicalUnitId: linkedItemForm.canonicalUnitId,
            supplierUnitMeasureId: linkedItemForm.supplierUnitMeasureId,
            supplierUnitName: linkedItemForm.supplierUnitName,
            conversionFactor: linkedItemForm.conversionFactor,
            unitPrice: linkedItemForm.unitPrice,
            averageDeliveryTime: linkedItemForm.averageDeliveryTime,
            notes: linkedItemForm.notes
        };
        setLinkedItems([...linkedItems, newItem]);
        closeModal();
    };

    // Handle edit linked item
    const handleEditLinkedItem = (updatedItem: LinkedItemForm & { id: number }) => {
        console.log("Updating item:", updatedItem);

        // Update the item with full schema
        setLinkedItems(prevItems =>
            prevItems.map(item =>
                item.id === updatedItem.id
                    ? {
                        ...item,
                        itemId: updatedItem.itemId,
                        itemName: updatedItem.itemName,
                        itemCategory: updatedItem.itemCategory,
                        canonicalUnit: updatedItem.canonicalUnit,
                        canonicalUnitId: updatedItem.canonicalUnitId,
                        supplierUnitMeasureId: updatedItem.supplierUnitMeasureId,
                        supplierUnitName: updatedItem.supplierUnitName,
                        conversionFactor: updatedItem.conversionFactor,
                        unitPrice: updatedItem.unitPrice,
                        averageDeliveryTime: updatedItem.averageDeliveryTime,
                        notes: updatedItem.notes
                    }
                    : item
            )
        );
        closeModal();
    };

    // Handle delete linked item
    const handleDeleteItem = async (itemId: number) => {
        const result = await showDeleteLinkedItemConfirmation();
        if (result.isConfirmed) {
            setLinkedItems(linkedItems.filter(item => item.id !== itemId));
            await showDeleteLinkedItemSuccess();
        }
        closeModal();
    };

    // Handle toggle preferred status
    const handleTogglePreferred = async (supplierItemId: number) => {
        try {
            const response = await fetch('/api/supplier/toggle-preferred', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ supplierItemId })
            });

            const data = await response.json();

            if (data.success) {
                // Update the local state to reflect the change
                setLinkedItems(prevItems =>
                    prevItems.map(item =>
                        item.id === supplierItemId
                            ? { ...item, isPreferred: data.isPreferred }
                            : item
                    )
                );
            } else {
                console.error('Failed to toggle preferred status:', data.error);
            }
        } catch (error) {
            console.error('Error toggling preferred status:', error);
        }
    };

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Edit Supplier</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* Edit Supplier Form */}
            <div className="modal-content edit">
                <form className="edit-form">
                    {/* Supplier Name */}
                    <div className="form-group">
                        <label>Supplier Name</label>
                        <input
                            className={formErrors?.supplierName ? "invalid-input" : ""}
                            type="text"
                            value={formData.supplierName}
                            onChange={(e) => handleChange("supplierName", e.target.value)}
                            placeholder="Enter supplier name here..."
                        />
                        <p className="edit-error-message">{formErrors?.supplierName}</p>
                    </div>

                    <div className="form-row">
                        {/* Contact Person */}
                        <div className="form-group">
                            <label>Contact Person</label>
                            <input
                                type="text"
                                value={formData.contactPerson}
                                onChange={(e) => handleChange("contactPerson", e.target.value)}
                                placeholder="Enter contact person name here..."
                            />
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input
                                className={formErrors?.phone ? "invalid-input" : ""}
                                type="text"
                                value={formData.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                placeholder="Enter contact number here..."
                                maxLength={11}
                            />
                            <p className="edit-error-message">{formErrors?.phone}</p>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                className={formErrors?.email ? "invalid-input" : ""}
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                placeholder="Enter email here..."
                            />
                            <p className="edit-error-message">{formErrors?.email}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                                className={formErrors?.status ? "invalid-input" : ""}
                            >
                                <option value="" disabled>Select status...</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="FLAGGED">Flagged</option>
                                <option value="BLOCKED">Blocked</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.status}</p>
                        </div>

                        {/* Remarks */}
                        <div className="form-group">
                            <label>Remarks</label>
                            <input
                                type="text"
                                value={formData.remarks}
                                onChange={(e) => handleChange("remarks", e.target.value)}
                                placeholder="Enter any remarks here..."
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Street */}
                        <div className="form-group">
                            <label>Street</label>
                            <input
                                type="text"
                                value={formData.street}
                                onChange={(e) => handleChange("street", e.target.value)}
                                placeholder="Enter street here..."
                            />
                        </div>

                        {/* Barangay */}
                        <div className="form-group">
                            <label>Barangay</label>
                            <input
                                type="text"
                                value={formData.barangay}
                                onChange={(e) => handleChange("barangay", e.target.value)}
                                placeholder="Enter barangay here..."
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        {/* City */}
                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => handleChange("city", e.target.value)}
                                placeholder="Enter city here..."
                            />
                        </div>

                        {/* Province */}
                        <div className="form-group">
                            <label>Province</label>
                            <input
                                type="text"
                                value={formData.province}
                                onChange={(e) => handleChange("province", e.target.value)}
                                placeholder="Enter province here..."
                            />
                        </div>
                    </div>
                </form >
            </div >

            {/* Linked Items */}
            <div className="details-header">
                <p className="details-title">Linked Item/s</p>
                <button className="modal-table-add-btn" onClick={() => openModal("add-linkedItem")}>
                    <i className="ri-add-line" /> Add Item
                </button>
            </div>

            {/* Table */}
            <table className="modal-table">
                <thead className="modal-table-heading">
                    <tr>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Supplier Unit</th>
                        <th>Conversion</th>
                        <th>Unit Price</th>
                        <th>Delivery Time</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody className="modal-table-body">
                    {linkedItems.map((item: any) => (
                        <tr key={item.id}>
                            <td>{item.itemName}</td>
                            <td>{item.itemCategory}</td>
                            <td>{item.supplierUnitName}</td>
                            <td>{item.conversionFactor}</td>
                            <td>₱{Number(item.unitPrice).toFixed(2)}</td>
                            <td>{item.averageDeliveryTime || '—'}</td>
                            <td>{item.notes || '—'}</td>
                            <td>
                                <ActionButtons
                                    onEdit={() => openModal("edit-linkedItem", item)}
                                    onDelete={() => openModal("delete-linkedItem", item)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="modal-actions">
                <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={!isFormDirty}>
                    <i className="ri-save-3-line" /> Update
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