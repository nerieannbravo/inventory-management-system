"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";

import AddPurchaseModal, { PurchaseRequestForm } from "./addPurchaseModal";
import EditPurchaseModal from "./editPurchaseModal";
import ViewPurchaseModal from "./viewPurchaseModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/loading.css"

const hardcodedData = [
    {
        id: 1,
        itemName: "Brake Disc",
        quantity: 5,
        unitMeasure: "pcs",
        requestType: "urgent",
        requestStatus: "pending",
        requestPurpose: "Replacement for Bus 001",
        vendor: "AutoParts Inc.",
        unitPrice: 450.00
    },
    {
        id: 2,
        itemName: "Engine Oil",
        quantity: 10,
        unitMeasure: "liters",
        requestType: "normal",
        requestStatus: "approved",
        requestPurpose: "Maintenance of Bus 002",
        vendor: "OilMax Supply",
        unitPrice: 85.00
    },
    {
        id: 3,
        itemName: "Tire",
        quantity: 4,
        unitMeasure: "pcs",
        requestType: "normal",
        requestStatus: "rejected",
        requestPurpose: "Transfer to Branch Office",
        vendor: "TireMax Corp.",
        unitPrice: 320.00
    },
    {
        id: 4,
        itemName: "Air Filter",
        quantity: 8,
        unitMeasure: "pcs",
        requestType: "normal",
        requestStatus: "pending",
        requestPurpose: "Scheduled maintenance for fleet",
        vendor: "FilterPro Ltd.",
        unitPrice: 35.00
    },
    {
        id: 5,
        itemName: "Brake Pads",
        quantity: 12,
        unitMeasure: "sets",
        requestType: "urgent",
        requestStatus: "rejected",
        requestPurpose: "Emergency repair for Bus 005",
        vendor: "BrakeTech Corp.",
        unitPrice: 180.00
    }
];

