import React, { useState, useEffect } from "react";

import {
    showStockDisposalSaveConfirmation, showStockDisposalSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface StockDisposalForm {
    // For stock details
    itemName: string,
    category: string,
    sku: string,
    expirationDate: string,
    currentStock: number,
    unitMeasure: string,

    // Disposal details
    disposalDate: string,
    disposalMethod: string,
    disposalQuantity: number,
    disposalUnitMeasure: string,
    disposalReason: string,
    disposalRemarks: string,
}

interface FormError {
    [key: string]: string;
}

interface AddStockDisposalModalProps {
    onSave: (stockDisposalForm: StockDisposalForm) => void;
    onClose: () => void;
}

export default function AddStockDisposalModal({ onSave, onClose }: AddStockDisposalModalProps) {
    const [stockDisposalForm, setStockDisposalForm] = useState<StockDisposalForm>({
        // Dropdown for plate number
        itemName: "",
        category: "",

        // Stock details
        sku: "",
        expirationDate: "",
        currentStock: 0,
        unitMeasure: "",

        // Disposal details
        disposalDate: "",
        disposalMethod: "",
        disposalQuantity: 0,
        disposalUnitMeasure: "",
        disposalReason: "",
        disposalRemarks: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setIsDirty(true);
    }, [stockDisposalForm]);

    // Function to handle changes in the form fields
    const handleChange = (field: string, value: any) => {
        setStockDisposalForm((prev) => ({ ...prev, [field]: value }));

        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!stockDisposalForm.sku) {
            errors.sku = "SKU is required";
        }

        if (!stockDisposalForm.disposalDate) {
            errors.disposalDate = "Disposal date is required";
        }
        if (!stockDisposalForm.disposalMethod) {
            errors.disposalMethod = "Disposal method is required";
        }
        //Disposal quantity
        if (!stockDisposalForm.disposalQuantity || stockDisposalForm.disposalQuantity === 0) {
            errors.disposalQuantity = "Disposal quantity is required and cannot be 0";
        }
        else if (stockDisposalForm.disposalQuantity > stockDisposalForm.currentStock) {
            errors.disposalQuantity = "Disposal quantity cannot be greater than current stock";
        }

        if (!stockDisposalForm.disposalReason) {
            errors.disposalReason = "Disposal reason is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showStockDisposalSaveConfirmation();
        if (result.isConfirmed) {
            onSave(stockDisposalForm);
            await showStockDisposalSavedSuccess();
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
                <h1 className="modal-title">Add Stock Disposal</h1>
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
                        {/* SKU */}
                        <div className="form-group">
                            <label className="required">SKU</label>
                            <select
                                className={formErrors?.sku ? "invalid-input" : ""}
                                value={stockDisposalForm.sku}
                                onChange={(e) => handleChange("sku", e.target.value)}
                            >
                                <option value="" disabled>Select SKU here...</option>
                                <option value="Tire001">Tire001 - Michelin X Coach</option>
                                <option value="Oil002">Oil002 - Shell Rimula R4</option>
                                <option value="Battery003">Battery003 - Motolite Gold</option>
                                <option value="Filter004">Filter004 - Fleetguard Air Filter</option>
                                <option value="Brake005">Brake005 - Bendix Brake Pad</option>
                                {/* Add more SKUs as needed */}
                            </select>
                            <p className="add-error-message">{formErrors?.sku}</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* For view stock detais */}
            <p className="details-title">I. Stock Details</p>
            <div className="modal-content add">
                <form className="add-form">
                    {/* SKU and category */}
                    <div className="form-row">
                        {/* Item Name */}
                        <div className="form-group">
                            <label>Item Name</label>
                            <input disabled
                                className={formErrors?.itemName ? "invalid-input" : ""}
                                type="text"
                                value={stockDisposalForm.itemName}
                                onChange={(e) => handleChange("itemName", e.target.value)}
                                placeholder="Item name here..."
                            />
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label>Category</label>
                            <input disabled
                                className={formErrors?.category ? "invalid-input" : ""}
                                type="text"
                                value={stockDisposalForm.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                                placeholder="Category here..."
                            />
                            <p className="add-error-message"></p>
                        </div>
                    </div>

                    {/* Current Stock and Unit Measure */}
                    <div className="form-row">
                        {/* Current Stock */}
                        <div className="form-group">
                            <label>Current Stock</label>
                            <input disabled
                                className={formErrors?.currentStock ? "invalid-input" : ""}
                                type="text"
                                value={stockDisposalForm.currentStock}
                                onChange={(e) => handleChange("currentStock", e.target.value)}
                                placeholder="Current stock here..."
                            />
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <input disabled
                                className={formErrors?.unitMeasure ? "invalid-input" : ""}
                                type="text"
                                value={stockDisposalForm.unitMeasure}
                                onChange={(e) => handleChange("unitMeasure", e.target.value)}
                                placeholder="Unit measure here..."
                            />
                        </div>

                        {/* Expiration Date */}
                        <div className="form-group">
                            <label>Expiration Date</label>
                            <input disabled
                                className={formErrors?.expirationDate ? "invalid-input" : ""}
                                type="text"
                                value={stockDisposalForm.expirationDate || "N/A"}
                                onChange={(e) => handleChange("expirationDate", e.target.value)}
                                placeholder="Expiration date here..."
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
                                value={stockDisposalForm.disposalDate}
                                onChange={(e) => handleChange("disposalDate", e.target.value)}
                            />
                            <p className="add-error-message">{formErrors?.disposalDate}</p>
                        </div>

                        {/* Disposal Method */}
                        <div className="form-group">
                            <label className="required">Disposal Method</label>
                            <select
                                value={stockDisposalForm.disposalMethod}
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

                    {/* Quantity and unit measure */}
                    <div className="form-row">
                        {/* Quantity */}
                        <div className="form-group">
                            <label className="required">Quantity</label>
                            <input
                                className={formErrors?.disposalQuantity ? "invalid-input" : ""}
                                type="number"
                                min={1}
                                value={stockDisposalForm.disposalQuantity}
                                onChange={(e) => handleChange("disposalQuantity", Number(e.target.value))}
                                placeholder="Enter quantity to dispose"
                            />
                            <p className="add-error-message">{formErrors?.disposalQuantity}</p>
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <input disabled
                                className={formErrors?.disposalUnitMeasure ? "invalid-input" : ""}
                                type="number"
                                min={1}
                                value={stockDisposalForm.disposalUnitMeasure}
                                onChange={(e) => handleChange("disposalUnitMeasure", Number(e.target.value))}
                                placeholder="Unit measure here..."
                            />
                            <p className="add-error-message">{formErrors?.disposalUnitMeasure}</p>
                        </div>
                    </div>

                    {/* Reason for Disposal */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="required">Reason for Disposal</label>
                            <input
                                className={formErrors?.disposalReason ? "invalid-input" : ""}
                                type="text"
                                value={stockDisposalForm.disposalReason}
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
                                value={stockDisposalForm.disposalRemarks}
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