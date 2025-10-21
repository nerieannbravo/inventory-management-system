"use client";

import React, { useState, useMemo, useEffect } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";
// import Loading from "@/components/loading";

import AddBusModal, { BusForm } from "./addBusModal";
import ViewBusModal from "./viewBusModal";
import EditBusModal from "./editBusModal";
import { BusReportPreviewModal } from "./busReportPDF";

import "@/styles/filters.css";
import "@/styles/tables.css";
import "@/styles/chips.css";
import "@/styles/loading.css";

const hardcodedData = [
    {
        id: 1,
        bodyNumber: "1001A",
        plateNumber: "XYZ-1201",
        bodyBuilder: "Agila",
        condition: "Brand New",
        status: "active",
        busType: "Airconditioned",
        seatCapacity: 45,
    },
    {
        id: 2,
        bodyNumber: "1002B",
        plateNumber: "XYZ-1202",
        bodyBuilder: "RBM",
        condition: "Second Hand",
        status: "decommissioned",
        busType: "Ordinary",
        seatCapacity: 45,
    },
    {
        id: 3,
        bodyNumber: "1003C",
        plateNumber: "XYZ-1203",
        bodyBuilder: "Hilltop",
        condition: "Second Hand",
        status: "under-maintenance",
        busType: "Airconditioned",
        seatCapacity: 60,
    },
    {
        id: 4,
        bodyNumber: "1002A",
        plateNumber: "XYZ-1204",
        bodyBuilder: "RBM",
        condition: "Brand New",
        status: "active",
        busType: "Airconditioned",
        seatCapacity: 50,
    },
    {
        id: 5,
        bodyNumber: "1001B",
        plateNumber: "XYZ-1205",
        bodyBuilder: "Agila",
        condition: "Brand New",
        status: "active",
        busType: "Ordinary",
        seatCapacity: 45,
    },
];

export default function BusManagement() {
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
    const [reportTitle, setReportTitle] = useState("Bus Management Report");

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
                { id: "darj", label: "DARJ" }
            ]
        },
        {
            id: "status",
            title: "Status",
            type: "checkbox",
            options: [
                { id: "active", label: "Active" },
                { id: "decommissioned", label: "Decommissioned" },
                { id: "under-maintenance", label: "Under Maintenance" }
            ]
        },
        {
            id: "busType",
            title: "Bus Type",
            type: "checkbox",
            options: [
                { id: "airconditioned", label: "Airconditioned" },
                { id: "ordinary", label: "Ordinary" }
            ]
        },
        {
            id: "condition",
            title: "Condition",
            type: "checkbox",
            options: [
                { id: "brandNew", label: "Brand New" },
                { id: "secondHand", label: "Second Hand" }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "bodyNumber", label: "Body Number" },
                { id: "bodyBuilder", label: "Body Builder" }
            ],
            defaultValue: "bodyNumber"
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

        // Filter by status if selected
        if (filterValues.status && filterValues.status.length > 0) {
            const normalizedFilters = filterValues.status.map((filter: string) => normalize(filter));
            newData = newData.filter(item => normalizedFilters.includes(normalize(item.status)));
        }

        // Filter by busType if selected
        if (filterValues.busType && filterValues.busType.length > 0) {
            const normalizedFilters = filterValues.busType.map((filter: string) => normalize(filter));
            newData = newData.filter(item => normalizedFilters.includes(normalize(item.busType)));
        }

        // Filter by condition if selected
        if (filterValues.condition && filterValues.condition.length > 0) {
            const normalizedFilters = filterValues.condition.map((filter: string) => normalize(filter));
            newData = newData.filter(item => normalizedFilters.includes(normalize(item.condition)));
        }

        // Sorting
        const orderMultiplier = filterValues.order === "desc" ? -1 : 1;
        if (filterValues.sortBy === "bodyNumber") {
            newData.sort((a, b) => a.bodyNumber.localeCompare(b.bodyNumber) * orderMultiplier);
        } else if (filterValues.sortBy === "bodyBuilder") {
            newData.sort((a, b) => a.bodyBuilder.localeCompare(b.bodyBuilder) * orderMultiplier);
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // for items status formatting
    const formatStatus = (status: string) => {
        switch (status) {
            case "active":
                return "Active";
            case "decommissioned":
                return "Decommissioned";
            case "under-maintenance":
                return "Under Maintenance";
            default:
                return status;
        }
    };

    // for the modals of add, view, and edit
    const openModal = (mode: "add-bus" | "view-bus" | "edit-bus", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-bus":
                content = <AddBusModal
                    onSave={handleAddBus}
                    onClose={closeModal}
                />;
                break;
            case "view-bus":
                content = <ViewBusModal
                    item={rowData}
                    formatStatus={formatStatus}
                    onClose={closeModal}
                />;
                break;
            case "edit-bus":
                content = <EditBusModal
                    item={rowData}
                    onSave={handleEditBus}
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

    // Handle add bus
    const handleAddBus = (busForm: BusForm) => {
        console.log("Saving forms:", busForm);
        // Logic to add bus to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle edit bus
    const handleEditBus = (updatedItem: any) => {
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

        const title = hasFilters ? "Bus Management Report - Filtered" : "Bus Management Report";

        setReportTitle(title);
        setShowReportPreview(true);
    };

    // Handle close report
    const handleCloseReportPreview = () => {
        setShowReportPreview(false);
    };

    return (
        <div className="card">
            <h1 className="title">Bus Management</h1>

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

                    {/* Generate Report Button */}
                    <button type="button" className="generate-btn" onClick={handleGenerateReport}>
                        <i className="ri-receipt-line" /> Generate Report
                    </button>

                    {/* Add Stocks Button */}
                    <button className="main-btn" onClick={() => openModal("add-bus")}>
                        <i className="ri-add-line" /> Add Bus
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
                                    <th>Plate Number</th>
                                    <th>Body Builder</th>
                                    <th>Condition</th>
                                    <th>Status</th>
                                    <th>Bus Type</th>
                                    <th>Seat Capacity</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {paginatedData.map(item => (
                                    <tr
                                        key={item.id}
                                        className={selectedIds.includes(item.id) ? "selected" : ""}
                                    >
                                        <td>{item.bodyNumber}</td>
                                        <td>{item.plateNumber}</td>
                                        <td>{item.bodyBuilder}</td>
                                        <td>{item.condition}</td>
                                        <td className="table-status">
                                            <span className={`chip ${item.status}`}>
                                                {formatStatus(item.status)}
                                            </span>
                                        </td>
                                        <td>{item.busType}</td>
                                        <td>{item.seatCapacity}</td>
                                        <td>
                                            <ActionButtons
                                                onView={() => openModal("view-bus", item)}
                                                onEdit={() => openModal("edit-bus", item)}
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

            {/* Bus Report Preview Modal */}
            <BusReportPreviewModal
                isOpen={showReportPreview}
                onClose={handleCloseReportPreview}
                busData={filteredData}
                reportTitle={reportTitle}
            />

        </div>
    );
}