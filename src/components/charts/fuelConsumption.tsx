import React, { useEffect, useState } from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// Enhanced forecasting methods
const ForecastingMethods = {
    // Simple Moving Average
    movingAverage: (data: number[], periods: number = 3, forecastMonths: number = 3) => {
        const validData = data.filter(v => v > 0);
        if (validData.length < periods) return Array(forecastMonths).fill(validData[validData.length - 1] || 0);
        
        const lastPeriods = validData.slice(-periods);
        const average = lastPeriods.reduce((sum, val) => sum + val, 0) / periods;
        return Array(forecastMonths).fill(Math.round(average));
    },

    // Exponential Smoothing
    exponentialSmoothing: (data: number[], alpha: number = 0.3, forecastMonths: number = 3) => {
        const validData = data.filter(v => v > 0);
        if (validData.length < 2) return Array(forecastMonths).fill(validData[0] || 0);
        
        let smoothed = validData[0];
        for (let i = 1; i < validData.length; i++) {
            smoothed = alpha * validData[i] + (1 - alpha) * smoothed;
        }
        return Array(forecastMonths).fill(Math.round(smoothed));
    },

    // Seasonal Pattern Recognition
    seasonalForecast: (data: number[], forecastMonths: number = 3) => {
        const validData = data.filter(v => v > 0);
        if (validData.length < 2) return Array(forecastMonths).fill(validData[0] || 0);
        
        // Find seasonal patterns
        const average = validData.reduce((sum, val) => sum + val, 0) / validData.length;
        const trend = validData.length > 1 ? 
            (validData[validData.length - 1] - validData[0]) / (validData.length - 1) : 0;
        
        // Generate forecast with slight trend
        return Array(forecastMonths).fill(0).map((_, i) => 
            Math.round(average + trend * (validData.length + i))
        );
    },

    // Hybrid approach combining multiple methods
    hybridForecast: (data: number[], forecastMonths: number = 3) => {
        const validData = data.filter(v => v > 0);
        if (validData.length < 2) return Array(forecastMonths).fill(validData[0] || 0);
        
        const ma = ForecastingMethods.movingAverage(validData, 3, forecastMonths);
        const es = ForecastingMethods.exponentialSmoothing(validData, 0.3, forecastMonths);
        const seasonal = ForecastingMethods.seasonalForecast(validData, forecastMonths);
        
        // Weighted average of methods
        return ma.map((_, i) => 
            Math.round((ma[i] * 0.4 + es[i] * 0.4 + seasonal[i] * 0.2))
        );
    }
};

type ChartData = {
    month: string;
    consumption: number | null;
    predicted: number | null;
    isActual: boolean;
    isForecast: boolean;
};

