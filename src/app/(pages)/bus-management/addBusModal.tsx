import React, { useState, useEffect } from "react";
import { FileList } from "@/components/fileList";

import {
    showBusSaveConfirmation, showBusSavedSuccess,
    showCloseWithoutSavingConfirmation, showBusSaveError,
    showRemoveFileConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface BusForm {
    // Basic Identification
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
}
interface FormError {
    [key: string]: string;
}

interface AddBusModalProps {
    onSave: (busForm: BusForm) => void;
    onClose: () => void;
}

export default function AddBusModal({ onSave, onClose }: AddBusModalProps) {
    // Initial bus form state
    const [busForm, setBusForm] = useState<BusForm>({
        plateNumber: "",
        bodyNumber: "",
        bodyBuilder: "",
        busType: "",
        status: "active",
        manufacturer: "",
        seatCapacity: 0,
        chassisNumber: "",
        engineNumber: "",

        // New basic fields
        model: "",
        yearModel: "",
        condition: "",
        acquisitionDate: "",
        acquisitionMethod: "",
        warrantyExpirationDate: "",

        // Second hand details
        previousOwner: "",
        previousOwnerContact: "",
        source: "",
        odometerReading: 0,
        lastRegistrationDate: "",
        lastMaintenanceDate: "",
        conditionNotes: "",

        // Brand new details
        dealerName: "",
        dealerContact: "",

        // Document Attachments
        orFile: "",
        crFile: "",
        otherDocuments: [],

    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // NOTE: backend file meta state removed
    //    const [orFileMeta, setOrFileMeta] = useState<{ file_name: string, file_url: string } | null>(null);
    //    const [crFileMeta, setCrFileMeta] = useState<{ file_name: string, file_url: string } | null>(null);
    //    const [otherFilesMeta, setOtherFilesMeta] = useState<{ file_name: string, file_url: string, file_type: string }[]>([]);
    // client-side pending file state is kept for UI only

    // New: Store selected files before upload
    const [pendingOrFile, setPendingOrFile] = useState<File | null>(null);
    const [pendingCrFile, setPendingCrFile] = useState<File | null>(null);
    const [pendingOtherFiles, setPendingOtherFiles] = useState<File[]>([]);

    // Track if any form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [busForm]);

    const handleChange = (field: string, value: any) => {
        setBusForm((prev) => ({ ...prev, [field]: value }));

        // Clear the error for that field
        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    // Generate year options for the year model dropdown
    const currentYear = new Date().getFullYear();
    const startYear = 1980;
    const yearOptions = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

    // Function to validate the form
    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!busForm.plateNumber) errors.plateNumber = "Plate number is required";
        if (!busForm.bodyNumber) errors.bodyNumber = "Body number is required";
        if (!busForm.bodyBuilder) errors.bodyBuilder = "Body builder is required";
        if (!busForm.busType) errors.busType = "Bus type is required";
        if (!busForm.manufacturer) errors.manufacturer = "Manufacturer is required";
        if (busForm.seatCapacity <= 0) errors.seatCapacity = "Seat capacity must be more than 0";
        if (!busForm.chassisNumber) errors.chassisNumber = "Chassis number is required";
        if (!busForm.engineNumber) errors.engineNumber = "Engine number is required";

        // Ensure unique values among identifiers
        const plateNumber = busForm.plateNumber.trim();
        const bodyNumber = busForm.bodyNumber.trim();
        const chassisNumber = busForm.chassisNumber.trim();
        const engineNumber = busForm.engineNumber.trim();

        if (plateNumber && plateNumber === bodyNumber) {
            const msg = "Plate/Body number must not be the same";
            errors.plateNumber = msg;
            errors.bodyNumber = msg;
        }
        if (plateNumber && plateNumber === chassisNumber) {
            const msg = "Plate/Chassis number must not be the same";
            errors.plateNumber = msg;
            errors.chassisNumber = msg;
        }
        if (plateNumber && plateNumber === engineNumber) {
            const msg = "Plate/Engine number must not be the same";
            errors.plateNumber = msg;
            errors.engineNumber = msg;
        }
        if (bodyNumber && bodyNumber === chassisNumber) {
            const msg = "Body/Chassis number must not be the same";
            errors.bodyNumber = msg;
            errors.chassisNumber = msg;
        }
        if (bodyNumber && bodyNumber === engineNumber) {
            const msg = "Body/Engine number must not be the same";
            errors.bodyNumber = msg;
            errors.engineNumber = msg;
        }
        if (chassisNumber && chassisNumber === engineNumber) {
            const msg = "Chassis/Engine number must not be the same";
            errors.chassisNumber = msg;
            errors.engineNumber = msg;
        }

        // New basic fields validation 
        if (!busForm.model) errors.model = "Model is required";
        if (!busForm.yearModel) {
            errors.yearModel = "Year model is required";
        } else if (!/^\d{4}$/.test(busForm.yearModel)) {
            errors.yearModel = "Year model must be a 4-digit year";
        }
        if (!busForm.condition) errors.condition = "Condition is required";
        if (!busForm.acquisitionDate) {
            errors.acquisitionDate = "Acquisition date is required";
        } else {
            const today = new Date();
            const selectedDate = new Date(busForm.acquisitionDate);
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                errors.acquisitionDate = "Acquisition date cannot be set to a future date";
            }
        }
        if (!busForm.acquisitionMethod) errors.acquisitionMethod = "Acquisition method is required";


        // Second hand details validation
        if (busForm.condition === "second-hand") {
            if (!busForm.previousOwner) errors.previousOwner = "Dealer Name is required";
            if (!busForm.previousOwnerContact) errors.previousOwnerContact = "Dealer contact is required";
            if (busForm.previousOwnerContact && !/^\d{11}$/.test(busForm.previousOwnerContact?.toString() || "")) {
                errors.previousOwnerContact = "Dealer contact must be exactly 11 digits";
            }
            if (!busForm.source) errors.source = "Source is required";
            if (busForm.odometerReading !== undefined && busForm.odometerReading <= 0) errors.odometerReading = "Odometer reading must be more than 0";
            if (!busForm.lastRegistrationDate) {
                errors.lastRegistrationDate = "Last registration date is required";
            } else {
                const today = new Date();
                const selectedDate = new Date(busForm.lastRegistrationDate);
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    errors.lastRegistrationDate = "Last registration date cannot be set to a future date";
                }
            }
            if (!busForm.lastMaintenanceDate) {
                errors.lastMaintenanceDate = "Last maintenance date is required";
            } else {
                const today = new Date();
                const selectedDate = new Date(busForm.lastMaintenanceDate);
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    errors.lastMaintenanceDate = "Last maintenance date cannot be set to a future date";
                }
            }
        }

        // Brandnew details validation
        else if (busForm.condition === "brand-new") {
            if (!busForm.warrantyExpirationDate) {
                errors.warrantyExpirationDate = "Warranty expiry date is required";
            } else {
                const today = new Date();
                const selectedDate = new Date(busForm.warrantyExpirationDate);
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    errors.warrantyExpirationDate = "Warranty expiry date cannot be set to a past date";
                }
            }
            if (!busForm.dealerName) errors.dealerName = "Dealer name is required";
            if (!busForm.dealerContact) {
                errors.dealerContact = "Dealer contact is required";
            } else if (!/^\d{11}$/.test(busForm.dealerContact.toString())) {
                errors.dealerContact = "Dealer contact must be exactly 11 digits";
            }
        }

        // Document Attachments validation - check for actual file selections
        if (!pendingOrFile) errors.orFile = "Official Receipt is required";
        if (!pendingCrFile) errors.crFile = "Certification of Registration is required";

        if (pendingOtherFiles.length === 0) {
            errors.otherDocuments = "At least one other document is required";
        }

        setFormErrors(errors);
        console.log('Validation errors:', errors);
        return Object.keys(errors).length === 0;
    };

    // Utility to count total files
    const getTotalFilesCount = () => {
        let count = 0;
        if (pendingOrFile) count++;
        if (pendingCrFile) count++;
        count += pendingOtherFiles.length;
        return count;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Form submission started');
        console.log('Current form state:', busForm);
        console.log('Pending files:', { pendingOrFile, pendingCrFile, pendingOtherFiles });

        if (!validateForm()) {
            console.log('Form validation failed');
            return;
        }

        console.log('Form validation passed, checking file count');

        if (getTotalFilesCount() > 10) {
            await showBusSaveError("You can only attach up to 10 files per bus record.");
            return;
        }

        console.log('About to show confirmation dialog');
        const result = await showBusSaveConfirmation();
        console.log('Confirmation result:', result);

        if (result.isConfirmed) {
            setIsSaving(true);
            try {
                // Backend upload and POST removed.
                // Build a simple client-side summary of attached filenames (no upload)
                const busOtherFiles = [];
                if (pendingOrFile) {
                    busOtherFiles.push({
                        file_name: pendingOrFile.name,
                        file_type: 'OR',
                    });
                }
                if (pendingCrFile) {
                    busOtherFiles.push({
                        file_name: pendingCrFile.name,
                        file_type: 'CR',
                    });
                }
                if (pendingOtherFiles.length > 0) {
                    pendingOtherFiles.forEach(file => {
                        busOtherFiles.push({
                            file_name: file.name,
                            file_type: 'OTHER',
                        });
                    });
                }

                // Attach filenames to a copy of the form for the onSave callback (client-only)
                const busFormToSave = {
                    ...busForm,
                    orFile: pendingOrFile ? pendingOrFile.name : busForm.orFile,
                    crFile: pendingCrFile ? pendingCrFile.name || "" : busForm.crFile,
                    otherDocuments: busOtherFiles.map(f => f.file_name),
                };

                // Call onSave (parent component handles persistence if needed)
                onSave(busFormToSave as BusForm);

                // Show success alert (client-side)
                await showBusSavedSuccess();

                // Do not reload page — backend removed
            } catch (error: any) {
                console.error('Error saving bus (client-side):', error);
                setError(error?.message || 'Failed to save bus');

                // Show error using SweetAlert (client-side)
                await showBusSaveError(error?.message || 'Failed to save bus');
            } finally {
                setIsSaving(false);
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

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Add Bus</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            <p className="details-title">I. Basic Identification</p>
            <div className="modal-content add">
                {/* Basic Identification */}
                <form className="add-form">
                    {/* Form row - plate number and body number */}
                    <div className="form-row">
                        {/* Plate Number */}
                        <div className="form-group">
                            <label className="required">Plate Number</label>
                            <input
                                className={formErrors?.plateNumber ? "invalid-input" : ""}
                                type="text"
                                value={busForm.plateNumber}
                                onChange={(e) => handleChange("plateNumber", e.target.value)}
                                placeholder="Enter plate number here..."
                            />
                            <p className="add-error-message">{formErrors?.plateNumber}</p>
                        </div>

                        {/* Body Number */}
                        <div className="form-group">
                            <label className="required">Body Number</label>
                            <input
                                className={formErrors?.bodyNumber ? "invalid-input" : ""}
                                type="text"
                                value={busForm.bodyNumber}
                                onChange={(e) => handleChange("bodyNumber", e.target.value)}
                                placeholder="Enter body number here..."
                            />
                            <p className="add-error-message">{formErrors?.bodyNumber}</p>
                        </div>
                    </div>

                    {/* Form row - body builder and bus type */}
                    <div className="form-row">
                        {/* Body Builder */}
                        <div className="form-group">
                            <label className="required">Body Builder</label>
                            <select
                                className={formErrors?.bodyBuilder ? "invalid-input" : ""}
                                value={busForm.bodyBuilder}
                                onChange={(e) => handleChange("bodyBuilder", e.target.value)}
                            >
                                <option value="" disabled>Select body builder...</option>
                                <option value="agila">Agila</option>
                                <option value="hilltop">Hilltop</option>
                                <option value="rbm">RBM</option>
                                <option value="darj">DARJ</option>
                            </select>
                            <p className="add-error-message">{formErrors?.bodyBuilder}</p>
                        </div>

                        {/* Bus Type */}
                        <div className="form-group">
                            <label className="required">Bus Type</label>
                            <select
                                className={formErrors?.busType ? "invalid-input" : ""}
                                value={busForm.busType}
                                onChange={(e) => handleChange("busType", e.target.value)}
                            >
                                <option value="" disabled>Select bus type...</option>
                                <option value="airconditioned">Airconditioned</option>
                                <option value="ordinary">Ordinary</option>
                            </select>
                            <p className="add-error-message">{formErrors?.busType}</p>
                        </div>
                    </div>

                    {/* Form row - manufacturer, model, year model */}
                    <div className="form-row">
                        {/* Manufacturer */}
                        <div className="form-group">
                            <label className="required">Manufacturer</label>
                            <input
                                className={formErrors?.manufacturer ? "invalid-input" : ""}
                                type="text"
                                value={busForm.manufacturer}
                                onChange={(e) => handleChange("manufacturer", e.target.value)}
                                placeholder="Enter manufacturer here..."
                            />
                            <p className="add-error-message">{formErrors?.manufacturer}</p>
                        </div>

                        {/* Model */}
                        <div className="form-group">
                            <label className="required">Model</label>
                            <input
                                className={formErrors?.model ? "invalid-input" : ""}
                                type="text"
                                value={busForm.model}
                                onChange={(e) => handleChange("model", e.target.value)}
                                placeholder="Enter model here..."
                            />
                            <p className="add-error-message">{formErrors?.model}</p>
                        </div>

                        {/* Year Model */}
                        <div className="form-group">
                            <label className="required">Year Model</label>
                            <select
                                className={formErrors?.yearModel ? "invalid-input" : ""}
                                value={busForm.yearModel}
                                onChange={(e) => handleChange("yearModel", e.target.value)}
                            >
                                <option value="" disabled>Select year model...</option>
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <p className="add-error-message">{formErrors?.yearModel}</p>
                        </div>
                    </div>

                    {/* Form row - chassis number and engine number */}
                    <div className="form-row">
                        {/* Chassis Number */}
                        <div className="form-group">
                            <label className="required">Chassis Number</label>
                            <input
                                className={formErrors?.chassisNumber ? "invalid-input" : ""}
                                type="text"
                                value={busForm.chassisNumber}
                                onChange={(e) => handleChange("chassisNumber", e.target.value)}
                                placeholder="Enter chassis number here..."
                            />
                            <p className="add-error-message">{formErrors?.chassisNumber}</p>
                        </div>

                        {/* Engine Number */}
                        <div className="form-group">
                            <label className="required">Engine Number</label>
                            <input
                                className={formErrors?.engineNumber ? "invalid-input" : ""}
                                type="text"
                                value={busForm.engineNumber}
                                onChange={(e) => handleChange("engineNumber", e.target.value)}
                                placeholder="Enter engine number here..."
                            />
                            <p className="add-error-message">{formErrors?.engineNumber}</p>
                        </div>
                    </div>

                    {/* Form row - condition, seat capacity, status */}
                    <div className="form-row">
                        {/* Condition */}
                        <div className="form-group">
                            <label className="required">Condition</label>
                            <select
                                className={formErrors?.condition ? "invalid-input" : ""}
                                value={busForm.condition}
                                onChange={(e) => handleChange("condition", e.target.value)}
                            >
                                <option value="" disabled>Select bus condition...</option>
                                <option value="brand-new">Brand New</option>
                                <option value="second-hand">Second Hand</option>
                            </select>
                            <p className="add-error-message">{formErrors?.condition}</p>
                        </div>

                        {/* Seat Capacity */}
                        <div className="form-group">
                            <label className="required">Seat Capacity</label>
                            <input
                                className={formErrors?.seatCapacity ? "invalid-input" : ""}
                                type="number"
                                step="1"
                                min="0"
                                value={busForm.seatCapacity || ""}
                                onChange={(e) => {
                                    // Only allow integers, ignore decimals
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        handleChange("seatCapacity", value === "" ? 0 : Number(value));
                                    }
                                }}
                                placeholder="0"
                                inputMode="numeric"
                                pattern="\d*"
                            />
                            <p className="add-error-message">{formErrors?.seatCapacity}</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                disabled
                                value={busForm.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                            >
                                <option value="active">Active</option>
                                <option value="decommissioned">Decommissioned</option>
                                <option value="under-maintenance">Under Maintenance(or being process)</option>
                            </select>
                            <p className="add-error-message">{formErrors?.status}</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* Show details based on condition */}
            {busForm.condition === "second-hand" && (
                <>
                    <p className="details-title">II. Second Hand Details</p>
                    <div className="modal-content add">
                        {/* Second Hand Details */}
                        <form className="add-form">
                            {/* Form row - acquisition date and acquisition method */}
                            <div className="form-row">
                                {/* Acquisition Date */}
                                <div className="form-group">
                                    <label className="required">Acquisition Date</label>
                                    <input
                                        className={formErrors?.acquisitionDate ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.acquisitionDate}
                                        onChange={(e) => handleChange("acquisitionDate", e.target.value)}
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.acquisitionDate}</p>
                                </div>

                                {/* Acquisition Method */}
                                <div className="form-group">
                                    <label className="required">Acquisition Method</label>
                                    <select
                                        className={formErrors?.acquisitionMethod ? "invalid-input" : ""}
                                        value={busForm.acquisitionMethod}
                                        onChange={(e) => handleChange("acquisitionMethod", e.target.value)}
                                    >
                                        <option value="" disabled>Select acquisition method...</option>
                                        <option value="purchased">Purchased</option>
                                        <option value="donated">Donated</option>
                                        <option value="leased">Leased</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.acquisitionMethod}</p>
                                </div>
                            </div>

                            {/* Form row - previous owner name and age */}
                            <div className="form-row">
                                {/* Previous Owner */}
                                <div className="form-group">
                                    <label className="required">Dealer Name</label>
                                    <input
                                        className={formErrors?.previousOwner ? "invalid-input" : ""}
                                        type="text"
                                        value={busForm.previousOwner}
                                        onChange={(e) => handleChange("previousOwner", e.target.value)}
                                        placeholder="Enter previous owner name here..."
                                    />
                                    <p className="add-error-message">{formErrors?.previousOwner}</p>
                                </div>

                                {/* Previous Owner Contact */}
                                <div className="form-group">
                                    <label className="required">Dealer Contact</label>
                                    <input
                                        className={formErrors?.previousOwnerContact ? "invalid-input" : ""}
                                        type="text"
                                        value={busForm.previousOwnerContact}
                                        onChange={(e) => {
                                            // Only allow numbers, hyphens, and spaces
                                            const value = e.target.value.replace(/[^0-9]/g, "");
                                            handleChange("previousOwnerContact", value);
                                        }}
                                        placeholder="Enter previous owner contact here..."
                                        inputMode="tel"
                                        pattern="[0-9]*"
                                        maxLength={11}
                                    />
                                    <p className="add-error-message">{formErrors?.previousOwnerContact}</p>
                                </div>
                            </div>

                            {/* Form row - source and odometer reader */}
                            <div className="form-row">
                                {/* Source */}
                                <div className="form-group">
                                    <label className="required">Source</label>
                                    <select
                                        className={formErrors?.source ? "invalid-input" : ""}
                                        value={busForm.source}
                                        onChange={(e) => handleChange("source", e.target.value)}
                                    >
                                        <option value="" disabled>Select source...</option>
                                        <option value="dealership">Dealership</option>
                                        <option value="auction">Auction</option>
                                        <option value="private-individual">Private Individual</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.source}</p>
                                </div>

                                {/* Odometer Reading */}
                                <div className="form-group">
                                    <label className="required">Odometer Reading</label>
                                    <input
                                        className={formErrors?.odometerReading ? "invalid-input" : ""}
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={busForm.odometerReading}
                                        onChange={(e) => {
                                            // Only allow integers, ignore decimals
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value)) {
                                                handleChange("odometerReading", value === "" ? 0 : Number(value));
                                            }
                                        }}

                                        inputMode="numeric"
                                        pattern="\d*"
                                        placeholder="Enter odometer reading..."
                                    />
                                    <p className="add-error-message">{formErrors?.odometerReading}</p>
                                </div>
                            </div>

                            {/* Form row - warranty expiration date */}
                            <div className="form-row">
                                {/* Warranty Expiration Date */}
                                <div className="form-group">
                                    <label>Warranty Expiration Date</label>
                                    <input
                                        type="date"
                                        value={busForm.warrantyExpirationDate}
                                        onChange={(e) => handleChange("warrantyExpirationDate", e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message"></p>
                                </div>
                            </div>

                            {/* Form row - last registration date and last maintenance date */}
                            <div className="form-row">
                                {/* Last Registration Date */}
                                <div className="form-group">
                                    <label className="required">Last Registration Date</label>
                                    <input
                                        className={formErrors?.lastRegistrationDate ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.lastRegistrationDate}
                                        onChange={(e) => handleChange("lastRegistrationDate", e.target.value)}
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.lastRegistrationDate}</p>
                                </div>

                                {/* Last Maintenance Date */}
                                <div className="form-group">
                                    <label className="required">Last Maintenance Date</label>
                                    <input
                                        className={formErrors?.lastMaintenanceDate ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.lastMaintenanceDate}
                                        onChange={(e) => handleChange("lastMaintenanceDate", e.target.value)}
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.lastMaintenanceDate}</p>
                                </div>
                            </div>

                            {/* Form row - initial bus condition/notes */}
                            <div className="form-row">
                                {/* Initial Bus Condition/Notes */}
                                <div className="form-group">
                                    <label>Initial Bus Condition/Notes</label>
                                    <textarea
                                        className={formErrors?.conditionNotes ? "invalid-input" : ""}
                                        value={busForm.conditionNotes}
                                        onChange={(e) => handleChange("conditionNotes", e.target.value)}
                                        placeholder="Enter initial bus condition or notes here..."
                                        rows={3}
                                    />
                                    <p className="add-error-message">{formErrors?.conditionNotes}</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {busForm.condition === "brand-new" && (
                <>
                    <p className="details-title">II. Brand New Details</p>
                    <div className="modal-content add">
                        {/* Brand New Details */}
                        <form className="add-form">
                            {/* Form row - acquisition date and acquisition method */}
                            <div className="form-row">
                                {/* Acquisition Date */}
                                <div className="form-group">
                                    <label className="required">Acquisition Date</label>
                                    <input
                                        className={formErrors?.acquisitionDate ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.acquisitionDate}
                                        onChange={(e) => handleChange("acquisitionDate", e.target.value)}
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.acquisitionDate}</p>
                                </div>

                                {/* Acquisition Method */}
                                <div className="form-group">
                                    <label className="required">Acquisition Method</label>
                                    <select
                                        className={formErrors?.acquisitionMethod ? "invalid-input" : ""}
                                        value={busForm.acquisitionMethod}
                                        onChange={(e) => handleChange("acquisitionMethod", e.target.value)}
                                    >
                                        <option value="" disabled>Select acquisition method...</option>
                                        <option value="purchased">Purchased</option>
                                        <option value="donated">Donated</option>
                                        <option value="leased">Leased</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.acquisitionMethod}</p>
                                </div>
                            </div>

                            {/* Form row - dealer name and dealer contact */}
                            <div className="form-row">
                                {/* Dealer Name */}
                                <div className="form-group">
                                    <label className="required">Dealer Name</label>
                                    <input
                                        className={formErrors?.dealerName ? "invalid-input" : ""}
                                        type="text"
                                        value={busForm.dealerName}
                                        onChange={(e) => handleChange("dealerName", e.target.value)}
                                        placeholder="Enter dealer name here..."
                                    />
                                    <p className="add-error-message">{formErrors?.dealerName}</p>
                                </div>

                                {/* Dealer Contact */}
                                <div className="form-group">
                                    <label className="required">Dealer Contact</label>
                                    <input
                                        className={formErrors?.dealerContact ? "invalid-input" : ""}
                                        type="text"
                                        value={busForm.dealerContact}
                                        onChange={(e) => {
                                            // Only allow numbers, hyphens, and spaces
                                            const value = e.target.value.replace(/[^0-9\- ]/g, "");
                                            handleChange("dealerContact", value);
                                        }}
                                        placeholder="Enter dealer owner contact here..."
                                        inputMode="tel"
                                        pattern="[0-9]*"
                                        maxLength={11}
                                    />
                                    <p className="add-error-message">{formErrors?.dealerContact}</p>
                                </div>
                            </div>

                            {/* Form row - warranty expiration date */}
                            <div className="form-row">
                                {/* Warranty Expiration Date */}
                                <div className="form-group">
                                    <label className="required">Warranty Expiration Date</label>
                                    <input
                                        className={formErrors?.warrantyExpirationDate ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.warrantyExpirationDate}
                                        onChange={(e) => handleChange("warrantyExpirationDate", e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.warrantyExpirationDate}</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Only show Document Attachments if a condition is selected */}
            {(busForm.condition === "brand-new" || busForm.condition === "second-hand") && (
                <>
                    <p className="details-title">III. Document Attachments</p>
                    <div className="modal-content add">
                        {/* Attached Documents */}
                        <form className="add-form">
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
                                                    handleChange("orFile", file.name);
                                                } else {
                                                    setPendingOrFile(null);
                                                    handleChange("orFile", "");
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

                                    {/* Display uploaded document */}
                                    {pendingOrFile && (
                                        <FileList
                                            files={[{ name: pendingOrFile.name, size: pendingOrFile.size }]
                                            }
                                            showRemove={true}
                                            onRemove={async () => {
                                                const result = await showRemoveFileConfirmation();
                                                if (result.isConfirmed) {
                                                    setPendingOrFile(null);
                                                    handleChange("orFile", "");
                                                }
                                            }}
                                        />
                                    )}
                                    <p className="add-error-message">{formErrors?.orFile}</p>
                                </div>
                            </div>

                            {/* Certificate of Registration (CR) */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="required">Certificate of Registration (CR) Attachment</label>
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
                                                    handleChange("crFile", file.name);
                                                } else {
                                                    setPendingCrFile(null);
                                                    handleChange("crFile", "");
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

                                    {/* Display uploaded document */}
                                    {pendingCrFile && (
                                        <FileList
                                            files={[{ name: pendingCrFile.name, size: pendingCrFile.size }]
                                            }
                                            showRemove={true}
                                            onRemove={async () => {
                                                const result = await showRemoveFileConfirmation();
                                                if (result.isConfirmed) {
                                                    setPendingCrFile(null);
                                                    handleChange("crFile", "");
                                                }
                                            }}
                                        />
                                    )}
                                    <p className="add-error-message">{formErrors?.crFile}</p>
                                </div>
                            </div>

                            {/* Other Documents/Attachments */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="required">Other Attachments</label>
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

                                    {/* Display uploaded documents list */}
                                    {pendingOtherFiles.length > 0 && (
                                        <>
                                            <div className="uploaded-files-label">Uploaded Files ({pendingOtherFiles.length})</div>
                                            <FileList
                                                files={pendingOtherFiles.map(f => ({ name: f.name, size: f.size }))}
                                                showRemove={true}
                                                onRemove={async (idx) => {
                                                    const result = await showRemoveFileConfirmation();
                                                    if (result.isConfirmed) {
                                                        setPendingOtherFiles(prev => prev.filter((_, i) => i !== idx));
                                                    }
                                                }} />
                                        </>
                                    )}

                                    <p className="add-error-message">{formErrors?.otherDocuments}</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </>
            )}

            <div className="modal-actions">
                <button type="submit" className="submit-btn" onClick={handleSubmit}>
                    <i className="ri-save-3-line" /> {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>

        </>
    );
}