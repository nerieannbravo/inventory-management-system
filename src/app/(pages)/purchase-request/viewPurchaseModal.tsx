import React from "react";
import "@/styles/forms.css";

interface ViewPurchaseModalProps {
    purchaseRequest: any; // The purchase request data from the table
    onClose: () => void;
}

export default function ViewPurchaseModal({ purchaseRequest, onClose }: ViewPurchaseModalProps) {
    // Helper function to format status
    const formatStatus = (status: string) => {
        switch (status) {
            case "pending":
                return "Pending";
            case "approved":
                return "Approved";
            case "rejected":
                return "Rejected";
            default:
                return status;
        }
    };

    // Helper function to format request type
    const formatRequestType = (type: string) => {
        switch (type) {
            case "normal":
                return "Normal";
            case "urgent":
                return "Urgent";
            default:
                return type;
        }
    };

    // Calculate total price
    const totalPrice = purchaseRequest.unitPrice * purchaseRequest.quantity;

    return (
        <>
            <button className="close-modal-btn view" onClick={onClose}>
                <i className="ri-close-line"></i>
            </button>

            <div className="modal-heading">
                <h1 className="modal-title">View Purchase Request</h1>
            </div>

            <div className="modal-content view">
                <div className="view-form">
                    <div className="form-group">
                        <label>Item Name</label>
                        <p>{purchaseRequest.itemName}</p>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Quantity</label>
                            <p>{purchaseRequest.quantity}</p>
                        </div>

                        <div className="form-group">
                            <label>Unit Measure</label>
                            <p>{purchaseRequest.unitMeasure || "pcs"}</p>
                        </div>

                        <div className="form-group">
                            <label>Request Type</label>
                            <p>{formatRequestType(purchaseRequest.requestType)}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Request Status</label>
                            <p>{formatStatus(purchaseRequest.requestStatus)}</p>
                        </div>

                        <div className="form-group">
                            <label>Vendor</label>
                            <p>{purchaseRequest.vendor}</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Request Purpose</label>
                        <p>{purchaseRequest.requestPurpose}</p>
                    </div>
                </div>
            </div>

            <p className="details-title">Supplier Details</p>
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
                        <td>{purchaseRequest.vendor}</td>
                        <td>₱{purchaseRequest.unitPrice.toFixed(2)}</td>
                        <td>2-5 days</td>
                        <td>{purchaseRequest.quantity}</td>
                        <td>₱{totalPrice.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}
