import React, { useState, useEffect } from "react";
import {
	showStockSaveConfirmation, showStockSavedSuccess,
	showCloseWithoutSavingConfirmation, showDuplicateItemError,
	showStockSaveError, showPartialSuccessWarning
} from "@/utils/sweetAlert";
import "@/styles/forms.css";
import { fetchAvailableItems, Item as ExternalItem } from '../../lib/fetchItems';

// Export the interface so it can be imported by other components
export interface StockForm {
	transaction_id: string, // external transaction id
	item_id: string,
	itemName: string,
	quantity: number,
	unit: string,
	reorder: number,
	usable: number,
	defective: number,
	missing: number,
	// remarks: string,
	category: string,
	status: string,
	expiration: string,
}

interface FormError {
	[key: string]: string;
}

interface AddStockModalProps {
	onSave: (stockForms: StockForm[]) => void;
	onClose: () => void;
}

interface Category {
	category_id: string;
	category_name: string;
}

export default function AddStockModal({ onSave, onClose }: AddStockModalProps) {
	// Initial stock form state
	const initialFormState: StockForm = {
		transaction_id: '',
		item_id: '',
		itemName: '',
		quantity: 0,
		unit: '',
		reorder: 0,
		usable: 0,
		defective: 0,
		missing: 0,
		// remarks: "",
		category: '',
		status: 'AVAILABLE',
		expiration: '',
	};

	const [stockForms, setStockForms] = useState<StockForm[]>([initialFormState]);
	const [formErrors, setFormErrors] = useState<FormError[]>([{}]);
	const [isDirty, setIsDirty] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// State for items fetched from Supabase
	const [items, setItems] = useState<ExternalItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// State for categories
	const [categories, setCategories] = useState<Category[]>([]);
	// Add this state to track reorder disabled per row
	const [reorderDisabled, setReorderDisabled] = useState<boolean[]>([true]);
	// Track which forms have pre-filled categories (should be disabled)
	const [preFilledCategories, setPreFilledCategories] = useState<boolean[]>([false]);

	// Fetch items from Supabase when component mounts
	useEffect(() => {
		async function loadItems() {
			try {
				setIsLoading(true);
				setError(null);
				const data = await fetchAvailableItems();
				setItems(data);
			} catch (error) {
				console.error("Error loading items:", error);
				setError("Failed to load items. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		}

		loadItems();
	}, []);

	// Fetch categories
	useEffect(() => {
		async function loadCategories() {
			try {
				const response = await fetch('/api/category');
				if (!response.ok) {
					throw new Error('Failed to fetch categories');
				}
				const data = await response.json();
				setCategories(data.categories);
			} catch (error) {
				console.error("Error loading categories:", error);
				setError("Failed to load categories. Please try again later.");
			}
		}

		loadCategories();
	}, []);

	// Track if any form has been modified
	useEffect(() => {
		setIsDirty(true);
	}, [stockForms]);

	// Update this effect to sync reorderDisabled when adding/removing forms
	useEffect(() => {
		setReorderDisabled(stockForms.map(form => form.category !== "Consumable"));
	}, [stockForms]);

	// Handle item selection - populate unit and category from the selected item
	const handleItemSelection = async (index: number, transactionId: string) => {
		try {
			// Find the selected item in our already fetched items array
			const selectedItem = items.find(item => item.transaction_id === transactionId);

			if (selectedItem) {
				// Check if this item is already selected in another form
				const isDuplicate = stockForms.some((form, i) =>
					i !== index && form.transaction_id === transactionId
				);

				if (isDuplicate) {
					// Show SweetAlert for duplicate error
					await showDuplicateItemError();
					return;
				}
				console.log('Selected item:', selectedItem); // Debug log
				console.log('Item name for check:', selectedItem.item_name); // Debug log

				let categoryValue = "";
				let reorderValue = 0;
				let hasPrefillCategory = false;

				// Check if item already exists in local database
				try {
					const existingItemResponse = await fetch(`/api/stock?action=check-existing&itemName=${encodeURIComponent(selectedItem.item_name)}`);

					console.log('API Response status:', existingItemResponse.status); // Debug log

					if (!existingItemResponse.ok) {
						throw new Error(`HTTP error! status: ${existingItemResponse.status}`);
					}

					const existingItemData = await existingItemResponse.json();
					console.log('Existing item data:', existingItemData); // Debug log

					if (existingItemData.success && existingItemData.exists) {
						// Item exists in local database - use existing category and reorder level
						categoryValue = existingItemData.item.category_name;
						reorderValue = existingItemData.item.reorder_level;
						hasPrefillCategory = true; // Mark this as pre-filled
						console.log('Pre-filling with:', { categoryValue, reorderValue }); // Debug log
					}
				} catch (apiError) {
					console.error("Error checking existing item:", apiError);
					// Don't fail the entire operation, just log the error
				}

				// Update the form with data from the selected item
				setStockForms(prev =>
					prev.map((form, i) =>
						i === index
							? {
								...form,
								transaction_id: selectedItem.transaction_id,
								item_id: selectedItem.item_id,
								itemName: selectedItem.item_name,
								unit: selectedItem.item_unit,
								quantity: selectedItem.quantity,
								usable: selectedItem.quantity,
								defective: 0,
								missing: 0,
								// Pre-fill category and reorder if item exists in local DB
								category: categoryValue,
								reorder: reorderValue,
							}
							: form
					)
				);

				// Update the pre-filled categories tracking
				setPreFilledCategories(prev =>
					prev.map((isPrefilled, i) => i === index ? hasPrefillCategory : isPrefilled)
				);

				// Clear errors for the name field
				if (formErrors[index] && formErrors[index].transaction_id) {
					const newErrors = [...formErrors];
					delete newErrors[index].transaction_id;
					// Also clear category error if we auto-filled it
					if (categoryValue) {
						delete newErrors[index].category;
					}
					// Clear reorder error if we auto-filled it
					if (reorderValue > 0) {
						delete newErrors[index].reorder;
					}
					setFormErrors(newErrors);
				}
			}
		} catch (error) {
			console.error("Error selecting item:", error);
			// You might want to show an error message to the user here
			setError("Failed to load item data. Please try again.");
		}
	};

	const handleFormChange = (index: number, field: string, value: any) => {
		setStockForms((prev) =>
			prev.map((form, i) =>
				i === index ? { ...form, [field]: value } : form
			)
		);

		// Category logic for reorder
		if (field === "category") {
			setStockForms((prev) =>
				prev.map((form, i) =>
					i === index
						? {
							...form,
							reorder: value === "Consumable" ? form.reorder : 0,
						}
						: form
				)
			);
			setReorderDisabled((prev) =>
				prev.map((disabled, i) => i === index ? value !== "Consumable" : disabled)
			);
		}

		// Clear errors for the changed field
		if (formErrors[index] && formErrors[index][field]) {
			const newErrors = [...formErrors];
			delete newErrors[index][field];

			// Also clear sum error if quantity-related fields are changed
			if (["usable", "defective", "missing", "quantity"].includes(field)) {
				delete newErrors[index]["sum"];
			}

			setFormErrors(newErrors);
		}
	};

	const handleAddAnotherStock = () => {
		setStockForms((prev) => [...prev, initialFormState]);
		setFormErrors((prev) => [...prev, {}]);
		setPreFilledCategories((prev) => [...prev, false]); // New form has no pre-filled category
	};

	const handleRemoveStock = (index: number) => {
		setStockForms((prev) => prev.filter((_, i) => i !== index));
		setFormErrors((prev) => prev.filter((_, i) => i !== index));
		setPreFilledCategories((prev) => prev.filter((_, i) => i !== index));
	};

	const validateForm = (): boolean => {
		const errors = stockForms.map((form) => {
			const errorObj: FormError = {};

			if (!form.transaction_id) errorObj.transaction_id = "Item name is required";
			if (form.reorder < 0) errorObj.reorder = "Reorder level must be at least 0";
			if (form.reorder >= form.quantity) errorObj.reorder = "Reorder level must be lower than total quantity";
			if (!form.category) errorObj.category = "Item category is required";

			const sum = form.usable + form.defective + form.missing;
			if (sum !== form.quantity) {
				errorObj.sum = "The combined total of usable, defective, and missing must equal the total quantity";
			}

			if (form.expiration) {
				const today = new Date();
				const selectedDate = new Date(form.expiration);
				today.setHours(0, 0, 0, 0);
				selectedDate.setHours(0, 0, 0, 0);
				if (selectedDate < today) {
					errorObj.expiration = "Expiration date cannot be in the past";
				}
			}

			// Check for duplicate items
			const duplicates = stockForms
				.filter((_, i) => i !== stockForms.indexOf(form))
				.filter((otherForm) => otherForm.transaction_id === form.transaction_id);

			if (duplicates.length > 0) {
				errorObj.duplicate = "This item is already selected in another form";
			}

			return errorObj;
		});

		setFormErrors(errors);
		return errors.every((err) => Object.keys(err).length === 0);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		// Show confirmation dialog using SweetAlert
		const result = await showStockSaveConfirmation(stockForms.length);

		if (result.isConfirmed) {
			setIsSaving(true);
			try {
				// Use the API to save the stock items to the database
				const response = await fetch('/api/item', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ stockItems: stockForms }),
				});

				// Try to get response body as JSON, even if status is not OK
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
						: `Failed to save stock items (Status: ${response.status})`;

					if (result && result.details) {
						console.error('Error details:', result.details);
					}

					throw new Error(errorMessage);
				}

				if (result.success) {
					// Show success message using SweetAlert
					await showStockSavedSuccess(stockForms.length);

					// Call the onSave callback to close the modal or update the parent
					onSave(stockForms);
					window.location.reload();
				} else {
					setError(result.error || 'Failed to save stock items');
				}

				// Check if there were any partial failures
				if (result.partialFailure) {
					console.warn('Some items were processed successfully, but others failed:', result.results);
					// You could show a warning to the user here using SweetAlert
					await showPartialSuccessWarning();
				}
			} catch (error: any) {
				console.error('Error saving stock items:', error);
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

		// Show confirmation dialog using SweetAlert
		const result = await showCloseWithoutSavingConfirmation();
		if (result.isConfirmed) {
			onClose();
		}
	};

	// Format item display name by combining item_name and custom_for fields
	const getItemDisplayName = (item: ExternalItem) => item.item_name;

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

			{/* Loading indicator */}
			{isLoading}

			{/* Error message */}
			{error && <div className="error-message">{error}</div>}

			{/* Add Stock Form - allows adding multiple stocks */}
			{stockForms.map((form, index) => (
				<div className="modal-content add" key={index}>
					<form className="add-stock-form" id={`add-stock-form-${index}`}>
						{/* Item Name */}
						<div className="form-group">
							<label>Item Name</label>
							<select
								className={formErrors[index]?.transaction_id || formErrors[index]?.duplicate ? "invalid-input" : ""}
								value={form.transaction_id}
								onChange={(e) => handleItemSelection(index, e.target.value)}
								disabled={isLoading || isSaving}
							>
								<option value="" disabled>{isLoading ? "Loading items..." : "Select item name..."}</option>
								{items.map((item) => (
									<option key={item.transaction_id} value={item.transaction_id}>
										{getItemDisplayName(item)}
									</option>
								))}
							</select>
							<p className="add-error-message">
								{formErrors[index]?.transaction_id || formErrors[index]?.duplicate}
							</p>
						</div>

						<div className="form-row">
							{/* Quantity */}
							<div className="form-group">
								<label>Total Quantity</label>
								<input disabled
									type="number"
									step="1"
									min="0"
									value={form.quantity || ""}
									placeholder="0"
								/>
							</div>

							{/* Unit Measure */}
							<div className="form-group">
								<label>Unit Measure</label>
								<input disabled
									value={form.unit}
									placeholder="unit"
								/>
							</div>

							{/* Category */}
							<div className="form-group">
								<label>Category</label>
								<select
									className={formErrors[index]?.category ? "invalid-input" : ""}
									value={form.category}
									onChange={(e) => handleFormChange(index, "category", e.target.value)}
									disabled={isSaving || preFilledCategories[index]}
								>
									<option value="" disabled>Select category...</option>
									{categories.map(category => (
										<option
											key={category.category_id}
											value={category.category_name}
										>
											{category.category_name}
										</option>
									))}
								</select>
								<p className="add-error-message">{formErrors[index]?.category}</p>
							</div>
						</div>

						<div className="form-row">
							{/* Usable */}
							<div className="form-group">
								<label>Usable Quantity</label>
								<input
									className={formErrors[index]?.usable ? "invalid-input" : ""}
									type="number"
									step="1"
									min="0"
									value={form.usable || ""}
									onChange={(e) => handleFormChange(index, "usable", Number(e.target.value))}
									placeholder="0"
									disabled={isSaving}
								/>
							</div>

							{/* Defective */}
							<div className="form-group">
								<label>Defective Quantity</label>
								<input
									className={formErrors[index]?.defective ? "invalid-input" : ""}
									type="number"
									step="1"
									min="0"
									value={form.defective || ""}
									onChange={(e) => handleFormChange(index, "defective", Number(e.target.value))}
									placeholder="0"
									disabled={isSaving}
								/>
							</div>

							{/* Missing */}
							<div className="form-group">
								<label>Missing Quantity</label>
								<input
									className={formErrors[index]?.missing ? "invalid-input" : ""}
									type="number"
									step="1"
									min="0"
									value={form.missing || ""}
									onChange={(e) => handleFormChange(index, "missing", Number(e.target.value))}
									placeholder="0"
									disabled={isSaving}
								/>
							</div>
						</div>

						{/* Sum Error */}
						<div className="form-group">
							{formErrors[index]?.sum && <p className="add-error-message quantity">{formErrors[index].sum}</p>}
						</div>

						{/* Inspection Remarks */}
						{/* <div className="form-group">
							<label>Inspection Remarks</label>
							<textarea
								className={formErrors[index]?.remarks ? "invalid-input" : ""}
								value=""
								onChange={(e) => handleFormChange(index, "remarks", e.target.value)}
								placeholder="Enter inspection remarks here..."
							>
							</textarea>
							<p className="add-error-message">{formErrors[index]?.remarks}</p>
						</div> */}

						<div className="form-row">
							{/* Reorder Level */}
							{form.category.toLowerCase() === "consumable" && (
								<div className="form-group">
									<label>Reorder Level</label>
									<input
										className={formErrors[index]?.reorder ? "invalid-input" : ""}
										type="number"
										step="1"
										min="0"
										value={form.reorder || ""}
										onChange={(e) => handleFormChange(index, "reorder", Number(e.target.value))}
										placeholder="0"
										disabled={isSaving || reorderDisabled[index]}
									/>
									<p className="add-error-message">{formErrors[index]?.reorder}</p>
								</div>
							)}

							{/* Status */}
							<div className="form-group">
								<label>Status</label>
								<input
									disabled value={form.status}
								/>
							</div>
						</div>

						{/* Expiration Date */}
						{form.category.toLowerCase() === "consumable" && (
							<div className="form-group">
								<label>Expiration Date</label>
								<input
									className={formErrors[index]?.expiration ? "invalid-input" : ""}
									type="date"
									value={form.expiration}
									onChange={(e) => handleFormChange(index, "expiration", e.target.value)}
									disabled={isSaving}
									min={new Date().toISOString().split("T")[0]}
								/>
								<p className="add-error-message">{formErrors[index]?.expiration}</p>
							</div>
						)}

					</form>

					{/* Remove Stock Button - Only show if there's more than one form */}
					{stockForms.length > 1 && (
						<div className="remove-btn-wrapper">
							<button
								type="button"
								className="remove-stock-btn"
								onClick={() => handleRemoveStock(index)}
								disabled={isSaving}
							>
								<i className="ri-close-line" /> Remove
							</button>
						</div>
					)}
				</div>
			))}

			<div className="modal-actions add">
				<button type="button" className="add-another-btn" onClick={handleAddAnotherStock}
					disabled={isSaving}>
					<i className="ri-add-line" /> Add Another Stock
				</button>

				<button type="submit" className="submit-btn" onClick={handleSubmit}
					disabled={isSaving}>
					<i className="ri-save-3-line" /> {isSaving ? 'Saving...' : 'Save'}
				</button>
			</div>
		</>
	);
}