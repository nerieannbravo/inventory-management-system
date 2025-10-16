import React, { useState, useEffect, useRef } from "react";

import {
    showItemSaveConfirmation, showItemSavedSuccess,
    showCloseWithoutSavingConfirmation
} from "@/utils/sweetAlert";
import { getItems } from "@/app/lib/api";

import "@/styles/forms.css";

export interface LinkedItemForm {
    itemId: string; // InventoryItem.itemId (string ID like ITEM-001)
    itemName: string;
    itemCategory: string;
    canonicalUnit: string; // Item's canonical unit (read-only)
    canonicalUnitId: number; // Item's canonical unit measure ID
    supplierUnitMeasureId: number; // Supplier's unit for this item
    supplierUnitName: string; // Supplier's unit name (display only)
    conversionFactor: number; // Multiplier: supplier unit -> canonical unit
    unitPrice: number; // Price per supplier unit
    averageDeliveryTime?: string | null;
    notes?: string | null;
}

interface FormError {
    [key: string]: string;
}

interface AddLinkedItemModalProps {
    supplierId?: number; // Current supplier ID for filtering (0 or undefined when adding new supplier)
    currentlyLinkedItemIds?: string[]; // Array of itemIds already linked (excluding soft-deleted)
    onClose: () => void;
    onSave: (linkedItemForm: LinkedItemForm) => void;
}

