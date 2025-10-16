import { useState } from "react";
import "@/styles/forms.css";
import ActionButtons from "@/components/actionButtons";

interface ViewSupplierModalProps {
    item: {
        id: number;
        supplierId?: string;
        supplierName: string;
        contactPerson?: string;
        phone?: string;
        email?: string;
        street?: string;
        barangay?: string;
        city?: string;
        province?: string;
        status: string;
        remarks?: string;
        linkedItems?: Array<{
            id: number;
            itemId?: string;
            itemName?: string;
            itemCategory?: string;
            category?: string;
            canonicalUnit?: string;
            supplierUnitName?: string;
            unitMeasure?: string;
            supplierUnitMeasureId?: number;
            conversionFactor?: number;
            unitPrice: number;
            averageDeliveryTime?: string;
            notes?: string;
            isPreferred?: boolean;
        }>;
    };
    formatStatus: (status: string) => string;
    onClose: () => void;
}

export default function ViewSupplierModal({ item, formatStatus, onClose }: ViewSupplierModalProps) {
    // State to manage linked items with star preferences
    const [linkedItems, setLinkedItems] = useState<any[]>(() => {
        return (item.linkedItems || []).map((li: any) => ({
            ...li,
            isPreferred: li.isPreferred ?? false
        }));
    });

    // Handle toggle preferred status
    const handleTogglePreferred = async (supplierItemId: number) => {
        try {
            const response = await fetch('/api/supplier/toggle-preferred', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ supplierItemId })
            });

            if (!response.ok) throw new Error('Failed to toggle preferred status');

            const { isPreferred } = await response.json();

            // Update local state
            setLinkedItems(prev => prev.map(linkedItem =>
                linkedItem.id === supplierItemId
                    ? { ...linkedItem, isPreferred }
                    : linkedItem
            ));
        } catch (error) {
            console.error('Error toggling preferred status:', error);
            alert('Failed to update preferred status');
        }
    };
    return (
        <>
            <button className="close-modal-btn view" onClick={onClose}>
                <i className="ri-close-line"></i>
            </button>

            <div className="modal-heading">
                <h1 className="modal-title">View Supplier</h1>
            </div>

            <div className="modal-content view">
                <div className="view-form">
                    <div className="form-group">
                        <label>Supplier Name</label>
                        <p>{item.supplierName}</p>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Contact Person</label>
                            <p>{item.contactPerson || 'N/A'}</p>
                        </div>

                        <div className="form-group">
                            <label>Contact Number</label>
                            <p>{item.phone || 'N/A'}</p>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <p>{item.email || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Street</label>
                            <p>{item.street || 'N/A'}</p>
                        </div>

                        <div className="form-group">
                            <label>Barangay</label>
                            <p>{item.barangay || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <p>{item.city || 'N/A'}</p>
                        </div>

                        <div className="form-group">
                            <label>Province</label>
                            <p>{item.province || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Status</label>
                            <p>{formatStatus(item.status)}</p>
                        </div>
                    </div>

                    {item.remarks && (
                        <div className="form-group">
                            <label>Remarks</label>
                            <p>{item.remarks}</p>
                        </div>
                    )}
                </div>
            </div >

            <p className="details-title">Linked Item/s ({linkedItems.length || 0})</p>
            {linkedItems && linkedItems.length > 0 ? (
                <table className="modal-table">
                    <thead className="modal-table-heading">
                        <tr>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Supplier Unit</th>
                            <th>Conversion</th>
                            <th>Unit Price</th>
                            <th>Delivery Time</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="modal-table-body">
                        {linkedItems.map((linkedItem: any, index) => (
                            <tr key={linkedItem.id || index}>
                                <td>{linkedItem.itemName || 'N/A'}</td>
                                <td>{linkedItem.itemCategory || linkedItem.category || 'N/A'}</td>
                                <td>{linkedItem.supplierUnitName || linkedItem.unitMeasure || 'N/A'}</td>
                                <td>{linkedItem.conversionFactor || '—'}</td>
                                <td>₱{linkedItem.unitPrice?.toFixed(2) || '0.00'}</td>
                                <td>{linkedItem.averageDeliveryTime || 'N/A'}</td>
                                <td>{linkedItem.notes || '—'}</td>
                                <td>
                                    <ActionButtons
                                        onToggleStar={() => handleTogglePreferred(linkedItem.id)}
                                        isStarred={linkedItem.isPreferred}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No linked items found</p>
            )}

        </>
    );
}