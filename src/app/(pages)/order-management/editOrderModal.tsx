import React, { useState, useEffect } from "react";

import ModalManager from "@/components/modalManager";
import ActionButtons from "@/components/actionButtons";

import EditItemOrderModal from "./item-order/editItemOrderModal";
import AddStockModal, { StockForm } from "../stock-management/addStockModal";

import {
    showOrderUpdateConfirmation, showOrderUpdatedSuccess,
    showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

interface EditOrderModalProps {
    item: {
        id: number;
        refNo: string;
        departmentName: string;
        dateApproved: string;
        orderStatus: string;
        supplierName: string;
        supplierContact: string;
        remarks: string;
        items: {
            id: number;
            isApproved: boolean;
            itemName: string;
            requestedQuantity: number;
            approvedQuantity: number;
            receivedQuantity: number;
            usableQuantity: number;
            unitMeasure: string;
            estimatedUnitCost: number;
            actualUnitCost: number;
            itemOrderStatus: string;
            adjustmentReason: string | null;
            attachmentFiles: File[];
        }[];
        // Additional fields would be included in a real application
    };
    onSave: (updatedItem: any) => void;
    onClose: () => void;
}

export default function EditOrderModal({ item, onSave, onClose }: EditOrderModalProps) {
    // Modal management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [activeRow, setActiveRow] = useState<any>(null);

    // State for order items list - initialized from the passed item
    const [orderItems, setOrderItems] = useState(item.items);

    // Initial order form state
    const [formData, setFormData] = useState({
        id: item.id,
        refNo: item.refNo,
        departmentName: item.departmentName,
        dateApproved: item.dateApproved,
        orderStatus: item.orderStatus,
        supplierName: item.supplierName,
        supplierContact: item.supplierContact,
        remarks: item.remarks
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

        // Validate inputs
        if (!formData.orderStatus) errors.orderStatus = "Order status is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showOrderUpdateConfirmation(formData.refNo);
        if (result.isConfirmed) {
            onSave(formData);
            await showOrderUpdatedSuccess();
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

    // for order status formatting
    const formatStatus = (orderStatus: string) => {
        switch (orderStatus) {
            case "pending":
                return "Pending";
            case "adjusted":
                return "Adjusted";
            case "received":
                return "Received";
            case "partial":
                return "Partial";
            case "closed":
                return "Closed";
            case "to-be-refunded":
                return "To be Refunded";
            case "to-be-replaced":
                return "To be Replaced";
            case "rejected":
                return "Rejected";
            default:
                return orderStatus;
        }
    };

    // Modal management for order item actions (edit, view, etc.)
    const openModal = (mode: "edit-itemOrder" | "add-to-stock", rowData?: any) => {
        let content;

        switch (mode) {
            case "edit-itemOrder":
                content = (
                    <EditItemOrderModal
                        item={rowData}
                        onSave={handleEditItemOrder}
                        onClose={closeModal}
                    />
                );
                break;
            case "add-to-stock":
                content = <AddStockModal
                    item={{
                        id: rowData.id,
                        itemName: rowData.itemName,
                        approvedQuantity: rowData.approvedQuantity,  // Add this
                        receivedQuantity: rowData.receivedQuantity,
                        unitMeasure: rowData.unitMeasure,
                        usableQuantity: rowData.usableQuantity
                    }}
                    onSave={handleAddStock}
                    onClose={closeModal}
                />;
                break;
            default:
                content = null;
        }

        setModalContent(content);
        setActiveRow(rowData || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
        setActiveRow(null);
    };

    // Handle edit item order
    const handleEditItemOrder = (updatedItem: any) => {
        console.log("Updating item order:", updatedItem);

        // Edit the item order in the list (can be replaced with actual data handling logic)
        setOrderItems(prevItems =>
            prevItems.map(orderItem =>
                orderItem.id === updatedItem.id
                    ? {
                        ...orderItem,
                        receivedQuantity: updatedItem.receivedQuantity,
                        actualUnitCost: updatedItem.actualUnitCost,
                        itemOrderStatus: updatedItem.itemOrderStatus
                    }
                    : orderItem
            )
        );
        closeModal();
    };

    // Handle add stocks - receives both the stock form and the item ID
    const handleAddStock = (stockForm: StockForm, itemId?: number) => {
        console.log("Saving forms:", stockForm);

        // Use the itemId parameter or fall back to activeRow
        const targetItemId = itemId || activeRow?.id;

        if (!targetItemId) {
            console.error("No item ID found");
            closeModal();
            return;
        }

        // Find the order item we're working with
        const targetItem = orderItems.find(item => item.id === targetItemId);

        if (!targetItem) {
            console.error("Order item not found");
            closeModal();
            return;
        }

        // Determine the new status based on the quantities
        let newStatus: string;
        const approvedQty = targetItem.approvedQuantity;
        const receivedQty = targetItem.receivedQuantity;
        const usableQty = stockForm.usableQuantity;
        const defectiveQty = stockForm.defectiveQuantity;
        const missingFromDelivery = stockForm.missingQuantity; // Items not delivered

        // Check if there are any issues (missing from delivery OR defective items)
        const hasMissingFromDelivery = approvedQty !== receivedQty;
        const hasDefectiveItems = defectiveQty > 0;

        if (hasMissingFromDelivery || hasDefectiveItems) {
            // There are issues - mark as partial
            newStatus = "partial";
        } else if (usableQty === receivedQty && receivedQty === approvedQty) {
            // Perfect scenario: all approved items received and all are usable
            newStatus = "closed";
        } else {
            // Fallback
            newStatus = "partial";
        }

        // Update the order items list with new status and quantities
        setOrderItems(prevItems =>
            prevItems.map(orderItem =>
                orderItem.id === targetItemId
                    ? {
                        ...orderItem,
                        usableQuantity: usableQty,
                        defectiveQuantity: defectiveQty,
                        missingQuantity: missingFromDelivery,
                        itemOrderStatus: newStatus
                    }
                    : orderItem
            )
        );

        // Logic to add stock item to the actual inventory
        // In a real app, this would likely be an API call
        console.log(`Item ${targetItem.itemName} status changed to: ${newStatus}`);
        console.log(`Details: Approved: ${approvedQty}, Received: ${receivedQty}, Usable: ${usableQty}, Defective: ${defectiveQty}, Missing: ${missingFromDelivery}`);

        closeModal();
    };

    return (
        <>
            <div className="modal-heading">
                <h1 className="modal-title">Edit Order</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* Edit Order Form */}
            <div className="modal-content edit">
                <form className="edit-form">
                    <div className="form-row">
                        {/* Reference Number */}
                        <div className="form-group">
                            <label>Reference Number</label>
                            <input disabled
                                type="text"
                                value={formData.refNo}
                            />
                            <p className="edit-error-message"></p>
                        </div>

                        {/* Order Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select disabled
                                className={formErrors?.orderStatus ? "invalid-input" : ""}
                                value={formData.orderStatus || ""}
                                onChange={(e) => handleChange("orderStatus", e.target.value)}
                            >
                                <option value="" disabled>Select status...</option>
                                <option value="pending">Pending</option>
                                <option value="adjusted">Adjusted</option>
                                <option value="received">Received</option>
                                <option value="closed">Closed</option>
                                <option value="partial">Partial</option>
                            </select>
                            <p className="edit-error-message">{formErrors?.orderStatus}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Department Name */}
                        <div className="form-group">
                            <label>Department Name</label>
                            <input disabled
                                className={formErrors?.departmentName ? "invalid-input" : ""}
                                type="text"
                                value={formData.departmentName}
                                onChange={(e) => handleChange("departmentName", e.target.value)}
                                placeholder="Enter department name here..."
                            />
                        </div>

                        {/* Date Approved */}
                        <div className="form-group">
                            <label>Date Approved</label>
                            <input disabled
                                className={formErrors?.dateApproved ? "invalid-input" : ""}
                                type="date"
                                value={formData.dateApproved}
                                max={new Date().toISOString().split("T")[0]}
                                onChange={(e) => handleChange("dateApproved", e.target.value)}
                            />
                            <p className="edit-error-message"></p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Supplier Name */}
                        <div className="form-group">
                            <label>Supplier Name</label>
                            <input disabled
                                className={formErrors?.supplierName ? "invalid-input" : ""}
                                type="text"
                                value={formData.supplierName}
                                onChange={(e) => handleChange("supplierName", e.target.value)}
                                placeholder="Enter supplier name here..."
                            />
                        </div>

                        {/* Supplier Contact */}
                        <div className="form-group">
                            <label>Supplier's Contact No.</label>
                            <input disabled
                                className={formErrors?.supplierContact ? "invalid-input" : ""}
                                type="text"
                                value={formData.supplierContact}
                                onChange={(e) => {
                                    // Only allow numbers, hyphens, and spaces
                                    const value = e.target.value.replace(/[^0-9]/g, "");
                                    handleChange("supplierContact", value);
                                }}
                                placeholder="Enter contact number here..."
                                inputMode="tel"
                                pattern="[0-9]*"
                                maxLength={11}
                            />
                            <p className="edit-error-message">{formErrors?.supplierContact}</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-group">
                        <label>Remarks</label>
                        <textarea
                            className={`order ${formErrors?.remarks ? "invalid-input" : ""}`}
                            value={formData.remarks || ""}
                            onChange={(e) => handleChange("remarks", e.target.value)}
                            placeholder="Enter order remarks here..."
                        >
                        </textarea>
                        <p className="edit-error-message">{formErrors?.remarks}</p>
                    </div>
                </form>
            </div>

            <div className="modal-actions">
                <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={!isFormDirty}>
                    <i className="ri-save-3-line" /> Update
                </button>
            </div>

            {/* Order Items */}
            <div className="details-header">
                <p className="details-title">Item/s</p>
            </div>

            {/* Table */}
            <div className="modal-table-wrapper">
                <div className="modal-table-container">
                    <table className="modal-table">
                        <thead className="modal-table-heading">
                            <tr>
                                <th>Item Name</th>
                                <th>Approved <br />Quantity</th>
                                <th>Received <br />Quantity</th>
                                <th>Unit Cost</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="modal-table-body">
                            {orderItems.length > 0 ? (
                                orderItems.filter(itemOrder => itemOrder.isApproved)
                                    .map((orderItem, index) => {
                                        const useEstimated = ["pending", "adjusted"].includes(orderItem.itemOrderStatus.toLowerCase());
                                        const unitCost = useEstimated ? orderItem.estimatedUnitCost || 0 : orderItem.actualUnitCost || 0;
                                        const quantity = orderItem.approvedQuantity || 0;
                                        const totalAmount = unitCost * quantity;

                                        return (
                                            <tr key={index}>
                                                <td>{orderItem.itemName}</td>
                                                <td>{orderItem.approvedQuantity} {orderItem.unitMeasure}</td>
                                                <td>{orderItem.receivedQuantity} {orderItem.unitMeasure}</td>
                                                <td>₱{unitCost.toFixed(2)}</td>
                                                <td>₱{totalAmount.toFixed(2)}</td>
                                                <td className="table-status">
                                                    <span className={`chip ${orderItem.itemOrderStatus}`}>
                                                        {formatStatus(orderItem.itemOrderStatus)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <ActionButtons
                                                        onEdit={() => openModal("edit-itemOrder", orderItem)}
                                                        onAddStock={() => openModal("add-to-stock", orderItem)}
                                                        disableEdit={["closed", "partial"].includes(orderItem.itemOrderStatus)}
                                                        disableAddStock={["pending", "adjusted", "closed"].includes(orderItem.itemOrderStatus)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="no-data">No items found.</td>
                                </tr>
                            )}

                            {/* Total Amount Row */}
                            {orderItems.filter(itemOrder => itemOrder.isApproved).length > 0 && (
                                <tr className="table-total-row">
                                    <td colSpan={3}></td>
                                    <td style={{ textAlign: "center" }}>Total Amount</td>
                                    <td style={{ fontWeight: "bold" }}>
                                        ₱
                                        {orderItems.filter(itemOrder => itemOrder.isApproved).reduce((sum, itemOrder) => {
                                            const useEstimated = ["pending", "adjusted"].includes(itemOrder.itemOrderStatus.toLowerCase());
                                            const unitCost = useEstimated ? itemOrder.estimatedUnitCost || 0 : itemOrder.actualUnitCost || 0;
                                            const quantity = itemOrder.approvedQuantity || 0;
                                            return sum + unitCost * quantity;
                                        }, 0)
                                            .toFixed(2)}
                                    </td>
                                    <td colSpan={2}></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dynamic Modal Manager */}
            <ModalManager
                isOpen={isModalOpen}
                onClose={closeModal}
                modalContent={modalContent}
            />
        </>
    );
}