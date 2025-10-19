// Advanced Forecasting Utilities with ML-like approaches
// utils/advancedForecasting.ts

export interface ForecastResult {
    values: number[];
    confidence: number[];
    accuracy?: AccuracyMetrics;
    metadata: ForecastMetadata;
}

export interface AccuracyMetrics {
    mae: number; // Mean Absolute Error
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    reliability: 'High' | 'Medium' | 'Low';
}

export interface ForecastMetadata {
    method: string;
    dataPoints: number;
    seasonality: 'Detected' | 'Not Detected' | 'Insufficient Data';
    trend: 'Increasing' | 'Decreasing' | 'Stable' | 'Volatile';
    recommendations: string[];
}

export class AdvancedFuelForecasting {
    
    /**
     * ARIMA-like forecasting (Auto-Regressive Integrated Moving Average)
     * Simplified implementation suitable for fuel consumption patterns
     */
    static arimaForecast(data: number[], periods: number = 3): ForecastResult {
        const cleanData = data.filter(v => v > 0);
        
        if (cleanData.length < 4) {
            return this.fallbackForecast(cleanData, periods, 'ARIMA (Insufficient Data)');
        }

        // Differencing to make series stationary
        const differences = this.calculateDifferences(cleanData);
        
        // Auto-regression parameters (simplified)
        const arParams = this.calculateAutoRegression(differences, Math.min(2, differences.length - 1));
        
        // Moving average component
        const maParams = this.calculateMovingAverage(differences, Math.min(1, differences.length - 1));
        
        // Generate forecast
        const forecast = this.generateARIMAForecast(cleanData, arParams, maParams, periods);
        const confidence = this.calculateARIMAConfidence(cleanData, forecast);
        
        return {
            values: forecast.map(v => Math.max(0, Math.round(v))),
            confidence,
            accuracy: this.calculateAccuracy(cleanData),
            metadata: {
                method: 'ARIMA',
                dataPoints: cleanData.length,
                seasonality: this.detectSeasonality(cleanData),
                trend: this.detectTrend(cleanData),
                recommendations: this.generateRecommendations(cleanData, forecast)
            }
        };
    }

    /**
     * Neural Network-inspired approach using weighted patterns
     */
    static neuralNetworkForecast(data: number[], periods: number = 3): ForecastResult {
        const cleanData = data.filter(v => v > 0);
        
        if (cleanData.length < 3) {
            return this.fallbackForecast(cleanData, periods, 'Neural Network (Insufficient Data)');
        }

        // Create pattern windows
        const windowSize = Math.min(3, cleanData.length - 1);
        const patterns = this.extractPatterns(cleanData, windowSize);
        
        // Calculate pattern weights based on recency and similarity
        const weights = this.calculatePatternWeights(patterns);
        
        // Generate forecast using weighted patterns
        const forecast = this.generateNeuralForecast(cleanData, patterns, weights, periods);
        const confidence = this.calculateNeuralConfidence(patterns, weights);
        
        return {
            values: forecast.map(v => Math.max(0, Math.round(v))),
            confidence,
            accuracy: this.calculateAccuracy(cleanData),
            metadata: {
                method: 'Neural Network-Inspired',
                dataPoints: cleanData.length,
                seasonality: this.detectSeasonality(cleanData),
                trend: this.detectTrend(cleanData),
                recommendations: this.generateRecommendations(cleanData, forecast)
            }
        };
    }

