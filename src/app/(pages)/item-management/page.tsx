"use client";

import React, { useState, useMemo, useEffect } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";
import Loading from "@/components/loading";

import AddItemModal from "./addItemModal";
import ViewItemModal from "./viewItemModal";
import EditItemModal from "./editItemModal";
import { showItemUpdateError } from '@/utils/sweetAlert';
import AddCategoryModal, { CategoryForm } from "./category/addCategoryModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/loading.css"

interface Item {
    id: number;
    item_name: string;
    item_unit: string;
    unit : {
        id: number;
        unit_name: string;
    }
    item_category: string;
    category : {
        id: number;
        category_name: string;
    }
    status: string;
    description: string;
    linkedSupplier?: number | string;
    supplierCount?: number;
};

export default function ItemManagement() {
    // for modal
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // Data from API
    const [originalData, setOriginalData] = useState<Item[]>([]);
    // Preloaded lookup lists
    const [preloadedUnits, setPreloadedUnits] = useState<Array<{ id: number; unit_name: string; abbreviation: string }>>([]);
    const [preloadedCategories, setPreloadedCategories] = useState<Array<{ id: number; category_id: string; category_name: string }>>([]);
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch items on mount
    useEffect(() => {
        let mounted = true;
        async function loadItems() {
            setLoading(true);
            try {
                const res = await fetch('/api/items');
                if (!res.ok) throw new Error(`Failed to fetch items: ${res.status}`);
                const body = await res.json();
                const items: Item[] = Array.isArray(body) ? body : body.data ?? [];
                if (mounted) {
                    setOriginalData(items);
                    setError(null);
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                if (mounted) setError(message);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadItems();
        // concurrently preload units and categories
        (async () => {
            try {
                const [uRes, cRes] = await Promise.all([fetch('/api/units'), fetch('/api/category')]);
                const uBody = await uRes.json().catch(() => ({}));
                const cBody = await cRes.json().catch(() => ({}));
                if (mounted) {
                    if (uRes.ok && uBody?.units) setPreloadedUnits(uBody.units);
                    if (cRes.ok && cBody?.categories) setPreloadedCategories(cBody.categories);
                }
            } catch (e) {
                console.error('Failed to preload units/categories', e);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // default number of rows per page

    // Compute filtered & searched items (similar to stock-in module)
    const filteredAndSearchedItems = useMemo(() => {
        let filtered = [...originalData];

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(item =>
                item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.unit.unit_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.supplierCount?.toString().includes(searchTerm)
            );
        }

        // Apply status filter
        if (Array.isArray(filterValues.status) && filterValues.status.length > 0) {
            const statuses = filterValues.status as string[];
            filtered = filtered.filter(item => statuses.includes(String(item.status)));
        }

        // Apply date range if available (use date_created or date_updated if present)
        if (filterValues.dateRange && typeof filterValues.dateRange === 'object') {
            const dr = filterValues.dateRange as { from?: string; to?: string };
            if (dr.from || dr.to) {
                filtered = filtered.filter(item => {
                    const dateStr = (item as unknown as { date_updated?: string; date_created?: string }).date_updated ?? (item as unknown as { date_updated?: string; date_created?: string }).date_created;
                    if (!dateStr) return false;
                    const itemDate = new Date(dateStr);
                    const fromDate = dr.from ? new Date(dr.from) : null;
                    const toDate = dr.to ? new Date(dr.to) : null;
                    if (fromDate) fromDate.setHours(0,0,0,0);
                    if (toDate) toDate.setHours(23,59,59,999);
                    if (fromDate && toDate) return itemDate >= fromDate && itemDate <= toDate;
                    if (fromDate) return itemDate >= fromDate;
                    if (toDate) return itemDate <= toDate;
                    return true;
                });
            }
        }

        // Sorting
        const sortBy = filterValues.sortBy ?? "date_created";
        const order = (filterValues.order ?? "desc");

        filtered.sort((a, b) => {
            let aValue: string | number = 0;
            let bValue: string | number = 0;
            switch (sortBy) {
                case "item_name":
                case "item_name":
                    aValue = String(a.item_name ?? a.item_name ?? "").toLowerCase();
                    bValue = String(b.item_name ?? b.item_name ?? "").toLowerCase();
                    break;
                case "supplierCount":
                    aValue = Number(a.supplierCount ?? 0);
                    bValue = Number(b.supplierCount ?? 0);
                    break;
                case "linkedSupplier":
                    aValue = Number(a.linkedSupplier ?? 0);
                    bValue = Number(b.linkedSupplier ?? 0);
                    break;
                case "date_created":
                default:
                    aValue = (a as unknown as { date_created?: string }).date_created ? new Date((a as unknown as { date_created?: string }).date_created!).getTime() : 0;
                    bValue = (b as unknown as { date_created?: string }).date_created ? new Date((b as unknown as { date_created?: string }).date_created!).getTime() : 0;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const cmp = aValue.localeCompare(bValue);
                return order === 'asc' ? cmp : -cmp;
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                const cmp = aValue - bValue;
                return order === 'asc' ? cmp : -cmp;
            }
            return 0;
        });

        return filtered;
    }, [originalData, searchTerm, filterValues]);

    // Pagination derived from computed results
    const totalPages = Math.ceil(filteredAndSearchedItems.length / pageSize);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSearchedItems.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSearchedItems, currentPage, pageSize]);

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
            id: "status",
            title: "Status",
            type: "checkbox",
            options: [
                { id: "ACTIVE", label: "Active" },
                { id: "INACTIVE", label: "Inactive" }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "item_name", label: "Item Name" },
                { id: "linkedSupplier", label: "Linked Supplier" },
            ],
            defaultValue: "item_name"
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

    // Handle filter application (store filter values so useMemo recomputes)
    const handleApplyFilters = (newFilterValues: Record<string, unknown>) => {
        console.log("Applied filters:", newFilterValues);
        setFilterValues(newFilterValues);
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };


    // Normalize status value from item — backend may use `status` or `status` and different casing
    const getStatusValue = (item: Item) => {
        // prefer item.status, then item.status if present on the object
        const maybe1 = (item as unknown as Record<string, unknown>).status;
        const maybe2 = (item as unknown as Record<string, unknown>).status;
        const raw = typeof maybe1 === 'string' ? maybe1 : (typeof maybe2 === 'string' ? String(maybe2) : "");
        return raw;
    };

    // Human-friendly label
    const formatStatus = (raw?: string) => {
        if (!raw) return "";
        const s = String(raw).toLowerCase();
        // handle common status values
        if (s === 'ACTIVE') return 'Active';
        if (s === 'INACTIVE') return 'Inactive';
        // fallback: capitalize first letter
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    // CSS class name for status chips
    const getStatusClass = (raw?: string) => {
        if (!raw) return '';
        const s = String(raw).toLowerCase();
        if (s === 'active') return 'active';
        if (s === 'inactive') return 'inactive';
        return s.replace(/_/g, '-').replace(/\s+/g, '-');
    };

    // for the modals of add, view, and edit
    const openModal = (mode: "add-item" | "view-item" | "edit-item" | "add-category", rowData?: Item | null) => {
        let content;

        // Map backend item shape to UI item shape expected by modals
        const uiItem = rowData
            ? {
                id: rowData.id,
                item_name: rowData.item_name ?? "",
                // pass simple strings to modals (prefer relation display)
                item_unit: rowData.unit?.unit_name ?? rowData.item_unit ?? "",
                item_category: rowData.category?.category_name ?? rowData.item_category ?? "",
                // support both `status` and `status` coming from different APIs
                status: (rowData as unknown as Record<string, unknown>).status ?? (rowData as unknown as Record<string, unknown>).status ?? "",
                // support description variants
                description: (rowData as unknown as Record<string, unknown>).description ?? (rowData as unknown as Record<string, unknown>).desc ?? "",
            }
            : undefined;

        switch (mode) {
            case "add-item":
                content = <AddItemModal
                    onSave={handleAddItem}
                    onClose={closeModal}
                    preloadedUnits={preloadedUnits}
                    preloadedCategories={preloadedCategories}
                />;
                break;
            case "view-item":
                content = <ViewItemModal
                    item={uiItem as Item}
                    formatStatus={formatStatus}
                    onClose={closeModal}
                />;
                break;
            case "edit-item":
                content = <EditItemModal
                    item={uiItem as Item}
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
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };

    // Toggle selection (used to avoid unused setter warning)
    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    // Handle add item
    const handleAddItem = (createdItem: Record<string, unknown>) => {
        console.log("Saving form:", createdItem);
        // Logic to add item to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    // Handle edit item (accept any shape from modal and process)
    const handleEditItem = async (updatedItem: Record<string, unknown>) => {
        console.log("Updating item:", updatedItem);
        // Call API to update item
        try {
            const res = await fetch('/api/items', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedItem) });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                if (res.status === 409) {
                    await showItemUpdateError(body?.error ?? 'Item name already exists');
                    return; // keep modal open so user can change
                }
                throw new Error(body?.error ?? `Failed to update item (status ${res.status})`);
            }

            // update local state
            const updated = body as Item;
            setOriginalData(prev => prev.map(it => it.id === updated.id ? { ...it, ...updated } : it));
            closeModal();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('Failed to update item', msg);
            await showItemUpdateError(msg);
        }
    };

    // Handle add category
    const handleAddCategory = (categoryForm: CategoryForm) => {
        console.log("Saving form:", categoryForm);
        // Logic to add category to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    if (loading) {
            return (
                <div className="card">
                    <h1 className="title">Item Management</h1>
                    <Loading />
                </div>
            );
        }

    return (
        <div className="card">
            <h1 className="title">Item Management</h1>

            {/* Search Engine and Filters */}
            <div className="elements">
                <div className="entries">
                    <div className="search">
                        <i className="ri-search-line" />
                        <input type="text" placeholder="Search here..." value={searchTerm} onChange={handleSearchChange} />
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
                                    <th>Suppliers</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {error ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', color: 'red' }}>{error}</td>
                                    </tr>
                                ) : paginatedData.length === 0 ? (
                                     <tr>
                                        <td colSpan={7} className="no-records">
                                            {searchTerm || Object.keys(filterValues).some(key =>
                                                filterValues[key] &&
                                                (Array.isArray(filterValues[key]) ? filterValues[key].length > 0 : true)
                                            )
                                                ? 'No items matched'
                                                : 'No stock items available'
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((item: Item) => (
                                        <tr
                                            key={item.id}
                                            className={selectedIds.includes(item.id) ? "selected" : ""}
                                            onClick={() => toggleSelect(item.id)}
                                        >
                                            <td>{item.item_name ?? item.item_name}</td>
                                            <td>{item.unit.unit_name}</td>
                                            <td>{item.category.category_name}</td>
                                            <td className="table-status">
                                                <span className={`chip ${getStatusClass(getStatusValue(item))}`}>
                                                    {formatStatus(getStatusValue(item))}
                                                </span>
                                            </td>
                                            <td>{item.supplierCount ?? 0}</td>
                                            <td>
                                                <ActionButtons
                                                    onView={() => openModal("view-item", item)}
                                                    onEdit={() => openModal("edit-item", item)}
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

            {/* Dynamic Modal Manager */}
            <ModalManager
                isOpen={isModalOpen}
                onClose={closeModal}
                modalContent={modalContent}
            />

        </div>
    );
}