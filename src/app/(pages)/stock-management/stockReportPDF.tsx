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
    category: string;
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
        color: '#404040',
        fontSize: 10,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 5,
    },
    reportInfo: {
        fontSize: 10,
        textAlign: 'center',
        color: '#404040',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#B3B3B3',
        marginVertical: 15,
    },
    summarySection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
        backgroundColor: '#F3F2F9',
        padding: 10,
        borderRadius: 5,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
    },
    summaryLabel: {
        fontSize: 10,
        color: '#404040',
        marginTop: 2,
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#404040',
        padding: 10,
        fontWeight: 'bold',
        fontSize: 10,
        color: 'white',
        alignItems: 'center',
        minHeight: 30,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#B3B3B3',
        padding: 10,
        fontSize: 9,
        backgroundColor: 'white',
        alignItems: 'center',
        minHeight: 40,
    },
    alternateRow: {
        backgroundColor: '#F3F2F9',
    },
    itemName: {
        flex: 3,
        paddingRight: 8,
    },
    currentStock: {
        flex: 1.5,
        textAlign: 'center',
        paddingRight: 8,
    },
    category: {
        flex: 2,
        textAlign: 'center',
        paddingRight: 8,
    },
    status: {
        flex: 2,
        textAlign: 'center',
        paddingRight: 8,
    },
    reorder: {
        flex: 2,
        textAlign: 'center',
    },
    statusChip: {
        padding: 3,
        borderRadius: 3,
        fontSize: 8,
        textAlign: 'center',
    },
    statusAvailable: {
        backgroundColor: '#D1F7D1',
        color: '#23915F',
    },
    statusOutOfStock: {
        backgroundColor: '#FFDDDD',
        color: '#A50000',
    },
    statusLowStock: {
        backgroundColor: '#FFF5C2',
        color: '#85643B',
    },
    statusMaintenance: {
        backgroundColor: '#D6E4FF',
        color: '#0050B3',
    },
    statusExpired: {
        backgroundColor: '#D9D9D9',
        color: 'black',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: '#555',
    },
    pageNumber: {
        position: 'absolute',
        bottom: 20,
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
                        <Text style={reportStyles.currentStock}>Current Stock</Text>
                        <Text style={reportStyles.category}>Category</Text>
                        <Text style={reportStyles.reorder}>Reorder Level</Text>
                        <Text style={reportStyles.status}>Status</Text>
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
                            <Text style={reportStyles.currentStock}>
                                {item.quantity} {item.unit}
                            </Text>
                            <Text style={reportStyles.category}>
                                {item.category}
                            </Text>
                            <Text style={reportStyles.reorder}>
                                {item.reorder}
                            </Text>
                            <View style={reportStyles.status}>
                                <Text style={getStatusStyle(item.status)}>
                                    {formatStatus(item.status)}
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