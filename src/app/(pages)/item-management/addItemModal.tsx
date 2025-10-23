import React, { useState, useEffect } from "react";

import ModalManager from "@/components/modalManager";
import ActionButtons from "@/components/actionButtons";
import SearchableDropdown from "@/components/searchableDropdown";

import AddLinkedSupplierModal, { LinkedSupplierForm } from "./linked-supplier/addLinkedSupplierModal";
import EditLinkedSupplierModal from "./linked-supplier/editLinkedSupplierModal";

import {
    showItemSaveConfirmation, showItemSavedSuccess,
    showCloseWithoutSavingConfirmation,
    showDeleteLinkedSupplierConfirmation, showDeleteLinkedSupplierSuccess
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface ItemForm {
    itemName: string,
    itemUnitMeasure: string,
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
        supplierUnitMeasure: "pcs",
        conversionFactor: 1,
        unitPrice: 50,
        deliveryTime: "1 week"
    },
    {
        id: 2,
        linkedSupplierName: "Supplier 2",
        supplierUnitMeasure: "btl",
        conversionFactor: 1,
        unitPrice: 40,
        deliveryTime: "5 days"
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
        itemUnitMeasure: "",
        itemCategory: "",
        itemStatus: "",
        itemDescription: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    // Define unit measure options
    const unitMeasureOptions = [
        { id: 1, label: "Bags (bag)", value: "bag" },
        { id: 2, label: "Bottles (btl)", value: "btl" },
        { id: 3, label: "Boxes (box)", value: "box" },
        { id: 4, label: "Cans (can)", value: "can" },
        { id: 5, label: "Cartons (ctn)", value: "ctn" },
        { id: 6, label: "Centimeters (cm)", value: "cm" },
        { id: 7, label: "Gallons (gal)", value: "gal" },
        { id: 8, label: "Grams (g)", value: "g" },
        { id: 9, label: "Kilograms (kg)", value: "kg" },
        { id: 10, label: "Liters (L)", value: "L" },
        { id: 11, label: "Meters (m)", value: "m" },
        { id: 12, label: "Pairs (pr)", value: "pr" },
        { id: 13, label: "Pieces (pcs)", value: "pcs" },
        { id: 14, label: "Rolls (roll)", value: "roll" },
        { id: 15, label: "Sets (set)", value: "set" },
    ];

    // Define category options
    const categoryOptions = [
        { id: 1, label: "Consumable", value: "Consumable" },
        { id: 2, label: "Tool", value: "Tool" },
        { id: 3, label: "Machine", value: "Machine" },
        { id: 4, label: "Equipment", value: "Equipment" },
    ];

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
        if (!itemForm.itemUnitMeasure) errors.itemUnitMeasure = "Item unit is required";
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
            supplierUnitMeasure: linkedSupplierForm.supplierUnitMeasure,
            conversionFactor: linkedSupplierForm.conversionFactor,
            unitPrice: linkedSupplierForm.unitPrice,
            deliveryTime: linkedSupplierForm.deliveryTime
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
                        supplierUnitMeasure: updatedSupplier.supplierUnitMeasure,
                        conversionFactor: updatedSupplier.conversionFactor,
                        unitPrice: updatedSupplier.unitPrice,
                        deliveryTime: updatedSupplier.deliveryTime
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
                            <SearchableDropdown
                                options={unitMeasureOptions}
                                value={itemForm.itemUnitMeasure}
                                onChange={(selected, customValue) => {
                                    const value = selected ? selected.value : customValue || "";
                                    handleChange("itemUnitMeasure", value);
                                }}
                                placeholder="Search unit measure..."
                                error={formErrors?.itemUnitMeasure}
                                allowCustom={false}
                                noResultsText="No unit measure found"
                            />
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label className="required">Category</label>
                            <SearchableDropdown
                                options={categoryOptions}
                                value={itemForm.itemCategory}
                                onChange={(selected, customValue) => {
                                    const value = selected ? selected.value : customValue || "";
                                    handleChange("itemCategory", value);
                                }}
                                placeholder="Search unit measure..."
                                error={formErrors?.itemCategory}
                                allowCustom={false}
                                noResultsText="No category found"
                            />
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
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
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
                                <th>Supplier Unit</th>
                                <th>Conversion</th>
                                <th>Unit Price</th>
                                <th>Delivery Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="modal-table-body">
                            {linkedSuppliers.length > 0 ? (
                                linkedSuppliers.map((supplier) => (
                                    <tr key={supplier.id}>
                                        <td>{supplier.linkedSupplierName}</td>
                                        <td>{supplier.supplierUnitMeasure}</td>
                                        <td>
                                            {supplier.conversionFactor ? (
                                                <>1 {supplier.supplierUnitMeasure} = {supplier.conversionFactor} {itemForm.itemUnitMeasure}</>
                                            ) : '—'}
                                        </td>
                                        <td>₱{supplier.unitPrice?.toFixed(2)}</td>
                                        <td>{supplier.deliveryTime || '—'}</td>
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