export default function AddLinkedItemModal({ supplierId, currentlyLinkedItemIds, onClose, onSave }: AddLinkedItemModalProps) {
    const [linkedItemForm, setLinkedItemForm] = useState<LinkedItemForm>({
        itemId: "",
        itemName: "",
        itemCategory: "",
        canonicalUnit: "",
        canonicalUnitId: 0,
        supplierUnitMeasureId: 0,
        supplierUnitName: "",
        conversionFactor: 1,
        unitPrice: 0,
        averageDeliveryTime: null,
        notes: null
    });

    const [formErrors, setFormErrors] = useState<FormError>({});
    const [isDirty, setIsDirty] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [availableItems, setAvailableItems] = useState<any[]>([]); // Items available for linking
    const [unitMeasures, setUnitMeasures] = useState<any[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [loadingUnits, setLoadingUnits] = useState(true);
    
    // State for searchable dropdown
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch items from API and filter available ones
    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoadingItems(true);
                const data = await getItems();
                if (data.success) {
                    setItems(data.items || []);
                }
            } catch (err) {
                console.error('Error fetching items:', err);
            } finally {
                setLoadingItems(false);
            }
        };
        fetchItems();
    }, []);

    // Filter items to show only those not currently linked (excluding soft-deleted) and only ACTIVE items
    useEffect(() => {
        // Handle case when currentlyLinkedItemIds is undefined or empty
        const linkedIds = currentlyLinkedItemIds || [];
        
        const filtered = items.filter(item => 
            !linkedIds.includes(item.itemId) && item.itemStatus === 'ACTIVE'
        );
        setAvailableItems(filtered);
    }, [items, currentlyLinkedItemIds]);

    // Fetch unit measures from API
    useEffect(() => {
        const fetchUnitMeasures = async () => {
            try {
                setLoadingUnits(true);
                const response = await fetch('/api/unit-measure');
                const data = await response.json();
                if (data.success) {
                    setUnitMeasures(data.unitMeasures || []);
                }
            } catch (err) {
                console.error('Error fetching unit measures:', err);
            } finally {
                setLoadingUnits(false);
            }
        };
        fetchUnitMeasures();
    }, []);

    // Track if form has been modified
    useEffect(() => {
        setIsDirty(true);
    }, [linkedItemForm]);

    // Filter available items based on search term
    useEffect(() => {
        let result = [];
        if (searchTerm.trim() === "") {
            result = [...availableItems];
        } else {
            result = availableItems.filter(item =>
                item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Sort results in ascending order by item name
        result.sort((a, b) => {
            const nameA = a.itemName.toLowerCase();
            const nameB = b.itemName.toLowerCase();
            return nameA.localeCompare(nameB);
        });
        
        setFilteredItems(result);
    }, [searchTerm, availableItems]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setShowDropdown(true);
        
        // Clear form fields when user starts typing
        if (linkedItemForm.itemName !== "") {
            setLinkedItemForm(prev => ({
                ...prev,
                itemId: "",
                itemName: "",
                itemCategory: "",
                canonicalUnit: "",
                canonicalUnitId: 0,
                supplierUnitMeasureId: 0,
                supplierUnitName: "",
                conversionFactor: 1
            }));
        }
    };

    const handleItemSelect = (item: any) => {
        // Extract unit measure information properly
        const unitMeasureName = item.unitMeasure?.abbreviation || item.unitMeasure?.unitName || "";
        const unitMeasureId = item.unitMeasure?.id || item.unitMeasureId || 0;
        
        // Extract category information properly
        const categoryName = item.category?.categoryName || "";
        
        setLinkedItemForm(prev => ({
            ...prev,
            itemId: item.itemId,
            itemName: item.itemName,
            itemCategory: categoryName,
            canonicalUnit: unitMeasureName,
            canonicalUnitId: unitMeasureId,
            // Default supplier unit to canonical unit
            supplierUnitMeasureId: unitMeasureId,
            supplierUnitName: unitMeasureName,
            conversionFactor: 1
        }));
        
        setSearchTerm(item.itemName);
        setShowDropdown(false);
        
        // Clear error if exists
        if (formErrors.itemName) {
            const newErrors = { ...formErrors };
            delete newErrors.itemName;
            setFormErrors(newErrors);
        }
    };

    const handleChange = (field: string, value: any) => {
        setLinkedItemForm((prev) => ({ ...prev, [field]: value }));

        // When item is selected, populate related fields from API data
        if (field === "itemName") {
            const selected = items.find(i => i.itemName === value);
            if (selected) {
                // Extract unit measure information properly
                const unitMeasureName = selected.unitMeasure?.abbreviation || selected.unitMeasure?.unitName || "";
                const unitMeasureId = selected.unitMeasure?.id || selected.unitMeasureId || 0;
                
                // Extract category information properly
                const categoryName = selected.category?.categoryName || "";
                
                setLinkedItemForm(prev => ({
                    ...prev,
                    itemId: selected.itemId,
                    itemCategory: categoryName,
                    canonicalUnit: unitMeasureName,
                    canonicalUnitId: unitMeasureId,
                    // Default supplier unit to canonical unit
                    supplierUnitMeasureId: unitMeasureId,
                    supplierUnitName: unitMeasureName,
                    conversionFactor: 1
                }));
            }
        }

        // When supplier unit is selected, update the supplier unit name
        if (field === "supplierUnitMeasureId") {
            const selected = unitMeasures.find(u => u.id === parseInt(value));
            if (selected) {
                setLinkedItemForm(prev => ({
                    ...prev,
                    supplierUnitName: selected.abbreviation || selected.unitName || ""
                }));
            }
        }

        // Clear the error for that field
        if (formErrors[field]) {
            const newErrors = { ...formErrors };
            delete newErrors[field];
            setFormErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormError = {};

        if (!linkedItemForm.itemName) errors.itemName = "Item name is required";
        if (!linkedItemForm.itemCategory) errors.itemCategory = "Item category is required";
        if (!linkedItemForm.supplierUnitMeasureId || linkedItemForm.supplierUnitMeasureId === 0) {
            errors.supplierUnitMeasureId = "Supplier unit measure is required";
        }
        if (linkedItemForm.unitPrice <= 0) errors.unitPrice = "Unit price must be greater than zero";
        if (linkedItemForm.conversionFactor <= 0) {
            errors.conversionFactor = "Conversion factor must be greater than zero";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await showItemSaveConfirmation();
        if (result.isConfirmed) {
            onSave(linkedItemForm);
            await showItemSavedSuccess();
            onClose();
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
                <h1 className="modal-title">Add Linked Item</h1>
            </div>

            <div className="modal-content add">
                <form className="add-form">
                    {/* Item Name - Searchable Dropdown */}
                    <div className="form-group" style={{ position: 'relative' }} ref={dropdownRef}>
                        <label>Item Name <span className="required">*</span></label>
                        <input
                            type="text"
                            className={formErrors?.itemName ? "invalid-input" : ""}
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => setShowDropdown(true)}
                            placeholder={loadingItems ? "Loading items..." : "Search item name..."}
                            disabled={loadingItems}
                            autoComplete="off"
                        />
                        <p className="add-error-message">{formErrors?.itemName}</p>
                        
                        {/* Dropdown List */}
                        {showDropdown && !loadingItems && filteredItems.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                maxHeight: '200px',
                                overflowY: 'auto',
                                backgroundColor: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                zIndex: 1000,
                                marginTop: '4px'
                            }}>
                                {filteredItems.map((item, index) => (
                                    <div
                                        key={item.id || `item-${index}`}
                                        onClick={() => handleItemSelect(item)}
                                        style={{
                                            padding: '10px 12px',
                                            cursor: 'pointer',
                                            borderBottom: index < filteredItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        <div style={{ fontWeight: 500 }}>{item.itemName}</div>
                                        <div style={{ fontSize: '0.85em', color: '#666', marginTop: '2px' }}>
                                            {item.category?.categoryName || 'No category'} • {item.unitMeasure?.abbreviation || item.unitMeasure?.unitName || 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* No results message */}
                        {showDropdown && !loadingItems && searchTerm && filteredItems.length === 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '12px',
                                color: '#666',
                                textAlign: 'center',
                                zIndex: 1000,
                                marginTop: '4px'
                            }}>
                                No items found matching "{searchTerm}"
                            </div>
                        )}
                    </div>

                    <div className="form-row">
                        {/* Item Category (Read-only) */}
                        <div className="form-group">
                            <label>Item Category</label>
                            <input
                                type="text"
                                value={linkedItemForm.itemCategory}
                                placeholder="Category"
                                disabled
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                        </div>

                        {/* Canonical Unit (Read-only) */}
                        <div className="form-group">
                            <label>Item's Canonical Unit</label>
                            <input
                                type="text"
                                value={linkedItemForm.canonicalUnit}
                                placeholder="Canonical unit measure"
                                disabled
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                            <p className="field-hint">This is the standard unit for this item in inventory</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Supplier Unit Measure */}
                        <div className="form-group">
                            <label>Supplier's Unit Measure <span className="required">*</span></label>
                            <select
                                className={formErrors?.supplierUnitMeasureId ? "invalid-input" : ""}
                                value={linkedItemForm.supplierUnitMeasureId || ""}
                                onChange={(e) => handleChange("supplierUnitMeasureId", e.target.value)}
                                disabled={loadingUnits || !linkedItemForm.itemName}
                            >
                                <option value="" disabled>
                                    {loadingUnits ? "Loading units..." : "Select supplier unit..."}
                                </option>
                                {unitMeasures.map((unit, index) => (
                                    <option key={unit.id || `unit-${index}`} value={unit.id}>
                                        {unit.abbreviation} - {unit.unitName}
                                    </option>
                                ))}
                            </select>
                            <p className="add-error-message">{formErrors?.supplierUnitMeasureId}</p>
                            <p className="field-hint">Unit that supplier uses for this item</p>
                        </div>

                        {/* Conversion Factor */}
                        <div className="form-group">
                            <label>Conversion Factor <span className="required">*</span></label>
                            <input
                                className={formErrors?.conversionFactor ? "invalid-input" : ""}
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={linkedItemForm.conversionFactor || ""}
                                onChange={(e) => handleChange("conversionFactor", parseFloat(e.target.value) || 1)}
                                placeholder="e.g., 1"
                                disabled={!linkedItemForm.itemName}
                            />
                            <p className="add-error-message">{formErrors?.conversionFactor}</p>
                            <p className="field-hint">
                                {linkedItemForm.supplierUnitName && linkedItemForm.canonicalUnit
                                    ? `1 ${linkedItemForm.supplierUnitName} = ${linkedItemForm.conversionFactor} ${linkedItemForm.canonicalUnit}`
                                    : "Multiplier from supplier unit to canonical unit"}
                            </p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Unit Price */}
                        <div className="form-group">
                            <label>Unit Price (per supplier unit) <span className="required">*</span></label>
                            <input
                                className={formErrors?.unitPrice ? "invalid-input" : ""}
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={linkedItemForm.unitPrice || ""}
                                onChange={(e) => handleChange("unitPrice", parseFloat(e.target.value) || 0)}
                                placeholder="Enter unit price..."
                            />
                            <p className="add-error-message">{formErrors?.unitPrice}</p>
                            {linkedItemForm.supplierUnitName && linkedItemForm.unitPrice > 0 && (
                                <p className="field-hint">₱{linkedItemForm.unitPrice.toFixed(2)} per {linkedItemForm.supplierUnitName}</p>
                            )}
                        </div>

                        {/* Average Delivery Time */}
                        <div className="form-group">
                            <label>Average Delivery Time</label>
                            <input
                                type="text"
                                value={linkedItemForm.averageDeliveryTime ?? ""}
                                onChange={(e) => handleChange("averageDeliveryTime", e.target.value)}
                                placeholder="e.g., 3-5 days"
                            />
                            <p className="field-hint">Typical lead time from this supplier</p>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={linkedItemForm.notes ?? ""}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            placeholder="Additional notes about this supplier-item relationship..."
                            rows={3}
                        />
                    </div>
                </form >
            </div >

            <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleClose}>
                    Cancel
                </button>
                <button type="submit" className="submit-btn" onClick={handleSubmit}>
                    <i className="ri-save-3-line" /> Save
                </button>
            </div>
        </>
    );
}
