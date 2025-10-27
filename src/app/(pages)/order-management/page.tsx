"use client";

import React, { useState, useMemo, useEffect } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";
// import Loading from "@/components/loading";

import ViewOrderModal from "./viewOrderModal";
import EditOrderModal from "./editOrderModal";
import { OrderReportPreviewModal } from "./orderReportPDF";

import "@/styles/filters.css";
import "@/styles/tables.css";
import "@/styles/chips.css";
import "@/styles/loading.css";

const hardcodedData = [
    {
        id: 1,
        refNo: "PO-001234",
        departmentName: "Operations",
        dateApproved: "October 24, 2025",
        orderStatus: "pending",
        supplierName: "AutoParts Plus Inc.",
        supplierContact: "09123456789",
        remarks: null,
        items: [
            {
                id: 1,
                isApproved: true, // false if Finance rejected this item
                itemName: "Brake Disc",
                requestedQuantity: 5, // from PR
                approvedQuantity: 5, // quantity that Finance approved
                receivedQuantity: 0, // received quantity
                usableQuantity: 0, // usable quantity from the received
                unitMeasure: "pcs",
                estimatedUnitCost: 450,
                actualUnitCost: 0,
                itemOrderStatus: "pending",
                adjustmentReason: null,
                attachmentFiles: [] as File[]
            },
            {
                id: 2,
                isApproved: true,
                itemName: "Brake Pads",
                requestedQuantity: 2,
                approvedQuantity: 2,
                receivedQuantity: 0,
                usableQuantity: 0,
                unitMeasure: "sets",
                estimatedUnitCost: 180,
                actualUnitCost: 0,
                itemOrderStatus: "pending",
                adjustmentReason: null,
                attachmentFiles: [] as File[]
            },
            {
                id: 3,
                isApproved: true,
                itemName: "Air Filter",
                requestedQuantity: 1,
                approvedQuantity: 1,
                receivedQuantity: 0,
                usableQuantity: 0,
                unitMeasure: "pcs",
                estimatedUnitCost: 35,
                actualUnitCost: 0,
                itemOrderStatus: "pending",
                adjustmentReason: null,
                attachmentFiles: [] as File[]
            }
        ]
    },
    {
        id: 2,
        refNo: "PO-001235",
        departmentName: "Inventory",
        dateApproved: "July 30, 2025",
        orderStatus: "adjusted",
        supplierName: "Fleet Supply Co.",
        supplierContact: "09765856932",
        remarks: null,
        items: [
            {
                id: 1,
                isApproved: true,
                itemName: "Engine Oil",
                requestedQuantity: 12,
                approvedQuantity: 15,
                receivedQuantity: 0,
                usableQuantity: 0,
                unitMeasure: "liters",
                estimatedUnitCost: 85,
                actualUnitCost: 0,
                itemOrderStatus: "adjusted",
                adjustmentReason: "Increased based on actual fleet maintenance needs",
                attachmentFiles: [] as File[]
            },
            {
                id: 2,
                isApproved: true,
                itemName: "Brake Pads",
                requestedQuantity: 2,
                approvedQuantity: 2,
                receivedQuantity: 0,
                usableQuantity: 0,
                unitMeasure: "sets",
                estimatedUnitCost: 180,
                actualUnitCost: 0,
                itemOrderStatus: "pending",
                adjustmentReason: null,
                attachmentFiles: [] as File[]
            },
            {
                id: 3,
                isApproved: true,
                itemName: "Oil Filter",
                requestedQuantity: 5,
                approvedQuantity: 5,
                receivedQuantity: 0,
                usableQuantity: 0,
                unitMeasure: "pcs",
                estimatedUnitCost: 25,
                actualUnitCost: 0,
                itemOrderStatus: "pending",
                adjustmentReason: null,
                attachmentFiles: [] as File[]
            },
            {
                id: 4,
                isApproved: false,
                itemName: "Air Filter",
                requestedQuantity: 3,
                approvedQuantity: 0,
                receivedQuantity: 0,
                usableQuantity: 0,
                unitMeasure: "pcs",
                estimatedUnitCost: 35,
                actualUnitCost: 0,
                itemOrderStatus: "rejected",
                adjustmentReason: "Not approved - insufficient budget allocation",
                attachmentFiles: [] as File[]
            }
        ]
    },
    {
        id: 3,
        refNo: "PO-001236",
        departmentName: "Human Resources",
        dateApproved: "September 14, 2025",
        orderStatus: "received",
        supplierName: "Office Depot Philippines",
        supplierContact: "09193456789",
        remarks: "All items received in good condition.",
        items: [
            {
                id: 1,
                isApproved: true,
                itemName: "Office Chair",
                requestedQuantity: 5,
                approvedQuantity: 5,
                receivedQuantity: 5,
                usableQuantity: 0,
                unitMeasure: "pcs",
                estimatedUnitCost: 350,
                actualUnitCost: 350,
                itemOrderStatus: "received",
                adjustmentReason: null,
                attachmentFiles: [] as File[]
            },
            {
                id: 2,
                isApproved: true,
                itemName: "Desk Lamp",
                requestedQuantity: 5,
                approvedQuantity: 4,
                receivedQuantity: 4,
                usableQuantity: 0,
                unitMeasure: "pcs",
                estimatedUnitCost: 85,
                actualUnitCost: 90,
                itemOrderStatus: "received",
                adjustmentReason: "Decreased quantity due to budget constraints",
                attachmentFiles: [] as File[]
            }
        ]
    },
    {
        id: 4,
        refNo: "PO-001237",
        departmentName: "Inventory",
        dateApproved: "October 1, 2025",
        orderStatus: "partial",
        supplierName: "Fleet Supply Co.",
        supplierContact: "09182345678",
        remarks: "Partially completed: Air Filter received all 8 pcs but 2 are defective, Coolant received 10 liters (5 liters missing).",
        items: [
            {
                id: 1,
                isApproved: true,
                itemName: "Air Filter",
                requestedQuantity: 8,
                approvedQuantity: 8,
                receivedQuantity: 8,
                usableQuantity: 6, // 2 pcs are defecitve/damaged
                unitMeasure: "pcs",
                estimatedUnitCost: 35,
                actualUnitCost: 35,
                itemOrderStatus: "partial", // 2 pcs are defecitve/damaged
                adjustmentReason: null,
                attachmentFiles: [] as File[]
            },
            {
                id: 2,
                isApproved: true,
                itemName: "Fuel Filter",
                requestedQuantity: 8,
                approvedQuantity: 8,
                receivedQuantity: 8,
                usableQuantity: 8, // no defect/missing
                unitMeasure: "pcs",
                estimatedUnitCost: 28,
                actualUnitCost: 28,
                itemOrderStatus: "closed", // no problem and already added to stocks
                adjustmentReason: null,
                attachmentFiles: [] as File[]
            },
            {
                id: 3,
                isApproved: true,
                itemName: "Coolant",
                requestedQuantity: 15,
                approvedQuantity: 15,
                receivedQuantity: 10,
                usableQuantity: 10, // 5 liters are missing
                unitMeasure: "liters",
                estimatedUnitCost: 45,
                actualUnitCost: 45,
                itemOrderStatus: "partial", // 5 liters are missing
                adjustmentReason: null,
                attachmentFiles: [] as File[]
            }
        ]
    },
    {
        id: 5,
        refNo: "PO-001238",
        departmentName: "Inventory",
        dateApproved: "October 5, 2025",
        orderStatus: "partial",
        supplierName: "Fleet Supply Co.",
        supplierContact: "09182345678",
        remarks: "Refund and replacement in process by Finance.",
        items: [
            {
                id: 1,
                isApproved: true,
                itemName: "Air Filter",
                requestedQuantity: 8,
                approvedQuantity: 8,
                receivedQuantity: 8,
                usableQuantity: 6,
                unitMeasure: "pcs",
                estimatedUnitCost: 35,
                actualUnitCost: 35,
                itemOrderStatus: "to-be-replaced", // 2 pcs are defecitve/damaged
                adjustmentReason: null,
                attachmentFiles: [] as File[]
            },
            {
                id: 2,
                isApproved: true,
                itemName: "Coolant",
                requestedQuantity: 15,
                approvedQuantity: 15,
                receivedQuantity: 10,
                usableQuantity: 10,
                unitMeasure: "liters",
                estimatedUnitCost: 45,
                actualUnitCost: 45,
                itemOrderStatus: "to-be-refunded", // 5 liters are missing
                adjustmentReason: null,
                attachmentFiles: [] as File[]
            }
        ]
    },
    {
        id: 6,
        refNo: "PO-001238",
        departmentName: "Finance",
        dateApproved: "June 19, 2025",
        orderStatus: "closed",
        supplierName: "Paper World Inc.",
        supplierContact: "09204567890",
        remarks: "All items received in perfect condition. No issues. Order closed.",
        items: [
            {
                id: 1,
                isApproved: true,
                itemName: "Bond Paper",
                requestedQuantity: 50,
                approvedQuantity: 50,
                receivedQuantity: 50,
                usableQuantity: 50,
                unitMeasure: "reams",
                estimatedUnitCost: 45,
                actualUnitCost: 50,
                itemOrderStatus: "closed",
                adjustmentReason: null,
                attachmentFiles: [] as File[]
            }
        ]
    },
];

