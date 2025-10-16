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

interface Category {
    id: number;
    categoryId: string;
    categoryName: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
}

interface FormError {
    [key: string]: string;
}

interface AddCategoryModalProps {
    onSave: (categoryForm: CategoryForm) => void;
    onClose: () => void;
}

export default function AddCategoryModal({ onSave, onClose }: AddCategoryModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [activeRow, setActiveRow] = useState<any>(null);

    // State for category list
    const [categoryList, setCategoryList] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial category form state
    const [categoryForm, setCategoryForm] = useState<CategoryForm>({
        categoryName: "",
        categoryDescription: ""
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    // Fetch categories from database on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/category');
                const data = await response.json();
                
                if (data.success) {
                    setCategoryList(data.categories);
                } else {
                    console.error('Failed to fetch categories:', data.error);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

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
        if (!categoryForm.categoryDescription) errors.categoryDescription = "Category description is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showCategorySaveConfirmation();
        if (result.isConfirmed) {
            try {
                const response = await fetch('/api/category', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(categoryForm),
                });

                const data = await response.json();

                if (data.success) {
                    // Add the new category to the list
                    setCategoryList(prev => [...prev, data.category]);
                    
                    // Reset form
                    setCategoryForm({
                        categoryName: "",
                        categoryDescription: ""
                    });
                    setIsDirty(false);

                    // Call parent onSave callback
                    onSave(categoryForm);
                    
                    await showCategorySavedSuccess();
                } else {
                    // Show error using sweetAlert if available, or console.error
                    console.error('Error saving category:', data.error);
                    alert(data.error || 'Failed to save category');
                }
            } catch (error: any) {
                console.error('Error saving category:', error);
                alert(error.message || 'An error occurred while saving the category');
            }
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
    const handleEditCategory = (updatedCategory: Category) => {
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
                        <label>Category Name</label>
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

            {/* Table with Scrollable Container */}
            <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto', 
                overflowX: 'hidden',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <table className="modal-table" style={{ marginBottom: '0' }}>
                    <thead className="modal-table-heading" style={{ 
                        position: 'sticky', 
                        top: '0', 
                        backgroundColor: '#fff',
                        zIndex: 1
                    }}>
                        <tr>
                            <th>Category Name</th>
                            <th>Description</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody className="modal-table-body">
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'center' }}>Loading categories...</td>
                            </tr>
                        ) : categoryList.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'center' }}>No categories found</td>
                            </tr>
                        ) : (
                            categoryList.map(category => (
                                <tr key={category.id}>
                                    <td>{category.categoryName}</td>
                                    <td>{category.description}</td>
                                    <td>
                                        <ActionButtons
                                            onEdit={() => openModal("edit-category", category)}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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