export default function FuelConsumptionChart() {
    const [data, setData] = useState<ChartData[]>([]);
    const [forecastMethod, setForecastMethod] = useState<keyof typeof ForecastingMethods>('hybridForecast');
    const [forecastMonths, setForecastMonths] = useState(3);

    // Mock data for demonstration - replace with your API call
    const mockMonthlyData = [
        { month: 'Jan', consumption: 0 },
        { month: 'Feb', consumption: 0 },
        { month: 'Mar', consumption: 100 },
        { month: 'Apr', consumption: 76 },
        { month: 'May', consumption: 89 },
        { month: 'Jun', consumption: 60 },
        { month: 'Jul', consumption: 110 },
        { month: 'Aug', consumption: 40 }, // Current month - no data yet
        { month: 'Sep', consumption: 70 },
        { month: 'Oct', consumption: 0 },
        { month: 'Nov', consumption: 0 },
        { month: 'Dec', consumption: 0 }
    ];

    useEffect(() => {
        // In your real app, replace this with your API call
        const processData = () => {
            const months = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];
            
            // Get actual consumption data
            const actualConsumption = mockMonthlyData.map(item => item.consumption);
            
            // Find the last month with actual data
            let lastActualIndex = -1;
            for (let i = actualConsumption.length - 1; i >= 0; i--) {
                if (actualConsumption[i] > 0) {
                    lastActualIndex = i;
                    break;
                }
            }
            
            // Generate forecast
            const validData = actualConsumption.filter(v => v > 0);
            const forecast = ForecastingMethods[forecastMethod](validData, forecastMonths);
            
            // Build chart data
            const chartData: ChartData[] = months.map((month, i) => {
                const hasActualData = actualConsumption[i] > 0;
                const isForecastMonth = i > lastActualIndex && i <= lastActualIndex + forecastMonths;
                
                return {
                    month,
                    consumption: hasActualData ? actualConsumption[i] : null,
                    predicted: isForecastMonth ? forecast[i - lastActualIndex - 1] : null,
                    isActual: hasActualData,
                    isForecast: isForecastMonth
                };
            });
            
            setData(chartData);
        };

        processData();
    }, [forecastMethod, forecastMonths]);

    const formatTooltip = (value: any, name: string) => {
        if (value === null || value === 0) return ['No data', name];
        if (name === 'consumption') return [`${value} gallons`, 'Actual Consumption'];
        if (name === 'predicted') return [`${value} gallons`, 'Predicted Consumption'];
        return [value, name];
    };

    return (
        <div className="w-full space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Forecast Method:</label>
                    <select 
                        value={forecastMethod} 
                        onChange={(e) => setForecastMethod(e.target.value as keyof typeof ForecastingMethods)}
                        className="px-3 py-1 border rounded text-sm"
                    >
                        <option value="hybridForecast">Hybrid (Recommended)</option>
                        <option value="movingAverage">Moving Average</option>
                        <option value="exponentialSmoothing">Exponential Smoothing</option>
                        <option value="seasonalForecast">Seasonal Pattern</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Forecast Months:</label>
                    <select 
                        value={forecastMonths} 
                        onChange={(e) => setForecastMonths(Number(e.target.value))}
                        className="px-3 py-1 border rounded text-sm"
                    >
                        <option value={1}>1 Month</option>
                        <option value={2}>2 Months</option>
                        <option value={3}>3 Months</option>
                        <option value={6}>6 Months</option>
                    </select>
                </div>
            </div>

            {/* Chart */}
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart 
                        data={data} 
                        margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: '#ccc' }}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: '#ccc' }}
                            label={{ value: 'Gallons', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            formatter={formatTooltip}
                            labelFormatter={label => `Month: ${label}`}
                            contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                        <Legend />
                        
                        {/* Actual consumption bars */}
                        <Bar 
                            dataKey="consumption" 
                            fill="#2563eb" 
                            name="Actual Consumption" 
                            radius={[4, 4, 0, 0]} 
                            maxBarSize={50}
                        />
                        
                        {/* Predicted consumption line */}
                        <Line 
                            type="monotone" 
                            dataKey="predicted" 
                            stroke="#13CE66" 
                            strokeWidth={3} 
                            strokeDasharray="8 4" 
                            name="Predicted Consumption"
                            dot={{ fill: '#13CE66', strokeWidth: 2, r: 5, stroke: '#ffffff' }}
                            activeDot={{ r: 7, stroke: '#13CE66', strokeWidth: 2, fill: '#ffffff' }}
                            connectNulls={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Method Explanations */}
            <div className="p-4 bg-blue-50 rounded-lg text-sm">
                <h3 className="font-semibold mb-2">Forecasting Methods:</h3>
                <ul className="space-y-1 text-gray-700">
                    <li><strong>Hybrid:</strong> Combines multiple methods for better accuracy</li>
                    <li><strong>Moving Average:</strong> Uses average of recent periods</li>
                    <li><strong>Exponential Smoothing:</strong> Gives more weight to recent data</li>
                    <li><strong>Seasonal Pattern:</strong> Considers trends and patterns</li>
                </ul>
            </div>
        </div>
    );
}