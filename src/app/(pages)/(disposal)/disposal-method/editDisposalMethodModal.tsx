import React, { useState, useEffect } from "react";

import {
    showDisposalMethodUpdateConfirmation, showDisposalMethodSavedSuccess,
    showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

interface EditDisposalMethodModalProps {
    item: {
        id: number;
        disposalMethodName: string;
        disposalMethodDescription: string;
    };
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

export default function EditDisposalMethodModal({ item, onSave, onClose }: EditDisposalMethodModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        disposalMethodName: item.disposalMethodName,
        disposalMethodDescription: item.disposalMethodDescription
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
        if (!formData.disposalMethodName) errors.disposalMethodName = "Disposal method name is required";
        if (!formData.disposalMethodDescription) errors.disposalMethodDescription = "Disposal method description is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showDisposalMethodUpdateConfirmation(formData.disposalMethodName);
        if (result.isConfirmed) {
            onSave(formData);
            await showDisposalMethodSavedSuccess();
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
                <h1 className="modal-title">Edit Disposal Method</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* Edit Disposal Method Form */}
            <div className="modal-content edit">
                <form className="edit-form">
                    {/* Disposal Method Name */}
                    <div className="form-group">
                        <label>Disposal Method Name</label>
                        <input
                            className={formErrors?.disposalMethodName ? "invalid-input" : ""}
                            type="text"
                            value={formData.disposalMethodName}
                            onChange={(e) => handleChange("disposalMethodName", e.target.value)}
                            placeholder="Enter disposal method name here..."
                        />
                        <p className="edit-error-message">{formErrors?.disposalMethodName}</p>
                    </div>

                    {/* Disposal Method Description */}
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className={formErrors?.disposalMethodDescription ? "invalid-input" : ""}
                            value={formData.disposalMethodDescription}
                            onChange={(e) => handleChange("disposalMethodDescription", e.target.value)}
                            placeholder="Enter disposal method description here..."
                        />
                        <p className="edit-error-message">{formErrors?.disposalMethodDescription}</p>
                    </div>
                </form >
            </div >

            <div className="modal-actions">
                <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={!isFormDirty}>
                    <i className="ri-save-3-line" /> Update
                </button>
            </div>

        </>
    );
}