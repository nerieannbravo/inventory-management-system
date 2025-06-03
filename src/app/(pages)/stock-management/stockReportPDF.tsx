// stockReportPDF.tsx
import React, { useState } from "react";
import {
    Document,
    Page,
    Text,
    View,
    PDFViewer,
    PDFDownloadLink,
    StyleSheet
} from '@react-pdf/renderer';

import "@/styles/pdfModal.css";

// Interface definitions
interface StockItem {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    status: string;
    reorder: number;
}

interface StockReportPDFProps {
    isOpen: boolean;
    onClose: () => void;
    stockData: StockItem[];
    reportTitle?: string;
}

// PDF Styles
const reportStyles = StyleSheet.create({
    page: {
        padding: 50,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: 'medium',
        textAlign: 'center',
        marginBottom: 5,
    },
    dateTime: {
        color: '#555',
        fontSize: 10,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 5,
    },
    reportInfo: {
        fontSize: 10,
        textAlign: 'center',
        color: '#666',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginVertical: 15,
    },
    summarySection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 5,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    summaryLabel: {
        fontSize: 10,
        color: '#666',
        marginTop: 2,
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#343a40',
        padding: 10,
        fontWeight: 'bold',
        fontSize: 10,
        color: 'white',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        padding: 10,
        fontSize: 9,
        backgroundColor: 'white',
    },
    alternateRow: {
        backgroundColor: '#f8f9fa',
    },
    itemName: {
        flex: 3,
        paddingRight: 8,
    },
    quantity: {
        flex: 1.5,
        textAlign: 'center',
        paddingRight: 8,
    },
    unit: {
        flex: 1.5,
        textAlign: 'center',
        paddingRight: 8,
    },
    status: {
        flex: 2,
        textAlign: 'center',
        paddingRight: 8,
    },
    reorder: {
        flex: 1.5,
        textAlign: 'center',
    },
    statusChip: {
        padding: 3,
        borderRadius: 3,
        fontSize: 8,
        textAlign: 'center',
    },
    statusAvailable: {
        backgroundColor: '#d4edda',
        color: '#155724',
    },
    statusOutOfStock: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
    },
    statusLowStock: {
        backgroundColor: '#fff3cd',
        color: '#856404',
    },
    statusMaintenance: {
        backgroundColor: '#d1ecf1',
        color: '#0c5460',
    },
    statusExpired: {
        backgroundColor: '#f5c6cb',
        color: '#721c24',
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: '#555',
    },
    pageNumber: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 25,
        textAlign: 'right',
        fontSize: 10,
        color: '#555',
    },
});

// PDF Document Component
const StockReportDocument: React.FC<{
    stockData: StockItem[],
    reportTitle?: string
}> = ({ stockData, reportTitle = "Stock Inventory Report" }) => {

    const today = new Date();

    // Calculate summary statistics
    const totalItems = stockData.length;
    const availableItems = stockData.filter(item => item.status === 'available').length;
    const outOfStockItems = stockData.filter(item => item.status === 'out-of-stock').length;
    const lowStockItems = stockData.filter(item => item.status === 'low-stock').length;
    const maintenanceItems = stockData.filter(item => item.status === 'maintenance').length;
    const expiredItems = stockData.filter(item => item.status === 'expired').length;

    // Format status for display
    const formatStatus = (status: string) => {
        switch (status) {
            case "available":
                return "Available";
            case "out-of-stock":
                return "Out of Stock";
            case "low-stock":
                return "Low Stock";
            case "maintenance":
                return "Under Maintenance";
            case "expired":
                return "Expired";
            default:
                return status;
        }
    };

    // Get status style
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "available":
                return [reportStyles.statusChip, reportStyles.statusAvailable];
            case "out-of-stock":
                return [reportStyles.statusChip, reportStyles.statusOutOfStock];
            case "low-stock":
                return [reportStyles.statusChip, reportStyles.statusLowStock];
            case "maintenance":
                return [reportStyles.statusChip, reportStyles.statusMaintenance];
            case "expired":
                return [reportStyles.statusChip, reportStyles.statusExpired];
            default:
                return [reportStyles.statusChip];
        }
    };

    return (
        <Document>
            <Page size="LETTER" style={reportStyles.page}>
                {/* Header Section */}
                <View style={reportStyles.header}>
                    <Text style={reportStyles.companyName}>Agila Bus Transport Corp.</Text>
                    <Text style={reportStyles.title}>{reportTitle}</Text>
                    <Text style={reportStyles.dateTime}>
                        Generated on {today.toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                        })} at {today.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: 'numeric', 
                            hour12: true 
                        })}
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
                        <Text style={reportStyles.itemName}>Item Name</Text>
                        <Text style={reportStyles.quantity}>Current Stock</Text>
                        <Text style={reportStyles.unit}>Unit Measure</Text>
                        <Text style={reportStyles.status}>Status</Text>
                        <Text style={reportStyles.reorder}>Reorder Level</Text>
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
                            <Text style={reportStyles.itemName}>
                                {item.name}
                            </Text>
                            <Text style={reportStyles.quantity}>
                                {item.quantity}
                            </Text>
                            <Text style={reportStyles.unit}>
                                {item.unit}
                            </Text>
                            <View style={reportStyles.status}>
                                <Text style={getStatusStyle(item.status)}>
                                    {formatStatus(item.status)}
                                </Text>
                            </View>
                            <Text style={reportStyles.reorder}>
                                {item.reorder}
                            </Text>
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

    const generateFileName = () => {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10);
        return `stock-report-${dateStr}.pdf`;
    };

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
                            fileName={generateFileName()}
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
    const [reportTitle, setReportTitle] = useState("Stock Inventory Report");

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