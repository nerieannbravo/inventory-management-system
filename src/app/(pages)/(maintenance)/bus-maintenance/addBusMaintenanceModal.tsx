import React, { useState, useEffect } from "react";

import {
    showBusMaintenanceSaveConfirmation, showBusMaintenanceSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";
import "@/styles/modal.css";

// Export the interface so it can be imported by other components
export interface BusMaintenanceForm {
    // Dropdown for plate number
    bodyNumber: string;

    // For bus details
    plateNumber: string;
    bodyBuilder: string;
    busType: string;
    manufacturer: string;
    model: string;
    yearModel: number;
    chasisNumber: string;
    engineNumber: string;
    seatCapacity: number;

    // Maintenance details
    busMaintenanceDate: string;
    busMaintenanceType: string;
    busMaintenanceOdometer: number;
    busMaintenanceStatus: string;

    // Stocks (items used in maintenance)
    items: {
        itemName: string;
        quantity: number;
        unitMeasure: string;
    }[];

    // Mechanic details
    employeeDepartment: string;
    employeeName: string;
    workDescription: string;
    busMaintenanceRemarks: string;
}

interface FormError {
    [key: string]: string;
}

interface AddBusMaintenanceModalProps {
    onSave: (busMaintenanceForm: BusMaintenanceForm) => void;
    onClose: () => void;
}

export default function AddBusMaintenanceModal({ onSave, onClose }: AddBusMaintenanceModalProps) {
    const [busMaintenanceForm, setBusMaintenanceForm] = useState<BusMaintenanceForm>({
        // Dropdown for plate number
        bodyNumber: "",

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

        // Maintenance details
        busMaintenanceDate: "",
        busMaintenanceType: "",
        busMaintenanceOdometer: 0,
        busMaintenanceStatus: "",

        // Maintenance items
        items: [
            {
                itemName: "",
                quantity: 0,
                unitMeasure: "",
            },
        ],

        // Mechanic details
        employeeDepartment: "",
        employeeName: "",
        workDescription: "",
        busMaintenanceRemarks: "",
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setIsDirty(true);
    }, [busMaintenanceForm]);

    // Function to handle changes in the form fields
    const handleChange = (field: string, value: any) => {
        setBusMaintenanceForm((prev) => ({ ...prev, [field]: value }));

        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    // Function to handle changes in maintenance items
    const handleItemChange = (index: number, field: string, value: any) => {
        const updatedItems = [...busMaintenanceForm.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        setBusMaintenanceForm((prev) => ({
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
        setBusMaintenanceForm((prev) => ({
            ...prev,
            items: [...prev.items, { itemName: "", quantity: 0, unitMeasure: "" }],
        }));
    };

    // Function to remove an item row
    const handleRemoveItem = (index: number) => {
        if (busMaintenanceForm.items.length <= 1) return;

        setBusMaintenanceForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };



    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!busMaintenanceForm.bodyNumber) {
            errors.bodyNumber = "Body number is required";
        }

        // Maintenance details validation
        if (!busMaintenanceForm.busMaintenanceDate) {
            errors.busMaintenanceDate = "Maintenance date is required";
        }
        if (!busMaintenanceForm.busMaintenanceType) {
            errors.busMaintenanceType = "Maintenance type is required";
        }
        if (busMaintenanceForm.busMaintenanceOdometer < 0) {
            errors.busMaintenanceOdometer = "Odometer reading is required";
        }

        // Validate maintenance items
        busMaintenanceForm.items.forEach((item, index) => {
            if (item.itemName) {
            if (!item.quantity || item.quantity <= 0) {
                errors[`items.${index}.quantity`] = "Quantity must be greater than 0";
            }
            if (!item.unitMeasure) {
                errors[`items.${index}.unitMeasure`] = "Unit measure is required";
            }
            }
        });

        // Mechanic details validation
        if (!busMaintenanceForm.employeeDepartment) {
            errors.employeeDepartment = "Employee department is required";
        }
        if (!busMaintenanceForm.employeeName) {
            errors.employeeName = "Employee name is required";
        }
        if (!busMaintenanceForm.workDescription) {
            errors.workDescription = "Work description is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showBusMaintenanceSaveConfirmation();
        if (result.isConfirmed) {
            onSave(busMaintenanceForm);
            await showBusMaintenanceSavedSuccess();
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
                <h1 className="modal-title">Add Bus Maintenance</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            <div className="modal-content add">
                <form className="add-bus-maintenance-form">
                    <div className="form-row">
                        {/* Body Number */}
                        <div className="form-group">
                            <label>Body Number</label>
                            <select
                                className={formErrors?.bodyNumber ? "invalid-input" : ""}
                                value={busMaintenanceForm.bodyNumber}
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
                <form className="add-bus-maintenance-form">
                    {/* Plate number, body builder, and bus type */}
                    <div className="form-row">
                        {/* Plate Number */}
                        <div className="form-group">
                            <label>Plate Number</label>
                            <input
                                className={formErrors?.plateNumber ? "invalid-input" : ""}
                                type="text"
                                value={busMaintenanceForm.plateNumber}
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
                                value={busMaintenanceForm.bodyBuilder}
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
                                value={busMaintenanceForm.busType}
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
                                value={busMaintenanceForm.manufacturer}
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
                                value={busMaintenanceForm.model}
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
                                value={busMaintenanceForm.yearModel}
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
                                value={busMaintenanceForm.seatCapacity}
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
                                value={busMaintenanceForm.chasisNumber}
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
                                value={busMaintenanceForm.engineNumber}
                                onChange={(e) => handleChange("engineNumber", e.target.value)}
                                placeholder="Engine number here"
                                disabled
                            />
                        </div>
                    </div>

                </form>
            </div>

            {/* For maintenance detais */}
            <p className="bus-details-title">II. Maintenance Details</p>
            <div className="modal-content add">
                <form className="add-bus-maintenance-form">
                    {/* Maintenance date and type */}
                    <div className="form-row">
                        {/* Maintenance Date */}
                        <div className="form-group">
                            <label>Maintenance Date</label>
                            <input
                                className={formErrors?.busMaintenanceDate ? "invalid-input" : ""}
                                type="date"
                                value={busMaintenanceForm.busMaintenanceDate}
                                onChange={(e) => handleChange("busMaintenanceDate", e.target.value)}
                            />
                            <p className="add-error-message">{formErrors?.busMaintenanceDate}</p>
                        </div>

                        {/* Maintenance Type */}
                        <div className="form-group">
                            <label>Maintenance Type</label>
                            <select
                                value={busMaintenanceForm.busMaintenanceType}
                                onChange={(e) => handleChange("busMaintenanceType", e.target.value)}
                                className={formErrors?.busMaintenanceType ? "invalid-input" : ""}
                            >
                                <option value="" disabled>--Select Maintenance Type--</option>
                                <option value="preventive">Preventive</option>
                                <option value="corrective">Corrective</option>
                                <option value="inspection">Inspection</option>
                            </select>
                            <p className="add-error-message">{formErrors?.busMaintenanceType}</p>
                        </div>
                    </div>

                    {/* Odometer reading and status */}
                    <div className="form-row">
                        {/* Odometer Reading */}
                        <div className="form-group">
                            <label>Odometer Reading</label>
                            <input
                                className={formErrors?.busMaintenanceOdometer ? "invalid-input" : ""}
                                type="number"
                                min="0"
                                value={busMaintenanceForm.busMaintenanceOdometer}
                                onChange={(e) => handleChange("busMaintenanceOdometer", Number(e.target.value))}
                                placeholder="Enter odometer reading"
                            />
                            <p className="add-error-message">{formErrors?.busMaintenanceOdometer}</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select disabled value={busMaintenanceForm.busMaintenanceStatus}>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                            <p className="add-error-message">{formErrors?.busMaintenanceStatus}</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Remarks</label>
                            <input
                                className={formErrors?.busMaintenanceRemarks ? "invalid-input" : ""}
                                type="text"
                                value={busMaintenanceForm.busMaintenanceRemarks}
                                onChange={(e) => handleChange("busMaintenanceRemarks", e.target.value)}
                                placeholder="Enter remarks"
                            />
                            <p className="add-error-message">{formErrors?.busMaintenanceRemarks}</p>
                        </div>
                    </div>

                </form >
            </div >

            {/* For maintenance detais */}
            <p className="bus-details-title">III. Used Items</p>
            <div className="modal-content add">
                <form className="add-bus-maintenance-form">
                    {/* Used Stocks */}
                    {busMaintenanceForm.items?.map((item, idx) => (
                        <div className="form-row" key={idx}>
                            {/* Item Name */}
                            <div className="form-group">
                                <label>Item Name</label>
                                <select
                                    className={formErrors?.[`items.${idx}.itemName`] ? "invalid-input" : ""}
                                    value={item.itemName}
                                    onChange={(e) => handleItemChange(idx, "itemName", e.target.value)}
                                >
                                    <option value="" disabled>--Select Item Name--</option>
                                    <option value="oil">Oil</option>
                                    <option value="filter">Filter</option>
                                    <option value="brake pad">Brake Pad</option>
                                    <option value="belt">Belt</option>
                                </select>
                                <p className="add-error-message">{formErrors?.[`items.${idx}.itemName`]}</p>
                            </div>

                            {/* Quantity */}
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    className={formErrors?.[`items.${idx}.quantity`] ? "invalid-input" : ""}
                                    type="number"
                                    min="0"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                                    placeholder="Enter quantity"
                                />
                                <p className="add-error-message">{formErrors?.[`items.${idx}.quantity`]}</p>
                            </div>

                            {/* Unit Measure */}
                            <div className="form-group">
                                <label>Unit Measure</label>
                                <select
                                    className={formErrors?.[`items.${idx}.unitMeasure`] ? "invalid-input" : ""}
                                    value={item.unitMeasure}
                                    onChange={(e) => handleItemChange(idx, "unitMeasure", e.target.value)}
                                >
                                    <option value="" disabled>--Select Unit Measure--</option>
                                    <option value="pcs">pcs</option>
                                    <option value="liters">liters</option>
                                    <option value="meters">meters</option>
                                    <option value="sets">sets</option>
                                </select>
                                <p className="add-error-message">{formErrors?.[`items.${idx}.unitMeasure`]}</p>
                            </div>

                            {/* Button: Add (last row only) / Remove (others) */}
                            <div className="modal-actions add">
                                {idx === busMaintenanceForm.items.length - 1 ? (
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
                <form className="add-bus-maintenance-form">
                    {/* Employee name and department */}
                    <div className="form-row">
                        {/* Employee Department */}
                        <div className="form-group">
                            <label>Employee Department</label>
                            <select
                                className={formErrors?.employeeDepartment ? "invalid-input" : ""}
                                value={busMaintenanceForm.employeeDepartment}
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
                                value={busMaintenanceForm.employeeName}
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
                                value={busMaintenanceForm.workDescription}
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