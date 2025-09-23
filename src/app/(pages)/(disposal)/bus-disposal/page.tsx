"use client";

import React, { useState, useMemo, useEffect } from "react";
import { fetchDisposals, createDisposal, type BusDisposal } from "@/app/lib/fetchDisposals";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";
import Loading from "@/components/loading";

import AddBusDisposalModal, { BusDisposalForm } from "./addBusDisposalModal";
import ViewBusDisposalModal from "./viewBusDisposalModal";
// import EditBusDisposalModal from "./editBusDisposalModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"
import "@/styles/loading.css"


export default function BusDisposal() {
    // Data state
    const [busDisposals, setBusDisposals] = useState<BusDisposal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // for modal
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<any>(null);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // For filtering
    const [filteredData, setFilteredData] = useState<BusDisposal[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // default number of rows per page

    // Load disposal data on component mount
    useEffect(() => {
        loadDisposalData();
    }, []);

    const loadDisposalData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetchDisposals('bus');
            setBusDisposals(response.data.busDisposals);
            setFilteredData(response.data.busDisposals);
        } catch (err) {
            console.error('Error loading bus disposals:', err);
            setError('Failed to load bus disposals');
        } finally {
            setIsLoading(false);
        }
    };

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
            id: "bodyBuilder",
            title: "Body Builder",
            type: "checkbox",
            options: [
                { id: "agila", label: "Agila" },
                { id: "hilltop", label: "Hilltop" },
                { id: "rbm", label: "RBM" },
                { id: "darj", label: "DARJ" },
            ],
        },
        {
            id: "busType",
            title: "Bus Type",
            type: "checkbox",
            options: [
                { id: "airconditioned", label: "Airconditioned" },
                { id: "ordinary", label: "Ordinary" },
            ],
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "busDisposalDate", label: "Disposal Date" },
                { id: "bodyNumber", label: "Body Number" },
            ],
            defaultValue: "busDisposalDate"
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

        let newData = [...busDisposals];

        // Filter by body builder if selected
        if (filterValues.bodyBuilder && filterValues.bodyBuilder.length > 0) {
            newData = newData.filter(item => filterValues.bodyBuilder.includes(item.bus.body_builder.toLowerCase()));
        }

        // Filter by bus type if selected
        if (filterValues.busType && filterValues.busType.length > 0) {
            newData = newData.filter(item => filterValues.busType.includes(item.bus.bus_type.toLowerCase()));
        }

        // Sort by body number or date
        if (filterValues.sortBy === "bodyNumber") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.bus.body_number.localeCompare(b.bus.body_number) * sortOrder;
            });
        } else if (filterValues.sortBy === "busDisposalDate") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.disposal_date ?? "").localeCompare(b.disposal_date ?? "") * sortOrder;
            });
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // for the modals of add, view, and edit
    const openModal = (mode: "add-bus-disposal" | "view-bus-disposal" | "edit-bus-disposal", rowData?: any) => {
        let content;

        switch (mode) {
            case "add-bus-disposal":
                content = <AddBusDisposalModal
                    onSave={handleAddBusDisposal}
                    onClose={closeModal}
                />;
                break;
            case "view-bus-disposal":
                content = <ViewBusDisposalModal
                    item={rowData}
                    // formatStatus={formatStatus}
                    onClose={closeModal}
                />;
                break;
            // case "edit-bus-disposal":
            //     content = <EditBusDisposalModal
            //         item={rowData}
            //         onSave={handleEditBusDisposal}
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

    // Handle add bus disposal
    const handleAddBusDisposal = async (busDisposalForm: BusDisposalForm) => {
        try {
            // The modal already calls the API, so we just need to reload the data
            console.log("Bus disposal saved, reloading data");
            loadDisposalData();
            closeModal();
        } catch (err) {
            console.error('Error handling bus disposal save:', err);
        }
    };

    // Handle edit bus disposal
    // const handleEditBusDisposal = (updatedItem: any) => {
    //     console.log("Updating item:", updatedItem);
    //     // Logic to update the item in the data
    //     // In a real app, this would likely be an API call
    //     closeModal();
    // };

    return (
        <div className="card">
            <h1 className="title">Bus Disposal</h1>

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

                        {/* Add Bus Disposal Button */}
                        <button className="main-btn" onClick={() => openModal("add-bus-disposal")}>
                            <i className="ri-add-line" /> Add Disposal
                        </button>
                    </div>

                    {/* Table */}
                    <div className="table-wrapper">
                        <div className="table-container">
                            <table className="data-table">
                                <thead className="table-heading">
                                    <tr>
                                        <th>Body Number</th>
                                        <th>Body Builder</th>
                                        <th>Bus Type</th>
                                        <th>Disposal Method</th>
                                        <th>Disposal Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {error ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', color: 'red' }}>
                                                {error}
                                            </td>
                                        </tr>
                                    ) : paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center' }}>
                                                No bus disposals found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map(item => (
                                            <tr
                                                key={item.disposal_id}
                                                className={selectedIds.includes(item.disposal_id) ? "selected" : ""}
                                            >
                                                <td>{item.bus.body_number}</td>
                                                <td style={{textTransform: 'capitalize'}}>{item.bus.body_builder.toLowerCase()}</td>
                                                <td style={{textTransform: 'capitalize'}}>{item.bus.bus_type.toLowerCase()}</td>
                                                <td style={{textTransform: 'capitalize'}}>{item.disposal_method.toLowerCase()}</td>
                                                <td>{new Date(item.disposal_date).toLocaleDateString()}</td>
                                                <td>
                                                    <ActionButtons
                                                        onView={() => openModal("view-bus-disposal", item)}
                                                    // onEdit={() => openModal("edit-bus-disposal", item)}
                                                    // disableEdit={item.disposal_status !== "PENDING"}
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
                        totalItems={filteredData.length}
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