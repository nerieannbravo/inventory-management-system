import React, { useState, useEffect } from "react";

import ModalManager from "@/components/modalManager";
import ActionButtons from "@/components/actionButtons";
import AddLinkedItemModal, { LinkedItemForm } from "./linked-item/addLinkedItemModal";
import EditLinkedItemModal from "./linked-item/editLinkedItemModal";

import {
    showSupplierSaveConfirmation, showSupplierSavedSuccess,
    showCloseWithoutSavingConfirmation,
    showDeleteLinkedItemConfirmation, showDeleteLinkedItemSuccess
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface SupplierForm {
    supplierName: string;
    contactPerson: string;
    phone: string;
    email: string;
    street: string;
    barangay: string;
    city: string;
    province: string;
    status: string;
    remarks: string;
}

interface FormError {
    [key: string]: string;
}

interface AddSupplierModalProps {
    onSave: (supplierForm: SupplierForm & { linkedItems?: any[] }) => void;
    onClose: () => void;
}

export default function AddSupplierModal({ onSave, onClose }: AddSupplierModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [activeRow, setActiveRow] = useState<any>(null);

    // State for linked items list - start with empty array (no dummy data)
    const [linkedItems, setLinkedItems] = useState<any[]>([]);

    // Initial supplier form state
    const [supplierForm, setSupplierForm] = useState<SupplierForm>({
        supplierName: "",
        contactPerson: "",
        phone: "",
        email: "",
        street: "",
        barangay: "",
        city: "",
        province: "",
        status: "ACTIVE",
        remarks: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [supplierForm]);

    const handleChange = (field: string, value: any) => {
        setSupplierForm((prev) => ({ ...prev, [field]: value }));

        // Clear the error for that field
        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!supplierForm.supplierName) errors.supplierName = "Supplier name is required";
        if (!supplierForm.phone) {
            errors.phone = "Contact number is required";
        } else if (!/^\d{11}$/.test(supplierForm.phone)) {
            errors.phone = "Contact number must be 11 digits";
        }
        if (supplierForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierForm.email)) {
            errors.email = "Valid email format is required";
        }
        if (!supplierForm.status) errors.status = "Status is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showSupplierSaveConfirmation();
        if (result.isConfirmed) {
            // Map linked items to API expected format
            const normalizedLinked = linkedItems.map((li: any) => ({
                item_id: li.itemId, // Use item_id for API
                supplierUnitMeasureId: li.supplierUnitMeasureId,
                conversionFactor: li.conversionFactor,
                unitPrice: Number(li.unitPrice) || 0,
                averageDeliveryTime: li.averageDeliveryTime ?? null,
                notes: li.notes ?? null,
                isPreferred: li.isPreferred ?? false,
            })).filter((x: any) => x.item_id != null);

            onSave({ ...supplierForm, linkedItems: normalizedLinked });
            await showSupplierSavedSuccess();
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

    // Modal management for item actions (add, edit, delete, etc.)
    const openModal = (mode: "add-linkedItem" | "edit-linkedItem" | "delete-linkedItem", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-linkedItem":
                content = (
                    <AddLinkedItemModal
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

        // Add the new item to the list with all required fields
        const newItem = {
            id: Date.now(), // Use timestamp as temporary ID
            itemId: linkedItemForm.itemId,
            itemName: linkedItemForm.itemName,
            supplierUnitName: linkedItemForm.supplierUnitName,
            supplierUnitMeasureId: linkedItemForm.supplierUnitMeasureId,
            conversionFactor: linkedItemForm.conversionFactor,
            canonicalUnit: linkedItemForm.canonicalUnit,
            itemCategory: linkedItemForm.itemCategory,
            unitPrice: Number(linkedItemForm.unitPrice) || 0,
            averageDeliveryTime: linkedItemForm.averageDeliveryTime || null,
            notes: linkedItemForm.notes || null,
        };
        setLinkedItems([...linkedItems, newItem]);
        closeModal();
    };

    // Handle edit linked item
    const handleEditLinkedItem = (updatedItem: LinkedItemForm & { id: number }) => {
        console.log("Updating item:", updatedItem);

        // Update the item in the list
        setLinkedItems(prevItems =>
            prevItems.map(item =>
                item.id === updatedItem.id
                    ? {
                        ...item,
                        itemId: updatedItem.itemId,
                        itemName: updatedItem.itemName,
                        supplierUnitName: updatedItem.supplierUnitName,
                        supplierUnitMeasureId: updatedItem.supplierUnitMeasureId,
                        conversionFactor: updatedItem.conversionFactor,
                        canonicalUnit: updatedItem.canonicalUnit,
                        itemCategory: updatedItem.itemCategory,
                        unitPrice: Number(updatedItem.unitPrice) || 0,
                        averageDeliveryTime: updatedItem.averageDeliveryTime || null,
                        notes: updatedItem.notes || null,
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

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Add Supplier</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* For Supplier Details */}
            <div className="modal-content add">
                <form className="add-form">
                    {/* Supplier Name */}
                    <div className="form-group">
                        <label>Supplier Name</label>
                        <input
                            className={formErrors?.supplierName ? "invalid-input" : ""}
                            type="text"
                            value={supplierForm.supplierName}
                            onChange={(e) => handleChange("supplierName", e.target.value)}
                            placeholder="Enter supplier name here..."
                        />
                        <p className="add-error-message">{formErrors?.supplierName}</p>
                    </div>

                    <div className="form-row">
                        {/* Contact Person */}
                        <div className="form-group">
                            <label>Contact Person</label>
                            <input
                                className={formErrors?.contactPerson ? "invalid-input" : ""}
                                type="text"
                                value={supplierForm.contactPerson}
                                onChange={(e) => handleChange("contactPerson", e.target.value)}
                                placeholder="Enter contact person name..."
                            />
                            <p className="add-error-message">{formErrors?.contactPerson}</p>
                        </div>

                        {/* Contact Number */}
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input
                                className={formErrors?.phone ? "invalid-input" : ""}
                                type="text"
                                value={supplierForm.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                placeholder="Enter contact number here..."
                                maxLength={11}
                            />
                            <p className="add-error-message">{formErrors?.phone}</p>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                className={formErrors?.email ? "invalid-input" : ""}
                                type="email"
                                value={supplierForm.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                placeholder="Enter email here..."
                            />
                            <p className="add-error-message">{formErrors?.email}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Street */}
                        <div className="form-group">
                            <label>Street</label>
                            <input
                                className={formErrors?.street ? "invalid-input" : ""}
                                type="text"
                                value={supplierForm.street}
                                onChange={(e) => handleChange("street", e.target.value)}
                                placeholder="Enter street here..."
                            />
                            <p className="add-error-message">{formErrors?.street}</p>
                        </div>

                        {/* Barangay */}
                        <div className="form-group">
                            <label>Barangay</label>
                            <input
                                className={formErrors?.barangay ? "invalid-input" : ""}
                                type="text"
                                value={supplierForm.barangay}
                                onChange={(e) => handleChange("barangay", e.target.value)}
                                placeholder="Enter barangay here..."
                            />
                            <p className="add-error-message">{formErrors?.barangay}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* City */}
                        <div className="form-group">
                            <label>City</label>
                            <input
                                className={formErrors?.city ? "invalid-input" : ""}
                                type="text"
                                value={supplierForm.city}
                                onChange={(e) => handleChange("city", e.target.value)}
                                placeholder="Enter city here..."
                            />
                            <p className="add-error-message">{formErrors?.city}</p>
                        </div>

                        {/* Province */}
                        <div className="form-group">
                            <label>Province</label>
                            <input
                                className={formErrors?.province ? "invalid-input" : ""}
                                type="text"
                                value={supplierForm.province}
                                onChange={(e) => handleChange("province", e.target.value)}
                                placeholder="Enter province here..."
                            />
                            <p className="add-error-message">{formErrors?.province}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={supplierForm.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                                className={formErrors?.status ? "invalid-input" : ""}
                            >
                                <option value="" disabled>Select status...</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="FLAGGED">Flagged</option>
                                <option value="BLOCKED">Blocked</option>
                            </select>
                            <p className="add-error-message">{formErrors?.status}</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-group">
                        <label>Remarks</label>
                        <textarea
                            className={formErrors?.remarks ? "invalid-input" : ""}
                            value={supplierForm.remarks}
                            onChange={(e) => handleChange("remarks", e.target.value)}
                            placeholder="Enter any additional remarks..."
                            rows={3}
                        />
                        <p className="add-error-message">{formErrors?.remarks}</p>
                    </div>
                </form>
            </div>

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
                    {linkedItems.length === 0 ? (
                        <tr>
                            <td colSpan={8} style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                                No linked items yet. Click "Add Item" to get started.
                            </td>
                        </tr>
                    ) : (
                        linkedItems.map((item: any) => (
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
                        ))
                    )}
                </tbody>
            </table>

            <div className="modal-actions">
                <button type="submit" className="submit-btn" onClick={handleSubmit}>
                    <i className="ri-save-3-line" /> Save
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