"use client";

import React, { useState, useEffect } from "react";
import {
  showBusUpdateConfirmation,
  showBusUpdatedSuccess,
  showCloseWithoutUpdatingConfirmation,
} from "@/utils/sweetAlert";

import "@/styles/forms.css";

// Props interface for the modal
interface EditBusModalProps {
  item: {
    bus_id: string;
    plate_number: string;
    body_number: string;
    body_builder: string;
    bus_type: string;
    status: string;
    manufacturer: string;
    chasis_number: string;
    engine_number: string;
    seat_capacity: number;
  };
  onSave: (updatedBus: any) => void;
  onClose: () => void;
}

export default function EditBusModal({ item, onSave, onClose }: EditBusModalProps) {
  // Helper functions to convert between display and DB format
  const formatDisplay = (value: string, map: Record<string, string>) =>
    map[value] || value.toLowerCase();

  const formatForDB = (value: string, map: Record<string, string>) =>
    map[value] || value.toUpperCase();

  // Mappings for display ↔ DB
  const bodyBuilderMap = {
    AGILA: "agila",
    HILLTOP: "hilltop",
    RBM: "rbm",
    DARJ: "darj",
  };

  const busTypeMap = {
    AIRCONDITIONED: "airconditioned",
    ORDINARY: "ordinary",
  };

  const statusMap = {
    ACTIVE: "active",
    DECOMMISSIONED: "decommissioned",
    UNDER_MAINTENANCE: "under-maintenance",
  };

  // State for form data
  const [formData, setFormData] = useState({
    bus_id: item.bus_id,
    plate_number: item.plate_number,
    body_number: item.body_number,
    body_builder: formatDisplay(item.body_builder, bodyBuilderMap),
    bus_type: formatDisplay(item.bus_type, busTypeMap),
    status: formatDisplay(item.status, statusMap),
    manufacturer: item.manufacturer.charAt(0).toUpperCase() + item.manufacturer.slice(1),
    chasis_number: item.chasis_number,
    engine_number: item.engine_number,
    seat_capacity: item.seat_capacity,
  });

  // Store original data to check for unsaved changes
  const [originalData] = useState({ ...formData });
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Track changes to form to detect unsaved edits
  useEffect(() => {
    setIsFormDirty(JSON.stringify(originalData) !== JSON.stringify(formData));
  }, [formData, originalData]);

  // Handle input field changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.bus_type) errors.bus_type = "Bus type is required";
    if (!formData.status) errors.status = "Status is required";
    if (formData.seat_capacity <= 0) {
      errors.seatCapacity = "Seat capacity must be more than 0";
    } else if (
      !/^\d{2}$/.test(formData.seat_capacity.toString())
    ) {
      errors.seatCapacity = "Seat capacity must be exactly 2 digits";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Invert mapping objects to get DB values from display values
  const invertMap = (obj: Record<string, string>): Record<string, string> =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await showBusUpdateConfirmation(formData.body_number);
    if (!result.isConfirmed) return;

    try {
      // Convert data to DB-friendly format
      const updateData = {
        bus_id: formData.bus_id,
        bus_type: formatForDB(formData.bus_type, invertMap(busTypeMap)),
        seat_capacity: formData.seat_capacity,
        status: formatForDB(formData.status, invertMap(statusMap)),
      };


      // Corrected endpoint: include bus_id in the URL!
      const response = await fetch(`/api/bus`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();

      // Handle response
      if (response.ok && responseData.success) {
        onSave(responseData.bus); // update parent UI
        await showBusUpdatedSuccess(); // show success dialog
        onClose(); // close modal
        window.location.reload(); // refresh to reflect changes
      } else {
        alert(`Update failed: ${responseData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Error updating bus:", error);
      alert("Failed to update bus. Please try again.");
    }
  };

  // Prompt user if closing modal with unsaved changes
  const handleClose = async () => {
    if (!isFormDirty) return onClose();
    const result = await showCloseWithoutUpdatingConfirmation();
    if (result.isConfirmed) onClose();
  };

  return (
    <>
      {/* Modal Header */}
      <div className="modal-heading">
        <h1 className="modal-title">Edit Bus</h1>
        <div className="modal-date-time">
          <p>{new Date().toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric"
          })}</p>
          <p>{new Date().toLocaleTimeString("en-US", {
            hour: "numeric", minute: "2-digit", hour12: true
          })}</p>
        </div>
        <button className="close-modal-btn" onClick={handleClose}>
          <i className="ri-close-line"></i>
        </button>
      </div>

      {/* Modal Content */}
      <div className="modal-content edit">
        <form className="edit-bus-form" id="edit-bus-form" onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="form-row">
            <div className="form-group">
              <label>Plate Number</label>
              <input type="text" value={formData.plate_number} disabled />
            </div>
            <div className="form-group">
              <label>Body Number</label>
              <input type="text" value={formData.body_number} disabled />
            </div>
          </div>

          {/* Row 2 */}
          <div className="form-row">
            <div className="form-group">
              <label>Body Builder</label>
              <select value={formData.body_builder} disabled>
                <option value="">Select body builder...</option>
                <option value="agila">Agila</option>
                <option value="hilltop">Hilltop</option>
                <option value="rbm">RBM</option>
                <option value="darj">DARJ</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bus Type</label>
              <select
                className={formErrors.bus_type ? "invalid-input" : ""}
                value={formData.bus_type}
                onChange={(e) => handleChange("bus_type", e.target.value)}
              >
                <option value="">Select bus type...</option>
                <option value="airconditioned">Airconditioned</option>
                <option value="ordinary">Ordinary</option>
              </select>
              <p className="edit-error-message">{formErrors.bus_type}</p>
            </div>
          </div>

          {/* Row 3 */}
          <div className="form-row">
            <div className="form-group">
              <label>Manufacturer</label>
              <input type="text" value={formData.manufacturer} disabled />
            </div>
            <div className="form-group">
              <label>Seat Capacity</label>
              <input
                type="number"
                className={formErrors.seat_capacity ? "invalid-input" : ""}
                min={1}
                value={formData.seat_capacity}
                onChange={(e) => handleChange("seat_capacity", Number(e.target.value))}
              />
              <p className="edit-error-message">{formErrors.seat_capacity}</p>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                className={formErrors.status ? "invalid-input" : ""}
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="">Select status...</option>
                <option value="active">Active</option>
                <option value="decommissioned">Decommissioned</option>
                <option value="under-maintenance">Under Maintenance</option>
              </select>
              <p className="edit-error-message">{formErrors.status}</p>
            </div>
          </div>

          {/* Row 4 */}
          <div className="form-row">
            <div className="form-group">
              <label>Chassis Number</label>
              <input
                type="text"
                value={formData.chasis_number}
                onChange={(e) => handleChange("chasis_number", e.target.value)}
              />

            </div>
            <div className="form-group">
              <label>Engine Number</label>
              <input
                type="text"
                value={formData.engine_number}
                onChange={(e) => handleChange("engine_number", e.target.value)}
              />

            </div>
          </div>
        </form>
      </div>

      {/* Modal Footer */}
      <div className="modal-actions">
        <button type="submit" className="submit-btn" form="edit-bus-form">
          <i className="ri-save-3-line" /> Update
        </button>
      </div>
    </>
  );
}





