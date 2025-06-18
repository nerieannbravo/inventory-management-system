import React, { useState, useEffect } from "react";

import {
    showBusSaveConfirmation, showBusSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface BusForm {
    plateNumber: string,
    bodyNumber: string,
    bodyBuilder: string,
    busType: string,
    busStatus: string,
    manufacturer: string,
    seatCapacity: number,
    chasisNumber: string,
    engineNumber: string,

    //New basic fields
    model: string,
    yearModel: string,
    condition: string,

    //Second hand details
    secHandAcquiDate?: string,
    secHandAcquiMethod?: string,
    prevOwner?: string,
    prevOwnerContact?: string,
    source?: string,
    secHandWarrantyExpiryDate: string,
    odometerReading?: number,
    registrationStatus?: string,
    lastRegistrationDate?: string,
    lastMaintenanceDate?: string,
    initialBusCondition?: string,

    //Brand new details
    newAcquiDate?: string,
    newAcquiMethod?: string,
    dealerName?: string,
    dealerContact?: number,
    newWarrantyExpiryDate?: string,
    initialRegistrationStatus?: string,

    // Document Attachments
    orcr: string,
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
        plateNumber: "",
        bodyNumber: "",
        bodyBuilder: "",
        busType: "",
        busStatus: "active",
        manufacturer: "",
        seatCapacity: 0,
        chasisNumber: "",
        engineNumber: "",

        // New basic fields
        model: "",
        yearModel: "",
        condition: "",

        // Second hand details
        secHandAcquiDate: "",
        secHandAcquiMethod: "",
        prevOwner: "",
        prevOwnerContact: "",
        source: "",
        secHandWarrantyExpiryDate: "",
        odometerReading: 0,
        registrationStatus: "",
        lastRegistrationDate: "",
        lastMaintenanceDate: "",
        initialBusCondition: "",

        // Brand new details
        newAcquiDate: "",
        newAcquiMethod: "",
        dealerName: "",
        dealerContact: 0,
        newWarrantyExpiryDate: "",
        initialRegistrationStatus: "",

        // Document Attachments
        orcr: "",
        otherDocuments: [],

    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

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

    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!busForm.plateNumber) errors.plateNumber = "Plate number is required";
        if (!busForm.bodyNumber) errors.bodyNumber = "Body number is required";
        if (!busForm.bodyBuilder) errors.bodyBuilder = "Body builder is required";
        if (!busForm.busType) errors.busType = "Bus type is required";
        if (!busForm.manufacturer) errors.manufacturer = "Manufacturer is required";
        if (busForm.seatCapacity <= 0) errors.seatCapacity = "Seat capacity must be more than 0";
        if (!busForm.chasisNumber) errors.chasisNumber = "Chasis number is required";
        if (!busForm.engineNumber) errors.engineNumber = "Engine number is required";

        // New basic fields validation 
        if (!busForm.model) errors.model = "Model is required";
        if (!busForm.yearModel) {
            errors.yearModel = "Year model is required";
        } else if (!/^\d{4}$/.test(busForm.yearModel)) {
            errors.yearModel = "Year model must be a 4-digit year";
        }
        if (!busForm.condition) errors.condition = "Condition is required";

        // Second hand details validation
        if (!busForm.secHandAcquiDate) {
            errors.secHandAcquiDate = "Second hand acquisition date is required";
        } else {
            const today = new Date();
            const selectedDate = new Date(busForm.secHandAcquiDate);
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                errors.secHandAcquiDate = "Acquisition date cannot be set to a future date";
            }
        }
        if (busForm.prevOwnerContact && !/^[0-9\s\-]+$/.test(busForm.prevOwnerContact?.toString() || "")) {
            errors.prevOwnerContact = "Previous owner contact must only contain numbers, spaces, and hyphens";
        }
        if (!busForm.secHandAcquiMethod) errors.secHandAcquiMethod = "Acquisition method is required";
        if (!busForm.source) errors.source = "Source is required";
       
        if (busForm.odometerReading !== undefined && busForm.odometerReading <= 0) errors.odometerReading = "Odometer reading must be more than 0";

        if (!busForm.registrationStatus) errors.registrationStatus = "Registration status is required";
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

        // Brandnew details validation
        if (!busForm.newAcquiDate) {
            errors.newAcquiDate = "New acquisition date is required";
        } else {
            const today = new Date();
            const selectedDate = new Date(busForm.newAcquiDate);
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                errors.newAcquiDate = "Acquisition date cannot be set to a future date";
            }
        }
        if (!busForm.newAcquiMethod) errors.newAcquiMethod = "Acquisition method is required";
        if (!busForm.dealerName) errors.dealerName = "Dealer name is required";
        if (!busForm.dealerContact) {
            errors.dealerContact = "Dealer contact is required";
        } else if (!/^[A-Za-z\s\-]+$/.test(busForm.dealerContact.toString())) {
            errors.dealerContact = "Dealer contact must only contain letters, spaces, and hyphens";
        }
        
        if (!busForm.newWarrantyExpiryDate) {
            errors.newWarrantyExpiryDate = "New warranty expiry date is required";
        } else {
            const today = new Date();
            const selectedDate = new Date(busForm.newWarrantyExpiryDate);
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                errors.newWarrantyExpiryDate = "Warranty expiry date cannot be set to a past date";
            }
        }
        if (!busForm.initialRegistrationStatus) errors.initialRegistrationStatus = "Initial registration status is required";

        // Document Attachments validation
        if (!busForm.orcr) errors.orcr = "OR/CR is required";
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
            onSave(busForm);
            await showBusSavedSuccess();
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
                            <label>Body Number</label>
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
                                className={formErrors?.busType ? "invalid-input" : ""}
                                value={busForm.busType}
                                onChange={(e) => handleChange("busType", e.target.value)}
                            >
                                <option value="" disabled>--Select Bus Type--</option>
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
                            <label> Year Model</label>
                            <input
                                className={formErrors?.yearModel ? "invalid-input" : ""}
                                type="text"
                                value={busForm.yearModel}
                                onChange={(e) => {
                                    // Only allow up to 4 digits
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                                    handleChange("yearModel", value);
                                }}
                                placeholder="Enter year model here..."
                                maxLength={4}
                                inputMode="numeric"
                            />
                            <p className="add-error-message">{formErrors?.yearModel}</p>
                        </div>
                    </div>

                    {/* Form row - chasis number and engine number */}
                    <div className="form-row">
                        {/* Chasis Number */}
                        <div className="form-group">
                            <label>Chasis Number</label>
                            <input
                                className={formErrors?.chasisNumber ? "invalid-input" : ""}
                                type="text"
                                value={busForm.chasisNumber}
                                onChange={(e) => handleChange("chasisNumber", e.target.value)}
                                placeholder="Enter chasis number here..."
                            />
                            <p className="add-error-message">{formErrors?.chasisNumber}</p>
                        </div>

                        {/* Engine Number */}
                        <div className="form-group">
                            <label>Engine Number</label>
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
                                className={formErrors?.seatCapacity ? "invalid-input" : ""}
                                type="number"
                                step="1"
                                min="0"
                                value={busForm.seatCapacity}
                                onChange={(e) => {
                                    // Only allow integers, ignore decimals
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        handleChange("seatCapacity", value === "" ? 0 : Number(value));
                                    }
                                }}
                                inputMode="numeric"
                                pattern="\d*"
                            />
                            <p className="add-error-message">{formErrors?.seatCapacity}</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select disabled value={busForm.busStatus}>
                                <option value="active">Active</option>
                                <option value="decommissioned">Decommissioned</option>
                                <option value="under-maintenance">Under Maintenance</option>
                            </select>
                            <p className="add-error-message">{formErrors?.busStatus}</p>
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
                                        className={formErrors?.secHandAcquiDate ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.secHandAcquiDate}
                                        onChange={(e) => handleChange("secHandAcquiDate", e.target.value)}
                                        placeholder="Select acquisition date..."
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.secHandAcquiDate}</p>
                                </div>

                                {/* Acquisition Method */}
                                <div className="form-group">
                                    <label>Acquisition Method</label>
                                    <select
                                        className={formErrors?.secHandAcquiMethod ? "invalid-input" : ""}
                                        value={busForm.secHandAcquiMethod}
                                        onChange={(e) => handleChange("secHandAcquiMethod", e.target.value)}
                                    >
                                        <option value="" disabled>--Select Acquisition Method--</option>
                                        <option value="purchased">Purchased</option>
                                        <option value="donated">Donated</option>
                                        <option value="leased">Leased</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.secHandAcquiMethod}</p>
                                </div>
                            </div>

                            {/* Form row - previous owner name and age */}
                            <div className="form-row">
                                {/* Previous Owner */}
                                <div className="form-group">
                                    <label>Previous Owner</label>
                                    <input
                                        className={formErrors?.prevOwner ? "invalid-input" : ""}
                                        type="text"
                                        value={busForm.prevOwner}
                                        onChange={(e) => handleChange("prevOwner", e.target.value)}
                                        placeholder="Enter previous owner name here..."
                                    />
                                    <p className="add-error-message">{formErrors?.prevOwner}</p>
                                </div>

                                {/* Previous Owner Contact */}
                                <div className="form-group">
                                    <label>Previous Owner Contact</label>
                                    <input
                                        className={formErrors?.prevOwnerContact ? "invalid-input" : ""}
                                        type="text"
                                        value={busForm.prevOwnerContact}
                                        onChange={(e) => {
                                            // Only allow numbers, hyphens, and spaces
                                            const value = e.target.value.replace(/[^0-9\- ]/g, "");
                                            handleChange("prevOwnerContact", value);
                                        }}
                                        placeholder="Enter previous owner contact here..."
                                        inputMode="tel"
                                        pattern="[0-9\- ]*"
                                    />
                                    <p className="add-error-message">{formErrors?.prevOwnerContact}</p>
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
                                        <option value="action">Action</option>
                                        <option value="private individual">Private Individual</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.source}</p>
                                </div>

                                {/* Odometer Reading */}
                                <div className="form-group">
                                    <label>Odometer Reading</label>
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

                            {/* Form row - warranty expiration date and registration status*/}
                            <div className="form-row">
                                {/* Warranty Expiration Date */}
                                <div className="form-group">
                                    <label>Warranty Expiration Date</label>
                                    <input
                                        className={formErrors?.secHandWarrantyExpiryDate ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.secHandWarrantyExpiryDate}
                                        onChange={(e) => handleChange("secHandWarrantyExpiryDate", e.target.value)}
                                        placeholder="Select warranty expiration date..."
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.secHandWarrantyExpiryDate}</p>
                                </div>

                                {/* Registration Status */}
                                <div className="form-group">
                                    <label>Registration Status</label>
                                    <select
                                        className={formErrors?.registrationStatus ? "invalid-input" : ""}
                                        value={busForm.registrationStatus}
                                        onChange={(e) => handleChange("registrationStatus", e.target.value)}
                                    >
                                        <option value="" disabled>--Select Registration Status--</option>
                                        <option value="registered">Registered</option>
                                        <option value="needs renewal">Needs Renewal</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.registrationStatus}</p>
                                </div>
                            </div>

                            {/* Form row - last registration date and last maintenance date */}
                            <div className="form-row">
                                {/* Last Registration Date */}
                                <div className="form-group">
                                    <label>Last Registration Date</label>
                                    <input
                                        className={formErrors?.lastRegistrationDate ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.lastRegistrationDate}
                                        onChange={(e) => handleChange("lastRegistrationDate", e.target.value)}
                                        placeholder="Select last registration date..."
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.lastRegistrationDate}</p>
                                </div>

                                {/* Last Maintenance Date */}
                                <div className="form-group">
                                    <label>Last Maintenance Date</label>
                                    <input
                                        className={formErrors?.lastMaintenanceDate ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.lastMaintenanceDate}
                                        onChange={(e) => handleChange("lastMaintenanceDate", e.target.value)}
                                        placeholder="Select last maintenance date..."
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
                                        className={formErrors?.initialBusCondition ? "invalid-input" : ""}
                                        value={busForm.initialBusCondition}
                                        onChange={(e) => handleChange("initialBusCondition", e.target.value)}
                                        placeholder="Enter initial bus condition or notes here..."
                                        rows={3}
                                    />
                                    <p className="add-error-message">{formErrors?.initialBusCondition}</p>
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
                                        className={formErrors?.newAcquiDate ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.newAcquiDate}
                                        onChange={(e) => handleChange("newAcquiDate", e.target.value)}
                                        placeholder="Select acquisition date..."
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.newAcquiDate}</p>
                                </div>

                                {/* Acquisition Method */}
                                <div className="form-group">
                                    <label>Acquisition Method</label>
                                    <select
                                        className={formErrors?.newAcquiMethod ? "invalid-input" : ""}
                                        value={busForm.newAcquiMethod}
                                        onChange={(e) => handleChange("newAcquiMethod", e.target.value)}
                                    >
                                        <option value="" disabled>--Select Acquisition Method--</option>
                                        <option value="purchased">Purchased</option>
                                        <option value="donated">Donated</option>
                                        <option value="leased">Leased</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.newAcquiMethod}</p>
                                </div>
                            </div>

                            {/* Form row - dealer name and dealer contact */}
                            <div className="form-row">
                                {/* Dealer Name */}
                                <div className="form-group">
                                    <label>Dealer Name</label>
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
                                    <label>Dealer Contact</label>
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
                                        pattern="[0-9\- ]*"
                                    />
                                    <p className="add-error-message">{formErrors?.dealerContact}</p>
                                </div>
                            </div>

                            {/* Form row - warranty expiration date */}
                            <div className="form-row">
                                {/* Warranty Expiration Date */}
                                <div className="form-group">
                                    <label>Warranty Expiration Date</label>
                                    <input
                                        className={formErrors?.newWarrantyExpiryDate ? "invalid-input" : ""}
                                        type="date"
                                        value={busForm.newWarrantyExpiryDate}
                                        onChange={(e) => handleChange("newWarrantyExpiryDate", e.target.value)}
                                        placeholder="Select warranty expiration date..."
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.newWarrantyExpiryDate}</p>
                                </div>

                                {/* Registration Status */}
                                <div className="form-group">
                                    <label>Registration Status</label>
                                    <select
                                        className={formErrors?.initialRegistrationStatus ? "invalid-input" : ""}
                                        value={busForm.initialRegistrationStatus}
                                        onChange={(e) => handleChange("initialRegistrationStatus", e.target.value)}
                                    >
                                        <option value="" disabled>--Select Registration Status--</option>
                                        <option value="registered">Registered</option>
                                        <option value="not-registered">Not Registered</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.initialRegistrationStatus}</p>
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
                                {/* OR/CR */}
                                <div className="form-group">
                                    <label>OR/CR Attachment</label>
                                    <input
                                        className={formErrors?.orcr ? "invalid-input" : ""}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            handleChange("orcr", file ? file.name : "");
                                        }}
                                    />
                                    <p className="add-error-message">{formErrors?.orcr}</p>
                                </div>
                            </div>

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
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            const newFileNames = files.map(f => f.name);
                                            const allFiles = Array.from(new Set([...busForm.otherDocuments, ...newFileNames]));
                                            handleChange("otherDocuments", allFiles);
                                        }}
                                    />
                                    {/* Show all uploaded document names and remove buttons */}
                                    {busForm.otherDocuments.length > 0 && (
                                        <ul className="uploaded-documents-list">
                                            {busForm.otherDocuments.map((doc, idx) => (
                                                <li key={idx} className="uploaded-document-item">
                                                    <span>{doc}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = busForm.otherDocuments.filter((_, i) => i !== idx);
                                                            handleChange("otherDocuments", updated);
                                                        }}
                                                        className="remove-document-button"
                                                        aria-label={`Remove document ${doc}`}
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
                    <i className="ri-save-3-line" /> Save
                </button>
            </div>

        </>
    );
}
