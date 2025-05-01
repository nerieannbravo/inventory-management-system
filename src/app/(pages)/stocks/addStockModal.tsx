import React, { useState } from "react";
import ConfirmationPopup from "@/components/confirmationPopup";
import "@/styles/forms.css";

// Export the interface so it can be imported by other components
export interface StockForm {
	name: string,
	quantity: number,
	unit: string,
	reorder: number,
	usable: number,
	defective: number,
	missing: number,
	category: string,
	status: string,
	expiration: string,
}

interface FormError {
	[key: string]: string;
}

interface AddStockModalProps {
	onSave: (stockForm: StockForm) => void;
	onClose: () => void;
}

export default function AddStockModal({ onSave, onClose }: AddStockModalProps) {
	const [stockForm, setStockForm] = useState<StockForm>({
		name: "",
		quantity: 10,
		unit: "",
		reorder: 0,
		usable: 0,
		defective: 0,
		missing: 0,
		category: "",
		status: "available",
		expiration: "",
	});

	const [formErrors, setFormErrors] = useState<FormError>({});
	const [isDirty, setIsDirty] = useState(false);
	const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
	const [showClosingConfirmation, setShowClosingConfirmation] = useState(false);

	const handleFormChange = (field: string, value: any) => {
		setStockForm((prevForm) => ({ ...prevForm, [field]: value }));
		setIsDirty(true);

		if (formErrors[field]) {
			const newErrors = { ...formErrors };
			delete newErrors[field];
			if (["usable", "defective", "missing", "quantity"].includes(field)) {
				delete newErrors["sum"];
			}
			setFormErrors(newErrors);
		}
	};

	const validateForm = (form: StockForm): FormError => {
		const errors: FormError = {};

		if (!form.name) errors.name = "Item name is required";
		// if (form.quantity <= 0) errors.quantity = "Total quantity must be greater than 0";
		// if (!form.unit) errors.unit = "Unit measure is required";
		if (form.reorder < 0) errors.reorder = "Reorder level must be 0 or more";
		if (form.reorder > form.quantity) errors.reorder = "Reorder level cannot exceed total quantity";
		if (!form.category) errors.category = "Item category is required";
		

		const sum = form.usable + form.defective + form.missing;
		if (sum !== form.quantity) {
			errors.sum = "The combined total of usable, defective, and missing must equal the total quantity";
		}

		if (form.expiration) {
			const today = new Date();
			const selectedDate = new Date(form.expiration);
			today.setHours(0, 0, 0, 0);
			selectedDate.setHours(0, 0, 0, 0);
			if (selectedDate < today) {
				errors.expiration = "Expiration date cannot be in the past";
			}
		}

		return errors;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const errors = validateForm(stockForm);
		setFormErrors(errors);
		if (Object.keys(errors).length === 0) {
			setShowSaveConfirmation(true);
		}
	};

	const handleClose = () => {
		if (isDirty) {
			setShowClosingConfirmation(true);
		} else {
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

			<div className="modal-content add">
				<form className="add-stock-form">
					{/* Item Name */}
					<div className="form-group">
						<label>Item Name</label>
						<select
							className={formErrors.name ? "invalid-input" : ""}
							value={stockForm.name}
							onChange={(e) => handleFormChange("name", e.target.value)}
						>
							<option value="" disabled>Select an item</option>
							<option value="Alcohol">Alcohol</option>
							<option value="Syringe">Syringe</option>
							<option value="Bandage">Bandage</option>
							<option value="Gloves">Gloves</option>
							<option value="Face Mask">Face Mask</option>
						</select>
						<p className="add-error-message">{formErrors.name}</p>
					</div>

					<div className="form-row">
						{/* Quantity */}
						<div className="form-group">
							<label>Total Quantity</label>
							<input
								disabled
								// className={formErrors.quantity ? "invalid-input" : ""}
								type="number"
								min="0"
								value={stockForm.quantity}
								// onChange={(e) => handleFormChange("quantity", Number(e.target.value))}
							/>
							{/* <p className="add-error-message">{formErrors.quantity}</p> */}
						</div>

						{/* Unit */}
						<div className="form-group">
							<label>Unit Measure</label>
							<select
								disabled
								// className={formErrors.unit ? "invalid-input" : ""}
								value={stockForm.unit}
							// onChange={(e) => handleFormChange("unit", e.target.value)}
							>
								{/* <option value="" disabled>Select...</option> */}
								<option value="pcs">pcs (pieces)</option>
								<option value="kg">kg (kilograms)</option>
								<option value="l">L (liters)</option>
								<option value="m">m (meters)</option>
								<option value="box">box/es</option>
								<option value="pack">pack/s</option>
								<option value="roll">roll/s</option>
							</select>
							{/* <p className="add-error-message">{formErrors.unit}</p> */}
						</div>

						{/* Reorder Level */}
						<div className="form-group">
							<label>Reorder Level</label>
							<input
								className={formErrors.reorder ? "invalid-input" : ""}
								type="number"
								step="0.1"
								min="0"
								value={stockForm.reorder}
								onChange={(e) => handleFormChange("reorder", Number(e.target.value))}
							/>
							<p className="add-error-message">{formErrors.reorder}</p>
						</div>
					</div>

					<div className="form-row">
						{/* Usable */}
						<div className="form-group">
							<label>Usable Quantity</label>
							<input
								className={formErrors.usable ? "invalid-input" : ""}
								type="number"
								step="0.1"
								min="0"
								value={stockForm.usable}
								onChange={(e) => handleFormChange("usable", Number(e.target.value))}
							/>
						</div>

						{/* Defective */}
						<div className="form-group">
							<label>Defective Quantity</label>
							<input
								className={formErrors.defective ? "invalid-input" : ""}
								type="number"
								step="0.1"
								min="0"
								value={stockForm.defective}
								onChange={(e) => handleFormChange("defective", Number(e.target.value))}
							/>
						</div>

						{/* Missing */}
						<div className="form-group">
							<label>Missing Quantity</label>
							<input
								className={formErrors.missing ? "invalid-input" : ""}
								type="number"
								step="0.1"
								min="0"
								value={stockForm.missing}
								onChange={(e) => handleFormChange("missing", Number(e.target.value))}
							/>
						</div>
					</div>

					{/* Sum Error */}
					<div className="form-group">
						{formErrors.sum && <p className="add-error-message quantity">{formErrors.sum}</p>}
					</div>

					<div className="form-row">
						{/* Category */}
						<div className="form-group">
							<label>Category</label>
							<select
								className={formErrors.category ? "invalid-input" : ""}
								value={stockForm.category}
								onChange={(e) => handleFormChange("category", e.target.value)}
							>
								<option value="" disabled>Select...</option>
								<option value="consumable">Consumable</option>
								<option value="mach-equip">Machine/Equipment</option>
							</select>
							<p className="add-error-message">{formErrors.category}</p>
						</div>

						{/* Status */}
						<div className="form-group">
							<label>Status</label>
							<select disabled value={stockForm.status}>
								<option value="available">Available</option>
								<option value="out-of-stock">Out of Stock</option>
								<option value="low-stock">Low Stock</option>
								<option value="maintenance">Under Maintenance</option>
							</select>
						</div>
					</div>

					{/* Expiration */}
					<div className="form-group">
						<label>Expiration Date</label>
						<input
							className={formErrors.expiration ? "invalid-input" : ""}
							type="date"
							value={stockForm.expiration}
							onChange={(e) => handleFormChange("expiration", e.target.value)}
						/>
						<p className="add-error-message">{formErrors.expiration}</p>
					</div>
				</form>
			</div>

			<div className="modal-actions add">
				<button type="submit" className="submit-btn" onClick={handleSubmit}>
					<i className="ri-save-3-line" /> Save
				</button>
			</div>

			{/* Save Confirmation */}
			<ConfirmationPopup
				isOpen={showSaveConfirmation}
				onClose={() => setShowSaveConfirmation(false)}
				onConfirm={() => onSave(stockForm)}
				title="Confirm Save"
				message="Are you sure you want to save this stock item?"
				confirmText="Save"
				cancelText="Cancel"
				variant="success"
			/>

			{/* Close Confirmation */}
			<ConfirmationPopup
				isOpen={showClosingConfirmation}
				onClose={() => setShowClosingConfirmation(false)}
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