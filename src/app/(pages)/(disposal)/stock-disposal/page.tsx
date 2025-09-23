"use client";

import React, { useState, useMemo, useEffect } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";
import Loading from "@/components/loading";

import AddStockDisposalModal, { StockDisposalForm } from "./addStockDisposalModal";
import ViewStockDisposalModal from "./viewStockDisposalModal";
// import EditStockDisposalModal from "./editStockDisposalModal";
import { fetchDisposals, createDisposal, StockDisposal as StockDisposalType } from "@/app/lib/fetchDisposals";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/loading.css"

// initial empty list - will be populated from API
const hardcodedData: any[] = [];


export default function StockDisposal() {
    // for modal
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<any>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // For filtering
    const [filteredData, setFilteredData] = useState<any[]>(hardcodedData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load disposals from backend
    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const res = await fetchDisposals('stock');
                if (res && res.success) {
                    // map stockDisposals to table rows
                    const mapped = res.data.stockDisposals.map((d: StockDisposalType, idx: number) => ({
                        id: idx + 1,
                        disposal_id: d.disposal_id,
                        sku: d.inventoryItem?.item_id || d.item_id,
                        itemName: d.inventoryItem?.item_name || '',
                        category: d.inventoryItem?.category?.category_name || '',
                        stockDisposalDate: new Date(d.disposal_date).toLocaleDateString(),
                        raw: d
                    }));

                    setFilteredData(mapped);
                }
            } catch (err) {
                console.error('Error loading stock disposals', err);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

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
    const handleAddStockDisposal = async (stockDisposalForm: StockDisposalForm) => {
        try {
            // Map frontend form to API payload
            const payload = {
                type: 'stock',
                item_id: stockDisposalForm.sku, // assuming SKU maps to item_id
                batch_id: null,
                quantity: stockDisposalForm.quantityDisposal,
                disposal_date: stockDisposalForm.stockDisposalDate,
                disposal_method: stockDisposalForm.stockDisposalMethod,
                reason: stockDisposalForm.stockDisposalReason,
                remarks: stockDisposalForm.stockDisposalRemarks,
                created_by: 'USR-00001'
            };

            const result = await createDisposal(payload as any);
            if (result.success) {
                // refresh list
                const res = await fetchDisposals('stock');
                if (res && res.success) {
                    const mapped = res.data.stockDisposals.map((d: StockDisposalType, idx: number) => ({
                        id: idx + 1,
                        disposal_id: d.disposal_id,
                        sku: d.inventoryItem?.item_id || d.item_id,
                        itemName: d.inventoryItem?.item_name || '',
                        category: d.inventoryItem?.category?.category_name || '',
                        stockDisposalDate: new Date(d.disposal_date).toLocaleDateString(),
                        raw: d
                    }));

                    setFilteredData(mapped);
                }

                closeModal();
            } else {
                // API returned failure — show console for now (modal shows its own alerts)
                console.error('Failed to create disposal', result.error);
            }
        } catch (err) {
            console.error('Error creating stock disposal', err);
        }
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

            {isLoading ? (
                <Loading />
            ) : (
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
                                    {error ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', color: 'red' }}>
                                                {error}
                                            </td>
                                        </tr>
                                    ) : paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center' }}>
                                                No stock disposals found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map(item => (
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
                        totalItems={paginatedData.length}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            )}

            {/* Dynamic Modal Manager */}
            <ModalManager
                isOpen={isModalOpen}
                onClose={closeModal}
                modalContent={modalContent}
            />

        </div>
    );
}