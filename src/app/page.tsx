'use client';

import React, { useEffect, useState } from 'react';
import '../styles/dashboard.css';
import FuelConsumptionChart from '@/components/charts/fuelConsumption';
import StockDistributionChart from '@/components/charts/stockDistribution';
import StockMovementChart from '@/components/charts/stockMovement';
import { fetchInventoryItems, InventoryItem } from '@/app/lib/fetchData';

export default function Dashboard() {
    const [lowStockCount, setLowStockCount] = useState(0);
    const [outOfStockCount, setOutOfStockCount] = useState(0);
    const [unreturnedCount, setUnreturnedCount] = useState(0);
    const [onOrderCount, setOnOrderCount] = useState(0); // Placeholder if you want to make this dynamic later

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch inventory items
                const items = await fetchInventoryItems();
                setLowStockCount(items.filter((item: InventoryItem) => item.status === 'LOW_STOCK').length);
                setOutOfStockCount(items.filter((item: InventoryItem) => item.status === 'OUT_OF_STOCK').length);
                // If you want to make On Order dynamic, add logic here
            } catch (error) {
                console.error('Error fetching inventory items:', error);
            }

            try {
                // Fetch requests
                const res = await fetch('/api/request');
                const data = await res.json();
                if (data.success && Array.isArray(data.request)) {
                    setUnreturnedCount(data.request.filter((req: any) => req.status === 'NOT_RETURNED').length);
                }
            } catch (error) {
                console.error('Error fetching requests:', error);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h2 className="overview">Overview</h2>
                <div className="range-inputs">
                    <p className="date-label">Date Range:</p>
                    <input className="range" type="date" /> -
                    <input className="range" type="date" />
                </div>
            </div>


            {/* Summary Cards */}
            <div className="summary-groups">
                <div className="summary-group">
                    <div className="dash-card low-stocks">
                        <div className="dash-card-content">
                            <div className="dash-card-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10" fill="#fef3e2" />
                                    <rect x="11" y="7" width="2" height="6" rx="1" fill="#d97706" />
                                    <rect x="11" y="15" width="2" height="2" rx="1" fill="#d97706" />
                                </svg>
                            </div>
                            <span className="dash-card-title">Low Stocks</span>
                        </div>
                        <span><b>{lowStockCount}</b></span>
                    </div>

                    <div className="dash-card out-of-stock">
                        <div className="dash-card-content">
                            <div className="dash-card-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                                </svg>
                            </div>
                            <span className="dash-card-title">Out of Stock</span>
                        </div>
                        <span><b>{outOfStockCount}</b></span>
                    </div>
                </div>

                <div className="summary-group">
                    <div className="dash-card on-order">
                        <div className="dash-card-content">
                            <div className="dash-card-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 4V2C7 1.45 7.45 1 8 1S9 1.45 9 2V4H15V2C15 1.45 15.45 1 16 1S17 1.45 17 2V4H20C21.1 4 22 4.9 22 6V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V6C2 4.9 2.9 4 4 4H7ZM4 8V20H20V8H4Z" />
                                </svg>
                            </div>
                            <span className="dash-card-title">On Order</span>
                        </div>
                        <span><b>{onOrderCount}</b></span>
                    </div>

                    <div className="dash-card unreturned">
                        <div className="dash-card-content">
                            <div className="dash-card-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.57 4.46 15.03 5.24 16.26L6.7 14.8C6.25 13.97 6 13 6 12C6 8.69 8.69 6 12 6ZM18.76 7.74L17.3 9.2C17.74 10.04 18 11 18 12C18 15.31 15.31 18 12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12C20 10.43 19.54 8.97 18.76 7.74Z" />
                                </svg>
                            </div>
                            <span className="dash-card-title">Unreturned Items</span>
                        </div>
                        <span><b>{unreturnedCount}</b></span>
                    </div>
                </div>
            </div>


            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-box">
                    <h3>Stock Movement Analysis</h3>
                    <div className="placeholder"><StockMovementChart /></div>
                </div>

                <div className="chart-box">
                    <h3>Stock Status Distribution</h3>
                    <div className="placeholder"><StockDistributionChart /></div>
                </div>
            </div>

            {/* <div className="charts-grid">
                <div className="chart-box"> */}
            {/* <h3>Fuel Consumption Analysis and Prediction</h3> */}
            <div className="placeholder">
                <div >

                </div>
                <FuelConsumptionChart /></div>
            {/* </div>
            </div> */}
        </div>


    )
}