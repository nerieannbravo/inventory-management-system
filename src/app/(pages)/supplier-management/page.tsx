"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";

import AddSupplierModal, { SupplierForm } from "./addSupplierModal";
import ViewSupplierModal from "./viewSupplierModal";
import EditSupplierModal from "./editSupplierModal";
import { getSuppliers, createSupplier, updateSupplier } from '@/app/lib/api';

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/loading.css"

export default function SupplierManagement() {
    // for modal
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<any>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // For filtering and data
    const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search state
    const [searchTerm, setSearchTerm] = useState<string>("");

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

    // Filter sections - aligned with schema
    const filterSections: FilterSection[] = [
        {
            id: "dateRange",
            title: "Date Range (Created)",
            type: "dateRange",
            defaultValue: { from: "", to: "" }
        },
        {
            id: "supplierStatus",
            title: "Status",
            type: "checkbox",
            options: [
                { id: "ACTIVE", label: "Active" },
                { id: "INACTIVE", label: "Inactive" },
                { id: "FLAGGED", label: "Flagged" },
                { id: "BLOCKED", label: "Blocked" }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "supplierName", label: "Supplier Name" },
                { id: "createdAt", label: "Date Created" },
                { id: "linkedItems", label: "Linked Items Count" }
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

    // Handle search - searches across: Supplier Name, Address, Contact, Email, Status
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        applyFiltersAndSearch(term);
    };

    // Unified filter and search application
    const applyFiltersAndSearch = (search: string = searchTerm, filterValues?: Record<string, any>) => {
        // Start with all suppliers from API
        let newData = [...allSuppliers];

        // Apply search filter across multiple fields
        if (search && search.trim() !== "") {
            const searchLower = search.toLowerCase().trim();
            newData = newData.filter(supplier => {
                // Search in Supplier Name
                const nameMatch = (supplier.supplierName || "").toLowerCase().includes(searchLower);
                
                // Search in Address (Street, Barangay, City, Province)
                const addressParts = [
                    supplier.street || "",
                    supplier.barangay || "",
                    supplier.city || "",
                    supplier.province || ""
                ].filter(Boolean).join(" ").toLowerCase();
                const addressMatch = addressParts.includes(searchLower);
                
                // Search in Contact Number
                const phoneMatch = (supplier.phone || "").toLowerCase().includes(searchLower);
                
                // Search in Email
                const emailMatch = (supplier.email || "").toLowerCase().includes(searchLower);
                
                // Search in Status
                const statusMatch = (supplier.status || "").toLowerCase().includes(searchLower);
                
                return nameMatch || addressMatch || phoneMatch || emailMatch || statusMatch;
            });
        }

        // Apply status filter if provided
        if (filterValues?.supplierStatus && filterValues.supplierStatus.length > 0) {
            newData = newData.filter(supplier => {
                return filterValues.supplierStatus.includes(supplier.status);
            });
        }

        // Apply date range filter if provided
        if (filterValues?.dateRange?.from || filterValues?.dateRange?.to) {
            const fromDate = filterValues.dateRange.from ? new Date(filterValues.dateRange.from) : null;
            const toDate = filterValues.dateRange.to ? new Date(filterValues.dateRange.to) : null;
            
            newData = newData.filter(supplier => {
                const createdDate = new Date(supplier.createdAt);
                const matchFrom = !fromDate || createdDate >= fromDate;
                const matchTo = !toDate || createdDate <= toDate;
                return matchFrom && matchTo;
            });
        }

        // Apply sorting
        const sortBy = filterValues?.sortBy || "supplierName";
        const order = filterValues?.order || "asc";
        
        if (sortBy === "supplierName") {
            newData.sort((a, b) => {
                const sortOrder = order === "asc" ? 1 : -1;
                return (a.supplierName ?? "").localeCompare(b.supplierName ?? "") * sortOrder;
            });
        } else if (sortBy === "linkedItems") {
            newData.sort((a, b) => {
                const sortOrder = order === "asc" ? 1 : -1;
                const aCount = a.linkedItems?.length || 0;
                const bCount = b.linkedItems?.length || 0;
                return (aCount - bCount) * sortOrder;
            });
        } else if (sortBy === "createdAt") {
            newData.sort((a, b) => {
                const sortOrder = order === "asc" ? 1 : -1;
                const aDate = new Date(a.createdAt || 0).getTime();
                const bDate = new Date(b.createdAt || 0).getTime();
                return (aDate - bDate) * sortOrder;
            });
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Handle filter application (called from FilterDropdown)
    const handleApplyFilters = (filterValues: Record<string, any>) => {
        console.log("Applied filters:", filterValues);
        applyFiltersAndSearch(searchTerm, filterValues);
    };


    // for supplier status formatting - aligns with SupplierStatus enum
    function formatStatus(supplierStatus: string) {
        switch (supplierStatus?.toUpperCase()) {
            case "ACTIVE":
                return "Active";
            case "INACTIVE":
                return "Inactive";
            case "FLAGGED":
                return "Flagged";
            case "BLOCKED":
                return "Blocked";
            default:
                return supplierStatus || "Unknown";
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
    const handleAddSupplier = async (supplierForm: SupplierForm & { linkedItems?: any[] }) => {
        try {
            setLoading(true);
            // call create API
            // Normalize linked items coming from the UI into the API's expected shape
            const linkedItemsPayload = (supplierForm.linkedItems || []).map((li: any) => ({
                // the API expects `item_id` (external item identifier string); accept multiple possible UI shapes
                item_id: li.itemId ?? li.item_id ?? li.id ?? li.linkedItemId ?? null,
                supplierUnitMeasureId: li.supplierUnitMeasureId ?? li.supplier_unit_measure_id ?? null,
                conversionFactor: li.conversionFactor ?? li.conversion_factor ?? 1,
                unitPrice: Number(li.unitPrice ?? li.unit_price ?? li.price ?? 0),
                averageDeliveryTime: li.averageDeliveryTime ?? li.average_delivery_time ?? null,
                notes: li.notes ?? li.note ?? null,
                isPreferred: li.isPreferred ?? li.is_preferred ?? false,
            })).filter((li: any) => li.item_id != null); // drop entries without an item identifier

            const payload = {
                supplierName: supplierForm.supplierName,
                contactPerson: supplierForm.contactPerson,
                phone: supplierForm.phone,
                email: supplierForm.email,
                street: supplierForm.street,
                barangay: supplierForm.barangay,
                city: supplierForm.city,
                province: supplierForm.province,
                status: supplierForm.status,
                remarks: supplierForm.remarks,
                linkedItems: linkedItemsPayload,
            };
            await createSupplier(payload);
            // refetch list
            const data = await getSuppliers();
            setAllSuppliers(data.suppliers || []);
            setFilteredData(data.suppliers || []);
        } catch (err) {
            console.error('Error creating supplier', err);
        } finally {
            setLoading(false);
            closeModal();
        }
    };

    // Handle edit supplier
    const handleEditSupplier = async (updatedSupplier: any & { linkedItems?: any[] }) => {
        try {
            setLoading(true);
        // Normalize the linked items data with full schema fields
        const linkedItemsPayload = (updatedSupplier.linkedItems || []).map((li: any) => ({
            item_id: li.itemId ?? li.item_id ?? li.id ?? li.linkedItemId ?? null,
            supplierUnitMeasureId: li.supplierUnitMeasureId ?? li.supplier_unit_measure_id ?? null,
            conversionFactor: li.conversionFactor ?? li.conversion_factor ?? 1,
            unitPrice: Number(li.unitPrice ?? li.unit_price ?? li.price ?? 0),
            averageDeliveryTime: li.averageDeliveryTime ?? li.average_delivery_time ?? null,
            notes: li.notes ?? li.note ?? null,
            isPreferred: li.isPreferred ?? li.is_preferred ?? false,
        })).filter((li: any) => li.item_id != null);            const payload = {
                id: updatedSupplier.id,
                supplierName: updatedSupplier.supplierName,
                contactPerson: updatedSupplier.contactPerson,
                phone: updatedSupplier.phone,
                email: updatedSupplier.email,
                street: updatedSupplier.street,
                barangay: updatedSupplier.barangay,
                city: updatedSupplier.city,
                province: updatedSupplier.province,
                status: updatedSupplier.status,
                remarks: updatedSupplier.remarks,
                linkedItems: linkedItemsPayload,
            };
            await updateSupplier(payload);
            const data = await getSuppliers();
            setAllSuppliers(data.suppliers || []);
            setFilteredData(data.suppliers || []);
        } catch (err) {
            console.error('Error updating supplier', err);
        } finally {
            setLoading(false);
            closeModal();
        }
    };

    // initial load of suppliers
    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const data = await getSuppliers();
                if (mounted) {
                    setAllSuppliers(data.suppliers || []);
                    setFilteredData(data.suppliers || []);
                }
            } catch (err) {
                console.error('Failed to load suppliers', err);
                if (mounted) setError('Failed to load suppliers');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false };
    }, []);

    return (
        <div className="card">
            <h1 className="title">Supplier Management</h1>

            {/* Search Engine and Filters */}
            <div className="elements">
                <div className="entries">
                    <div className="search">
                        <i className="ri-search-line" />
                        <input 
                            type="text" 
                            placeholder="Search by name, address, contact, email, or status..." 
                            value={searchTerm}
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
                                {paginatedData.map((supplier: any) => (
                                    <tr key={supplier.id} className={selectedIds.includes(supplier.id) ? "selected" : ""}>
                                        <td>{supplier.supplierName}</td>
                                        <td>
                                            {[supplier.street, supplier.barangay, supplier.city, supplier.province]
                                                .filter(Boolean)
                                                .join(', ') || 'N/A'}
                                        </td>
                                        <td>{supplier.phone}</td>
                                        <td>{supplier.email}</td>
                                        <td className="table-status">
                                            <span className={`chip ${(supplier.status || '').toLowerCase()}`}>
                                                {formatStatus(supplier.status)}
                                            </span>
                                        </td>
                                        <td>{supplier.linkedItems?.length || 0}</td>
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