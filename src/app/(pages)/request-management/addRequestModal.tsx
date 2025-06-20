import React, { useState, useEffect } from "react";

import {
	showRequestSaveConfirmation, showRequestSavedSuccess,
	showCloseWithoutSavingConfirmation, showPartialSuccessWarning, showStockSaveError
} from "@/utils/sweetAlert";

import "@/styles/forms.css";
import { fetchEmployees, Employee } from '../../lib/fetchEmployees';

// Enums to match your Prisma schema
enum RequestType {
	BORROW = 'BORROW',
	CONSUME = 'CONSUME'
}

enum RequestStatus {
	RETURNED = 'RETURNED',
	NOT_RETURNED = 'NOT_RETURNED',
	CONSUMED = 'CONSUMED'
}

// Export the interface so it can be imported by other components
export interface RequestForm {
    empName: string,
    type: RequestType | '',
    reqStatus: RequestStatus | '',
    itemName: string,
    itemStock: number,
    unit_measure?: string, // <-- add this line
    reqQuantity: number,
    purpose: string,
    expectedDate: string,
}

interface FormError {
	[key: string]: string;
}

interface AddRequestModalProps {
	onSave: (RequestForms: RequestForm[]) => void;
	onClose: () => void;
}

export default function AddRequestModal({ onSave, onClose }: AddRequestModalProps) {
	// Initial request form state
	const initialFormState: RequestForm = {
		empName: "",
		type: "",
		reqStatus: "",
		itemName: "",
		itemStock: 0,
		unit_measure: "", // <-- add this line
		reqQuantity: 0,
		purpose: "",
		expectedDate: "",
	};

	const [requestForms, setRequestForms] = useState<RequestForm[]>([initialFormState]);
	const [formErrors, setFormErrors] = useState<FormError[]>([{}]);
	const [isDirty, setIsDirty] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [inventoryItems, setInventoryItems] = useState<any[]>([]);
	const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
	const [isLoadingItems, setIsLoadingItems] = useState(true);

	// Fetch employees when component mounts
	useEffect(() => {
		const loadEmployees = async () => {
			try {
				setIsLoadingEmployees(true);
				const employeeData = await fetchEmployees();

				// Sort employees alphabetically by full name (first name + last name)
				const sortedEmployees = employeeData.sort((a, b) => {
					const fullNameA = `${a.emp_first_name} ${a.emp_last_name}`.toLowerCase();
					const fullNameB = `${b.emp_first_name} ${b.emp_last_name}`.toLowerCase();
					return fullNameA.localeCompare(fullNameB);
				});

				setEmployees(sortedEmployees);
			} catch (error) {
				console.error('Failed to load employees:', error);
			} finally {
				setIsLoadingEmployees(false);
			}
		};

		loadEmployees();
	}, []);

	// Fetch inventory items when component mounts
	useEffect(() => {
		const loadInventoryItems = async () => {
			try {
				setIsLoadingItems(true);
				const response = await fetch('/api/item');

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const itemsData = await response.json();

				setInventoryItems(itemsData.items || []);
			} catch (error) {
				console.error('Failed to load inventory items:', error);
			} finally {
				setIsLoadingItems(false);
			}
		};

		loadInventoryItems();
	}, []);

	// Track if any form has been modified
	useEffect(() => {
		setIsDirty(true);
	}, [requestForms]);

	// Helper function to determine status based on request type
	const getStatusFromRequestType = (requestType: RequestType | ''): RequestStatus | '' => {
		switch (requestType) {
			case RequestType.BORROW:
				return RequestStatus.NOT_RETURNED;
			case RequestType.CONSUME:
				return RequestStatus.CONSUMED;
			default:
				return '';
		}
	};

	const handleFormChange = (index: number, field: string, value: any) => {
		if (field === "empName") {
			// Update empName for all forms
			setRequestForms((prev) =>
				prev.map((form) => ({ ...form, empName: value }))
			);

			// Clear empName error in the first form (index 0)
			if (formErrors[0]?.empName) {
				const newErrors = [...formErrors];
				delete newErrors[0].empName;
				setFormErrors(newErrors);
			}
		} else if (field === "type") {
			// Update type and automatically set status based on request type
			const newStatus = getStatusFromRequestType(value as RequestType);

			setRequestForms((prev) =>
				prev.map((form, i) =>
					i === index ? {
						...form,
						[field]: value,
						reqStatus: newStatus,
						// Clear expectedDate if changing from borrow to consume
						expectedDate: value === RequestType.CONSUME ? "" : form.expectedDate,
					} : form
				)
			);

		} else if (field === "itemName") {
			const selectedItem = inventoryItems.find(item => item.item_id === value);

			setRequestForms((prev) =>
				prev.map((form, i) =>
					i === index ? {
						...form,
						itemName: value,
						itemStock: selectedItem ? selectedItem.current_stock : 0,
                        unit_measure: selectedItem ? selectedItem.unit_measure : "",
					} : form
				)
			);

			// Clear the error for that field and reqStatus
			if (formErrors[index]?.[field] || formErrors[index]?.reqStatus || formErrors[index]?.itemName) {
				const newErrors = [...formErrors];
				delete newErrors[index][field];
				delete newErrors[index].reqStatus;
				delete newErrors[index].itemName;
				setFormErrors(newErrors);
			}
		} else {
			// Update field for specific form
			setRequestForms((prev) =>
				prev.map((form, i) =>
					i === index ? { ...form, [field]: value } : form
				)
			);

			// Clear the error for that field
			if (formErrors[index]?.[field]) {
				const newErrors = [...formErrors];
				delete newErrors[index][field];
				setFormErrors(newErrors);
			}
		}
	};

	const handleAddAnotherRequest = () => {
		const empName = requestForms[0].empName; // Get empName from the first form
		const newForm = { ...initialFormState, empName }; // Copy empName into new form
		setRequestForms((prev) => [...prev, newForm]);
		setFormErrors((prev) => [...prev, {}]);
	};

	const handleRemoveRequest = (index: number) => {
		setRequestForms((prev) => prev.filter((_, i) => i !== index));
		setFormErrors((prev) => prev.filter((_, i) => i !== index));
	};

	const validateForm = (): boolean => {
		const errors = requestForms.map((form) => {
			const errorObj: FormError = {};

			if (!form.empName) errorObj.empName = "Employee name is required";
			if (!form.type) errorObj.type = "Request type is required";
			if (!form.reqStatus) errorObj.reqStatus = "Request status is required";
			if (!form.itemName) errorObj.itemName = "Item name is required";
			if (form.reqQuantity <= 0) errorObj.reqQuantity = "Quantity must be more than 0";
			if (form.reqQuantity > form.itemStock) errorObj.reqQuantity = "Quantity must be less than the current stock";
			if (!form.purpose) errorObj.purpose = "Request purpose is required";

			// Validate expectedDate only if type is "BORROW"
			if (form.type === RequestType.BORROW) {
				if (!form.expectedDate) {
					errorObj.expectedDate = "Expected return date is required";
				} else {
					const today = new Date();
					const selectedDate = new Date(form.expectedDate);
					today.setHours(0, 0, 0, 0);
					selectedDate.setHours(0, 0, 0, 0);
					if (selectedDate < today) {
						errorObj.expectedDate = "Expected return date cannot be in the past";
					}
				}
			}

			return errorObj;
		});

		setFormErrors(errors);
		return errors.every((err) => Object.keys(err).length === 0);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		const result = await showRequestSaveConfirmation(requestForms.length);
		if (result.isConfirmed) {
			setIsSaving(true);
			try {
				const response = await fetch('/api/request', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ requests: requestForms }),
				});

				let result;
				try {
					result = await response.json();
				} catch (jsonError) {
					console.error('Error parsing JSON response:', jsonError);
					throw new Error('Failed to parse server response');
				}

				if (!response.ok) {
					// Extract more detailed error information if available
					const errorMessage = result && result.error 
						? `Error: ${result.error}` 
						: `Failed to save employee request (Status: ${response.status})`;
					
					if (result && result.details) {
						console.error('Error details:', result.details);
					}
					
					throw new Error(errorMessage);
				}

				if (result.success) {
					// Show success message using SweetAlert
					await showRequestSavedSuccess(requestForms.length);
					
					// Call the onSave callback to close the modal or update the parent
					onSave(requestForms);
					window.location.reload();
				} else {
					setError(result.error || 'Failed to save employee request');
				}
				
				// Check if there were any partial failures
				if (result.partialFailure) {
					console.warn('Some request were processed successfully, but others failed:', result.results);
					// You could show a warning to the user here using SweetAlert
					await showPartialSuccessWarning();
				}

			} catch (error: any) {
				console.error('Error saving employee request:', error);
				setError(error.message);
				
				// Show error using SweetAlert
				await showStockSaveError(error.message);
			} finally {
				setIsSaving(false);
			}
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
				<h1 className="modal-title">Add Request</h1>
				<div className="modal-date-time">
					<p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
					<p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
				</div>

				<button className="close-modal-btn" onClick={handleClose}>
					<i className="ri-close-line"></i>
				</button>
			</div>

			{/* Employee Name (shared) */}
			<div className="modal-content add">
				<form className="add-request-form">
					<div className="form-group">
						<label>Employee Name</label>
						<select
							className={formErrors[0]?.empName ? "invalid-input" : ""}
							value={requestForms[0].empName}
							onChange={(e) => handleFormChange(0, 'empName', e.target.value)}
							disabled={isLoadingEmployees}
						>
							<option value="" disabled>
								{isLoadingEmployees ? "Loading employees..." : "Select employee name..."}
							</option>
							{employees.map((employee) => (
								<option key={employee.emp_id} value={employee.emp_id}>
									{`${employee.emp_first_name} ${employee.emp_last_name}`}
								</option>
							))}
						</select>
						<p className="add-error-message">{formErrors[0]?.empName}</p>
					</div>
					<div className="form-row">
							<div className="form-group">
								<label>Department</label>
								<input
									disabled
									type="text"
									value=""
									placeholder="Department"
								/>
							</div>
							<div className="form-group">
								<label>Role</label>
								<input
									disabled
									type="text"
									value=""
									placeholder="Role"
								/>
							</div>
							<div className="form-group">
								<label>Contact Number</label>
								<input
									disabled
									type="text"
									value=""
									placeholder="Contact Number"
								/>
							</div>
						</div>

				</form>
			</div>

			{/* Add Request Form - allows adding multiple requests */}
			{requestForms.map((form, index) => (
				<div className="modal-content add" key={index}>
					<form className="add-request-form">
						<div className="form-row">
							{/* Request Type */}
							<div className="form-group">
								<label>Request Type</label>
								<select
									className={formErrors[index]?.type ? "invalid-input" : ""}
									value={form.type}
									onChange={(e) => handleFormChange(index, "type", e.target.value)}
								>
									<option value="" disabled>Select request type...</option>
									<option value={RequestType.BORROW}>Borrow</option>
									<option value={RequestType.CONSUME}>Consume</option>
								</select>
								<p className="add-error-message">{formErrors[index]?.type}</p>
							</div>

							{/* Status - Display only, automatically determined by request type */}
							<div className="form-group">
								<label>Status</label>
								<input
									type="text"
									className="readonly-input"
									value={
										form.reqStatus === RequestStatus.NOT_RETURNED ? 'Not Returned' :
											form.reqStatus === RequestStatus.CONSUMED ? 'Consumed' :
												form.reqStatus === RequestStatus.RETURNED ? 'Returned' : ''
									}
									readOnly
									disabled={!form.type}
									placeholder={!form.type ? "" : ""}
								/>
								<p className="add-error-message">{formErrors[index]?.reqStatus}</p>
							</div>
						</div>

						{/* Item Name */}
						<div className="form-group">
							<label>Item Name</label>
							<select
								className={formErrors[index]?.itemName ? "invalid-input" : ""}
								value={form.itemName}
								onChange={(e) => handleFormChange(index, "itemName", e.target.value)}
								disabled={isLoadingItems || !form.type }
							>
								<option value="" disabled>
									{isLoadingItems ? "Loading items..." : 
									!form.type ? "" : 
									"Select item name..."}
								</option>
								{inventoryItems
									.filter((item) => {
										if (item.current_stock <= 0) return false;
										if (form.type === RequestType.CONSUME) {
											return item.category.category_name.toLowerCase() === "consumable";
										}
										if (form.type === RequestType.BORROW) {
											return item.category.category_name.toLowerCase() !== "consumable";
										}
										return true; // Show all if no type selected
									})
									.map((item) => (
										<option key={item.item_id} value={item.item_id}>
											{item.item_name}
										</option>
									))}
							</select>
							<p className="add-error-message">{formErrors[index]?.itemName}</p>
						</div>

						<div className="form-row">
							{/* Current Stock */}
							<div className="form-group">
								<label>Available Stock</label>
								<input
									disabled
									type="text"
									value={
										form.itemStock && form.unit_measure
											? `${form.itemStock} ${form.unit_measure}`
											: ""
									}
									placeholder="0"
								/>
							</div>

							{/* Requested Quantity */}
							<div className="form-group">
								<label>Requested Quantity</label>
								<input
									className={formErrors[index]?.reqQuantity ? "invalid-input" : ""}
									type="number"
									step="1"
									min="0"
									value={form.reqQuantity || ""}
									onChange={(e) => handleFormChange(index, "reqQuantity", Number(e.target.value))}
									placeholder="0"
								/>
								<p className="add-error-message">{formErrors[index]?.reqQuantity}</p>
							</div>
						</div>

						{/* Request Purpose */}
						<div className="form-group">
							<label>Request Purpose</label>
							<textarea
								className={formErrors[index]?.purpose ? "invalid-input" : ""}
								value={form.purpose}
								onChange={(e) => handleFormChange(index, "purpose", e.target.value)}
								placeholder="Enter request purpose here..."
							>
							</textarea>
							<p className="add-error-message">{formErrors[index]?.purpose}</p>
						</div>

						{/* Expected Return Date - Only show for BORROW requests */}
						{form.type === RequestType.BORROW && (
							<div className="form-group">
								<label>Expected Return Date</label>
								<input
									className={formErrors[index]?.expectedDate ? "invalid-input" : ""}
									type="date"
									value={form.expectedDate}
									onChange={(e) => handleFormChange(index, "expectedDate", e.target.value)}
								/>
								<p className="add-error-message">{formErrors[index]?.expectedDate}</p>
							</div>
						)}

					</form>

					{/* Remove Request Button - Only show if there's more than one form */}
					{requestForms.length > 1 && (
						<div className="remove-btn-wrapper">
							<button
								type="button"
								className="remove-request-btn"
								onClick={() => handleRemoveRequest(index)}
							>
								<i className="ri-close-line" /> Remove
							</button>
						</div>
					)}
				</div>
			))}

			<div className="modal-actions add">
				<button type="button" className="add-another-btn" onClick={handleAddAnotherRequest}>
					<i className="ri-add-line" /> Add Another Request
				</button>

				<button type="submit" className="submit-btn" onClick={handleSubmit}>
					<i className="ri-save-3-line" /> {isSaving ? 'Saving...' : 'Save'}
				</button>
			</div>

		</>
	);
}