import React from "react";
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
    formatStockStatusWithExpiredCount,
    getStockStatusStyle
} from '@/utils/pdfReportUtils';
import "@/styles/pdfModal.css";

// Interface definitions
interface StockItem {
    item_id: string;
    item_name: string;
    current_stock: number;
    unit_measure: string;
    status: string;
    category_id: string;
    category: {
        category_id: string;
        category_name: string;
    };
    reorder_level: number;
    date_updated: string;
    batches: {
        batch_id: string;
        usable_quantity: number;
        defective_quantity: number;
        missing_quantity: number;
        expiration_date: string | null;
    }[];
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
    const availableItems = stockData.filter(item => item.status === 'AVAILABLE').length;
    const outOfStockItems = stockData.filter(item => item.status === 'OUT_OF_STOCK').length;
    const lowStockItems = stockData.filter(item => item.status === 'LOW_STOCK').length;
    const maintenanceItems = stockData.filter(item => item.status === 'UNDER_MAINTENANCE').length;
    const expiredItems = stockData.filter(item => item.status === 'EXPIRED').length;

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
                            key={item.item_id}
                            style={[
                                reportStyles.tableRow,
                                index % 2 === 1 ? reportStyles.alternateRow : {}
                            ]}
                        >
                            <Text style={reportStyles.columnLarge}>
                                {item.item_name}
                            </Text>
                            <Text style={reportStyles.columnSmall}>
                                {item.current_stock} {item.unit_measure}
                            </Text>
                            <Text style={reportStyles.columnMedium}>
                                {item.category.category_name}
                            </Text>
                            <Text style={reportStyles.columnMedium}>
                                {item.reorder_level}
                            </Text>
                            <View style={reportStyles.statusContainer}>
                                <Text style={getStockStatusStyle(item.status)}>
                                    {formatStockStatusWithExpiredCount(item.status, item)}
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
                            fileName={generateFileName('Stock')}
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