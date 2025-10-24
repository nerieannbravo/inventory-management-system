"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";
// import Loading from "@/components/loading";

import AddBusDisposalModal, { BusDisposalForm } from "./addBusDisposalModal";
import ViewBusDisposalModal from "./viewBusDisposalModal";
import AddDisposalMethodModal, { DisposalMethodForm } from "../disposal-method/addDisposalMethodModal";
import { BusDisposalReportPreviewModal } from "./busDisposalReportPDF";

import "@/styles/filters.css";
import "@/styles/tables.css";
import "@/styles/chips.css";
import "@/styles/loading.css";

const hardcodedData = [
    {
        id: 1,
        bodyNumber: "BUS123",
        bodyBuilder: "Agila",
        busType: "Airconditioned",
        disposalMethod: "Sold",
        disposalDate: "January 15, 2023",
    },
    {
        id: 2,
        bodyNumber: "BUS456",
        bodyBuilder: "Hilltop",
        busType: "Ordinary",
        disposalMethod: "Scrapped",
        disposalDate: "August 22, 2022",
    },
];

export default function BusDisposal() {
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
    const [reportTitle, setReportTitle] = useState("Bus Disposal Report");

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
            id: "bodyBuilder",
            title: "Body Builder",
            type: "checkbox",
            options: [
                { id: "agila", label: "Agila" },
                { id: "hilltop", label: "Hilltop" },
                { id: "rbm", label: "RBM" },
                { id: "darj", label: "DARJ" },
            ],
        },
        {
            id: "busType",
            title: "Bus Type",
            type: "checkbox",
            options: [
                { id: "airconditioned", label: "Airconditioned" },
                { id: "ordinary", label: "Ordinary" },
            ],
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "disposalDate", label: "Disposal Date" },
                { id: "bodyNumber", label: "Body Number" },
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

        // normalizes a value to a simple comparable token (lowercase, remove non-alphanumerics)
        const normalize = (value: any) =>
            (value === null || value === undefined) ? "" : String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

        // Filter by bodyBuilder if selected
        if (filterValues.bodyBuilder && filterValues.bodyBuilder.length > 0) {
            const normalizedFilters = filterValues.bodyBuilder.map((filter: string) => normalize(filter));
            newData = newData.filter(item => normalizedFilters.includes(normalize(item.bodyBuilder)));
        }

        // Filter by busType if selected
        if (filterValues.busType && filterValues.busType.length > 0) {
            const normalizedFilters = filterValues.busType.map((filter: string) => normalize(filter));
            newData = newData.filter(item => normalizedFilters.includes(normalize(item.busType)));
        }

        // Sorting
        const orderMultiplier = filterValues.order === "desc" ? -1 : 1;
        if (filterValues.sortBy === "disposalDate") {
            newData.sort((a, b) => a.disposalDate.localeCompare(b.disposalDate) * orderMultiplier);
        } else if (filterValues.sortBy === "bodyNumber") {
            newData.sort((a, b) => (a.bodyNumber ?? "").localeCompare(b.bodyNumber ?? "") * orderMultiplier);
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // for the modals of add, view, and edit
    const openModal = (mode: "add-bus-disposal" | "view-bus-disposal" | "add-disposal-method", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-bus-disposal":
                content = <AddBusDisposalModal
                    onSave={handleAddBusDisposal}
                    onClose={closeModal}
                />;
                break;
            case "view-bus-disposal":
                content = <ViewBusDisposalModal
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

    // Handle add bus disposal
    const handleAddBusDisposal = (busDisposalForm: BusDisposalForm) => {
        console.log("Saving form:", busDisposalForm);
        // Logic to add bus disposal to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle add disposal method
    const handleAddDisposalMethod = (disposalMethodForm: DisposalMethodForm) => {
        console.log("Saving form:", disposalMethodForm);
        // Logic to add disposal method to the data
        // In a real app, this would likely be an API call
        // closeModal();
    };

    // Handle generate report
    const handleGenerateReport = () => {
        // Check if any filters are applied. 
        // Modify this logic based on actual searching or filtering implementation.
        const hasFilters = filteredData.length !== hardcodedData.length;

        const title = hasFilters ? "Bus Disposal Report - Filtered" : "Bus Disposal Report";

        setReportTitle(title);
        setShowReportPreview(true);
    };

    // Handle close report
    const handleCloseReportPreview = () => {
        setShowReportPreview(false);
    };

    return (
        <div className="card">
            <h1 className="title">Bus Disposal</h1>

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

                    {/* Add Bus Disposal Button */}
                    <button className="main-btn" onClick={() => openModal("add-bus-disposal")}>
                        <i className="ri-add-line" /> Add Disposal
                    </button>
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
                                    <th>Body Number</th>
                                    <th>Body Builder</th>
                                    <th>Bus Type</th>
                                    <th>Disposal Method</th>
                                    <th>Disposal Date</th>
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
                                            <td>{item.bodyNumber}</td>
                                            <td>{item.bodyBuilder}</td>
                                            <td>{item.busType}</td>
                                            <td>{item.disposalMethod}</td>
                                            <td>{item.disposalDate}</td>
                                            <td>
                                                <ActionButtons
                                                    onView={() => openModal("view-bus-disposal", item)}
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

            {/* Bus Disposal Report Preview Modal */}
            <BusDisposalReportPreviewModal
                isOpen={showReportPreview}
                onClose={handleCloseReportPreview}
                busDisposalData={filteredData}
                reportTitle={reportTitle}
            />

        </div>
    );
}