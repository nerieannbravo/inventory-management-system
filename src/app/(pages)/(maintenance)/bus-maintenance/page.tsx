"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";

import AddBusMaintenanceModal, { BusMaintenanceForm } from "./addBusMaintenanceModal";
import ViewBusMaintenanceModal from "./viewBusMaintenanceModal";
import EditBusMaintenanceModal from "./editBusMaintenanceModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
// import { BusForm } from "../../bus-management/addBusModal";

const hardcodedData = [
    {
        id: 1,
        bodyNumber: "BUS123",
        bodyBuilder: "Agila",
        busMaintenanceType: "Engine Check",
        busMaintenanceDate: "2023-10-01",
        busMaintenanceStatus: "completed",
    },
    {
        id: 2,
        bodyNumber: "BUS456",
        bodyBuilder: "Hilltop",
        busMaintenanceType: "Tire Replacement",
        busMaintenanceDate: "2023-10-05",
        busMaintenanceStatus: "pending",
    },
];

export default function BusMaintenance() {
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
            id: "busMaintenanceStatus",
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
                { id: "busMaintenanceDate", label: "Maintenance Date" },
                { id: "bodyNumber", label: "Body Number" }
            ],
            defaultValue: "busMaintenanceDate"
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
        if (filterValues.busMaintenanceStatus && filterValues.busMaintenanceStatus.length > 0) {
            newData = newData.filter(item => filterValues.busMaintenanceStatus.includes(item.busMaintenanceStatus));
        }

        // Sort by plate number or date
        if (filterValues.sortBy === "bodyNumber") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.bodyNumber.localeCompare(b.bodyNumber) * sortOrder;
            });
        } else if (filterValues.sortBy === "busMaintenanceDate") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.busMaintenanceDate ?? "").localeCompare(b.busMaintenanceDate ?? "") * sortOrder;
            });
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // for order status formatting
    function formatStatus(busMaintenanceStatus: string) {
        switch (busMaintenanceStatus) {
            case "completed":
                return "Completed";
            case "pending":
                return "Pending";
            default:
                return busMaintenanceStatus;
        }
    }

    // for the modals of add, view, and edit
    const openModal = (mode: "add-bus-maintenance" | "view-bus-maintenance" | "edit-bus-maintenance", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-bus-maintenance":
                content = <AddBusMaintenanceModal
                    onSave={handleAddBusMaintenance}
                    onClose={closeModal}
                />;
                break;
            case "view-bus-maintenance":
                content = <ViewBusMaintenanceModal
                    item={rowData}
                    formatStatus={formatStatus}
                    onClose={closeModal}
                />;
                break;
            case "edit-bus-maintenance":
                content = <EditBusMaintenanceModal
                    item={rowData}
                    onSave={handleEditBusMaintenance}
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

    // Handle add bus maintenance
    const handleAddBusMaintenance = (busMaintenanceForm: BusMaintenanceForm) => {
        console.log("Saving form:", busMaintenanceForm);
        // Logic to add bus to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle edit bus maintenance
    const handleEditBusMaintenance = (updatedItem: any) => {
        console.log("Updating item:", updatedItem);
        // Logic to update the item in the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    return (
        <div className="card">
            <h1 className="title">Bus Maintenance</h1>

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
                    <button className="main-btn" onClick={() => openModal("add-bus-maintenance")}>
                        <i className="ri-add-line" /> Add Maintenance
                    </button>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-heading">
                                <tr>
                                    <th>Body Number</th>
                                    <th>Body Builder</th>
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
                                        <td>{item.bodyNumber}</td>
                                        <td>{item.bodyBuilder}</td>
                                        <td>{item.busMaintenanceType}</td>
                                        <td className="table-status">
                                            <span className={`chip ${item.busMaintenanceStatus}`}>
                                                {formatStatus(item.busMaintenanceStatus)}
                                            </span>
                                        </td>
                                        <td>{item.busMaintenanceDate}</td>
                                        <td>
                                            <ActionButtons
                                                onView={() => openModal("view-bus-maintenance", item)}
                                                onEdit={() => openModal("edit-bus-maintenance", item)}
                                                disableEdit={item.busMaintenanceStatus !== "pending" && item.busMaintenanceStatus !== "approved"}
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