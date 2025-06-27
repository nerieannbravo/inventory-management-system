import React, { useState, useEffect } from "react";
import { uploadFile } from "@/app/lib/uploadFile";
import {
    showBusUpdateConfirmation, showBusUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation, showBusSaveError,
    showRemoveFileConfirmation
} from "@/utils/sweetAlert";
import "@/styles/forms.css";

interface FileMeta {
    file_name: string;
    file_url: string;
    file_type: string;
}

interface EditBusModalProps {
    item: any;
    onSave: () => void;
    onClose: () => void;
}

export default function EditBusModal({ item, onSave, onClose }: EditBusModalProps) {
    const [formData, setFormData] = useState({
        ...item,
        busOtherFiles: item.busOtherFiles || [],
        secondHandDetails: item.secondHandDetails || { bus_condition_notes: '' },
        brandNewDetails: item.brandNewDetails || {},
    });

    const [newlyUploadedFiles, setNewlyUploadedFiles] = useState<FileMeta[]>([]);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Add state for pending files
    const [pendingCRFile, setPendingCRFile] = useState<File | null>(null);
    const [pendingOtherFiles, setPendingOtherFiles] = useState<File[]>([]);

    useEffect(() => {
        const originalItem = JSON.stringify(item);
        const currentItem = JSON.stringify(formData);
        if (
            originalItem !== currentItem ||
            newlyUploadedFiles.length > 0 ||
            !!pendingCRFile ||
            pendingOtherFiles.length > 0
        ) {
            setIsFormDirty(true);
        } else {
            setIsFormDirty(false);
        }
    }, [formData, item, newlyUploadedFiles.length, !!pendingCRFile, pendingOtherFiles.length]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleDetailChange = (detailType: 'secondHandDetails' | 'brandNewDetails', field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [detailType]: { ...prev[detailType], [field]: value }
        }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Basic Information Validation
        if (!formData.status) errors.bus_status = "Bus status is required";
        if (!formData.bus_type) errors.bus_type = "Bus type is required";
        if (!formData.body_builder) errors.body_builder = "Body builder is required.";

        // Second Hand Details Validation
        if (formData.condition === "SECOND_HAND") {
            if (!formData.secondHandDetails.previous_owner) errors.previous_owner = "Dealer Name is required";
            if (!formData.secondHandDetails.previous_owner_contact) {
                errors.previous_owner_contact = "Dealer contact is required";
            } else if (
                formData.secondHandDetails.previous_owner_contact &&
                !/^\d{11}$/.test(formData.secondHandDetails.previous_owner_contact?.toString() || "")
            ) {
                errors.previous_owner_contact = "Dealer contact must be exactly 11 digits";
            }
            if (!formData.registration_status) errors.registration_status = "Registration status is required";
            if (!formData.secondHandDetails.last_registration_date) {
                errors.last_registration_date = "Last registration date is required";
            } else {
                const today = new Date();
                const selectedDate = new Date(formData.last_registration_date);
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    errors.last_registration_date = "Last registration date cannot be set to a future date";
                }
            }
            if (!formData.secondHandDetails.last_maintenance_date) {
                errors.last_maintenance_date = "Last maintenance date is required";
            } else {
                const today = new Date();
                const selectedDate = new Date(formData.last_maintenance_date);
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    errors.last_maintenance_date = "Last maintenance date cannot be set to a future date";
                }
            }
        }

        // Brand New Details Validation
        if (formData.condition === "BRAND_NEW") {
            if (!formData.brandNewDetails.dealer_name) errors.dealer_name = "Dealer name is required";
            if (!formData.brandNewDetails.dealer_contact) {
                errors.dealer_contact = "Dealer contact is required";
            } else if (
                formData.brandNewDetails.dealer_contact &&
                !/^\d{11}$/.test(formData.brandNewDetails.dealer_contact?.toString() || "")
            ) {
                errors.dealer_contact = "Dealer contact must be exactly 11 digits";
            }
            if (!formData.registration_status) errors.registration_status = "Registration status is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRemoveExistingFile = async (fileId: string) => {
        const file = formData.busOtherFiles.find((f: any) => f.bus_files_id === fileId);
        const result = await showRemoveFileConfirmation(file?.file_name || "this file");
        if (result.isConfirmed) {
            handleChange("busOtherFiles", formData.busOtherFiles.filter((file: any) => file.bus_files_id !== fileId));
        }
    };

    const handleRemoveNewFile = async (fileUrl: string) => {
        const file = newlyUploadedFiles.find(f => f.file_url === fileUrl);
        const result = await showRemoveFileConfirmation(file?.file_name || "this file");
        if (result.isConfirmed) {
            setNewlyUploadedFiles(newlyUploadedFiles.filter(file => file.file_url !== fileUrl));
        }
    };

    // Utility to count total files
    const getTotalFilesCount = () => {
        let count = 0;
        count += formData.busOtherFiles.length;
        count += newlyUploadedFiles.length;
        if (pendingCRFile) count++;
        count += pendingOtherFiles.length;
        return count;
    };

    // Replace handleFileUpload with handlers that only store files
    const handleCRFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (getTotalFilesCount() >= 10) {
            await showBusSaveError("You can only attach up to 10 files per bus record.");
            return;
        }
        const file = e.target.files?.[0];
        if (file) {
            setPendingCRFile(file);
        } else {
            setPendingCRFile(null);
        }
    };
    const handleOtherFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        if (getTotalFilesCount() + files.length > 10) {
            await showBusSaveError("You can only attach up to 10 files per bus record.");
            return;
        }
        setPendingOtherFiles(prev => [...prev, ...files]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (getTotalFilesCount() > 10) {
            await showBusSaveError("You can only attach up to 10 files per bus record.");
            return;
        }
        if (!validateForm()) return;

        const result = await showBusUpdateConfirmation(formData.body_number);
        if (result.isConfirmed) {
            setIsSaving(true);
            try {
                // Upload files only after confirmation
                let newFiles: FileMeta[] = [...newlyUploadedFiles];
                // CR file
                if (pendingCRFile) {
                    const { url, name } = await uploadFile(pendingCRFile, formData.body_number);
                    newFiles.push({
                        file_name: `${formData.body_number}CR${name}`,
                        file_url: url,
                        file_type: 'CR',
                    });
                }
                // Other files
                if (pendingOtherFiles.length > 0) {
                    for (const file of pendingOtherFiles) {
                        const { url, name } = await uploadFile(file, formData.body_number);
                        newFiles.push({
                            file_name: name, // keep as is for OTHER
                            file_url: url,
                            file_type: 'OTHER',
                        });
                    }
                }
                // Prepare the data for the API
                const completeSecondHandDetails = formData.secondHandDetails
                    ? {
                        previous_owner: formData.secondHandDetails.previous_owner || "",
                        previous_owner_contact: formData.secondHandDetails.previous_owner_contact || "",
                        source: formData.secondHandDetails.source || "DEALERSHIP",
                        odometer_reading: Number(formData.secondHandDetails.odometer_reading) || 0,
                        last_registration_date: formData.secondHandDetails.last_registration_date || new Date().toISOString(),
                        last_maintenance_date: formData.secondHandDetails.last_maintenance_date || new Date().toISOString(),
                        bus_condition_notes: formData.secondHandDetails.bus_condition_notes || "",
                    }
                    : undefined;
                const completeBrandNewDetails = formData.brandNewDetails
                    ? {
                        dealer_name: formData.brandNewDetails.dealer_name || "",
                        dealer_contact: formData.brandNewDetails.dealer_contact || "",
                    }
                    : undefined;
                const finalData = {
                    bus_id: item.bus_id,
                    ...formData,
                    newlyUploadedFiles: newFiles,
                    warranty_expiration_date: formData.warranty_expiration_date ? new Date(formData.warranty_expiration_date).toISOString() : null,
                    secondHandDetails: completeSecondHandDetails,
                    brandNewDetails: completeBrandNewDetails,
                };
                const response = await fetch(`/api/bus`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalData),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update bus');
                }
                await showBusUpdatedSuccess();
                onSave(); // Refresh the data
                onClose(); // Close the modal
            } catch (error) {
                showBusSaveError(error instanceof Error ? error.message : "An unknown error occurred.");
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleClose = async () => {
        if (!isFormDirty) {
            onClose();
            return;
        }
        const result = await showCloseWithoutUpdatingConfirmation();
        if (result.isConfirmed) onClose();
    };

    const formatDateForInput = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        try { return new Date(dateString).toISOString().split('T')[0]; } catch (e) { return ''; }
    };

    // Check if CR file exists
    const existingCRFile = formData.busOtherFiles.find((file: any) => file.file_type === 'CR');

    return (
        <>
            <div className="modal-heading"><h1 className="modal-title">Edit Bus</h1><button className="close-modal-btn" onClick={handleClose}><i className="ri-close-line"></i></button></div>
            <form id="edit-bus-form" onSubmit={handleSubmit}>
                <p className="bus-details-title">I. Basic Identification</p>
                <div className="modal-content edit">
                    <div className="edit-bus-form">
                        <div className="form-row">
                            {/* Plate Number */}
                            <div className="form-group">
                                <label>Plate Number</label>
                                <input disabled
                                    type="text"
                                    value={formData.plate_number || ''}
                                />
                            </div>

                            {/* Body Number */}
                            <div className="form-group">
                                <label>Body Number</label>
                                <input disabled
                                    type="text"
                                    value={formData.body_number || ''}
                                />
                                <p className="edit-error-message"></p>
                            </div>
                        </div>

                        <div className="form-row">
                            {/* Body Builder */}
                            <div className="form-group">
                                <label>Body Builder</label>
                                <select
                                    className={formErrors.body_builder ? "invalid-input" : ""}
                                    value={formData.body_builder || ''}
                                    onChange={(e) => handleChange("body_builder", e.target.value)}
                                >
                                    <option value="" disabled>--Select Body Builder--</option>
                                    <option value="AGILA">Agila</option>
                                    <option value="HILLTOP">Hilltop</option>
                                    <option value="RBM">RBM</option>
                                    <option value="DARJ">DARJ</option>
                                </select>
                                <p className="edit-error-message">{formErrors.body_builder}</p>
                            </div>

                            {/* Bus Type */}
                            <div className="form-group">
                                <label>Bus Type</label>
                                <select
                                    value={formData.bus_type || ''}
                                    onChange={(e) => handleChange("bus_type", e.target.value)}
                                >
                                    <option value="" disabled>--Select Bus Type--</option>
                                    <option value="AIRCONDITIONED">Airconditioned</option>
                                    <option value="ORDINARY">Ordinary</option>
                                </select>
                                <p className="edit-error-message">{formErrors.bus_type}</p>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                {/* Manufacturer */}
                                <label>Manufacturer</label>
                                <input disabled
                                    type="text"
                                    value={formData.manufacturer || ''}
                                />
                            </div>

                            {/* Model */}
                            <div className="form-group">
                                <label>Model</label>
                                <input disabled
                                    type="text"
                                    value={formData.model || ''}
                                />
                            </div>

                            {/* Year Model */}
                            <div className="form-group">
                                <label>Year Model</label>
                                <input disabled
                                    type="text"
                                    value={formData.year_model || ''}
                                />
                                <p className="edit-error-message"></p>
                            </div>
                        </div>

                        <div className="form-row">
                            {/* Chasis Number */}
                            <div className="form-group">
                                <label>Chasis Number</label>
                                <input disabled
                                    type="text"
                                    value={formData.chasis_number || ''}
                                    onChange={(e) => handleChange("chasis_number", e.target.value)}
                                />
                                <p className="edit-error-message"></p>
                            </div>

                            {/* Engine Number */}
                            <div className="form-group">
                                <label>Engine Number</label>
                                <input disabled
                                    type="text"
                                    value={formData.engine_number || ''}
                                    onChange={(e) => handleChange("engine_number", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            {/* Condition */}
                            <div className="form-group">
                                <label>Condition</label>
                                <input disabled
                                    type="text"
                                    value={formData.condition === "BRAND_NEW" ? "Brand New" : "Second Hand"}
                                />
                            </div>

                            {/* Seat Capacity */}
                            <div className="form-group">
                                <label>Seat Capacity</label>
                                <input disabled
                                    type="number"
                                    value={formData.seat_capacity || 0}
                                />
                            </div>

                            {/* Status */}
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    className={formErrors?.status ? "invalid-input" : ""}
                                    value={formData.status || ''}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="DECOMMISSIONED">Decommissioned</option>
                                    <option value="UNDER_MAINTENANCE">Under Maintenance(or being process)</option>
                                </select>
                                <p className="edit-error-message">{formErrors.status}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {formData.condition === "SECOND_HAND" && (
                    <>
                        <p className="bus-details-title">II. Second Hand Details</p>
                        <div className="modal-content edit">
                            <div className="edit-bus-form">
                                <div className="form-row">
                                    {/* Acquisition Date */}
                                    <div className="form-group">
                                        <label>Acquisition Date</label>
                                        <input disabled
                                            type="date"
                                            value={formatDateForInput(formData.acquisition_date)}
                                        />
                                        <p className="edit-error-message"></p>
                                    </div>

                                    {/* Acquisition Method */}
                                    <div className="form-group">
                                        <label>Acquisition Method</label>
                                        <input disabled
                                            type="text"
                                            value={formData.acquisition_method || ''}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    {/* Previous Owner */}
                                    <div className="form-group">
                                        <label>Dealer Name</label>
                                        <input
                                            className={formErrors?.previous_owner ? "invalid-input" : ""}
                                            type="text"
                                            value={formData.secondHandDetails.previous_owner || ''}
                                            onChange={(e) => handleDetailChange("secondHandDetails", "previous_owner", e.target.value)}
                                            placeholder="Enter previous owner name here..."
                                        />
                                        <p className="edit-error-message">{formErrors?.previous_owner}</p>
                                    </div>

                                    {/* Previous Owner Contact */}
                                    <div className="form-group">
                                        <label>Dealer Contact</label>
                                        <input
                                            className={formErrors?.previous_owner_contact ? "invalid-input" : ""}
                                            type="text"
                                            value={formData.secondHandDetails.previous_owner_contact || ''}
                                            onChange={(e) => {
                                                // Only allow numbers
                                                const value = e.target.value.replace(/[^0-9]/g, "");
                                                handleDetailChange("secondHandDetails", "previous_owner_contact", value);
                                            }}
                                            placeholder="Enter previous owner contact here..."
                                            inputMode="tel"
                                            pattern="[0-9]*"
                                            maxLength={11}
                                        />
                                        <p className="edit-error-message">{formErrors?.previous_owner_contact}</p>
                                    </div>
                                </div>

                                <div className="form-row">
                                    {/* Source */}
                                    <div className="form-group">
                                        <label>Source</label>
                                        <input disabled
                                            type="text"
                                            value={formData.secondHandDetails.source || ''}
                                        />
                                    </div>

                                    {/* Odometer Reading */}
                                    <div className="form-group">
                                        <label>Odometer Reading</label>
                                        <input disabled
                                            type="number"
                                            value={formData.secondHandDetails.odometer_reading || 0}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    {/* Warrantry Expiration */}
                                    <div className="form-group">
                                        <label>Warranty Expiration</label>
                                        <input disabled
                                            type="date"
                                            value={formatDateForInput(formData.warranty_expiration_date)}
                                            onChange={(e) => handleChange("warranty_expiration_date", e.target.value)}
                                        />
                                    </div>

                                    {/* Registration Status */}
                                    <div className="form-group">
                                        <label>Registration Status</label>
                                        <select
                                            className={formErrors?.registration_status ? "invalid-input" : ""}
                                            value={formData.registration_status || ''}
                                            onChange={(e) => handleChange("registration_status", e.target.value)}
                                        >
                                            <option value="REGISTERED">Registered</option>
                                            <option value="NEEDS_RENEWAL">Needs Renewal</option>
                                            <option value="EXPIRED">Expired</option>
                                        </select>
                                        <p className="edit-error-message">{formErrors.registration_status}</p>
                                    </div>
                                </div>

                                <div className="form-row">
                                    {/* Last Registration Date */}
                                    <div className="form-group">
                                        <label>Last Registration Date</label>
                                        <input
                                            className={formErrors.last_registration_date ? "invalid-input" : ""}
                                            type="date"
                                            value={formatDateForInput(formData.secondHandDetails.last_registration_date)}
                                            onChange={(e) => handleDetailChange("secondHandDetails", "last_registration_date", e.target.value)}
                                        />
                                        <p className="edit-error-message">{formErrors.last_registration_date}</p>
                                    </div>

                                    {/* Last Maintenance Date */}
                                    <div className="form-group">
                                        <label>Last Maintenance Date</label>
                                        <input
                                            className={formErrors.last_maintenance_date ? "invalid-input" : ""}
                                            type="date"
                                            value={formatDateForInput(formData.secondHandDetails.last_maintenance_date)}
                                            onChange={(e) => handleDetailChange("secondHandDetails", "last_maintenance_date", e.target.value)}
                                        />
                                        <p className="edit-error-message">{formErrors.last_maintenance_date}</p>
                                    </div>
                                </div>

                                <div className="form-row">
                                    {/* Condition Notes */}
                                    <div className="form-group">
                                        <label>Condition Notes</label>
                                        <textarea
                                            value={formData.secondHandDetails.bus_condition_notes || ''}
                                            onChange={(e) => handleDetailChange("secondHandDetails", "bus_condition_notes", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {formData.condition === "BRAND_NEW" && (
                    <>
                        <p className="bus-details-title">II. Brand New Details</p>
                        <div className="modal-content edit">
                            <div className="edit-bus-form">
                                <div className="form-row">
                                    {/* Acquisition Date */}
                                    <div className="form-group">
                                        <label>Acquisition Date</label>
                                        <input disabled
                                            type="date"
                                            value={formatDateForInput(formData.acquisition_date)}
                                        />
                                    </div>

                                    {/* Acquisition Method */}
                                    <div className="form-group">
                                        <label>Acquisition Method</label>
                                        <input disabled
                                            type="text"
                                            value={formData.acquisition_method || ''}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    {/* Dealer Name */}
                                    <div className="form-group">
                                        <label>Dealer Name</label>
                                        <input
                                            className={formErrors.dealer_name ? "invalid-input" : ""}
                                            type="text"
                                            value={formData.brandNewDetails.dealer_name || ''}
                                            onChange={(e) => handleDetailChange("brandNewDetails", "dealer_name", e.target.value)}
                                        />
                                        <p className="edit-error-message">{formErrors.dealer_name}</p>
                                    </div>

                                    {/* Dealer Contact */}
                                    <div className="form-group">
                                        <label>Dealer Contact</label>
                                        <input
                                            className={formErrors.dealer_contact ? "invalid-input" : ""}
                                            type="text"
                                            value={formData.brandNewDetails.dealer_contact || ''}
                                            onChange={(e) => {
                                                // Only allow numbers
                                                const value = e.target.value.replace(/[^0-9]/g, "");
                                                handleDetailChange("brandNewDetails", "dealer_contact", value);
                                            }}
                                            inputMode="tel"
                                            pattern="[0-9]*"
                                            maxLength={11}
                                        />
                                        <p className="edit-error-message">{formErrors.dealer_contact}</p>
                                    </div>
                                </div>

                                <div className="form-row">
                                    {/* Warranty Expiration */}
                                    <div className="form-group">
                                        <label>Warranty Expiration</label>
                                        <input disabled
                                            type="date"
                                            value={formatDateForInput(formData.warranty_expiration_date)}
                                            onChange={(e) => handleChange("warranty_expiration_date", e.target.value)}
                                        />
                                    </div>

                                    {/* Registration Status */}
                                    <div className="form-group">
                                        <label>Registration Status</label>
                                        <select
                                            className={formErrors?.registration_status ? "invalid-input" : ""}
                                            value={formData.registration_status || ''}
                                            onChange={(e) => handleChange("registration_status", e.target.value)}
                                        >
                                            <option value="REGISTERED">Registered</option>
                                            <option value="NOT_REGISTERED">Not Registered</option>
                                        </select>
                                        <p className="edit-error-message">{formErrors.registration_status}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <p className="bus-details-title">III. Document Attachments</p>
                <div className="modal-content edit">
                    <div className="edit-bus-form">
                        {/* Existing Attachments */}
                        <div className="form-group">
                            <label>Existing Attachments</label>
                            {formData.busOtherFiles.length > 0 ? (
                                <ul className="uploaded-documents-list">
                                    {formData.busOtherFiles.map((file: any) => (
                                        <li key={file.bus_files_id}
                                            className="uploaded-document-item">
                                            <span>{file.file_name}</span>
                                            {file.file_type !== 'OR' && (
                                                <button type="button"
                                                    onClick={() => handleRemoveExistingFile(file.bus_files_id)}
                                                    className="remove-document-button" aria-label={`Remove ${file.file_name}`}>
                                                    <i className="ri-close-line"></i>
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="existing-cr-note">No existing attachments.</p>}
                        </div>

                        {(newlyUploadedFiles.length > 0 || pendingCRFile || pendingOtherFiles.length > 0) && (
                            // New Attachments
                            <div className="form-group">
                                <label>New Attachments</label>
                                <ul className="uploaded-documents-list">
                                    {/* Show already uploaded new files */}
                                    {newlyUploadedFiles.map((file) => (
                                        <li key={file.file_url} className="uploaded-document-item">
                                            <span>{file.file_name}</span>
                                            <button 
                                            type="button" 
                                            onClick={() => handleRemoveNewFile(file.file_url)} 
                                            className="remove-document-button" 
                                            aria-label={`Remove ${file.file_name}`}>
                                                <i className="ri-close-line"></i>
                                            </button>
                                        </li>
                                    ))}
                                    {/* Show pending CR file */}
                                    {pendingCRFile && (
                                        <li className="uploaded-document-item">
                                            <span>{pendingCRFile.name}</span>
                                            <button type="button" onClick={() => setPendingCRFile(null)} className="remove-document-button" aria-label={`Remove ${pendingCRFile.name}`}>
                                                <i className="ri-close-line"></i>
                                            </button>
                                        </li>
                                    )}
                                    {/* Show pending OTHER files */}
                                    {pendingOtherFiles.map((file, idx) => (
                                        <li key={file.name + idx} className="uploaded-document-item">
                                            <span>{file.name}</span>
                                            <button type="button" onClick={() => setPendingOtherFiles(prev => prev.filter((_, i) => i !== idx))} className="remove-document-button" aria-label={`Remove ${file.name}`}>
                                                <i className="ri-close-line"></i>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="form-row">
                            {/* Upload New CR */}
                            <div className="form-group">
                                <label>Upload New CR</label>
                                <input type="file" onChange={handleCRFileChange} />
                                {existingCRFile && (
                                    <small className="existing-cr-note">
                                        Note: This will replace the existing CR file ({existingCRFile.file_name})
                                    </small>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            {/* Upload Other Documents */}
                            <div className="form-group">
                                <label>Upload Other Documents</label>
                                <input type="file" multiple onChange={handleOtherFilesChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button type="submit"
                        className="submit-btn"
                        form="edit-bus-form"
                        disabled={isSaving || !isFormDirty}>{isSaving ? "Saving..." : "Update Bus"}
                    </button>
                </div>
            </form>
        </>
    );
}
