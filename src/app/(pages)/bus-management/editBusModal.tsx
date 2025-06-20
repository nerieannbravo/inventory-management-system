import React, { useState, useEffect } from "react";
import { uploadFile } from "@/app/lib/uploadFile";
import {
    showBusUpdateConfirmation, showBusUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation, showBusSaveError
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
    
    useEffect(() => {
        const originalItem = JSON.stringify(item);
        const currentItem = JSON.stringify(formData);
        if (originalItem !== currentItem || newlyUploadedFiles.length > 0) {
            setIsFormDirty(true);
        } else {
            setIsFormDirty(false);
        }
    }, [formData, item, newlyUploadedFiles]);

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
        // Add any necessary validation here
        // Example:
        if (!formData.body_builder) errors.body_builder = "Body builder is required.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRemoveExistingFile = (fileId: string) => {
        handleChange("busOtherFiles", formData.busOtherFiles.filter((file: any) => file.bus_files_id !== fileId));
    };

    const handleRemoveNewFile = (fileUrl: string) => {
        setNewlyUploadedFiles(newlyUploadedFiles.filter(file => file.file_url !== fileUrl));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setIsSaving(true);
        try {
            for (const file of files) {
                const { url, name } = await uploadFile(file, formData.body_number);
                
                if (fileType === 'CR') {
                    // Check if CR file already exists
                    const existingCRFile = formData.busOtherFiles.find((f: any) => f.file_type === 'CR');
                    
                    if (existingCRFile) {
                        // Update existing CR file
                        const updatedFiles = formData.busOtherFiles.map((f: any) => 
                            f.bus_files_id === existingCRFile.bus_files_id 
                                ? { ...f, file_name: name, file_url: url, date_uploaded: new Date().toISOString() }
                                : f
                        );
                        handleChange("busOtherFiles", updatedFiles);
                    } else {
                        // Add new CR file
                        setNewlyUploadedFiles(prev => [...prev, { file_name: name, file_url: url, file_type: fileType }]);
                    }
                } else {
                    // For other file types, just add as new
                    setNewlyUploadedFiles(prev => [...prev, { file_name: name, file_url: url, file_type: fileType }]);
                }
            }
        } catch (error) {
            showBusSaveError("File upload failed. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        const result = await showBusUpdateConfirmation(formData.body_number);
        if (result.isConfirmed) {
            setIsSaving(true);
            try {
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
                    ...formData, 
                    newlyUploadedFiles,
                    warranty_expiration_date: formData.warranty_expiration_date ? new Date(formData.warranty_expiration_date).toISOString() : null,
                    secondHandDetails: completeSecondHandDetails,
                    brandNewDetails: completeBrandNewDetails,
                };
                
                const response = await fetch(`/api/bus/${item.bus_id}`, {
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
                            <div className="form-group"><label>Plate Number</label><input disabled type="text" value={formData.plate_number || ''} /></div>
                            <div className="form-group"><label>Body Number</label><input disabled type="text" value={formData.body_number || ''} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Body Builder</label>
                                <select className={formErrors.body_builder ? "invalid-input" : ""} value={formData.body_builder || ''} onChange={(e) => handleChange("body_builder", e.target.value)}>
                                    <option value="" disabled>--Select Body Builder--</option>
                                    <option value="AGILA">Agila</option><option value="HILLTOP">Hilltop</option><option value="RBM">RBM</option><option value="DARJ">DARJ</option>
                                </select>
                                <p className="edit-error-message">{formErrors.body_builder}</p>
                            </div>
                            <div className="form-group"><label>Bus Type</label>
                                <select value={formData.bus_type || ''} onChange={(e) => handleChange("bus_type", e.target.value)}>
                                    <option value="" disabled>--Select Bus Type--</option>
                                    <option value="AIRCONDITIONED">Airconditioned</option><option value="ORDINARY">Ordinary</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Manufacturer</label><input disabled type="text" value={formData.manufacturer || ''} /></div>
                            <div className="form-group"><label>Model</label><input disabled type="text" value={formData.model || ''} /></div>
                            <div className="form-group"><label>Year Model</label><input disabled type="text" value={formData.year_model || ''} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Chasis Number</label><input type="text" value={formData.chasis_number || ''} onChange={(e) => handleChange("chasis_number", e.target.value)} /></div>
                            <div className="form-group"><label>Engine Number</label><input type="text" value={formData.engine_number || ''} onChange={(e) => handleChange("engine_number", e.target.value)} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Condition</label><input disabled type="text" value={formData.condition === "BRAND_NEW" ? "Brand New" : "Second Hand"} /></div>
                            <div className="form-group"><label>Seat Capacity</label><input disabled type="number" value={formData.seat_capacity || 0} /></div>
                            <div className="form-group"><label>Status</label>
                                <select value={formData.status || ''} onChange={(e) => handleChange("status", e.target.value)}>
                                     <option value="ACTIVE">Active</option><option value="DECOMMISSIONED">Decommissioned</option><option value="UNDER_MAINTENANCE">Under Maintenance</option>
                                </select>
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
                                    <div className="form-group"><label>Acquisition Date</label><input disabled type="date" value={formatDateForInput(formData.acquisition_date)} /></div>
                                    <div className="form-group"><label>Acquisition Method</label><input disabled type="text" value={formData.acquisition_method || ''} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Previous Owner</label><input type="text" value={formData.secondHandDetails.previous_owner || ''} onChange={(e) => handleDetailChange("secondHandDetails", "previous_owner", e.target.value)} /></div>
                                    <div className="form-group"><label>Previous Owner Contact</label><input type="text" value={formData.secondHandDetails.previous_owner_contact || ''} onChange={(e) => handleDetailChange("secondHandDetails", "previous_owner_contact", e.target.value)} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Source</label><input disabled type="text" value={formData.secondHandDetails.source || ''} /></div>
                                    <div className="form-group"><label>Odometer Reading</label><input disabled type="number" value={formData.secondHandDetails.odometer_reading || 0} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Warranty Expiration</label><input type="date" value={formatDateForInput(formData.warranty_expiration_date)} onChange={(e) => handleChange("warranty_expiration_date", e.target.value)} /></div>
                                    <div className="form-group">
                                        <label>Registration Status</label>
                                        <select value={formData.registration_status || ''} onChange={(e) => handleChange("registration_status", e.target.value)}>
                                            <option value="REGISTERED">Registered</option><option value="NEEDS_RENEWAL">Needs Renewal</option><option value="EXPIRED">Expired</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Last Registration Date</label><input disabled type="date" value={formatDateForInput(formData.secondHandDetails.last_registration_date)} /></div>
                                    <div className="form-group"><label>Last Maintenance Date</label><input disabled type="date" value={formatDateForInput(formData.secondHandDetails.last_maintenance_date)} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Condition Notes</label><textarea value={formData.secondHandDetails.bus_condition_notes || ''} onChange={(e) => handleDetailChange("secondHandDetails", "bus_condition_notes", e.target.value)} /></div>
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
                                    <div className="form-group"><label>Acquisition Date</label><input disabled type="date" value={formatDateForInput(formData.acquisition_date)} /></div>
                                    <div className="form-group"><label>Acquisition Method</label><input disabled type="text" value={formData.acquisition_method || ''} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Dealer Name</label><input type="text" value={formData.brandNewDetails.dealer_name || ''} onChange={(e) => handleDetailChange("brandNewDetails", "dealer_name", e.target.value)} /></div>
                                    <div className="form-group"><label>Dealer Contact</label><input type="text" value={formData.brandNewDetails.dealer_contact || ''} onChange={(e) => handleDetailChange("brandNewDetails", "dealer_contact", e.target.value)} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Warranty Expiration</label><input type="date" value={formatDateForInput(formData.warranty_expiration_date)} onChange={(e) => handleChange("warranty_expiration_date", e.target.value)} /></div>
                                    <div className="form-group">
                                        <label>Registration Status</label>
                                        <select value={formData.registration_status || ''} onChange={(e) => handleChange("registration_status", e.target.value)}>
                                            <option value="REGISTERED">Registered</option><option value="NOT_REGISTERED">Not Registered</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <p className="bus-details-title">III. Document Attachments</p>
                <div className="modal-content add">
                    <div className="form-group"><label>Existing Attachments</label>
                        {formData.busOtherFiles.length > 0 ? (
                            <ul className="uploaded-documents-list">{formData.busOtherFiles.map((file: any) => (<li key={file.bus_files_id} className="uploaded-document-item"><span>{file.file_name}</span><button type="button" onClick={() => handleRemoveExistingFile(file.bus_files_id)} className="remove-document-button" aria-label={`Remove ${file.file_name}`}><i className="ri-close-line"></i></button></li>))}</ul>
                        ) : <p>No existing attachments.</p>}
                    </div>
                    {newlyUploadedFiles.length > 0 && (
                        <div className="form-group"><label>New Attachments</label>
                            <ul className="uploaded-documents-list">{newlyUploadedFiles.map((file) => (<li key={file.file_url} className="uploaded-document-item"><span>{file.file_name}</span><button type="button" onClick={() => handleRemoveNewFile(file.file_url)} className="remove-document-button" aria-label={`Remove ${file.file_name}`}><i className="ri-close-line"></i></button></li>))}</ul>
                        </div>
                    )}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Upload New CR</label>
                            <input type="file" onChange={(e) => handleFileUpload(e, 'CR')} />
                            {existingCRFile && (
                                <small style={{ color: '#666', fontStyle: 'italic' }}>
                                    Note: This will replace the existing CR file ({existingCRFile.file_name})
                                </small>
                            )}
                        </div>
                    </div>
                    <div className="form-row"><div className="form-group"><label>Upload Other Documents</label><input type="file" multiple onChange={(e) => handleFileUpload(e, 'OTHER')} /></div></div>
                </div>

                <div className="modal-actions">
                    <button type="submit" className="submit-btn" form="edit-bus-form" disabled={isSaving || !isFormDirty}>{isSaving ? "Saving..." : "Update Bus"}</button>
                </div>
            </form>
        </>
    );
}
