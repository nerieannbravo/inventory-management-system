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
import { getItems, createItem, updateItem, getCategories } from '@/app/lib/api';

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
    const [categories, setCategories] = useState<any[]>([]);
    const [unitMeasures, setUnitMeasures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoriesRefreshKey, setCategoriesRefreshKey] = useState(0);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState("");

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

    // Filter sections - ensure unique IDs for options
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
                { id: "item-status-active", label: "Active" },
                { id: "item-status-inactive", label: "Inactive" }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "item-sort-name", label: "Item Name" },
                { id: "item-sort-supplier", label: "Linked Supplier" }
            ],
            defaultValue: "item-sort-name"
        },
        {
            id: "order",
            title: "Order",
            type: "radio",
            options: [
                { id: "item-order-asc", label: "Ascending" },
                { id: "item-order-desc", label: "Descending" }
            ],
            defaultValue: "item-order-asc"
        }
    ];

    // Handle search - searches in Item Name, Unit Measure, Category, and Item Status
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        applyFiltersAndSearch(query, {}); // Apply with current search and no new filters
    };

    // Combined filter and search function
    const applyFiltersAndSearch = (search: string, filterValues: Record<string, any>) => {
        let newData = [...allItems];

        // Apply search filter - Search in: Item Name, Unit Measure, Category, Item Status
        if (search.trim()) {
            const searchLower = search.toLowerCase().trim();
            newData = newData.filter(item => {
                // Search in Item Name
                const itemName = (item.itemName || '').toLowerCase();
                
                // Search in Unit Measure (abbreviation or name)
                const unitMeasure = (item.unitMeasure?.abbreviation || item.unitMeasure?.unitName || '').toLowerCase();
                
                // Search in Category
                const category = (item.category?.categoryName || '').toLowerCase();
                
                // Search in Item Status (ACTIVE/INACTIVE)
                const itemStatus = (item.itemStatus || '').toLowerCase();
                
                return itemName.includes(searchLower) || 
                       unitMeasure.includes(searchLower) || 
                       category.includes(searchLower) || 
                       itemStatus.includes(searchLower);
            });
        }

        // Filter by Item Status if selected
        if (filterValues.itemStatus && filterValues.itemStatus.length > 0) {
            // User has explicitly selected status filters
            newData = newData.filter(item => {
                const itemStatus = (item.itemStatus || '').toUpperCase();
                const hasActive = filterValues.itemStatus.includes("item-status-active");
                const hasInactive = filterValues.itemStatus.includes("item-status-inactive");
                
                if (hasActive && itemStatus === "ACTIVE") return true;
                if (hasInactive && itemStatus === "INACTIVE") return true;
                return false;
            });
        } else {
            // No filter applied or empty array (Clear All) - use default behavior: show only ACTIVE items
            newData = newData.filter(item => {
                const itemStatus = (item.itemStatus || '').toUpperCase();
                return itemStatus === 'ACTIVE';
            });
        }

        // Sort by itemName or linkedSupplier
        const sortBy = filterValues.sortBy || "item-sort-name";
        const order = filterValues.order || "item-order-asc";
        
        if (sortBy === "item-sort-name") {
            newData.sort((a, b) => {
                const sortOrder = order === "item-order-asc" ? 1 : -1;
                return (a.itemName ?? "").localeCompare(b.itemName ?? "") * sortOrder;
            });
        } else if (sortBy === "item-sort-supplier") {
            newData.sort((a, b) => {
                const sortOrder = order === "item-order-asc" ? 1 : -1;
                const aCount = a.supplierItems?.length || 0;
                const bCount = b.supplierItems?.length || 0;
                return (aCount - bCount) * sortOrder;
            });
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Handle filter application
    const handleApplyFilters = (filterValues: Record<string, any>) => {
        console.log("Applied filters:", filterValues);
        applyFiltersAndSearch(searchQuery, filterValues);
    };


    // for item status formatting
    function formatStatus(itemStatus: string) {
        switch (itemStatus?.toUpperCase()) {
            case "ACTIVE":
                return "Active";
            case "INACTIVE":
                return "Inactive";
            default:
                return itemStatus || 'N/A';
        }
    }

    // for the modals of add, view, and edit
    const openModal = (mode: "add-item" | "view-item" | "edit-item" | "add-category", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-item":
                content = <AddItemModal
                    key={`add-item-${categoriesRefreshKey}`}
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
    const handleAddItem = async (itemForm: ItemForm & { linkedSuppliers?: any[] }) => {
        try {
            setLoading(true);
            
            // Find category and unit names from IDs
            const category = categories.find((c: any) => c.id === itemForm.categoryId);
            const unitMeasure = unitMeasures.find((u: any) => u.id === itemForm.unitMeasureId);
            
            const payload = {
                stockItems: [
                    {
                        itemName: itemForm.itemName,
                        unit: unitMeasure?.abbreviation || unitMeasure?.unitName || '',
                        category: category?.categoryName || '',
                        status: 'available',  // Default stock status
                        description: itemForm.description,
                        reorder: 1,  // Default value as per requirements
                        current_stock: 1,  // Default value as per requirements
                        itemStatus: itemForm.itemStatus,  // ACTIVE or INACTIVE
                        linkedSuppliers: itemForm.linkedSuppliers || []
                    }
                ]
            };
            
            await createItem(payload);
            const data = await getItems();
            setAllItems(data.items || []);
            // Apply default filter: show only ACTIVE items
            const defaultFilteredItems = (data.items || []).filter((item: any) => 
                item.itemStatus === 'ACTIVE'
            );
            setFilteredData(defaultFilteredItems);
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
            
            // Update item info including linked suppliers
            const payload = {
                itemId: updatedItem.itemId,
                reorderLevel: 1,  // Default as per requirements
                itemStatus: updatedItem.itemStatus,  // ACTIVE or INACTIVE
                categoryId: updatedItem.categoryId,
                unitMeasureId: updatedItem.unitMeasureId,
                linkedSuppliers: updatedItem.linkedSuppliers || []  // Include linked suppliers
            };
            await updateItem(payload);
            
            const data = await getItems();
            setAllItems(data.items || []);
            // Apply default filter: show only ACTIVE items
            const defaultFilteredItems = (data.items || []).filter((item: any) => 
                item.itemStatus === 'ACTIVE'
            );
            setFilteredData(defaultFilteredItems);
        } catch (err) {
            console.error('Error updating item', err);
        } finally {
            setLoading(false);
            closeModal();
        }
    };

    // initial load of items, categories, and unit measures
    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const [itemsData, categoriesData, unitMeasuresData] = await Promise.all([
                    getItems(),
                    getCategories(),
                    fetch('/api/unit-measure').then(res => res.json())
                ]);
                if (mounted) {
                    const sortedItems = (itemsData.items || []).sort((a: any, b: any) =>
                        (a.itemName ?? "").localeCompare(b.itemName ?? "")
                    );

                    setAllItems(sortedItems);
                    
                    // By default, show only ACTIVE items
                    const defaultFilteredItems = sortedItems.filter((item: any) => 
                        item.itemStatus === 'ACTIVE'
                    );
                    setFilteredData(defaultFilteredItems);
                    
                    setCategories(categoriesData.categories || []);
                    setUnitMeasures(unitMeasuresData.unitMeasures || []);
                }
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false };
    }, []);


    // Handle add category
    const handleAddCategory = async (categoryForm: CategoryForm) => {
        try {
            // The category has already been saved in the addCategoryModal
            // Refresh the categories list so the new category is available for item creation
            const categoriesData = await getCategories();
            setCategories(categoriesData.categories || []);
            // Increment the refresh key to force AddItemModal to remount and fetch fresh categories
            setCategoriesRefreshKey(prev => prev + 1);
            closeModal();
        } catch (error) {
            console.error('Error refreshing categories:', error);
            closeModal();
        }
    };

    return (
        <div className="card">
            <h1 className="title">Item Management</h1>

            {/* Search Engine and Filters */}
            <div className="elements">
                <div className="entries">
                    <div className="search">
                        <i className="ri-search-line" />
                        <input 
                            type="text" 
                            placeholder="Search by item name, unit, category, or status..." 
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
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
                                    <th>No.</th>
                                    <th>Item Name</th>
                                    <th>Unit Measure</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Linked Supplier</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {paginatedData.map((item, index) => (
                                    <tr
                                        key={item.itemId}
                                        className={selectedIds.includes(item.id) ? "selected" : ""}
                                    >
                                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                        <td>{item.itemName}</td>
                                        <td>{item.unitMeasure?.abbreviation || item.unitMeasure?.unitName || 'N/A'}</td>
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