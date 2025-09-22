import React, { useState, useEffect } from "react";
import {
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";
import "@/styles/forms.css";

// Import the interface from addPurchaseModal
import { PurchaseRequestForm } from "./addPurchaseModal";

interface FormError {
    [key: string]: string;
}

interface EditPurchaseModalProps {
    purchaseRequest: any; // The existing purchase request data from the table
    onSave: (updatedRequest: PurchaseRequestForm) => void;
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

export default function EditPurchaseModal({ purchaseRequest, onSave, onClose }: EditPurchaseModalProps) {
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
        },
        {
            id: "6",
            name: "Tire",
            unitMeasure: "pcs",
            suppliers: [
                { id: "7", name: "TireMax Corp.", unitPrice: 320.00, avgDeliveryTime: "2-4 days", lastUpdated: "2024-01-14", notes: "Premium tire supplier" }
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

    // Initialize form with existing purchase request data
    const initializeFormData = (): PurchaseRequestForm => {
        // Find the selected item and supplier to populate supplier details
        const selectedItem = items.find(item => item.name === purchaseRequest.itemName);
        const selectedSupplier = selectedItem?.suppliers.find(supplier => supplier.name === purchaseRequest.vendor);

        return {
            itemName: purchaseRequest.itemName || "",
            quantity: purchaseRequest.quantity || 0,
            unitMeasure: purchaseRequest.unitMeasure || (selectedItem?.unitMeasure || ""),
            requestType: purchaseRequest.requestType || "",
            requestPurpose: purchaseRequest.requestPurpose || "",
            requestStatus: purchaseRequest.requestStatus || "pending",
            supplier: selectedSupplier?.id || "",
            supplierDetails: selectedSupplier ? {
                supplierName: selectedSupplier.name,
                unitPrice: selectedSupplier.unitPrice,
                avgDeliveryTime: selectedSupplier.avgDeliveryTime,
                lastUpdated: selectedSupplier.lastUpdated,
                notes: selectedSupplier.notes
            } : null
        };
    };

    const [formData, setFormData] = useState<PurchaseRequestForm>(initializeFormData);
    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [formData]);

    const handleItemSelection = (itemName: string) => {
        const selectedItem = items.find(item => item.name === itemName);
        
        if (selectedItem) {
            setFormData(prev => ({
                ...prev,
                itemName: selectedItem.name,
                unitMeasure: selectedItem.unitMeasure,
                supplier: "", // Reset supplier when item changes
                supplierDetails: null
            }));

            // Clear errors for the item field
            if (formErrors.itemName) {
                const newErrors = { ...formErrors };
                delete newErrors.itemName;
                setFormErrors(newErrors);
            }
        }
    };

    const handleSupplierSelection = (supplierId: string) => {
        const currentItem = items.find(item => item.name === formData.itemName);
        const selectedSupplier = currentItem?.suppliers.find(supplier => supplier.id === supplierId);
        
        if (selectedSupplier) {
            setFormData(prev => ({
                ...prev,
                supplier: supplierId,
                supplierDetails: {
                    supplierName: selectedSupplier.name,
                    unitPrice: selectedSupplier.unitPrice,
                    avgDeliveryTime: selectedSupplier.avgDeliveryTime,
                    lastUpdated: selectedSupplier.lastUpdated,
                    notes: selectedSupplier.notes
                }
            }));

            // Clear errors for the supplier field
            if (formErrors.supplier) {
                const newErrors = { ...formErrors };
                delete newErrors.supplier;
                setFormErrors(newErrors);
            }
        }
    };

    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear errors for the changed field
        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        const errorObj: FormError = {};

        if (!formData.itemName) errorObj.itemName = "Item name is required";
        if (formData.quantity <= 0) errorObj.quantity = "Quantity must be greater than 0";
        if (!formData.unitMeasure) errorObj.unitMeasure = "Unit measure is required";
        if (!formData.requestType) errorObj.requestType = "Request type is required";
        if (!formData.requestPurpose.trim()) errorObj.requestPurpose = "Request purpose is required";
        if (!formData.requestStatus) errorObj.requestStatus = "Request status is required";
        if (!formData.supplier) errorObj.supplier = "Supplier selection is required";

        setFormErrors(errorObj);
        return Object.keys(errorObj).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Call the onSave callback to update the parent
            onSave(formData);
            onClose();
        } catch (error: any) {
            console.error('Error updating purchase request:', error);
            alert('Error updating purchase request. Please try again.');
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

    const getAvailableSuppliers = () => {
        const currentItem = items.find(item => item.name === formData.itemName);
        return currentItem?.suppliers || [];
    };

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Edit Purchase Request</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            <div className="modal-content add">
                <form className="add-form" onSubmit={handleSubmit}>
                    {/* Item Name */}
                    <div className="form-group">
                        <label>Item Name</label>
                        <select
                            className={formErrors.itemName ? "invalid-input" : ""}
                            value={formData.itemName}
                            onChange={(e) => handleItemSelection(e.target.value)}
                            disabled={isSaving}
                        >
                            <option value="" disabled>Select item name...</option>
                            {items.map(item => (
                                <option key={item.id} value={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        <p className="add-error-message">{formErrors.itemName}</p>
                    </div>

                    <div className="form-row">
                        {/* Quantity */}
                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                className={formErrors.quantity ? "invalid-input" : ""}
                                type="number"
                                step="1"
                                min="1"
                                value={formData.quantity || ""}
                                onChange={(e) => handleFormChange("quantity", Number(e.target.value))}
                                placeholder="0"
                                disabled={isSaving}
                            />
                            <p className="add-error-message">{formErrors.quantity}</p>
                        </div>

                        {/* Unit Measure */}
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <input
                                className={formErrors.unitMeasure ? "invalid-input" : ""}
                                type="text"
                                value={formData.unitMeasure}
                                onChange={(e) => handleFormChange("unitMeasure", e.target.value)}
                                placeholder="unit"
                                disabled={isSaving}
                            />
                            <p className="add-error-message">{formErrors.unitMeasure}</p>
                        </div>

                        {/* Request Type */}
                        <div className="form-group">
                            <label>Request Type</label>
                            <select
                                className={formErrors.requestType ? "invalid-input" : ""}
                                value={formData.requestType}
                                onChange={(e) => handleFormChange("requestType", e.target.value)}
                                disabled={isSaving}
                            >
                                <option value="" disabled>Select request type...</option>
                                <option value="urgent">Urgent</option>
                                <option value="normal">Normal</option>
                            </select>
                            <p className="add-error-message">{formErrors.requestType}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Request Status */}
                        <div className="form-group">
                            <label>Request Status</label>
                            <select
                                className={formErrors.requestStatus ? "invalid-input" : ""}
                                value={formData.requestStatus}
                                onChange={(e) => handleFormChange("requestStatus", e.target.value)}
                                disabled={isSaving}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <p className="add-error-message">{formErrors.requestStatus}</p>
                        </div>

                        {/* Supplier */}
                        <div className="form-group">
                            <label>Supplier</label>
                            <select
                                className={formErrors.supplier ? "invalid-input" : ""}
                                value={formData.supplier}
                                onChange={(e) => handleSupplierSelection(e.target.value)}
                                disabled={isSaving || !formData.itemName}
                            >
                                <option value="" disabled>
                                    {!formData.itemName ? "Select item first..." : "Select supplier..."}
                                </option>
                                {getAvailableSuppliers().map(supplier => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                            <p className="add-error-message">{formErrors.supplier}</p>
                        </div>
                    </div>

                    {/* Supplier Details */}
                    {formData.supplierDetails && (
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
                                        <td>{formData.supplierDetails.supplierName}</td>
                                        <td>₱{formData.supplierDetails.unitPrice.toFixed(2)}</td>
                                        <td>{formData.supplierDetails.avgDeliveryTime}</td>
                                        <td>{formData.quantity}</td>
                                        <td>₱{(formData.supplierDetails.unitPrice * formData.quantity).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Request Purpose */}
                    <div className="form-group">
                        <label>Request Purpose</label>
                        <textarea
                            className={formErrors.requestPurpose ? "invalid-input" : ""}
                            value={formData.requestPurpose}
                            onChange={(e) => handleFormChange("requestPurpose", e.target.value)}
                            placeholder="Enter the reason for this purchase request (e.g., repair, preventive maintenance, consumables)..."
                            rows={3}
                            disabled={isSaving}
                        />
                        <p className="add-error-message">{formErrors.requestPurpose}</p>
                    </div>
                </form>
            </div>

            <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleClose} disabled={isSaving}>
                    <i className="ri-close-line" /> Cancel
                </button>

                <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={isSaving}>
                    <i className="ri-save-3-line" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </>
    );
}