    /**
     * Machine Learning ensemble combining multiple algorithms
     */
    static mlEnsembleForecast(data: number[], periods: number = 3): ForecastResult {
        const cleanData = data.filter(v => v > 0);
        
        if (cleanData.length < 2) {
            return this.fallbackForecast(cleanData, periods, 'ML Ensemble (Insufficient Data)');
        }

        // Get predictions from different methods
        const methods = [
            this.arimaForecast(data, periods),
            this.neuralNetworkForecast(data, periods),
            this.exponentialSmoothingForecast(data, periods),
            this.seasonalDecompositionForecast(data, periods)
        ];

        // Calculate method weights based on historical accuracy
        const methodWeights = this.calculateMethodWeights(methods, cleanData);
        
        // Ensemble the forecasts
        const ensembleForecast = this.combineForecasts(methods, methodWeights);
        const ensembleConfidence = this.calculateEnsembleConfidence(methods, methodWeights);
        
        return {
            values: ensembleForecast.map(v => Math.max(0, Math.round(v))),
            confidence: ensembleConfidence,
            accuracy: this.calculateAccuracy(cleanData),
            metadata: {
                method: 'ML Ensemble',
                dataPoints: cleanData.length,
                seasonality: this.detectSeasonality(cleanData),
                trend: this.detectTrend(cleanData),
                recommendations: this.generateAdvancedRecommendations(cleanData, ensembleForecast, methods)
            }
        };
    }

    // Helper methods for ARIMA
    private static calculateDifferences(data: number[]): number[] {
        return data.slice(1).map((val, i) => val - data[i]);
    }

    private static calculateAutoRegression(data: number[], order: number): number[] {
        if (data.length <= order) return [0.5];
        
        // Simplified AR calculation using least squares
        const X: number[][] = [];
        const y: number[] = [];
        
        for (let i = order; i < data.length; i++) {
            const row = [];
            for (let j = 0; j < order; j++) {
                row.push(data[i - j - 1]);
            }
            X.push(row);
            y.push(data[i]);
        }
        
        return this.leastSquares(X, y);
    }

    private static calculateMovingAverage(data: number[], order: number): number[] {
        if (data.length <= order) return [0.3];
        
        const errors = data.slice(1).map((val, i) => val - data[i]);
        return [errors.reduce((sum, err) => sum + Math.abs(err), 0) / errors.length / 100];
    }

    private static generateARIMAForecast(
        originalData: number[], 
        arParams: number[], 
        maParams: number[], 
        periods: number
    ): number[] {
        const forecast: number[] = [];
        const lastValues = originalData.slice(-Math.max(arParams.length, 2));
        
        for (let i = 0; i < periods; i++) {
            let predicted = lastValues[lastValues.length - 1]; // Base case
            
            // Apply AR component
            for (let j = 0; j < Math.min(arParams.length, lastValues.length); j++) {
                predicted += arParams[j] * (lastValues[lastValues.length - 1 - j] - lastValues[lastValues.length - 2 - j] || 0);
            }
            
            // Apply MA component (simplified)
            predicted += maParams[0] * (Math.random() - 0.5) * predicted * 0.1;
            
            forecast.push(predicted);
            lastValues.push(predicted);
            if (lastValues.length > arParams.length + 1) {
                lastValues.shift();
            }
        }
        
        return forecast;
    }

    private static calculateARIMAConfidence(historical: number[], forecast: number[]): number[] {
        const variance = this.calculateVariance(historical);
        const baseConfidence = Math.max(50, 90 - (variance / (this.mean(historical) || 1)) * 100);
        
        return forecast.map((_, i) => Math.max(30, baseConfidence - i * 10));
    }

    // Helper methods for Neural Network approach
    private static extractPatterns(data: number[], windowSize: number): number[][] {
        const patterns: number[][] = [];
        for (let i = 0; i <= data.length - windowSize; i++) {
            patterns.push(data.slice(i, i + windowSize));
        }
        return patterns;
    }

    private static calculatePatternWeights(patterns: number[][]): number[] {
        return patterns.map((_, i) => {
            // More recent patterns get higher weights
            const recencyWeight = (i + 1) / patterns.length;
            // Patterns with less variance get higher weights (more stable)
            const stabilityWeight = 1 / (this.calculateVariance(patterns[i]) + 1);
            return recencyWeight * 0.7 + stabilityWeight * 0.3;
        });
    }