export default function PurchaseRequest() {
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
            id: "requestStatus",
            title: "Status",
            type: "checkbox",
            options: [
                { id: "pending", label: "Pending" },
                { id: "approved", label: "Approved" },
                { id: "rejected", label: "Rejected" }
            ]
        },
        {
            id: "requestType",
            title: "Request Type",
            type: "checkbox",
            options: [
                { id: "normal", label: "Normal" },
                { id: "urgent", label: "Urgent" }
            ]
        },
        {
            id: "vendor",
            title: "Vendor",
            type: "checkbox",
            options: [
                { id: "AutoParts Inc.", label: "AutoParts Inc." },
                { id: "OilMax Supply", label: "OilMax Supply" },
                { id: "TireMax Corp.", label: "TireMax Corp." },
                { id: "FilterPro Ltd.", label: "FilterPro Ltd." },
                { id: "BrakeTech Corp.", label: "BrakeTech Corp." }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "itemName", label: "Item Name" },
                { id: "quantity", label: "Quantity" },
                { id: "vendor", label: "Vendor" },
                { id: "unitPrice", label: "Unit Price" }
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
        if (filterValues.requestStatus && filterValues.requestStatus.length > 0) {
            newData = newData.filter(request => filterValues.requestStatus.includes(request.requestStatus));
        }

        // Filter by request type if selected
        if (filterValues.requestType && filterValues.requestType.length > 0) {
            newData = newData.filter(request => filterValues.requestType.includes(request.requestType));
        }

        // Filter by vendor if selected
        if (filterValues.vendor && filterValues.vendor.length > 0) {
            newData = newData.filter(request => filterValues.vendor.includes(request.vendor));
        }

        // Sort by itemName, quantity, vendor, or unitPrice
        if (filterValues.sortBy === "itemName") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.itemName.localeCompare(b.itemName) * sortOrder;
            });
        } else if (filterValues.sortBy === "quantity") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.quantity - b.quantity) * sortOrder;
            });
        } else if (filterValues.sortBy === "vendor") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.vendor.localeCompare(b.vendor) * sortOrder;
            });
        } else if (filterValues.sortBy === "unitPrice") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.unitPrice - b.unitPrice) * sortOrder;
            });
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // for request status formatting
    function formatStatus(requestStatus: string) {
        switch (requestStatus) {
            case "pending":
                return "Pending";
            case "approved":
                return "Approved";
            case "rejected":
                return "Rejected";
            default:
                return requestStatus;
        }
    }

    // for request type formatting
    function formatRequestType(requestType: string) {
        switch (requestType) {
            case "normal":
                return "Normal";
            case "urgent":
                return "Urgent";
            default:
                return requestType;
        }
    }

    // for the modals of add, view, and edit
    const openModal = (mode: "add-purchase-request" | "view-purchase-request" | "edit-purchase-request", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-purchase-request":
                content = <AddPurchaseModal
                    onSave={handleAddPurchaseRequest}
                    onClose={closeModal}
                />;
                break;
            case "view-purchase-request":
                content = <ViewPurchaseModal
                    purchaseRequest={rowData}
                    onClose={closeModal}
                />;
                break;
            case "edit-purchase-request":
                content = <EditPurchaseModal
                    purchaseRequest={rowData}
                    onSave={handleEditPurchaseRequest}
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

    // Handle add purchase request
    const handleAddPurchaseRequest = (purchaseRequests: PurchaseRequestForm[]) => {
        console.log("Saving forms:", purchaseRequests);
        
        const newRequests = purchaseRequests.map((request, index) => ({
            id: filteredData.length + index + 1,
            itemName: request.itemName,
            quantity: request.quantity,
            unitMeasure: request.unitMeasure,
            requestType: request.requestType,
            requestStatus: request.requestStatus,
            requestPurpose: request.requestPurpose,
            vendor: request.supplierDetails?.supplierName || "Unknown Vendor",
            unitPrice: request.supplierDetails?.unitPrice || 0
        }));
        
        setFilteredData(prev => [...prev, ...newRequests]);
        closeModal();
    };

    // Handle edit purchase request
    const handleEditPurchaseRequest = (updatedRequest: PurchaseRequestForm) => {
        console.log("Updating request:", updatedRequest);
        
        if (activeRow) {
            const updatedData = filteredData.map(request => 
                request.id === activeRow.id ? {
                    ...request,
                    itemName: updatedRequest.itemName,
                    quantity: updatedRequest.quantity,
                    unitMeasure: updatedRequest.unitMeasure,
                    requestType: updatedRequest.requestType,
                    requestStatus: updatedRequest.requestStatus,
                    requestPurpose: updatedRequest.requestPurpose,
                    vendor: request.vendor, // Keep existing vendor if not changed
                    unitPrice: request.unitPrice // Keep existing unit price if not changed
                } : request
            );
            
            setFilteredData(updatedData);
        }
        closeModal();
    };

    return (
        <div className="card">
            <h1 className="title">Purchase Request</h1>

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
                    <button
                        type="button"
                        className="generate-btn"
                        // onClick={handleGenerateReport}
                    >
                        <i className="ri-receipt-line" /> Generate Report
                    </button>

                    {/* Add Purchase Request Button */}
                    <button className="main-btn" onClick={() => openModal("add-purchase-request")}>
                        <i className="ri-add-line" /> Add Request
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
                                    <th>Vendor</th>
                                    <th>Unit Price</th>
                                    <th>Status</th>
                                    <th>Request Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {paginatedData.map(request => (
                                    <tr
                                        key={request.id}
                                        className={selectedIds.includes(request.id) ? "selected" : ""}
                                    >
                                        <td>{request.itemName}</td>
                                        <td>{request.quantity}</td>
                                        <td>{request.vendor}</td>
                                        <td>₱{request.unitPrice.toFixed(2)}</td>
                                        <td className="table-status">
                                            <span className={`chip ${request.requestStatus}`}>
                                                {formatStatus(request.requestStatus)}
                                            </span>
                                        </td>
                                        <td>{formatRequestType(request.requestType)}</td>
                                        <td>
                                            <ActionButtons
                                                onView={() => openModal("view-purchase-request", request)}
                                                onEdit={() => openModal("edit-purchase-request", request)}
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
                    totalItems={filteredData.length}
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