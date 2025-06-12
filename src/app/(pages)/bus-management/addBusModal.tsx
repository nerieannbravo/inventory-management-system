import React, { useState, useEffect } from "react";

// SweetAlert modals
import {
  showBusSaveConfirmation,
  showBusSavedSuccess,
  showCloseWithoutSavingConfirmation,
} from "@/utils/sweetAlert";

// Form styles
import "@/styles/forms.css";

// Bus form interface
export interface BusForm {
  plateNumber: string;
  bodyNumber: string;
  bodyBuilder: string;
  busType: string;
  busStatus: string; // This is the UI status string, sent directly to API
  manufacturer: string;
  seatCapacity: number;
  chasisNumber: string;
  engineNumber: string;
}

interface FormError {
  [key: string]: string;
}

interface AddBusModalProps {
  onSave: (busForm: BusForm) => void;
  onClose: () => void;
}

export default function AddBusModal({ onSave, onClose }: AddBusModalProps) {
  // State to hold the form input values
  const [busForm, setBusForm] = useState<BusForm>({
    plateNumber: "",
    bodyNumber: "",
    bodyBuilder: "",
    busType: "",
    busStatus: "active", // Default status in UI
    manufacturer: "",
    seatCapacity: 0,
    chasisNumber: "",
    engineNumber: "",
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<FormError>({});
  // Flag to track if form data was modified (dirty)
  const [isDirty, setIsDirty] = useState(false);
  // Flag for async submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mark form dirty when any field changes
  useEffect(() => {
    setIsDirty(true);
  }, [busForm]);

  // Handler to update form fields and clear errors on input change
  const handleChange = (field: string, value: any) => {
    setBusForm((prev) => ({ ...prev, [field]: value }));

    // Remove the error message for this field when user edits it
    if (formErrors[field]) {
      const newErrors = { ...formErrors };
      delete newErrors[field];
      setFormErrors(newErrors);
    }
  };

  // Validate form fields and return whether the form is valid
  const validateForm = (): boolean => {
    const errors: FormError = {};

    // Trimmed value checks
    if (!busForm.plateNumber.trim()) {
      errors.plateNumber = "Plate number is required";
    } else if (busForm.plateNumber.length > 10) {
      errors.plateNumber = "Plate number must not exceed 10 characters";
    }

    if (!busForm.bodyNumber.trim()) {
      errors.bodyNumber = "Body number is required";
    } else if (busForm.bodyNumber.length > 20) {
      errors.bodyNumber = "Body number must not exceed 20 characters";
    }

    if (!busForm.bodyBuilder) {
      errors.bodyBuilder = "Body builder is required";
    }

    if (!busForm.busType) {
      errors.busType = "Bus type is required";
    }

    if (!busForm.manufacturer.trim()) {
      errors.manufacturer = "Manufacturer is required";
    } else if (busForm.manufacturer.length > 15) {
      errors.manufacturer = "Manufacturer must not exceed 15 characters";
    }

    if (busForm.seatCapacity <= 0) {
      errors.seatCapacity = "Seat capacity must be more than 0";
    } else if (
      !/^\d{2}$/.test(busForm.seatCapacity.toString())
    ) {
      errors.seatCapacity = "Seat capacity must be exactly 2 digits";
    }

    if (busForm.chasisNumber.length > 50) {
      errors.chasisNumber = "Chasis number must not exceed 50 characters";
    }

    if (busForm.engineNumber.length > 50) {
      errors.engineNumber = "Engine number must not exceed 50 characters";
    }

    // Ensure unique values among identifiers
    const plateNumber = busForm.plateNumber.trim();
    const bodyNumber = busForm.bodyNumber.trim();
    const chasisNumber = busForm.chasisNumber.trim();
    const engineNumber = busForm.engineNumber.trim();

    if (plateNumber && plateNumber === bodyNumber) {
      const msg = "Plate Number must be unique";
      errors.plateNumber = msg;
      errors.bodyNumber = msg;
    }
    if (plateNumber && plateNumber === chasisNumber) {
      const msg = "Plate number must be unique";
      errors.plateNumber = msg;
      errors.chasisNumber = msg;
    }
    if (plateNumber && plateNumber === engineNumber) {
      const msg = "Plate number must be unique";
      errors.plateNumber = msg;
      errors.engineNumber = msg;
    }
    if (bodyNumber && bodyNumber === chasisNumber) {
      const msg = "Body number must be unique";
      errors.bodyNumber = msg;
      errors.chasisNumber = msg;
    }
    if (bodyNumber && bodyNumber === engineNumber) {
      const msg = "Body number must be unique";
      errors.bodyNumber = msg;
      errors.engineNumber = msg;
    }
    if (chasisNumber && chasisNumber === engineNumber) {
      const msg = "Chasis number must be unique";
      errors.chasisNumber = msg;
      errors.engineNumber = msg;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form to initial empty values and clear errors
  const resetForm = () => {
    setBusForm({
      plateNumber: "",
      bodyNumber: "",
      bodyBuilder: "",
      busType: "",
      busStatus: "active",
      manufacturer: "",
      seatCapacity: 0,
      chasisNumber: "",
      engineNumber: "",
    });
    setFormErrors({});
    setIsDirty(false);
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission or invalid form submission
    if (isSubmitting || !validateForm()) return;

    // Show confirmation dialog before saving
    const confirmation = await showBusSaveConfirmation();
    if (!confirmation.isConfirmed) return;

    setIsSubmitting(true);

    try {
      // Log form data before sending
      console.log("📤 Submitting bus data:", busForm);

      // Prepare the data to send to API - send status as string directly
      const payload = {
        plate_number: busForm.plateNumber.trim(),
        body_number: busForm.bodyNumber.trim(),
        body_builder: busForm.bodyBuilder,
        bus_type: busForm.busType,
        status: busForm.busStatus,
        manufacturer: busForm.manufacturer.trim(),
        seat_capacity: busForm.seatCapacity,
        chasis_number: busForm.chasisNumber.trim(),
        engine_number: busForm.engineNumber.trim(),
      };

      console.log("Payload sent to API:", payload);

      // Send POST request to backend API
      const response = await fetch("/api/bus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("📥 API Response:", result);

      if (response.ok && result.success) {
        // Show success alert modal
        await showBusSavedSuccess();

        // Reset form fields
        resetForm();

        // Notify parent component with saved bus data
        onSave(busForm);
      } else {
        // Handle API error messages
        const errorMessage = result.error || "Failed to save bus data.";
        console.error("❌ API Error:", errorMessage);

        const { showStockSaveError } = await import("@/utils/sweetAlert");
        await showStockSaveError(errorMessage);
      }
    } catch (error: any) {
      // Handle network or unexpected errors
      console.error("❌ Network/Unexpected Error:", error);

      const { showStockSaveError } = await import("@/utils/sweetAlert");
      await showStockSaveError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      // Always reset submitting flag
      setIsSubmitting(false);
    }
  };

  // Handle modal close, warn if form has unsaved changes
  const handleClose = async () => {
    if (!isDirty) {
      onClose();
      return;
    }

    const result = await showCloseWithoutSavingConfirmation();
    if (result.isConfirmed) {
      resetForm();
      onClose();
    }
  };


  return (
    <>
      {/* Modal Header */}
      <div className="modal-heading">
        <h1 className="modal-title">Add Bus</h1>
        <div className="modal-date-time">
          <p>
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p>
            {new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>
        <button
          className="close-modal-btn"
          onClick={handleClose}
          disabled={isSubmitting}
          aria-label="Close modal"
        >
          <i className="ri-close-line"></i>
        </button>
      </div>

      {/* Modal Content with Form */}
      <div className="modal-content add">
        <form className="add-bus-form" onSubmit={handleSubmit} noValidate>
          {/* Row 1: Plate and Body Number */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="plateNumber">Plate Number</label>
              <input
                id="plateNumber"
                className={formErrors?.plateNumber ? "invalid-input" : ""}
                type="text"
                value={busForm.plateNumber}
                onChange={(e) => handleChange("plateNumber", e.target.value)}
                placeholder="Enter plate number here..."
                disabled={isSubmitting}
                autoComplete="off"
              />
              <p className="add-error-message">{formErrors?.plateNumber}</p>
            </div>

            <div className="form-group">
              <label htmlFor="bodyNumber">Body Number</label>
              <input
                id="bodyNumber"
                className={formErrors?.bodyNumber ? "invalid-input" : ""}
                type="text"
                value={busForm.bodyNumber}
                onChange={(e) => handleChange("bodyNumber", e.target.value)}
                placeholder="Enter body number here..."
                disabled={isSubmitting}
                autoComplete="off"
              />
              <p className="add-error-message">{formErrors?.bodyNumber}</p>
            </div>
          </div>

          {/* Row 2: Body Builder and Bus Type */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bodyBuilder">Body Builder</label>
              <select
                id="bodyBuilder"
                className={formErrors?.bodyBuilder ? "invalid-input" : ""}
                value={busForm.bodyBuilder}
                onChange={(e) => handleChange("bodyBuilder", e.target.value)}
                disabled={isSubmitting}
              >
                <option value="" disabled>
                  Select body builder...
                </option>
                <option value="agila">Agila</option>
                <option value="hilltop">Hilltop</option>
                <option value="rbm">RBM</option>
                <option value="darj">DARJ</option>
              </select>
              <p className="add-error-message">{formErrors?.bodyBuilder}</p>
            </div>

            <div className="form-group">
              <label htmlFor="busType">Bus Type</label>
              <select
                id="busType"
                className={formErrors?.busType ? "invalid-input" : ""}
                value={busForm.busType}
                onChange={(e) => handleChange("busType", e.target.value)}
                disabled={isSubmitting}
              >
                <option value="" disabled>
                  Select bus type...
                </option>
                <option value="airconditioned">Airconditioned</option>
                <option value="ordinary">Ordinary</option>
              </select>
              <p className="add-error-message">{formErrors?.busType}</p>
            </div>
          </div>

          {/* Row 3: Manufacturer, Seat Capacity, Status */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="manufacturer">Manufacturer</label>
              <input
                id="manufacturer"
                className={formErrors?.manufacturer ? "invalid-input" : ""}
                type="text"
                value={busForm.manufacturer}
                onChange={(e) => handleChange("manufacturer", e.target.value)}
                placeholder="Enter manufacturer here..."
                disabled={isSubmitting}
                autoComplete="off"
              />
              <p className="add-error-message">{formErrors?.manufacturer}</p>
            </div>

            <div className="form-group">
              <label htmlFor="seatCapacity">Seat Capacity</label>
              <input
                id="seatCapacity"
                className={formErrors?.seatCapacity ? "invalid-input" : ""}
                type="number"
                step={1}
                min={1}
                value={busForm.seatCapacity || ""}
                onChange={(e) =>
                  handleChange("seatCapacity", Number(e.target.value) || 0)
                }
                disabled={isSubmitting}
              />
              <p className="add-error-message">{formErrors?.seatCapacity}</p>
            </div>

            <div className="form-group">
              <label>Status</label>
              {/* Status select is disabled; user cannot change */}
              <select
                disabled
                value={busForm.busStatus}
                className="disabled-select"
                aria-disabled="true"
              >
                <option value="active">Active</option>
                <option value="decommissioned">Decommissioned</option>
                <option value="under-maintenance">Under Maintenance</option>
              </select>
              <p className="add-error-message">{formErrors?.busStatus}</p>
            </div>
          </div>

          {/* Row 4: Chasis Number and Engine Number */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="chasisNumber">Chasis Number</label>
              <input
                id="chasisNumber"
                className={formErrors?.chasisNumber ? "invalid-input" : ""}
                type="text"
                value={busForm.chasisNumber}
                onChange={(e) => handleChange("chasisNumber", e.target.value)}
                placeholder="Enter chasis number here..."
                disabled={isSubmitting}
                autoComplete="off"
              />
              <p className="add-error-message">{formErrors?.chasisNumber}</p>
            </div>

            <div className="form-group">
              <label htmlFor="engineNumber">Engine Number</label>
              <input
                id="engineNumber"
                className={formErrors?.engineNumber ? "invalid-input" : ""}
                type="text"
                value={busForm.engineNumber}
                onChange={(e) => handleChange("engineNumber", e.target.value)}
                placeholder="Enter engine number here..."
                disabled={isSubmitting}
                autoComplete="off"
              />
              <p className="add-error-message">{formErrors?.engineNumber}</p>
            </div>
          </div>
        </form>
      </div>

      {/* Modal Form Actions */}
      <div className="modal-actions add">
        <button
          type="submit"
          className={`submit-btn ${isSubmitting ? "submitting" : ""}`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <i className="ri-loader-4-line rotating" /> Saving...
            </>
          ) : (
            <>
              <i className="ri-save-3-line" /> Save
            </>
          )}
        </button>
      </div>
    </>
  );
}