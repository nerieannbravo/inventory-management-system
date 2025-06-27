"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";

import AddBusMaintenanceModal, { BusMaintenanceForm } from "./addBusMaintenanceModal";
import ViewBusMaintenanceModal from "./viewBusMaintenanceModal";
import EditBusMaintenanceModal from "./editBusMaintenanceModal";
// import { BusMaintenanceForm } from "./addBusMaintenanceModal";
import { showEditError } from "@/utils/sweetAlert";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import { BusForm } from "../../bus-management/addBusModal";

const hardcodedData = [
    {
        id: 1,
        bodyNumber: "BUS123",
        busMaintenanceType: "Engine Check",
        busMaintenanceDate: "2023-10-01",
        busMaintenanceStatus: "completed",
    },
    {
        id: 2,
        bodyNumber: "BUS456",
        busMaintenanceType: "Tire Replacement",
        busMaintenanceDate: "2023-10-05",
        busMaintenanceStatus: "pending",
    },
    {
        id: 3,
        bodyNumber: "BUS789",
        busMaintenanceType: "Oil Change",
        busMaintenanceDate: "2023-10-10",
        busMaintenanceStatus: "completed",
    },
    {
        id: 4,
        bodyNumber: "BUS101",
        busMaintenanceType: "Brake Inspection",
        busMaintenanceDate: "2023-10-12",
        busMaintenanceStatus: "completed",
    },
    {
        id: 5,
        bodyNumber: "BUS202",
        busMaintenanceType: "Transmission Repair",
        busMaintenanceDate: "2023-10-15",
        busMaintenanceStatus: "pending",
    },
    {
        id: 6,
        bodyNumber: "BUS303",
        busMaintenanceType: "Air Filter Replacement",
        busMaintenanceDate: "2023-10-17",
        busMaintenanceStatus: "completed",
    },
    {
        id: 7,
        bodyNumber: "BUS404",
        busMaintenanceType: "Battery Check",
        busMaintenanceDate: "2023-10-20",
        busMaintenanceStatus: "completed",
    },
    {
        id: 8,
        bodyNumber: "BUS505",
        busMaintenanceType: "Wheel Alignment",
        busMaintenanceDate: "2023-10-21",
        busMaintenanceStatus: "pending",
    },
    {
        id: 9,
        bodyNumber: "BUS606",
        busMaintenanceType: "Coolant Flush",
        busMaintenanceDate: "2023-10-23",
        busMaintenanceStatus: "completed",
    },
    {
        id: 10,
        bodyNumber: "BUS707",
        busMaintenanceType: "Headlight Replacement",
        busMaintenanceDate: "2023-10-24",
        busMaintenanceStatus: "pending",
    },
    {
        id: 11,
        bodyNumber: "BUS808",
        busMaintenanceType: "Wiper Blade Replacement",
        busMaintenanceDate: "2023-10-26",
        busMaintenanceStatus: "completed",
    },
    {
        id: 12,
        bodyNumber: "BUS909",
        busMaintenanceType: "Suspension Check",
        busMaintenanceDate: "2023-10-27",
        busMaintenanceStatus: "pending",
    },
    {
        id: 13,
        bodyNumber: "BUS111",
        busMaintenanceType: "AC Maintenance",
        busMaintenanceDate: "2023-10-29",
        busMaintenanceStatus: "completed",
    },
    {
        id: 14,
        bodyNumber: "BUS222",
        busMaintenanceType: "Fuel System Cleaning",
        busMaintenanceDate: "2023-11-01",
        busMaintenanceStatus: "completed",
    },
    {
        id: 15,
        bodyNumber: "BUS333",
        busMaintenanceType: "Electrical System Check",
        busMaintenanceDate: "2023-11-03",
        busMaintenanceStatus: "pending",
    },
    {
        id: 16,
        bodyNumber: "BUS444",
        busMaintenanceType: "Exhaust System Inspection",
        busMaintenanceDate: "2023-11-06",
        busMaintenanceStatus: "completed",
    },
    {
        id: 17,
        bodyNumber: "BUS555",
        busMaintenanceType: "Paint Touch-Up",
        busMaintenanceDate: "2023-11-08",
        busMaintenanceStatus: "completed",
    },
    {
        id: 18,
        bodyNumber: "BUS666",
        busMaintenanceType: "Interior Cleaning",
        busMaintenanceDate: "2023-11-10",
        busMaintenanceStatus: "completed",
    },
    {
        id: 19,
        bodyNumber: "BUS777",
        busMaintenanceType: "Mirror Replacement",
        busMaintenanceDate: "2023-11-12",
        busMaintenanceStatus: "pending",
    },
    {
        id: 20,
        bodyNumber: "BUS888",
        busMaintenanceType: "Door Mechanism Repair",
        busMaintenanceDate: "2023-11-14",
        busMaintenanceStatus: "completed",
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
                { id: "bodyNumber", label: "Plate Number" }
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
                if (rowData && rowData.busMaintenanceStatus && rowData.busMaintenanceStatus.toLowerCase() === "completed") {
                    showEditError(rowData.busMaintenanceStatus, `This bus maintenance cannot be edited because it has already been marked as <strong>${rowData.busMaintenanceStatus}</strong>.`);
                    return;
                }
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