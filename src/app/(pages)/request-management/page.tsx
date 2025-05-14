"use client";

import React, { useState } from "react";
import MoreMenu from "@/components/moreMenu";
import ModalManager from "@/components/modalManager";
import Snackbar from "@/components/snackbar";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import ConfirmationPopup from "@/components/confirmationPopup";

import AddRequestModal from "./addRequestModal";
import ViewRequestModal from "./viewRequestModal";
import EditRequestModal from "./editRequestModal";
import { RequestForm } from "./addRequestModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/pagination.css"
import "@/styles/snackbar.css"

const hardcodedData = [
    {
        id: 1,
        empName: "Bette Anjanelle Cabarles",
        type: "Borrow",
        itemName: "Item Example A",
        reqDate: "3/12/2025",
        reqStatus: "returned",
    },
    {
        id: 2,
        empName: "Kristine Mae Cleofas",
        type: "Consume",
        itemName: "Item Example C",
        reqDate: "5/1/2025",
        reqStatus: "consumed",
    },
    {
        id: 3,
        empName: "Christelle Anne Dacapias",
        type: "Consume",
        itemName: "Item Example B",
        reqDate: "4/27/2025",
        reqStatus: "consumed",
    },
    {
        id: 4,
        empName: "Nerie Ann Bravo",
        type: "Borrow",
        itemName: "Item Example A",
        reqDate: "3/19/2025",
        reqStatus: "not-returned",
    },
];

export default function RequestManagement() {
    // for modal
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<any>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // for delete confirmation popup
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    // for snackbar
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarType, setSnackbarType] = useState<"success" | "error" | "info" | "warning">("info");

    // For filtering
    const [filteredData, setFilteredData] = useState(hardcodedData);

    // Filter sections
    const filterSections: FilterSection[] = [
        {
            id: "dateRange",
            title: "Date Range",
            type: "dateRange",
            defaultValue: { from: "", to: "" }
        },
        {
            id: "type",
            title: "Request Type",
            type: "checkbox",
            options: [
                { id: "borrow", label: "Borrow" },
                { id: "consume", label: "Consume" }
            ]
        },
        {
            id: "reqStatus",
            title: "Status",
            type: "checkbox",
            options: [
                { id: "returned", label: "Returned" },
                { id: "not-returned", label: "Not Retuned" },
                { id: "consumed", label: "Consumed" }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "empName", label: "Employee Name" },
                { id: "itemName", label: "Item Name" },
                { id: "reqDate", label: "Request Date" }
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

    // Handle filter application
    const handleApplyFilters = (filterValues: Record<string, any>) => {
        console.log("Applied filters:", filterValues);

        // In a real application, you would filter your data based on these values
        // For now, we'll just log them and keep the original data

        // Example implementation for filtering and sorting:
        let newData = [...hardcodedData];

        // Filter by request type if selected
        if (filterValues.type && filterValues.type.length > 0) {
            newData = newData.filter(item => filterValues.type.includes(item.type.toLowerCase())
            );
        }

        // Filter by status if selected
        if (filterValues.reqStatus && filterValues.reqStatus.length > 0) {
            newData = newData.filter(item => filterValues.reqStatus.includes(item.reqStatus));
        }

        // Sort by empName or itemName or date
        if (filterValues.sortBy === "empName") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.empName.localeCompare(b.empName) * sortOrder;
            });
        } else if (filterValues.sortBy === "itemName") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.itemName.localeCompare(b.itemName) * sortOrder;
            });
        } else if (filterValues.sortBy === "reqDate") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.reqDate.localeCompare(b.reqDate) * sortOrder;
            });
        }

        setFilteredData(newData);
    };

    // for request status formatting
    function formatStatus(reqStatus: string) {
        switch (reqStatus) {
            case "returned":
                return "Returned";
            case "not-returned":
                return "Not Returned";
            case "consumed":
                return "Consumed";
            default:
                return reqStatus;
        }
    }

    // for the modals of add, view, edit, and delete
    const openModal = (mode: "add-request" | "view-request" | "edit-request" | "delete-request", rowData?: any) => {
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
                    item={rowData}
                    formatStatus={formatStatus}
                    onClose={closeModal}
                />;
                break;
            case "edit-request":
                content = <EditRequestModal
                    item={rowData}
                    onSave={handleEditRequest}
                    onClose={closeModal}
                />;
                break;
            case "delete-request":
                // Instead of rendering DeleteRequestModal directly, just store the active row
                // and show the confirmation popup
                setActiveRow(rowData);
                setShowDeleteConfirmation(true);
                return; // Return early to avoid opening the modal
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

    // Handle add request
    const handleAddRequest = (requestForms: RequestForm[]) => {
        console.log("Saving forms:", requestForms);
        // Logic to add multiple item requests to the data
        // In a real app, this would likely be an API call

        const itemCount = requestForms.length;
        const message = itemCount === 1
            ? "Item request added successfully!"
            : `${itemCount} item requests added successfully!`;

        showSnackbar(message, "success");
        closeModal();
    };

    // Handle edit requests
    const handleEditRequest = (updatedItem: any) => {
        console.log("Updating item:", updatedItem);
        // Logic to update the item in the data
        // In a real app, this would likely be an API call
        showSnackbar(`Request detail has been updated.`, "success");
        closeModal();
    };

    // Hadle delete request
    const handleDeleteConfirm = () => {
        console.log("Deleted row with id:", activeRow?.id);
        // Logic to delete the item from the data
        // In a real app, this would likely be an API call
        setShowDeleteConfirmation(false);
        showSnackbar(`Request for ${activeRow.itemName} has been deleted.`, "success");
    };

    return (
        <div className="card">
            <h1 className="title">Request Management</h1>

            {/* Search Engine and Filters */}
            <div className="elements">
                <div className="entries">
                    <div className="search">
                        <input type="text" placeholder="Search" />
                        <button>
                            <i className="ri-search-line"></i>
                        </button>
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

                    {/* Add Request Button */}
                    <button className="main-btn" onClick={() => openModal("add-request")}>
                        <i className="ri-add-line" /> Add Request
                    </button>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-heading">
                                <tr>
                                    <th>Employee Name</th>
                                    <th>Request Type</th>
                                    <th>Item Name</th>
                                    <th>Request Date</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {filteredData.map(item => (
                                    <tr
                                        key={item.id}
                                        className={selectedIds.includes(item.id) ? "selected" : ""}
                                    >
                                        <td>{item.empName}</td>
                                        <td>{item.type}</td>
                                        <td>{item.itemName}</td>
                                        <td>{item.reqDate}</td>
                                        <td>
                                            <span className={`chip ${item.reqStatus}`}>
                                                {formatStatus(item.reqStatus)}
                                            </span>
                                        </td>
                                        <td>
                                            <MoreMenu
                                                onView={() => openModal("view-request", item)}
                                                onEdit={item.reqStatus === "not-returned" ? () => openModal("edit-request", item) : undefined}
                                                onDelete={() => openModal("delete-request", item)}
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

            {/* Delete Confirmation */}
            <ConfirmationPopup
                isOpen={showDeleteConfirmation}
                onClose={() => setShowDeleteConfirmation(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the request for ${activeRow?.itemName}? You will not be able to undo this.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="error"
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