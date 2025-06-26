"use client";

import React, { useState, useEffect } from "react";

import {
    showStockMaintenanceSaveConfirmation, showStockMaintenanceSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";
import "@/styles/modal.css";

// Export the interface so it can be imported by other components
export interface StockMaintenanceForm {
    // Dropdown for plate number
    sku: string;

    // Item Details
    itemName: string;
    category: string;
    quantity: number;
    unitMeasure: string;
    expirationDate: string;

    // Maintenance details
    stockMaintenanceDate: string;
    stockMaintenanceType: string;
    stockMaintenanceQuantity: number;
    stockMaintenanceUnitMeasure: string; //addition
    stockMaintenanceStatus: string;

    // Stocks (items used in maintenance)
    items: {
        usedItemName: string;
        usedQuantity: number;
        usedUnitMeasure: string;
    }[];

    // Mechanic details
    employeeDepartment: string;
    employeeName: string;
    workDescription: string;
    stockMaintenanceRemarks: string;
}

interface FormError {
    [key: string]: string;
}

interface AddStockMaintenanceModalProps {
    onSave: (stockMaintenanceForm: StockMaintenanceForm) => void;
    onClose: () => void;
}

export default function AddStockMaintenanceModal({ onSave, onClose }: AddStockMaintenanceModalProps) {
    const [stockMaintenanceForm, setStockMaintenanceForm] = useState<StockMaintenanceForm>({
        // Dropdown for SKU
        sku: "",

        // Item Details
        itemName: "",
        category: "",
        quantity: 0,
        unitMeasure: "",
        expirationDate: "",

        // Maintenance details
        stockMaintenanceDate: "",
        stockMaintenanceType: "",
        stockMaintenanceQuantity: 0,
        stockMaintenanceUnitMeasure: "",
        stockMaintenanceStatus: "",

        // Maintenance items
        items: [
            {
                usedItemName: "",
                usedQuantity: 0,
                usedUnitMeasure: "",
            },
        ],

        // Mechanic details
        employeeDepartment: "",
        employeeName: "",
        workDescription: "",
        stockMaintenanceRemarks: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setIsDirty(true);
    }, [stockMaintenanceForm]);

    // Function to handle changes in the form fields
    const handleChange = (field: string, value: any) => {
        setStockMaintenanceForm((prev) => ({ ...prev, [field]: value }));

        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    // Function to handle changes in maintenance items
    const handleItemChange = (index: number, field: string, value: any) => {
        const updatedItems = [...stockMaintenanceForm.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        setStockMaintenanceForm((prev) => ({
            ...prev,
            items: updatedItems,
        }));

        const key = `items.${index}.${field}`;
        if (formErrors[key]) {
            const newErrors = { ...formErrors };
            delete newErrors[key];
            setFormErrors(newErrors);
        }
    };

    // Function to add a new item row
    const handleAddItem = () => {
        setStockMaintenanceForm((prev) => ({
            ...prev,
            items: [...prev.items, { usedItemName: "", usedQuantity: 0, usedUnitMeasure: "" }],
        }));
    };

    // Function to remove an item row
    const handleRemoveItem = (index: number) => {
        if (stockMaintenanceForm.items.length <= 1) return;

        setStockMaintenanceForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };



    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!stockMaintenanceForm.sku) {
            errors.sku = "SKU is required";
        }

        // Maintenance details validation
        if (!stockMaintenanceForm.stockMaintenanceDate) {
            errors.stockMaintenanceDate = "Maintenance date is required";
        }
        if (!stockMaintenanceForm.stockMaintenanceType) {
            errors.stockMaintenanceType = "Maintenance type is required";
        }
        if (!stockMaintenanceForm.stockMaintenanceQuantity || stockMaintenanceForm.stockMaintenanceQuantity < 0) {
            errors.stockMaintenanceQuantity = "Stock quantity is required";
        }
        if (!stockMaintenanceForm.stockMaintenanceUnitMeasure) {
            errors.stockMaintenanceUnitMeasure = "Unit measure is required";
        }

        // Validate maintenance items
        stockMaintenanceForm.items.forEach((item, index) => {
            if (item.usedItemName) {
            if (!item.usedQuantity || item.usedQuantity <= 0) {
                errors[`items.${index}.usedQuantity`] = "Quantity must be greater than 0";
            }
            if (!item.usedUnitMeasure) {
                errors[`items.${index}.usedUnitMeasure`] = "Unit measure is required";
            }
            }
        });

        // Mechanic details validation
        if (!stockMaintenanceForm.employeeDepartment) {
            errors.employeeDepartment = "Employee department is required";
        }
        if (!stockMaintenanceForm.employeeName) {
            errors.employeeName = "Employee name is required";
        }
        if (!stockMaintenanceForm.workDescription) {
            errors.workDescription = "Work description is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showStockMaintenanceSaveConfirmation();
        if (result.isConfirmed) {
            onSave(stockMaintenanceForm);
            await showStockMaintenanceSavedSuccess();
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
                <h1 className="modal-title">Add Machine & Equipement Maintenance</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            <div className="modal-content add">
                <form className="add-stock-maintenance-form">
                    <div className="form-row">
                        {/* SKU */}
                        <div className="form-group">
                            <label>SKU</label>
                            <select
                                className={formErrors?.sku ? "invalid-input" : ""}
                                value={stockMaintenanceForm.sku}
                                onChange={(e) => handleChange("sku", e.target.value)}
                            >
                                <option value="" disabled>--Select SKU--</option>
                                <option value="SKU001">SKU001</option>
                                <option value="SKU002">SKU002</option>
                                <option value="SKU003">SKU003</option>
                                {/* Add more SKU options as needed */}
                            </select>
                            <p className="add-error-message">{formErrors?.sku}</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* For view stock detais */}
            <p className="bus-details-title">I. Stock Details</p>
            <div className="modal-content add">
                <form className="add-stock-maintenance-form">
                    {/* Item Name and category */}
                    <div className="form-row">
                        {/* Item Name */}
                        <div className="form-group">
                            <label>Item Name</label>
                            <input
                                className={formErrors?.itemName ? "invalid-input" : ""}
                                type="text"
                                value={stockMaintenanceForm.itemName}
                                onChange={(e) => handleChange("itemName", e.target.value)}
                                placeholder="Item name here"
                                disabled
                            />
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label>Category</label>
                            <input
                                className={formErrors?.category ? "invalid-input" : ""}
                                type="text"
                                value={stockMaintenanceForm.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                                placeholder="Category here"
                                disabled
                            />
                        </div>
                    </div>

                    {/* unitMeasure, expirationDate, and year expirationDate */}
                    <div className="form-row">
                        {/* Quantity */}
                        <div className="form-group">
                            <label>Current Stocks</label>
                            <input
                                className={formErrors?.quantity ? "invalid-input" : ""}
                                type="text"
                                value={stockMaintenanceForm.quantity}
                                onChange={(e) => handleChange("quantity", e.target.value)}
                                placeholder="Current stock here"
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>Unit Measure</label>
                            <input
                                className={formErrors?.unitMeasure ? "invalid-input" : ""}
                                type="text"
                                value={stockMaintenanceForm.unitMeasure}
                                onChange={(e) => handleChange("unitMeasure", e.target.value)}
                                placeholder="Unit measure here"
                                disabled
                            />
                        </div>

                        {/* Expiration Date */}
                        <div className="form-group">
                            <label>Expiration Date</label>
                            <input
                                className={formErrors?.expirationDate ? "invalid-input" : ""}
                                type="text"
                                value={stockMaintenanceForm.expirationDate}
                                onChange={(e) => handleChange("expirationDate", e.target.value)}
                                placeholder="Expiration date here"
                                disabled
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* For maintenance detais */}
            <p className="bus-details-title">II. Maintenance Details</p>
            <div className="modal-content add">
                <form className="add-stock-maintenance-form">
                    {/* Maintenance date and type */}
                    <div className="form-row">
                        {/* Maintenance Date */}
                        <div className="form-group">
                            <label>Maintenance Date</label>
                            <input
                                className={formErrors?.stockMaintenanceDate ? "invalid-input" : ""}
                                type="date"
                                value={stockMaintenanceForm.stockMaintenanceDate}
                                onChange={(e) => handleChange("stockMaintenanceDate", e.target.value)}
                            />
                            <p className="add-error-message">{formErrors?.stockMaintenanceDate}</p>
                        </div>

                        {/* Maintenance Type */}
                        <div className="form-group">
                            <label>Maintenance Type</label>
                            <select
                                value={stockMaintenanceForm.stockMaintenanceType}
                                onChange={(e) => handleChange("stockMaintenanceType", e.target.value)}
                                className={formErrors?.stockMaintenanceType ? "invalid-input" : ""}
                            >
                                <option value="" disabled>--Select Maintenance Type--</option>
                                <option value="preventive">Preventive</option>
                                <option value="corrective">Corrective</option>
                                <option value="inspection">Inspection</option>
                            </select>
                            <p className="add-error-message">{formErrors?.stockMaintenanceType}</p>
                        </div>
                    </div>

                    {/* Maintenance Quantity, unit measure and status */}
                    <div className="form-row">
                        {/* Maintenance Quantity */}
                        <div className="form-group">
                            <label>Maintenance Quantity</label>
                            <input
                                className={formErrors?.stockMaintenanceQuantity ? "invalid-input" : ""}
                                type="number"
                                min="0"
                                value={stockMaintenanceForm.stockMaintenanceQuantity}
                                onChange={(e) => handleChange("stockMaintenanceQuantity", Number(e.target.value))}
                                placeholder="Enter maintenance quantity here"
                            />
                            <p className="add-error-message">{formErrors?.stockMaintenanceQuantity}</p>
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <select
                                className={formErrors?.stockMaintenanceUnitMeasure ? "invalid-input" : ""}
                                value={stockMaintenanceForm.stockMaintenanceUnitMeasure}
                                onChange={(e) => handleChange("stockMaintenanceUnitMeasure", e.target.value)}
                            >
                                <option value="" disabled>--Select Unit Measure--</option>
                                <option value="pcs">pcs</option>
                                <option value="liters">liters</option>
                                <option value="meters">meters</option>
                                <option value="sets">sets</option>
                            </select>
                            <p className="add-error-message">{formErrors?.stockMaintenanceUnitMeasure}</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select disabled value={stockMaintenanceForm.stockMaintenanceStatus}>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                            <p className="add-error-message">{formErrors?.stockMaintenanceStatus}</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Remarks</label>
                            <input
                                className={formErrors?.stockMaintenanceRemarks ? "invalid-input" : ""}
                                type="text"
                                value={stockMaintenanceForm.stockMaintenanceRemarks}
                                onChange={(e) => handleChange("stockMaintenanceRemarks", e.target.value)}
                                placeholder="Enter remarks"
                            />
                            <p className="add-error-message">{formErrors?.stockMaintenanceRemarks}</p>
                        </div>
                    </div>

                </form >
            </div >

            {/* For maintenance detais */}
            <p className="bus-details-title">III. Used Items</p>
            <div className="modal-content add">
                <form className="add-stock-maintenance-form">
                    {/* Used Stocks */}
                    {stockMaintenanceForm.items?.map((item, idx) => (
                        <div className="form-row" key={idx}>
                            {/* Item Name */}
                            <div className="form-group">
                                <label>Item Name</label>
                                <select
                                    className={formErrors?.[`items.${idx}.usedItemName`] ? "invalid-input" : ""}
                                    value={item.usedItemName}
                                    onChange={(e) => handleItemChange(idx, "usedItemName", e.target.value)}
                                >
                                    <option value="" disabled>--Select Used Item--</option>
                                    <option value="oil">Oil</option>
                                    <option value="filter">Filter</option>
                                    <option value="brake pad">Brake Pad</option>
                                    <option value="belt">Belt</option>
                                </select>
                                <p className="add-error-message">{formErrors?.[`items.${idx}.usedItemName`]}</p>
                            </div>

                            {/* Quantity */}
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    className={formErrors?.[`items.${idx}.usedQuantity`] ? "invalid-input" : ""}
                                    type="number"
                                    min="0"
                                    value={item.usedQuantity}
                                    onChange={(e) => handleItemChange(idx, "usedQuantity", Number(e.target.value))}
                                    placeholder="Enter used quantity"
                                />
                                <p className="add-error-message">{formErrors?.[`items.${idx}.usedQuantity`]}</p>
                            </div>

                            {/* Unit Measure */}
                            <div className="form-group">
                                <label>Unit Measure</label>
                                <select
                                    className={formErrors?.[`items.${idx}.usedUnitMeasure`] ? "invalid-input" : ""}
                                    value={item.usedUnitMeasure}
                                    onChange={(e) => handleItemChange(idx, "usedUnitMeasure", e.target.value)}
                                >
                                    <option value="" disabled>--Select Unit Measure--</option>
                                    <option value="pcs">pcs</option>
                                    <option value="liters">liters</option>
                                    <option value="meters">meters</option>
                                    <option value="sets">sets</option>
                                </select>
                                <p className="add-error-message">{formErrors?.[`items.${idx}.usedUnitMeasure`]}</p>
                            </div>

                            {/* Button: Add (last row only) / Remove (others) */}
                            <div className="modal-actions add">
                                {idx === stockMaintenanceForm.items.length - 1 ? (
                                    <div className="add-maintenance-btn-wrapper">
                                        <button
                                            type="button"
                                            className="add-maintenance-btn"
                                            onClick={handleAddItem}
                                        >

                                            <i className="ri-add-fill"></i> Add Item
                                        </button>
                                    </div>
                                ) : (
                                    <div className="remove-maintenance-btn-wrapper">
                                        <button
                                            type="button"
                                            className="remove-maintenance-btn"
                                            onClick={() => handleRemoveItem(idx)}
                                        >
                                            <i className="ri-close-line"></i> Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                </form >
            </div >

            {/* For mechanic detais */}
            <p className="bus-details-title">IV. Mechanic Details</p>
            <div className="modal-content add">
                <form className="add-stock-maintenance-form">
                    {/* Employee name and department */}
                    <div className="form-row">
                        {/* Employee Department */}
                        <div className="form-group">
                            <label>Employee Department</label>
                            <select
                                className={formErrors?.employeeDepartment ? "invalid-input" : ""}
                                value={stockMaintenanceForm.employeeDepartment}
                                onChange={(e) => handleChange("employeeDepartment", e.target.value)}
                            >
                                <option value="">--Select Department--</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="operations">Operations</option>
                                <option value="engineering">Engineering</option>
                                <option value="other">Other</option>
                            </select>
                            <p className="add-error-message">{formErrors?.employeeDepartment}</p>
                        </div>

                        {/* Employee Name */}
                        <div className="form-group">
                            <label>Employee Name</label>
                            <select
                                value={stockMaintenanceForm.employeeName}
                                onChange={(e) => handleChange("employeeName", e.target.value)}
                                className={formErrors?.employeeName ? "invalid-input" : ""}
                            >
                                <option value="" disabled>--Select Employee Name--</option>
                                <option value="John Doe">John Doe</option>
                                <option value="Jane Smith">Jane Smith</option>
                                <option value="Alex Johnson">Alex Johnson</option>
                                {/* Add more employee options as needed */}
                            </select>
                            <p className="add-error-message">{formErrors?.employeeName}</p>
                        </div>                
                    </div>

                    {/* Work Description */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Work Description</label>
                            <input
                                className={formErrors?.workDescription ? "invalid-input" : ""}
                                type="text"
                                value={stockMaintenanceForm.workDescription}
                                onChange={(e) => handleChange("workDescription", e.target.value)}
                                placeholder="Enter maintenance work description"
                            />
                            <p className="add-error-message">{formErrors?.workDescription}</p>
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