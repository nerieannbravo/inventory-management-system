import React, { useState, useEffect } from "react";

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

interface EditItemModalProps {
    item: {
        id: number;
        itemName: string,
        itemUnit: string,
        itemCategory: string,
        itemStatus: string,
        // Additional fields would be included in a real application
    };
    onSave: (updatedItem: any) => void;
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

export default function EditItemModal({ item, onSave, onClose }: EditItemModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [activeRow, setActiveRow] = useState<any>(null);

    // State for linked suppliers list
    const [linkedSuppliers, setLinkedSuppliers] = useState(sampleLinkedSuppliers);

    // Initial item form state
    const [formData, setFormData] = useState({
        id: item.id,
        itemName: item.itemName,
        itemUnit: item.itemUnit,
        itemCategory: item.itemCategory,
        itemStatus: item.itemStatus,
        itemDescription: ""
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
        if (!formData.itemName) errors.itemName = "Item name is required";
        if (!formData.itemUnit) errors.itemUnit = "Item unit is required";
        if (!formData.itemCategory) errors.itemCategory = "Item category is required";
        if (!formData.itemStatus) errors.itemStatus = "Item status is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showItemUpdateConfirmation(formData.itemName);
        if (result.isConfirmed) {
            onSave(formData);
            await showItemUpdatedSuccess();
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
                            className={formErrors?.itemName ? "invalid-input" : ""}
                            type="text"
                            value={formData.itemName}
                            onChange={(e) => handleChange("itemName", e.target.value)}
                            placeholder="Enter item name here..."
                        />
                        <p className="edit-error-message">{formErrors?.itemName}</p>
                    </div>

                    <div className="form-row">
                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <input
                                className={formErrors?.itemUnit ? "invalid-input" : ""}
                                type="text"
                                value={formData.itemUnit || ""}
                                onChange={(e) => handleChange("itemUnit", e.target.value)}
                                placeholder="Enter unit measure here..."
                            />
                            <p className="edit-error-message">{formErrors?.itemUnit}</p>
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                className={formErrors?.itemCategory ? "invalid-input" : ""}
                                value={formData.itemCategory || ""}
                                onChange={(e) => handleChange("itemCategory", e.target.value)}
                            >
                                <option value="" disabled>Select category...</option>
                                <option value="Consumable">Consumable</option>
                                <option value="Tool">Tool</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Machine">Machine</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.itemCategory}</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                className={formErrors?.itemStatus ? "invalid-input" : ""}
                                value={formData.itemStatus || ""}
                                onChange={(e) => handleChange("itemStatus", e.target.value)}
                            >
                                <option value="" disabled>Select status...</option>
                                <option value="Available">Available</option>
                                <option value="Out of Stock">Out of Stock</option>
                                <option value="Discontinued">Discontinued</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.itemStatus}</p>
                        </div>
                    </div>

                    {/* Item Description */}
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className={`order ${formErrors?.itemDescription ? "invalid-input" : ""}`}
                            value={formData.itemDescription}
                            onChange={(e) => handleChange("itemDescription", e.target.value)}
                            placeholder="Enter item description here..."
                        >
                        </textarea>
                        <p className="edit-error-message">{formErrors?.ordReason}</p>
                    </div>
                </form >
            </div >

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
                    {linkedSuppliers.map(supplier => (
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