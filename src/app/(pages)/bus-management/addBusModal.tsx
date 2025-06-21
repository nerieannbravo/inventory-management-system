import React, { useState, useEffect } from "react";
import { uploadFile } from "@/app/lib/uploadFile";

import {
    showBusSaveConfirmation, showBusSavedSuccess,
    showCloseWithoutSavingConfirmation, showBusSaveError
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
    const [otherFilesMeta, setOtherFilesMeta] = useState<{ file_name: string, file_url: string }[]>([]);


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

        // Second hand details validation
        if (busForm.condition === "second-hand") {
            if (busForm.previous_owner_contact && !/^\d{11}$/.test(busForm.previous_owner_contact?.toString() || "")) {
                errors.previous_owner_contact = "Previous owner contact must be exactly 11 digits";
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
        if (busForm.otherDocuments.length === 0) {
            errors.otherDocuments = "At least one other document is required";
        } else {
            busForm.otherDocuments.forEach((doc, index) => {
                if (!doc) {
                    errors[`otherDocument${index}`] = `Document ${index + 1} is required`;
                }
            });
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showBusSaveConfirmation();
        if (result.isConfirmed) {
            setIsSaving(true);
            try {
                // In handleSubmit, build busOtherFiles array for backend
                const busOtherFiles = [];
                if (orFileMeta) {
                  busOtherFiles.push({
                    file_name: orFileMeta.file_name,
                    file_type: 'OR',
                    file_url: orFileMeta.file_url,
                  });
                }
                if (crFileMeta) {
                  busOtherFiles.push({
                    file_name: crFileMeta.file_name,
                    file_type: 'CR',
                    file_url: crFileMeta.file_url,
                  });
                }
                if (otherFilesMeta.length > 0) {
                  otherFilesMeta.forEach(meta => {
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
    					? `Error: ${result.error}` 
    					: `Failed to save bus (Status: ${response.status})`;

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

    // Simplified file upload handler
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'OR' | 'CR' | 'OTHER') => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsSaving(true);
        try {
            if (fileType === 'OTHER') {
                const newFilesMeta = await Promise.all(
                    files.map(async (file) => {
                        const { url, name } = await uploadFile(file, busForm.body_number);
                        return { file_name: name, file_url: url };
                    })
                );
                setOtherFilesMeta(prev => [...prev, ...newFilesMeta]);
                handleChange("otherDocuments", [...busForm.otherDocuments, ...newFilesMeta.map(f => f.file_name)]);
            } else {
                const file = files[0];
                const { url, name } = await uploadFile(file, busForm.body_number);
                const fileMeta = { file_name: name, file_url: url };
                if (fileType === 'OR') {
                    setOrFileMeta(fileMeta);
                    handleChange("or_file", name);
                } else if (fileType === 'CR') {
                    setCrFileMeta(fileMeta);
                    handleChange("cr_file", name);
                }
            }
        } catch (error) {
            await showBusSaveError("File upload failed. Please try again.");
            console.error("File upload error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveOtherFile = (index: number) => {
        const newFilesMeta = [...otherFilesMeta];
        newFilesMeta.splice(index, 1);
        setOtherFilesMeta(newFilesMeta);

        const newOtherDocuments = [...busForm.otherDocuments];
        newOtherDocuments.splice(index, 1);
        handleChange("otherDocuments", newOtherDocuments);
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
                            <select disabled value={busForm.status}>
                                <option value="active">Active</option>
                                <option value="decommissioned">Decommissioned</option>
                                <option value="under-maintenance">Under Maintenance</option>
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
                                    <label>Previous Owner</label>
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
                                    <label>Previous Owner Contact</label>
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
                        <form className="add-bus-form">
                            {/* Form row - Official Receipt Attachment */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Official Receipt (OR) Attachment</label>
                                    <input
                                        type="file"
                                        className={formErrors.or_file ? "invalid-input" : ""}
                                        onChange={(e) => handleFileUpload(e, 'OR')}
                                    />
                                    {orFileMeta && <p className="file-name-display">{orFileMeta.file_name}</p>}
                                    <p className="add-error-message">{formErrors.or_file}</p>
                                </div>
                            </div>
                            {/* Form row - Certification of Registration Attachment */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Certificate of Registration (CR) Attachment</label>
                                    <input
                                        type="file"
                                        className={formErrors.cr_file ? "invalid-input" : ""}
                                        onChange={(e) => handleFileUpload(e, 'CR')}
                                        disabled={busForm.registration_status !== 'registered'}
                                    />
                                    {crFileMeta && <p className="file-name-display">{crFileMeta.file_name}</p>}
                                    <p className="add-error-message">{formErrors.cr_file}</p>
                                </div>
                            </div>
                            {/* Form row - Other Attachments */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Other Attachments</label>
                                    <input
                                        type="file"
                                        multiple
                                        className={formErrors.otherDocuments ? "invalid-input" : ""}
                                        onChange={(e) => handleFileUpload(e, 'OTHER')}
                                    />
                                    <p className="add-error-message">{formErrors.otherDocuments}</p>
                                </div>
                            </div>

                            {/* Display uploaded other files */}
                            {otherFilesMeta.length > 0 && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Uploaded Other Documents:</label>
                                        <ul className="uploaded-files-list">
                                            {otherFilesMeta.map((file, index) => (
                                                <li key={index}>
                                                    <span>{file.file_name}</span>
                                                    <button type="button" onClick={() => handleRemoveOtherFile(index)}>
                                                        <i className="ri-close-line"></i>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </>
            )}

            <div className="modal-actions">
                <button type="button" className="close-btn" onClick={handleClose}>
                    Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSaving} onClick={handleSubmit}>
                    {isSaving ? "Saving..." : "Add Bus"}
                </button>
            </div>
        </>
    );
}