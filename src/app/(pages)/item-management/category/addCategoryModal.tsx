import React, { useState, useEffect } from "react";

import ModalManager from "@/components/modalManager";
import ActionButtons from "@/components/actionButtons";
import EditCategoryModal from "./editCategoryModal";

import {
    showCategorySaveConfirmation, showCategorySavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface CategoryForm {
    categoryName: string;
    categoryDescription: string;
}

interface FormError {
    [key: string]: string;
}

interface AddCategoryModalProps {
    onSave: (categoryForm: CategoryForm) => void;
    onClose: () => void;
}

// Sample category data - replace with your actual data source
const sampleCategoryList = [
    {
        id: 1,
        categoryName: "Category 1",
        categoryDescription: "Description for Category 1"
    },
    {
        id: 2,
        categoryName: "Category 2",
        categoryDescription: "Description for Category 2"
    }
];

export default function AddCategoryModal({ onSave, onClose }: AddCategoryModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [activeRow, setActiveRow] = useState<any>(null);

    // State for category list
    const [categoryList, setCategoryList] = useState(sampleCategoryList);

    // Initial category form state
    const [categoryForm, setCategoryForm] = useState<CategoryForm>({
        categoryName: "",
        categoryDescription: ""
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [categoryForm]);

    const handleChange = (field: string, value: any) => {
        setCategoryForm((prev) => ({ ...prev, [field]: value }));

        // Clear the error for that field
        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!categoryForm.categoryName) errors.categoryName = "Category name is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showCategorySaveConfirmation();
        if (result.isConfirmed) {
            // Generate a new ID for the category
            const newId = categoryList.length > 0 
                ? Math.max(...categoryList.map(c => c.id)) + 1 
                : 1;

            // Create the new category object with an ID
            const newCategory = {
                id: newId,
                categoryName: categoryForm.categoryName,
                categoryDescription: categoryForm.categoryDescription
            };

            // Add to the local list
            setCategoryList(prev => [...prev, newCategory]);

            // Call parent's onSave (for any external handling needed)
            onSave(categoryForm);

            // Show success message
            await showCategorySavedSuccess();

            // Reset the form but keep modal open
            setCategoryForm({
                categoryName: "",
                categoryDescription: ""
            });
            setIsDirty(false);
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

    // Modal management for category actions
    const openModal = (mode: "edit-category", rowData?: any) => {
        let content;

        switch (mode) {
            case "edit-category":
                content = (
                    <EditCategoryModal
                        item={rowData}
                        onSave={handleEditCategory}
                        onClose={closeModal}
                    />
                );
                break;
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

    // Handle edit category
    const handleEditCategory = (updatedCategory: any) => {
        const updatedList = categoryList.map(category =>
            category.id === updatedCategory.id ? updatedCategory : category
        );
        setCategoryList(updatedList);
        closeModal();
    }

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Add Category</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* For Category Details */}
            <div className="modal-content add">
                <form className="add-form">
                    {/* Category Name */}
                    <div className="form-group">
                        <label className="required">Category Name</label>
                        <input
                            className={formErrors?.categoryName ? "invalid-input" : ""}
                            type="text"
                            value={categoryForm.categoryName}
                            onChange={(e) => handleChange("categoryName", e.target.value)}
                            placeholder="Enter category name here..."
                        />
                        <p className="add-error-message">{formErrors?.categoryName}</p>
                    </div>

                    {/* Category Description */}
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className={formErrors?.categoryDescription ? "invalid-input" : ""}
                            value={categoryForm.categoryDescription}
                            onChange={(e) => handleChange("categoryDescription", e.target.value)}
                            placeholder="Enter category description here..."
                        >
                        </textarea>
                        <p className="add-error-message">{formErrors?.categoryDescription}</p>
                    </div>
                </form>
            </div>

            <div className="modal-actions">
                <button type="submit" className="submit-btn" onClick={handleSubmit}>
                    <i className="ri-save-3-line" /> Save
                </button>
            </div>

            {/* Category List */}
            <div className="details-header">
                <p className="details-title">Existing Categories</p>
            </div>

            {/* Table */}
            <div className="modal-table-wrapper">
                <div className="modal-table-container">
                    <table className="modal-table">
                        <thead className="modal-table-heading">
                            <tr>
                                <th>Category Name</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody className="modal-table-body">
                            {categoryList.length > 0 ? (
                                categoryList.map((category) => (
                                    <tr key={category.id}>
                                        <td>{category.categoryName}</td>
                                        <td>{category.categoryDescription}</td>
                                        <td>
                                            <ActionButtons
                                                onEdit={() => openModal("edit-category", category)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="no-data">No categories available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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