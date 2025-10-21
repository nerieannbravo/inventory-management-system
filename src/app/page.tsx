'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import '@/styles/dashboard.css';
// import FuelConsumptionChart from '@/components/charts/fuelConsumption';
// import StockDistributionChart from '@/components/charts/stockDistribution';
// import StockMovementChart from '@/components/charts/stockMovement';


export default function Dashboard() {
    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h2 className="dashboard-header-label">Inventory Dashboard</h2>
                <div className="range-inputs">
                    <p className="date-label">Date Range:</p>
                    <input className="range" type="date" /> -
                    <input className="range" type="date" />
                </div>
            </div>

            {/* Summary Cards */}
            {/* Feel free to remove the dash-card-subtexts if hard to do */}
            {/* Feel free to change the dash-card-message, but don't remove */}
            <div className="summary-cards">
                {/* Low Stock Card */}
                <div className="dash-card low-stock">
                    <div className="dash-card-header">
                        <div className="dash-card-icon">
                            <i className="ri-box-3-line" />
                        </div>
                        <div>
                            <div className="dash-card-message">
                                <i className="ri-error-warning-line" />
                                <span>Warning</span>
                            </div>
                            <div className="dash-card-subtext">
                                5 stocks running low
                            </div>
                        </div>
                    </div>
                    <h2 className="dash-card-title">Low Stocks</h2>
                    <span className="dash-card-count">5</span>
                    <Link className="dash-card-button" href="/stock-management">
                        View Stocks
                    </Link>
                </div>

                {/* Out of Stock Card */}
                <div className="dash-card out-of-stock">
                    <div className="dash-card-header">
                        <div className="dash-card-icon">
                            <i className="ri-box-3-line" />
                        </div>
                        <div>
                            <div className="dash-card-message">
                                <i className="ri-alert-line" />
                                <span>Critical</span>
                            </div>
                            <div className="dash-card-subtext">
                                2 unavailable stocks
                            </div>
                        </div>
                    </div>
                    <h2 className="dash-card-title">Out of Stock</h2>
                    <span className="dash-card-count">2</span>
                    <Link className="dash-card-button" href="/request-management">
                        Restock Items
                    </Link>
                </div>

                {/* On Order */}
                <div className="dash-card on-order">
                    <div className="dash-card-header">
                        <div className="dash-card-icon">
                            <i className="ri-box-3-line" />
                        </div>
                        <div>
                            <div className="dash-card-message">
                                <i className="ri-information-line" />
                                <span>Pending</span>
                            </div>
                            <div className="dash-card-subtext">
                                4 items on order
                            </div>
                        </div>
                    </div>
                    <h2 className="dash-card-title">On Order</h2>
                    <span className="dash-card-count">4</span>
                    <Link className="dash-card-button" href="/order-management">
                        Manage Orders
                    </Link>
                </div>

                {/* Unreturned Items */}
                <div className="dash-card unreturned">
                    <div className="dash-card-header">
                        <div className="dash-card-icon">
                            <i className="ri-box-3-line" />
                        </div>
                        <div>
                            <div className="dash-card-message">
                                <i className="ri-checkbox-circle-line" />
                                <span>All Returned</span>
                            </div>
                            <div className="dash-card-subtext">
                                No unreturned items
                            </div>
                        </div>
                    </div>
                    <h2 className="dash-card-title">Unreturned Items</h2>
                    <span className="dash-card-count">0</span>
                    <Link className="dash-card-button" href="/request-management">
                        Track Stock Request
                    </Link>
                </div>
            </div>

            {/* Charts Section */}
            {/* <div className="charts-grid">
                <div className="chart-box">
                    <h3>Stock Movement Analysis</h3>
                    <div className="placeholder">
                        <StockMovementChart />
                    </div>
                </div>

                <div className="chart-box">
                    <h3>Stock Status Distribution</h3>
                    <div className="placeholder">
                        <StockDistributionChart />
                    </div>
                </div>
            </div> */}

            <div className="charts-grid">
                <div className="chart-box">
                    <h3>Fuel Consumption Analysis and Prediction</h3>
                    {/* <div className="placeholder">
                        <FuelConsumptionChart />
                    </div> */}
                </div>
            </div>
        </div>


    )
}