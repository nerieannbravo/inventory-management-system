import React, { useState, useEffect } from "react";

import {
	showRequestUpdateConfirmation, showRequestUpdatedSuccess,
	showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

interface EditRequestModalProps {
	request: {
		request_id: string;
		emp_id: string;
		item_id: string;
		inventoryItem: {
			item_id: string;
			item_name: string;
		};
		empName: string;
		emp_first_name: string;
		emp_last_name: string;
		request_type: string;
		quantity: number;
		status: string;
		req_purpose: string;
		expected_return_date?: string;
		actual_return_date?: string;
		date_created: string;
		date_updated?: string;
		created_by: string;
	};
	onSave: (updatedItem: any) => void;
	onClose: () => void;
	
}

export default function EditRequestModal({ request, onSave, onClose }: EditRequestModalProps) {
	const formatTypeForDisplay = (dbType: string) => {
		const statusMap: Record<string, string> = {
			'BORROW' : 'Borrow'
		};
		return statusMap[dbType] || dbType.toLowerCase();
	};
	// Helper function to convert database status to form display value
	const formatStatusForDisplay = (dbStatus: string) => {
		const statusMap: Record<string, string> = {
			'RETURNED': 'Returned',
			'NOT_RETURNED': 'Not Returned',
		};
		return statusMap[dbStatus] || dbStatus.toLowerCase();
	};

	const formatStatusForDatabase = (displayStatus: string) => {
		const statusMap: Record<string, string> = {
			'Returned': 'RETURNED',
			'Not Returned': 'NOT_RETURNED',
		};
		return statusMap[displayStatus] || displayStatus.toUpperCase();
	};

	const [formData, setFormData] = useState({
		request_id: request.request_id,
		empName: request.empName,
		request_type: formatTypeForDisplay(request.request_type),
		status: "",
		item_name: request.inventoryItem.item_name,
		quantity: request.quantity, // Default value, would be populated from item in a real app
		req_purpose: request.req_purpose, // Default value, would be populated from item in a real app
		date_created: request.date_created,
		expected_return_date: request.expected_return_date || "",// Default value, would be populated from item in a real app
		actual_return_date: request.actual_return_date || ""
	});

	// State to track if form is dirty (has changes)
	const [isFormDirty, setIsFormDirty] = useState(false);
	const [originalData] = useState({ ...formData });

	// Add formErrors state
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
		if (!formData.status) errors.status = "Request status is required";
		if (formData.status === "not-returned") errors.status = "Request status should be updated";

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		const result = await showRequestUpdateConfirmation(formData.item_name);
		if (result.isConfirmed) {
			try {
				const updateData = {
					request_id: formData.request_id,
					status: formatStatusForDatabase(formData.status)
				};

				// Make the API call to update the item
				const response = await fetch('/api/request', {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(updateData),
				});

				const responseData = await response.json();

				if (response.ok && responseData.success) {
					// Call onSave to update the parent component's state
					onSave(responseData.request);
					await showRequestUpdatedSuccess();
					onClose(); // Close the modal after successful update
					window.location.reload();
				} else {
					console.error('Update failed:', responseData.error);
					// You might want to show an error message to the user here
					alert(`Update failed: ${responseData.error || 'Unknown error'}`);
				} 
			} catch (error) {
				console.error('Error updating item:', error);
				alert('Failed to update item. Please try again.');
			}
		}
	};

	const handleClose = async () => {
		if (!isFormDirty) {
			onClose();
			return;
		}

		const result = await showCloseWithoutUpdatingConfirmation();
		if (result.isConfirmed) {
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

					{/* Item Name */}
					<div className="form-group">
						<label>Item Name</label>
						<input disabled
							className={formErrors?.itemName ? "invalid-input" : ""}
							type="text"
							value={formData.item_name}
							onChange={(e) => handleChange("itemName", e.target.value)}
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
								value={formData.request_type}
								onChange={(e) => handleChange("type", e.target.value)}
							/>
							<p className="edit-error-message"></p>
						</div>

						{/* Requested Quantity */}
						<div className="form-group">
							<label>Requested Quantity</label>
							<input disabled
								className={formErrors?.reqQuantity ? "invalid-input" : ""}
								type="number"
								min="0"
								value={formData.quantity}
								onChange={(e) => handleChange("reqQuantity", Number(e.target.value))}
							/>
						</div>

						{/* Status */}
						<div className="form-group">
							<label>Status</label>
							<select
								className={formErrors?.status ? "invalid-input" : ""}
								value={formatStatusForDisplay(formData.status)}
								onChange={(e) => handleChange("status", e.target.value)}
							>
								<option value="" disabled>Select status...</option>
								<option value="returned">Returned</option>
								<option value="not-returned">Not Returned</option>
								{/* <option value="consumed">Consumed</option> */}
							</select>
							<p className="edit-error-message">{formErrors?.status}</p>
						</div>
					</div>

					{/* Request Purpose */}
					<div className="form-group">
						<label>Request Purpose</label>
						<textarea disabled
							className={formErrors?.purpose ? "invalid-input" : ""}
							value={formData.req_purpose}
							onChange={(e) => handleChange("req_purpose", e.target.value)}
						>
						</textarea>
						<p className="edit-error-message"></p>
					</div>

					{/* Expected Return Date */}
					{formData.request_type === "Borrow" && (
						<div className="form-group">
							<label>Expected Return Date</label>
							<input disabled
								className={formErrors?.expectedDate ? "invalid-input" : ""}
								type="date"
								value={formData.expected_return_date}
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

		</>
	);
}