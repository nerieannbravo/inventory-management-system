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

type SupplierFormData = {
    id: number;
    supplier_name: string,
    street: string,
    barangay: string,
    city: string,
    province: string,
    contact_number: string,
    email: string,
    status: string,
    remarks: string,
};

interface EditSupplierModalProps {
    supplier: {
        id: number;
        supplier_name: string,
        street: string,
        barangay: string,
        city: string,
        province: string,
        contact_number: string,
        email: string,
        status: string,
        remarks: string,
        // Additional fields would be included in a real application
    };
    onSave: (updatedItem: SupplierFormData) => void;
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

export default function EditSupplierModal({ supplier, onSave, onClose }: EditSupplierModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // State for linked items list
    const [linkedItems, setLinkedItems] = useState(sampleLinkedItems);

    // Initial supplier form state
    const [formData, setFormData] = useState<SupplierFormData>({
        id: supplier.id,
        supplier_name: supplier.supplier_name,
        street: supplier.street,
        barangay: supplier.barangay,
        city: supplier.city,
        province: supplier.province,
        contact_number: supplier.contact_number,
        email: supplier.email,
        status: supplier.status,
        remarks: supplier.remarks,
    });

    useEffect(() => {
        setFormData({
            id: supplier.id,
            supplier_name: supplier.supplier_name,
            street: supplier.street,
            barangay: supplier.barangay,
            city: supplier.city,
            province: supplier.province,
            contact_number: supplier.contact_number,
            email: supplier.email,
            status: supplier.status,
            remarks: supplier.remarks,
        });
    }, [supplier]);

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

    const handleChange = (field: keyof SupplierFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Validate inputs
        if (!formData.supplier_name) errors.supplier_name = "Supplier name is required";
        if (!formData.contact_number) {
            errors.contact_number = "Contact number is required";
        } else if (!/^\d{11}$/.test(formData.contact_number)) {
            errors.contact_number = "Contact number must be exactly 11 digits";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Invalid email format";
        } 
        // else if (!formData.email) {
        //     errors.email = "Email is required";
        // }
        if (!formData.status) errors.status = "Status is required";
        if (!formData.street) errors.street = "Street is required";
        if (!formData.barangay) errors.barangay = "Barangay is required";
        if (!formData.city) errors.city = "City is required";
        if (!formData.province) errors.province = "Province is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showSupplierUpdateConfirmation(formData.supplier_name);
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
    const openModal = (mode: "add-linkedItem" | "edit-linkedItem" | "delete-linkedItem", rowData?: typeof sampleLinkedItems[number]) => {
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
                            className={formErrors?.supplier_name ? "invalid-input" : ""}
                            type="text"
                            value={formData.supplier_name}
                            onChange={(e) => handleChange("supplier_name", e.target.value)}
                            placeholder="Enter supplier name here..."
                        />
                        <p className="edit-error-message">{formErrors?.supplier_name}</p>
                    </div>

                    <div className="form-row">
                        {/* Supplier Contact */}
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input
                                className={formErrors?.contact_number ? "invalid-input" : ""}
                                type="text"
                                value={formData.contact_number}
                                onChange={(e) => handleChange("contact_number", e.target.value)}
                                placeholder="Enter contact number here..."
                                maxLength={11}
                            />
                            <p className="edit-error-message">{formErrors?.contact_number}</p>
                        </div>

                        {/* Supplier Email */}
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

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                                className={formErrors?.status ? "invalid-input" : ""}
                            >
                                <option value="" disabled>Select status...</option>
                                <option value="sold">Active</option>
                                <option value="traded">Inactive</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.status}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Street */}
                        <div className="form-group">
                            <label>Street</label>
                            <input
                                className={formErrors?.street ? "invalid-input" : ""}
                                type="text"
                                value={formData.street}
                                onChange={(e) => handleChange("street", e.target.value)}
                                placeholder="Enter street here..."
                            />
                            <p className="edit-error-message">{formErrors?.street}</p>
                        </div>

                        {/* Barangay */}
                        <div className="form-group">
                            <label>Barangay</label>
                            <input
                                className={formErrors?.barangay ? "invalid-input" : ""}
                                type="text"
                                value={formData.barangay}
                                onChange={(e) => handleChange("barangay", e.target.value)}
                                placeholder="Enter barangay here..."
                            />
                            <p className="edit-error-message">{formErrors?.barangay}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* City */}
                        <div className="form-group">
                            <label>City</label>
                            <input
                                className={formErrors?.city ? "invalid-input" : ""}
                                type="text"
                                value={formData.city}
                                onChange={(e) => handleChange("city", e.target.value)}
                                placeholder="Enter city here..."
                            />
                            <p className="edit-error-message">{formErrors?.city}</p>
                        </div>

                        {/* Province */}
                        <div className="form-group">
                            <label>Province</label>
                            <input
                                className={formErrors?.province ? "invalid-input" : ""}
                                type="text"
                                value={formData.province}
                                onChange={(e) => handleChange("province", e.target.value)}
                                placeholder="Enter province here..."
                            />
                            <p className="edit-error-message">{formErrors?.province}</p>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Remarks</label>
                        <input
                            className={formErrors?.remarks ? "invalid-input" : ""}
                            type="text"
                            value={formData.remarks}
                            onChange={(e) => handleChange("remarks", e.target.value)}
                            placeholder="Enter remarks here..."
                        />
                        <p className="edit-error-message">{formErrors?.remarks}</p>
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