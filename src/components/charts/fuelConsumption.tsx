import React, { useState, useEffect, useMemo } from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus,  CheckCircle, Brain, Target, BarChart3, Zap } from 'lucide-react';
import '@/styles/fuel.css';
import '@/styles/dashboard.css';

interface DashboardData {
    month: string;
    consumption: number | null;
    predicted: number | null;
    confidence: number | null;
    isActual: boolean;
    isForecast: boolean;
}

const MLFuelDashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<'ml-ensemble' | 'arima' | 'neural-network'>('ml-ensemble');
    const [forecastPeriods, setForecastPeriods] = useState(3);
    const [currentForecast, setCurrentForecast] = useState<any>(null);
    const [showComparison, setShowComparison] = useState(false);
    const [allForecasts, setAllForecasts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debug, setDebug] = useState<any>(null);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Get forecast for fuel items
                const response = await fetch(`/api/fuel?periods=${forecastPeriods}&method=${selectedMethod}`);
                const result = await response.json();

                if (result.error) {
                    setError(result.error);
                    setLoading(false);
                    return;
                }

                // Combine historical and forecast data
                const combinedData = [
                    ...result.historical,
                    ...(result.forecast.data || [])
                ];

                setData(combinedData);
                setCurrentForecast(result.forecast);
                setDebug(result.debug); // Store debug info

                // Get all forecasts for comparison if needed
                if (showComparison) {
                    const methods = ['ml-ensemble', 'arima', 'neural-network'];
                    const forecasts = await Promise.all(
                        methods.map(method => 
                            fetch(`/api/fuel?periods=${forecastPeriods}&method=${method}`)
                                .then(res => res.json())
                                .then(data => data.forecast)
                        )
                    );
                    setAllForecasts(forecasts);
                }

            } catch (err) {
                setError('Failed to fetch data');
                console.error(err);
            }
            setLoading(false);
        };

        fetchData();
    }, [selectedMethod, forecastPeriods, showComparison]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (!data.length) return {
            totalHistorical: 0,
            avgHistorical: 0,
            forecastTotal: 0,
            avgConfidence: 0,
            dataQuality: 'Poor'
        };

        const historicalData = data.filter(d => d.isActual && d.consumption !== null);
        const totalConsumption = historicalData.reduce((sum, val) => sum + (val.consumption || 0), 0);
        const avgConsumption = historicalData.length > 0 ? totalConsumption / historicalData.length : 0;
        
        const forecastData = data.filter(d => d.isForecast && d.predicted !== null);
        const forecastTotal = forecastData.reduce((sum, val) => sum + (val.predicted || 0), 0);
        const avgConfidence = forecastData.length > 0 
            ? forecastData.reduce((sum, val) => sum + (val.confidence || 0), 0) / forecastData.length 
            : 0;

        return {
            totalHistorical: totalConsumption,
            avgHistorical: avgConsumption,
            forecastTotal,
            avgConfidence: Math.round(avgConfidence),
            dataQuality: historicalData.length >= 6 ? 'Good' : historicalData.length >= 3 ? 'Fair' : 'Poor'
        };
    }, [data]);

    const customTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm">
                                {entry.dataKey === 'consumption' ? 'Actual' : 'Predicted'}:
                                <strong className="ml-1">{entry.value?.toFixed(2)} gal</strong>
                            </span>
                        </div>
                    ))}
                    {payload.find((p: any) => p.payload.confidence) && (
                        <p className="text-xs text-gray-600 mt-1">
                            Confidence: {payload[0].payload.confidence}%
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'Increasing': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'Decreasing': return <TrendingDown className="w-4 h-4 text-red-600" />;
            default: return <Minus className="w-4 h-4 text-gray-600" />;
        }
    };

    // const getReliabilityColor = (reliability: string) => {
    //     switch (reliability) {
    //         case 'High': return 'text-green-600 bg-green-50';
    //         case 'Medium': return 'text-yellow-600 bg-yellow-50';
    //         case 'Low': return 'text-red-600 bg-red-50';
    //         default: return 'text-gray-600 bg-gray-50';
    //     }
    // };

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            {/* <div className="charts-grid"> */}
                {/* <div className="chart-box"> */}
                    
                <div className="fuel-dashboard">
                <div className="fuel-dashboard-container">
                    {/* Header */}
                    <div className="fuel-header">
                        <div className="fuel-header-content">
                            <div className="fuel-header-left">
                                <div className="fuel-header-icon">
                                    <Brain className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="fuel-header-text">
                                    <h1>ML Fuel Analytics</h1>
                                    <p>Advanced consumption forecasting & optimization</p>
                                </div>
                            </div>
                            <div className="fuel-header-right">
                                <p className="text-sm text-gray-500">Data Quality</p>
                                <div className={`data-quality ${stats.dataQuality.toLowerCase()}`}>
                                    {stats.dataQuality}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Debug info - can be removed in production */}
                    {debug && (
                        <div className="text-sm text-gray-500 mb-4">
                            Total Records: {debug.consumptionRecords} | 
                            Fuel Items: {debug.itemsCount} | 
                            Total Consumption: {debug.totalConsumption} gal
                        </div>
                    )}

                    {/* Controls Panel */}
                    <div className="controls-panel">
                        <div className="controls-content">
                            <div className="control-group">
                                <Target className="w-5 h-5 text-purple-600" />
                                <label className="text-sm font-medium text-gray-700">Forecast Method:</label>
                                <select
                                    value={selectedMethod}
                                    onChange={(e) => setSelectedMethod(e.target.value as any)}
                                    className="control-select"
                                >
                                    <option value="ml-ensemble">🧠 ML Ensemble</option>
                                    <option value="arima">📊 ARIMA</option>
                                    <option value="neural-network">🔬 Neural Network</option>
                                </select>
                            </div>

                            <div className="control-group">
                                <BarChart3 className="w-5 h-5 text-green-600" />
                                <label className="text-sm font-medium text-gray-700">Forecast Periods:</label>
                                <select
                                    value={forecastPeriods}
                                    onChange={(e) => setForecastPeriods(Number(e.target.value))}
                                    className="control-select"
                                >
                                    <option value={1}>1 Month</option>
                                    <option value={3}>3 Months</option>
                                    <option value={6}>6 Months</option>
                                    <option value={12}>12 Months</option>
                                </select>
                            </div>

                            <button
                                onClick={() => setShowComparison(!showComparison)}
                                className={`compare-button ${showComparison ? 'active' : ''}`}
                            >
                                Compare Methods
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <div className="kpi-content">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Historical Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalHistorical.toFixed(2)} gal</p>
                                </div>
                                <div className="kpi-icon blue">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-content">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Forecast Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.forecastTotal.toFixed(2)} gal</p>
                                </div>
                                <div className="kpi-icon green">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-content">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Avg Confidence</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.avgConfidence}%</p>
                                </div>
                                <div className="kpi-icon purple">
                                    <Target className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-content">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Model Accuracy</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {currentForecast?.accuracy ? `${(100 - currentForecast.accuracy.mape).toFixed(1)}%` : 'N/A'}
                                    </p>
                                </div>
                                <div className="kpi-icon orange">
                                    <Zap className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Chart */}
                    <div className="chart-container">
                        <div className="chart-header">
                            <h2 className="text-xl font-bold text-gray-900">Consumption Forecast</h2>
                            <div className="chart-legend">
                                <div className="legend-item">
                                    <div className="legend-dot bg-blue-500"></div>
                                    <span className="text-sm text-gray-600">Actual</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-dot bg-green-500"></div>
                                    <span className="text-sm text-gray-600">Predicted</span>
                                </div>
                            </div>
                        </div>

                        <div className="chart-content">
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="month"
                                        stroke="#666"
                                        tick={{ fontSize: 12 }}
                                        angle={360}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis
                                        stroke="#666"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'Gallons', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip content={customTooltip} />
                                    <Bar
                                        dataKey="consumption"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={40}
                                        name="Actual Consumption"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="predicted"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                                        connectNulls={true}
                                        name="Predicted Consumption"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Model Information */}
                    {currentForecast && (
                        <div className="model-info">
                            <div className="model-header">
                                <Brain className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">Model Insights</h2>
                            </div>

                            <div className="model-grid">
                                <div className="space-y-4">
                                    <div className="info-item">
                                        <span className="text-sm font-medium text-gray-700">Method</span>
                                        <span className="text-sm font-bold text-gray-900">{currentForecast.metadata.method}</span>
                                    </div>

                                    <div className="info-item">
                                        <span className="text-sm font-medium text-gray-700">Data Points</span>
                                        <span className="text-sm font-bold text-gray-900">{currentForecast.metadata.dataPoints}</span>
                                    </div>

                                    <div className="info-item">
                                        <span className="text-sm font-medium text-gray-700">Trend</span>
                                        <div className="flex items-center gap-2">
                                            {getTrendIcon(currentForecast.metadata.trend)}
                                            <span className="text-sm font-bold text-gray-900">{currentForecast.metadata.trend}</span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <span className="text-sm font-medium text-gray-700">Seasonality</span>
                                        <span className="text-sm font-bold text-gray-900">{currentForecast.metadata.seasonality}</span>
                                    </div>

                                    {currentForecast.accuracy && (
                                        <div className="info-item">
                                            <span className="text-sm font-medium text-gray-700">Reliability</span>
                                            <span className={`reliability-badge ${currentForecast.accuracy.reliability.toLowerCase()}`}>
                                                {currentForecast.accuracy.reliability}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                                    <div className="space-y-3">
                                        {currentForecast.metadata.recommendations.map((rec: string, index: number) => (
                                            <div key={index} className="recommendation-item">
                                                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-gray-700">{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Method Comparison */}
                    {showComparison && allForecasts.length > 0 && (
                        <div className="method-comparison">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Method Comparison</h2>

                            <div className="method-grid">
                                {allForecasts.map((forecast, index) => {
                                    const methods = ['ML Ensemble', 'ARIMA', 'Neural Network'];
                                    const colors = ['blue', 'green', 'purple'];

                                    return (
                                        <div key={index} className={`method-card ${colors[index]}`}>
                                            <h3 className="font-semibold text-gray-900 mb-3">{methods[index]}</h3>

                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Avg Confidence</span>
                                                    <span className="text-sm font-bold">
                                                        {Math.round(forecast.confidence.reduce((sum: number, val: number) => sum + val, 0) / forecast.confidence.length)}%
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Total Forecast</span>
                                                    <span className="text-sm font-bold">
                                                        {forecast.values.reduce((sum: number, val: number) => sum + val, 0).toFixed(2)} gal
                                                    </span>
                                                </div>

                                                {forecast.accuracy && (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">MAPE</span>
                                                            <span className="text-sm font-bold">{forecast.accuracy.mape}%</span>
                                                        </div>

                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Reliability</span>
                                                            <span className={`reliability-badge ${forecast.accuracy.reliability.toLowerCase()}`}>
                                                                {forecast.accuracy.reliability}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* </div> */}
        </ResponsiveContainer>
    );
};

export default MLFuelDashboard;