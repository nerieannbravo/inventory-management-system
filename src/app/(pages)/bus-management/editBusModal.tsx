import React, { useState, useEffect } from "react";

import {
    showBusUpdateConfirmation, showBusUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

interface EditBusModalProps {
    item: {
        id: number,
        bodyNumber: string,
        bodyBuilder: string,
        busType: string,
        busStatus: string,
        condition: string,
        // Additional fields would be included in a real application
    };
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

export default function EditBusModal({ item, onSave, onClose }: EditBusModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        plateNumber: "",
        bodyNumber: item.bodyNumber,
        bodyBuilder: item.bodyBuilder,
        busType: item.busType,
        busStatus: item.busStatus,
        manufacturer: "",
        seatCapacity: 0,
        chasisNumber: "",
        engineNumber: "",

        // New basic fields
        model: "",
        yearModel: "",
        condition: item.condition,

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

        // Basic Information Validation
        if (!formData.busStatus) errors.busStatus = "Bus status is required";

        // Second Hand Details Validation
        if (formData.condition === "second-hand") {
            if (formData.prevOwnerContact && !/^[0-9\-]+$/.test(formData.prevOwnerContact?.toString() || "")) {
                errors.prevOwnerContact = "Previous owner contact must only contain numbers and hyphens";
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
        if (!formData.dealerContact) {
            errors.dealerContact = "Dealer contact is required";
        } else if (!/^[0-9\-]+$/.test(formData.dealerContact.toString())) {
            errors.dealerContact = "Dealer contact must only contain numbers and hyphens";
        }
        if (!formData.initialRegistrationStatus) errors.initialRegistrationStatus = "Initial registration status is required";

        // Document Attachments Validation
        if (!formData.orcr) errors.orcr = "OR/CR is required";
        if (formData.otherDocuments.length === 0) {
            errors.otherDocuments = "At least one other document is required";
        } else {
            formData.otherDocuments.forEach((doc, index) => {
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

        const result = await showBusUpdateConfirmation(formData.bodyNumber);
        if (result.isConfirmed) {
            onSave(formData);
            await showBusUpdatedSuccess();
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
                <h1 className="modal-title">Edit Bus</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            <p className="bus-details-title">I. Basic Identification</p>
            {/* Edit Bus Form */}
            <div className="modal-content edit">
                <form className="edit-bus-form" id="edit-bus-form" onSubmit={handleSubmit}>
                    {/* Plate Number and Body Number */}
                    <div className="form-row">
                        {/* Plate Number */}
                        <div className="form-group">
                            <label>Plate Number</label>
                            <input disabled
                                className={formErrors?.plateNumber ? "invalid-input" : ""}
                                type="text"
                                value={formData.plateNumber}
                                onChange={(e) => handleChange("plateNumber", e.target.value)}
                                placeholder="Enter plate number here..."
                            />
                            <p className="edit-error-message">{formErrors?.plateNumber}</p>
                        </div>

                        {/* Body Number */}
                        <div className="form-group">
                            <label>Body Number</label>
                            <input disabled
                                className={formErrors?.bodyNumber ? "invalid-input" : ""}
                                type="text"
                                value={formData.bodyNumber}
                                onChange={(e) => handleChange("bodyNumber", e.target.value)}
                                placeholder="Enter body number here..."
                            />
                            <p className="edit-error-message">{formErrors?.bodyNumber}</p>
                        </div>
                    </div>

                    {/* Body Builder and Bus Type */}
                    <div className="form-row">
                        {/* Body Builder */}
                        <div className="form-group">
                            <label>Body Builder</label>
                            <select
                                className={formErrors?.bodyBuilder ? "invalid-input" : ""}
                                value={formData.bodyBuilder}
                                onChange={(e) => handleChange("bodyBuilder", e.target.value)}
                            >
                                <option value="" disabled>--Select Body Builder--</option>
                                <option value="agila">Agila</option>
                                <option value="hilltop">Hilltop</option>
                                <option value="rbm">RBM</option>
                                <option value="darj">DARJ</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.bodyBuilder}</p>
                        </div>

                        {/* Bus Type */}
                        <div className="form-group">
                            <label>Bus Type</label>
                            <select
                                className={formErrors?.busType ? "invalid-input" : ""}
                                value={formData.busType}
                                onChange={(e) => handleChange("busType", e.target.value)}
                            >
                                <option value="" disabled>--Select Bus Type--</option>
                                <option value="airconditioned">Airconditioned</option>
                                <option value="ordinary">Ordinary</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.busType}</p>
                        </div>
                    </div>

                    {/* Manufacturer, Model, and Year Model   */}
                    <div className="form-row">
                        {/* Manufacturer */}
                        <div className="form-group">
                            <label>Manufacturer</label>
                            <input disabled
                                className={formErrors?.manufacturer ? "invalid-input" : ""}
                                type="text"
                                value={formData.manufacturer}
                                onChange={(e) => handleChange("manufacturer", e.target.value)}
                                placeholder="Enter manufacturer here..."
                            />
                            <p className="edit-error-message">{formErrors?.manufacturer}</p>
                        </div>

                        {/* Model */}
                        <div className="form-group">
                            <label>Model</label>
                            <input disabled
                                className={formErrors?.model ? "invalid-input" : ""}
                                type="text"
                                value={formData.model}
                                onChange={(e) => handleChange("model", e.target.value)}
                                placeholder="Enter model here..."
                            />
                            <p className="edit-error-message">{formErrors?.model}</p>
                        </div>

                        {/* Year Model */}
                        <div className="form-group">
                            <label>Year Model</label>
                            <input disabled
                                className={formErrors?.yearModel ? "invalid-input" : ""}
                                type="text"
                                value={formData.yearModel}
                                onChange={(e) => handleChange("yearModel", e.target.value)}
                                placeholder="Enter yearModel here..."
                            />
                            <p className="edit-error-message">{formErrors?.yearModel}</p>
                        </div>
                    </div>

                    {/* Chassis Number and Engine Number */}
                    <div className="form-row">
                        {/* Chasis Number */}
                        <div className="form-group">
                            <label>Chasis Number</label>
                            <input
                                className={formErrors?.chasisNumber ? "invalid-input" : ""}
                                type="text"
                                value={formData.chasisNumber}
                                onChange={(e) => handleChange("chasisNumber", e.target.value)}
                                placeholder="Enter chasis number here..."
                            />
                            <p className="edit-error-message">{formErrors?.chasisNumber}</p>
                        </div>

                        {/* Engine Number */}
                        <div className="form-group">
                            <label>Engine Number</label>
                            <input
                                className={formErrors?.engineNumber ? "invalid-input" : ""}
                                type="text"
                                value={formData.engineNumber}
                                onChange={(e) => handleChange("engineNumber", e.target.value)}
                                placeholder="Enter engine number here..."
                            />
                            <p className="edit-error-message">{formErrors?.engineNumber}</p>
                        </div>
                    </div>

                    {/* Condition, Seat Capacity, and Status */}
                    <div className="form-row">
                        {/* Condition */}
                        <div className="form-group">
                            <label>Condition</label>
                            <select disabled
                                className={formErrors?.condition ? "invalid-input" : ""}
                                value={formData.condition}
                                onChange={(e) => handleChange("condition", e.target.value)}
                            >
                                <option value="" disabled>--Select Condition--</option>
                                <option value="brand-new">Brand New</option>
                                <option value="second-hand">Second Hand</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.condition}</p>
                        </div>


                        {/* Seat Capacity */}
                        <div className="form-group">
                            <label>Seat Capacity</label>
                            <input disabled
                                className={formErrors?.seatCapacity ? "invalid-input" : ""}
                                type="number"
                                step="1"
                                min="0"
                                value={formData.seatCapacity}
                                onChange={(e) => handleChange("seatCapacity", Number(e.target.value))}
                            />
                            <p className="edit-error-message">{formErrors?.seatCapacity}</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select disabled
                                className={formErrors?.busStatus ? "invalid-input" : ""}
                                value={formData.busStatus}
                                onChange={(e) => handleChange("busStatus", e.target.value)}
                            >
                                <option value="" disabled>--Select Status--</option>
                                <option value="active">Active</option>
                                <option value="decommissioned">Decommissioned</option>
                                <option value="under-maintenance">Under Maintenance</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.busStatus}</p>
                        </div>
                    </div>
                </form>
            </div>

            {formData.condition === "Second Hand" && (
                <div>
                    <p className="bus-details-title">II. Second Hand Details</p>
                    <div className="modal-content add">
                        {/* Second Hand Details */}
                        <form className="add-bus-form">
                            {/* Form row - acquisition date and acquisition method */}
                            <div className="form-row">
                                {/* Acquisition Date */}
                                <div className="form-group">
                                    <label>Acquisition Date</label>
                                    <input disabled
                                        className={formErrors?.secHandAcquiDate ? "invalid-input" : ""}
                                        type="date"
                                        value={formData.secHandAcquiDate}
                                        onChange={(e) => handleChange("secHandAcquiDate", e.target.value)}
                                        placeholder="Select acquisition date..."
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.secHandAcquiDate}</p>
                                </div>

                                {/* Acquisition Method */}
                                <div className="form-group">
                                    <label>Acquisition Method</label>
                                    <select disabled
                                        className={formErrors?.secHandAcquiMethod ? "invalid-input" : ""}
                                        value={formData.secHandAcquiMethod}
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
                                        value={formData.prevOwner}
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
                                        value={formData.prevOwnerContact}
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
                                    <select disabled
                                        className={formErrors?.source ? "invalid-input" : ""}
                                        value={formData.source}
                                        onChange={(e) => handleChange("source", e.target.value)}
                                    >
                                        <option value="" disabled>--Select source--</option>
                                        <option value="dealership">Dealership</option>
                                        <option value="action">Auction</option>
                                        <option value="private individual">Private Individual</option>
                                    </select>
                                    <p className="add-error-message">{formErrors?.source}</p>
                                </div>

                                {/* Odometer Reading */}
                                <div className="form-group">
                                    <label>Odometer Reading</label>
                                    <input disabled
                                        className={formErrors?.odometerReading ? "invalid-input" : ""}
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formData.odometerReading}
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
                                        value={formData.secHandWarrantyExpiryDate}
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
                                        value={formData.registrationStatus}
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
                                    <input disabled
                                        className={formErrors?.lastRegistrationDate ? "invalid-input" : ""}
                                        type="date"
                                        value={formData.lastRegistrationDate}
                                        onChange={(e) => handleChange("lastRegistrationDate", e.target.value)}
                                        placeholder="Select last registration date..."
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.lastRegistrationDate}</p>
                                </div>

                                {/* Last Maintenance Date */}
                                <div className="form-group">
                                    <label>Last Maintenance Date</label>
                                    <input disabled
                                        className={formErrors?.lastMaintenanceDate ? "invalid-input" : ""}
                                        type="date"
                                        value={formData.lastMaintenanceDate}
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
                                        value={formData.initialBusCondition}
                                        onChange={(e) => handleChange("initialBusCondition", e.target.value)}
                                        placeholder="Enter initial bus condition or notes here..."
                                        rows={3}
                                    />
                                    <p className="add-error-message">{formErrors?.initialBusCondition}</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {formData.condition === "Brand New" && (
                <div>
                    <p className="bus-details-title">II. Brand New Details</p>
                    <div className="modal-content add">
                        {/* Brand New Details */}
                        <form className="add-bus-form">
                            {/* Form row - acquisition date and acquisition method */}
                            <div className="form-row">
                                {/* Acquisition Date */}
                                <div className="form-group">
                                    <label>Acquisition Date</label>
                                    <input disabled
                                        className={formErrors?.newAcquiDate ? "invalid-input" : ""}
                                        type="date"
                                        value={formData.newAcquiDate}
                                        onChange={(e) => handleChange("newAcquiDate", e.target.value)}
                                        placeholder="Select acquisition date..."
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="add-error-message">{formErrors?.newAcquiDate}</p>
                                </div>

                                {/* Acquisition Method */}
                                <div className="form-group">
                                    <label>Acquisition Method</label>
                                    <select disabled
                                        className={formErrors?.newAcquiMethod ? "invalid-input" : ""}
                                        value={formData.newAcquiMethod}
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
                                        value={formData.dealerName}
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
                                        value={formData.dealerContact}
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

                            {/* Form row - warranty expiration date and initial registration status */}
                            <div className="form-row">
                                {/* Warranty Expiration Date */}
                                <div className="form-group">
                                    <label>Warranty Expiration Date</label>
                                    <input
                                        className={formErrors?.newWarrantyExpiryDate ? "invalid-input" : ""}
                                        type="date"
                                        value={formData.newWarrantyExpiryDate}
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
                                        value={formData.initialRegistrationStatus}
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
                </div>
            )}

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
                                    const allFiles = Array.from(new Set([...formData.otherDocuments, ...newFileNames]));
                                    handleChange("otherDocuments", allFiles);
                                }}
                            />
                            {/* Show all uploaded document names and remove buttons */}
                            {formData.otherDocuments.length > 0 && (
                                <ul className="uploaded-documents-list">
                                    {formData.otherDocuments.map((doc: string, idx: number) => (
                                        <li key={idx} className="uploaded-document-item">
                                            <span>{doc}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = formData.otherDocuments.filter((_: string, i: number) => i !== idx);
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


            <div className="modal-actions">
                <button type="submit" className="submit-btn" form="edit-bus-form">
                    <i className="ri-save-3-line" /> Update
                </button>
            </div>

        </>
    );
}