"use client";

import React, { useState } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import Snackbar from "@/components/snackbar";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import ConfirmationPopup from "@/components/confirmationPopup";

import AddOrderModal from "./addOrderModal";
import ViewOrderModal from "./viewOrderModal";
import EditOrderModal from "./editOrderModal";
import { OrderForm } from "./addOrderModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/pagination.css"
import "@/styles/snackbar.css"

const hardcodedData = [
    {
        id: 1,
        itemName: "Example Order Item A",
        ordQuantity: 12,
        ordReqDate: "3/12/2025",
        ordStatus: "completed",
    },
    {
        id: 2,
        itemName: "Example Order Item B",
        ordQuantity: 10,
        ordReqDate: "5/19/2025",
        ordStatus: "pending",
    },
    {
        id: 3,
        itemName: "Example Order Item C",
        ordQuantity: 72,
        ordReqDate: "4/28/2025",
        ordStatus: "completed",
    },
    {
        id: 4,
        itemName: "Example Order Item D",
        ordQuantity: 43,
        ordReqDate: "5/11/2025",
        ordStatus: "approved",
    },
];

export default function OrderManagement() {
    // for modal
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<any>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // for delete confirmation popup
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    // for snackbar
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarType, setSnackbarType] = useState<"success" | "error" | "info" | "warning">("info");

    // For filtering
    const [filteredData, setFilteredData] = useState(hardcodedData);

    // Filter sections
    const filterSections: FilterSection[] = [
        {
            id: "dateRange",
            title: "Date Range",
            type: "dateRange",
            defaultValue: { from: "", to: "" }
        },
        {
            id: "ordStatus",
            title: "Status",
            type: "checkbox",
            options: [
                { id: "completed", label: "Completed" },
                { id: "approved", label: "Approved" },
                { id: "pending", label: "Pending" }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "itemName", label: "Item Name" },
                { id: "ordQuantity", label: "Quantity" },
                { id: "ordReqDate", label: "Request Date" }
            ],
            defaultValue: "itemName"
        },
        {
            id: "order",
            title: "Order",
            type: "radio",
            options: [
                { id: "asc", label: "Ascending" },
                { id: "desc", label: "Descending" }
            ],
            defaultValue: "asc"
        }
    ];

    // Handle filter application
    const handleApplyFilters = (filterValues: Record<string, any>) => {
        console.log("Applied filters:", filterValues);

        // In a real application, you would filter your data based on these values
        // For now, we'll just log them and keep the original data

        // Example implementation for filtering and sorting:
        let newData = [...hardcodedData];

        // Filter by status if selected
        if (filterValues.ordStatus && filterValues.ordStatus.length > 0) {
            newData = newData.filter(item => filterValues.ordStatus.includes(item.ordStatus));
        }

        // Sort by itemName or date
        if (filterValues.sortBy === "itemName") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.itemName.localeCompare(b.itemName) * sortOrder;
            });
        } else if (filterValues.sortBy === "ordReqDate") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.ordReqDate.localeCompare(b.ordReqDate) * sortOrder;
            });
        } else if (filterValues.sortBy === "ordQuantity") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.ordQuantity - b.ordQuantity) * sortOrder;
            });
        }

        setFilteredData(newData);
    };

    // for order status formatting
    function formatStatus(ordStatus: string) {
        switch (ordStatus) {
            case "completed":
                return "Completed";
            case "approved":
                return "Approved";
            case "pending":
                return "Pending";
            default:
                return ordStatus;
        }
    }

    // for the modals of add, view, edit, and delete
    const openModal = (mode: "add-order" | "view-order" | "edit-order" | "delete-order", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-order":
                content = <AddOrderModal
                    onSave={handleAddOrder}
                    onClose={closeModal}
                />;
                break;
            case "view-order":
                content = <ViewOrderModal
                    item={rowData}
                    formatStatus={formatStatus}
                    onClose={closeModal}
                />;
                break;
            case "edit-order":
                content = <EditOrderModal
                    item={rowData}
                    onSave={handleEditOrder}
                    onClose={closeModal}
                />;
                break;
            case "delete-order":
                // Instead of rendering DeleteOrderModal directly, just store the active row
                // and show the confirmation popup
                setActiveRow(rowData);
                setShowDeleteConfirmation(true);
                return; // Return early to avoid opening the modal
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

    // snackbar
    const showSnackbar = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarVisible(true);
    };

    // Handle add order
    const handleAddOrder = (orderForm: OrderForm) => {
        console.log("Saving form:", orderForm);
        // Logic to add order to the data
        // In a real app, this would likely be an API call
        showSnackbar("Order added successfully!", "success");
        closeModal();
    };

    // Handle edit order
    const handleEditOrder = (updatedItem: any) => {
        console.log("Updating item:", updatedItem);
        // Logic to update the item in the data
        // In a real app, this would likely be an API call
        showSnackbar(`Order detail has been updated.`, "success");
        closeModal();
    };

    // Hadle delete order
    const handleDeleteConfirm = () => {
        console.log("Deleted row with id:", activeRow?.id);
        // Logic to delete the item from the data
        // In a real app, this would likely be an API call
        setShowDeleteConfirmation(false);
        showSnackbar(`Order for ${activeRow.itemName} has been deleted.`, "success");
    };

    return (
        <div className="card">
            <h1 className="title">Order Management</h1>

            {/* Search Engine and Filters */}
            <div className="elements">
                <div className="entries">
                    <div className="search">
                        <input type="text" placeholder="Search" />
                        <button>
                            <i className="ri-search-line"></i>
                        </button>
                    </div>

                    {/* Filter Button with Dropdown */}
                    <div className="filter">
                        <FilterDropdown
                            sections={filterSections}
                            onApply={handleApplyFilters}
                        />
                    </div>

                    {/* Generate Report Button */}
                    <button type="button" className="generate-btn">
                        <i className="ri-receipt-line" /> Generate Report
                    </button>

                    {/* Add Order Button */}
                    <button className="main-btn" onClick={() => openModal("add-order")}>
                        <i className="ri-add-line" /> Add Order
                    </button>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-heading">
                                <tr>
                                    <th>Item Name</th>
                                    <th>Quantity</th>
                                    <th>Request Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {filteredData.map(item => (
                                    <tr
                                        key={item.id}
                                        className={selectedIds.includes(item.id) ? "selected" : ""}
                                    >
                                        <td>{item.itemName}</td>
                                        <td>{item.ordQuantity}</td>
                                        <td>{item.ordReqDate}</td>
                                        <td>
                                            <span className={`chip ${item.ordStatus}`}>
                                                {formatStatus(item.ordStatus)}
                                            </span>
                                        </td>
                                        <td>
                                            <ActionButtons
                                                onView={() => openModal("view-order", item)}
                                                onEdit={() => openModal("edit-order", item)}
                                                onDelete={() => openModal("delete-order", item)}
                                                disableEdit={item.ordStatus === "pending"}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button className="page-btn">
                        <i className="ri-arrow-left-s-line"></i>
                    </button>
                    <button className="page-btn active">1</button>
                    <button className="page-btn">2</button>
                    <button className="page-btn">3</button>
                    <button className="page-btn">4</button>
                    <button className="page-btn">5</button>
                    <button className="page-btn">
                        <i className="ri-arrow-right-s-line"></i>
                    </button>
                </div>
            </div>

            {/* Dynamic Modal Manager */}
            <ModalManager
                isOpen={isModalOpen}
                onClose={closeModal}
                modalContent={modalContent}
            />

            {/* Delete Confirmation */}
            <ConfirmationPopup
                isOpen={showDeleteConfirmation}
                onClose={() => setShowDeleteConfirmation(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the order for ${activeRow?.itemName}? You will not be able to undo this.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="error"
            />

            {/* Snackbar */}
            <Snackbar
                message={snackbarMessage}
                isVisible={snackbarVisible}
                onClose={() => setSnackbarVisible(false)}
                type={snackbarType}
            />
        </div>
    );
}