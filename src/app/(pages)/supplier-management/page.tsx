"use client";

import React, { useState, useMemo, useEffect } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";
import Loading from "@/components/loading";

import AddSupplierModal, { SupplierForm } from "./addSupplierModal";
import ViewSupplierModal from "./viewSupplierModal";
import EditSupplierModal from "./editSupplierModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/loading.css"

interface Supplier {
    id: number;
    supplier_name: string;
    contact_number: string;
    email: string;
    street: string;
    barangay: string;
    city: string;
    province: string;
    status: string;
    remarks: string;
    linkedItem?: number | string;
    itemCount?: number;
}

export default function SupplierManagement() {
    // for modal
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // Data from API
    const [originalData, setOriginalData] = useState<Supplier[]>([]);

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch items on mount
    useEffect(() => {
        let mounted = true;
        async function loadSuppliers() {
            setLoading(true);
            try {
                const res = await fetch('/api/suppliers');
                if (!res.ok) throw new Error(`Failed to fetch suppliers: ${res.status}`);
                const body = await res.json();
                const suppliersRaw: unknown[] = Array.isArray(body) ? body : body.suppliers ?? [];
                // Map API shape to UI Supplier shape
                const suppliers: Supplier[] = suppliersRaw.map((s) => {
                    const src = s as unknown as Record<string, unknown>;
                    return {
                        id: Number(src.id ?? 0),
                        supplier_name: String(src.supplier_name ?? ''),
                        contact_number: String(src.contact_number ?? ''),
                        email: String(src.email ?? ''),
                        street: String(src.street ?? ''),
                        barangay: String(src.barangay ?? ''),
                        city: String(src.city ?? ''),
                        province: String(src.province ?? ''),
                        status: String(src.status ?? ''),
                        remarks: String(src.remarks ?? ''),
                        linkedItem: undefined,
                        itemCount: typeof src.itemCount === 'number' ? (src.itemCount as number) : 0,
                    } as Supplier;
                });
                if (mounted) {
                    setOriginalData(suppliers);
                    setError(null);
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                if (mounted) setError(message);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadSuppliers();
        return () => { mounted = false; };
    }, []);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // default number of rows per page

    const filteredAndSearchedSuppliers = useMemo(() => {
        let filtered = [...originalData];

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(supplier =>
                supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.contact_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.itemCount?.toString().includes(searchTerm)
            );
        }

        // Apply status filter
        if (Array.isArray(filterValues.status) && filterValues.status.length > 0) {
            const statuses = filterValues.status as string[];
            filtered = filtered.filter(supplier => statuses.includes(String(supplier.status)));
        }

        // Apply date range if available (use date_created or date_updated if present)
        if (filterValues.dateRange && typeof filterValues.dateRange === 'object') {
            const dr = filterValues.dateRange as { from?: string; to?: string };
            if (dr.from || dr.to) {
                filtered = filtered.filter(item => {
                    const dateStr = (item as unknown as { date_updated?: string; date_created?: string }).date_updated ?? (item as unknown as { date_updated?: string; date_created?: string }).date_created;
                    if (!dateStr) return false;
                    const supplierDate = new Date(dateStr);
                    const fromDate = dr.from ? new Date(dr.from) : null;
                    const toDate = dr.to ? new Date(dr.to) : null;
                    if (fromDate) fromDate.setHours(0,0,0,0);
                    if (toDate) toDate.setHours(23,59,59,999);
                    if (fromDate && toDate) return supplierDate >= fromDate && supplierDate <= toDate;
                    if (fromDate) return supplierDate >= fromDate;
                    if (toDate) return supplierDate <= toDate;
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
                case "supplier_name":
                case "supplier_name":
                    aValue = String(a.supplier_name ?? a.supplier_name ?? "").toLowerCase();
                    bValue = String(b.supplier_name ?? b.supplier_name ?? "").toLowerCase();
                    break;
                case "itemCount":
                    aValue = Number(a.itemCount ?? 0);
                    bValue = Number(b.itemCount ?? 0);
                    break;
                case "linkedItem":
                    aValue = Number(a.linkedItem ?? 0);
                    bValue = Number(b.linkedItem ?? 0);
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
    const totalPages = Math.ceil(filteredAndSearchedSuppliers.length / pageSize);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSearchedSuppliers.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSearchedSuppliers, currentPage, pageSize]);

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
                { id: "supplier_name", label: "Supplier Name" },
                { id: "linkedItem", label: "Linked Supplier" }
            ],
            defaultValue: "supplier_name"
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
    const getStatusValue = (supplier: Supplier) => {
        // prefer item.status, then item.status if present on the object
        const maybe1 = (supplier as unknown as Record<string, unknown>).status;
        const maybe2 = (supplier as unknown as Record<string, unknown>).status;
        const raw = typeof maybe1 === 'string' ? maybe1 : (typeof maybe2 === 'string' ? String(maybe2) : "");
        return raw;
    };

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
    const openModal = (mode: "add-supplier" | "view-supplier" | "edit-supplier", rowData?: Supplier | null) => {
        let content;

        const viewSupplier = rowData
            ? {
                id: rowData.id,
                supplier_name: rowData.supplier_name ?? "",
                contact_number: rowData.contact_number ?? "",
                street: rowData.street ?? "",
                barangay: rowData.barangay ?? "",
                city: rowData.city ?? "",
                province: rowData.province ?? "",
                email: rowData.email ?? "",
                status: rowData.status ?? "",
                remarks: rowData.remarks ?? "",
            }
            : undefined;

        switch (mode) {
            case "add-supplier":
                content = <AddSupplierModal
                    onSave={handleAddSupplier}
                    onClose={closeModal}
                />;
                break;
            case "view-supplier":
                content = <ViewSupplierModal
                    supplier={viewSupplier as unknown as Parameters<typeof ViewSupplierModal>[0]['supplier']}
                    formatStatus={formatStatus}
                    onClose={closeModal}
                />;
                break;
            case "edit-supplier":
                content = <EditSupplierModal
                    supplier={viewSupplier as unknown as Parameters<typeof EditSupplierModal>[0]['supplier']}
                    onSave={handleEditSupplier}
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

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleAddSupplier = (createdSupplier: SupplierForm) => {
        console.log("Saving form:", createdSupplier);
        // Create UI supplier row and prepend to data
        const newRow: Supplier = {
            id: Date.now(),
            supplier_name: createdSupplier.supplier_name,
            contact_number: createdSupplier.contact_number,
            email: createdSupplier.email,
            street: createdSupplier.street,
            barangay: createdSupplier.barangay,
            city: createdSupplier.city,
            province: createdSupplier.province,
            status: createdSupplier.status,
            remarks: '',
            linkedItem: undefined,
            itemCount: 0,
        };
        setOriginalData(prev => [newRow, ...prev]);
        closeModal();
    };

    const handleEditSupplier = (updatedSupplier: Record<string, unknown>) => {
        console.log("Updating supplier:", updatedSupplier);
        // Update the supplier in local state (optimistic UI)
        const id = typeof updatedSupplier.id === 'number' ? updatedSupplier.id : Number(updatedSupplier.id ?? 0);
        setOriginalData(prev => prev.map(s => {
            if (s.id === id) {
                return {
                    ...s,
                    supplier_name: (updatedSupplier.supplier_name as string) ?? s.supplier_name,
                    contact_number: (updatedSupplier.supplierContact as string) ?? s.contact_number,
                    email: (updatedSupplier.supplierEmail as string) ?? s.email,
                    street: (updatedSupplier.supplierStreet as string) ?? s.street,
                    barangay: (updatedSupplier.supplierBarangay as string) ?? s.barangay,
                    city: (updatedSupplier.supplierCity as string) ?? s.city,
                    province: (updatedSupplier.supplierProvince as string) ?? s.province,
                    status: (updatedSupplier.supplierStatus as string) ?? s.status,
                };
            }
            return s;
        }));
        closeModal();
    };

    if (loading) {
        return (
            <div className="card">
                <h1 className="title">Supplier Management</h1>
                <Loading />
            </div>
        );
    }

    return (
        <div className="card">
            <h1 className="title">Supplier Management</h1>

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
                                                ? 'No suppliers matched'
                                                : 'No suppliers available'
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((supplier: Supplier) => (
                                        <tr
                                            key={supplier.id}
                                            className={selectedIds.includes(supplier.id) ? "selected" : ""}
                                            onClick={() => toggleSelect(supplier.id)}
                                        >
                                            <td>{supplier.supplier_name}</td>
                                            <td>{supplier.barangay}, {supplier.city}</td>
                                            <td>{supplier.contact_number}</td>
                                            <td>{supplier.email}</td>
                                            <td className="table-status">
                                                <span className={`chip ${getStatusClass(getStatusValue(supplier))}`}>
                                                    {formatStatus(getStatusValue(supplier))}
                                                </span>
                                            </td>
                                            <td>{supplier.itemCount}</td>
                                            <td>
                                                <ActionButtons
                                                    onView={() => openModal("view-supplier", supplier)}
                                                    onEdit={() => openModal("edit-supplier", supplier)}
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