"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";

import AddStockDisposalModal, { StockDisposalForm } from "./addStockDisposalModal";
import ViewStockDisposalModal from "./viewStockDisposalModal";
// import EditStockDisposalModal from "./editStockDisposalModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"

const hardcodedData = [
    {
        id: 1,
        sku: "SKU-0001",
        itemName: "Brake Disc",
        category: "Consumable",
        stockDisposalDate: "2025-06-01",
    },
    {
        id: 2,
        sku: "SKU-0002",
        itemName: "Head Lights",
        category: "Consumable",
        stockDisposalDate: "2025-06-02",
    },
    {
        id: 3,
        sku: "SKU-0003",
        itemName: "Red Paint",
        category: "Consumable",
        stockDisposalDate: "2025-06-03",
    },
    {
        id: 4,
        sku: "SKU-0004",
        itemName: "Brake Lining",
        category: "Consumable",
        stockDisposalDate: "2025-06-04",
    },
    {
        id: 5,
        sku: "SKU-0005",
        itemName: "Diesel",
        category: "Consumable",
        stockDisposalDate: "2025-06-05",
    },
    {
        id: 6,
        sku: "SKU-0006",
        itemName: "Hub Bolt",
        category: "Consumable",
        stockDisposalDate: "2025-06-06",
    },
    {
        id: 7,
        sku: "SKU-0007",
        itemName: "Red Paint",
        category: "Consumable",
        stockDisposalDate: "2025-06-07",
    },
    {
        id: 8,
        sku: "SKU-0008",
        itemName: "Oil Filter",
        category: "Consumable",
        stockDisposalDate: "2025-06-08",
    },
    {
        id: 9,
        sku: "SKU-0009",
        itemName: "Diesel Exhaust Fluid",
        category: "Consumable",
        stockDisposalDate: "2025-06-09",
    },
    {
        id: 10,
        sku: "SKU-0010",
        itemName: "Diesel",
        category: "Consumable",
        stockDisposalDate: "2025-06-10",
    },
    {
        id: 11,
        sku: "SKU-0011",
        itemName: "Fuel Filter",
        category: "Consumable",
        stockDisposalDate: "2025-06-11",
    },
    {
        id: 12,
        sku: "SKU-0012",
        itemName: "Head Lights",
        category: "Consumable",
        stockDisposalDate: "2025-06-12",
    },
    {
        id: 13,
        sku: "SKU-0013",
        itemName: "Hub Bolt",
        category: "Consumable",
        stockDisposalDate: "2025-06-13",
    },
    {
        id: 14,
        sku: "SKU-0014",
        itemName: "Brake Lining",
        category: "Consumable",
        stockDisposalDate: "2025-06-14",
    },
    {
        id: 15,
        sku: "SKU-0015",
        itemName: "Oil Filter",
        category: "Consumable",
        stockDisposalDate: "2025-06-15",
    },
    {
        id: 16,
        sku: "SKU-0016",
        itemName: "Fuel Filter",
        category: "Consumable",
        stockDisposalDate: "2025-06-16",
    },
    {
        id: 17,
        sku: "SKU-0017",
        itemName: "Brake Disc",
        category: "Consumable",
        stockDisposalDate: "2025-06-17",
    },
    {
        id: 18,
        sku: "SKU-0018",
        itemName: "Diesel",
        category: "Consumable",
        stockDisposalDate: "2025-06-18",
    },
    {
        id: 19,
        sku: "SKU-0019",
        itemName: "Diesel Exhaust Fluid",
        category: "Consumable",
        stockDisposalDate: "2025-06-19",
    },
    {
        id: 20,
        sku: "SKU-0020",
        itemName: "Head Lights",
        category: "Consumable",
        stockDisposalDate: "2025-06-20",
    },
];


export default function StockDisposal() {
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
            id: "stockDisposalCategory",
            title: "Category",
            type: "checkbox",
            options: [
                { id: "consumable", label: "Consumable" },
                { id: "tool", label: "Tool" },
                { id: "equipment", label: "Equipment" },
                { id: "machine", label: "Machine" }
            ],
            defaultValue: "stockDisposalDate"
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "stockDisposalDate", label: "Disposal Date" },
                { id: "sku", label: "SKU" },
                { id: "item", label: "Item Name" }
            ],
            defaultValue: "stockDisposalDate"
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
        // if (filterValues.busMaintenanceStatus && filterValues.busMaintenanceStatus.length > 0) {
        //     newData = newData.filter(item => filterValues.busMaintenanceStatus.includes(item.busMaintenanceStatus));
        // }

        // Sort by body number or date
        if (filterValues.sortBy === "sku") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.sku.localeCompare(b.sku) * sortOrder;
            });
        } else if (filterValues.sortBy === "stockDisposalDate") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.stockDisposalDate ?? "").localeCompare(b.stockDisposalDate ?? "") * sortOrder;
            });
        } else if (filterValues.sortBy === "itemName") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.itemName ?? "").localeCompare(b.itemName ?? "") * sortOrder;
            });
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // for the modals of add, view, and edit
    const openModal = (mode: "add-stock-disposal" | "view-stock-disposal" | "edit-stock-disposal", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-stock-disposal":
                content = <AddStockDisposalModal
                    onSave={handleAddStockDisposal}
                    onClose={closeModal}
                />;
                break;
            case "view-stock-disposal":
                content = <ViewStockDisposalModal
                    item={rowData}
                    // formatStatus={formatStatus}
                    onClose={closeModal}
                />;
                break;
            // case "edit-stock-disposal":
            //     content = <EditStockDisposalModal
            //         item={rowData}
            //         onSave={handleEditStockDisposal}
            //         onClose={closeModal}
            //     />;
            //     break;
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

    // Handle add stock disposal
    const handleAddStockDisposal = (stockDisposalForm: StockDisposalForm) => {
        console.log("Saving form:", stockDisposalForm);
        // Logic to add bus to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle edit stock disposal
    // const handleEditStockDisposal = (updatedItem: any) => {
    //     console.log("Updating item:", updatedItem);
    //     // Logic to update the item in the data
    //     // In a real app, this would likely be an API call
    //     closeModal();
    // };

    return (
        <div className="card">
            <h1 className="title">Stock Disposal</h1>

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

                    {/* Add Stock Disposal Button */}
                    <button className="main-btn" onClick={() => openModal("add-stock-disposal")}>
                        <i className="ri-add-line" /> Add Disposal
                    </button>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-heading">
                                <tr>
                                    <th>SKU</th>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Disposal Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {paginatedData.map(item => (
                                    <tr
                                        key={item.id}
                                        className={selectedIds.includes(item.id) ? "selected" : ""}
                                    >
                                        <td>{item.sku}</td>
                                        <td>{item.itemName}</td>
                                        <td>{item.category}</td>
                                        <td>{item.stockDisposalDate}</td>
                                        <td>
                                            <ActionButtons
                                                onView={() => openModal("view-stock-disposal", item)}
                                                // onEdit={() => openModal("edit-stock-disposal", item)}
                                            // disableEdit={item.busDisposalStatus !== "pending" && item.busDisposalStatus !== "approved"}
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