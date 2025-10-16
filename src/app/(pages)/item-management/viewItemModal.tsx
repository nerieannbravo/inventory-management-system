import { useState, useEffect } from "react";
import "@/styles/forms.css";
import ActionButtons from "@/components/actionButtons";

interface ViewItemModalProps {
    item: {
        id: number;
        itemId: string;
        itemName: string;
        unitMeasure?: {
            id: number;
            abbreviation?: string;
            unitName?: string;
        };
        category?: {
            categoryId: string;
            categoryName: string;
        };
        status: string;  // This will be itemStatus (ACTIVE/INACTIVE)
        stockStatus?: string;  // For display of stock level status
        description?: string;
        supplierItems?: any[];
    };
    formatStatus: (status: string) => string;
    onClose: () => void;
}

export default function ViewItemModal({ item, formatStatus, onClose }: ViewItemModalProps) {
    // State to manage linked suppliers with star preferences
    const [linkedSuppliers, setLinkedSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch fresh item data when modal opens
    useEffect(() => {
        const fetchFreshItemData = async () => {
            try {
                setLoading(true);
                // Fetch fresh data from API
                const response = await fetch('/api/item');
                const data = await response.json();
                
                // Find the current item in the fresh data
                const freshItem = data.items?.find((i: any) => i.itemId === item.itemId);
                
                if (freshItem && freshItem.supplierItems) {
                    console.log('ViewItemModal - Fresh supplierItems:', freshItem.supplierItems);
                    const suppliers = freshItem.supplierItems.map((si: any) => {
                        console.log(`Supplier ${si.id}: isPreferred =`, si.isPreferred);
                        return {
                            ...si,
                            isPreferred: si.isPreferred ?? false
                        };
                    });
                    setLinkedSuppliers(suppliers);
                } else {
                    // Fallback to prop data if fetch fails
                    console.log('ViewItemModal - Using prop data (fallback)');
                    const suppliers = (item.supplierItems || []).map((si: any) => ({
                        ...si,
                        isPreferred: si.isPreferred ?? false
                    }));
                    setLinkedSuppliers(suppliers);
                }
            } catch (error) {
                console.error('Error fetching fresh item data:', error);
                // Fallback to prop data on error
                const suppliers = (item.supplierItems || []).map((si: any) => ({
                    ...si,
                    isPreferred: si.isPreferred ?? false
                }));
                setLinkedSuppliers(suppliers);
            } finally {
                setLoading(false);
            }
        };

        fetchFreshItemData();
    }, [item.itemId]);

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
            setLinkedSuppliers(prev => prev.map(supplier =>
                supplier.id === supplierItemId
                    ? { ...supplier, isPreferred }
                    : supplier
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
                <h1 className="modal-title">View Item</h1>
            </div>

            <div className="modal-content view">
                <div className="view-form">
                    <div className="form-group">
                        <label>Item Name</label>
                        <p>{item.itemName}</p>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Canonical Unit</label>
                            <p>{item.unitMeasure?.abbreviation || item.unitMeasure?.unitName || 'N/A'}</p>
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <p>{item.category?.categoryName || 'N/A'}</p>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <p>{formatStatus(item.status)}</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <p>{item.description || 'No description provided'}</p>
                    </div>
                </div>
            </div >

            <p className="details-title">Linked Supplier/s</p>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="loading-spinner"></div>
                    <p>Loading suppliers...</p>
                </div>
            ) : (
                <table className="modal-table">
                    <thead className="modal-table-heading">
                        <tr>
                            <th>Supplier Name</th>
                            <th>Supplier Unit</th>
                            <th>Conversion</th>
                            <th>Unit Price</th>
                            <th>Delivery Time</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody className="modal-table-body">
                        {linkedSuppliers && linkedSuppliers.length > 0 ? (
                            linkedSuppliers.map((supplierItem: any) => (
                                <tr key={supplierItem.id}>
                                    <td>{supplierItem.supplier?.supplierName || 'N/A'}</td>
                                    <td>{supplierItem.supplierUnitMeasure?.abbreviation || supplierItem.supplierUnitName || 'N/A'}</td>
                                    <td>
                                        {supplierItem.conversionFactor ? (
                                            <>1 {supplierItem.supplierUnitMeasure?.abbreviation || supplierItem.supplierUnitName} = {supplierItem.conversionFactor} {item.unitMeasure?.abbreviation}</>
                                        ) : 'N/A'}
                                    </td>
                                    <td>₱{supplierItem.unitPrice?.toFixed(2) || '0.00'}</td>
                                    <td>{supplierItem.averageDeliveryTime || 'N/A'}</td>
                                    <td>
                                        <span className={`chip ${(supplierItem.supplier?.status || '').toLowerCase()}`}>
                                            {supplierItem.supplier?.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <ActionButtons
                                            onToggleStar={() => handleTogglePreferred(supplierItem.id)}
                                            isStarred={supplierItem.isPreferred}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center' }}>No linked suppliers</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

        </>
    );
}