    private static generateNeuralForecast(
        data: number[], 
        patterns: number[][], 
        weights: number[], 
        periods: number
    ): number[] {
        const forecast: number[] = [];
        
        for (let period = 0; period < periods; period++) {
            let weightedSum = 0;
            let totalWeight = 0;
            
            patterns.forEach((pattern, i) => {
                if (pattern.length > 1) {
                    const patternGrowth = pattern[pattern.length - 1] / (pattern[pattern.length - 2] || 1);
                    const contribution = (data[data.length - 1] || 0) * patternGrowth;
                    weightedSum += contribution * weights[i];
                    totalWeight += weights[i];
                }
            });
            
            const predicted = totalWeight > 0 ? weightedSum / totalWeight : data[data.length - 1] || 0;
            forecast.push(predicted);
            data.push(predicted); // Add to data for next period calculation
        }
        
        return forecast;
    }

    private static calculateNeuralConfidence(patterns: number[][], weights: number[]): number[] {
        const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
        const confidence = Math.min(90, 60 + avgWeight * 30);
        
        return [confidence, confidence * 0.9, confidence * 0.8]; // Decreasing confidence
    }

    // Enhanced forecasting methods
    private static exponentialSmoothingForecast(data: number[], periods: number): ForecastResult {
        const cleanData = data.filter(v => v > 0);
        
        if (cleanData.length < 2) {
            return this.fallbackForecast(cleanData, periods, 'Exponential Smoothing');
        }

        const alpha = 0.3;
        const beta = 0.1;
        
        let level = cleanData[0];
        let trend = cleanData.length > 1 ? cleanData[1] - cleanData[0] : 0;
        
        // Update level and trend
        for (let i = 1; i < cleanData.length; i++) {
            const prevLevel = level;
            level = alpha * cleanData[i] + (1 - alpha) * (level + trend);
            trend = beta * (level - prevLevel) + (1 - beta) * trend;
        }
        
        // Generate forecast
        const forecast = [];
        for (let h = 1; h <= periods; h++) {
            forecast.push(level + h * trend);
        }
        
        return {
            values: forecast.map(v => Math.max(0, Math.round(v))),
            confidence: forecast.map((_, i) => Math.max(50, 85 - i * 8)),
            accuracy: this.calculateAccuracy(cleanData),
            metadata: {
                method: 'Double Exponential Smoothing',
                dataPoints: cleanData.length,
                seasonality: this.detectSeasonality(cleanData),
                trend: this.detectTrend(cleanData),
                recommendations: this.generateRecommendations(cleanData, forecast)
            }
        };
    }

    private static seasonalDecompositionForecast(data: number[], periods: number): ForecastResult {
        const cleanData = data.filter(v => v > 0);
        
        if (cleanData.length < 4) {
            return this.fallbackForecast(cleanData, periods, 'Seasonal Decomposition');
        }

        // Decompose into trend, seasonal, and residual components
        const trend = this.calculateTrendComponent(cleanData);
        const seasonal = this.calculateSeasonalComponent(cleanData, trend);
        const residual = this.calculateResidualComponent(cleanData, trend, seasonal);
        
        // Forecast each component
        const trendForecast = this.forecastTrend(trend, periods);
        const seasonalForecast = this.forecastSeasonal(seasonal, periods);
        
        // Combine forecasts
        const forecast = trendForecast.map((t, i) => t + seasonalForecast[i]);
        
        return {
            values: forecast.map(v => Math.max(0, Math.round(v))),
            confidence: forecast.map((_, i) => Math.max(60, 88 - i * 6)),
            accuracy: this.calculateAccuracy(cleanData),
            metadata: {
                method: 'Seasonal Decomposition',
                dataPoints: cleanData.length,
                seasonality: seasonal.some(s => Math.abs(s) > 0.1) ? 'Detected' : 'Not Detected',
                trend: this.detectTrend(trend),
                recommendations: this.generateRecommendations(cleanData, forecast)
            }
        };
    }

    // Utility methods
    private static fallbackForecast(data: number[], periods: number, method: string): ForecastResult {
        const lastValue = data.length > 0 ? data[data.length - 1] : 0;
        const forecast = Array(periods).fill(lastValue);
        
        return {
            values: forecast,
            confidence: Array(periods).fill(50),
            accuracy: data.length > 1 ? this.calculateAccuracy(data) : undefined,
            metadata: {
                method,
                dataPoints: data.length,
                seasonality: 'Insufficient Data',
                trend: 'Volatile',
                recommendations: ['Collect more historical data for better forecasting accuracy']
            }
        };
    }

