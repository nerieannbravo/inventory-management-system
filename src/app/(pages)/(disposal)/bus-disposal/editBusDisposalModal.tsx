"use client";

import React, { useState, useEffect } from "react";

import {
    showBusDisposalUpdateConfirmation, showBusDisposalUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

interface EditBusDisposalModalProps {
    item: {
        id: number,
        bodyNumber: string,
        busDisposalDate: string,
        busDisposalMethod: string,
        // edititional fields would be included in a real application
    };
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

export default function EditBusDisposalModal({ item, onSave, onClose }: EditBusDisposalModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        bodyNumber: item.bodyNumber,

        // Bus details
        plateNumber: "",
        bodyBuilder: "",
        busType: "",
        manufacturer: "",
        model: "",
        yearModel: 0,
        chasisNumber: "",
        engineNumber: "",
        seatCapacity: 0,

        // Disposal details
        busDisposalDate: item.busDisposalDate,
        busDisposalMethod: item.busDisposalMethod,
        busDisposalReason: "",
        busDisposalAttachments: [],
        busDisposalRemarks: "",
    });

    // State to track if form is dirty (has changes)
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [originalData] = useState({ ...formData });

    // edit formErrors state
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

        if (!formData.bodyNumber) {
            errors.bodyNumber = "Body number is required";
        }

        if (!formData.busDisposalDate) {
            errors.busDisposalDate = "Disposal date is required";
        }
        if (!formData.busDisposalMethod) {
            errors.busDisposalMethod = "Disposal method is required";
        }
        if (!formData.busDisposalReason) {
            errors.busDisposalReason = "Disposal reason is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showBusDisposalUpdateConfirmation(formData.bodyNumber);
        if (result.isConfirmed) {
            onSave(formData);
            await showBusDisposalUpdatedSuccess();
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
                <h1 className="modal-title">Add Bus Disposal</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            <div className="modal-content add">
                <form className="add-bus-disposal-form">
                    <div className="form-row">
                        {/* Body Number */}
                        <div className="form-group">
                            <label>Body Number</label>
                            <select disabled
                                className={formErrors?.bodyNumber ? "invalid-input" : ""}
                                value={formData.bodyNumber}
                                onChange={(e) => handleChange("bodyNumber", e.target.value)}
                            >
                                <option value="" disabled>--Select Body Number Here--</option>
                                <option value="ABC123">ABC123</option>
                                <option value="XYZ789">XYZ789</option>
                                <option value="DEF456">DEF456</option>
                                {/* Add more body numbers as needed */}
                            </select>
                            <p className="add-error-message">{formErrors?.bodyNumber}</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* For view bus detais */}
            <p className="bus-details-title">I. Bus Details</p>
            <div className="modal-content add">
                <form className="add-bus-disposal-form">
                    {/* Plate number, body builder, and bus type */}
                    <div className="form-row">
                        {/* Plate Number */}
                        <div className="form-group">
                            <label>Plate Number</label>
                            <input
                                className={formErrors?.plateNumber ? "invalid-input" : ""}
                                type="text"
                                value={formData.plateNumber}
                                onChange={(e) => handleChange("plateNumber", e.target.value)}
                                placeholder="Plate number here"
                                disabled
                            />
                        </div>

                        {/* Body Builder */}
                        <div className="form-group">
                            <label>Body Builder</label>
                            <input
                                className={formErrors?.bodyBuilder ? "invalid-input" : ""}
                                type="text"
                                value={formData.bodyBuilder}
                                onChange={(e) => handleChange("bodyBuilder", e.target.value)}
                                placeholder="Body builder here"
                                disabled
                            />
                        </div>

                        {/* Bus Type */}
                        <div className="form-group">
                            <label>Bus Type</label>
                            <input
                                className={formErrors?.busType ? "invalid-input" : ""}
                                type="text"
                                value={formData.busType}
                                onChange={(e) => handleChange("busType", e.target.value)}
                                placeholder="Bus type here"
                                disabled
                            />
                        </div>
                    </div>

                    {/* Manufacturer, model, and year model */}
                    <div className="form-row">
                        {/* Manufacturer */}
                        <div className="form-group">
                            <label>Manufacturer</label>
                            <input
                                className={formErrors?.manufacturer ? "invalid-input" : ""}
                                type="text"
                                value={formData.manufacturer}
                                onChange={(e) => handleChange("manufacturer", e.target.value)}
                                placeholder="Manufacturer here"
                                disabled
                            />
                        </div>

                        {/* Model */}
                        <div className="form-group">
                            <label>Model</label>
                            <input
                                className={formErrors?.model ? "invalid-input" : ""}
                                type="text"
                                value={formData.model}
                                onChange={(e) => handleChange("model", e.target.value)}
                                placeholder="Model here"
                                disabled
                            />
                        </div>

                        {/* Year Model */}
                        <div className="form-group">
                            <label>Year Model</label>
                            <input
                                className={formErrors?.yearModel ? "invalid-input" : ""}
                                type="number"
                                value={formData.yearModel}
                                onChange={(e) => handleChange("yearModel", Number(e.target.value))}
                                placeholder="Year model here"
                                disabled
                            />
                        </div>
                    </div>

                    {/* Seat capacity, chasis number, and engine number */}
                    <div className="form-row">
                        {/* Seat Capacity */}
                        <div className="form-group">
                            <label>Seat Capacity</label>
                            <input
                                className={formErrors?.seatCapacity ? "invalid-input" : ""}
                                type="number"
                                value={formData.seatCapacity}
                                onChange={(e) => handleChange("seatCapacity", Number(e.target.value))}
                                placeholder="Seat capacity here"
                                disabled
                            />
                        </div>

                        {/* Chassis Number */}
                        <div className="form-group">
                            <label>Chassis Number</label>
                            <input
                                className={formErrors?.chasisNumber ? "invalid-input" : ""}
                                type="text"
                                value={formData.chasisNumber}
                                onChange={(e) => handleChange("chasisNumber", e.target.value)}
                                placeholder="Chassis number here"
                                disabled
                            />
                        </div>

                        {/* Engine Number */}
                        <div className="form-group">
                            <label>Engine Number</label>
                            <input
                                className={formErrors?.engineNumber ? "invalid-input" : ""}
                                type="text"
                                value={formData.engineNumber}
                                onChange={(e) => handleChange("engineNumber", e.target.value)}
                                placeholder="Engine number here"
                                disabled
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* For Disposal detais */}
            <p className="bus-details-title">II. Disposal Details</p>
            <div className="modal-content add">
                <form className="add-bus-disposal-form">
                    {/* Disposal date and method */}
                    <div className="form-row">
                        {/* Disposal Date */}
                        <div className="form-group">
                            <label>Disposal Date</label>
                            <input disabled
                                className={formErrors?.busDisposalDate ? "invalid-input" : ""}
                                type="date"
                                value={formData.busDisposalDate}
                                onChange={(e) => handleChange("busDisposalDate", e.target.value)}
                            />
                            <p className="add-error-message">{formErrors?.busDisposalDate}</p>
                        </div>

                        {/* Disposal Method */}
                        <div className="form-group">
                            <label>Disposal Method</label>
                            <select disabled
                                value={formData.busDisposalMethod}
                                onChange={(e) => handleChange("busDisposalMethod", e.target.value)}
                                className={formErrors?.busDisposalMethod ? "invalid-input" : ""}
                            >
                                <option value="" disabled>--Select Disposal Method--</option>
                                <option value="sold">Sold</option>
                                <option value="scrapped">Scrapped</option>
                                <option value="donated">Donated</option>
                                <option value="traded">Traded In</option>
                                <option value="transfered">Transfered</option>
                                <option value="auctioned">Auctioned</option>
                            </select>
                            <p className="add-error-message">{formErrors?.busDisposalMethod}</p>
                        </div>
                    </div>

                    {/* Reason for Disposal */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Reason for Disposal</label>
                            <input
                                className={formErrors?.busDisposalReason ? "invalid-input" : ""}
                                type="text"
                                value={formData.busDisposalReason}
                                onChange={(e) => handleChange("busDisposalReason", e.target.value)}
                                placeholder="Enter disposal reason here..."
                            />
                            <p className="add-error-message">{formErrors?.busDisposalReason}</p>
                        </div>
                    </div>

                    {/* Form row - Disposal Attachments */}
                    <div className="form-row">
                        {/* Disposal Attachments */}
                        <div className="form-group">
                            <label>Attachments</label>
                            <input
                                className={formErrors?.busDisposalAttachments ? "invalid-input" : ""}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    const newFileNames = files.map(f => f.name);
                                    const allFiles = Array.from(new Set([...formData.busDisposalAttachments, ...newFileNames]));
                                    handleChange("busDisposalAttachments", allFiles);
                                }}
                            />
                            {/* Show all uploaded document names and remove buttons */}
                            {formData.busDisposalAttachments.length > 0 && (
                                <ul className="uploaded-documents-list">
                                    {formData.busDisposalAttachments.map((doc: string, idx: number) => (
                                        <li key={idx} className="uploaded-document-item">
                                            <span>{doc}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = formData.busDisposalAttachments.filter((_: string, i: number) => i !== idx);
                                                    handleChange("busDisposalAttachments", updated);
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

                            <p className="add-error-message">{formErrors?.busDisposalAttachments}</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Remarks</label>
                            <input
                                className={formErrors?.busDisposalRemarks ? "invalid-input" : ""}
                                type="text"
                                value={formData.busDisposalRemarks}
                                onChange={(e) => handleChange("busDisposalRemarks", e.target.value)}
                                placeholder="Enter remarks here..."
                            />
                            <p className="add-error-message">{formErrors?.busDisposalRemarks}</p>
                        </div>
                    </div>

                </form >
            </div >

            <div className="modal-actions add">
                <button type="submit" className="submit-btn" onClick={handleSubmit}>
                    <i className="ri-save-3-line" /> Save
                </button>
            </div>

        </>
    );
}