export default function OrderManagement() {
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
    const [reportTitle, setReportTitle] = useState("Order Management Report");

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
            id: "departmentName",
            title: "Department",
            type: "checkbox",
            options: [
                { id: "inventory", label: "Inventory" },
                { id: "finance", label: "Finance" },
                { id: "operation", label: "Operation" },
                { id: "humanResources", label: "Human Resources" }
            ]
        },
        {
            id: "orderStatus",
            title: "Status",
            type: "checkbox",
            options: [
                { id: "pending", label: "Pending" },
                { id: "adjusted", label: "Adjusted" },
                { id: "received", label: "Received" },
                { id: "partial", label: "Partial" },
                { id: "closed", label: "Closed" }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "refNo", label: "Reference No." },
                { id: "numOfItems", label: "No. of Items" },
                { id: "dateApproved", label: "Date Approved" },
            ],
            defaultValue: "refNo"
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

        // Filter by departmentName if selected
        if (filterValues.departmentName && filterValues.departmentName.length > 0) {
            const normalizedFilters = filterValues.departmentName.map((filter: string) => normalize(filter));
            newData = newData.filter(item => normalizedFilters.includes(normalize(item.departmentName)));
        }

        // Filter by orderStatus if selected
        if (filterValues.orderStatus && filterValues.orderStatus.length > 0) {
            const normalizedFilters = filterValues.orderStatus.map((filter: string) => normalize(filter));
            newData = newData.filter(item => normalizedFilters.includes(normalize(item.orderStatus)));
        }

        // Sorting
        const orderMultiplier = filterValues.order === "desc" ? -1 : 1;
        if (filterValues.sortBy === "refNo") {
            newData.sort((a, b) => a.refNo.localeCompare(b.refNo) * orderMultiplier);
        } else if (filterValues.sortBy === "numOfItems") {
            newData.sort((a, b) => {
                const countA = a.items.filter(i => i.isApproved).length;
                const countB = b.items.filter(i => i.isApproved).length;
                return (countA - countB) * orderMultiplier;
            });
        } else if (filterValues.sortBy === "dateApproved") {
            newData.sort((a, b) => {
                const dateA = new Date(a.dateApproved);
                const dateB = new Date(b.dateApproved);

                // Use getTime() to get a number and guard invalid dates
                if (Number.isNaN(dateA.getTime())) return 1;
                if (Number.isNaN(dateB.getTime())) return -1;

                return (dateA.getTime() - dateB.getTime()) * orderMultiplier;
            });
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // for order status formatting
    const formatStatus = (orderStatus: string) => {
        switch (orderStatus) {
            case "pending":
                return "Pending";
            case "adjusted":
                return "Adjusted";
            case "received":
                return "Received";
            case "partial":
                return "Partial";
            case "closed":
                return "Closed";

            // for specific item order status
            case "to-be-refunded":
                return "To be Refunded";
            case "to-be-replaced":
                return "To be Replaced";
            case "rejected":
                return "Rejected";
            default:
                return orderStatus;
        }
    };

    // for the modals of add, view, and edit
    const openModal = (mode: "view-order" | "edit-order", rowData?: any) => {
        let content;

        switch (mode) {
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

    // Handle edit order
    const handleEditOrder = (updatedItem: any) => {
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

        const title = hasFilters ? "Order Management Report - Filtered" : "Order Management Report";

        setReportTitle(title);
        setShowReportPreview(true);
    };

    // Handle close report
    const handleCloseReportPreview = () => {
        setShowReportPreview(false);
    };

    return (
        <div className="card">
            <h1 className="title">Order Management</h1>

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
                                    <th>Reference No.</th>
                                    <th>Department</th>
                                    <th>No. of Items</th>
                                    <th>Status</th>
                                    <th>Date Approved</th>
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
                                    paginatedData.map(item => {
                                        // Count only approved items
                                        const approvedItemsCount = item.items.filter(i => i.isApproved).length;

                                        return (
                                            <tr
                                                key={item.id}
                                                className={selectedIds.includes(item.id) ? "selected" : ""}
                                            >
                                                <td>{item.refNo}</td>
                                                <td>{item.departmentName}</td>
                                                <td>{approvedItemsCount}</td>
                                                <td className="table-status">
                                                    <span className={`chip ${item.orderStatus}`}>
                                                        {formatStatus(item.orderStatus)}
                                                    </span>
                                                </td>
                                                <td>{item.dateApproved}</td>
                                                <td>
                                                    <ActionButtons
                                                        onView={() => openModal("view-order", item)}
                                                        onEdit={() => openModal("edit-order", item)}
                                                        disableEdit={item.orderStatus == "closed"}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
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

            {/* Order Report Preview Modal */}
            <OrderReportPreviewModal
                isOpen={showReportPreview}
                onClose={handleCloseReportPreview}
                orderData={filteredData}
                reportTitle={reportTitle}
            />

        </div>
    );
}