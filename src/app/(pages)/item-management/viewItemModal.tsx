"use client";

import React, { useEffect, useState } from "react";
import "@/styles/forms.css";

interface ViewItemModalProps {
    item: {
        id: number;
        item_name: string,
        item_unit: string,
        item_category: string,
        status: string,
        description: string,
        // Additional fields would be included in a real application
    };
    formatStatus: (status: string) => string;
    onClose: () => void;
}

export default function ViewItemModal({ item, formatStatus, onClose }: ViewItemModalProps) {
    const [supplierItems, setSupplierItems] = useState<Array<{ id?: number; supplierName: string; unit_price: number; unitAbbrev?: string; delivery_time: string; date_updated?: string; note?: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        interface SupplierItemResp {
            id?: number;
            supplier?: { supplier_name?: string };
            unit?: { abbreviation?: string; unit_name?: string };
            unit_abbreviation?: string;
            unit_price?: number;
            delivery_time?: string;
            note?: string;
            date_updated?: string;
            date_created?: string;
        }
        const fetchSupplierItems = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/supplier-items?item_id=${item.id}`);
                const body = await res.json().catch(() => ({}));
                if (!res.ok) {
                    const msg = body?.error ?? `Failed to load supplier items (${res.status})`;
                    if (mounted) setError(String(msg));
                    return;
                }
                const data = body?.data ?? [];
                const mapped = (data as SupplierItemResp[]).map(si => ({
                    id: si.id,
                    supplierName: si.supplier?.supplier_name ?? 'Unknown',
                    unit_price: si.unit_price ?? 0,
                    unitAbbrev: si.unit?.abbreviation ?? si.unit_abbreviation ?? '',
                    delivery_time: si.delivery_time ?? '',
                    date_updated: si.date_updated ?? si.date_created,
                    note: si.note ?? ''
                }));
                if (mounted) setSupplierItems(mapped);
            } catch (err) {
                console.error('Failed to fetch supplier-items for view modal', err);
                if (mounted) setError('Failed to load suppliers.');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchSupplierItems();
        return () => { mounted = false; };
    }, [item.id]);

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
                        <p>{item.item_name}</p>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Unit Measure</label>
                            <p>{item.item_unit}</p>
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <p>{item.item_category}</p>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <p>{formatStatus(item.status)}</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        {item.description ? (
                            <p>{item.description}</p>
                        ) : (
                            <p className="no-records" style={{ color: "red" }}>No description available</p>
                        )}
                    </div>
                </div>
            </div >

            <p className="details-title">Linked Supplier/s</p>
            <table className="modal-table">
                <thead className="modal-table-heading">
                    <tr>
                        <th>Supplier Name</th>
                        <th>Unit Price</th>
                        <th>Average Delivery Time</th>
                        <th>Last Updated</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody className="modal-table-body">
                    {loading ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center' }}>Loading suppliers…</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={5} style={{ color: 'red' }}>{error}</td>
                        </tr>
                    ) : supplierItems.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center' }}>No linked suppliers found.</td>
                        </tr>
                    ) : (
                        supplierItems.map(s => (
                            <tr key={s.id ?? s.supplierName}>
                                <td>{s.supplierName}</td>
                                <td>{s.unit_price}{s.unitAbbrev ? ` / ${s.unitAbbrev}` : ''}</td>
                                <td>{s.delivery_time}</td>
                                <td>{s.date_updated ? new Date(s.date_updated).toLocaleDateString() : ''}</td>
                                <td className="table-ellipsis">{s.note}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

        </>
    );
}