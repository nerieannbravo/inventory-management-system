"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";
// import Loading from "@/components/loading";

import AddStockDisposalModal, { StockDisposalForm } from "./addStockDisposalModal";
import ViewStockDisposalModal from "./viewStockDisposalModal";
import AddDisposalMethodModal, { DisposalMethodForm } from "../disposal-method/addDisposalMethodModal";
import { StockDisposalReportPreviewModal } from "./stockDisposalReportPDF";

import "@/styles/filters.css";
import "@/styles/tables.css";
import "@/styles/chips.css";
import "@/styles/loading.css";

const hardcodedData = [
    {
        id: 1,
        sku: "SKU-0001",
        itemName: "Fuel - Iveco",
        category: "Consumable",
        disposalMethod: "Sold",
        disposalDate: "October 1, 2023",
    },
    {
        id: 2,
        sku: "SKU-0002",
        itemName: "Welding Machine",
        category: "Machine",
        disposalMethod: "Donated",
        disposalDate: "October 5, 2023",
    },
];

export default function StockDisposal() {
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
    const [reportTitle, setReportTitle] = useState("Stock Disposal Report");

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
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "disposalDate", label: "Disposal Date" },
                { id: "sku", label: "SKU" },
                { id: "itemName", label: "Item Name" }
            ],
            defaultValue: "disposalDate"
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

        // Sorting
        const orderMultiplier = filterValues.order === "desc" ? -1 : 1;
        if (filterValues.sortBy === "disposalDate") {
            newData.sort((a, b) => a.disposalDate.localeCompare(b.disposalDate) * orderMultiplier);
        } else if (filterValues.sortBy === "sku") {
            newData.sort((a, b) => (a.sku ?? "").localeCompare(b.sku ?? "") * orderMultiplier);
        } else if (filterValues.sortBy === "itemName") {
            newData.sort((a, b) => (a.itemName ?? "").localeCompare(b.itemName ?? "") * orderMultiplier);
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // for the modals of add, view, and edit
    const openModal = (mode: "add-stock-disposal" | "view-stock-disposal" | "add-disposal-method", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-stock-disposal":
                content = <AddStockDisposalModal
                    onSave={handleAddStockDisposal}
                    onClose={closeModal}
                />;
                break;
            case "view-stock-disposal":
                content = <ViewStockDisposalModal
                    item={rowData}
                    onClose={closeModal}
                />;
                break;
            case "add-disposal-method":
                content = <AddDisposalMethodModal
                    onSave={handleAddDisposalMethod}
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

    // Handle add stock disposal
    const handleAddStockDisposal = (stockDisposalForm: StockDisposalForm) => {
        console.log("Saving form:", stockDisposalForm);
        // Logic to add stock disposal to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle add disposal method
    const handleAddDisposalMethod = (disposalMethodForm: DisposalMethodForm) => {
        console.log("Saving form:", disposalMethodForm);
        // Logic to add disposal method to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle generate report
    const handleGenerateReport = () => {
        // Check if any filters are applied. 
        // Modify this logic based on actual searching or filtering implementation.
        const hasFilters = filteredData.length !== hardcodedData.length;

        const title = hasFilters ? "Stock Disposal Report - Filtered" : "Stock Disposal Report";

        setReportTitle(title);
        setShowReportPreview(true);
    };

    // Handle close report
    const handleCloseReportPreview = () => {
        setShowReportPreview(false);
    };

    return (
        <div className="card">
            <h1 className="title">Stock Disposal</h1>

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

                    {/* Add Disposal Method Button */}
                    <button
                        type="button"
                        className="default-btn"
                        onClick={() => openModal("add-disposal-method")}
                    >
                        <i className="ri-apps-2-add-line" /> Add Method
                    </button>

                    {/* Generate Report Button */}
                    <button type="button" className="generate-btn" onClick={handleGenerateReport}>
                        <i className="ri-receipt-line" /> Generate Report
                    </button>

                    {/* Add Stock Disposal Button */}
                    <button className="main-btn" onClick={() => openModal("add-stock-disposal")}>
                        <i className="ri-add-line" /> Add Disposal
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
                                    <th>Category</th>
                                    <th>Disposal Method</th>
                                    <th>Disposal Date</th>
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
                                        <td>{item.category}</td>
                                        <td>{item.disposalMethod}</td>
                                        <td>{item.disposalDate}</td>
                                        <td>
                                            <ActionButtons
                                                onView={() => openModal("view-stock-disposal", item)}
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

            {/* Stock Disposal Report Preview Modal */}
            <StockDisposalReportPreviewModal
                isOpen={showReportPreview}
                onClose={handleCloseReportPreview}
                stockDisposalData={filteredData}
                reportTitle={reportTitle}
            />

        </div>
    );
}