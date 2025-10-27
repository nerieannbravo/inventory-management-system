import { useState } from "react";

import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";

import ViewItemOrderModal from "./item-order/viewItemOrderModal";

import "@/styles/forms.css";


interface ViewOrderModalProps {
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
            approvedQuantity: number;
            receivedQuantity: number;
            unitMeasure: string;
            estimatedUnitCost: number;
            actualUnitCost: number;
            itemOrderStatus: string;
        }[];
        // Additional fields would be included in a real application
    };
    formatStatus: (status: string) => string;
    onClose: () => void;
}

export default function ViewOrderModal({ item, formatStatus, onClose }: ViewOrderModalProps) {
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<any>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // for the modals of add, view, and edit
    const openModal = (mode: "view-item-order", rowData?: any) => {
        let content;

        switch (mode) {
            case "view-item-order":
                content = <ViewItemOrderModal
                    item={rowData}
                    formatStatus={formatStatus}
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

    return (
        <>
            <button className="close-modal-btn view" onClick={onClose}>
                <i className="ri-close-line"></i>
            </button>

            <div className="modal-heading">
                <h1 className="modal-title">View Order</h1>
            </div>

            <div className="modal-content view">
                <div className="view-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Reference Number</label>
                            <p>{item.refNo}</p>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <p>{formatStatus(item.orderStatus)}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Department Name</label>
                            <p>{item.departmentName}</p>
                        </div>

                        <div className="form-group">
                            <label>Date Approved</label>
                            <p>{item.dateApproved}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Supplier Name</label>
                            <p>{item.supplierName}</p>
                        </div>

                        <div className="form-group">
                            <label>Supplier's Contact No.</label>
                            <p>{item.supplierContact}</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Remarks</label>
                        <p>{item.remarks || "N/A"}</p>
                    </div>
                </div>
            </div>

            <div className="details-header">
                <p className="details-title">Item/s</p>
            </div>

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
                            {item.items && item.items.length > 0 ? (
                                item.items.filter(itemOrder => itemOrder.isApproved)
                                    .map((itemOrder, index) => {
                                        const useEstimated = ["pending", "adjusted"].includes(itemOrder.itemOrderStatus.toLowerCase());
                                        const unitCost = useEstimated ? itemOrder.estimatedUnitCost || 0 : itemOrder.actualUnitCost || 0;
                                        const quantity = itemOrder.approvedQuantity || 0;
                                        const totalAmount = unitCost * quantity;

                                        return (
                                            <tr key={index}>
                                                <td>{itemOrder.itemName}</td>
                                                <td>{itemOrder.approvedQuantity} {itemOrder.unitMeasure}</td>
                                                <td>{itemOrder.receivedQuantity} {itemOrder.unitMeasure}</td>
                                                <td>₱{unitCost.toFixed(2)}</td>
                                                <td>₱{totalAmount.toFixed(2)}</td>
                                                <td className="table-status">
                                                    <span className={`chip ${itemOrder.itemOrderStatus}`}>
                                                        {formatStatus(itemOrder.itemOrderStatus)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <ActionButtons
                                                        onView={() => openModal("view-item-order", itemOrder)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", color: "#777" }}>
                                        No items found.
                                    </td>
                                </tr>
                            )}

                            {/* Total Amount Row */}
                            {item.items && item.items.filter(itemOrder => itemOrder.isApproved).length > 0 && (
                                <tr className="table-total-row">
                                    <td colSpan={3}></td>
                                    <td style={{ textAlign: "center" }}>Total Amount</td>
                                    <td style={{ fontWeight: "bold" }}>
                                        ₱
                                        {item.items.filter(itemOrder => itemOrder.isApproved).reduce((sum, itemOrder) => {
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
