"use client";

import React, { useState } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import { showStockDeleteConfirmation, showStockDeletedSuccess } from "@/utils/sweetAlert";

import AddStockModal from "./addStockModal";
import ViewStockModal from "./viewStockModal";
import EditStockModal from "./editStockModal";
import { StockForm } from "./addStockModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/pagination.css"

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
            id: "categories",
            title: "Categories",
            type: "checkbox",
            options: [
                { id: "consumables", label: "Consumables" },
                { id: "mach-equip", label: "Machine & Equipments" }
            ]
        },
        {
            id: "status",
            title: "Status",
            type: "checkbox",
            options: [
                { id: "available", label: "Available" },
                { id: "out-of-stock", label: "Out of Stock" },
                { id: "maintenance", label: "Under Maintenance" },
                { id: "low-stock", label: "Low Stock" },
                { id: "expired", label: "Expired" }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "name", label: "Item Name" },
                { id: "quantity", label: "Item Quantity" }
            ],
            defaultValue: "name"
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
        if (filterValues.status && filterValues.status.length > 0) {
            newData = newData.filter(item => filterValues.status.includes(item.status));
        }

        // Sort by name or quantity
        if (filterValues.sortBy === "name") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.name.localeCompare(b.name) * sortOrder;
            });
        } else if (filterValues.sortBy === "quantity") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.quantity - b.quantity) * sortOrder;
            });
        }

        setFilteredData(newData);
    };

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
                handleDeleteStock(rowData);
                return;
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

    // Handle add stocks
    const handleAddStock = (stockForms: StockForm[]) => {
        console.log("Saving forms:", stockForms);
        // Logic to add multiple stock items to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle edit stocks
    const handleEditStock = (updatedItem: any) => {
        console.log("Updating item:", updatedItem);
        // Logic to update the item in the data
        // In a real app, this would likely be an API call
        closeModal();
    };

   // Handle delete stocks
        const handleDeleteStock = async (rowData: any) => {
            const result = await showStockDeleteConfirmation(rowData.name);
    
            if (result.isConfirmed) {
                await showStockDeletedSuccess();
                console.log("Deleted row with id:", rowData.id);
                // Logic to delete the item from the data
                // In a real app, this would likely be an API call
            }
        };

    return (
        <div className="card">
            <h1 className="title">Stock Management</h1>

            {/* Search Engine and Status Filters */}
            <div className="elements">
                <div className="entries">
                    <div className="search">
                        <i className="ri-search-line" />
                        <input type="text" placeholder="Search here..." />
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
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {filteredData.map(item => (
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
                                            <ActionButtons
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

        </div>
    );
}