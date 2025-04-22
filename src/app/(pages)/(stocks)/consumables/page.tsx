"use client";
import React, { useState } from "react";
import MoreMenu from "@/components/moreMenu";
import ModalManager from "@/components/consumables/modalManager";

const hardcodedData = [
    {
        id: 1,
        name: "Example Item A",
        stock: 50,
        unit: "pcs",
        status: "available",
        reorder: 10,
    },
    {
        id: 2,
        name: "Example Item B",
        stock: 0,
        unit: "pcs",
        status: "out-of-stock",
        reorder: 5,
    },
    {
        id: 3,
        name: "Example Item C",
        stock: 20,
        unit: "pcs",
        status: "low-stock",
        reorder: 8,
    },
    {
        id: 4,
        name: "Example Item D",
        stock: 20,
        unit: "pcs",
        status: "maintenance",
        reorder: 8,
    },
];

export default function Consumables() {
    // for modal
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "view" | "edit" | "delete" | null>(null);
    const [activeRow, setActiveRow] = useState<any>(null);


    // for items status formatting
    const formatStatus = (status: string) => {
        switch (status) {
            case "available":
                return "Available";
            case "out-of-stock":
                return "Out of Stock";
            case "low-stock":
                return "Low Stock";
            case "maintenance":
                return "Under Maintenance";
            default:
                return status;
        }
    };

    // for the modals of add, view, edit, and delete
    const openModal = (mode: "add" | "view" | "edit" | "delete", rowData?: any) => {
        setModalMode(mode);
        setActiveRow(rowData || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalMode(null);
        setActiveRow(null);
    };

    const handleAddStock = (stockForms: any[]) => {
        console.log("Saving forms:", stockForms);
        // Logic to add stocks to the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    const handleEditStock = (updatedItem: any) => {
        console.log("Updating item:", updatedItem);
        // Logic to update the item in the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    const handleDeleteConfirm = () => {
        console.log("Deleted row with id:", activeRow?.id);
        // Logic to delete the item from the data
        // In a real app, this would likely be an API call
        closeModal();
    };

    return (
        <div className="card">
            <h1 className="title">Consumable Stocks</h1>

            {/* Search Engine and Status Filters */}
            <div className="elements">
                <div className="entries">
                    <div className="search">
                        <input type="text" placeholder="Search" />
                        <button>
                            <i className="ri-search-line"></i>
                        </button>
                    </div>

                    <div className="filter">
                        <select className="status-filter">
                            <option value="by-date">Order by Date</option>
                            <option value="by-name">Order by Name</option>
                            <option value="by-quantity">Order by Quantity</option>
                        </select>
                        <select className="status-filter">
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="out-of-stock">Out of Stock</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="maintenance">Under Maintenance</option>
                        </select>
                    </div>

                    <button className="main-btn" onClick={() => openModal("add")}>
                        <i className="ri-add-line" /> Add Stocks
                    </button>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-heading">
                                <tr>
                                    <th>Item Name</th>
                                    <th>Current Stock</th>
                                    <th>Unit Measure</th>
                                    <th>Status</th>
                                    <th>Reorder Level</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {hardcodedData.map(item => (
                                    <tr
                                        key={item.id}
                                        className={selectedIds.includes(item.id) ? "selected" : ""}
                                    >
                                        <td>{item.name}</td>
                                        <td>{item.stock}</td>
                                        <td>{item.unit}</td>
                                        <td>
                                            <span className={`chip ${item.status}`}>
                                                {formatStatus(item.status)}
                                            </span>
                                        </td>
                                        <td>{item.reorder}</td>
                                        <td>
                                            <MoreMenu
                                                onView={() => openModal("view", item)}
                                                onEdit={() => openModal("edit", item)}
                                                onDelete={() => openModal("delete", item)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button className="page-btn">
                        <i className="ri-arrow-left-double-line"></i>
                    </button>
                    <button className="page-btn active">1</button>
                    <button className="page-btn">2</button>
                    <button className="page-btn">3</button>
                    <button className="page-btn">4</button>
                    <button className="page-btn">5</button>
                    <button className="page-btn">
                        <i className="ri-arrow-right-double-line"></i>
                    </button>
                </div>
            </div>

            {/* Modal Manager */}
            <ModalManager
                isOpen={isModalOpen}
                onClose={closeModal}
                modalMode={modalMode}
                activeRow={activeRow}
                formatStatus={formatStatus}
                onSaveAdd={handleAddStock}
                onSaveEdit={handleEditStock}
                onDeleteConfirm={handleDeleteConfirm}
            />
        </div>
    );
}