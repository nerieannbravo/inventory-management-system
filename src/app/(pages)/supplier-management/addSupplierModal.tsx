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
    supplier_name: string,
    street: string,
    barangay: string,
    city: string,
    province: string,
    contact_number: string,
    email: string,
    status: string,
    remarks: string,
}

interface FormError {
    [key: string]: string;
}

interface AddSupplierModalProps {
    onSave: (createdSupplier: SupplierForm) => void;
    onClose: () => void;
}

// Sample linked supplier data - replace with your actual data source
const samplelinkeditems = [
    {
        id: 1,
        linkedItemName: "Item 1",
        itemUnit: "liters",
        unitPrice: 100,
        itemCategory: "Consumable",
    },
    {
        id: 2,
        linkedItemName: "Item 2",
        itemUnit: "pcs",
        unitPrice: 1500,
        itemCategory: "Tool",
    }
];

export default function AddSupplierModal({ onSave, onClose }: AddSupplierModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // State for linked suppliers list
    const [linkeditems, setlinkeditems] = useState(samplelinkeditems);

    // Initial supplier form state
    const [supplierForm, setSupplierForm] = useState<SupplierForm>({
        supplier_name: "",
        street: "",
        barangay: "",
        city: "",
        province: "",
        contact_number: "",
        email: "",
        status: "",
        remarks: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);


    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [supplierForm]);

    const handleChange = (field: string, value: string) => {
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

        if (!supplierForm.supplier_name) errors.supplier_name = "Supplier name is required";
        if (!supplierForm.contact_number) {
            errors.contact_number = "Contact number is required";
        } else if (!/^\d{11}$/.test(supplierForm.contact_number)) {
            errors.contact_number = "Contact number must be exactly 11 digits";
        }
        // Email is optional, but if provided must be valid
        if (supplierForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierForm.email)) {
            errors.email = "Invalid email format";
        }
        if (!supplierForm.status) errors.status = "Status is required";
        if (!supplierForm.street) errors.street = "Street is required";
        if (!supplierForm.barangay) errors.barangay = "Barangay is required";
        if (!supplierForm.city) errors.city = "City is required";
        if (!supplierForm.province) errors.province = "Province is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showSupplierSaveConfirmation();
        if (!result.isConfirmed) return;

        // Map UI values to backend enum values (keep legacy mappings as well)
        const statusMap: Record<string, string> = {
            sold: 'ACTIVE',
            traded: 'INACTIVE',
            Active: 'ACTIVE',
            Inactive: 'INACTIVE'
        };

        const payload = {
            supplier_name: supplierForm.supplier_name,
            contact_number: supplierForm.contact_number,
            email: supplierForm.email ?? undefined,
            status: statusMap[supplierForm.status] ?? undefined,
            street: supplierForm.street ?? undefined,
            barangay: supplierForm.barangay ?? undefined,
            city: supplierForm.city ?? undefined,
            province: supplierForm.province ?? undefined,
        };

        try {
            setIsSubmitting(true);
            const res = await fetch('/api/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const body = await res.json().catch(() => ({}));
            if (res.status === 201) {
                const created = body;
                // pass created supplier to parent so the UI can insert it
                onSave(created);
                await showSupplierSavedSuccess();
                closeModal();
            } else {
                const msg = body?.error ?? `Failed to save supplier (status ${res.status})`;
                setApiError(String(msg));
            }
        } catch (err) {
            console.error('Failed to POST /api/suppliers', err);
            setApiError('An error occurred while saving the supplier.');
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

    type LinkedItemRow = {
        id: number;
        linkedItemName: string;
        itemUnit: string;
        unitPrice: number;
        itemCategory: string;
    };

    // Modal management for supplier actions (add, edit, delete, etc.)
    const openModal = (mode: "add-linkedItem" | "edit-linkedItem" | "delete-linkedItem", rowData?: LinkedItemRow) => {
        let content: React.ReactNode = null;

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
                if (rowData) {
                    content = (
                        <EditLinkedItemModal
                            item={rowData}
                            onSave={handleEditLinkedItem}
                            onClose={closeModal}
                        />
                    );
                }
                break;
            case "delete-linkedItem":
                if (rowData) {
                    handleDeleteItem(rowData.id);
                }
                break;
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

    // Handle add linked item
    const handleAddLinkedItem = (linkedItemForm: LinkedItemForm) => {
        console.log("New linked item:", linkedItemForm);

        const newitem = {
            id: linkeditems.length + 1,
            linkedItemName: linkedItemForm.linkedItemName,
            itemCategory: linkedItemForm.itemCategory,
            itemUnit: linkedItemForm.itemUnit,
            unitPrice: linkedItemForm.unitPrice
        };
        setlinkeditems([...linkeditems, newitem]);
        closeModal();
    };

    // Handle edit linked item
    const handleEditLinkedItem = (updatedItem: LinkedItemForm & { id: number }) => {
        console.log("Updating linked item:", updatedItem);

        setlinkeditems(previtems =>
            previtems.map(item =>
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
            setlinkeditems(prev => prev.filter(i => i.id !== itemId));
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
                            className={formErrors?.supplier_name ? "invalid-input" : ""}
                            type="text"
                            value={supplierForm.supplier_name}
                            onChange={(e) => handleChange("supplier_name", e.target.value)}
                            placeholder="Enter supplier name here..."
                        />
                        <p className="add-error-message">{formErrors?.supplier_name}</p>
                    </div>

                    <div className="form-row">
                        {/* Supplier Contact */}
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input
                                className={formErrors?.contact_number ? "invalid-input" : ""}
                                type="text"
                                value={supplierForm.contact_number}
                                onChange={(e) => handleChange("contact_number", e.target.value)}
                                placeholder="Enter contact number here..."
                                maxLength={11}
                            />
                            <p className="add-error-message">{formErrors?.contact_number}</p>
                        </div>

                        {/* Supplier Email */}
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

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={supplierForm.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                                className={formErrors?.status ? "invalid-input" : ""}
                            >
                                <option value="" disabled>Select status...</option>
                                <option value="sold">Active</option>
                                <option value="traded">Inactive</option>
                            </select>
                            <p className="add-error-message">{formErrors?.status}</p>
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
                        <div className="form-group">
                        <label>Remarks</label>
                        <input
                            className={formErrors?.remarks ? "invalid-input" : ""}
                            type="text"
                            value={supplierForm.remarks}
                            onChange={(e) => handleChange("remarks", e.target.value)}
                            placeholder="Enter remarks here..."
                        />
                        <p className="add-error-message">{formErrors?.remarks}</p>
                    </div>
                </form>
            </div>

            {/* Linked suppliers */}
            <div className="details-header">
                <p className="details-title">Linked supplier/s</p>
                <button className="modal-table-add-btn" onClick={() => openModal("add-linkedItem")}>
                    <i className="ri-add-line" /> Add supplier
                </button>
            </div>

            {/* Table */}
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
                    {linkeditems.map(item => (
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