"use client";

import React, { useState, useEffect, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";
import Loading from "@/components/loading";
import { showEditError } from "@/utils/sweetAlert";

import AddRequestModal from "./addRequestModal";
import ViewRequestModal from "./viewRequestModal";
import EditRequestModal from "./editRequestModal";
import { RequestForm } from "./addRequestModal";
import { RequestReportPreviewModal } from "./requestReportPDF";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/loading.css"

// Type definitions based on your Prisma schema
interface EmployeeRequest {
    request_id: string;
    inventoryItem: {
        item_id: string;
        item_name: string;
    };
    emp_id: string;
    emp_first_name: string;
    emp_last_name: string;
    empName: string; // Derived from emp_first_name and emp_last_name
    request_type: string;
    quantity: number;
    req_purpose: string;
    status: string;
    expected_return_date: string | null;
    actual_return_date: string | null;
    date_created: string;
    date_updated: string;
}

interface ApiResponse {
    success: boolean;
    request: EmployeeRequest[];
    error?: string;
}

export default function RequestManagement() {
    // Data state
    const [requestList, setRequestList] = useState<EmployeeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [filterValues, setFilterValues] = useState<Record<string, any>>({});

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modal state
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<any>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // PDF Report state
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [reportTitle, setReportTitle] = useState("Request Management Report");

    // Fetch data from API
    useEffect(() => {
        fetchEmployeeRequests();
    }, []);

    const fetchEmployeeRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/request');
            const data: ApiResponse = await response.json();

            if (data.success) {
                setRequestList(Array.isArray(data.request) ? data.request : []);
                setError(null);
            } else {
                setRequestList([]); // Ensure it's always an array
                setError(data.error || 'Failed to fetch employee requests');
            }
        } catch (err) {
            setRequestList([]); // Ensure it's always an array
            const errorMessage = 'Error fetching employee requests';
            setError(errorMessage);
            console.error('Error fetching employee requests', err);
        } finally {
            setLoading(false);
        }
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
            id: "request_type",
            title: "Request Type",
            type: "checkbox",
            options: [
                { id: "BORROW", label: "Borrow" },
                { id: "CONSUME", label: "Consume" }
            ]
        },
        {
            id: "status",
            title: "Status",
            type: "checkbox",
            options: [
                { id: "RETURNED", label: "Returned" },
                { id: "NOT_RETURNED", label: "Not Retuned" },
                { id: "CONSUMED", label: "Consumed" }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "empName", label: "Employee Name" },
                { id: "item_name", label: "Item Name" },
                { id: "date_created", label: "Request Date" }
            ],
            defaultValue: "empName"
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

    const filteredAndSearchedRequests = useMemo(() => {
        let filtered = [...requestList];

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(request => {
                const formattedDate = request.date_created
                    ? new Date(request.date_created).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }).toLowerCase()
                    : "";

                return (
                    request.inventoryItem.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.request_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.quantity.toString().includes(searchTerm) ||
                    formattedDate.includes(searchTerm.toLowerCase())
                );
            });
        }

        // Apply status filter
        if (filterValues.status && filterValues.status.length > 0) {
            filtered = filtered.filter(request => filterValues.status.includes(request.status));
        }

        if (filterValues.request_type && filterValues.request_type.length > 0) {
            filtered = filtered.filter(request => filterValues.request_type.includes(request.request_type));
        }

        if (filterValues.dateRange && (filterValues.dateRange.from || filterValues.dateRange.to)) {
            filtered = filtered.filter(request => {
                const requestDate = new Date(request.date_updated);
                const fromDate = filterValues.dateRange.from ? new Date(filterValues.dateRange.from) : null;
                const toDate = filterValues.dateRange.to ? new Date(filterValues.dateRange.to) : null;

                if (fromDate) fromDate.setHours(0, 0, 0, 0);
                if (toDate) toDate.setHours(23, 59, 59, 999);

                // If both dates are provided
                if (fromDate && toDate) {
                    return requestDate >= fromDate && requestDate <= toDate;
                }
                // If only from date is provided
                else if (fromDate) {
                    return requestDate >= fromDate;
                }
                // If only to date is provided
                else if (toDate) {
                    return requestDate <= toDate;
                }

                return true;
            });
        }

        // Apply sorting
        const sortBy = filterValues.sortBy || "empName";
        const order = filterValues.order || "asc";

        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case "empName":
                    aValue = a.empName ? a.empName.toLowerCase() : "";
                    bValue = b.empName ? b.empName.toLowerCase() : "";
                    break;
                case "request_type":
                    aValue = a.request_type ? a.request_type.toLowerCase() : "";
                    bValue = b.request_type ? b.request_type.toLowerCase() : "";
                    break;
                case "date_created":
                    aValue = a.date_created ? new Date(a.date_created) : new Date(0);
                    bValue = b.date_created ? new Date(b.date_created) : new Date(0);
                    break;
                default:
                    aValue = a.empName ? a.empName.toLowerCase() : "";
                    bValue = b.empName ? b.empName.toLowerCase() : "";
            }

            // Use type guards to ensure correct typing
            if (typeof aValue === "string" && typeof bValue === "string") {
                const comparison = aValue.localeCompare(bValue);
                return order === "asc" ? comparison : -comparison;
            } else if (aValue instanceof Date && bValue instanceof Date) {
                const comparison = aValue.getTime() - bValue.getTime();
                return order === "asc" ? comparison : -comparison;
            } else if (typeof aValue === "number" && typeof bValue === "number") {
                const comparison = aValue - bValue;
                return order === "asc" ? comparison : -comparison;
            } else {
                return 0; // fallback in case of type mismatch (should not occur)
            }
        });
        return filtered;
    }, [requestList, searchTerm, filterValues]);

    const totalPages = Math.ceil(filteredAndSearchedRequests.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = filteredAndSearchedRequests.slice(startIndex, startIndex + pageSize);

    const getDateRangeDisplay = () => {
        if (!filterValues.dateRange) return null;

        const { from, to } = filterValues.dateRange;
        if (!from && !to) return null;

        const formatDate = (dateString: string) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        if (from && to) {
            return `Employee Requests filtered from ${formatDate(from)} to ${formatDate(to)}`;
        } else if (from) {
            return `Employee Requests filtered from ${formatDate(from)}`;
        } else if (to) {
            return `Employee Requests filtered up to ${formatDate(to)}`;
        }

        return null;
    };

    // Handle filter application
    const handleApplyFilters = (newFilterValues: Record<string, any>) => {
        console.log("Applied filters:", newFilterValues);
        setFilterValues(newFilterValues);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when search changes
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    // for request type formatting
    function formatType(request_type: string) {
        switch (request_type) {
            case "BORROW":
                return "Borrow";
            case "CONSUME":
                return "Consume";
            default:
                return request_type;
        }
    }

    // for request status formatting
    function formatStatus(status: string) {
        switch (status) {
            case "RETURNED":
                return "Returned";
            case "NOT_RETURNED":
                return "Not Returned";
            case "CONSUMED":
                return "Consumed";
            default:
                return status;
        }
    }

    // Get CSS class for status
    const getStatusClass = (status: string) => {
        switch (status) {
            case "RETURNED":
                return "returned";
            case "NOT_RETURNED":
                return "not-returned";
            case "CONSUMED":
                return "consumed";
            default:
                return status.toLowerCase().replace(/_/g, '-');
        }
    };

    // for the modals of add, view, edit, and delete
    const openModal = (mode: "add-request" | "view-request" | "edit-request", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-request":
                content = <AddRequestModal
                    onSave={handleAddRequest}
                    onClose={closeModal}
                />;
                break;
            case "view-request":
                content = <ViewRequestModal
                    request={rowData}
                    formatStatus={formatStatus}
                    formatType={formatType}
                    onClose={closeModal}
                />;
                break;
            case "edit-request":
                if (rowData && (rowData.status === "CONSUMED" || rowData.status === "RETURNED")) {
                    showEditError(formatStatus(rowData.status));
                    return;
                }
                content = <EditRequestModal
                    request={rowData}
                    onSave={handleEditRequest}
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

    // Handle add request
    const handleAddRequest = (requestForms: RequestForm[]) => {
        console.log("Saving forms:", requestForms);
        // Logic to add multiple item requests to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle edit requests
    const handleEditRequest = (updatedItem: any) => {
        console.log("Updating item:", updatedItem);
        // Logic to update the item in the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle generate report
    const handleGenerateReport = () => {
        // Check if any filters or search are applied
        const hasFilters = searchTerm.trim() ||
            (filterValues.status && filterValues.status.length > 0) ||
            (filterValues.request_type && filterValues.request_type.length > 0) ||
            (filterValues.dateRange && (filterValues.dateRange.from || filterValues.dateRange.to));

        const title = hasFilters ? "Request Management Report - Filtered" : "Request Management Report";

        setReportTitle(title);
        setShowReportPreview(true);
    };

    // Handle close report
    const handleCloseReportPreview = () => {
        setShowReportPreview(false);
    };

    if (loading) {
        return (
            <div className="card">
                <h1 className="title">Request Management</h1>
                <Loading />
            </div>
        );
    }

    if (error && requestList.length === 0) {
        return (
            <div className="card">
                <h1 className="title">Request Management</h1>
                <div className="fetch-container">
                    <div className="fetch-error">
                        <i className="ri-error-warning-line" />
                        {error}
                    </div>
                    <button className="retry-btn" onClick={fetchEmployeeRequests}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h1 className="title">Request Management</h1>

            {/* Search Engine and Filters */}
            <div className="elements">
                <div className="entries">
                    <div className="search">
                        <i className="ri-search-line" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* Filter Button with Dropdown */}
                    <div className="filter">
                        <FilterDropdown
                            sections={filterSections}
                            onApply={handleApplyFilters}
                        />
                    </div>

                    {/* Generate Report Button */}
                    <button
                        type="button"
                        className="generate-btn"
                        onClick={handleGenerateReport}
                    >
                        <i className="ri-receipt-line" /> Generate Report
                    </button>

                    {/* Add Request Button */}
                    <button className="main-btn" onClick={() => openModal("add-request")}>
                        <i className="ri-add-line" /> Add Request
                    </button>
                </div>

                {getDateRangeDisplay() && (
                    <div className="filter-results">
                        {getDateRangeDisplay()}
                    </div>
                )}

                {/* Table */}
                <div className="table-wrapper">
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-heading">
                                <tr>
                                    <th>Employee Name</th>
                                    <th>Request Type</th>
                                    <th>Item Name</th>
                                    <th>Quantity</th>
                                    <th>Status</th>
                                    <th>Request Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {paginatedItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="no-records">
                                            {searchTerm || Object.keys(filterValues).some(key =>
                                                filterValues[key] &&
                                                (Array.isArray(filterValues[key]) ? filterValues[key].length > 0 : true)
                                            )
                                                ? 'No requests matched'
                                                : 'No requests available'
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedItems.map(request => (
                                        <tr
                                            key={request.request_id}
                                            className={selectedIds.includes(parseInt(request.request_id)) ? "selected" : ""}
                                        >
                                            <td>{request.empName}</td>
                                            <td>{formatType(request.request_type)}</td>
                                            <td>{request.inventoryItem.item_name}</td>
                                            <td>{request.quantity}</td>
                                            <td className="table-status">
                                                <span className={`chip ${getStatusClass(request.status)}`}>
                                                    {formatStatus(request.status)}
                                                </span>
                                            </td>
                                            <td>
                                                {request.date_created
                                                    ? new Date(request.date_created).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : ''}
                                            </td>
                                            <td>
                                                <ActionButtons
                                                    onView={() => openModal("view-request", request)}
                                                    onEdit={() => openModal("edit-request", request)}
                                                    disableEdit={request.status === "CONSUMED" || request.status === "RETURNED"}
                                                />
                                            </td>
                                        </tr>
                                    ))
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
                    totalItems={paginatedItems.length}
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
            <RequestReportPreviewModal
                isOpen={showReportPreview}
                onClose={handleCloseReportPreview}
                requestData={filteredAndSearchedRequests}
                reportTitle={reportTitle}
            />
        </div>
    );
}