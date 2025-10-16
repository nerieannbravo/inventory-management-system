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
import { getCategories } from "@/app/lib/api";

import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface ItemForm {
    itemName: string,
    unitMeasureId: number,
    categoryId: number,
    itemStatus: string,  // ACTIVE or INACTIVE
    description: string,
    linkedSuppliers?: any[];
}

interface FormError {
    [key: string]: string;
}

interface AddItemModalProps {
    onSave: (itemForm: ItemForm) => void;
    onClose: () => void;
}

export default function AddItemModal({ onSave, onClose }: AddItemModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [activeRow, setActiveRow] = useState<any>(null);

    // State for linked suppliers list
    const [linkedSuppliers, setLinkedSuppliers] = useState<any[]>([]);

    // State for categories and unit measures
    const [categories, setCategories] = useState<any[]>([]);
    const [unitMeasures, setUnitMeasures] = useState<any[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingUnits, setLoadingUnits] = useState(true);
    const [selectedUnitAbbr, setSelectedUnitAbbr] = useState<string>("");

    // Search states for dropdowns
    const [unitSearchTerm, setUnitSearchTerm] = useState<string>("");
    const [categorySearchTerm, setCategorySearchTerm] = useState<string>("");
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Initial item form state
    const [itemForm, setItemForm] = useState<ItemForm>({
        itemName: "",
        unitMeasureId: 0,
        categoryId: 0,
        itemStatus: "ACTIVE",  // Default to ACTIVE
        description: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    // Filter and sort functions for searchable dropdowns
    const getFilteredUnits = () => {
        return unitMeasures
            .filter(unit => 
                unit.unitName.toLowerCase().includes(unitSearchTerm.toLowerCase()) ||
                unit.abbreviation?.toLowerCase().includes(unitSearchTerm.toLowerCase())
            )
            .sort((a, b) => a.unitName.localeCompare(b.unitName));
    };

    const getFilteredCategories = () => {
        return categories
            .filter(cat => 
                cat.categoryName.toLowerCase().includes(categorySearchTerm.toLowerCase())
            )
            .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    };

    const handleUnitSelect = (unit: any) => {
        handleChange("unitMeasureId", unit.id);
        setUnitSearchTerm(unit.unitName);
        setSelectedUnitAbbr(unit.abbreviation || unit.unitName);
        setShowUnitDropdown(false);
    };

    const handleCategorySelect = (category: any) => {
        handleChange("categoryId", category.id);
        setCategorySearchTerm(category.categoryName);
        setShowCategoryDropdown(false);
    };

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const data = await getCategories();
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

    // Fetch unit measures
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

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.searchable-dropdown')) {
                setShowUnitDropdown(false);
                setShowCategoryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [itemForm]);

    const handleChange = (field: string, value: any) => {
        setItemForm((prev) => ({ ...prev, [field]: value }));

        // When unit measure is selected, store the abbreviation for display
        if (field === "unitMeasureId") {
            const selected = unitMeasures.find(u => u.id === parseInt(value));
            if (selected) {
                setSelectedUnitAbbr(selected.abbreviation || selected.unitName || "");
            }
        }

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
        if (!itemForm.unitMeasureId || itemForm.unitMeasureId === 0) errors.unitMeasureId = "Canonical unit is required";
        if (!itemForm.categoryId || itemForm.categoryId === 0) errors.categoryId = "Category is required";
        if (!itemForm.itemStatus) errors.itemStatus = "Item status is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showItemSaveConfirmation();
        if (result.isConfirmed) {
            onSave({ ...itemForm, linkedSuppliers });
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

        // Add the new supplier to the list
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
    const handleEditLinkedSupplier = (updatedSupplier: LinkedSupplierForm & { id: number }) => {
        console.log("Updating supplier:", updatedSupplier);

        // Edit the supplier in the list
        setLinkedSuppliers(prevSuppliers =>
            prevSuppliers.map(supplier =>
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
                            className={formErrors?.itemName ? "invalid-input" : ""}
                            type="text"
                            value={itemForm.itemName}
                            onChange={(e) => handleChange("itemName", e.target.value)}
                            placeholder="Enter item name here..."
                        />
                        <p className="add-error-message">{formErrors?.itemName}</p>
                    </div>

                    <div className="form-row">
                        {/* Canonical Unit - Searchable Dropdown */}
                        <div className="form-group">
                            <label>Canonical Unit</label>
                            <div className="searchable-dropdown">
                                <input
                                    type="text"
                                    className={formErrors?.unitMeasureId ? "invalid-input" : ""}
                                    value={unitSearchTerm}
                                    onChange={(e) => {
                                        setUnitSearchTerm(e.target.value);
                                        setShowUnitDropdown(true);
                                    }}
                                    onFocus={() => setShowUnitDropdown(true)}
                                    placeholder="Search unit..."
                                    disabled={loadingUnits}
                                />
                                {showUnitDropdown && !loadingUnits && (
                                    <div className="dropdown-list">
                                        {getFilteredUnits().length > 0 ? (
                                            getFilteredUnits().map((unit: any) => (
                                                <div
                                                    key={unit.id}
                                                    className="dropdown-item"
                                                    onClick={() => handleUnitSelect(unit)}
                                                >
                                                    {unit.abbreviation} - {unit.unitName}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="dropdown-item disabled">No units found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="add-error-message">{formErrors?.unitMeasureId}</p>
                        </div>

                        {/* Category - Searchable Dropdown */}
                        <div className="form-group">
                            <label>Category</label>
                            <div className="searchable-dropdown">
                                <input
                                    type="text"
                                    className={formErrors?.categoryId ? "invalid-input" : ""}
                                    value={categorySearchTerm}
                                    onChange={(e) => {
                                        setCategorySearchTerm(e.target.value);
                                        setShowCategoryDropdown(true);
                                    }}
                                    onFocus={() => setShowCategoryDropdown(true)}
                                    placeholder="Search category..."
                                    disabled={loadingCategories}
                                />
                                {showCategoryDropdown && !loadingCategories && (
                                    <div className="dropdown-list">
                                        {getFilteredCategories().length > 0 ? (
                                            getFilteredCategories().map((cat: any) => (
                                                <div
                                                    key={cat.id}
                                                    className="dropdown-item"
                                                    onClick={() => handleCategorySelect(cat)}
                                                >
                                                    {cat.categoryName}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="dropdown-item disabled">No categories found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="add-error-message">{formErrors?.categoryId}</p>
                        </div>

                        {/* Item Status */}
                        <div className="form-group">
                            <label>Item Status</label>
                            <select
                                value={itemForm.itemStatus}
                                onChange={(e) => handleChange("itemStatus", e.target.value)}
                                className={formErrors?.itemStatus ? "invalid-input" : ""}
                            >
                                <option value="" disabled>Select item status...</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            <p className="add-error-message">{formErrors?.itemStatus}</p>
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
                        <th>Supplier Unit</th>
                        <th>Conversion</th>
                        <th>Unit Price</th>
                        <th>Delivery Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody className="modal-table-body">
                    {linkedSuppliers && linkedSuppliers.length > 0 ? (
                        linkedSuppliers.map(supplier => (
                            <tr key={supplier.id}>
                                <td>{supplier.linkedSupplierName}</td>
                                <td>{supplier.supplierUnitName || '—'}</td>
                                <td>
                                    {supplier.conversionFactor ? (
                                        <>1 {supplier.supplierUnitName} = {supplier.conversionFactor} {selectedUnitAbbr}</>
                                    ) : '—'}
                                </td>
                                <td>₱{supplier.unitPrice?.toFixed(2) || '0.00'}</td>
                                <td>{supplier.averageDeliveryTime || '—'}</td>
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
                            <td colSpan={6} style={{ textAlign: 'center' }}>No linked suppliers</td>
                        </tr>
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