"use client";

import React, { useState } from "react";
import MoreMenu from "@/components/moreMenu";
import ModalManager from "@/components/modalManager";
import Snackbar from "@/components/snackbar";
import AddStockModal from "./addStockModal";
import ViewStockModal from "./viewStockModal";
import EditStockModal from "./editStockModal";
import DeleteStockModal from "./deleteStockModal";
import { StockForm } from "./addStockModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/pagination.css"
import "@/styles/snackbar.css"

const hardcodedData = [
    {
        id: 1,
        name: "Example Item A",
        quantity: 50,
        unit: "kg",
        status: "available",
        reorder: 10,
    },
    {
        id: 2,
        name: "Example Item B",
        quantity: 0,
        unit: "pcs",
        status: "out-of-stock",
        reorder: 5,
    },
    {
        id: 3,
        name: "Example Item C",
        quantity: 20,
        unit: "pcs",
        status: "low-stock",
        reorder: 8,
    },
    {
        id: 4,
        name: "Example Item D",
        quantity: 20,
        unit: "pcs",
        status: "maintenance",
        reorder: 8,
    },
    {
        id: 5,
        name: "Example Item E",
        quantity: 16,
        unit: "pcs",
        status: "expired",
        reorder: 3,
    },
];

export default function StocksManagement() {
    // for modal
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<any>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarType, setSnackbarType] = useState<"success" | "error" | "info" | "warning">("info");


    // for items status formatting
    const formatStatus = (status: string) => {
        switch (status) {
            case "available":
                return "Available";
            case "out-of-stock":
                return "Out of Stock";
            case "low-stock":
                return "Low Stock";
            case "maintenance":
                return "Under Maintenance";
            case "expired":
                return "Expired";
            default:
                return status;
        }
    };

    // for the modals of add, view, edit, and delete
    const openModal = (mode: "add-stock" | "view-stock" | "edit-stock" | "delete-stock", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-stock":
                content = <AddStockModal
                    onSave={handleAddStock}
                    onClose={closeModal}
                />;
                break;
            case "view-stock":
                content = <ViewStockModal
                    item={rowData}
                    formatStatus={formatStatus}
                    onClose={closeModal}
                />;
                break;
            case "edit-stock":
                content = <EditStockModal
                    item={rowData}
                    onSave={handleEditStock}
                    onClose={closeModal}
                />;
                break;
            case "delete-stock":
                content = <DeleteStockModal
                    item={rowData}
                    onConfirm={handleDeleteConfirm}
                    onCancel={closeModal}
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

    // snackbar
    const showSnackbar = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarVisible(true);
    };

    // Handle add stocks
    const handleAddStock = (stockForms: StockForm[]) => {
        console.log("Saving forms:", stockForms);
        // Logic to add multiple stock items to the data
        // In a real app, this would likely be an API call

        const itemCount = stockForms.length;
        const message = itemCount === 1
            ? "Stock item added successfully!"
            : `${itemCount} stock items added successfully!`;

        showSnackbar(message, "success");
        closeModal();
    };

    // Handle edit stocks
    const handleEditStock = (updatedItem: any) => {
        console.log("Updating item:", updatedItem);
        // Logic to update the item in the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Hadle delete stocks
    const handleDeleteConfirm = () => {
        console.log("Deleted row with id:", activeRow?.id);
        // Logic to delete the item from the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    return (
        <div className="card">
            <h1 className="title">Stock Management</h1>

            {/* Search Engine and Status Filters */}
            <div className="elements">
                <div className="entries">
                    <div className="search">
                        <input type="text" placeholder="Search" />
                        <button>
                            <i className="ri-search-line"></i>
                        </button>
                    </div>

                    {/* Filter Button */}
                    <div className="filter">
                        <button className="filter-btn">
                            <i className="ri-equalizer-line" /> Filter
                        </button>
                    </div>

                    {/* Generate Report Button */}
                    <button type="button" className="generate-btn">
                        <i className="ri-receipt-line" /> Generate Report
                    </button>

                    {/* Add Stocks Button */}
                    <button className="main-btn" onClick={() => openModal("add-stock")}>
                        <i className="ri-add-line" /> Add Stocks
                    </button>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-heading">
                                <tr>
                                    <th>Item Name</th>
                                    <th>Current Stock</th>
                                    <th>Unit Measure</th>
                                    <th>Status</th>
                                    <th>Reorder Level</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {hardcodedData.map(item => (
                                    <tr
                                        key={item.id}
                                        className={selectedIds.includes(item.id) ? "selected" : ""}
                                    >
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.unit}</td>
                                        <td>
                                            <span className={`chip ${item.status}`}>
                                                {formatStatus(item.status)}
                                            </span>
                                        </td>
                                        <td>{item.reorder}</td>
                                        <td>
                                            <MoreMenu
                                                onView={() => openModal("view-stock", item)}
                                                onEdit={() => openModal("edit-stock", item)}
                                                onDelete={() => openModal("delete-stock", item)}
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