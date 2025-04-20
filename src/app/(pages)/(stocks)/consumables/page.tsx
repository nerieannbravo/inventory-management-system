"use client";
import React, { useState } from "react";
import Modal from "@/components/modal";
import MoreMenu from "@/components/moreMenu";

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

    const [stockForms, setStockForms] = useState([
        {
            name: "",
            quantity: 0,
            unit: "",
            price: 0,
            usable: 0,
            defective: 0,
            missing: 0,
            reorder: 0,
            status: "available",
            expiration: "",
        },
    ]);

    const [formErrors, setFormErrors] = useState(
        stockForms.map(() => ({} as Record<string, string>))
    );


    // for the checkboxes in the table
    const toggleSelectAll = () => {
        const allIds = hardcodedData.map(item => item.id);
        setSelectedIds(selectedIds.length === allIds.length ? [] : allIds);
    };

    const toggleRow = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

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
        setFormErrors([])
        setStockForms([{
            name: "",
            quantity: 0,
            unit: "",
            price: 0,
            usable: 0,
            defective: 0,
            missing: 0,
            reorder: 0,
            status: "",
            expiration: ""
        }]);
    };

    const handleDeleteConfirm = () => {
        console.log("Deleted row with id:", activeRow?.id);
        closeModal();
    };

    // for the add another stock loop
    const handleAddAnotherStock = () => {
        setStockForms(prev => [
            ...prev,
            {
                name: "",
                quantity: 0,
                unit: "",
                price: 0,
                usable: 0,
                defective: 0,
                missing: 0,
                reorder: 0,
                status: "available",
                expiration: "",
            }
        ]);
    };

    // for the form change
    const handleFormChange = (index: number, field: string, value: any) => {
        setStockForms((prev) =>
            prev.map((form, i) =>
                i === index ? { ...form, [field]: value } : form
            )
        );
    };

    // for the remove another stock loop
    const handleRemoveStock = (index: number) => {
        setStockForms(prev => prev.filter((_, i) => i !== index));
    };

    // for input validations
    const validateForm = () => {
        const errors = stockForms.map((form) => {
            const errorObj: Record<string, string> = {};

            if (!form.name.trim()) errorObj.name = "Item name is required";
            if (form.quantity <= 0) errorObj.quantity = "Quantity must be greater than 0";
            if (!form.unit) errorObj.unit = "Unit measure is required";
            if (form.price < 0) errorObj.price = "Price must be 0 or more";
            if (form.usable < 0) errorObj.usable = "Usable quantity must be 0 or more";
            if (form.usable < 0) errorObj.usable = "Usable quantity must be 0 or more";
            if (form.defective < 0) errorObj.defective = "Defective quantity must be 0 or more";
            if (form.usable > form.quantity) errorObj.usable = "Usable quantity cannot exceed total quantity";
            if (form.defective > form.quantity) errorObj.defective = "Defective quantity cannot exceed total quantity";
            if (form.missing > form.quantity) errorObj.missing = "Missing quantity cannot exceed total quantity";
            if (form.missing < 0) errorObj.missing = "Missing quantity must be 0 or more";
            if (form.reorder < 1) errorObj.reorder = "Reorder level must be greater than 0";
            // if (!form.status) errorObj.status = "Status is required";

            // Sum check for total quantity
            const sum = form.usable + form.defective + form.missing;
            if (sum > form.quantity) {
                errorObj.usable = "Sum of these quantities cannot exceed total quantity";
                errorObj.defective = "Sum of these quantities cannot exceed total quantity";
                errorObj.missing = "Sum of these quantities cannot exceed total quantity";
            }

            // Expiration date is optional, but if filled, must not be in the past
            if (form.expiration) {
                const today = new Date();
                const selectedDate = new Date(form.expiration);
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    errorObj.expiration = "Expiration date cannot be in the past";
                }
            }

            return errorObj;
        });

        setFormErrors(errors);

        return errors.every((err) => Object.keys(err).length === 0);
    };


    // handle submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = validateForm();
        if (!isValid) return;

        console.log("Saving forms:", stockForms);
        closeModal(); // or perform save logic
    };


    return (
        <div className="card">
            <h1 className="title">Consumable Stocks</h1>

            <div className="elements">
                <div className="entries">
                    <div className="search">
                        <input type="text" placeholder="Search" />
                        <button><i className="ri-search-line"></i></button>
                    </div>

                    <div className="filter">
                        <select className="status-filter">
                            <option value="all">All Types</option>
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

                <div className="table-wrapper">
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-heading">
                                <tr>
                                    <th>
                                        <input type="checkbox" checked={selectedIds.length === hardcodedData.length} onChange={toggleSelectAll} />
                                    </th>
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
                                    <tr key={item.id} className={selectedIds.includes(item.id) ? "selected" : ""}>
                                        <td>
                                            <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleRow(item.id)} />
                                        </td>
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


            {/* Modal/Popup */}
            <Modal isOpen={isModalOpen} onClose={closeModal}>

                {/* Adding New Stocks */}
                {modalMode === "add" && (
                    <>
                        <div className="modal-heading">
                            <h1 className="modal-title">Add Consumable Stock</h1>
                            <div className="modal-date-time">
                                <p>March 12, 2025</p>
                                <p>11:37 pm</p>
                            </div>
                        </div>

                        {stockForms.map((form, index) => (
                            <div className="modal-content add" key={index}>
                                <form className="add-stock-form" id={`add-stock-form-${index}`}>
                                    <div className="form-group">
                                        <label>Item Name</label>
                                        <input className={formErrors[index]?.name ? "invalid-input" : ""}
                                            type="text" placeholder="Enter item name here..."
                                            value={form.name} 
                                            onChange={(e) => handleFormChange(index, "name", e.target.value)}
                                        />
                                        <p className="add-error-message">{formErrors[index]?.name}</p>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Total Quantity</label>
                                            <input className={formErrors[index]?.quantity ? "invalid-input" : ""}
                                                type="number" min="0" 
                                                value={form.quantity} 
                                                onChange={(e) => handleFormChange(index, "quantity", Number(e.target.value))}
                                            />
                                            <p className="add-error-message">{formErrors[index]?.quantity}</p>
                                        </div>

                                        <div className="form-group">
                                            <label>Unit Measure</label>
                                            <select className={formErrors[index]?.unit ? "invalid-input" : ""}
                                                value={form.unit}
                                                onChange={(e) => handleFormChange(index, "unit", e.target.value)}
                                            >
                                                <option value="" disabled>Select...</option>
                                                <option value="pcs">pcs (pieces)</option>
                                                <option value="kg">kg (kilograms)</option>
                                                <option value="l">L (liters)</option>
                                                <option value="m">m (meters)</option>
                                                <option value="box">box/es</option>
                                                <option value="pack">pack/s</option>
                                                <option value="roll">roll/s</option>
                                            </select>
                                            <p className="add-error-message">{formErrors[index]?.unit}</p>
                                        </div>

                                        <div className="form-group">
                                            <label>Unit Price</label>
                                            <input className={formErrors[index]?.price ? "invalid-input" : ""}
                                                type="number" step="0.01" min="0"
                                                value={form.price}
                                                onChange={(e) => handleFormChange(index, "price", Number(e.target.value))}
                                            />
                                            <p className="add-error-message">{formErrors[index]?.price}</p>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Usable Quantity</label>
                                            <input className={formErrors[index]?.usable ? "invalid-input" : ""}
                                                type="number" min="0"
                                                value={form.usable}
                                                onChange={(e) => handleFormChange(index, "usable", Number(e.target.value))}
                                            />
                                            <p className="add-error-message">{formErrors[index]?.usable}</p>
                                        </div>

                                        <div className="form-group">
                                            <label>Defective Quantity</label>
                                            <input className={formErrors[index]?.defective ? "invalid-input" : ""}
                                                type="number" min="0"
                                                value={form.defective}
                                                onChange={(e) => handleFormChange(index, "defective", Number(e.target.value))}
                                            />
                                            <p className="add-error-message">{formErrors[index]?.defective}</p>
                                        </div>

                                        <div className="form-group">
                                            <label>Missing Quantity</label>
                                            <input className={formErrors[index]?.missing ? "invalid-input" : ""}
                                                type="number" min="0"
                                                value={form.missing}
                                                onChange={(e) => handleFormChange(index, "missing", Number(e.target.value))}
                                            />
                                            <p className="add-error-message">{formErrors[index]?.missing}</p>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Reorder Level</label>
                                            <input className={formErrors[index]?.reorder ? "invalid-input" : ""}
                                                type="number"
                                                value={form.reorder}
                                                onChange={(e) => handleFormChange(index, "reorder", Number(e.target.value))}
                                            />
                                            <p className="add-error-message">{formErrors[index]?.reorder}</p>
                                        </div>

                                        <div className="form-group">
                                            <label>Status</label>
                                            <select className={formErrors[index]?.status ? "invalid-input" : ""}
                                                value={form.status}
                                                onChange={(e) => handleFormChange(index, "status", e.target.value)}
                                            >
                                                <option value="available">Available</option>
                                                <option value="out-of-stock">Out of Stock</option>
                                                <option value="low-stock">Low Stock</option>
                                                <option value="maintenance">Under Maintenance</option>
                                            </select>
                                            <p className="add-error-message">{formErrors[index]?.status}</p>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Expiration Date</label>
                                        <input className={formErrors[index]?.expiration ? "invalid-input" : ""}
                                            type="date"
                                            value={form.expiration}
                                            onChange={(e) => handleFormChange(index, "expiration", e.target.value)}
                                        />
                                        <p className="add-error-message">{formErrors[index]?.expiration}</p>
                                    </div>
                                </form>

                                {stockForms.length > 1 && (
                                    <div className="remove-btn-wrapper">
                                        <button type="button" className="remove-stock-btn" onClick={() => handleRemoveStock(index)}>
                                            <i className="ri-close-line" /> Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="modal-actions">
                            <button type="button" className="add-another-btn" onClick={handleAddAnotherStock}>
                                <i className="ri-add-line" /> Add Another Stock
                            </button>
                            
                            <button type="submit" className="submit-btn" onClick={handleSubmit}>
                                Save
                            </button>
                        </div>
                    </>
                )}

                {/* Viewing Current Stocks */}
                {modalMode === "view" && activeRow && (
                    <>
                        <div className="modal-heading">
                            <h1 className="modal-title">{activeRow.name}</h1>
                        </div>

                        <div className="modal-content view">
                            <div className="modal-view-properties">
                                <strong>Current Stock:</strong>
                                <strong>Price:</strong>
                                <strong>Reorder Level:</strong>
                                <strong>Status:</strong>
                                <strong>Expiration Date:</strong>
                                <strong>Date Added:</strong>
                            </div>

                            <div className="modal-view-values">
                                <p>{activeRow.stock} {activeRow.unit}</p>
                                <p>Php 100.00</p>
                                <p>{activeRow.reorder}</p>
                                <p>{formatStatus(activeRow.status)}</p>
                                <p>April 29, 2027</p>
                                <p>April 1, 2024</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Editing Current Stocks */}
                {modalMode === "edit" && activeRow && (
                    <>
                        <div className="modal-heading">
                            <h1 className="modal-title">Edit Consumable Stock</h1>
                            <div className="modal-date-time">
                                <p>March 12, 2025</p>
                                <p>11:37 pm</p>
                            </div>
                        </div>

                        <div className="modal-content edit">
                            <form className="edit-stock-form" id="edit-stock-form">
                                <div className="form-group">
                                    <label>Item Name</label>
                                    <input type="text" defaultValue={activeRow.name} />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Quantity</label>
                                        <input type="number" defaultValue={activeRow.stock} />
                                    </div>

                                    <div className="form-group">
                                        <label>Unit Measure</label>
                                        <select>
                                            <option value="" disabled>Select...</option>
                                            <option value="pcs">pcs (pieces)</option>
                                            <option value="kg">kg (kilograms)</option>
                                            <option value="l">L (liters)</option>
                                            <option value="m">m (meters)</option>
                                            <option value="box">box/es</option>
                                            <option value="pack">pack/s</option>
                                            <option value="roll">roll/s</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Unit Price</label>
                                        <input type="number" step="0.01" defaultValue={0} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Reorder Level</label>
                                        <input type="number" defaultValue={activeRow.reorder} />
                                    </div>

                                    <div className="form-group">
                                        <label>Status</label>
                                        <select>
                                            <option value="available">Available</option>
                                            <option value="out-of-stock">Out of Stock</option>
                                            <option value="low-stock">Low Stock</option>
                                            <option value="maintenance">Under Maintenance</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Expiration Date</label>
                                    <input type="date" />
                                </div>
                            </form>
                        </div>

                        <div className="modal-actions">
                            <button type="submit" className="submit-btn" form="edit-stock-form">
                                Update
                            </button>
                        </div>
                    </>
                )}

                {/* Deleting Stocks */}
                {modalMode === "delete" && activeRow && (
                    <>
                        <div className="modal-heading">
                            <h1 className="modal-title">Confirm Deletion</h1>
                        </div>

                        <div className="modal-content delete">
                            <p>Are you sure you want to delete <strong>{activeRow.name}</strong>?</p>
                            <div className="modal-actions delete">
                                <button className="delete-btn" onClick={handleDeleteConfirm}>Delete</button>
                                <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                            </div>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}
