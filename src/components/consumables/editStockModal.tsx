import React, { useState } from "react";

interface EditStockModalProps {
  item: {
    id: number;
    name: string;
    stock: number;
    unit: string;
    status: string;
    reorder: number;
    // Additional fields would be included in a real application
  };
  onSave: (updatedItem: any) => void;
}

export default function EditStockModal({ item, onSave }: EditStockModalProps) {
  const [formData, setFormData] = useState({
    id: item.id,
    name: item.name,
    stock: item.stock,
    unit: item.unit,
    price: 0, // Default value, would be populated from item in a real app
    reorder: item.reorder,
    status: item.status,
    expiration: "" // Default value, would be populated from item in a real app
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <div className="modal-heading">
        <h1 className="modal-title">Edit Consumable Stock</h1>
        <div className="modal-date-time">
          <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          <p>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
        </div>
      </div>

      <div className="modal-content edit">
        <form className="edit-stock-form" id="edit-stock-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Item Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                value={formData.stock}
                onChange={(e) => handleChange("stock", Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Unit Measure</label>
              <select 
                value={formData.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
              >
                <option value="" disabled>Select...</option>
                <option value="pcs">pcs (pieces)</option>
                <option value="kg">kg (kilograms)</option>
                <option value="l">L (liters)</option>
                <option value="m">m (meters)</option>
                <option value="box">box/es</option>
                <option value="pack">pack/s</option>
                <option value="roll">roll/s</option>
              </select>
            </div>

            <div className="form-group">
              <label>Unit Price</label>
              <input 
                type="number" 
                step="0.01" 
                value={formData.price}
                onChange={(e) => handleChange("price", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Reorder Level</label>
              <input 
                type="number" 
                value={formData.reorder}
                onChange={(e) => handleChange("reorder", Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="available">Available</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Expiration Date</label>
            <input 
              type="date"
              value={formData.expiration}
              onChange={(e) => handleChange("expiration", e.target.value)}
            />
          </div>
        </form>
      </div>

      <div className="modal-actions">
        <button type="submit" className="submit-btn" form="edit-stock-form">
          Update
        </button>
      </div>
    </>
  );
}