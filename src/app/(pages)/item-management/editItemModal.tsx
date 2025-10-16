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
        itemId: string;
        itemName: string;
        unitMeasureId: number;
        unitMeasure?: {
            id: number;
            abbreviation?: string;
            unitName?: string;
        };
        categoryId: number;
        category?: {
            categoryId: string;
            categoryName: string;
        };
        status: string;
        description?: string;
        supplierItems?: any[];
    };
    onSave: (updatedItem: any & { linkedSuppliers?: any[] }) => void;
    onClose: () => void;
}

export default function EditItemModal({ item, onSave, onClose }: EditItemModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [activeRow, setActiveRow] = useState<any>(null);

    // State for linked suppliers list (from item.supplierItems)
    const [linkedSuppliers, setLinkedSuppliers] = useState<any[]>(item.supplierItems || []);

    // Initial item form state
    const [formData, setFormData] = useState({
        id: item.id,
        itemId: item.itemId,
        itemName: item.itemName,
        unitMeasureId: item.unitMeasureId,
        unitMeasure: item.unitMeasure,
        categoryId: item.categoryId,
        category: item.category,
        status: item.status,
        description: item.description || ""
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
        if (!formData.unitMeasureId) errors.unitMeasureId = "Unit measure is required";
        if (!formData.categoryId) errors.categoryId = "Category is required";
        if (!formData.status) errors.status = "Status is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showItemUpdateConfirmation(formData.itemName);
        if (result.isConfirmed) {
            onSave({ ...formData, linkedSuppliers });
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
                        itemCategory={formData.category?.categoryName}
                        itemUnitMeasure={formData.unitMeasure?.abbreviation || formData.unitMeasure?.unitName}
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
            supplierId: linkedSupplierForm.supplierId,
            linkedSupplierName: linkedSupplierForm.linkedSupplierName,
            supplierUnitMeasureId: linkedSupplierForm.supplierUnitMeasureId,
            supplierUnitName: linkedSupplierForm.supplierUnitName,
            conversionFactor: linkedSupplierForm.conversionFactor,
            unitPrice: linkedSupplierForm.unitPrice,
            averageDeliveryTime: linkedSupplierForm.averageDeliveryTime,
            isPreferred: linkedSupplierForm.isPreferred,
            notes: linkedSupplierForm.notes
        };
        setLinkedSuppliers([...linkedSuppliers, newSupplier]);
        closeModal();
    };

    // Handle edit linked supplier
    const handleEditLinkedSupplier = (updatedSupplier: any) => {
        console.log("Updating supplier:", updatedSupplier);

        // Edit the supplier to the list (can be replaced with actual data handling logic)
        setLinkedSuppliers((prevSuppliers: any) =>
            prevSuppliers.map((supplier: any) =>
                supplier.id === updatedSupplier.id
                    ? {
                        ...supplier,
                        linkedSupplierName: updatedSupplier.linkedSupplierName,
                        supplierUnitMeasureId: updatedSupplier.supplierUnitMeasureId,
                        supplierUnitName: updatedSupplier.supplierUnitName,
                        conversionFactor: updatedSupplier.conversionFactor,
                        unitPrice: updatedSupplier.unitPrice,
                        averageDeliveryTime: updatedSupplier.averageDeliveryTime,
                        isPreferred: updatedSupplier.isPreferred,
                        notes: updatedSupplier.notes
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
                                disabled
                                type="text"
                                value={formData.unitMeasure?.abbreviation || formData.unitMeasure?.unitName || ""}
                                placeholder="Unit measure..."
                            />
                            <p className="field-hint">Unit measure cannot be changed after creation</p>
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label>Category</label>
                            <input
                                disabled
                                type="text"
                                value={formData.category?.categoryName || ""}
                                placeholder="Category..."
                            />
                            <p className="field-hint">Category cannot be changed after creation</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <input
                                disabled
                                type="text"
                                value={formData.status || ""}
                                placeholder="Status..."
                            />
                            <p className="field-hint">Status is automatically calculated based on stock and conditions</p>
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
                        <p className="edit-error-message">{formErrors?.description}</p>
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
                        <th>Category</th>
                        <th>Supplier Unit</th>
                        <th>Conversion</th>
                        <th>Unit Price</th>
                        <th>Delivery Time</th>
                        <th>Is Preferred</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody className="modal-table-body">
                    {linkedSuppliers.map((supplier: any) => (
                        <tr key={supplier.id}>
                            <td>{supplier.supplier?.supplierName || supplier.linkedSupplierName || '—'}</td>
                            <td>{formData.category?.categoryName || '—'}</td>
                            <td>{supplier.supplierUnitName || supplier.supplierUnit || '—'}</td>
                            <td>
                                {supplier.conversionFactor ? (
                                    <>1 {supplier.supplierUnitName} = {supplier.conversionFactor} {formData.unitMeasure?.abbreviation}</>
                                ) : '—'}
                            </td>
                            <td>₱{supplier.unitPrice?.toFixed(2) || '0.00'}</td>
                            <td>{supplier.averageDeliveryTime || supplier.deliveryTime || '—'}</td>
                            <td>
                                {supplier.isPreferred && (
                                    <span className="chip preferred">⭐ Preferred</span>
                                )}
                            </td>
                            <td>{supplier.notes || '—'}</td>
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