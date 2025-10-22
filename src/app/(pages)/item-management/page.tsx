"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";
// import Loading from "@/components/loading";

import AddItemModal, { ItemForm } from "./addItemModal";
import ViewItemModal from "./viewItemModal";
import EditItemModal from "./editItemModal";
import AddCategoryModal, { CategoryForm } from "./category/addCategoryModal";
import { ItemReportPreviewModal } from "./itemReportPDF";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/loading.css"

const hardcodedData = [
    {
        id: 1,
        itemName: "Tires",
        itemUnit: "pcs",
        itemCategory: "Consumable",
        itemStatus: "active",
        linkedSupplier: 2,
    },
    {
        id: 2,
        itemName: "Lathe Machine",
        itemUnit: "unit",
        itemCategory: "Machine",
        itemStatus: "active",
        linkedSupplier: 1,
    },
    {
        id: 3,
        itemName: "Welding Machine",
        itemUnit: "unit",
        itemCategory: "Equipment",
        itemStatus: "inactive",
        linkedSupplier: 3,
    },
    {
        id: 4,
        itemName: "Hammer",
        itemUnit: "pcs",
        itemCategory: "Tool",
        itemStatus: "active",
        linkedSupplier: 4,
    },
    {
        id: 5,
        itemName: "Hydraulic Oil",
        itemUnit: "liters",
        itemCategory: "Consumable",
        itemStatus: "active",
        linkedSupplier: 2,
    },
    {
        id: 6,
        itemName: "Compressor",
        itemUnit: "unit",
        itemCategory: "Equipment",
        itemStatus: "active",
        linkedSupplier: 5,
    },
    {
        id: 7,
        itemName: "Wrench Set",
        itemUnit: "sets",
        itemCategory: "Tool",
        itemStatus: "inactive",
        linkedSupplier: 3,
    },
    {
        id: 8,
        itemName: "Drill Press",
        itemUnit: "unit",
        itemCategory: "Machine",
        itemStatus: "active",
        linkedSupplier: 6,
    },
    {
        id: 9,
        itemName: "Cutting Discs",
        itemUnit: "pcs",
        itemCategory: "Consumable",
        itemStatus: "active",
        linkedSupplier: 4,
    },
    {
        id: 10,
        itemName: "Safety Gloves",
        itemUnit: "pairs",
        itemCategory: "Tool",
        itemStatus: "active",
        linkedSupplier: 1,
    },
];



export default function ItemManagement() {
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
    const [reportTitle, setReportTitle] = useState("Item Management Report");

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
            id: "itemStatus",
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
                { id: "itemName", label: "Item Name" },
                { id: "linkedSupplier", label: "Linked Supplier" }
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

        // Keep a copy of the raw filters in state for other usages (report title check, etc.)
        setFilterValues(filterValues);

        let newData = [...hardcodedData];

        // normalizes a value to a simple comparable token (lowercase, remove non-alphanumerics)
        const normalize = (value: any) =>
            (value === null || value === undefined) ? "" : String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

        // Filter by status if selected
        if (filterValues.itemStatus && filterValues.itemStatus.length > 0) {
            const normalizedFilters = filterValues.itemStatus.map((filter: string) => normalize(filter));
            newData = newData.filter(item => normalizedFilters.includes(normalize(item.itemStatus)));
        }

        // Sorting
        const orderMultiplier = filterValues.order === "desc" ? -1 : 1;
        if (filterValues.sortBy === "itemName") {
            newData.sort((a, b) => a.itemName.localeCompare(b.itemName) * orderMultiplier);
        } else if (filterValues.sortBy === "linkedSupplier") {
            newData.sort((a, b) => ((a.linkedSupplier ?? 0) - (b.linkedSupplier ?? 0)) * orderMultiplier);
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // for order status formatting
    function formatStatus(itemStatus: string) {
        switch (itemStatus) {
            case "active":
                return "Active";
            case "inactive":
                return "Inactive";
            default:
                return itemStatus;
        }
    }

    // for the modals of add, view, and edit
    const openModal = (mode: "add-item" | "view-item" | "edit-item" | "add-category", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-item":
                content = <AddItemModal
                    onSave={handleAddItem}
                    onClose={closeModal}
                />;
                break;
            case "view-item":
                content = <ViewItemModal
                    item={rowData}
                    formatStatus={formatStatus}
                    onClose={closeModal}
                />;
                break;
            case "edit-item":
                content = <EditItemModal
                    item={rowData}
                    onSave={handleEditItem}
                    onClose={closeModal}
                />;
                break;
            case "add-category":
                content = <AddCategoryModal
                    onSave={handleAddCategory}
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

    // Handle add item
    const handleAddItem = (itemForm: ItemForm) => {
        console.log("Saving form:", itemForm);
        // Logic to add item to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle edit item
    const handleEditItem = (updatedItem: any) => {
        console.log("Updating item:", updatedItem);
        // Logic to update the item in the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle add category
    const handleAddCategory = (categoryForm: CategoryForm) => {
        console.log("Saving form:", categoryForm);
        // Logic to add category to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle generate report
    const handleGenerateReport = () => {
        // Check if any filters are applied. 
        // Modify this logic based on actual searching or filtering implementation.
        const hasFilters = filteredData.length !== hardcodedData.length;

        const title = hasFilters ? "Item Management Report - Filtered" : "Item Management Report";

        setReportTitle(title);
        setShowReportPreview(true);
    };

    // Handle close report
    const handleCloseReportPreview = () => {
        setShowReportPreview(false);
    };

    return (
        <div className="card">
            <h1 className="title">Item Management</h1>

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

                    {/* Add Category Button */}
                    <button
                        type="button"
                        className="default-btn"
                        onClick={() => openModal("add-category")}
                    >
                        <i className="ri-apps-2-add-line" /> Add Category
                    </button>

                    {/* Generate Report Button */}
                    <button type="button" className="generate-btn" onClick={handleGenerateReport}>
                        <i className="ri-receipt-line" /> Generate Report
                    </button>

                    {/* Add Item Button */}
                    <button className="main-btn" onClick={() => openModal("add-item")}>
                        <i className="ri-add-line" /> Add Item
                    </button>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-heading">
                                <tr>
                                    <th>Item Name</th>
                                    <th>Unit Measure</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Linked Supplier</th>
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
                                        <td>{item.itemUnit}</td>
                                        <td>{item.itemCategory}</td>
                                        <td className="table-status">
                                            <span className={`chip ${item.itemStatus}`}>
                                                {formatStatus(item.itemStatus)}
                                            </span>
                                        </td>
                                        <td>{item.linkedSupplier}</td>
                                        <td>
                                            <ActionButtons
                                                onView={() => openModal("view-item", item)}
                                                onEdit={() => openModal("edit-item", item)}
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

            {/* Item Management Report Preview Modal */}
            <ItemReportPreviewModal
                isOpen={showReportPreview}
                onClose={handleCloseReportPreview}
                itemData={filteredData}
                reportTitle={reportTitle}
            />

        </div>
    );
}