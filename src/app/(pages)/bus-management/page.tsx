"use client";

import React, { useState } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import Snackbar from "@/components/snackbar";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";

import AddBusModal from "./addBusModal";
import ViewBusModal from "./viewBusModal";
import EditBusModal from "./editBusModal";
import { BusForm } from "./addBusModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/pagination.css"
import "@/styles/snackbar.css"

const hardcodedData = [
    {
        id: 1,
        bodyNumber: 1001,
        bodyBuilder: "Agila",
        route: "Sapang Palay - PITX",
        busType: "Airconditioned",
        busStatus: "active",
    },
    {
        id: 2,
        bodyNumber: 1002,
        bodyBuilder: "DARJ",
        route: "Sapang Palay - PITX",
        busType: "Ordinary",
        busStatus: "decommissioned",
    },
    {
        id: 3,
        bodyNumber: 1003,
        bodyBuilder: "Hilltop",
        route: "Sapang Palay - Santa Cruz",
        busType: "Airconditioned",
        busStatus: "under-maintenance",
    },
    {
        id: 4,
        bodyNumber: 1004,
        bodyBuilder: "Agila",
        route: "Sapang Palay - Santa Cruz",
        busType: "Airconditioned",
        busStatus: "active",

    },
    {
        id: 5,
        bodyNumber: 1005,
        bodyBuilder: "RBM",
        route: "Sapang Palay - PITX",
        busType: "Ordinary",
        busStatus: "active",
    },
];

export default function BusManagement() {
    // for modal
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<any>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // for snackbar
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarType, setSnackbarType] = useState<"success" | "error" | "info" | "warning">("info");

    // For filtering
    const [filteredData, setFilteredData] = useState(hardcodedData);

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
            id: "route",
            title: "Route",
            type: "checkbox",
            options: [
                { id: "sapang palay - pitx", label: "Sapang Palay - PITX" },
                { id: "sapang palay - santa cruz", label: "Sapang Palay - Santa Cruz" }
            ]
        },
        {
            id: "busStatus",
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

        // Filter by bodyBuilder if selected
        if (filterValues.bodyBuilder && filterValues.bodyBuilder.length > 0) {
            newData = newData.filter(item => filterValues.bodyBuilder.includes(item.bodyBuilder.toLowerCase())
            );
        }

        // Filter by route if selected
        if (filterValues.route && filterValues.route.length > 0) {
            newData = newData.filter(item => filterValues.route.includes(item.route.toLowerCase())
            );
        }

        // Filter by busStatus if selected
        if (filterValues.busStatus && filterValues.busStatus.length > 0) {
            newData = newData.filter(item => filterValues.busStatus.includes(item.busStatus));
        }

        // Filter by busType if selected
        if (filterValues.busType && filterValues.busType.length > 0) {
            newData = newData.filter(item => filterValues.busType.includes(item.busType.toLowerCase())
            );
        }

        // Sort by bodyNumber
        if (filterValues.sortBy === "bodyNumber") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.bodyNumber - b.bodyNumber) * sortOrder;

            });
        }

        setFilteredData(newData);
    };

    // for items busStatus formatting
    const formatStatus = (busStatus: string) => {
        switch (busStatus) {
            case "active":
                return "Active";
            case "decommissioned":
                return "Decommissioned";
            case "under-maintenance":
                return "Under Maintenance";
            default:
                return busStatus;
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

    // snackbar
    const showSnackbar = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarVisible(true);
    };

    // Handle add bus
    const handleAddBus = (busForm: BusForm) => {
        console.log("Saving forms:", busForm);
        // Logic to add bus to the data
        // In a real app, this would likely be an API call
        showSnackbar("Bus added successfully", "success");
        closeModal();
    };

    // Handle edit bus
    const handleEditBus = (updatedItem: any) => {
        console.log("Updating item:", updatedItem);
        // Logic to update the item in the data
        // In a real app, this would likely be an API call
        showSnackbar(`Bus detail has been updated.`, "success");
        closeModal();
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
                    <button type="button" className="generate-btn">
                        <i className="ri-receipt-line" /> Generate Report
                    </button>

                    {/* Add Stocks Button */}
                    <button className="main-btn" onClick={() => openModal("add-bus")}>
                        <i className="ri-add-line" /> Add Bus
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
                                    <th>Route</th>
                                    <th>Status</th>
                                    <th>Bus Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {filteredData.map(item => (
                                    <tr
                                        key={item.id}
                                        className={selectedIds.includes(item.id) ? "selected" : ""}
                                    >
                                        <td>{item.bodyNumber}</td>
                                        <td>{item.bodyBuilder}</td>
                                        <td>{item.route}</td>
                                        <td>
                                            <span className={`chip ${item.busStatus}`}>
                                                {formatStatus(item.busStatus)}
                                            </span>
                                        </td>
                                        <td>{item.busType}</td>
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
                <div className="pagination">
                    <button className="page-btn">
                        <i className="ri-arrow-left-s-line"></i>
                    </button>
                    <button className="page-btn active">1</button>
                    <button className="page-btn">2</button>
                    <button className="page-btn">3</button>
                    <button className="page-btn">4</button>
                    <button className="page-btn">5</button>
                    <button className="page-btn">
                        <i className="ri-arrow-right-s-line"></i>
                    </button>
                </div>
            </div>

            {/* Dynamic Modal Manager */}
            <ModalManager
                isOpen={isModalOpen}
                onClose={closeModal}
                modalContent={modalContent}
            />

            {/* Snackbar */}
            <Snackbar
                message={snackbarMessage}
                isVisible={snackbarVisible}
                onClose={() => setSnackbarVisible(false)}
                type={snackbarType}
            />

        </div>
    );
}