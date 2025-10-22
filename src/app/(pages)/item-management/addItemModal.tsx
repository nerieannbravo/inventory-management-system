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

import "@/styles/forms.css";
import { link } from "fs";

// Export the interface so it can be imported by other components
export interface ItemForm {
    itemName: string,
    itemUnit: string,
    itemCategory: string,
    itemStatus: string,
    itemDescription: string,
}

interface FormError {
    [key: string]: string;
}

interface AddItemModalProps {
    onSave: (itemForm: ItemForm) => void;
    onClose: () => void;
}

// Sample linked supplier data - replace with your actual data source
const sampleLinkedSuppliers = [
    {
        id: 1,
        linkedSupplierName: "Supplier 1",
        unitPrice: 50,
        deliveryTime: "1 week",
        lastUpdated: "07/01/2025",
        notes: "Can be delayed"
    },
    {
        id: 2,
        linkedSupplierName: "Supplier 2",
        unitPrice: 55,
        deliveryTime: "1 week",
        lastUpdated: "09/03/2025",
        notes: "N/A"
    }
];

export default function AddItemModal({ onSave, onClose }: AddItemModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [activeRow, setActiveRow] = useState<any>(null);

    // State for linked suppliers list
    const [linkedSuppliers, setLinkedSuppliers] = useState(sampleLinkedSuppliers);

    // Initial item form state
    const [itemForm, setItemForm] = useState<ItemForm>({
        itemName: "",
        itemUnit: "",
        itemCategory: "",
        itemStatus: "",
        itemDescription: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [itemForm]);

    const handleChange = (field: string, value: any) => {
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

        if (!itemForm.itemName) errors.itemName = "Item name is required";
        if (!itemForm.itemUnit) errors.itemUnit = "Item unit is required";
        if (!itemForm.itemCategory) errors.itemCategory = "Item category is required";
        if (!itemForm.itemStatus) errors.itemStatus = "Item status is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showItemSaveConfirmation();
        if (result.isConfirmed) {
            onSave(itemForm);
            await showItemSavedSuccess();
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
    const openModal = (mode: "add-linkedSupplier" | "edit-linkedSupplier" | "delete-linkedSupplier", rowData?: any) => {
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
                content = (
                    <EditLinkedSupplierModal
                        item={rowData}
                        onSave={handleEditLinkedSupplier}
                        onClose={closeModal}
                    />
                );
                break;
            case "delete-linkedSupplier":
                if (rowData) {
                    handleDeleteSupplier(rowData.id);
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

    // Handle add linked supplier
    const handleAddLinkedSupplier = (linkedSupplierForm: LinkedSupplierForm) => {
        console.log("New supplier:", linkedSupplierForm);

        // Add the new supplier to the list (can be replaced with actual data handling logic)
        const newSupplier = {
            id: linkedSuppliers.length + 1,
            linkedSupplierName: linkedSupplierForm.linkedSupplierName,
            unitPrice: linkedSupplierForm.unitPrice,
            deliveryTime: linkedSupplierForm.deliveryTime,
            lastUpdated: new Date().toLocaleDateString("en-US"),
            notes: linkedSupplierForm.notes
        };
        setLinkedSuppliers([...linkedSuppliers, newSupplier]);
        closeModal();
    };

    // Handle edit linked supplier
    const handleEditLinkedSupplier = (updatedSupplier: LinkedSupplierForm & { id: number }) => {
        console.log("Updating supplier:", updatedSupplier);

        // Edit the supplier to the list (can be replaced with actual data handling logic)
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
                        <label className="required">Item Name</label>
                        <input
                            className={formErrors?.itemName ? "invalid-input" : ""}
                            type="text"
                            value={itemForm.itemName}
                            onChange={(e) => handleChange("itemName", e.target.value)}
                            placeholder="Enter item name here..."
                        />
                        <p className="add-error-message">{formErrors?.itemName}</p>
                    </div>

                    <div className="form-row">
                        {/* Unit Measure */}
                        <div className="form-group">
                            <label className="required">Unit Measure</label>
                            <input
                                className={formErrors?.itemUnit ? "invalid-input" : ""}
                                type="text"
                                value={itemForm.itemUnit}
                                onChange={(e) => handleChange("itemUnit", e.target.value)}
                                placeholder="Enter unit measure here..."
                            />
                            <p className="add-error-message">{formErrors?.itemUnit}</p>
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label className="required">Category</label>
                            <select
                                value={itemForm.itemCategory}
                                onChange={(e) => handleChange("itemCategory", e.target.value)}
                                className={formErrors?.itemCategory ? "invalid-input" : ""}
                            >
                                <option value="" disabled>Select category...</option>
                                <option value="Consumable">Consumable</option>
                                <option value="Tool">Tool</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Machine">Machine</option>
                            </select>
                            <p className="add-error-message">{formErrors?.itemCategory}</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label className="required">Status</label>
                            <select
                                value={itemForm.itemStatus}
                                onChange={(e) => handleChange("itemStatus", e.target.value)}
                                className={formErrors?.itemStatus ? "invalid-input" : ""}
                            >
                                <option value="" disabled>Select status...</option>
                                <option value="sold">Active</option>
                                <option value="traded">Inactive</option>
                            </select>
                            <p className="add-error-message">{formErrors?.itemStatus}</p>
                        </div>
                    </div>

                    {/* Item Description */}
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className={formErrors?.itemDescription ? "invalid-input" : ""}
                            value={itemForm.itemDescription}
                            onChange={(e) => handleChange("itemDescription", e.target.value)}
                            placeholder="Enter item description here..."
                        >
                        </textarea>
                        <p className="add-error-message">{formErrors?.itemDescription}</p>
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
            <div className="modal-table-wrapper">
                <div className="modal-table-container">
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
                            {linkedSuppliers.length > 0 ? (
                                linkedSuppliers.map((supplier) => (
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
                            ) : (
                                <tr>
                                    <td colSpan={6} className="no-data">No linked suppliers available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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