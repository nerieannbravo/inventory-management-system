import React, { useState, useEffect } from "react";
import {
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";
import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface PurchaseRequestForm {
    itemName: string;
    quantity: number;
    unitMeasure: string;
    requestType: string;
    requestPurpose: string;
    requestStatus: string;
    supplier: string;
    supplierDetails: {
        supplierName: string;
        unitPrice: number;
        avgDeliveryTime: string;
        lastUpdated: string;
        notes: string;
    } | null;
}

interface FormError {
    [key: string]: string;
}

interface AddPurchaseModalProps {
    onSave: (purchaseRequests: PurchaseRequestForm[]) => void;
    onClose: () => void;
}

interface Item {
    id: string;
    name: string;
    unitMeasure: string;
    suppliers: Supplier[];
}

interface Supplier {
    id: string;
    name: string;
    unitPrice: number;
    avgDeliveryTime: string;
    lastUpdated: string;
    notes: string;
}

export default function AddPurchaseModal({ onSave, onClose }: AddPurchaseModalProps) {
    // Initial purchase request form state
    const initialFormState: PurchaseRequestForm = {
        itemName: "",
        quantity: 0,
        unitMeasure: "",
        requestType: "",
        requestPurpose: "",
        requestStatus: "pending",
        supplier: "",
        supplierDetails: null
    };

    const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequestForm[]>([initialFormState]);
    const [formErrors, setFormErrors] = useState<FormError[]>([{}]);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Mock data - in real app, these would come from API calls
    const [items] = useState<Item[]>([
        {
            id: "1",
            name: "Brake Disc",
            unitMeasure: "pcs",
            suppliers: [
                { id: "1", name: "AutoParts Inc.", unitPrice: 450.00, avgDeliveryTime: "3-5 days", lastUpdated: "2024-01-15", notes: "Quality parts, reliable delivery" },
                { id: "2", name: "BrakeTech Corp.", unitPrice: 420.00, avgDeliveryTime: "2-4 days", lastUpdated: "2024-01-10", notes: "Competitive pricing" }
            ]
        },
        {
            id: "2",
            name: "Brake Pads",
            unitMeasure: "sets",
            suppliers: [
                { id: "1", name: "AutoParts Inc.", unitPrice: 180.00, avgDeliveryTime: "3-5 days", lastUpdated: "2024-01-15", notes: "Quality parts, reliable delivery" },
                { id: "3", name: "SafeStop Materials", unitPrice: 165.00, avgDeliveryTime: "5-7 days", lastUpdated: "2024-01-08", notes: "Budget-friendly option" }
            ]
        },
        {
            id: "3",
            name: "Engine Oil",
            unitMeasure: "liters",
            suppliers: [
                { id: "4", name: "OilMax Supply", unitPrice: 85.00, avgDeliveryTime: "1-3 days", lastUpdated: "2024-01-18", notes: "Fast delivery, bulk discounts available" },
                { id: "5", name: "LubeWorks", unitPrice: 92.00, avgDeliveryTime: "2-4 days", lastUpdated: "2024-01-12", notes: "Premium quality oils" }
            ]
        },
        {
            id: "4",
            name: "Air Filter",
            unitMeasure: "pcs",
            suppliers: [
                { id: "6", name: "FilterPro Ltd.", unitPrice: 35.00, avgDeliveryTime: "2-3 days", lastUpdated: "2024-01-16", notes: "OEM quality filters" }
            ]
        },
        {
            id: "5",
            name: "Oil Filter",
            unitMeasure: "pcs",
            suppliers: [
                { id: "6", name: "FilterPro Ltd.", unitPrice: 25.00, avgDeliveryTime: "2-3 days", lastUpdated: "2024-01-16", notes: "OEM quality filters" },
                { id: "4", name: "OilMax Supply", unitPrice: 22.00, avgDeliveryTime: "1-3 days", lastUpdated: "2024-01-18", notes: "Compatible with most engines" }
            ]
        }
    ]);

    const [employees] = useState([
        { id: "1", name: "John Doe", position: "Manager" },
        { id: "2", name: "Jane Smith", position: "Technician" },
        { id: "3", name: "Mike Johnson", position: "Driver" },
        { id: "4", name: "Sarah Wilson", position: "Supervisor" },
        { id: "5", name: "Robert Brown", position: "Mechanic" },
        { id: "6", name: "Emily Davis", position: "Maintenance Lead" },
        { id: "7", name: "David Martinez", position: "Fleet Coordinator" }
    ]);

    // Track if any form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [purchaseRequests]);

    const handleItemSelection = (index: number, itemName: string) => {
        const selectedItem = items.find(item => item.name === itemName);
        
        if (selectedItem) {
            setPurchaseRequests(prev =>
                prev.map((form, i) =>
                    i === index
                        ? {
                            ...form,
                            itemName: selectedItem.name,
                            unitMeasure: selectedItem.unitMeasure,
                            supplier: "", // Reset supplier when item changes
                            supplierDetails: null
                        }
                        : form
                )
            );

            // Clear errors for the item field
            if (formErrors[index] && formErrors[index].itemName) {
                const newErrors = [...formErrors];
                delete newErrors[index].itemName;
                setFormErrors(newErrors);
            }
        }
    };

    const handleSupplierSelection = (index: number, supplierId: string) => {
        const currentItem = items.find(item => item.name === purchaseRequests[index].itemName);
        const selectedSupplier = currentItem?.suppliers.find(supplier => supplier.id === supplierId);
        
        if (selectedSupplier) {
            setPurchaseRequests(prev =>
                prev.map((form, i) =>
                    i === index
                        ? {
                            ...form,
                            supplier: supplierId,
                            supplierDetails: {
                                supplierName: selectedSupplier.name,
                                unitPrice: selectedSupplier.unitPrice,
                                avgDeliveryTime: selectedSupplier.avgDeliveryTime,
                                lastUpdated: selectedSupplier.lastUpdated,
                                notes: selectedSupplier.notes
                            }
                        }
                        : form
                )
            );

            // Clear errors for the supplier field
            if (formErrors[index] && formErrors[index].supplier) {
                const newErrors = [...formErrors];
                delete newErrors[index].supplier;
                setFormErrors(newErrors);
            }
        }
    };

    const handleFormChange = (index: number, field: string, value: any) => {
        setPurchaseRequests(prev =>
            prev.map((form, i) =>
                i === index ? { ...form, [field]: value } : form
            )
        );

        // Clear errors for the changed field
        if (formErrors[index] && formErrors[index][field]) {
            const newErrors = [...formErrors];
            delete newErrors[index][field];
            setFormErrors(newErrors);
        }
    };

    const handleAddAnotherRequest = () => {
        setPurchaseRequests(prev => [...prev, initialFormState]);
        setFormErrors(prev => [...prev, {}]);
    };

    const handleRemoveRequest = (index: number) => {
        setPurchaseRequests(prev => prev.filter((_, i) => i !== index));
        setFormErrors(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = (): boolean => {
        const errors = purchaseRequests.map((form) => {
            const errorObj: FormError = {};

            if (!form.itemName) errorObj.itemName = "Item name is required";
            if (form.quantity <= 0) errorObj.quantity = "Quantity must be greater than 0";
            if (!form.unitMeasure) errorObj.unitMeasure = "Unit measure is required";
            if (!form.requestType) errorObj.requestType = "Request type is required";
            if (!form.requestPurpose.trim()) errorObj.requestPurpose = "Request purpose is required";
            if (!form.requestStatus) errorObj.requestStatus = "Request status is required";
            if (!form.supplier) errorObj.supplier = "Supplier selection is required";

            return errorObj;
        });

        setFormErrors(errors);
        return errors.every(err => Object.keys(err).length === 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Call the onSave callback to close the modal or update the parent
            onSave(purchaseRequests);
            onClose();
        } catch (error: any) {
            console.error('Error saving purchase requests:', error);
            alert('Error saving purchase requests. Please try again.');
        } finally {
            setIsSaving(false);
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

    const getAvailableSuppliers = (index: number) => {
        const currentItem = items.find(item => item.name === purchaseRequests[index].itemName);
        return currentItem?.suppliers || [];
    };

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Add Purchase Request</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* Add Purchase Request Form - allows adding multiple requests */}
            {purchaseRequests.map((form, index) => (
                <div className="modal-content add" key={index}>
                    <form className="add-form" id={`add-form-${index}`}>
                        {/* Item Name */}
                        <div className="form-group">
                            <label>Item Name</label>
                            <select
                                className={formErrors[index]?.itemName ? "invalid-input" : ""}
                                value={form.itemName}
                                onChange={(e) => handleItemSelection(index, e.target.value)}
                                disabled={isSaving}
                            >
                                <option value="" disabled>Select item name...</option>
                                {items.map(item => (
                                    <option key={item.id} value={item.name}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                            <p className="add-error-message">{formErrors[index]?.itemName}</p>
                        </div>

                        <div className="form-row">
                            {/* Quantity */}
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    className={formErrors[index]?.quantity ? "invalid-input" : ""}
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={form.quantity || ""}
                                    onChange={(e) => handleFormChange(index, "quantity", Number(e.target.value))}
                                    placeholder="0"
                                    disabled={isSaving}
                                />
                                <p className="add-error-message">{formErrors[index]?.quantity}</p>
                            </div>

                            {/* Unit Measure */}
                            <div className="form-group">
                                <label>Unit Measure</label>
                                <input
                                    className={formErrors[index]?.unitMeasure ? "invalid-input" : ""}
                                    type="text"
                                    value={form.unitMeasure}
                                    onChange={(e) => handleFormChange(index, "unitMeasure", e.target.value)}
                                    placeholder="unit"
                                    disabled={isSaving}
                                />
                                <p className="add-error-message">{formErrors[index]?.unitMeasure}</p>
                            </div>

                            {/* Request Type */}
                            <div className="form-group">
                                <label>Request Type</label>
                                <select
                                    className={formErrors[index]?.requestType ? "invalid-input" : ""}
                                    value={form.requestType}
                                    onChange={(e) => handleFormChange(index, "requestType", e.target.value)}
                                    disabled={isSaving}
                                >
                                    <option value="" disabled>Select request type...</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="normal">Normal</option>
                                </select>
                                <p className="add-error-message">{formErrors[index]?.requestType}</p>
                            </div>
                        </div>

                        <div className="form-row">
                            {/* Request Status */}
                            <div className="form-group">
                                <label>Request Status</label>
                                <select
                                    className={formErrors[index]?.requestStatus ? "invalid-input" : ""}
                                    value={form.requestStatus}
                                    onChange={(e) => handleFormChange(index, "requestStatus", e.target.value)}
                                    disabled={isSaving}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <p className="add-error-message">{formErrors[index]?.requestStatus}</p>
                            </div>

                            {/* Supplier */}
                            <div className="form-group">
                                <label>Supplier</label>
                                <select
                                    className={formErrors[index]?.supplier ? "invalid-input" : ""}
                                    value={form.supplier}
                                    onChange={(e) => handleSupplierSelection(index, e.target.value)}
                                    disabled={isSaving || !form.itemName}
                                >
                                    <option value="" disabled>
                                        {!form.itemName ? "Select item first..." : "Select supplier..."}
                                    </option>
                                    {getAvailableSuppliers(index).map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="add-error-message">{formErrors[index]?.supplier}</p>
                            </div>
                        </div>

                        {/* Supplier Details */}
                        {form.supplierDetails && (
                            <div className="form-group">
                                <label>Supplier Details</label>
                                <table className="modal-table">
                                    <thead className="modal-table-heading">
                                        <tr>
                                            <th>Supplier Name</th>
                                            <th>Unit Price</th>
                                            <th>Average Delivery Time</th>
                                            <th>Quantity Requested</th>
                                            <th>Total Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="modal-table-body">
                                        <tr>
                                            <td>{form.supplierDetails.supplierName}</td>
                                            <td>₱{form.supplierDetails.unitPrice.toFixed(2)}</td>
                                            <td>{form.supplierDetails.avgDeliveryTime}</td>
                                            <td>{form.quantity}</td>
                                            <td>₱{(form.supplierDetails.unitPrice * form.quantity).toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Request Purpose */}
                        <div className="form-group">
                            <label>Request Purpose</label>
                            <textarea
                                className={formErrors[index]?.requestPurpose ? "invalid-input" : ""}
                                value={form.requestPurpose}
                                onChange={(e) => handleFormChange(index, "requestPurpose", e.target.value)}
                                placeholder="Enter the reason for this purchase request (e.g., repair, preventive maintenance, consumables)..."
                                rows={3}
                                disabled={isSaving}
                            />
                            <p className="add-error-message">{formErrors[index]?.requestPurpose}</p>
                        </div>

                    </form>

                    {/* Remove Request Button - Only show if there's more than one form */}
                    {purchaseRequests.length > 1 && (
                        <div className="remove-btn-wrapper">
                            <button
                                type="button"
                                className="remove-stock-btn"
                                onClick={() => handleRemoveRequest(index)}
                                disabled={isSaving}
                            >
                                <i className="ri-close-line" /> Remove
                            </button>
                        </div>
                    )}
                </div>
            ))}

            <div className="modal-actions">
                <button type="button" className="add-another-btn" onClick={handleAddAnotherRequest}
                    disabled={isSaving}>
                    <i className="ri-add-line" /> Add Another Request
                </button>

                <button type="submit" className="submit-btn" onClick={handleSubmit}
                    disabled={isSaving}>
                    <i className="ri-save-3-line" /> 
                    {isSaving ? 'Saving...' : purchaseRequests.length === 1 ? 'Submit Request' : `Submit ${purchaseRequests.length} Requests`}
                </button>
            </div>
        </>
    );
}
