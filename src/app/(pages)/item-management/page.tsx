"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";

import AddItemModal, { ItemForm } from "./addItemModal";
import ViewItemModal from "./viewItemModal";
import EditItemModal from "./editItemModal";
import AddCategoryModal, { CategoryForm } from "./category/addCategoryModal";
import { getItems, createItem, updateItem } from '@/app/lib/api';

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/loading.css"

export default function ItemManagement() {
    // for modal
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<any>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // For filtering
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [allItems, setAllItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

        // Start with all items from API
        let newData = [...allItems];

        // Filter by status if selected
        if (filterValues.itemStatus && filterValues.itemStatus.length > 0) {
            newData = newData.filter(item => {
                const status = (item.status || '').toLowerCase();
                return filterValues.itemStatus.some((s: string) => status.includes(s.toLowerCase()));
            });
        }

        // Sort by itemName or linkedSupplier
        if (filterValues.sortBy === "itemName") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.itemName ?? "").localeCompare(b.itemName ?? "") * sortOrder;
            });
        } else if (filterValues.sortBy === "linkedSupplier") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                const aCount = a.supplierItems?.length || 0;
                const bCount = b.supplierItems?.length || 0;
                return (aCount - bCount) * sortOrder;
            });
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
    const handleAddItem = async (itemForm: ItemForm & { linkedItems?: any[] }) => {
        try {
            setLoading(true);
            const payload = {
                stockItems: [
                    {
                        itemName: itemForm.itemName,
                        unit: itemForm.itemUnit,
                        category: itemForm.itemCategory,
                        status: itemForm.itemStatus,
                        description: itemForm.itemDescription,
                        // if linked suppliers exist, attach minimal supplier info — server will resolve
                        linkedSuppliers: itemForm['linkedSuppliers'] || []
                    }
                ]
            };
            await createItem(payload);
            const data = await getItems();
            setAllItems(data.items || []);
            setFilteredData(data.items || []);
        } catch (err) {
            console.error('Error creating item', err);
        } finally {
            setLoading(false);
            closeModal();
        }
    };

    // Handle edit item
    const handleEditItem = async (updatedItem: any & { linkedSuppliers?: any[] }) => {
        try {
            setLoading(true);
            const payload = {
                item_id: updatedItem.id || updatedItem.itemId || updatedItem.item_id,
                reorder_level: updatedItem.reorderLevel || updatedItem.reorder_level || 0,
                status: updatedItem.itemStatus || updatedItem.status,
                category_id: updatedItem.itemCategory || updatedItem.categoryId,
                // include linked suppliers if any
                linkedSuppliers: updatedItem.linkedSuppliers || []
            };
            await updateItem(payload);
            const data = await getItems();
            setAllItems(data.items || []);
            setFilteredData(data.items || []);
        } catch (err) {
            console.error('Error updating item', err);
        } finally {
            setLoading(false);
            closeModal();
        }
    };

    // initial load of items
    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const data = await getItems();
                if (mounted) {
                    setAllItems(data.items || []);
                    setFilteredData(data.items || []);
                }
            } catch (err) {
                console.error('Failed to load items', err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false };
    }, []);

    // Handle add category
    const handleAddCategory = (categoryForm: CategoryForm) => {
        console.log("Saving form:", categoryForm);
        // Logic to add category to the data
        // In a real app, this would likely be an API call
        closeModal();
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
                    <button
                        type="button"
                        className="generate-btn"
                    // onClick={handleGenerateReport}
                    >
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
                                        <td>{item.unitMeasure}</td>
                                        <td>{item.category?.categoryName || 'N/A'}</td>
                                        <td className="table-status">
                                            <span className={`chip ${(item.status || '').toLowerCase()}`}>
                                                {formatStatus(item.status)}
                                            </span>
                                        </td>
                                        <td>{item.supplierItems?.length || 0}</td>
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

        </div>
    );
}