import React, { useState } from "react";
import {
    Document,
    Page,
    Text,
    View,
    PDFViewer,
    PDFDownloadLink,
} from '@react-pdf/renderer';

import { reportStyles } from '@/styles/pdfReportStyles';
import {
    formatDate,
    formatTime,
    generateFileName,
    formatStockStatus,
    getStockStatusStyle
} from '@/utils/pdfReportUtils';
import "@/styles/pdfModal.css";

// Interface definitions
interface StockItem {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    category: string;
    reorder: number;
    status: string;
}

interface StockReportPDFProps {
    isOpen: boolean;
    onClose: () => void;
    stockData: StockItem[];
    reportTitle?: string;
}

// PDF Document Component
const StockReportDocument: React.FC<{
    stockData: StockItem[],
    reportTitle?: string
}> = ({ stockData, reportTitle = "Stock Management Report" }) => {

    const today = new Date();

    // Calculate summary statistics
    const totalItems = stockData.length;
    const availableItems = stockData.filter(item => item.status === 'available').length;
    const outOfStockItems = stockData.filter(item => item.status === 'out-of-stock').length;
    const lowStockItems = stockData.filter(item => item.status === 'low-stock').length;
    const maintenanceItems = stockData.filter(item => item.status === 'maintenance').length;
    const expiredItems = stockData.filter(item => item.status === 'expired').length;

    return (
        <Document>
            <Page size="LETTER" style={reportStyles.page}>
                {/* Header Section */}
                <View style={reportStyles.header}>
                    <Text style={reportStyles.companyName}>Agila Bus Transport Corp.</Text>
                    <Text style={reportStyles.title}>{reportTitle}</Text>
                    <Text style={reportStyles.dateTime}>
                        Generated on {formatDate(today)} at {formatTime(today)}
                    </Text>
                    <Text style={reportStyles.reportInfo}>
                        Total Items: {totalItems}
                    </Text>
                </View>

                {/* Divider */}
                <View style={reportStyles.divider} />

                {/* Summary Section */}
                <View style={reportStyles.summarySection}>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{availableItems}</Text>
                        <Text style={reportStyles.summaryLabel}>Available</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{lowStockItems}</Text>
                        <Text style={reportStyles.summaryLabel}>Low Stock</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{outOfStockItems}</Text>
                        <Text style={reportStyles.summaryLabel}>Out of Stock</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{maintenanceItems}</Text>
                        <Text style={reportStyles.summaryLabel}>Maintenance</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{expiredItems}</Text>
                        <Text style={reportStyles.summaryLabel}>Expired</Text>
                    </View>
                </View>

                {/* Table */}
                <View style={reportStyles.table}>
                    {/* Table Header */}
                    <View style={reportStyles.tableHeader}>
                        <Text style={reportStyles.columnLarge}>Item Name</Text>
                        <Text style={reportStyles.columnSmall}>Current Stock</Text>
                        <Text style={reportStyles.columnMedium}>Category</Text>
                        <Text style={reportStyles.columnMedium}>Reorder Level</Text>
                        <Text style={reportStyles.columnMedium}>Status</Text>
                    </View>

                    {/* Table Rows */}
                    {stockData.map((item, index) => (
                        <View
                            key={item.id}
                            style={[
                                reportStyles.tableRow,
                                index % 2 === 1 ? reportStyles.alternateRow : {}
                            ]}
                        >
                            <Text style={reportStyles.columnLarge}>
                                {item.name}
                            </Text>
                            <Text style={reportStyles.columnSmall}>
                                {item.quantity} {item.unit}
                            </Text>
                            <Text style={reportStyles.columnMedium}>
                                {item.category}
                            </Text>
                            <Text style={reportStyles.columnMedium}>
                                {item.reorder}
                            </Text>
                            <View style={reportStyles.statusContainer}>
                                <Text style={getStockStatusStyle(item.status)}>
                                    {formatStockStatus(item.status)}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <Text style={reportStyles.footer}>
                    This report was electronically generated by the Agila Bus Transport Corp. - Inventory Management System
                </Text>

                {/* Page Number */}
                <Text style={reportStyles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `Page ${pageNumber} of ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
};

// PDF Preview Modal Component
export const StockReportPreviewModal: React.FC<StockReportPDFProps> = ({
    isOpen,
    onClose,
    stockData,
    reportTitle
}) => {
    if (!isOpen) return null;

    return (
        <div className="pdf-modal-overlay">
            <div className="pdf-modal">
                <div className="pdf-modal-content">
                    <div className="pdf-container">
                        <PDFViewer width="100%" height="100%">
                            <StockReportDocument
                                stockData={stockData}
                                reportTitle={reportTitle}
                            />
                        </PDFViewer>
                    </div>

                    <div className="pdf-modal-actions">
                        <button className="close-btn" onClick={onClose}>Close</button>
                        <PDFDownloadLink
                            document={
                                <StockReportDocument
                                    stockData={stockData}
                                    reportTitle={reportTitle}
                                />
                            }
                            fileName={generateFileName('stock')}
                            className="download-btn"
                        >
                            {({ blob, url, loading, error }) =>
                                loading ?
                                    'Preparing document...' :
                                    <><i className="ri-file-download-line" /> Download PDF</>
                            }
                        </PDFDownloadLink>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Custom hook for stock report PDF functionality
export const useStockReportPDF = (stockData: StockItem[]) => {
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [reportTitle, setReportTitle] = useState("Stock Management Report");

    const handlePreviewReport = () => {
        setShowReportPreview(true);
    };

    const handleCloseReportPreview = () => {
        setShowReportPreview(false);
    };

    return {
        showReportPreview,
        handlePreviewReport,
        handleCloseReportPreview,
        reportTitle,
        setReportTitle
    };
};