import React, { useState, useEffect } from "react";

import {
    showCategoryUpdateConfirmation, showCategoryUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";
import Swal from 'sweetalert2';

import "@/styles/forms.css";

interface EditCategoryModalProps {
    item: {
        id: number;
        categoryName: string;
        categoryDescription: string;
    };
    onSave: (updatedItem: { id: number; categoryName: string; categoryDescription: string }) => void;
    onClose: () => void;
}

export default function EditCategoryModal({ item, onSave, onClose }: EditCategoryModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        categoryName: item.categoryName,
        categoryDescription: item.categoryDescription
    });

    // State to track if form is dirty (has changes)
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [originalData] = useState({ ...formData });

    // Add formErrors state
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Check if form data has changed from original
    useEffect(() => {
        const hasChanges = JSON.stringify(originalData) !== JSON.stringify(formData);
        setIsFormDirty(hasChanges);
    }, [formData, originalData]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Validate inputs
        if (!formData.categoryName) errors.categoryName = "Category name is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showCategoryUpdateConfirmation(formData.categoryName);
        if (result.isConfirmed) {
            try {
                setSubmitting(true);
                const res = await fetch('/api/category', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: formData.id, category_name: formData.categoryName, category_description: formData.categoryDescription })
                });
                const body = await res.json().catch(() => ({}));
                if (res.ok) {
                    const updated = body.category ?? body;
                    onSave(updated);
                    await showCategoryUpdatedSuccess();
                    
                } else if (res.status === 409) {
                    await Swal.fire({ icon: 'error', title: 'Duplicate Category', text: body?.error ?? 'Category name already exists' });
                } else if (res.status === 400) {
                    await Swal.fire({ icon: 'error', title: 'Cannot edit category', text: body?.error ?? 'Category cannot be edited because it is linked or invalid' });
                } else {
                    await Swal.fire({ icon: 'error', title: 'Error', text: body?.error ?? `Failed to update category (status ${res.status})` });
                }
            } catch (err) {
                console.error('Failed to update category', err);
                await Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update category. Please try again.' });
            } finally {
                setSubmitting(false);
            }
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

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Edit Category</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* Edit Category Form */}
            <div className="modal-content edit">
                <form className="edit-form">
                    {/* Category Name */}
                    <div className="form-group">
                        <label>Category Name</label>
                        <input
                            className={formErrors?.categoryName ? "invalid-input" : ""}
                            type="text"
                            value={formData.categoryName}
                            onChange={(e) => handleChange("categoryName", e.target.value)}
                            placeholder="Enter category name here..."
                        />
                        <p className="edit-error-message">{formErrors?.categoryName}</p>
                    </div>

                    {/* Category Description */}
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className={formErrors?.categoryDescription ? "invalid-input" : ""}
                            value={formData.categoryDescription}
                            onChange={(e) => handleChange("categoryDescription", e.target.value)}
                            placeholder="Enter category description here..."
                        />
                        <p className="edit-error-message">{formErrors?.categoryDescription}</p>
                    </div>
                </form >
            </div >

            <div className="modal-actions">
                        <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={!isFormDirty || submitting}>
                            <i className="ri-save-3-line" /> Update
                        </button>
                    </div>

        </>
    );
}