import React, { useState, useEffect } from "react";
import { fetchAvailableBuses, createDisposal, Bus } from "@/app/lib/fetchDisposals";

import {
    showBusDisposalSaveConfirmation, showBusDisposalSavedSuccess,
    showCloseWithoutSavingConfirmation, showBusDisposalSaveError
} from "@/utils/sweetAlert";

import "@/styles/forms.css";
import "@/styles/modal.css";

// Export the interface so it can be imported by other components
export interface BusDisposalForm {
    // Selected bus ID
    bus_id: string;
    
    // Disposal details
    disposal_date: string;
    disposal_method: string;
    reason: string;
    remarks?: string;
}

interface FormError {
    [key: string]: string;
}

interface AddBusDisposalModalProps {
    onSave: (busDisposalForm: BusDisposalForm) => void;
    onClose: () => void;
}

export default function AddBusDisposalModal({ onSave, onClose }: AddBusDisposalModalProps) {
    const [busDisposalForm, setBusDisposalForm] = useState<BusDisposalForm>({
        bus_id: "",
        disposal_date: "",
        disposal_method: "",
        reason: "",
        remarks: "",
    });

    const [availableBuses, setAvailableBuses] = useState<Bus[]>([]);
    const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
    const [isLoadingBuses, setIsLoadingBuses] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);

    // Load available buses on component mount
    useEffect(() => {
        const loadBuses = async () => {
            try {
                setIsLoadingBuses(true);
                const buses = await fetchAvailableBuses();
                setAvailableBuses(buses);
            } catch (error) {
                console.error('Error loading buses:', error);
            } finally {
                setIsLoadingBuses(false);
            }
        };

        loadBuses();
    }, []);

    useEffect(() => {
        setIsDirty(true);
    }, [busDisposalForm]);

    // Function to handle changes in the form fields
    const handleChange = (field: string, value: any) => {
        setBusDisposalForm((prev) => ({ ...prev, [field]: value }));

        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }

        // When bus is selected, update selectedBus
        if (field === 'bus_id') {
            const bus = availableBuses.find(b => b.bus_id === value);
            setSelectedBus(bus || null);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!busDisposalForm.bus_id) {
            errors.bus_id = "Bus selection is required";
        }

        if (!busDisposalForm.disposal_date) {
            errors.disposal_date = "Disposal date is required";
        }
        if (!busDisposalForm.disposal_method) {
            errors.disposal_method = "Disposal method is required";
        }
        if (!busDisposalForm.reason) {
            errors.reason = "Disposal reason is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showBusDisposalSaveConfirmation();
        if (!result.isConfirmed) return;

        setIsSubmitting(true);

        try {
            // Create disposal request
            const disposalData = {
                type: 'bus' as const,
                bus_id: busDisposalForm.bus_id,
                disposal_date: busDisposalForm.disposal_date,
                disposal_method: busDisposalForm.disposal_method,
                reason: busDisposalForm.reason,
                remarks: busDisposalForm.remarks,
                created_by: 'USR-00001' // TODO: Replace with actual user ID
            };

            const result = await createDisposal(disposalData);

            if (result.success) {
                await showBusDisposalSavedSuccess();
                onSave(busDisposalForm);
            } else {
                // Show error message from API response
                await showBusDisposalSaveError(result.error);
            }
        } catch (error) {
            console.error('Error creating disposal:', error);
            
            // Get error message from API response or use default
            let errorMessage = 'Failed to create disposal. Please try again.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            await showBusDisposalSaveError(errorMessage);
        } finally {
            setIsSubmitting(false);
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
                <h1 className="modal-title">Add Bus Disposal</h1>
                <div className="modal-date-time">
                    <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                </div>

                <button className="close-modal-btn" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>

            <div className="modal-content add">
                <form className="add-form">
                    <div className="form-row">
                        {/* Bus Selection */}
                        <div className="form-group">
                            <label>Select Bus</label>
                            <select
                                className={formErrors?.bus_id ? "invalid-input" : ""}
                                value={busDisposalForm.bus_id}
                                onChange={(e) => handleChange("bus_id", e.target.value)}
                                disabled={isLoadingBuses}
                            >
                                <option value="" disabled>
                                    {isLoadingBuses ? "Loading buses..." : "--Select Bus Here--"}
                                </option>
                                {availableBuses.map(bus => (
                                    <option key={bus.bus_id} value={bus.bus_id}>
                                        {bus.body_number} - {bus.plate_number}
                                    </option>
                                ))}
                            </select>
                            <p className="add-error-message">{formErrors?.bus_id}</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* For view bus details */}
            <p className="details-title">I. Bus Details</p>
            <div className="modal-content add">
                <form className="add-form">
                    {/* Plate number, body builder, and bus type */}
                    <div className="form-row">
                        {/* Plate Number */}
                        <div className="form-group">
                            <label>Plate Number</label>
                            <input
                                type="text"
                                value={selectedBus?.plate_number || ""}
                                placeholder="Plate number here"
                                disabled
                            />
                        </div>

                        {/* Body Builder */}
                        <div className="form-group">
                            <label>Body Builder</label>
                            <input
                                type="text"
                                value={selectedBus?.body_builder || ""}
                                placeholder="Body builder here"
                                disabled
                            />
                        </div>

                        {/* Bus Type */}
                        <div className="form-group">
                            <label>Bus Type</label>
                            <input
                                type="text"
                                value={selectedBus?.bus_type || ""}
                                placeholder="Bus type here"
                                disabled
                            />
                        </div>
                    </div>

                    {/* Manufacturer, model, and year model */}
                    <div className="form-row">
                        {/* Manufacturer */}
                        <div className="form-group">
                            <label>Manufacturer</label>
                            <input
                                type="text"
                                value={selectedBus?.manufacturer || ""}
                                placeholder="Manufacturer here"
                                disabled
                            />
                        </div>

                        {/* Model */}
                        <div className="form-group">
                            <label>Model</label>
                            <input
                                type="text"
                                value={selectedBus?.model || ""}
                                placeholder="Model here"
                                disabled
                            />
                        </div>

                        {/* Year Model */}
                        <div className="form-group">
                            <label>Year Model</label>
                            <input
                                type="number"
                                value={selectedBus?.year_model || ""}
                                placeholder="Year model here"
                                disabled
                            />
                        </div>
                    </div>

                    {/* Seat capacity, chasis number, and engine number */}
                    <div className="form-row">
                        {/* Seat Capacity */}
                        <div className="form-group">
                            <label>Seat Capacity</label>
                            <input
                                type="number"
                                value={selectedBus?.seat_capacity || ""}
                                placeholder="Seat capacity here"
                                disabled
                            />
                        </div>

                        {/* Chassis Number */}
                        <div className="form-group">
                            <label>Chassis Number</label>
                            <input
                                type="text"
                                value={selectedBus?.chasis_number || ""}
                                placeholder="Chassis number here"
                                disabled
                            />
                        </div>

                        {/* Engine Number */}
                        <div className="form-group">
                            <label>Engine Number</label>
                            <input
                                type="text"
                                value={selectedBus?.engine_number || ""}
                                placeholder="Engine number here"
                                disabled
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* For Disposal details */}
            <p className="details-title">II. Disposal Details</p>
            <div className="modal-content add">
                <form className="add-form">
                    {/* Disposal date and method */}
                    <div className="form-row">
                        {/* Disposal Date */}
                        <div className="form-group">
                            <label>Disposal Date</label>
                            <input
                                className={formErrors?.disposal_date ? "invalid-input" : ""}
                                type="date"
                                value={busDisposalForm.disposal_date}
                                onChange={(e) => handleChange("disposal_date", e.target.value)}
                            />
                            <p className="add-error-message">{formErrors?.disposal_date}</p>
                        </div>

                        {/* Disposal Method */}
                        <div className="form-group">
                            <label>Disposal Method</label>
                            <select
                                value={busDisposalForm.disposal_method}
                                onChange={(e) => handleChange("disposal_method", e.target.value)}
                                className={formErrors?.disposal_method ? "invalid-input" : ""}
                            >
                                <option value="" disabled>--Select Disposal Method--</option>
                                <option value="sold">Sold</option>
                                <option value="scrapped">Scrapped</option>
                                <option value="donated">Donated</option>
                                <option value="transferred">Transferred</option>
                            </select>
                            <p className="add-error-message">{formErrors?.disposal_method}</p>
                        </div>
                    </div>

                    {/* Reason for Disposal */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Reason for Disposal</label>
                            <input
                                className={formErrors?.reason ? "invalid-input" : ""}
                                type="text"
                                value={busDisposalForm.reason}
                                onChange={(e) => handleChange("reason", e.target.value)}
                                placeholder="Enter disposal reason here..."
                            />
                            <p className="add-error-message">{formErrors?.reason}</p>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Remarks</label>
                            <input
                                type="text"
                                value={busDisposalForm.remarks || ""}
                                onChange={(e) => handleChange("remarks", e.target.value)}
                                placeholder="Enter remarks here..."
                            />
                        </div>
                    </div>

                </form >
            </div >

            <div className="modal-actions">
                <button 
                    type="submit" 
                    className="submit-btn" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    <i className="ri-save-3-line" /> 
                    {isSubmitting ? "Saving..." : "Save"}
                </button>
            </div>

        </>
    );
}