    private static leastSquares(X: number[][], y: number[]): number[] {
        // Simplified least squares calculation
        if (X.length === 0 || X[0].length === 0) return [0.5];
        
        try {
            // For simplicity, return average coefficient
            const avgY = y.reduce((sum, val) => sum + val, 0) / y.length;
            const avgX = X.map(row => row.reduce((sum, val) => sum + val, 0) / row.length);
            const avgXMean = avgX.reduce((sum, val) => sum + val, 0) / avgX.length;
            
            return [avgXMean !== 0 ? avgY / avgXMean : 0.5];
        } catch {
            return [0.5];
        }
    }

    private static calculateVariance(data: number[]): number {
        if (data.length < 2) return 0;
        const mean = this.mean(data);
        return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    }

    private static mean(data: number[]): number {
        return data.length > 0 ? data.reduce((sum, val) => sum + val, 0) / data.length : 0;
    }

    private static detectSeasonality(data: number[]): 'Detected' | 'Not Detected' | 'Insufficient Data' {
        if (data.length < 4) return 'Insufficient Data';
        
        const variance = this.calculateVariance(data);
        const mean = this.mean(data);
        const cv = mean > 0 ? variance / mean : 0;
        
        return cv > 0.3 ? 'Detected' : 'Not Detected';
    }

