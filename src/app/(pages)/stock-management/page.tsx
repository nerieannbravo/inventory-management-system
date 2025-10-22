"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";
import { showEditError } from "@/utils/sweetAlert";
// import Loading from "@/components/loading";

import AddStockModal, { StockForm } from "./addStockModal";
import ViewStockModal from "./viewStockModal";
import EditStockModal from "./editStockModal";
import { StockReportPreviewModal } from "./stockReportPDF";

import "@/styles/filters.css";
import "@/styles/tables.css";
import "@/styles/chips.css";
import "@/styles/loading.css";

const hardcodedData = [
    {
        id: 1,
        itemName: "Bus Unit",
        currentStock: 50,
        unitMeasure: "unit",
        category: "Bus",
        status: "available",
        reorderLevel: 0,
    },
    {
        id: 2,
        itemName: "Example Item B",
        currentStock: 0,
        unitMeasure: "pcs",
        category: "Consumable",
        status: "out-of-stock",
        reorderLevel: 5,
    },
    {
        id: 3,
        itemName: "Example Item C",
        currentStock: 6,
        unitMeasure: "pcs",
        category: "Consumable",
        status: "low-stock",
        reorderLevel: 8,
    },
    {
        id: 4,
        itemName: "Example Item D",
        currentStock: 20,
        unitMeasure: "pcs",
        category: "Equipment",
        status: "maintenance",
        reorderLevel: 8,
    },
    {
        id: 5,
        itemName: "Example Item E",
        currentStock: 16,
        unitMeasure: "pcs",
        category: "Tool",
        status: "available",
        reorderLevel: 3,
    },
    {
        id: 6,
        itemName: "Example Item F",
        currentStock: 30,
        unitMeasure: "kg",
        category: "Consumable",
        status: "expired",
        reorderLevel: 12,
    },
    {
        id: 7,
        itemName: "Example Item G",
        currentStock: 5,
        unitMeasure: "pcs",
        category: "Machine",
        status: "in-use",
        reorderLevel: 15,
    },
];

export default function StocksManagement() {
    // Modal state
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<any>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // default number of rows per page

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [filterValues, setFilterValues] = useState<Record<string, any>>({});

    // PDF Report state
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [reportTitle, setReportTitle] = useState("Stock Management Report");

    // Temporary filter state, remove if not being used anymore
    const [filteredData, setFilteredData] = useState(hardcodedData);

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
        // {
        //     id: "category",
        //     title: "Category",
        //     type: "checkbox",
        //     options: [
        //         { id: "consumable", label: "Consumable" },
        //         { id: "tool", label: "Tool" },
        //         { id: "machine", label: "Machine" },
        //         { id: "equipment", label: "Equipment" }
        //     ]
        // },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "itemName", label: "Item Name" },
                { id: "currentStock", label: "Current Stock" },
                { id: "reorderLevel", label: "Reorder Level" }
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

        // Keep a copy of the raw filters in state for other usages (report title check, etc.)
        setFilterValues(filterValues);

        let newData = [...hardcodedData];

        // normalizes a value to a simple comparable token (lowercase, remove non-alphanumerics)
        const normalize = (value: any) =>
            (value === null || value === undefined) ? "" : String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

        // Filter by status if selected
        if (filterValues.status && filterValues.status.length > 0) {
            const normalizedFilters = filterValues.status.map((filter: string) => normalize(filter));
            newData = newData.filter(item => normalizedFilters.includes(normalize(item.status)));
        }

        // Filter by category if selected
        // if (filterValues.category && filterValues.category.length > 0) {
        //     const normalizedFilters = filterValues.category.map((filter: string) => normalize(filter));
        //     newData = newData.filter(item => normalizedFilters.includes(normalize(item.category)));
        // }

        // Sorting
        const orderMultiplier = filterValues.order === "desc" ? -1 : 1;
        if (filterValues.sortBy === "itemName") {
            newData.sort((a, b) => a.itemName.localeCompare(b.itemName) * orderMultiplier);
        } else if (filterValues.sortBy === "currentStock") {
            newData.sort((a, b) => (a.currentStock - b.currentStock) * orderMultiplier);
        } else if (filterValues.sortBy === "reorderLevel") {
            newData.sort((a, b) => (a.reorderLevel - b.reorderLevel) * orderMultiplier);
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
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
            case "in-use":
                return "In Use";
            default:
                return status;
        }
    };

    // for the modals of add, view, edit, and delete
    const openModal = (mode: "add-stock" | "view-stock" | "edit-stock", rowData?: any) => {
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
                if (rowData && (rowData.category === "Bus")) {
                    showEditError(rowData.item_name, "Editing stock for Bus items is not allowed.");

                    return;
                }
                content = <EditStockModal
                    item={rowData}
                    onSave={handleEditStock}
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

    // Handle generate report
    const handleGenerateReport = () => {
        // Check if any filters are applied. 
        // Modify this logic based on actual searching or filtering implementation.
        const hasFilters = filteredData.length !== hardcodedData.length;

        const title = hasFilters ? "Stock Management Report - Filtered" : "Stock Management Report";

        setReportTitle(title);
        setShowReportPreview(true);
    };

    // Handle close report
    const handleCloseReportPreview = () => {
        setShowReportPreview(false);
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
                    <button type="button" className="generate-btn" onClick={handleGenerateReport}>
                        <i className="ri-receipt-line" /> Generate Report
                    </button>

                    {/* Add Stocks Button */}
                    {/* <button className="main-btn" onClick={() => openModal("add-stock")}>
                        <i className="ri-add-line" /> Add Stocks
                    </button> */}
                </div>

                {/* Use when filtering with date range */}
                {/* <div className="filter-results">
                    Items from January 12, 2023 to December 12, 2024
                </div> */}

                {/* Table */}
                <div className="table-wrapper">
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-heading">
                                <tr>
                                    <th>Item Name</th>
                                    <th>Current Stock</th>
                                    <th>Unit Measure</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Reorder Level</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="no-records">
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map(item => (
                                        <tr
                                            key={item.id}
                                            className={selectedIds.includes(item.id) ? "selected" : ""}
                                        >
                                            <td>{item.itemName}</td>
                                            <td>{item.currentStock}</td>
                                            <td>{item.unitMeasure}</td>
                                            <td>{item.category}</td>
                                            <td className="table-status">
                                                <span className={`chip ${item.status}`}>
                                                    {formatStatus(item.status)}
                                                </span>
                                            </td>
                                            <td>{item.reorderLevel}</td>
                                            <td>
                                                <ActionButtons
                                                    onView={() => openModal("view-stock", item)}
                                                    onEdit={() => openModal("edit-stock", item)}
                                                    disableEdit={item.category === "Bus"}
                                                />
                                            </td>
                                        </tr>
                                    )))}
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

            {/* PDF Report Modal */}
            <StockReportPreviewModal
                isOpen={showReportPreview}
                onClose={handleCloseReportPreview}
                stockData={filteredData}
                reportTitle={reportTitle}
            />

        </div>
    );
}