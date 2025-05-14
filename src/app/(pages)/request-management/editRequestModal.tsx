import React, { useState, useEffect } from "react";

import ConfirmationPopup from "@/components/confirmationPopup";

import "@/styles/forms.css";

interface EditRequestModalProps {
	item: {
		id: number;
		empName: string;
		type: string;
		itemName: string;
		reqDate: string;
		reqStatus: string;
		// Additional fields would be included in a real application
	};
	onSave: (updatedItem: any) => void;
	onClose: () => void;
}

export default function EditRequestModal({ item, onSave, onClose }: EditRequestModalProps) {
	const [formData, setFormData] = useState({
		id: item.id,
		empName: item.empName,
		type: item.type,
		reqStatus: item.reqStatus,
		itemName: item.itemName,
		reqQuantity: 0, // Default value, would be populated from item in a real app
		purpose: "", // Default value, would be populated from item in a real app
		reqDate: item.reqDate,
		expectedDate: "" // Default value, would be populated from item in a real app
	});

	// State to track if form is dirty (has changes)
	const [isFormDirty, setIsFormDirty] = useState(false);
	const [originalData] = useState({ ...formData });

	// Add formErrors state
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	// Confirmation dialog states
	const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
	const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

	// Check if form data has changed from original
	useEffect(() => {
		const hasChanges = JSON.stringify(originalData) !== JSON.stringify(formData);
		setIsFormDirty(hasChanges);
	}, [formData, originalData]);

	const handleChange = (field: string, value: any) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};

		// Validate status
		if (!formData.reqStatus) errors.reqStatus = "Request status is required";

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const isValid = validateForm();
		if (!isValid) return;

		// Show update confirmation instead of updating immediately
		setShowUpdateConfirmation(true);
	};

	const handleConfirmUpdate = () => {
		onSave(formData);
	};

	const handleClose = () => {
		if (isFormDirty) {
			setShowCloseConfirmation(true);
		} else {
			onClose();
		}
	};

	return (
		<>
			<div className="modal-heading">
				<h1 className="modal-title">Edit Request</h1>
				<div className="modal-date-time">
					<p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
					<p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
				</div>

				<button className="close-modal-btn" onClick={handleClose}>
					<i className="ri-close-line"></i>
				</button>
			</div>

			{/* Edit Request Form */}
			<div className="modal-content edit">
				<form className="edit-request-form" id="edit-request-form" onSubmit={handleSubmit}>
					{/* Employee Name */}
					<div className="form-group">
						<label>Employee Name</label>
						<input disabled
							className={formErrors?.empName ? "invalid-input" : ""}
							type="text"
							value={formData.empName}
							onChange={(e) => handleChange("empName", e.target.value)}
						/>
						<p className="edit-error-message"></p>
					</div>

					<div className="form-row">
						{/* Request Type */}
						<div className="form-group">
							<label>Request Type</label>
							<input disabled
								className={formErrors?.type ? "invalid-input" : ""}
								type="text"
								value={formData.type}
								onChange={(e) => handleChange("type", e.target.value)}
							/>
							<p className="edit-error-message"></p>
						</div>

						{/* Status */}
						<div className="form-group">
							<label>Status</label>
							<select
								className={formErrors?.reqStatus ? "invalid-input" : ""}
								value={formData.reqStatus}
								onChange={(e) => handleChange("reqStatus", e.target.value)}
							>
								<option value="returned">Returned</option>
								<option value="not-returned">Not Returned</option>
								{/* <option value="consumed">Consumed</option> */}
							</select>
							<p className="edit-error-message">{formErrors?.reqStatus}</p>
						</div>
					</div>

					<div className="form-row">
						{/* Item Name */}
						<div className="form-group">
							<label>Item Name</label>
							<input disabled
								className={formErrors?.itemName ? "invalid-input" : ""}
								type="text"
								value={formData.itemName}
								onChange={(e) => handleChange("itemName", e.target.value)}
							/>
							<p className="edit-error-message"></p>
						</div>

						{/* Quantity */}
						<div className="form-group">
							<label>Quantity</label>
							<input disabled
								className={formErrors?.reqQuantity ? "invalid-input" : ""}
								type="number"
								min="0"
								value={formData.reqQuantity}
								onChange={(e) => handleChange("reqQuantity", Number(e.target.value))}
							/>
						</div>
					</div>

					{/* Request Purpose */}
					<div className="form-group">
						<label>Request Purpose</label>
						<textarea disabled
							className={formErrors?.purpose ? "invalid-input" : ""}
							value={formData.purpose}
							onChange={(e) => handleChange("purpose", e.target.value)}
						>
						</textarea>
						<p className="edit-error-message"></p>
					</div>

					{/* Expected Return Date */}
					{formData.type === "Borrow" && (
						<div className="form-group">
							<label>Expected Return Date</label>
							<input disabled
								className={formErrors?.expectedDate ? "invalid-input" : ""}
								type="date"
								value={formData.expectedDate}
								onChange={(e) => handleChange("expectedDate", e.target.value)}
							/>
							<p className="edit-error-message"></p>
						</div>
					)}

				</form>
			</div>

			<div className="modal-actions">
				<button type="submit" className="submit-btn" form="edit-request-form">
					<i className="ri-save-3-line" /> Update
				</button>
			</div>

			{/* Update Confirmation Dialog */}
			<ConfirmationPopup
				isOpen={showUpdateConfirmation}
				onClose={() => setShowUpdateConfirmation(false)}
				onConfirm={handleConfirmUpdate}
				title="Confirm Update"
				message={`Are you sure you want to update the request details for "${formData.itemName}"?`}
				confirmText="Update"
				cancelText="Cancel"
				variant="success"
			/>

			{/* Close Without Saving Dialog */}
			<ConfirmationPopup
				isOpen={showCloseConfirmation}
				onClose={() => setShowCloseConfirmation(false)}
				onConfirm={onClose}
				title="Unsaved Changes"
				message="You have unsaved changes. Are you sure you want to close without updating?"
				confirmText="Close Without Saving"
				cancelText="Continue Editing"
				variant="warning"
			/>
		</>
	);
}