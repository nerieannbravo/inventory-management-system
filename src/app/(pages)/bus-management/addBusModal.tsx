import React, { useState, useEffect } from "react";
import { uploadFile } from "@/app/lib/uploadFile";

import {
    showBusSaveConfirmation, showBusSavedSuccess,
    showCloseWithoutSavingConfirmation, showBusSaveError,
    showRemoveFileConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface BusForm {
    plate_number: string,
    body_number: string,
    bodyBuilder: string,
    bus_type: string,
    status: string,
    manufacturer: string,
    seat_capacity: number,
    chasis_number: string,
    engine_number: string,

    //New basic fields
    model: string,
    year_model: string,
    condition: string,
    acquisition_date?: string,
    acquisition_method?: string,
    warranty_expiration_date: string,
    registration_status?: string,


    //Second hand details
    previous_owner?: string,
    previous_owner_contact?: string,
    source?: string,
    odometer_reading?: number,
    last_registration_date?: string,
    last_maintenance_date?: string,
    bus_condition_notes?: string,

    //Brand new details
    dealer_name?: string,
    dealer_contact?: number,

    // Document Attachments
    or_file: string,
    cr_file?: string,
    otherDocuments: string[],
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
        plate_number: "",
        body_number: "",
        bodyBuilder: "",
        bus_type: "",
        status: "active",
        manufacturer: "",
        seat_capacity: 0,
        chasis_number: "",
        engine_number: "",

        // New basic fields
        model: "",
        year_model: "",
        condition: "",
        acquisition_date: "",
        acquisition_method: "",
        registration_status: "",
        warranty_expiration_date: "",

        // Second hand details
        previous_owner: "",
        previous_owner_contact: "",
        source: "",
        odometer_reading: 0,
        last_registration_date: "",
        last_maintenance_date: "",
        bus_condition_notes: "",

        // Brand new details
        dealer_name: "",
        dealer_contact: 0,

        // Document Attachments
        or_file: "",
        cr_file: "",
        otherDocuments: [],

    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Add state to store uploaded file meta
    const [orFileMeta, setOrFileMeta] = useState<{ file_name: string, file_url: string } | null>(null);
    const [crFileMeta, setCrFileMeta] = useState<{ file_name: string, file_url: string } | null>(null);
    const [otherFilesMeta, setOtherFilesMeta] = useState<{ file_name: string, file_url: string, file_type: string }[]>([]);

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

        if (!busForm.plate_number) errors.plate_number = "Plate number is required";
        if (!busForm.body_number) errors.body_number = "Body number is required";
        if (!busForm.bodyBuilder) errors.bodyBuilder = "Body builder is required";
        if (!busForm.bus_type) errors.bus_type = "Bus type is required";
        if (!busForm.manufacturer) errors.manufacturer = "Manufacturer is required";
        if (busForm.seat_capacity <= 0) errors.seat_capacity = "Seat capacity must be more than 0";
        if (!busForm.chasis_number) errors.chasis_number = "Chasis number is required";
        if (!busForm.engine_number) errors.engine_number = "Engine number is required";

            // Ensure unique values among identifiers
        const plateNumber = busForm.plate_number.trim();
        const bodyNumber = busForm.body_number.trim();
        const chasisNumber = busForm.chasis_number.trim();
        const engineNumber = busForm.engine_number.trim();

        if (plateNumber && plateNumber === bodyNumber) {
        const msg = "Plate/Body number must not be the same";
        errors.plate_number = msg;
        errors.body_number = msg;
        }
        if (plateNumber && plateNumber === chasisNumber) {
        const msg = "Plate/Chasis number must not be the same";
        errors.plate_number = msg;
        errors.chasis_number = msg;
        }
        if (plateNumber && plateNumber === engineNumber) {
        const msg = "Plate/Engine number must not be the same";
        errors.plate_number = msg;
        errors.engine_number = msg;
        }
        if (bodyNumber && bodyNumber === chasisNumber) {
        const msg = "Body/Chasis number must not be the same";
        errors.body_number = msg;
        errors.chasis_number = msg;
        }
        if (bodyNumber && bodyNumber === engineNumber) {
        const msg = "Body/Engine number must not be the same";
        errors.body_number = msg;
        errors.engine_number = msg;
        }
        if (chasisNumber && chasisNumber === engineNumber) {
        const msg = "Chasis/Engine number must not be the same";
        errors.chasis_number = msg;
        errors.engine_number = msg;
        }

        // New basic fields validation 
        if (!busForm.model) errors.model = "Model is required";
        if (!busForm.year_model) {
            errors.year_model = "Year model is required";
        } else if (!/^\d{4}$/.test(busForm.year_model)) {
            errors.year_model = "Year model must be a 4-digit year";
        }
        if (!busForm.condition) errors.condition = "Condition is required";
        if (!busForm.acquisition_date) {
            errors.acquisition_date = "Acquisition date is required";
        } else {
            const today = new Date();
            const selectedDate = new Date(busForm.acquisition_date);
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                errors.acquisition_date = "Acquisition date cannot be set to a future date";
            }
        }
        if (!busForm.acquisition_method) errors.acquisition_method = "Acquisition method is required";
        if (!busForm.registration_status) errors.registration_status = "Registration status is required";
        

        // Second hand details validation
        if (busForm.condition === "second-hand") {
            if (!busForm.previous_owner) errors.previous_owner = "Dealer Name is required";
            if (!busForm.previous_owner_contact) errors.previous_owner_contact = "Dealer contact is required";
            if (busForm.previous_owner_contact && !/^\d{11}$/.test(busForm.previous_owner_contact?.toString() || "")) {
                errors.previous_owner_contact = "Dealer contact must be exactly 11 digits";
            }
            if (!busForm.source) errors.source = "Source is required";
            if (busForm.odometer_reading !== undefined && busForm.odometer_reading <= 0) errors.odometer_reading = "Odometer reading must be more than 0";
            if (!busForm.last_registration_date) {
                errors.last_registration_date = "Last registration date is required";
            } else {
                const today = new Date();
                const selectedDate = new Date(busForm.last_registration_date);
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    errors.last_registration_date = "Last registration date cannot be set to a future date";
                }
            }
            if (!busForm.last_maintenance_date) {
                errors.last_maintenance_date = "Last maintenance date is required";
            } else {
                const today = new Date();
                const selectedDate = new Date(busForm.last_maintenance_date);
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    errors.last_maintenance_date = "Last maintenance date cannot be set to a future date";
                }
            }
        }

        // Brandnew details validation
        else if (busForm.condition === "brand-new") {
            if (!busForm.warranty_expiration_date) {
            errors.warranty_expiration_date = "Warranty expiry date is required";
        } else {
            const today = new Date();
            const selectedDate = new Date(busForm.warranty_expiration_date);
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                errors.warranty_expiration_date = "Warranty expiry date cannot be set to a past date";
            }
        }
            if (!busForm.dealer_name) errors.dealer_name = "Dealer name is required";
            if (!busForm.dealer_contact) {
                errors.dealer_contact = "Dealer contact is required";
            } else if (!/^\d{11}$/.test(busForm.dealer_contact.toString())) {
                errors.dealer_contact = "Dealer contact must be exactly 11 digits";
            }
        }

        // Document Attachments validation
        if (!busForm.or_file) errors.or_file = "Official Receipt is required";
        if (busForm.registration_status === "registered" && !busForm.cr_file) {
            if (!busForm.cr_file) errors.cr_file = "Certification of Registration is required";
        }
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

        if (!validateForm()) return;

        if (getTotalFilesCount() > 10) {
            await showBusSaveError("You can only attach up to 10 files per bus record.");
            return;
        }

        const result = await showBusSaveConfirmation();
        if (result.isConfirmed) {
            setIsSaving(true);
            try {
                // Upload files only after confirmation
                let orMeta = orFileMeta;
                let crMeta = crFileMeta;
                let otherMeta = [...otherFilesMeta];

                // OR file
                if (pendingOrFile) {
                    const { url, name } = await uploadFile(pendingOrFile, busForm.body_number);
                    orMeta = { file_name: name, file_url: url };
                    setOrFileMeta(orMeta);
                }
                // CR file
                if (pendingCrFile) {
                    const { url, name } = await uploadFile(pendingCrFile, busForm.body_number);
                    crMeta = { file_name: name, file_url: url };
                    setCrFileMeta(crMeta);
                }
                // Other files
                if (pendingOtherFiles.length > 0) {
                    for (const file of pendingOtherFiles) {
                        const { url, name } = await uploadFile(file, busForm.body_number);
                        otherMeta.push({ file_name: name, file_url: url, file_type: 'OTHER' });
                    }
                    setOtherFilesMeta(otherMeta);
                }

                // In handleSubmit, build busOtherFiles array for backend
                const busOtherFiles = [];
                if (orMeta) {
                    busOtherFiles.push({
                        file_name: `${busForm.body_number}OR${orMeta.file_name}`,
                        file_type: 'OR',
                        file_url: orMeta.file_url,
                    });
                }
                if (crMeta) {
                    busOtherFiles.push({
                        file_name: `${busForm.body_number}CR${crMeta.file_name}`,
                        file_type: 'CR',
                        file_url: crMeta.file_url,
                    });
                }
                if (otherMeta.length > 0) {
                    otherMeta.forEach(meta => {
                        busOtherFiles.push({
                            file_name: meta.file_name,
                            file_type: 'OTHER',
                            file_url: meta.file_url,
                        });
                    });
                }

                const response = await fetch('/api/bus', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bus: busForm, busOtherFiles }),
                });

                let result;
                try {
                    result = await response.json();
                } catch (jsonError) {
                    console.error('Error parsing JSON response:', jsonError);
                    throw new Error('Failed to parse server response');
                }

                if (!response.ok) {
                    // Extract more detailed error information if available
                    const errorMessage = result && result.error
                        ? result.error
                        : `Failed to save bus (Status: ${response.status})`;

                    if (errorMessage.includes("Plate number already exists")) {
                        await showBusSaveError("Plate number already exists. Cannot add duplicate bus.");
                        return;
                    }

                    if (errorMessage.includes("Body number already exists")) {
                        await showBusSaveError("Body number already exists. Cannot add duplicate bus.");
                        return;
                    }

                    if (result && result.details) {
                        console.error('Error details:', result.details);
                    }

                    throw new Error(errorMessage);
                }

                if (result.success) {
                    // Show success message using SweetAlert
                    await showBusSavedSuccess();

                    // Call the onSave callback to close the modal or update the parent
                    onSave(busForm);
                    window.location.reload();
                } else {
                    setError(result.error || 'Failed to save bus');
                }
            } catch (error: any) {
                console.error('Error saving bus:', error);
                setError(error.message);

                // Show error using SweetAlert
                await showBusSaveError(error.message);
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

            <p className="bus-details-title">I. Basic Identification</p>
            <div className="modal-content add">
                {/* Basic Identification */}
                <form className="add-bus-form">
                    {/* Form row - plate number and body number */}
                    <div className="form-row">
                        {/* Plate Number */}
                        <div className="form-group">
                            <label>Plate Number</label>
                            <input
                                className={formErrors?.plate_number ? "invalid-input" : ""}
                                type="text"
                                value={busForm.plate_number}
                                onChange={(e) => handleChange("plate_number", e.target.value)}
                                placeholder="Enter plate number here..."
                            />
                            <p className="add-error-message">{formErrors?.plate_number}</p>
                        </div>

                        {/* Body Number */}
                        <div className="form-group">
                            <label>Body Number</label>
                            <input
                                className={formErrors?.body_number ? "invalid-input" : ""}
                                type="text"
                                value={busForm.body_number}
                                onChange={(e) => handleChange("body_number", e.target.value)}
                                placeholder="Enter body number here..."
                            />
                            <p className="add-error-message">{formErrors?.body_number}</p>
                        </div>
                    </div>

                    {/* Form row - body builder and bus type */}
                    <div className="form-row">
                        {/* Body Builder */}
                        <div className="form-group">
                            <label>Body Builder</label>
                            <select
                                className={formErrors?.bodyBuilder ? "invalid-input" : ""}
                                value={busForm.bodyBuilder}
                                onChange={(e) => handleChange("bodyBuilder", e.target.value)}
                            >
                                <option value="" disabled>--Select Body Builder--</option>
                                <option value="agila">Agila</option>
                                <option value="hilltop">Hilltop</option>
                                <option value="rbm">RBM</option>
                                <option value="darj">DARJ</option>
                            </select>
                            <p className="add-error-message">{formErrors?.bodyBuilder}</p>
                        </div>

                        {/* Bus Type */}
                        <div className="form-group">
                            <label>Bus Type</label>
                            <select
                                className={formErrors?.bus_type ? "invalid-input" : ""}
                                value={busForm.bus_type}
                                onChange={(e) => handleChange("bus_type", e.target.value)}
                            >
                                <option value="" disabled>--Select Bus Type--</option>
                                <option value="airconditioned">Airconditioned</option>
                                <option value="ordinary">Ordinary</option>
                            </select>
                            <p className="add-error-message">{formErrors?.bus_type}</p>
                        </div>
                    </div>

                    {/* Form row - manufacturer, model, year model */}
                    <div className="form-row">
                        {/* Manufacturer */}
                        <div className="form-group">
                            <label>Manufacturer</label>
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
                            <label>Model</label>
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
                            <label>Year Model</label>
                            <select
                                className={formErrors?.year_model ? "invalid-input" : ""}
                                value={busForm.year_model}
                                onChange={(e) => handleChange("year_model", e.target.value)}
                            >
                                <option value="" disabled>--Select Year Model--</option>
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <p className="add-error-message">{formErrors?.year_model}</p>
                        </div>
                    </div>

                    {/* Form row - chasis number and engine number */}
                    <div className="form-row">
                        {/* Chasis Number */}
                        <div className="form-group">
                            <label>Chasis Number</label>
                            <input
                                className={formErrors?.chasis_number ? "invalid-input" : ""}
                                type="text"
                                value={busForm.chasis_number}
                                onChange={(e) => handleChange("chasis_number", e.target.value)}
                                placeholder="Enter chasis number here..."
                            />
                            <p className="add-error-message">{formErrors?.chasis_number}</p>
                        </div>

                        {/* Engine Number */}
                        <div className="form-group">
                            <label>Engine Number</label>
                            <input
                                className={formErrors?.engine_number ? "invalid-input" : ""}
                                type="text"
                                value={busForm.engine_number}
                                onChange={(e) => handleChange("engine_number", e.target.value)}
                                placeholder="Enter engine number here..."
                            />
                            <p className="add-error-message">{formErrors?.engine_number}</p>
                        </div>
                    </div>

                    {/* Form row - condition, seat capacity, status */}
                    <div className="form-row">
                        {/* Condition */}
                        <div className="form-group">
                            <label>Condition</label>
                            <select
                                className={formErrors?.condition ? "invalid-input" : ""}
                                value={busForm.condition}
                                onChange={(e) => handleChange("condition", e.target.value)}
                            >
                                <option value="" disabled>--Select Bus Condition--</option>
                                <option value="brand-new">Brand New</option>
                                <option value="second-hand">Second Hand</option>
                            </select>
                            <p className="add-error-message">{formErrors?.condition}</p>
                        </div>

                        {/* Seat Capacity */}
                        <div className="form-group">
                            <label>Seat Capacity</label>
                            <input
                                className={formErrors?.seat_capacity ? "invalid-input" : ""}
                                type="number"
                                step="1"
                                min="0"
                                value={busForm.seat_capacity}
                                onChange={(e) => {
                                    // Only allow integers, ignore decimals
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        handleChange("seat_capacity", value === "" ? 0 : Number(value));
                                    }
                                }}
                                inputMode="numeric"
                                pattern="\d*"
                            />
                            <p className="add-error-message">{formErrors?.seat_capacity}</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select value={busForm.status}
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
                    <p className="bus-details-title">II. Second Hand Details</p>
                    <div className="modal-content add">
                        {/* Second Hand Details */}
                        <form className="add-bus-form">
                            {/* Form row - acquisition date and acquisition method */}
                            <div className="form-row">
                                {/* Acquisition Date */}
                                <div className="form-group">
                                    <label>Acquisition Date</label>
                                    <input
                                        className={formErrors?.acquisition_date ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.acquisition_date}
                                        onChange={(e) => handleChange("acquisition_date", e.target.value)}
                                        placeholder="Select acquisition date..."
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.acquisition_date}</p>
                                </div>

                                {/* Acquisition Method */}
                                <div className="form-group">
                                    <label>Acquisition Method</label>
                                    <select
                                        className={formErrors?.acquisition_method ? "invalid-input" : ""}
                                        value={busForm.acquisition_method}
                                        onChange={(e) => handleChange("acquisition_method", e.target.value)}
                                    >
                                        <option value="" disabled>--Select Acquisition Method--</option>
                                        <option value="purchased">Purchased</option>
                                        <option value="donated">Donated</option>
                                        <option value="leased">Leased</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.acquisition_method}</p>
                                </div>
                            </div>

                            {/* Form row - previous owner name and age */}
                            <div className="form-row">
                                {/* Previous Owner */}
                                <div className="form-group">
                                    <label>Dealer Name</label>
                                    <input
                                        className={formErrors?.previous_owner ? "invalid-input" : ""}
                                        type="text"
                                        value={busForm.previous_owner}
                                        onChange={(e) => handleChange("previous_owner", e.target.value)}
                                        placeholder="Enter previous owner name here..."
                                    />
                                    <p className="add-error-message">{formErrors?.previous_owner}</p>
                                </div>

                                {/* Previous Owner Contact */}
                                <div className="form-group">
                                    <label>Dealer Contact</label>
                                    <input
                                        className={formErrors?.previous_owner_contact ? "invalid-input" : ""}
                                        type="text"
                                        value={busForm.previous_owner_contact}
                                        onChange={(e) => {
                                            // Only allow numbers, hyphens, and spaces
                                            const value = e.target.value.replace(/[^0-9]/g, "");
                                            handleChange("previous_owner_contact", value);
                                        }}
                                        placeholder="Enter previous owner contact here..."
                                        inputMode="tel"
                                        pattern="[0-9]*"
                                        maxLength={11}
                                    />
                                    <p className="add-error-message">{formErrors?.previous_owner_contact}</p>
                                </div>
                            </div>

                            {/* Form row - source and odometer reader */}
                            <div className="form-row">
                                {/* Source */}
                                <div className="form-group">
                                    <label>Source</label>
                                    <select
                                        className={formErrors?.source ? "invalid-input" : ""}
                                        value={busForm.source}
                                        onChange={(e) => handleChange("source", e.target.value)}
                                    >
                                        <option value="" disabled>--Select source--</option>
                                        <option value="dealership">Dealership</option>
                                        <option value="auction">Auction</option>
                                        <option value="private-individual">Private Individual</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.source}</p>
                                </div>

                                {/* Odometer Reading */}
                                <div className="form-group">
                                    <label>Odometer Reading</label>
                                    <input
                                        className={formErrors?.odometer_reading ? "invalid-input" : ""}
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={busForm.odometer_reading}
                                        onChange={(e) => {
                                            // Only allow integers, ignore decimals
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value)) {
                                                handleChange("odometer_reading", value === "" ? 0 : Number(value));
                                            }
                                        }}

                                        inputMode="numeric"
                                        pattern="\d*"
                                        placeholder="Enter odometer reading..."
                                    />
                                    <p className="add-error-message">{formErrors?.odometer_reading}</p>
                                </div>
                            </div>

                            {/* Form row - warranty expiration date and registration status*/}
                            <div className="form-row">
                                {/* Warranty Expiration Date */}
                                <div className="form-group">
                                    <label>Warranty Expiration Date</label>
                                    <input
                                        type="date"
                                        value={busForm.warranty_expiration_date}
                                        onChange={(e) => handleChange("warranty_expiration_date", e.target.value)}
                                        placeholder="Select warranty expiration date..."
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                </div>

                                {/* Registration Status */}
                                <div className="form-group">
                                    <label>Registration Status</label>
                                    <select
                                        className={formErrors?.registration_status ? "invalid-input" : ""}
                                        value={busForm.registration_status}
                                        onChange={(e) => handleChange("registration_status", e.target.value)}
                                    >
                                        <option value="" disabled>--Select Registration Status--</option>
                                        <option value="registered">Registered</option>
                                        <option value="needs renewal">Needs Renewal</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.registration_status}</p>
                                </div>
                            </div>

                            {/* Form row - last registration date and last maintenance date */}
                            <div className="form-row">
                                {/* Last Registration Date */}
                                <div className="form-group">
                                    <label>Last Registration Date</label>
                                    <input
                                        className={formErrors?.last_registration_date ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.last_registration_date}
                                        onChange={(e) => handleChange("last_registration_date", e.target.value)}
                                        placeholder="Select last registration date..."
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.last_registration_date}</p>
                                </div>

                                {/* Last Maintenance Date */}
                                <div className="form-group">
                                    <label>Last Maintenance Date</label>
                                    <input
                                        className={formErrors?.last_maintenance_date ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.last_maintenance_date}
                                        onChange={(e) => handleChange("last_maintenance_date", e.target.value)}
                                        placeholder="Select last maintenance date..."
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.last_maintenance_date}</p>
                                </div>
                            </div>

                            {/* Form row - initial bus condition/notes */}
                            <div className="form-row">
                                {/* Initial Bus Condition/Notes */}
                                <div className="form-group">
                                    <label>Initial Bus Condition/Notes</label>
                                    <textarea
                                        className={formErrors?.bus_condition_notes ? "invalid-input" : ""}
                                        value={busForm.bus_condition_notes}
                                        onChange={(e) => handleChange("bus_condition_notes", e.target.value)}
                                        placeholder="Enter initial bus condition or notes here..."
                                        rows={3}
                                    />
                                    <p className="add-error-message">{formErrors?.bus_condition_notes}</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {busForm.condition === "brand-new" && (
                <>
                    <p className="bus-details-title">II. Brand New Details</p>
                    <div className="modal-content add">
                        {/* Brand New Details */}
                        <form className="add-bus-form">
                            {/* Form row - acquisition date and acquisition method */}
                            <div className="form-row">
                                {/* Acquisition Date */}
                                <div className="form-group">
                                    <label>Acquisition Date</label>
                                    <input
                                        className={formErrors?.acquisition_date ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.acquisition_date}
                                        onChange={(e) => handleChange("acquisition_date", e.target.value)}
                                        placeholder="Select acquisition date..."
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.acquisition_date}</p>
                                </div>

                                {/* Acquisition Method */}
                                <div className="form-group">
                                    <label>Acquisition Method</label>
                                    <select
                                        className={formErrors?.acquisition_method ? "invalid-input" : ""}
                                        value={busForm.acquisition_method}
                                        onChange={(e) => handleChange("acquisition_method", e.target.value)}
                                    >
                                        <option value="" disabled>--Select Acquisition Method--</option>
                                        <option value="purchased">Purchased</option>
                                        <option value="donated">Donated</option>
                                        <option value="leased">Leased</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.acquisition_method}</p>
                                </div>
                            </div>

                            {/* Form row - dealer name and dealer contact */}
                            <div className="form-row">
                                {/* Dealer Name */}
                                <div className="form-group">
                                    <label>Dealer Name</label>
                                    <input
                                        className={formErrors?.dealer_name ? "invalid-input" : ""}
                                        type="text"
                                        value={busForm.dealer_name}
                                        onChange={(e) => handleChange("dealer_name", e.target.value)}
                                        placeholder="Enter dealer name here..."
                                    />
                                    <p className="add-error-message">{formErrors?.dealer_name}</p>
                                </div>

                                {/* Dealer Contact */}
                                <div className="form-group">
                                    <label>Dealer Contact</label>
                                    <input
                                        className={formErrors?.dealer_contact ? "invalid-input" : ""}
                                        type="text"
                                        value={busForm.dealer_contact}
                                        onChange={(e) => {
                                            // Only allow numbers, hyphens, and spaces
                                            const value = e.target.value.replace(/[^0-9\- ]/g, "");
                                            handleChange("dealer_contact", value);
                                        }}
                                        placeholder="Enter dealer owner contact here..."
                                        inputMode="tel"
                                        pattern="[0-9]*"
                                        maxLength={11}
                                    />
                                    <p className="add-error-message">{formErrors?.dealer_contact}</p>
                                </div>
                            </div>

                            {/* Form row - warranty expiration date */}
                            <div className="form-row">
                                {/* Warranty Expiration Date */}
                                <div className="form-group">
                                    <label>Warranty Expiration Date</label>
                                    <input
                                        className={formErrors?.warranty_expiration_date ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.warranty_expiration_date}
                                        onChange={(e) => handleChange("warranty_expiration_date", e.target.value)}
                                        placeholder="Select warranty expiration date..."
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.warranty_expiration_date}</p>
                                </div>

                                {/* Registration Status */}
                                <div className="form-group">
                                    <label>Registration Status</label>
                                    <select
                                        className={formErrors?.registration_status ? "invalid-input" : ""}
                                        value={busForm.registration_status}
                                        onChange={(e) => handleChange("registration_status", e.target.value)}
                                    >
                                        <option value="" disabled>--Select Registration Status--</option>
                                        <option value="registered">Registered</option>
                                        <option value="not-registered">Not Registered</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.registration_status}</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Only show Document Attachments if a condition is selected */}
            {(busForm.condition === "brand-new" || busForm.condition === "second-hand") && (
                <>
                    <p className="bus-details-title">III. Document Attachments</p>
                    <div className="modal-content add">
                        {/* Attached Documents */}
                        <form className="add-bus-form">
                            {/* Form row - OR/CR */}
                            <div className="form-row">
                                {/* OR */}
                                <div className="form-group">
                                    <label>Official Receipt (OR) Attachment</label>
                                    <input
                                        className={formErrors?.or_file ? "invalid-input" : ""}
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
                                                handleChange("or_file", file.name); // for display
                                            } else {
                                                setPendingOrFile(null);
                                                handleChange("or_file", "");
                                            }
                                        }}
                                    />
                                    <p className="add-error-message">{formErrors?.or_file}</p>
                                </div>
                            </div>
                            {busForm.registration_status === "registered" && (
                                <div className="form-row">
                                    {/* OR */}
                                    <div className="form-group">
                                        <label>Certificate of Registration (CR) Attachment</label>
                                        <input
                                            className={formErrors?.cr_file ? "invalid-input" : ""}
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
                                                    handleChange("cr_file", file.name);
                                                } else {
                                                    setPendingCrFile(null);
                                                    handleChange("cr_file", "");
                                                }
                                            }}
                                        />
                                        <p className="add-error-message">{formErrors?.cr_file}</p>
                                    </div>
                                </div>
                            )}

                            {/* Form row - Other Documents */}
                            <div className="form-row">
                                {/* Other Documents */}
                                <div className="form-group">
                                    <label>Other Attachments</label>
                                    <input
                                        className={formErrors?.otherDocuments ? "invalid-input" : ""}
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
                                            // For display only
                                            files.forEach(file => {
                                                handleChange("otherDocuments", file.name);
                                            });
                                        }}
                                    />

                                    {/* Display uploaded documents list */}
                                    {pendingOtherFiles.length > 0 && (
                                        <ul className="uploaded-documents-list">
                                            {pendingOtherFiles.map((file, idx) => (
                                                <li key={idx} className="uploaded-document-item">
                                                    <span>{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            const result = await showRemoveFileConfirmation(file.name);
                                                            if (result.isConfirmed) {
                                                                setPendingOtherFiles(prev => prev.filter((_, i) => i !== idx));
                                                            }
                                                        }}
                                                        className="remove-document-button"
                                                        aria-label={`Remove ${file.name}`}
                                                    >
                                                        <i className="ri-close-line"></i>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <p className="add-error-message">{formErrors?.otherDocuments}</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </>
            )}

            <div className="modal-actions add">
                <button type="submit" className="submit-btn" onClick={handleSubmit}>
                    <i className="ri-save-3-line" /> {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>

        </>
    );
}