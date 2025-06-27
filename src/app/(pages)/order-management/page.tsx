"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";

import AddOrderModal from "./addOrderModal";
import ViewOrderModal from "./viewOrderModal";
import EditOrderModal from "./editOrderModal";
import { OrderForm } from "./addOrderModal";
import { showEditError } from "@/utils/sweetAlert";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"

const hardcodedData = [
    {
        id: 1,
        itemName: "Brake Disc",
        ordQuantity: 8,
        ordReqDate: "3/10/2025",
        ordStatus: "completed",
    },
    {
        id: 2,
        itemName: "Head Lights",
        ordQuantity: 12,
        ordReqDate: "3/15/2025",
        ordStatus: "pending",
    },
    {
        id: 3,
        itemName: "Red Paint",
        ordQuantity: 5,
        ordReqDate: "3/20/2025",
        ordStatus: "approved",
    },
    {
        id: 4,
        itemName: "Brake Lining",
        ordQuantity: 20,
        ordReqDate: "4/05/2025",
        ordStatus: "completed",
    },
    {
        id: 5,
        itemName: "Diesel",
        ordQuantity: 200,
        ordReqDate: "4/10/2025",
        ordStatus: "completed",
    },
    {
        id: 6,
        itemName: "Hub Bolt",
        ordQuantity: 50,
        ordReqDate: "4/18/2025",
        ordStatus: "pending",
    },
    {
        id: 7,
        itemName: "Red Paint",
        ordQuantity: 6,
        ordReqDate: "4/20/2025",
        ordStatus: "approved",
    },
    {
        id: 8,
        itemName: "Oil Filter",
        ordQuantity: 15,
        ordReqDate: "4/25/2025",
        ordStatus: "completed",
    },
    {
        id: 9,
        itemName: "Diesel Exhaust Fluid",
        ordQuantity: 30,
        ordReqDate: "5/01/2025",
        ordStatus: "pending",
    },
    {
        id: 10,
        itemName: "Diesel",
        ordQuantity: 180,
        ordReqDate: "5/05/2025",
        ordStatus: "completed",
    },
    {
        id: 11,
        itemName: "Fuel Filter",
        ordQuantity: 10,
        ordReqDate: "5/08/2025",
        ordStatus: "approved",
    },
    {
        id: 12,
        itemName: "Head Lights",
        ordQuantity: 8,
        ordReqDate: "5/10/2025",
        ordStatus: "completed",
    },
    {
        id: 13,
        itemName: "Hub Bolt",
        ordQuantity: 40,
        ordReqDate: "5/14/2025",
        ordStatus: "pending",
    },
    {
        id: 14,
        itemName: "Brake Lining",
        ordQuantity: 18,
        ordReqDate: "5/20/2025",
        ordStatus: "approved",
    },
    {
        id: 15,
        itemName: "Oil Filter",
        ordQuantity: 12,
        ordReqDate: "5/22/2025",
        ordStatus: "completed",
    },
    {
        id: 16,
        itemName: "Fuel Filter",
        ordQuantity: 9,
        ordReqDate: "5/25/2025",
        ordStatus: "pending",
    },
    {
        id: 17,
        itemName: "Brake Disc",
        ordQuantity: 6,
        ordReqDate: "5/26/2025",
        ordStatus: "approved",
    },
    {
        id: 18,
        itemName: "Diesel",
        ordQuantity: 150,
        ordReqDate: "5/27/2025",
        ordStatus: "completed",
    },
    {
        id: 19,
        itemName: "Diesel Exhaust Fluid",
        ordQuantity: 25,
        ordReqDate: "5/28/2025",
        ordStatus: "approved",
    },
    {
        id: 20,
        itemName: "Head Lights",
        ordQuantity: 10,
        ordReqDate: "5/30/2025",
        ordStatus: "pending",
    },
];

export default function OrderManagement() {
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
            id: "ordStatus",
            title: "Status",
            type: "checkbox",
            options: [
                { id: "completed", label: "Completed" },
                { id: "approved", label: "Approved" },
                { id: "pending", label: "Pending" }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "itemName", label: "Item Name" },
                { id: "ordQuantity", label: "Quantity" },
                { id: "ordReqDate", label: "Request Date" }
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
        if (filterValues.ordStatus && filterValues.ordStatus.length > 0) {
            newData = newData.filter(item => filterValues.ordStatus.includes(item.ordStatus));
        }

        // Sort by itemName or date
        if (filterValues.sortBy === "itemName") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.itemName.localeCompare(b.itemName) * sortOrder;
            });
        } else if (filterValues.sortBy === "ordReqDate") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.ordReqDate.localeCompare(b.ordReqDate) * sortOrder;
            });
        } else if (filterValues.sortBy === "ordQuantity") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.ordQuantity - b.ordQuantity) * sortOrder;
            });
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // for order status formatting
    function formatStatus(ordStatus: string) {
        switch (ordStatus) {
            case "completed":
                return "Completed";
            case "approved":
                return "Approved";
            case "pending":
                return "Pending";
            default:
                return ordStatus;
        }
    }

    // for the modals of add, view, edit, and delete
    const openModal = (mode: "add-order" | "view-order" | "edit-order", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-order":
                content = <AddOrderModal
                    onSave={handleAddOrder}
                    onClose={closeModal}
                />;
                break;
            case "view-order":
                content = <ViewOrderModal
                    item={rowData}
                    formatStatus={formatStatus}
                    onClose={closeModal}
                />;
                break;
            case "edit-order":
                if (rowData && rowData.ordStatus && rowData.ordStatus.toLowerCase() === "completed") {
                    showEditError(rowData.ordStatus, `This order cannot be edited because it has already been marked as <strong>${rowData.ordStatus}</strong>.`);
                    return;
                }
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

    // Handle add order
    const handleAddOrder = (orderForm: OrderForm) => {
        console.log("Saving form:", orderForm);
        // Logic to add order to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle edit order
    const handleEditOrder = (updatedItem: any) => {
        console.log("Updating item:", updatedItem);
        // Logic to update the item in the data
        // In a real app, this would likely be an API call
        closeModal();
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
                    <button type="button" className="generate-btn">
                        <i className="ri-receipt-line" /> Generate Report
                    </button>

                    {/* Add Order Button */}
                    <button className="main-btn" onClick={() => openModal("add-order")}>
                        <i className="ri-add-line" /> Add Order
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
                                    <th>Status</th>
                                    <th>Request Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {paginatedData.map(item => (
                                    <tr
                                        key={item.id}
                                        className={selectedIds.includes(item.id) ? "selected" : ""}
                                    >
                                        <td>{item.itemName}</td>
                                        <td>{item.ordQuantity}</td>
                                        <td className="table-status">
                                            <span className={`chip ${item.ordStatus}`}>
                                                {formatStatus(item.ordStatus)}
                                            </span>
                                        </td>
                                        <td>{item.ordReqDate}</td>
                                        <td>
                                            <ActionButtons
                                                onView={() => openModal("view-order", item)}
                                                onEdit={() => openModal("edit-order", item)}
                                                disableEdit={item.ordStatus.toLowerCase() === "completed"}
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