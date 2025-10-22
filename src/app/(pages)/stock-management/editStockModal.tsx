import React, { useState, useEffect } from "react";

import {
	showStockUpdateConfirmation, showStockUpdatedSuccess,
	showCloseWithoutUpdatingConfirmation
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

interface EditStockModalProps {
	item: {
		id: number,
		itemName: string,
		currentStock: number,
		unitMeasure: string,
		category: string,
		status: string,
		reorderLevel: number,
		// Additional fields would be included in a real application
	};
	onSave: (updatedItem: any) => void;
	onClose: () => void;
}

export default function EditStockModal({ item, onSave, onClose }: EditStockModalProps) {
	const [formData, setFormData] = useState({
		id: item.id,
		itemName: item.itemName,
		currentStock: item.currentStock,
		unitMeasure: item.unitMeasure,
		reorderLevel: item.reorderLevel,
		category: item.category,
		status: item.status,
		expiration: "" // Default value, would be populated from item in a real app
	});

	// State to track if form is dirty (has changes)
	const [isFormDirty, setIsFormDirty] = useState(false);
	const [originalData] = useState({ ...formData });

	// Add formErrors state similar to AddStockModal
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

		// Validate reorderLevel
		if (formData.reorderLevel < 0) errors.reorderLevel = "Reorder level must be 0 or more";
		if (formData.reorderLevel >= formData.currentStock) errors.reorderLevel = "Reorder level cannot exceed total quantity";

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		const result = await showStockUpdateConfirmation(formData.itemName);
		if (result.isConfirmed) {
			onSave(formData);
			await showStockUpdatedSuccess();
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
            case "expired":
                return "Expired";
            case "in-use":
                return "In Use";
            default:
                return status;
        }
    };

	return (
		<>
			<div className="modal-heading">
				<h1 className="modal-title">Edit Stock</h1>
				<div className="modal-date-time">
					<p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
					<p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
				</div>

				<button className="close-modal-btn" onClick={handleClose}>
					<i className="ri-close-line"></i>
				</button>
			</div>

			{/* Edit Stock Form */}
			<div className="modal-content edit">
				<form className="edit-form">
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

					<div className="form-row">
						{/* Quantity / Current Stock */}
						<div className="form-group">
							<label>Quantity</label>
							<input disabled
								type="number"
								min="0"
								value={formData.currentStock}
								onChange={(e) => handleChange("currentStock", Number(e.target.value))}
							/>
						</div>

						{/* Unit Measure */}
						<div className="form-group">
							<label>Unit Measure</label>
							<input disabled
								type="text"
								value={formData.unitMeasure}
								onChange={(e) => handleChange("unitMeasure", Number(e.target.value))}
							/>
						</div>

						{/* Reorder Level */}
						<div className="form-group">
							<label className="required">Reorder Level</label>
							<input
								className={formErrors?.reorderLevel ? "invalid-input" : ""}
								type="number"
								step="0.1"
								min="0"
								value={formData.reorderLevel || ""}
								onChange={(e) => handleChange("reorderLevel", Number(e.target.value))}
								placeholder="Enter reorder level here..."
							/>
							<p className="edit-error-message">{formErrors?.reorderLevel}</p>
						</div>
					</div>

					<div className="form-row">
						{/* Category */}
						<div className="form-group category">
							<label>Category</label>
							<input disabled
								className={formErrors?.category ? "invalid-input" : ""}
								type="text"
								value={formData.category}
								onChange={(e) => handleChange("category", e.target.value)}
							/>
							<p className="edit-error-message"></p>
						</div>

						{/* Status */}
						<div className="form-group">
							<label>Status</label>
							<input disabled
								className={formErrors?.status ? "invalid-input" : ""}
								type="text"
								value={formatStatus(formData.status)}
								onChange={(e) => handleChange("status", e.target.value)}
							/>
						</div>
					</div>

				</form>
			</div>

			<div className="modal-actions">
				<button type="submit" className="submit-btn" onClick={handleSubmit} disabled={!isFormDirty}>
					<i className="ri-save-3-line" /> Update
				</button>
			</div>

		</>
	);
}