"use client";

import React, { useState, useEffect } from "react";

import {
    showStockMaintenanceUpdateConfirmation, showStockMaintenanceUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

interface EditStockMaintenanceModalProps {
    item: {
        id: number,
        sku: string,
        itemName: string,
        stockMaintenanceType: string,
        stockMaintenanceStatus: string,
        stockMaintenanceDate: string,
        // edititional fields would be included in a real application
    };
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

export default function EditStockMaintenanceModal({ item, onSave, onClose }: EditStockMaintenanceModalProps) {
    const [formData, setFormData] = useState({
        id: item.id,
        sku: item.sku,

        // Bus details
        itemName: item.itemName,
        category: "",
        quantity: "",
        unitMeasure: "",
        expirationDate: "",

        // Maintenance details
        stockMaintenanceDate: item.stockMaintenanceDate,
        stockMaintenanceType: item.stockMaintenanceType,
        stockMaintenanceQuantity: "",
        stockMaintenanceUnitMeasure: "",
        stockMaintenanceStatus: item.stockMaintenanceStatus,

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

    // Function to handle changes in maintenance items
    const handleItemChange = (index: number, field: string, value: any) => {
        const updatedItems = [...formData.items]; // ✅ Fixed: using formData
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        setFormData((prev) => ({ // ✅ Fixed: using setFormData
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
        setFormData((prev) => ({
            ...prev,
            items: [...prev.items, { usedItemName: "", usedQuantity: 0, usedUnitMeasure: "" }],
        }));
    };

    // Function to remove an item row
    const handleRemoveItem = (index: number) => {
        if (formData.items.length <= 1) return;

        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.sku) {
            errors.sku = "SKU is required";
        }

        // Maintenance details validation
        if (!formData.stockMaintenanceDate) {
            errors.stockMaintenanceDate = "Maintenance date is required";
        }
        if (!formData.stockMaintenanceType) {
            errors.stockMaintenanceType = "Maintenance type is required";
        }

        // Validate maintenance items
        formData.items.forEach((item, index) => {
            if (item.usedItemName) {
                if (!item.usedQuantity || item.usedQuantity <= 0) {
                    errors[`items.${index}.usedQuantity`] = "usedQuantity must be greater than 0";
                }
                if (!item.usedUnitMeasure) {
                    errors[`items.${index}.usedUnitMeasure`] = "Unit measure is required";
                }
            }
        });

        // Mechanic details validation
        if (!formData.workDescription) {
            errors.workDescription = "Work description is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showStockMaintenanceUpdateConfirmation(formData.sku);
        if (result.isConfirmed) {
            onSave(formData);
            await showStockMaintenanceUpdatedSuccess();
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
                <h1 className="modal-title">Edit Machine & Equipment Maintenance Details</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            <div className="modal-content edit">
                <form className="edit-stock-maintenance-form">
                    <div className="form-row">
                        {/* SKU */}
                        <div className="form-group">
                            <label>SKU</label>
                            <select disabled
                                className={formErrors?.sku ? "invalid-input" : ""}
                                value={formData.sku}
                                onChange={(e) => handleChange("sku", e.target.value)}
                            >
                                <option value="" disabled>--Select SKU Here--</option>
                                <option value="ABC123">ABC123 - Engine Oil</option>
                                <option value="XYZ789">XYZ789 - Brake Pad</option>
                                <option value="DEF456">DEF456 - Air Filter</option>
                                {/* Add more SKU examples as needed */}
                            </select>
                            <p className="edit-error-message">{formErrors?.sku}</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* For view stock detais */}
            <p className="bus-details-title">I. Bus Details</p>
            <div className="modal-content edit">
                <form className="edit-stock-maintenance-form">
                    {/* Item name and category */}
                    <div className="form-row">
                        {/* Item Name */}
                        <div className="form-group">
                            <label>Item Name</label>
                            <input
                                className={formErrors?.itemName ? "invalid-input" : ""}
                                type="text"
                                value={formData.itemName}
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
                                value={formData.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                                placeholder="Category here"
                                disabled
                            />
                        </div>
                    </div>

                    {/* Current stocks, unit measure, and expiration date */}
                    <div className="form-row">
                        {/* Current Stocks */}
                        <div className="form-group">
                            <label>Current Stocks</label>
                            <input
                                className={formErrors?.quantity ? "invalid-input" : ""}
                                type="text"
                                value={formData.quantity}
                                onChange={(e) => handleChange("quantity", e.target.value)}
                                placeholder="Current stocks here"
                                disabled
                            />
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <input
                                className={formErrors?.unitMeasure ? "invalid-input" : ""}
                                type="text"
                                value={formData.unitMeasure}
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
                                value={formData.expirationDate}
                                onChange={(e) => handleChange("expirationDate", e.target.value)}
                                placeholder="Expiration Date here"
                                disabled
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* For maintenance detais */}
            <p className="bus-details-title">II. Maintenance Details</p>
            <div className="modal-content edit">
                <form className="edit-stock-maintenance-form">
                    {/* Maintenance date and type */}
                    <div className="form-row">
                        {/* Maintenance Date */}
                        <div className="form-group">
                            <label>Maintenance Date</label>
                            <input disabled
                                className={formErrors?.stockMaintenanceDate ? "invalid-input" : ""}
                                type="date"
                                value={formData.stockMaintenanceDate}
                                onChange={(e) => handleChange("stockMaintenanceDate", e.target.value)}
                            />
                            <p className="edit-error-message">{formErrors?.stockMaintenanceDate}</p>
                        </div>

                        {/* Maintenance Type */}
                        <div className="form-group">
                            <label>Maintenance Type</label>
                            <select disabled
                                value={formData.stockMaintenanceType}
                                onChange={(e) => handleChange("stockMaintenanceType", e.target.value)}
                                className={formErrors?.stockMaintenanceType ? "invalid-input" : ""}
                            >
                                <option value="" disabled>--Select Maintenance Type--</option>
                                <option value="preventive">Preventive</option>
                                <option value="corrective">Corrective</option>
                                <option value="inspection">Inspection</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.stockMaintenanceType}</p>
                        </div>
                    </div>

                    {/* Maintenance Quantity, unit measure, and status */}
                    <div className="form-row">
                        {/* Maintenance Quantity */}
                        <div className="form-group">
                            <label>Maintenance Quantity</label>
                            <input disabled
                                className={formErrors?.stockMaintenanceQuantity ? "invalid-input" : ""}
                                type="number"
                                min="0"
                                value={formData.stockMaintenanceQuantity}
                                onChange={(e) => handleChange("stockMaintenanceQuantity", Number(e.target.value))}
                                placeholder="Enter odometer reading"
                            />
                            <p className="edit-error-message">{formErrors?.stockMaintenanceQuantity}</p>
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <select
                                className={formErrors?.stockMaintenanceUnitMeasure ? "invalid-input" : ""}
                                value={formData.stockMaintenanceUnitMeasure}
                                onChange={(e) => handleChange("stockMaintenanceUnitMeasure", e.target.value)}
                                disabled
                            >
                                <option value="" disabled>--Select Unit Measure--</option>
                                <option value="pcs">pcs</option>
                                <option value="liters">liters</option>
                                <option value="meters">meters</option>
                                <option value="sets">sets</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.stockMaintenanceUnitMeasure}</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.stockMaintenanceStatus}
                                onChange={(e) => handleChange("stockMaintenanceStatus", e.target.value)}
                            >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.stockMaintenanceStatus}</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Remarks</label>
                            <input
                                className={formErrors?.stockMaintenanceRemarks ? "invalid-input" : ""}
                                type="text"
                                value={formData.stockMaintenanceRemarks}
                                onChange={(e) => handleChange("stockMaintenanceRemarks", e.target.value)}
                                placeholder="Enter remarks"
                            />
                            <p className="edit-error-message">{formErrors?.stockMaintenanceRemarks}</p>
                        </div>
                    </div>

                </form >
            </div >

            {/* For maintenance detais */}
            <p className="bus-details-title">III. Used Items</p>
            <div className="modal-content edit">
                <form className="edit-stock-maintenance-form">
                    {/* Used Stocks */}
                    {formData.items?.map((item, idx) => (
                        <div className="form-row" key={idx}>
                            {/* Item Name */}
                            <div className="form-group">
                                <label>Item Name</label>
                                <select
                                    className={formErrors?.[`items.${idx}.usedItemName`] ? "invalid-input" : ""}
                                    value={item.usedItemName}
                                    onChange={(e) => handleItemChange(idx, "usedItemName", e.target.value)}
                                >
                                    <option value="" disabled>--Select Item Name--</option>
                                    <option value="oil">Oil</option>
                                    <option value="filter">Filter</option>
                                    <option value="brake pad">Brake Pad</option>
                                    <option value="belt">Belt</option>
                                </select>
                                <p className="edit-error-message">{formErrors?.[`items.${idx}.usedItemName`]}</p>
                            </div>

                            {/* usedQuantity */}
                            <div className="form-group">
                                <label>Used Quantity</label>
                                <input
                                    className={formErrors?.[`items.${idx}.usedQuantity`] ? "invalid-input" : ""}
                                    type="number"
                                    min="0"
                                    value={item.usedQuantity}
                                    onChange={(e) => handleItemChange(idx, "usedQuantity", Number(e.target.value))}
                                    placeholder="Enter usedQuantity"
                                />
                                <p className="edit-error-message">{formErrors?.[`items.${idx}.usedQuantity`]}</p>
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
                                <p className="edit-error-message">{formErrors?.[`items.${idx}.usedUnitMeasure`]}</p>
                            </div>

                            {/* Button: add (last row only) / Remove (others) */}
                            <div className="modal-actions edit">
                                {idx === formData.items.length - 1 ? (
                                    <div className="add-maintenance-btn-wrapper">
                                        <button
                                            type="button"
                                            className="add-maintenance-btn" 
                                            onClick={handleAddItem}
                                        >
                                            <i className="ri-add-line"></i> Add Item 
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
            <div className="modal-content edit">
                <form className="edit-stock-maintenance-form">
                    {/* Employee name and department */}
                    <div className="form-row">
                        {/* Employee Department */}
                        <div className="form-group">
                            <label>Employee Department</label>
                            <select disabled
                                className={formErrors?.employeeDepartment ? "invalid-input" : ""}
                                value={formData.employeeDepartment}
                                onChange={(e) => handleChange("employeeDepartment", e.target.value)}
                            >
                                {/* <option value="">--Select Department--</option> */}
                                <option value="maintenance">Maintenance</option>
                                <option value="operations">Operations</option>
                                <option value="engineering">Engineering</option>
                                <option value="other">Other</option>
                            </select>
                            {/* <p className="edit-error-message">{formErrors?.employeeDepartment}</p> */}
                        </div>

                        {/* Employee Name */}
                        <div className="form-group">
                            <label>Employee Name</label>
                            <select disabled
                                value={formData.employeeName}
                                onChange={(e) => handleChange("employeeName", e.target.value)}
                                className={formErrors?.employeeName ? "invalid-input" : ""}
                            >
                                {/* <option value="" disabled>--Select Employee Name--</option> */}
                                <option value="John Doe">John Doe</option>
                                <option value="Jane Smith">Jane Smith</option>
                                <option value="Alex Johnson">Alex Johnson</option>
                                {/* edit more employee options as needed */}
                            </select>
                            {/* <p className="edit-error-message">{formErrors?.employeeName}</p> */}
                        </div>
                    </div>

                    {/* Work Description */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Work Description</label>
                            <input
                                className={formErrors?.workDescription ? "invalid-input" : ""}
                                type="text"
                                value={formData.workDescription}
                                onChange={(e) => handleChange("workDescription", e.target.value)}
                                placeholder="Enter maintenance work description"
                            />
                            <p className="edit-error-message">{formErrors?.workDescription}</p>
                        </div>
                    </div>


                </form >
            </div >

            <div className="modal-actions edit">
                <button type="submit" className="submit-btn" onClick={handleSubmit}>
                    <i className="ri-save-3-line" /> Update
                </button>
            </div>

        </>
    );
}