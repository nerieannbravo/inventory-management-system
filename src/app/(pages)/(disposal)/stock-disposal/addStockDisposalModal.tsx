import React, { useState, useEffect } from "react";

import {
    showStockDisposalSaveConfirmation, showStockDisposalSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";
import "@/styles/modal.css";

// Export the interface so it can be imported by other components
export interface StockDisposalForm {
    // Dropdown for item name and category
    itemName: string;
    category: string;

    // For stock details
    sku: string;
    expirationDate: string;
    quantity: number;
    unitMeasure: string;
    manufacturer: string;

    // Disposal details
    stockDisposalDate: string;
    stockDisposalMethod: string;
    quantityDisposal: number,
    unitMeasureDisposal: string,
    stockDisposalReason: string;
    stockDisposalAttachment: string[];
    stockDisposalRemarks: string;
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
        quantity: 0,
        unitMeasure: "",
        manufacturer: "",

        // Disposal details
        stockDisposalDate: "",
        stockDisposalMethod: "",
        quantityDisposal: 0,
        unitMeasureDisposal: "",
        stockDisposalReason: "",
        stockDisposalAttachment: [],
        stockDisposalRemarks: "",
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

        if (!stockDisposalForm.stockDisposalDate) {
            errors.stockDisposalDate = "Disposal date is required";
        }
        if (!stockDisposalForm.stockDisposalMethod) {
            errors.stockDisposalMethod = "Disposal method is required";
        }
        //Disposal quantity
        if (!stockDisposalForm.quantityDisposal || stockDisposalForm.quantityDisposal === 0) {
            errors.quantityDisposal = "Disposal quantity is required and cannot be 0";
        } 
        // IF DISPOSAL QUANTITY CANNOT BE GREATER THAN THE STOCK QUANTITY
        // else if (stockDisposalForm.quantityDisposal >= stockDisposalForm.quantity) {
        //     errors.quantityDisposal = "Disposal quantity cannot be greater than available quantity";
        // } 

        if (!stockDisposalForm.unitMeasureDisposal) {
            errors.unitMeasureDisposal = "Unit measure is required";
        }
        if (!stockDisposalForm.stockDisposalReason) {
            errors.stockDisposalReason = "Disposal reason is required";
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
                <form className="add-stock-disposal-form">
                    <div className="form-row">
                        {/* SKU */}
                        <div className="form-group">
                            <label>SKU</label>
                            <select
                                className={formErrors?.sku ? "invalid-input" : ""}
                                value={stockDisposalForm.sku}
                                onChange={(e) => handleChange("sku", e.target.value)}
                            >
                                <option value="" disabled>--Select SKU Here--</option>
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
            <p className="bus-details-title">I. Stock Details</p>
            <div className="modal-content add">
                <form className="add-stock-disposal-form">
                    {/* SKU and category */}
                    <div className="form-row">
                        {/* Item Name */}
                        <div className="form-group">
                            <label>Item Name</label>
                            <input
                                className={formErrors?.itemName ? "invalid-input" : ""}
                                type="text"
                                value={stockDisposalForm.itemName}
                                onChange={(e) => handleChange("itemName", e.target.value)}
                                placeholder="Item Name here"
                                disabled
                            />
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label>Category</label>
                            <input
                                className={formErrors?.category ? "invalid-input" : ""}
                                type="text"
                                value={stockDisposalForm.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                                placeholder="Category here"
                                disabled
                            />
                        </div>
                    </div>

                    {/* Quantity and Unit Measure */}
                    <div className="form-row">
                        {/* Quantity */}
                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                className={formErrors?.quantity ? "invalid-input" : ""}
                                type="text"
                                value={0} 
                                onChange={(e) => handleChange("quantity", e.target.value)}
                                placeholder="Quantity here"
                                disabled
                            />
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <input
                                className={formErrors?.unitMeasure ? "invalid-input" : ""}
                                type="text"
                                value={stockDisposalForm.unitMeasure}
                                onChange={(e) => handleChange("unitMeasure", e.target.value)}
                                placeholder="Bus type here"
                                disabled
                            />
                        </div>

                        {/* Expiration Date */}
                        <div className="form-group">
                            <label>Expiration Date</label>
                            <input
                                className={formErrors?.expirationDate ? "invalid-input" : ""}
                                type="text"
                                value={stockDisposalForm.expirationDate}
                                onChange={(e) => handleChange("expirationDate", e.target.value)}
                                placeholder="Expiration Date here"
                                disabled
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* For Disposal detais */}
            <p className="bus-details-title">II. Disposal Details</p>
            <div className="modal-content add">
                <form className="add-stock-disposal-form">
                    {/* Disposal date and method */}
                    <div className="form-row">
                        {/* Disposal Date */}
                        <div className="form-group">
                            <label>Disposal Date</label>
                            <input
                                className={formErrors?.stockDisposalDate ? "invalid-input" : ""}
                                type="date"
                                value={stockDisposalForm.stockDisposalDate}
                                onChange={(e) => handleChange("stockDisposalDate", e.target.value)}
                            />
                            <p className="add-error-message">{formErrors?.stockDisposalDate}</p>
                        </div>

                        {/* Disposal Method */}
                        <div className="form-group">
                            <label>Disposal Method</label>
                            <select
                                value={stockDisposalForm.stockDisposalMethod}
                                onChange={(e) => handleChange("stockDisposalMethod", e.target.value)}
                                className={formErrors?.stockDisposalMethod ? "invalid-input" : ""}
                            >
                                <option value="" disabled>--Select Disposal Method--</option>
                                <option value="sold">Sold</option>
                                <option value="scrapped">Scrapped</option>
                                <option value="donated">Donated</option>
                                <option value="traded">Traded In</option>
                                <option value="transfered">Transfered</option>
                                <option value="auctioned">Auctioned</option>
                            </select>
                            <p className="add-error-message">{formErrors?.stockDisposalMethod}</p>
                        </div>
                    </div>

                    {/* Quantity and unit measure */}
                    <div className="form-row">
                        {/* Quantity */}
                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                className={formErrors?.quantityDisposal ? "invalid-input" : ""}
                                type="number"
                                min={1}
                                value={stockDisposalForm.quantityDisposal}
                                onChange={(e) => handleChange("quantityDisposal", Number(e.target.value))}
                                placeholder="Enter quantity to dispose"
                            />
                            <p className="add-error-message">{formErrors?.quantityDisposal}</p>
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <select
                                value={stockDisposalForm.unitMeasureDisposal}
                                onChange={(e) => handleChange("unitMeasureDisposal", e.target.value)}
                                className={formErrors?.unitMeasureDisposal ? "invalid-input" : ""}
                            >
                                <option value="" disabled>--Select Unit Measure--</option>
                                <option value="pcs">Pieces</option>
                                <option value="liters">Liters</option>
                                <option value="kg">Kilograms</option>
                                <option value="box">Box</option>
                                {/* Add more unit measures as needed */}
                            </select>
                            <p className="add-error-message">{formErrors?.unitMeasureDisposal}</p>
                        </div>
                    </div>

                    {/* Reason for Disposal */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Reason for Disposal</label>
                            <input
                                className={formErrors?.stockDisposalReason ? "invalid-input" : ""}
                                type="text"
                                value={stockDisposalForm.stockDisposalReason}
                                onChange={(e) => handleChange("stockDisposalReason", e.target.value)}
                                placeholder="Enter disposal reason here..."
                            />
                            <p className="add-error-message">{formErrors?.stockDisposalReason}</p>
                        </div>
                    </div>

                    {/* Form row - Disposal Documents */}
                    <div className="form-row">
                        {/* Disposal Documents */}
                        <div className="form-group">
                            <label>Disposal Attachments</label>
                            <input
                                className={formErrors?.stockDisposalAttachment ? "invalid-input" : ""}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    const newFileNames = files.map(f => f.name);
                                    const allFiles = Array.from(new Set([...stockDisposalForm.stockDisposalAttachment, ...newFileNames]));
                                    handleChange("stockDisposalAttachment", allFiles);
                                }}
                            />
                            {/* Show all uploaded document names and remove buttons */}
                            {stockDisposalForm.stockDisposalAttachment.length > 0 && (
                                <ul className="uploaded-documents-list">
                                    {stockDisposalForm.stockDisposalAttachment.map((doc, idx) => (
                                        <li key={idx} className="uploaded-document-item">
                                            <span>{doc}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = stockDisposalForm.stockDisposalAttachment.filter((_, i) => i !== idx);
                                                    handleChange("stockDisposalAttachment", updated);
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

                            <p className="add-error-message">{formErrors?.stockDisposalAttachment}</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Remarks</label>
                            <input
                                className={formErrors?.stockDisposalRemarks ? "invalid-input" : ""}
                                type="text"
                                value={stockDisposalForm.stockDisposalRemarks}
                                onChange={(e) => handleChange("stockDisposalRemarks", e.target.value)}
                                placeholder="Enter remarks here..."
                            />
                            <p className="add-error-message">{formErrors?.stockDisposalRemarks}</p>
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