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
        itemStatus: string;  // ACTIVE or INACTIVE
        stockStatus?: string;  // For display only (auto-calculated)
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

    // State for categories and unit measures
    const [categories, setCategories] = useState<any[]>([]);
    const [unitMeasures, setUnitMeasures] = useState<any[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingUnits, setLoadingUnits] = useState(true);

    // Initial item form state
    const [formData, setFormData] = useState({
        id: item.id,
        itemId: item.itemId,
        itemName: item.itemName,
        unitMeasureId: item.unitMeasureId,
        unitMeasure: item.unitMeasure,
        categoryId: item.categoryId,
        category: item.category,
        itemStatus: item.itemStatus,  // ACTIVE or INACTIVE
        stockStatus: item.stockStatus,  // For display only
        description: item.description || ""
    });

    // State to track if form is dirty (has changes)
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [originalData] = useState({ ...formData });
    const [originalLinkedSuppliers] = useState(JSON.stringify(item.supplierItems || []));

    // Add formErrors state
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch categories and unit measures
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const response = await fetch('/api/category');
                const data = await response.json();
                if (data.success) {
                    setCategories(data.categories || []);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchUnitMeasures = async () => {
            try {
                setLoadingUnits(true);
                const response = await fetch('/api/unit-measure');
                const data = await response.json();
                if (data.success) {
                    setUnitMeasures(data.unitMeasures || []);
                }
            } catch (err) {
                console.error('Error fetching unit measures:', err);
            } finally {
                setLoadingUnits(false);
            }
        };
        fetchUnitMeasures();
    }, []);

    // Check if form data or linked suppliers have changed from original
    useEffect(() => {
        const formChanged = JSON.stringify(originalData) !== JSON.stringify(formData);
        const linkedSuppliersChanged = originalLinkedSuppliers !== JSON.stringify(linkedSuppliers);
        setIsFormDirty(formChanged || linkedSuppliersChanged);
    }, [formData, linkedSuppliers, originalData, originalLinkedSuppliers]);

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
        if (!formData.itemStatus) errors.itemStatus = "Item status is required";

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
                        existingLinkedSuppliers={linkedSuppliers}
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

        // Add the new supplier to the list with full supplier object for status display
        const newSupplier = {
            id: linkedSuppliers.length + 1,
            supplierId: linkedSupplierForm.supplierId,
            linkedSupplierName: linkedSupplierForm.linkedSupplierName,
            supplierUnitMeasureId: linkedSupplierForm.supplierUnitMeasureId,
            supplierUnitName: linkedSupplierForm.supplierUnitName,
            conversionFactor: linkedSupplierForm.conversionFactor,
            unitPrice: linkedSupplierForm.unitPrice,
            averageDeliveryTime: linkedSupplierForm.averageDeliveryTime,
            notes: linkedSupplierForm.notes,
            supplier: linkedSupplierForm.supplier // Include full supplier object with status
        };
        setLinkedSuppliers([...linkedSuppliers, newSupplier]);
        closeModal();
    };

    // Handle edit linked supplier
    const handleEditLinkedSupplier = (updatedSupplier: any) => {
        console.log("Updating supplier:", updatedSupplier);

        // Edit the supplier in the list with all updated fields
        setLinkedSuppliers((prevSuppliers: any) =>
            prevSuppliers.map((supplier: any) =>
                supplier.id === updatedSupplier.id
                    ? {
                        ...supplier,
                        supplierId: updatedSupplier.supplierId, // Preserve string supplierId (SUP-XXXX)
                        linkedSupplierName: updatedSupplier.linkedSupplierName,
                        supplierUnitMeasureId: updatedSupplier.supplierUnitMeasureId,
                        supplierUnitName: updatedSupplier.supplierUnitName,
                        conversionFactor: updatedSupplier.conversionFactor,
                        unitPrice: updatedSupplier.unitPrice,
                        averageDeliveryTime: updatedSupplier.averageDeliveryTime,
                        notes: updatedSupplier.notes,
                        // Preserve the supplier object structure for proper display and saving
                        supplier: supplier.supplier // Keep original supplier object with status
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
                            <label>Unit Measure <span className="required">*</span></label>
                            <select
                                className={formErrors?.unitMeasureId ? "invalid-input" : ""}
                                value={formData.unitMeasureId || ""}
                                onChange={(e) => {
                                    const selectedId = parseInt(e.target.value);
                                    const selectedUnit = unitMeasures.find(u => u.id === selectedId);
                                    handleChange("unitMeasureId", selectedId);
                                    if (selectedUnit) {
                                        setFormData(prev => ({
                                            ...prev,
                                            unitMeasure: selectedUnit
                                        }));
                                    }
                                }}
                                disabled={loadingUnits}
                            >
                                <option value="" disabled>
                                    {loadingUnits ? "Loading units..." : "Select unit measure..."}
                                </option>
                                {unitMeasures.map((unit: any) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.abbreviation} - {unit.unitName}
                                    </option>
                                ))}
                            </select>
                            <p className="edit-error-message">{formErrors?.unitMeasureId}</p>
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label>Category <span className="required">*</span></label>
                            <select
                                className={formErrors?.categoryId ? "invalid-input" : ""}
                                value={formData.categoryId || ""}
                                onChange={(e) => {
                                    const selectedId = parseInt(e.target.value);
                                    const selectedCategory = categories.find(c => c.id === selectedId);
                                    handleChange("categoryId", selectedId);
                                    if (selectedCategory) {
                                        setFormData(prev => ({
                                            ...prev,
                                            category: selectedCategory
                                        }));
                                    }
                                }}
                                disabled={loadingCategories}
                            >
                                <option value="" disabled>
                                    {loadingCategories ? "Loading categories..." : "Select category..."}
                                </option>
                                {categories.map((category: any) => (
                                    <option key={category.id} value={category.id}>
                                        {category.categoryName}
                                    </option>
                                ))}
                            </select>
                            <p className="edit-error-message">{formErrors?.categoryId}</p>
                        </div>

                        {/* Item Status */}
                        <div className="form-group">
                            <label>Item Status <span className="required">*</span></label>
                            <select
                                value={formData.itemStatus}
                                onChange={(e) => handleChange("itemStatus", e.target.value)}
                                className={formErrors?.itemStatus ? "invalid-input" : ""}
                            >
                                <option value="" disabled>Select item status...</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.itemStatus}</p>
                            <p className="field-hint">Set whether this item is active or inactive in the system</p>
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
                        <th>Supplier Unit</th>
                        <th>Conversion</th>
                        <th>Unit Price</th>
                        <th>Delivery Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody className="modal-table-body">
                    {linkedSuppliers && linkedSuppliers.length > 0 ? (
                        linkedSuppliers.map((supplier: any) => (
                            <tr key={supplier.id}>
                                <td>{supplier.supplier?.supplierName || supplier.linkedSupplierName || '—'}</td>
                                <td>{supplier.supplierUnitMeasure?.abbreviation || supplier.supplierUnitName || '—'}</td>
                                <td>
                                    {supplier.conversionFactor ? (
                                        <>1 {supplier.supplierUnitMeasure?.abbreviation || supplier.supplierUnitName} = {supplier.conversionFactor} {formData.unitMeasure?.abbreviation}</>
                                    ) : '—'}
                                </td>
                                <td>₱{supplier.unitPrice?.toFixed(2) || '0.00'}</td>
                                <td>{supplier.averageDeliveryTime || supplier.deliveryTime || '—'}</td>
                                <td>
                                    <span className={`chip ${(supplier.supplier?.status || '').toLowerCase()}`}>
                                        {supplier.supplier?.status || 'N/A'}
                                    </span>
                                </td>
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
                            <td colSpan={8} style={{ textAlign: 'center' }}>No linked suppliers</td>
                        </tr>
                    )}
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