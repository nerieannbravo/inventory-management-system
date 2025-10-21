import React, { useState, useEffect } from "react";
import { getFileType, formatFileSize, getFileIcon } from '@/utils/fileHelpers';
import { FileList } from "@/components/fileList";

import {
    showBusUpdateConfirmation, showBusUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation, showBusSaveError,
    showRemoveFileConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

interface EditBusModalProps {
    item: {
        // Basic Identification
        id: number,
        bodyNumber: string,
        plateNumber: string,
        bodyBuilder: string,
        busType: string,
        status: string,
        manufacturer: string,
        seatCapacity: number,
        chassisNumber: string,
        engineNumber: string,
        model: string,
        yearModel: string,
        condition: string,
        acquisitionDate?: string,
        acquisitionMethod?: string,
        warrantyExpirationDate?: string,
        registrationStatus?: string,

        // Second Hand Details
        previousOwner?: string,
        previousOwnerContact?: string,
        source?: string,
        odometerReading?: number,
        lastRegistrationDate?: string,
        lastMaintenanceDate?: string,
        conditionNotes?: string,

        // Brand New Details
        dealerName?: string,
        dealerContact?: string,

        // Documents
        orFile?: string,
        crFile?: string,
        otherDocuments?: string[],
    };
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

export default function EditBusModal({ item, onSave, onClose }: EditBusModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        plateNumber: item.plateNumber || "",
        bodyNumber: item.bodyNumber || "",
        bodyBuilder: item.bodyBuilder || "",
        busType: item.busType || "",
        status: item.status || "active",
        manufacturer: item.manufacturer || "",
        seatCapacity: item.seatCapacity || 0,
        chassisNumber: item.chassisNumber || "",
        engineNumber: item.engineNumber || "",
        model: item.model || "",
        yearModel: item.yearModel || "",
        condition: item.condition || "",
        acquisitionDate: item.acquisitionDate || "",
        acquisitionMethod: item.acquisitionMethod || "",
        registrationStatus: item.registrationStatus || "",
        warrantyExpirationDate: item.warrantyExpirationDate || "",
        previousOwner: item.previousOwner || "",
        previousOwnerContact: item.previousOwnerContact || "",
        source: item.source || "",
        odometerReading: item.odometerReading || 0,
        lastRegistrationDate: item.lastRegistrationDate || "",
        lastMaintenanceDate: item.lastMaintenanceDate || "",
        conditionNotes: item.conditionNotes || "",
        dealerName: item.dealerName || "",
        dealerContact: item.dealerContact || "",
        orFile: item.orFile || "",
        crFile: item.crFile || "",
        otherDocuments: item.otherDocuments || [],
    });

    // Pending file state for new uploads
    const [pendingOrFile, setPendingOrFile] = useState<File | null>(null);
    const [pendingCrFile, setPendingCrFile] = useState<File | null>(null);
    const [pendingOtherFiles, setPendingOtherFiles] = useState<File[]>([]);

    const [isFormDirty, setIsFormDirty] = useState(false);
    const [originalData] = useState({ ...formData });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Generate year options
    const currentYear = new Date().getFullYear();
    const startYear = 1980;
    const yearOptions = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

    useEffect(() => {
        const hasChanges = JSON.stringify(originalData) !== JSON.stringify(formData) ||
            pendingOrFile !== null || pendingCrFile !== null || pendingOtherFiles.length > 0;
        setIsFormDirty(hasChanges);
    }, [formData, originalData, pendingOrFile, pendingCrFile, pendingOtherFiles]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    const getTotalFilesCount = () => {
        let count = 0;
        if (pendingOrFile || formData.orFile) count++;
        if (pendingCrFile || formData.crFile) count++;
        count += pendingOtherFiles.length + formData.otherDocuments.length;
        return count;
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Basic Information Validation
        if (!formData.busType) errors.busType = "Bus type is required";
        if (!formData.bodyBuilder) errors.bodyBuilder = "Body builder is required.";

        // Second Hand Details Validation
        if (formData.condition === "Second Hand") {
            if (!formData.previousOwner) errors.previousOwner = "Dealer Name is required";
            if (!formData.previousOwnerContact) {
                errors.previousOwnerContact = "Dealer contact is required";
            } else if (
                formData.previousOwnerContact &&
                !/^\d{11}$/.test(formData.previousOwnerContact?.toString() || "")
            ) {
                errors.previousOwnerContact = "Dealer contact must be exactly 11 digits";
            }
            if (!formData.registrationStatus) errors.registrationStatus = "Registration status is required";
            if (!formData.lastRegistrationDate) {
                errors.lastRegistrationDate = "Last registration date is required";
            } else {
                const today = new Date();
                const selectedDate = new Date(formData.lastRegistrationDate);
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    errors.lastRegistrationDate = "Last registration date cannot be set to a future date";
                }
            }
            if (!formData.lastMaintenanceDate) {
                errors.lastMaintenanceDate = "Last maintenance date is required";
            } else {
                const today = new Date();
                const selectedDate = new Date(formData.lastMaintenanceDate);
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    errors.lastMaintenanceDate = "Last maintenance date cannot be set to a future date";
                }
            }
        }

        // Brand New Details Validation
        if (formData.condition === "Brand New") {
            if (!formData.dealerName) errors.dealerName = "Dealer name is required";
            if (!formData.dealerContact) {
                errors.dealerContact = "Dealer contact is required";
            } else if (
                formData.dealerContact &&
                !/^\d{11}$/.test(formData.dealerContact?.toString() || "")
            ) {
                errors.dealerContact = "Dealer contact must be exactly 11 digits";
            }
            if (!formData.registrationStatus) errors.registrationStatus = "Registration status is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (getTotalFilesCount() > 10) {
            await showBusSaveError("You can only attach up to 10 files per bus record.");
            return;
        }

        const result = await showBusUpdateConfirmation(formData.bodyNumber);
        if (result.isConfirmed) {
            setIsSaving(true);
            try {
                const updatedData = {
                    ...formData,
                    orFile: pendingOrFile ? pendingOrFile.name : formData.orFile,
                    crFile: pendingCrFile ? pendingCrFile.name : formData.crFile,
                    otherDocuments: [
                        ...formData.otherDocuments,
                        ...pendingOtherFiles.map(f => f.name)
                    ],
                };

                onSave(updatedData);
                await showBusUpdatedSuccess();
            } catch (error: any) {
                console.error('Error updating bus:', error);
                await showBusSaveError(error?.message || 'Failed to update bus');
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
        if (result.isConfirmed) {
            onClose();
        }
    };

    // for bus status formatting
    const formatStatus = (status: string) => {
        switch (status) {
            case "active":
                return "Active";
            case "decommissioned":
                return "Decommissioned";
            case "under-maintenance":
                return "Under Maintenance";
            default:
                return status;
        }
    };

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Edit Bus</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            <p className="details-title">I. Basic Identification</p>
            <div className="modal-content edit">
                <form className="edit-form">
                    {/* Plate Number and Body Number */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Plate Number</label>
                            <input disabled
                                className={formErrors?.plateNumber ? "invalid-input" : ""}
                                type="text"
                                value={formData.plateNumber}
                                placeholder="Enter plate number here..."
                                onChange={(e) => handleChange("plateNumber", e.target.value)}
                            />
                            <p className="edit-error-message">{formErrors?.plateNumber}</p>
                        </div>

                        <div className="form-group">
                            <label>Body Number</label>
                            <input disabled
                                className={formErrors?.bodyNumber ? "invalid-input" : ""}
                                type="text"
                                value={formData.bodyNumber}
                                placeholder="Enter body number here..."
                                onChange={(e) => handleChange("bodyNumber", e.target.value)}
                            />
                            <p className="edit-error-message">{formErrors?.bodyNumber}</p>
                        </div>
                    </div>

                    {/* Body Builder and Bus Type */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="required">Body Builder</label>
                            <select
                                className={formErrors?.bodyBuilder ? "invalid-input" : ""}
                                value={formData.bodyBuilder}
                                onChange={(e) => handleChange("bodyBuilder", e.target.value)}
                            >
                                <option value="" disabled>Select body builder...</option>
                                <option value="agila">Agila</option>
                                <option value="hilltop">Hilltop</option>
                                <option value="rbm">RBM</option>
                                <option value="darj">DARJ</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.bodyBuilder}</p>
                        </div>

                        <div className="form-group">
                            <label className="required">Bus Type</label>
                            <select
                                className={formErrors?.busType ? "invalid-input" : ""}
                                value={formData.busType}
                                onChange={(e) => handleChange("busType", e.target.value)}
                            >
                                <option value="" disabled>Select bus type...</option>
                                <option value="airconditioned">Airconditioned</option>
                                <option value="ordinary">Ordinary</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.busType}</p>
                        </div>
                    </div>

                    {/* Manufacturer, Model, Year Model */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Manufacturer</label>
                            <input disabled
                                className={formErrors?.manufacturer ? "invalid-input" : ""}
                                type="text"
                                value={formData.manufacturer}
                                placeholder="Enter manufacturer here..."
                                onChange={(e) => handleChange("manufacturer", e.target.value)}
                            />
                            <p className="edit-error-message">{formErrors?.manufacturer}</p>
                        </div>

                        <div className="form-group">
                            <label>Model</label>
                            <input disabled
                                className={formErrors?.model ? "invalid-input" : ""}
                                type="text"
                                value={formData.model}
                                placeholder="Enter model here..."
                                onChange={(e) => handleChange("model", e.target.value)}
                            />
                            <p className="edit-error-message">{formErrors?.model}</p>
                        </div>

                        <div className="form-group">
                            <label>Year Model</label>
                            <input disabled
                                className={formErrors?.yearModel ? "invalid-input" : ""}
                                type="text"
                                value={formData.yearModel}
                                placeholder="Enter year model here..."
                                onChange={(e) => handleChange("yearModel", e.target.value)}
                            />
                            <p className="edit-error-message">{formErrors?.yearModel}</p>
                        </div>
                    </div>

                    {/* Chassis Number and Engine Number */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Chassis Number</label>
                            <input disabled
                                className={formErrors?.chassisNumber ? "invalid-input" : ""}
                                type="text"
                                value={formData.chassisNumber}
                                placeholder="Enter chassis number here..."
                                onChange={(e) => handleChange("chassisNumber", e.target.value)}
                            />
                            <p className="edit-error-message">{formErrors?.chassisNumber}</p>
                        </div>

                        <div className="form-group">
                            <label>Engine Number</label>
                            <input disabled
                                className={formErrors?.engineNumber ? "invalid-input" : ""}
                                type="text"
                                value={formData.engineNumber}
                                placeholder="Enter engine number here..."
                                onChange={(e) => handleChange("engineNumber", e.target.value)}
                            />
                            <p className="edit-error-message">{formErrors?.engineNumber}</p>
                        </div>
                    </div>

                    {/* Condition, Seat Capacity, Status */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Condition</label>
                            <input disabled
                                className={formErrors?.condition ? "invalid-input" : ""}
                                type="text"
                                value={formData.condition}
                                onChange={(e) => handleChange("condition", e.target.value)}
                            />
                            <p className="edit-error-message">{formErrors?.condition}</p>
                        </div>

                        <div className="form-group">
                            <label>Seat Capacity</label>
                            <input disabled
                                className={formErrors?.seatCapacity ? "invalid-input" : ""}
                                type="number"
                                value={formData.seatCapacity}
                                onChange={(e) => handleChange("seatCapacity", Number(e.target.value))}
                            />
                            <p className="edit-error-message">{formErrors?.seatCapacity}</p>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <input disabled
								className={formErrors?.status ? "invalid-input" : ""}
								type="text"
								value={formatStatus(formData.status)}
								onChange={(e) => handleChange("status", e.target.value)}
							/>
                            <p className="edit-error-message">{formErrors?.status}</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* Second Hand Details */}
            {item.condition === "Second Hand" && (
                <>
                    <p className="details-title">II. Second Hand Details</p>
                    <div className="modal-content edit">
                        <form className="edit-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Acquisition Date</label>
                                    <input disabled
                                        className={formErrors?.acquisitionDate ? "invalid-input" : ""}
                                        type="date"
                                        value={formData.acquisitionDate}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => handleChange("acquisitionDate", e.target.value)}
                                    />
                                    <p className="edit-error-message">{formErrors?.acquisitionDate}</p>
                                </div>

                                <div className="form-group">
                                    <label>Acquisition Method</label>
                                    <select disabled
                                        className={formErrors?.acquisitionMethod ? "invalid-input" : ""}
                                        value={formData.acquisitionMethod}
                                        onChange={(e) => handleChange("acquisitionMethod", e.target.value)}
                                    >
                                        <option value="" disabled>Select acquisition method...</option>
                                        <option value="purchased">Purchased</option>
                                        <option value="donated">Donated</option>
                                        <option value="leased">Leased</option>
                                    </select>
                                    <p className="edit-error-message">{formErrors?.acquisitionMethod}</p>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="required">Previous Owner</label>
                                    <input
                                        className={formErrors?.previousOwner ? "invalid-input" : ""}
                                        type="text"
                                        value={formData.previousOwner}
                                        onChange={(e) => handleChange("previousOwner", e.target.value)}
                                        placeholder="Enter previous owner name here..."
                                    />
                                    <p className="edit-error-message">{formErrors?.previousOwner}</p>
                                </div>

                                <div className="form-group">
                                    <label className="required">Previous Owner Contact</label>
                                    <input
                                        className={formErrors?.previousOwnerContact ? "invalid-input" : ""}
                                        type="text"
                                        value={formData.previousOwnerContact}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, "");
                                            handleChange("previousOwnerContact", value);
                                        }}
                                        placeholder="Enter previous owner contact here..."
                                        inputMode="tel"
                                        maxLength={11}
                                    />
                                    <p className="edit-error-message">{formErrors?.previousOwnerContact}</p>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Source</label>
                                    <select disabled
                                        className={formErrors?.source ? "invalid-input" : ""}
                                        value={formData.source}
                                        onChange={(e) => handleChange("source", e.target.value)}
                                    >
                                        <option value="" disabled>Select source...</option>
                                        <option value="dealership">Dealership</option>
                                        <option value="auction">Auction</option>
                                        <option value="private-individual">Private Individual</option>
                                    </select>
                                    <p className="edit-error-message">{formErrors?.source}</p>
                                </div>

                                <div className="form-group">
                                    <label>Odometer Reading</label>
                                    <input disabled
                                        className={formErrors?.odometerReading ? "invalid-input" : ""}
                                        type="number"
                                        value={formData.odometerReading}
                                        placeholder="Enter odometer reading..."
                                        onChange={(e) => handleChange("odometerReading", e.target.value)}
                                    />
                                    <p className="edit-error-message">{formErrors?.odometerReading}</p>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="required">Warranty Expiration Date</label>
                                    <input
                                        className={formErrors?.warrantyExpirationDate ? "invalid-input" : ""}
                                        type="date"
                                        value={formData.warrantyExpirationDate}
                                        onChange={(e) => handleChange("warrantyExpirationDate", e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="edit-error-message">{formErrors?.warrantyExpirationDate}</p>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Last Registration Date</label>
                                    <input disabled
                                        className={formErrors?.lastRegistrationDate ? "invalid-input" : ""}
                                        type="date"
                                        value={formData.lastRegistrationDate}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => handleChange("lastRegistrationDate", e.target.value)}
                                    />
                                    <p className="edit-error-message">{formErrors?.lastRegistrationDate}</p>
                                </div>

                                <div className="form-group">
                                    <label>Last Maintenance Date</label>
                                    <input disabled
                                        className={formErrors?.lastMaintenanceDate ? "invalid-input" : ""}
                                        type="date"
                                        value={formData.lastMaintenanceDate}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => handleChange("lastMaintenanceDate", e.target.value)}
                                    />
                                    <p className="edit-error-message">{formErrors?.lastMaintenanceDate}</p>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Initial Bus Condition/Notes</label>
                                    <textarea
                                        className={formErrors?.conditionNotes ? "invalid-input" : ""}
                                        value={formData.conditionNotes}
                                        onChange={(e) => handleChange("conditionNotes", e.target.value)}
                                        placeholder="Enter initial bus condition or notes here..."
                                        rows={3}
                                    />
                                    <p className="edit-error-message">{formErrors?.conditionNotes}</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Brand New Details */}
            {item.condition === "Brand New" && (
                <>
                    <p className="details-title">II. Brand New Details</p>
                    <div className="modal-content edit">
                        <form className="edit-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Acquisition Date</label>
                                    <input disabled
                                        className={formErrors?.acquisitionDate ? "invalid-input" : ""}
                                        type="date"
                                        value={formData.acquisitionDate}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => handleChange("acquisitionDate", e.target.value)}
                                    />
                                    <p className="edit-error-message">{formErrors?.acquisitionDate}</p>
                                </div>

                                <div className="form-group">
                                    <label>Acquisition Method</label>
                                    <select disabled
                                        className={formErrors?.acquisitionMethod ? "invalid-input" : ""}
                                        value={formData.acquisitionMethod}
                                        onChange={(e) => handleChange("acquisitionMethod", e.target.value)}
                                    >
                                        <option value="" disabled>Select acquisition method...</option>
                                        <option value="purchased">Purchased</option>
                                        <option value="donated">Donated</option>
                                        <option value="leased">Leased</option>
                                    </select>
                                    <p className="edit-error-message">{formErrors?.acquisitionMethod}</p>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="required">Dealer Name</label>
                                    <input
                                        className={formErrors?.dealerName ? "invalid-input" : ""}
                                        type="text"
                                        value={formData.dealerName}
                                        onChange={(e) => handleChange("dealerName", e.target.value)}
                                        placeholder="Enter dealer name here..."
                                    />
                                    <p className="edit-error-message">{formErrors?.dealerName}</p>
                                </div>

                                <div className="form-group">
                                    <label className="required">Dealer Contact</label>
                                    <input
                                        className={formErrors?.dealerContact ? "invalid-input" : ""}
                                        type="text"
                                        value={formData.dealerContact}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, "");
                                            handleChange("dealerContact", value);
                                        }}
                                        placeholder="Enter dealer contact here..."
                                        inputMode="tel"
                                        maxLength={11}
                                    />
                                    <p className="edit-error-message">{formErrors?.dealerContact}</p>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="required">Warranty Expiration Date</label>
                                    <input
                                        className={formErrors?.warrantyExpirationDate ? "invalid-input" : ""}
                                        type="date"
                                        value={formData.warrantyExpirationDate}
                                        onChange={(e) => handleChange("warrantyExpirationDate", e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="edit-error-message">{formErrors?.warrantyExpirationDate}</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Document Attachments */}

            <p className="details-title">III. Document Attachments</p>
            <div className="modal-content edit">
                <form className="edit-form">
                    {/* Official Receipt (OR) */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="required">Official Receipt (OR) Attachment</label>
                            <label htmlFor="file-input-or" className="upload-zone">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={async (e) => {
                                        if (getTotalFilesCount() >= 10) {
                                            await showBusSaveError("You can only attach up to 10 files per bus record.");
                                            return;
                                        }
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setPendingOrFile(file);
                                        } else {
                                            setPendingOrFile(null);
                                        }
                                    }}
                                    className="upload-input"
                                    id="file-input-or"
                                />
                                <div className="upload-icon"><i className="ri-file-text-line" /></div>
                                <div>
                                    <p className="upload-text">Click to browse files</p>
                                    <p className="upload-subtext">PDF, JPG, PNG</p>
                                </div>
                            </label>

                            {/* Show existing OR file */}
                            {formData.orFile && !pendingOrFile && (
                                <FileList
                                    files={[{ name: formData.orFile }]}
                                    showRemove={true}
                                    onRemove={() => handleChange("orFile", "")}
                                />
                            )}

                            {/* Show pending OR file */}
                            {pendingOrFile && (
                                <FileList
                                    files={[{ name: pendingOrFile.name, size: pendingOrFile.size }]}
                                    showRemove={true}
                                    onRemove={() => setPendingOrFile(null)}
                                />
                            )}
                            <p className="edit-error-message">{formErrors?.orFile}</p>
                        </div>
                    </div>

                    {/* Certificate of Registration (CR) */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Certificate of Registration (CR) Attachment</label>
                            <label htmlFor="file-input-cr" className="upload-zone">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={async (e) => {
                                        if (getTotalFilesCount() >= 10) {
                                            await showBusSaveError("You can only attach up to 10 files per bus record.");
                                            return;
                                        }
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setPendingCrFile(file);
                                        } else {
                                            setPendingCrFile(null);
                                        }
                                    }}
                                    className="upload-input"
                                    id="file-input-cr"
                                />
                                <div className="upload-icon"><i className="ri-file-text-line" /></div>
                                <div>
                                    <p className="upload-text">Click to browse files</p>
                                    <p className="upload-subtext">PDF, JPG, PNG</p>
                                </div>
                            </label>

                            {/* Show existing CR file */}
                            {formData.crFile && !pendingCrFile && (
                                <FileList
                                    files={[{ name: formData.crFile }]}
                                    showRemove={true}
                                    onRemove={() => handleChange("crFile", "")}
                                />
                            )}

                            {/* Show pending CR file */}
                            {pendingCrFile && (
                                <FileList
                                    files={[{ name: pendingCrFile.name, size: pendingCrFile.size }]}
                                    showRemove={true}
                                    onRemove={() => setPendingCrFile(null)}
                                />
                            )}
                            <p className="edit-error-message">{formErrors?.crFile}</p>
                        </div>
                    </div>

                    {/* Other Documents/Attachments */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Other Attachments</label>
                            <label htmlFor="file-input-other" className="upload-zone">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    multiple
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length === 0) return;
                                        if (getTotalFilesCount() + files.length > 10) {
                                            await showBusSaveError("You can only attach up to 10 files per bus record.");
                                            return;
                                        }
                                        setPendingOtherFiles(prev => [...prev, ...files]);
                                    }}
                                    className="upload-input"
                                    id="file-input-other"
                                />
                                <div className="upload-icon"><i className="ri-file-text-line" /></div>
                                <div>
                                    <p className="upload-text">Click to browse files</p>
                                    <p className="upload-subtext">PDF, JPG, PNG • Multiple files allowed</p>
                                </div>
                            </label>

                            {/* Display existing documents */}
                            {formData.otherDocuments.length > 0 && (
                                <>
                                    <div className="uploaded-files-label">Existing Files ({formData.otherDocuments.length})</div>
                                    <FileList
                                        files={formData.otherDocuments.map(name => ({ name }))}
                                        showRemove={true}
                                        onRemove={(idx) => {
                                            const updated = formData.otherDocuments.filter((_, i) => i !== idx);
                                            handleChange("otherDocuments", updated);
                                        }}
                                    />
                                </>
                            )}

                            {/* Display pending documents */}
                            {pendingOtherFiles.length > 0 && (
                                <>
                                    <div className="uploaded-files-label">New Files ({pendingOtherFiles.length})</div>
                                    <FileList
                                        files={pendingOtherFiles.map(f => ({ name: f.name, size: f.size }))}
                                        showRemove={true}
                                        onRemove={(idx) => {
                                            setPendingOtherFiles(prev => prev.filter((_, i) => i !== idx));
                                        }}
                                    />
                                </>
                            )}

                            <p className="edit-error-message">{formErrors?.otherDocuments}</p>
                        </div>
                    </div>
                </form>
            </div>


            <div className="modal-actions">
                <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={!isFormDirty}>
					<i className="ri-save-3-line" /> Update
				</button>
            </div>
        </>
    );
}