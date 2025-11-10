import React, { useState, useEffect, useCallback } from "react";

import ModalManager from "@/components/modalManager";
import ActionButtons from "@/components/actionButtons";
import EditCategoryModal from "./editCategoryModal";

import {
    showCategorySaveConfirmation, showCategorySavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";
import Swal from 'sweetalert2';

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


export default function AddCategoryModal({ onSave, onClose }: AddCategoryModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // State for category list
    type CategoryRow = { id: number; category_id?: string; categoryName: string; categoryDescription: string };
    const [categoryList, setCategoryList] = useState<CategoryRow[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Normalize incoming API/modal payload into CategoryRow
    const mapToCategoryRow = useCallback((raw: unknown): CategoryRow => {
        const obj = raw as Record<string, unknown>;
        const rawId = obj['id'] ?? obj['ID'] ?? obj['Id'] ?? 0;
        const id = Number(typeof rawId === 'number' || typeof rawId === 'string' ? rawId : 0);

        const category_id = typeof obj['category_id'] === 'string'
            ? obj['category_id'] as string
            : typeof obj['categoryId'] === 'string'
                ? obj['categoryId'] as string
                : undefined;

        const categoryName = typeof obj['category_name'] === 'string'
            ? obj['category_name'] as string
            : typeof obj['categoryName'] === 'string'
                ? obj['categoryName'] as string
                : typeof obj['name'] === 'string'
                    ? obj['name'] as string
                    : '';

        const categoryDescription = typeof obj['category_description'] === 'string'
            ? obj['category_description'] as string
            : typeof obj['categoryDescription'] === 'string'
                ? obj['categoryDescription'] as string
                : typeof obj['description'] === 'string'
                    ? obj['description'] as string
                    : '';

        return { id, category_id, categoryName, categoryDescription };
    }, []);

    // Fetch categories from backend and update local state; extracted so we can refresh after optimistic updates
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const res = await fetch('/api/category');
            const body = await res.json().catch(() => ({}));

            let items: unknown[] = [];
            if (Array.isArray(body)) items = body as unknown[];
            else if (Array.isArray(body?.categories)) items = body.categories as unknown[];
            else if (Array.isArray(body?.data)) items = body.data as unknown[];
            else if (body?.categories && typeof body.categories === 'object') items = [body.categories] as unknown[];

            const mapped: CategoryRow[] = items.map((c: unknown) => mapToCategoryRow(c));
            setCategoryList(mapped);
        } catch (err) {
            console.error('Failed to fetch categories', err);
            setFetchError('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    }, [mapToCategoryRow]);

    useEffect(() => {
        void fetchCategories();
    }, [fetchCategories]);

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

    const handleChange = (field: string, value: string) => {
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
            // Call API to create category
            try {
                const res = await fetch('/api/category', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category_name: categoryForm.categoryName, category_description: categoryForm.categoryDescription })
                });
                const body = await res.json().catch(() => ({}));
                if (res.status === 201) {
                    const createdRaw = body.category ?? body;
                    const createdRow = mapToCategoryRow(createdRaw);
                    // optimistic add
                    setCategoryList(prev => [createdRow, ...prev]);
                    onSave(createdRaw);
                    await showCategorySavedSuccess();
                    closeModal();

                    // refresh authoritative data
                    try {
                        await fetchCategories();
                    } catch (err) {
                        console.error('Refresh after create failed', err);
                    }
                } else if (res.status === 409) {
                    await Swal.fire({ icon: 'error', title: 'Duplicate Category', text: body?.error ?? 'Category name already exists' });
                } else {
                    await Swal.fire({ icon: 'error', title: 'Error', text: body?.error ?? `Failed to save category (status ${res.status})` });
                }
            } catch (err) {
                console.error('Failed to create category', err);
                await Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save category. Please try again.' });
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
    const openModal = (mode: "edit-category", rowData?: CategoryRow) => {
        let content;

        switch (mode) {
            case "edit-category":
                content = (
                    <EditCategoryModal
                        item={rowData!}
                        onSave={handleEditCategory}
                        onClose={closeModal}
                    />
                );
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

    // Handle edit category (optimistic update + refresh)
    const handleEditCategory = async (updatedCategoryRaw: unknown) => {
        const updatedCategory = mapToCategoryRow(updatedCategoryRaw);

        // optimistic update
        setCategoryList(prev => prev.map(category =>
            category.id === updatedCategory.id ? { ...category, ...updatedCategory } : category
        ));
        closeModal();

        // refresh authoritative data
        try {
            await fetchCategories();
        } catch (err) {
            console.error('Refresh after edit failed', err);
        }
    };

    

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

            {/* Table */}
            <table className="modal-table">
                <thead className="modal-table-heading">
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
                    ) : fetchError ? (
                        <tr>
                            <td colSpan={3} style={{ textAlign: 'center', color: 'var(--danger)' }}>{fetchError}</td>
                        </tr>
                    ) : categoryList.length === 0 ? (
                        <tr>
                            <td colSpan={3} style={{ textAlign: 'center' }}>No categories found.</td>
                        </tr>
                    ) : (
                        categoryList.map(category => (
                            <tr key={category.id}>
                                <td>{category.categoryName}</td>
                                <td>{category.categoryDescription ? category.categoryDescription : <span style={{ color: "red" }}>N/A</span>}</td>
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

            

            {/* Dynamic Modal Manager */}
            <ModalManager
                isOpen={isModalOpen}
                onClose={closeModal}
                modalContent={modalContent}
            />
        </>
    );
}