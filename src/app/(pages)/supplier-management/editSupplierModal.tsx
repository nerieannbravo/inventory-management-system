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
        supplierName: string,
        supplierStreet: string,
        supplierBarangay: string,
        supplierCity: string,
        supplierProvince: string,
        supplierContact: string,
        supplierEmail: string,
        supplierStatus: string,
        // Additional fields would be included in a real application
    };
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

// Sample linked item data - replace with your actual data source
const sampleLinkedItems = [
    {
        id: 1,
        linkedItemName: "Item 1",
        itemUnit: "liters",
        itemCategory: "Consumable",
        unitPrice: 100,
    },
    {
        id: 2,
        linkedItemName: "Item 2",
        itemUnit: "pcs",
        itemCategory: "Tool",
        unitPrice: 1500,
    }
];

export default function EditSupplierModal({ item, onSave, onClose }: EditSupplierModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [activeRow, setActiveRow] = useState<any>(null);

    // State for linked items list
    const [linkedItems, setLinkedItems] = useState(sampleLinkedItems);

    // Initial supplier form state
    const [formData, setFormData] = useState({
        id: item.id,
        supplierName: item.supplierName,
        supplierStreet: "",
        supplierBarangay: "",
        supplierCity: "",
        supplierProvince: "",
        supplierContact: item.supplierContact,
        supplierEmail: item.supplierEmail,
        supplierStatus: item.supplierStatus,
    });

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
        if (!formData.supplierContact) {
            errors.supplierContact = "Contact number is required";
        } else if (!/^\d{11}$/.test(formData.supplierContact)) {
            errors.supplierContact = "Contact number must be exactly 11 digits";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.supplierEmail)) {
            errors.supplierEmail = "Invalid email format";
        }
        // else if (!formData.supplierEmail) {
        //     errors.supplierEmail = "Email is required";
        // }
        if (!formData.supplierStatus) errors.supplierStatus = "Status is required";
        // if (!formData.supplierStreet) errors.supplierStreet = "Street is required";
        // if (!formData.supplierBarangay) errors.supplierBarangay = "Barangay is required";
        if (!formData.supplierCity) errors.supplierCity = "City is required";
        // if (!formData.supplierProvince) errors.supplierProvince = "Province is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showSupplierUpdateConfirmation(formData.supplierName);
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

        // Add the new item to the list (can be replaced with actual data handling logic)
        const newItem = {
            id: linkedItems.length + 1,
            linkedItemName: linkedItemForm.linkedItemName,
            itemCategory: linkedItemForm.itemCategory,
            itemUnit: linkedItemForm.itemUnit,
            unitPrice: linkedItemForm.unitPrice
        };
        setLinkedItems([...linkedItems, newItem]);
        closeModal();
    };

    // Handle edit linked item
    const handleEditLinkedItem = (updatedItem: LinkedItemForm & { id: number }) => {
        console.log("Updating item:", updatedItem);

        // Edit the item to the list (can be replaced with actual data handling logic)
        setLinkedItems(prevItems =>
            prevItems.map(item =>
                item.id === updatedItem.id
                    ? {
                        ...item,
                        linkedItemName: updatedItem.linkedItemName,
                        itemCategory: updatedItem.itemCategory,
                        itemUnit: updatedItem.itemUnit,
                        unitPrice: updatedItem.unitPrice
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
                        {/* Supplier Contact */}
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input
                                className={formErrors?.supplierContact ? "invalid-input" : ""}
                                type="text"
                                value={formData.supplierContact}
                                onChange={(e) => handleChange("supplierContact", e.target.value)}
                                placeholder="Enter contact number here..."
                                maxLength={11}
                            />
                            <p className="edit-error-message">{formErrors?.supplierContact}</p>
                        </div>

                        {/* Supplier Email */}
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                className={formErrors?.supplierEmail ? "invalid-input" : ""}
                                type="email"
                                value={formData.supplierEmail}
                                onChange={(e) => handleChange("supplierEmail", e.target.value)}
                                placeholder="Enter email here..."
                            />
                            <p className="edit-error-message">{formErrors?.supplierEmail}</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.supplierStatus}
                                onChange={(e) => handleChange("supplierStatus", e.target.value)}
                                className={formErrors?.supplierStatus ? "invalid-input" : ""}
                            >
                                <option value="" disabled>Select status...</option>
                                <option value="sold">Active</option>
                                <option value="traded">Inactive</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.supplierStatus}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Street */}
                        <div className="form-group">
                            <label>Street</label>
                            <input
                                className={formErrors?.supplierStreet ? "invalid-input" : ""}
                                type="text"
                                value={formData.supplierStreet}
                                onChange={(e) => handleChange("supplierStreet", e.target.value)}
                                placeholder="Enter street here..."
                            />
                            <p className="edit-error-message">{formErrors?.supplierStreet}</p>
                        </div>

                        {/* Barangay */}
                        <div className="form-group">
                            <label>Barangay</label>
                            <input
                                className={formErrors?.supplierBarangay ? "invalid-input" : ""}
                                type="text"
                                value={formData.supplierBarangay}
                                onChange={(e) => handleChange("supplierBarangay", e.target.value)}
                                placeholder="Enter barangay here..."
                            />
                            <p className="edit-error-message">{formErrors?.supplierBarangay}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* City */}
                        <div className="form-group">
                            <label>City</label>
                            <input
                                className={formErrors?.supplierCity ? "invalid-input" : ""}
                                type="text"
                                value={formData.supplierCity}
                                onChange={(e) => handleChange("supplierCity", e.target.value)}
                                placeholder="Enter city here..."
                            />
                            <p className="edit-error-message">{formErrors?.supplierCity}</p>
                        </div>

                        {/* Province */}
                        <div className="form-group">
                            <label>Province</label>
                            <input
                                className={formErrors?.supplierProvince ? "invalid-input" : ""}
                                type="text"
                                value={formData.supplierProvince}
                                onChange={(e) => handleChange("supplierProvince", e.target.value)}
                                placeholder="Enter province here..."
                            />
                            <p className="edit-error-message">{formErrors?.supplierProvince}</p>
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
            <div className="modal-table-wrapper">
                <div className="modal-table-container">
                    <table className="modal-table">
                        <thead className="modal-table-heading">
                            <tr>
                                <th>Item Name</th>
                                <th>Unit Measure</th>
                                <th>Unit Price</th>
                                <th>Category</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="modal-table-body">
                            {linkedItems.map(item => (
                                <tr key={item.id}>
                                    <td>{item.linkedItemName}</td>
                                    <td>{item.itemUnit}</td>
                                    <td>{item.unitPrice}</td>
                                    <td>{item.itemCategory}</td>
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
                </div>
            </div>

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