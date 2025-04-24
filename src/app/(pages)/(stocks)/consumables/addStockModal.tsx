import React, { useState, useEffect } from "react";
import ConfirmationPopup from "../../../../components/confirmationPopup";
import { PdfPreviewModal, useStockReceiptPDF } from "./stockReceiptPDF";

import "@/styles/forms.css";

interface StockForm {
	name: string;
	quantity: number;
	unit: string;
	price: number;
	usable: number;
	defective: number;
	missing: number;
	reorder: number;
	status: string;
	expiration: string;
}

interface AddStockModalProps {
	onSave: (stockForms: StockForm[]) => void;
	onClose: () => void;
}

export default function AddStockModal({ onSave, onClose }: AddStockModalProps) {
	// Initial stock form state
	const initialFormState = {
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
	};

	const [stockForms, setStockForms] = useState<StockForm[]>([initialFormState]);
	const [formErrors, setFormErrors] = useState<Record<string, string>[]>([{}]);
	const [isFormDirty, setIsFormDirty] = useState(false);

	// Use the custom PDF hook
	const {
		showPdfPreview,
		handlePreviewReceipt,
		handleClosePdfPreview
	} = useStockReceiptPDF(stockForms);

	// Confirmation dialog states
	const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
	const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

	// Track if any form has been modified
	useEffect(() => {
		setIsFormDirty(true);
	}, [stockForms]);

	const handleFormChange = (index: number, field: string, value: any) => {
		setStockForms((prev) =>
			prev.map((form, i) =>
				i === index ? { ...form, [field]: value } : form
			)
		);
	};

	const handleAddAnotherStock = () => {
		setStockForms((prev) => [
			...prev,
			initialFormState
		]);

		// Add a new empty errors object for the new form
		setFormErrors(prev => [...prev, {}]);
	};

	const handleRemoveStock = (index: number) => {
		setStockForms((prev) => prev.filter((_, i) => i !== index));
		setFormErrors((prev) => prev.filter((_, i) => i !== index));
	};

	// Input validations
	const validateForm = () => {
		const errors = stockForms.map((form) => {
			const errorObj: Record<string, string> = {};

			if (!form.name.trim()) {
				errorObj.name = "Item name is required";
			} else if (form.name.length > 50) {
				errorObj.name = "Item name cannot exceed 50 characters";
			}

			if (form.quantity <= 0) errorObj.quantity = "Quantity must be greater than 0";
			if (!form.unit) errorObj.unit = "Unit measure is required";
			if (form.price <= 0) errorObj.price = "Price must be greater than 0";
			if (form.usable < 0) errorObj.usable = "Usable quantity must be 0 or more";
			if (form.defective < 0) errorObj.defective = "Defective quantity must be 0 or more";
			if (form.usable > form.quantity) errorObj.usable = "Usable quantity cannot exceed total quantity";
			if (form.defective > form.quantity) errorObj.defective = "Defective quantity cannot exceed total quantity";
			if (form.missing > form.quantity) errorObj.missing = "Missing quantity cannot exceed total quantity";
			if (form.missing < 0) errorObj.missing = "Missing quantity must be 0 or more";
			if (form.reorder < 1) errorObj.reorder = "Reorder level must be greater than 0";
			if (form.reorder > form.quantity) errorObj.reorder = "Reorder level cannot exceed total quantity";

			// Sum check for total quantity
			// const sum = form.usable + form.defective + form.missing;
			// if (sum > form.quantity || sum != form.quantity) {
			// 	errorObj.usable = "Sum of these quantities cannot exceed and must be equal total quantity";
			// 	errorObj.defective = "Sum of these quantities cannot exceed and must be equal total quantity";
			// 	errorObj.missing = "Sum of these quantities cannot exceed and must be equal total quantity";
			// }

			// Sum check for total quantity - show one unified error
			const sum = form.usable + form.defective + form.missing;
			if (sum !== form.quantity) {
				errorObj.sum = "The combined total of usable, defective, and missing must equal the total quantity";
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const isValid = validateForm();
		if (!isValid) return;

		// Show save confirmation
		setShowSaveConfirmation(true);
	};

	const handleConfirmSave = () => {
		onSave(stockForms);
	};

	const handleClose = () => {
		if (isFormDirty) {
			setShowCloseConfirmation(true);
		} else {
			onClose();
		}
	};

	// Modified preview handler to validate form first
	const handlePreviewClick = () => {
		const isValid = validateForm();
		if (isValid) {
			handlePreviewReceipt();
		}
	};

	return (
		<>
			<button className="close-modal-btn" onClick={handleClose}>
				<i className="ri-close-line"></i>
			</button>

			<div className="modal-heading">
				<h1 className="modal-title">Add Consumable Stock</h1>
				<div className="modal-date-time">
					<p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
					<p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
				</div>
			</div>

			{stockForms.map((form, index) => (
				<div className="modal-content add" key={index}>
					<form className="add-stock-form" id={`add-stock-form-${index}`}>

						{/* Item Name Input */}
						<div className="form-group">
							<label>Item Name</label>
							<input
								className={formErrors[index]?.name ? "invalid-input" : ""}
								type="text"
								placeholder="Enter item name here..."
								value={form.name}
								onChange={(e) => handleFormChange(index, "name", e.target.value)}
							/>
							<p className="add-error-message">{formErrors[index]?.name}</p>
						</div>

						<div className="form-row">
							{/* Total Quantity Input */}
							<div className="form-group">
								<label>Total Quantity</label>
								<input
									className={formErrors[index]?.quantity ? "invalid-input" : ""}
									type="number"
									min="0"
									value={form.quantity}
									onChange={(e) =>
										handleFormChange(index, "quantity", Number(e.target.value))
									}
								/>
								<p className="add-error-message">{formErrors[index]?.quantity}</p>
							</div>

							{/* Unit Measure Input */}
							<div className="form-group">
								<label>Unit Measure</label>
								<select
									className={formErrors[index]?.unit ? "invalid-input" : ""}
									value={form.unit}
									onChange={(e) => handleFormChange(index, "unit", e.target.value)}
								>
									<option value="" disabled>
										Select...
									</option>
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

							{/* Unit Price Input */}
							<div className="form-group">
								<label>Unit Price</label>
								<input
									className={formErrors[index]?.price ? "invalid-input" : ""}
									type="number"
									step="0.01"
									min="0"
									value={form.price}
									onChange={(e) =>
										handleFormChange(index, "price", Number(e.target.value))
									}
								/>
								<p className="add-error-message">{formErrors[index]?.price}</p>
							</div>
						</div>

						<div className="form-row">
							{/* Usable Quanity Input */}
							<div className="form-group">
								<label>Usable Quantity</label>
								<input
									className={formErrors[index]?.usable ? "invalid-input" : ""}
									type="number"
									step="0.1"
									min="0"
									value={form.usable}
									onChange={(e) =>
										handleFormChange(index, "usable", Number(e.target.value))
									}
								/>
								{/* <p className="add-error-message">{formErrors[index]?.usable}</p> */}
							</div>

							{/* Defective Quanity Input */}
							<div className="form-group">
								<label>Defective Quantity</label>
								<input
									className={formErrors[index]?.defective ? "invalid-input" : ""}
									type="number"
									step="0.1"
									min="0"
									value={form.defective}
									onChange={(e) =>
										handleFormChange(index, "defective", Number(e.target.value))
									}
								/>
								{/* <p className="add-error-message">{formErrors[index]?.defective}</p> */}
							</div>

							{/* Missing Quanity Input */}
							<div className="form-group">
								<label>Missing Quantity</label>
								<input
									className={formErrors[index]?.missing ? "invalid-input" : ""}
									type="number"
									step="0.1"
									min="0"
									value={form.missing}
									onChange={(e) =>
										handleFormChange(index, "missing", Number(e.target.value))
									}
								/>
								{/* <p className="add-error-message">{formErrors[index]?.missing}</p> */}
								<p className="add-error-message"></p>
							</div>
						</div>

						{/* Quantity Error Message */}
						{formErrors[index]?.sum && (
							<p className="add-error-message quantity">{formErrors[index].sum}</p>
						)}

						<div className="form-row">
							{/* Reorder Level Input */}
							<div className="form-group">
								<label>Reorder Level</label>
								<input
									className={formErrors[index]?.reorder ? "invalid-input" : ""}
									type="number"
									step="0.1"
									min="0"
									value={form.reorder}
									onChange={(e) =>
										handleFormChange(index, "reorder", Number(e.target.value))
									}
								/>
								<p className="add-error-message">{formErrors[index]?.reorder}</p>
							</div>

							{/* Status Input */}
							<div className="form-group">
								<label>Status</label>
								<select disabled
									className={formErrors[index]?.status ? "invalid-input" : ""}
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

						{/* Expiration Date Input */}
						<div className="form-group">
							<label>Expiration Date</label>
							<input
								className={formErrors[index]?.expiration ? "invalid-input" : ""}
								type="date"
								value={form.expiration}
								onChange={(e) =>
									handleFormChange(index, "expiration", e.target.value)
								}
							/>
							<p className="add-error-message">{formErrors[index]?.expiration}</p>
						</div>
					</form>

					{/* Remove Stock Button */}
					{stockForms.length > 1 && (
						<div className="remove-btn-wrapper">
							<button
								type="button"
								className="remove-stock-btn"
								onClick={() => handleRemoveStock(index)}
							>
								<i className="ri-close-line" /> Remove
							</button>
						</div>
					)}
				</div>
			))}

			<div className="modal-actions add">
				<button type="button" className="add-another-btn" onClick={handleAddAnotherStock}>
					<i className="ri-add-line" /> Add Another Stock
				</button>

				<button type="button" className="preview-btn" onClick={handlePreviewClick}>
					<i className="ri-receipt-line" /> Preview Receipt
				</button>

				<button type="submit" className="submit-btn" onClick={handleSubmit}>
					<i className="ri-save-3-line" /> Save
				</button>
			</div>

			{/* PDF Preview Modal - now using react-pdf */}
			<PdfPreviewModal
				isOpen={showPdfPreview}
				onClose={handleClosePdfPreview}
				stockForms={stockForms}
			/>

			{/* Save Confirmation Dialog - simplified message */}
			<ConfirmationPopup
				isOpen={showSaveConfirmation}
				onClose={() => setShowSaveConfirmation(false)}
				onConfirm={handleConfirmSave}
				title="Confirm Save"
				message="Are you sure you want to save these stock items?"
				confirmText="Save"
				cancelText="Cancel"
				variant="success"
			/>

			{/* Close Without Saving Dialog */}
			<ConfirmationPopup
				isOpen={showCloseConfirmation}
				onClose={() => setShowCloseConfirmation(false)}
				onConfirm={onClose}
				title="Unsaved Changes"
				message="You have unsaved changes. Are you sure you want to close without saving?"
				confirmText="Close Without Saving"
				cancelText="Continue Editing"
				variant="warning"
			/>
		</>
	);
}