import React, { useState, useEffect } from "react";

import {
    showBusDisposalSaveConfirmation, showBusDisposalSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface BusDisposalForm {
    // For bus details
    bodyNumber: string;
    plateNumber: string;
    bodyBuilder: string;
    busType: string;
    manufacturer: string;
    model: string;
    yearModel: number;
    chasisNumber: string;
    engineNumber: string;
    seatCapacity: number;

    // Disposal details
    disposalDate: string;
    disposalMethod: string;
    disposalReason: string;
    disposalRemarks: string;
}

interface FormError {
    [key: string]: string;
}

interface AddBusDisposalModalProps {
    onSave: (busDisposalForm: BusDisposalForm) => void;
    onClose: () => void;
}

export default function AddBusDisposalModal({ onSave, onClose }: AddBusDisposalModalProps) {
    const [busDisposalForm, setBusDisposalForm] = useState<BusDisposalForm>({
        // Bus details
        bodyNumber: "",
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
        disposalDate: "",
        disposalMethod: "",
        disposalReason: "",
        disposalRemarks: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setIsDirty(true);
    }, [busDisposalForm]);

    // Function to handle changes in the form fields
    const handleChange = (field: string, value: any) => {
        setBusDisposalForm((prev) => ({ ...prev, [field]: value }));

        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!busDisposalForm.bodyNumber) {
            errors.bodyNumber = "Body number is required";
        }

        if (!busDisposalForm.disposalDate) {
            errors.disposalDate = "Disposal date is required";
        }
        if (!busDisposalForm.disposalMethod) {
            errors.disposalMethod = "Disposal method is required";
        }
        if (!busDisposalForm.disposalReason) {
            errors.disposalReason = "Disposal reason is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showBusDisposalSaveConfirmation();
        if (result.isConfirmed) {
            onSave(busDisposalForm);
            await showBusDisposalSavedSuccess();
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
                <form className="add-form">
                    <div className="form-row">
                        {/* Body Number */}
                        <div className="form-group">
                            <label className="required">Body Number</label>
                            <select
                                className={formErrors?.bodyNumber ? "invalid-input" : ""}
                                value={busDisposalForm.bodyNumber}
                                onChange={(e) => handleChange("bodyNumber", e.target.value)}
                            >
                                <option value="" disabled>Select body number here...</option>
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
            <p className="details-title">I. Bus Details</p>
            <div className="modal-content add">
                <form className="add-form">
                    {/* Plate number, body builder, and bus type */}
                    <div className="form-row">
                        {/* Plate Number */}
                        <div className="form-group">
                            <label>Plate Number</label>
                            <input disabled
                                className={formErrors?.plateNumber ? "invalid-input" : ""}
                                type="text"
                                value={busDisposalForm.plateNumber}
                                onChange={(e) => handleChange("plateNumber", e.target.value)}
                                placeholder="Plate number here..."
                            />
                        </div>

                        {/* Body Builder */}
                        <div className="form-group">
                            <label>Body Builder</label>
                            <input disabled
                                className={formErrors?.bodyBuilder ? "invalid-input" : ""}
                                type="text"
                                value={busDisposalForm.bodyBuilder}
                                onChange={(e) => handleChange("bodyBuilder", e.target.value)}
                                placeholder="Body builder here..."
                            />
                        </div>

                        {/* Bus Type */}
                        <div className="form-group">
                            <label>Bus Type</label>
                            <input disabled
                                className={formErrors?.busType ? "invalid-input" : ""}
                                type="text"
                                value={busDisposalForm.busType}
                                onChange={(e) => handleChange("busType", e.target.value)}
                                placeholder="Bus type here..."
                            />
                            <p className="add-error-message"></p>
                        </div>
                    </div>

                    {/* Manufacturer, model, and year model */}
                    <div className="form-row">
                        {/* Manufacturer */}
                        <div className="form-group">
                            <label>Manufacturer</label>
                            <input disabled
                                className={formErrors?.manufacturer ? "invalid-input" : ""}
                                type="text"
                                value={busDisposalForm.manufacturer}
                                onChange={(e) => handleChange("manufacturer", e.target.value)}
                                placeholder="Manufacturer here..."
                            />
                        </div>

                        {/* Model */}
                        <div className="form-group">
                            <label>Model</label>
                            <input disabled
                                className={formErrors?.model ? "invalid-input" : ""}
                                type="text"
                                value={busDisposalForm.model}
                                onChange={(e) => handleChange("model", e.target.value)}
                                placeholder="Model here..."
                            />
                        </div>

                        {/* Year Model */}
                        <div className="form-group">
                            <label>Year Model</label>
                            <input disabled
                                className={formErrors?.yearModel ? "invalid-input" : ""}
                                type="number"
                                value={busDisposalForm.yearModel}
                                onChange={(e) => handleChange("yearModel", Number(e.target.value))}
                                placeholder="Year model here..."
                            />
                            <p className="add-error-message"></p>
                        </div>
                    </div>

                    {/* Seat capacity, chasis number, and engine number */}
                    <div className="form-row">
                        {/* Seat Capacity */}
                        <div className="form-group">
                            <label>Seat Capacity</label>
                            <input disabled
                                className={formErrors?.seatCapacity ? "invalid-input" : ""}
                                type="number"
                                value={busDisposalForm.seatCapacity}
                                onChange={(e) => handleChange("seatCapacity", Number(e.target.value))}
                                placeholder="Seat capacity here..."
                            />
                        </div>

                        {/* Chassis Number */}
                        <div className="form-group">
                            <label>Chassis Number</label>
                            <input disabled
                                className={formErrors?.chasisNumber ? "invalid-input" : ""}
                                type="text"
                                value={busDisposalForm.chasisNumber}
                                onChange={(e) => handleChange("chasisNumber", e.target.value)}
                                placeholder="Chassis number here..."
                            />
                        </div>

                        {/* Engine Number */}
                        <div className="form-group">
                            <label>Engine Number</label>
                            <input disabled
                                className={formErrors?.engineNumber ? "invalid-input" : ""}
                                type="text"
                                value={busDisposalForm.engineNumber}
                                onChange={(e) => handleChange("engineNumber", e.target.value)}
                                placeholder="Engine number here..."
                            />
                            <p className="add-error-message"></p>
                        </div>
                    </div>
                </form>
            </div>

            {/* For Disposal detais */}
            <p className="details-title">II. Disposal Details</p>
            <div className="modal-content add">
                <form className="add-form">
                    {/* Disposal date and method */}
                    <div className="form-row">
                        {/* Disposal Date */}
                        <div className="form-group">
                            <label className="required">Disposal Date</label>
                            <input
                                className={formErrors?.disposalDate ? "invalid-input" : ""}
                                type="date"
                                value={busDisposalForm.disposalDate}
                                onChange={(e) => handleChange("disposalDate", e.target.value)}
                            />
                            <p className="add-error-message">{formErrors?.disposalDate}</p>
                        </div>

                        {/* Disposal Method */}
                        <div className="form-group">
                            <label className="required">Disposal Method</label>
                            <select
                                value={busDisposalForm.disposalMethod}
                                onChange={(e) => handleChange("disposalMethod", e.target.value)}
                                className={formErrors?.disposalMethod ? "invalid-input" : ""}
                            >
                                <option value="" disabled>Select disposal method here...</option>
                                <option value="sold">Sold</option>
                                <option value="donated">Donated</option>
                                <option value="discarded">Discarded</option>
                                <option value="scrapped">Scrapped</option>
                            </select>
                            <p className="add-error-message">{formErrors?.disposalMethod}</p>
                        </div>
                    </div>

                    {/* Reason for Disposal */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="required">Reason for Disposal</label>
                            <input
                                className={formErrors?.disposalReason ? "invalid-input" : ""}
                                type="text"
                                value={busDisposalForm.disposalReason}
                                onChange={(e) => handleChange("disposalReason", e.target.value)}
                                placeholder="Enter disposal reason here..."
                            />
                            <p className="add-error-message">{formErrors?.disposalReason}</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Remarks</label>
                            <input
                                className={formErrors?.disposalRemarks ? "invalid-input" : ""}
                                type="text"
                                value={busDisposalForm.disposalRemarks}
                                onChange={(e) => handleChange("disposalRemarks", e.target.value)}
                                placeholder="Enter remarks here..."
                            />
                            <p className="add-error-message">{formErrors?.disposalRemarks}</p>
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