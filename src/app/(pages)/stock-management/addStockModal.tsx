import React, { useState, useEffect } from "react";

import SearchableDropdown from "@/components/searchableDropdown";

import {
	showStockSaveConfirmation, showStockSavedSuccess,
	showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface StockForm {
	itemName: string;
	totalQuantity: number;
	unitMeasure: string;
	reorderLevel: number;
	usableQuantity: number;
	defectiveQuantity: number;
	missingQuantity: number;
	category: string;
	status: string;
	expirationDate: string;
}

interface FormError {
	[key: string]: string;
}

interface AddStockModalProps {
	item?: {
		id: number;
		itemName: string;
		approvedQuantity: number;
		receivedQuantity: number;
		unitMeasure: string;
		usableQuantity?: number;
	};
	onSave: (stockForms: StockForm, itemId?: number) => void;
	onClose: () => void;
}

export default function AddStockModal({ item, onSave, onClose }: AddStockModalProps) {
	// Calculate missing quantity from approved vs received
	const calculateMissingFromDelivery = () => {
		if (!item) return 0;
		const approved = item.approvedQuantity || 0;
		const received = item.receivedQuantity || 0;
		return Math.max(0, approved - received); // Difference = items not delivered
	};

	const [stockForm, setStockForm] = useState<StockForm>({
		itemName: item?.itemName || "",
		totalQuantity: item?.approvedQuantity || 0,
		unitMeasure: item?.unitMeasure || "",
		reorderLevel: 0,
		usableQuantity: item?.usableQuantity || item?.receivedQuantity || 0, // Default to all received items as usable
		defectiveQuantity: 0,
		missingQuantity: calculateMissingFromDelivery(), // Auto-populate missing from delivery
		category: "",
		status: "Available",
		expirationDate: "",
	});

	const [formErrors, setFormErrors] = useState<FormError>({});
	const [isDirty, setIsDirty] = useState(false);

	// Define category options
	const categoryOptions = [
		{ id: 1, label: "Consumable", value: "Consumable" },
		{ id: 2, label: "Tool", value: "Tool" },
		{ id: 3, label: "Machine", value: "Machine" },
		{ id: 4, label: "Equipment", value: "Equipment" },
	];

	// Track if form has been modified
	useEffect(() => {
		setIsDirty(true);
	}, [stockForm]);

	// Function to handle changes in the form fields
	const handleChange = (field: string, value: any) => {
		setStockForm((prev) => ({ ...prev, [field]: value }));

		if (formErrors[field]) {
			const newErrors = { ...formErrors };
			delete newErrors[field];
			setFormErrors(newErrors);
		}
	};

	const validateForm = (): boolean => {
		const errors: FormError = {};

		if (!stockForm.itemName) errors.itemName = "Item name is required";
		if (stockForm.reorderLevel < 0) errors.reorderLevel = "Reorder level must be at least 0";
		if (stockForm.reorderLevel >= stockForm.totalQuantity) errors.reorderLevel = "Reorder level must be lower than total quantity";
		if (!stockForm.category) errors.category = "Item category is required";

		const sum = stockForm.usableQuantity + stockForm.defectiveQuantity + stockForm.missingQuantity;
		if (sum !== stockForm.totalQuantity) {
			errors.sum = "The combined total of usable, defective, and missing must equal the total quantity";
		}

		if (stockForm.expirationDate) {
			const today = new Date();
			const selectedDate = new Date(stockForm.expirationDate);
			today.setHours(0, 0, 0, 0);
			selectedDate.setHours(0, 0, 0, 0);
			if (selectedDate < today) {
				errors.expiration = "Expiration date cannot be in the past";
			}
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		const result = await showStockSaveConfirmation();
		if (result.isConfirmed) {
			onSave(stockForm, item?.id);  // Pass the item ID
			await showStockSavedSuccess();
		}
	};

	const handleClose = async () => {
		if (!isDirty) {
			onClose();
			return;
		}

		const result = await showCloseWithoutSavingConfirmation();
		if (result.isConfirmed) {
			onClose();
		}
	};

	return (
		<>
			<div className="modal-heading">
				<h1 className="modal-title">Add Stock</h1>
				<div className="modal-date-time">
					<p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
					<p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
				</div>

				<button className="close-modal-btn" onClick={handleClose}>
					<i className="ri-close-line"></i>
				</button>
			</div>

			{/* Add Stock Form */}
			<div className="modal-content add">
				<form className="add-form">
					{/* Item Name */}
					<div className="form-group">
						<label>Item Name</label>
						<input disabled
							type="text"
							value={stockForm.itemName}
						/>
						<p className="add-error-message">{formErrors?.itemName}</p>
					</div>

					<div className="form-row">
						{/* Total Quantity */}
						<div className="form-group">
							<label>Total Quantity</label>
							<input disabled
								type="number"
								step="0.1"
								min="0"
								value={stockForm.totalQuantity}
							/>
						</div>

						{/* Unit Measure */}
						<div className="form-group">
							<label>Unit Measure</label>
							<input disabled
								type="text"
								value={stockForm.unitMeasure}
							/>
						</div>

						{/* Reorder Level */}
						<div className="form-group">
							<label className="required">Reorder Level</label>
							<input
								className={formErrors?.reorderLevel ? "invalid-input" : ""}
								type="number"
								step={0.01}
								min={0.01}
								value={stockForm.reorderLevel || ""}
								onChange={(e) => handleChange("reorderLevel", parseFloat(e.target.value) || 0)}
								placeholder="Enter reorder level here..."
							/>
							<p className="add-error-message">{formErrors?.reorderLevel}</p>
						</div>
					</div>

					<div className="form-row">
						{/* Usable Quantity */}
						<div className="form-group">
							<label className="required">Usable Quantity</label>
							<input
								className={formErrors?.usableQuantity ? "invalid-input" : ""}
								type="number"
								step={0.01}
								min={0}
								value={stockForm.usableQuantity || ""}
								onChange={(e) => handleChange("usableQuantity", parseFloat(e.target.value) || 0)}
								placeholder="Enter usable quantity here..."
							/>
						</div>

						{/* Defective Quantity */}
						<div className="form-group">
							<label>Defective Quantity</label>
							<input
								className={formErrors?.defectiveQuantity ? "invalid-input" : ""}
								type="number"
								step={0.01}
								min={0}
								value={stockForm.defectiveQuantity || ""}
								onChange={(e) => handleChange("defectiveQuantity", parseFloat(e.target.value) || 0)}
								placeholder="Enter defective quantity here..."
							/>
						</div>

						{/* Missing Quantity */}
						<div className="form-group">
							<label>Missing Quantity</label>
							<input
								className={formErrors?.missingQuantity ? "invalid-input" : ""}
								type="number"
								step={0.01}
								min={0}
								value={stockForm.missingQuantity || ""}
								onChange={(e) => handleChange("missingQuantity", parseFloat(e.target.value) || 0)}
								placeholder="Enter missing quantity here..."
							/>
						</div>
					</div>

					{/* Sum Error */}
					<div className="form-group">
						{formErrors?.sum && <p className="add-error-message quantity">{formErrors.sum}</p>}
					</div>

					<div className="form-row">
						{/* Category */}
						<div className="form-group">
							<label className="required">Category</label>
							<SearchableDropdown
								options={categoryOptions}
								value={stockForm.category}
								onChange={(selected, customValue) => {
									const value = selected ? selected.value : customValue || "";
									handleChange("category", value);
								}}
								placeholder="Search category..."
								error={formErrors?.category}
								allowCustom={false}
								noResultsText="No category found"
							/>
						</div>

						{/* Status */}
						<div className="form-group">
							<label>Status</label>
							<input disabled
								type="text"
								value={stockForm.status}
							/>
						</div>
					</div>

					{/* Expiration */}
					{stockForm.category === "Consumable" && (
						<div className="form-group">
							<label>Expiration Date</label>
							<input
								className={formErrors?.expirationDate ? "invalid-input" : ""}
								type="date"
								value={stockForm.expirationDate}
								onChange={(e) => handleChange("expirationDate", e.target.value)}
							/>
							<p className="add-error-message">{formErrors?.expirationDate}</p>
						</div>
					)}
				</form>
			</div>

			<div className="modal-actions add">
				<button type="submit" className="submit-btn" onClick={handleSubmit}>
					<i className="ri-save-3-line" /> Save
				</button>
			</div>
		</>
	);
}