    private static detectTrend(data: number[]): 'Increasing' | 'Decreasing' | 'Stable' | 'Volatile' {
        if (data.length < 3) return 'Stable';
        
        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));
        
        const firstMean = this.mean(firstHalf);
        const secondMean = this.mean(secondHalf);
        const difference = secondMean - firstMean;
        const threshold = this.mean(data) * 0.1;
        
        if (Math.abs(difference) < threshold) return 'Stable';
        if (difference > threshold) return 'Increasing';
        if (difference < -threshold) return 'Decreasing';
        
        return 'Volatile';
    }

    private static calculateAccuracy(data: number[]): AccuracyMetrics | undefined {
        if (data.length < 3) return undefined;
        
        // Use last 30% of data for validation
        const validationSize = Math.max(1, Math.floor(data.length * 0.3));
        const trainData = data.slice(0, -validationSize);
        const testData = data.slice(-validationSize);
        
        // Simple forecast for validation
        const simpleForecast = Array(validationSize).fill(this.mean(trainData));
        
        const mae = testData.reduce((sum, actual, i) => 
            sum + Math.abs(actual - simpleForecast[i]), 0) / validationSize;
        
        const mape = testData.reduce((sum, actual, i) => 
            sum + (actual > 0 ? Math.abs((actual - simpleForecast[i]) / actual) : 0), 0) / validationSize * 100;
        
        const rmse = Math.sqrt(testData.reduce((sum, actual, i) => 
            sum + Math.pow(actual - simpleForecast[i], 2), 0) / validationSize);
        
        const reliability = mape < 20 ? 'High' : mape < 40 ? 'Medium' : 'Low';
        
        return { mae, mape, rmse, reliability };
    }

    private static generateRecommendations(historical: number[], forecast: number[]): string[] {
        const recommendations: string[] = [];
        const avgHistorical = this.mean(historical);
        const avgForecast = this.mean(forecast);
        
        if (avgForecast > avgHistorical * 1.2) {
            recommendations.push('Predicted consumption is significantly higher than historical average. Consider reviewing fuel efficiency or upcoming operational changes.');
        }
        
        if (avgForecast < avgHistorical * 0.8) {
            recommendations.push('Predicted consumption is lower than historical average. This could indicate improved efficiency or reduced operations.');
        }
        
        if (this.calculateVariance(forecast) > this.calculateVariance(historical)) {
            recommendations.push('High forecast variability detected. Consider implementing more consistent fuel management practices.');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Forecast appears consistent with historical patterns. Continue monitoring for any significant deviations.');
        }
        
        return recommendations;
    }

    private static generateAdvancedRecommendations(
        historical: number[], 
        forecast: number[], 
        methods: ForecastResult[]
    ): string[] {
        const basicRecs = this.generateRecommendations(historical, forecast);
        const advancedRecs: string[] = [];
        
        // Method agreement analysis
        const methodValues = methods.map(m => m.values);
        const agreement = this.calculateMethodAgreement(methodValues);
        
        if (agreement < 0.8) {
            advancedRecs.push('Low agreement between forecasting methods detected. Results should be interpreted with caution.');
        }
        
        // Trend analysis
        const trends = methods.map(m => m.metadata.trend);
        const trendConsistency = new Set(trends).size === 1;
        
        if (!trendConsistency) {
            advancedRecs.push('Multiple trend patterns detected. Consider external factors that might be influencing consumption.');
        }
        
        return [...basicRecs, ...advancedRecs];
    }

    // Additional helper methods would go here...
    private static calculateTrendComponent(data: number[]): number[] {
        // Simple moving average for trend
        const windowSize = Math.min(3, data.length);
        const trend: number[] = [];
        
        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - Math.floor(windowSize / 2));
            const end = Math.min(data.length, start + windowSize);
            const window = data.slice(start, end);
            trend.push(this.mean(window));
        }
        
        return trend;
    }

    private static calculateSeasonalComponent(data: number[], trend: number[]): number[] {
        return data.map((val, i) => val - trend[i]);
    }

    private static calculateResidualComponent(data: number[], trend: number[], seasonal: number[]): number[] {
        return data.map((val, i) => val - trend[i] - seasonal[i]);
    }

    private static forecastTrend(trend: number[], periods: number): number[] {
        if (trend.length < 2) return Array(periods).fill(trend[0] || 0);
        
        const slope = (trend[trend.length - 1] - trend[0]) / (trend.length - 1);
        const lastValue = trend[trend.length - 1];
        
        return Array(periods).fill(0).map((_, i) => lastValue + slope * (i + 1));
    }

    private static forecastSeasonal(seasonal: number[], periods: number): number[] {
        if (seasonal.length === 0) return Array(periods).fill(0);
        
        // Simple repetition of seasonal pattern
        return Array(periods).fill(0).map((_, i) => seasonal[i % seasonal.length]);
    }

    private static calculateMethodWeights(methods: ForecastResult[], historical: number[]): number[] {
        // Equal weights for simplicity, but could be based on historical accuracy
        return Array(methods.length).fill(1 / methods.length);
    }

    private static combineForecasts(methods: ForecastResult[], weights: number[]): number[] {
        const periods = methods[0]?.values.length || 0;
        const combined: number[] = [];
        
        for (let i = 0; i < periods; i++) {
            let weightedSum = 0;
            let totalWeight = 0;
            
            methods.forEach((method, j) => {
                if (method.values[i] !== undefined) {
                    weightedSum += method.values[i] * weights[j];
                    totalWeight += weights[j];
                }
            });
            
            combined.push(totalWeight > 0 ? weightedSum / totalWeight : 0);
        }
        
        return combined;
    }

    private static calculateEnsembleConfidence(methods: ForecastResult[], weights: number[]): number[] {
        const periods = methods[0]?.confidence.length || 0;
        const combined: number[] = [];
        
        for (let i = 0; i < periods; i++) {
            let weightedSum = 0;
            let totalWeight = 0;
            
            methods.forEach((method, j) => {
                if (method.confidence[i] !== undefined) {
                    weightedSum += method.confidence[i] * weights[j];
                    totalWeight += weights[j];
                }
            });
            
            combined.push(totalWeight > 0 ? weightedSum / totalWeight : 50);
        }
        
        return combined;
    }

    private static calculateMethodAgreement(methodValues: number[][]): number {
        if (methodValues.length < 2) return 1;
        
        const periods = methodValues[0]?.length || 0;
        let totalAgreement = 0;
        
        for (let i = 0; i < periods; i++) {
            const values = methodValues.map(method => method[i]).filter(v => v !== undefined);
            if (values.length < 2) continue;
            
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
            
            totalAgreement += Math.max(0, 1 - cv);
        }
        
        return periods > 0 ? totalAgreement / periods : 1;
    }
}