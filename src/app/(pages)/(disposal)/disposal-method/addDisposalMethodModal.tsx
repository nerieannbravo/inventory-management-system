import React, { useState, useEffect } from "react";

import ModalManager from "@/components/modalManager";
import ActionButtons from "@/components/actionButtons";
import EditDisposalMethodModal from "./editDisposalMethodModal";

import {
    showDisposalMethodSaveConfirmation, showDisposalMethodSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface DisposalMethodForm {
    disposalMethodName: string;
    disposalMethodDescription: string;
}

interface FormError {
    [key: string]: string;
}

interface AddDisposalMethodModalProps {
    onSave: (disposalMethodForm: DisposalMethodForm) => void;
    onClose: () => void;
}

// Sample disposal method data - replace with your actual data source
const sampleDisposalMethodList = [
    {
        id: 1,
        disposalMethodName: "Sold",
        disposalMethodDescription: "Description for Sold"
    },
    {
        id: 2,
        disposalMethodName: "Donated",
        disposalMethodDescription: "Description for Donated"
    },
    {
        id: 3,
        disposalMethodName: "Discarded",
        disposalMethodDescription: "Description for Discarded"
    },
    {
        id: 4,
        disposalMethodName: "Scrapped",
        disposalMethodDescription: "Description for Scrapped"
    }
];

export default function AddDisposalMethodModal({ onSave, onClose }: AddDisposalMethodModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [activeRow, setActiveRow] = useState<any>(null);

    // State for disposal method list
    const [disposalMethodList, setDisposalMethodList] = useState(sampleDisposalMethodList);

    // Initial disposal method form state
    const [disposalMethodForm, setDisposalMethodForm] = useState<DisposalMethodForm>({
        disposalMethodName: "",
        disposalMethodDescription: ""
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [disposalMethodForm]);

    const handleChange = (field: string, value: any) => {
        setDisposalMethodForm((prev) => ({ ...prev, [field]: value }));

        // Clear the error for that field
        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!disposalMethodForm.disposalMethodName) errors.disposalMethodName = "Disposal method name is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showDisposalMethodSaveConfirmation();
        if (result.isConfirmed) {
            // Generate a new ID for the disposal method
            const newId = disposalMethodList.length > 0
                ? Math.max(...disposalMethodList.map(c => c.id)) + 1
                : 1;

            // Create the new disposal method object with an ID
            const newDisposalMethod = {
                id: newId,
                disposalMethodName: disposalMethodForm.disposalMethodName,
                disposalMethodDescription: disposalMethodForm.disposalMethodDescription
            };

            // Add to the local list
            setDisposalMethodList(prev => [...prev, newDisposalMethod]);

            // Call parent's onSave (for any external handling needed)
            onSave(disposalMethodForm);

            // Show success message
            await showDisposalMethodSavedSuccess();

            // Reset the form but keep modal open
            setDisposalMethodForm({
                disposalMethodName: "",
                disposalMethodDescription: ""
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

    // Modal management for disposal method actions
    const openModal = (mode: "edit-disposal-method", rowData?: any) => {
        let content;

        switch (mode) {
            case "edit-disposal-method":
                content = (
                    <EditDisposalMethodModal
                        item={rowData}
                        onSave={handleEditDisposalMethod}
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

    // Handle edit disposal method
    const handleEditDisposalMethod = (updatedDisposalMethod: any) => {
        const updatedList = disposalMethodList.map(disposalMethod =>
            disposalMethod.id === updatedDisposalMethod.id ? updatedDisposalMethod : disposalMethod
        );
        setDisposalMethodList(updatedList);
        closeModal();
    }

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Add Disposal Method</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* For Disposal Method Details */}
            <div className="modal-content add">
                <form className="add-form">
                    {/* Disposal Method Name */}
                    <div className="form-group">
                        <label>Disposal Method Name</label>
                        <input
                            className={formErrors?.disposalMethodName ? "invalid-input" : ""}
                            type="text"
                            value={disposalMethodForm.disposalMethodName}
                            onChange={(e) => handleChange("disposalMethodName", e.target.value)}
                            placeholder="Enter disposal method name here..."
                        />
                        <p className="add-error-message">{formErrors?.disposalMethodName}</p>
                    </div>

                    {/* Disposal Method Description */}
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className={formErrors?.disposalMethodDescription ? "invalid-input" : ""}
                            value={disposalMethodForm.disposalMethodDescription}
                            onChange={(e) => handleChange("disposalMethodDescription", e.target.value)}
                            placeholder="Enter disposal method description here..."
                        >
                        </textarea>
                        <p className="add-error-message">{formErrors?.disposalMethodDescription}</p>
                    </div>
                </form>
            </div>

            <div className="modal-actions">
                <button type="submit" className="submit-btn" onClick={handleSubmit}>
                    <i className="ri-save-3-line" /> Save
                </button>
            </div>

            {/* Disposal Method List */}
            <div className="details-header">
                <p className="details-title">Existing Disposal Methods</p>
            </div>

            {/* Table */}
            <div className="modal-table-wrapper">
                <div className="modal-table-container">
                    <table className="modal-table">
                        <thead className="modal-table-heading">
                            <tr>
                                <th>Method Name</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody className="modal-table-body">
                            {disposalMethodList.length > 0 ? (
                                disposalMethodList.map(disposalMethod => (
                                    <tr key={disposalMethod.id}>
                                        <td>{disposalMethod.disposalMethodName}</td>
                                        <td>{disposalMethod.disposalMethodDescription}</td>
                                        <td>
                                            <ActionButtons
                                                onEdit={() => openModal("edit-disposal-method", disposalMethod)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="no-data">No disposal methods available.</td>
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