"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";

import AddStockMaintenanceModal, { StockMaintenanceForm } from "./addStockMaintenanceModal";
import ViewStockMaintenanceModal from "./viewStockMaintenanceModal";
import EditStockMaintenanceModal from "./editStockMaintenanceModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"

const hardcodedData = [
    {
        id: 1,
        sku: "ME-001",
        itemName: "Lathe Machine",
        stockMaintenanceType: "Preventive",
        stockMaintenanceDate: "2024-05-10",
        stockMaintenanceStatus: "completed",
    },
    {
        id: 2,
        sku: "EQ-002",
        itemName: "Welding Machine",
        stockMaintenanceType: "Corrective",
        stockMaintenanceDate: "2024-06-01",
        stockMaintenanceStatus: "pending",
    },
    {
        id: 3,
        sku: "ME-003",
        itemName: "Drill Press",
        stockMaintenanceType: "Preventive",
        stockMaintenanceDate: "2024-05-20",
        stockMaintenanceStatus: "completed",
    },
    {
        id: 4,
        sku: "EQ-004",
        itemName: "Compressor",
        stockMaintenanceType: "Corrective",
        stockMaintenanceDate: "2024-06-05",
        stockMaintenanceStatus: "pending",
    },
];

export default function StockMaintenance() {
    // for modal
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<any>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // For filtering
    const [filteredData, setFilteredData] = useState(hardcodedData);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // default number of rows per page

    // Calculate paginated data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, pageSize]);

    // Calculate total pages
    const totalPages = Math.ceil(filteredData.length / pageSize);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle page size change
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    // Filter sections
    const filterSections: FilterSection[] = [
        {
            id: "dateRange",
            title: "Date Range",
            type: "dateRange",
            defaultValue: { from: "", to: "" }
        },
        {
            id: "stockMaintenanceStatus",
            title: "Status",
            type: "checkbox",
            options: [
                { id: "completed", label: "Completed" },
                { id: "pending", label: "Pending" }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "stockMaintenanceDate", label: "Maintenance Date" },
                { id: "sku", label: "SKU" },
                { id: "itemName", label: "Item Name" }
            ],
            defaultValue: "stockMaintenanceDate"
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
        if (filterValues.stockMaintenanceStatus && filterValues.stockMaintenanceStatus.length > 0) {
            newData = newData.filter(item => filterValues.stockMaintenanceStatus.includes(item.stockMaintenanceStatus));
        }

        // Sort by plate number or date
        if (filterValues.sortBy === "sku") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.sku.localeCompare(b.sku) * sortOrder;
            });
        } else if (filterValues.sortBy === "stockMaintenanceDate") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.stockMaintenanceDate ?? "").localeCompare(b.stockMaintenanceDate ?? "") * sortOrder;
            });
        } else if (filterValues.sortBy === "itemName") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.itemName ?? "").localeCompare(b.itemName ?? "") * sortOrder;
            });
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // for order status formatting
    function formatStatus(stockMaintenanceStatus: string) {
        switch (stockMaintenanceStatus) {
            case "completed":
                return "Completed";
            case "pending":
                return "Pending";
            default:
                return stockMaintenanceStatus;
        }
    }

    // for the modals of add, view, and edit
    const openModal = (mode: "add-stock-maintenance" | "view-stock-maintenance" | "edit-stock-maintenance", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-stock-maintenance":
                content = <AddStockMaintenanceModal
                    onSave={handleAddStockMaintenance}
                    onClose={closeModal}
                />;
                break;
            case "view-stock-maintenance":
                content = <ViewStockMaintenanceModal
                    item={rowData}
                    formatStatus={formatStatus}
                    onClose={closeModal}
                />;
                break;
            case "edit-stock-maintenance":
                content = <EditStockMaintenanceModal
                    item={rowData}
                    onSave={handleEditStockMaintenance}
                    onClose={closeModal}
                />;
                break;
            // case "delete-order":
            //     handleDeleteOrder(rowData);
            //     return;
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

    // Handle add stock maintenance
    const handleAddStockMaintenance = (stockMaintenanceForm: StockMaintenanceForm) => {
        console.log("Saving form:", stockMaintenanceForm);
        // Logic to add stock to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle edit stock maintenance
    const handleEditStockMaintenance = (updatedItem: any) => {
        console.log("Updating item:", updatedItem);
        // Logic to update the item in the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    return (
        <div className="card">
            <h1 className="title">Machine & Equipment Maintenance</h1>

            {/* Search Engine and Filters */}
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

                    {/* Add Bus Maintenance Button */}
                    <button className="main-btn" onClick={() => openModal("add-stock-maintenance")}>
                        <i className="ri-add-line" /> Add Maintenance
                    </button>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-heading">
                                <tr>
                                    <th>SKU</th>
                                    <th>Item Name</th>
                                    <th>Maintenance Type</th>
                                    <th>Status</th>
                                    <th>Maintenance Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {paginatedData.map(item => (
                                    <tr
                                        key={item.id}
                                        className={selectedIds.includes(item.id) ? "selected" : ""}
                                    >
                                        <td>{item.sku}</td>
                                        <td>{item.itemName}</td>
                                        <td>{item.stockMaintenanceType}</td>
                                        <td className="table-status">
                                            <span className={`chip ${item.stockMaintenanceStatus}`}>
                                                {formatStatus(item.stockMaintenanceStatus)}
                                            </span>
                                        </td>
                                        <td>{item.stockMaintenanceDate}</td>
                                        <td>
                                            <ActionButtons
                                                onView={() => openModal("view-stock-maintenance", item)}
                                                onEdit={() => openModal("edit-stock-maintenance", item)}
                                                disableEdit={item.stockMaintenanceStatus !== "pending" && item.stockMaintenanceStatus !== "approved"}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={paginatedData.length}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
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