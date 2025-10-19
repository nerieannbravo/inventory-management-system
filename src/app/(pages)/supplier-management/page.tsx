"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";

import AddSupplierModal, { SupplierForm } from "./addSupplierModal";
import ViewSupplierModal from "./viewSupplierModal";
import EditSupplierModal from "./editSupplierModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/loading.css"

const hardcodedData = [
    {
        id: 1,
        supplierName: "Kang Seulgi",
        supplierAdress: "Choji-dong, South Korea",
        supplierContact: "09123456789",
        supplierEmail: "seulgi@redvelvet.com",
        supplierStatus: "active",
        linkedItem: 2,
    },
    {
        id: 2,
        supplierName: "Bae Joohyun",
        supplierAdress: "Daegu, South Korea",
        supplierContact: "09375839774",
        supplierEmail: "irene@redvelvet.com",
        supplierStatus: "active",
        linkedItem: 1,
    },
    {
        id: 3,
        supplierName: "Son Seungwan",
        supplierAdress: "Seoul, South Korea",
        supplierContact: "09288466274",
        supplierEmail: "wendy@redvelvet.com",
        supplierStatus: "inactive",
        linkedItem: 3,
    },
    {
        id: 4,
        supplierName: "Park Sooyoung",
        supplierAdress: "Jeju-do, South Korea",
        supplierContact: "09747281193",
        supplierEmail: "joy@redvelvet.com",
        supplierStatus: "active",
        linkedItem: 4,
    },
    {
        id: 5,
        supplierName: "Kim Yerim",
        supplierAdress: "Seoul, South Korea",
        supplierContact: "09338592064",
        supplierEmail: "yeri@redvelvet.com",
        supplierStatus: "inactive",
        linkedItem: 2,
    },
];



export default function SupplierManagement() {
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
            id: "supplierStatus",
            title: "Status",
            type: "checkbox",
            options: [
                { id: "active", label: "Active" },
                { id: "inactive", label: "Inactive" }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "supplierName", label: "Supplier Name" },
                { id: "linkedItem", label: "Linked Supplier" }
            ],
            defaultValue: "supplierName"
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
        if (filterValues.supplierStatus && filterValues.supplierStatus.length > 0) {
            newData = newData.filter(supplier => filterValues.supplierStatus.includes(supplier.supplierStatus));
        }

        // Sort by supplierName or linkedItem
        if (filterValues.sortBy === "supplierName") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.supplierName ?? "").localeCompare(b.supplierName ?? "") * sortOrder;
            });
        } else if (filterValues.sortBy === "linkedItem") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.linkedItem ?? 0) - (b.linkedItem ?? 0) * sortOrder;
            });
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };


    // for order status formatting
    function formatStatus(supplierStatus: string) {
        switch (supplierStatus) {
            case "active":
                return "Active";
            case "inactive":
                return "Inactive";
            default:
                return supplierStatus;
        }
    }

    // for the modals of add, view, and edit
    const openModal = (mode: "add-supplier" | "view-supplier" | "edit-supplier", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-supplier":
                content = <AddSupplierModal
                    onSave={handleAddSupplier}
                    onClose={closeModal}
                />;
                break;
            case "view-supplier":
                content = <ViewSupplierModal
                    item={rowData}
                    formatStatus={formatStatus}
                    onClose={closeModal}
                />;
                break;
            case "edit-supplier":
                content = <EditSupplierModal
                    item={rowData}
                    onSave={handleEditSupplier}
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

    // Handle add supplier
    const handleAddSupplier = (supplierForm: SupplierForm) => {
        console.log("Saving form:", supplierForm);
        // Logic to add supplier to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle edit supplier
    const handleEditSupplier = (updatedSupplier: any) => {
        console.log("Updating supplier:", updatedSupplier);
        // Logic to update the supplier in the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    return (
        <div className="card">
            <h1 className="title">Supplier Management</h1>

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

                    {/* Add Supplier Button */}
                    <button className="main-btn" onClick={() => openModal("add-supplier")}>
                        <i className="ri-add-line" /> Add Supplier
                    </button>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-heading">
                                <tr>
                                    <th>Supplier Name</th>
                                    <th>Address</th>
                                    <th>Contact Number</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Linked Item</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {paginatedData.map(supplier => (
                                    <tr
                                        key={supplier.id}
                                        className={selectedIds.includes(supplier.id) ? "selected" : ""}
                                    >
                                        <td>{supplier.supplierName}</td>
                                        <td>{supplier.supplierAdress}</td>
                                        <td>{supplier.supplierContact}</td>
                                        <td>{supplier.supplierEmail}</td>
                                        <td className="table-status">
                                            <span className={`chip ${supplier.supplierStatus}`}>
                                                {formatStatus(supplier.supplierStatus)}
                                            </span>
                                        </td>
                                        <td>{supplier.linkedItem}</td>
                                        <td>
                                            <ActionButtons
                                                onView={() => openModal("view-supplier", supplier)}
                                                onEdit={() => openModal("edit-supplier", supplier)}
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