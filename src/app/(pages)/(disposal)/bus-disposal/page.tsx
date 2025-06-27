"use client";

import React, { useState, useMemo } from "react";
import ActionButtons from "@/components/actionButtons";
import ModalManager from "@/components/modalManager";
import FilterDropdown, { FilterSection } from "@/components/filterDropdown";
import PaginationComponent from "@/components/pagination";

import AddBusDisposalModal, { BusDisposalForm } from "./addBusDisposalModal";
import ViewBusDisposalModal from "./viewBusDisposalModal";
// import EditBusDisposalModal from "./editBusDisposalModal";

import "@/styles/filters.css"
import "@/styles/tables.css"
import "@/styles/chips.css"

const hardcodedData = [
    {
        id: 1,
        bodyNumber: "BUS001",
        bodyBuilder: "Agila",
        busType: "Airconditioned",
        busDisposalMethod: "Sold",
        busDisposalDate: "2023-10-01",
    },
    {
        id: 2,
        bodyNumber: "BUS002",
        bodyBuilder: "Hilltop",
        busType: "Ordinary",
        busDisposalMethod: "Scrapped",
        busDisposalDate: "2023-10-05",
    },
    {
        id: 3,
        bodyNumber: "BUS003",
        bodyBuilder: "RBM",
        busType: "Airconditioned",
        busDisposalMethod: "Sold",
        busDisposalDate: "2023-10-08",
    },
    {
        id: 4,
        bodyNumber: "BUS004",
        bodyBuilder: "DARJ",
        busType: "Ordinary",
        busDisposalMethod: "Donated",
        busDisposalDate: "2023-10-10",
    },
    {
        id: 5,
        bodyNumber: "BUS005",
        bodyBuilder: "Agila",
        busType: "Airconditioned",
        busDisposalMethod: "Sold",
        busDisposalDate: "2023-10-12",
    },
    {
        id: 6,
        bodyNumber: "BUS006",
        bodyBuilder: "Hilltop",
        busType: "Ordinary",
        busDisposalMethod: "Scrapped",
        busDisposalDate: "2023-10-14",
    },
    {
        id: 7,
        bodyNumber: "BUS007",
        bodyBuilder: "RBM",
        busType: "Airconditioned",
        busDisposalMethod: "Donated",
        busDisposalDate: "2023-10-16",
    },
    {
        id: 8,
        bodyNumber: "BUS008",
        bodyBuilder: "DARJ",
        busType: "Ordinary",
        busDisposalMethod: "Sold",
        busDisposalDate: "2023-10-18",
    },
    {
        id: 9,
        bodyNumber: "BUS009",
        bodyBuilder: "Agila",
        busType: "Airconditioned",
        busDisposalMethod: "Scrapped",
        busDisposalDate: "2023-10-20",
    },
    {
        id: 10,
        bodyNumber: "BUS010",
        bodyBuilder: "Hilltop",
        busType: "Ordinary",
        busDisposalMethod: "Sold",
        busDisposalDate: "2023-10-22",
    },
    {
        id: 11,
        bodyNumber: "BUS011",
        bodyBuilder: "RBM",
        busType: "Airconditioned",
        busDisposalMethod: "Donated",
        busDisposalDate: "2023-10-24",
    },
    {
        id: 12,
        bodyNumber: "BUS012",
        bodyBuilder: "DARJ",
        busType: "Ordinary",
        busDisposalMethod: "Scrapped",
        busDisposalDate: "2023-10-26",
    },
    {
        id: 13,
        bodyNumber: "BUS013",
        bodyBuilder: "Agila",
        busType: "Airconditioned",
        busDisposalMethod: "Sold",
        busDisposalDate: "2023-10-28",
    },
    {
        id: 14,
        bodyNumber: "BUS014",
        bodyBuilder: "Hilltop",
        busType: "Ordinary",
        busDisposalMethod: "Donated",
        busDisposalDate: "2023-10-30",
    },
    {
        id: 15,
        bodyNumber: "BUS015",
        bodyBuilder: "RBM",
        busType: "Airconditioned",
        busDisposalMethod: "Scrapped",
        busDisposalDate: "2023-11-01",
    },
    {
        id: 16,
        bodyNumber: "BUS016",
        bodyBuilder: "DARJ",
        busType: "Ordinary",
        busDisposalMethod: "Sold",
        busDisposalDate: "2023-11-03",
    },
    {
        id: 17,
        bodyNumber: "BUS017",
        bodyBuilder: "Agila",
        busType: "Airconditioned",
        busDisposalMethod: "Scrapped",
        busDisposalDate: "2023-11-05",
    },
    {
        id: 18,
        bodyNumber: "BUS018",
        bodyBuilder: "Hilltop",
        busType: "Ordinary",
        busDisposalMethod: "Donated",
        busDisposalDate: "2023-11-07",
    },
    {
        id: 19,
        bodyNumber: "BUS019",
        bodyBuilder: "RBM",
        busType: "Airconditioned",
        busDisposalMethod: "Sold",
        busDisposalDate: "2023-11-09",
    },
    {
        id: 20,
        bodyNumber: "BUS020",
        bodyBuilder: "DARJ",
        busType: "Ordinary",
        busDisposalMethod: "Scrapped",
        busDisposalDate: "2023-11-11",
    },
];


export default function BusDisposal() {
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

        // In a real application, you would filter your data based on these values
        // For now, we'll just log them and keep the original data

        // Example implementation for filtering and sorting:
        let newData = [...hardcodedData];

        // Filter by status if selected
        // if (filterValues.busMaintenanceStatus && filterValues.busMaintenanceStatus.length > 0) {
        //     newData = newData.filter(item => filterValues.busMaintenanceStatus.includes(item.busMaintenanceStatus));
        // }

        // Sort by body number or date
        if (filterValues.sortBy === "bodyNumber") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.bodyNumber.localeCompare(b.bodyNumber) * sortOrder;
            });
        } else if (filterValues.sortBy === "busDisposalDate") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.busDisposalDate ?? "").localeCompare(b.busDisposalDate ?? "") * sortOrder;
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
    const handleAddBusDisposal = (busDisposalForm: BusDisposalForm) => {
        console.log("Saving form:", busDisposalForm);
        // Logic to add bus to the data
        // In a real app, this would likely be an API call
        closeModal();
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
                                {paginatedData.map(item => (
                                    <tr
                                        key={item.id}
                                        className={selectedIds.includes(item.id) ? "selected" : ""}
                                    >
                                        <td>{item.bodyNumber}</td>
                                        <td>{item.bodyBuilder}</td>
                                        <td>{item.busType}</td>
                                        <td>{item.busDisposalMethod}</td>
                                        <td>{item.busDisposalDate}</td>
                                        <td>
                                            <ActionButtons
                                                onView={() => openModal("view-bus-disposal", item)}
                                            // onEdit={() => openModal("edit-bus-disposal", item)}
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