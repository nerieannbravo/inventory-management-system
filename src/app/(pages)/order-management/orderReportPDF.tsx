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
    formatOrderStatus,
    getOrderStatusStyle
} from '@/utils/pdfReportUtils';
import "@/styles/pdfModal.css";

// Interface definitions
interface OrderItem {
    id: number;
    refNo: string;
    departmentName: string;
    orderStatus: string;
    dateApproved: string;
    items: {
        isApproved: boolean;
    }[];
}

interface OrderReportPDFProps {
    isOpen: boolean;
    onClose: () => void;
    orderData: OrderItem[];
    reportTitle?: string;
}

// PDF Document Component
const OrderReportDocument: React.FC<{
    orderData: OrderItem[],
    reportTitle?: string
}> = ({ orderData, reportTitle = "Order Management Report" }) => {
    const today = new Date();

    // Calculate summary statistics
    const totalOrders = orderData.length;
    const pendingOrders = orderData.filter(item => item.orderStatus === "PENDING" || item.orderStatus === "pending").length;
    const adjustedOrders = orderData.filter(item => item.orderStatus === "ADJUSTED" || item.orderStatus === "adjusted").length;
    const receivedOrders = orderData.filter(item => item.orderStatus === "RECEIVED" || item.orderStatus === "received").length;
    const partialOrders = orderData.filter(item => item.orderStatus === "PARTIAL" || item.orderStatus === "partial").length;
    const closedOrders = orderData.filter(item => item.orderStatus === "CLOSED" || item.orderStatus === "closed").length;

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
                        Total Orders: {totalOrders}
                    </Text>
                </View>

                {/* Divider */}
                <View style={reportStyles.divider} />

                {/* Summary Section */}
                <View style={reportStyles.summarySection}>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{pendingOrders}</Text>
                        <Text style={reportStyles.summaryLabel}>Pending</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{adjustedOrders}</Text>
                        <Text style={reportStyles.summaryLabel}>Adjusted</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{receivedOrders}</Text>
                        <Text style={reportStyles.summaryLabel}>Received</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{partialOrders}</Text>
                        <Text style={reportStyles.summaryLabel}>Partial</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{closedOrders}</Text>
                        <Text style={reportStyles.summaryLabel}>Closed</Text>
                    </View>
                </View>

                {/* Table */}
                <View style={reportStyles.table}>
                    {/* Table Header */}
                    <View style={reportStyles.tableHeader}>
                        <Text style={reportStyles.columnMedium}>Reference No.</Text>
                        <Text style={reportStyles.columnLarge}>Department</Text>
                        <Text style={reportStyles.columnSmall}>No. of Items</Text>
                        <Text style={reportStyles.columnLarge}>Date Approved</Text>
                        <Text style={reportStyles.columnMedium}>Status</Text>
                    </View>

                    {/* Table Rows */}
                    {orderData.map((item, index) => {
                        const approvedItemsCount = item.items.filter(i => i.isApproved).length;
                        return (
                            <View
                                key={item.id}
                                style={[
                                    reportStyles.tableRow,
                                    index % 2 === 1 ? reportStyles.alternateRow : {}
                                ]}
                            >
                                <Text style={reportStyles.columnMedium}>
                                    {item.refNo}
                                </Text>
                                <Text style={reportStyles.columnLarge}>
                                    {item.departmentName}
                                </Text>
                                <Text style={reportStyles.columnSmall}>
                                    {approvedItemsCount}
                                </Text>
                                <Text style={reportStyles.columnLarge}>
                                    {item.dateApproved}
                                </Text>
                                <View style={reportStyles.statusContainer}>
                                    <Text style={getOrderStatusStyle(item.orderStatus)}>
                                        {formatOrderStatus(item.orderStatus)}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
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
export const OrderReportPreviewModal: React.FC<OrderReportPDFProps> = ({
    isOpen,
    onClose,
    orderData,
    reportTitle
}) => {
    if (!isOpen) return null;

    return (
        <div className="pdf-modal-overlay">
            <div className="pdf-modal">
                <div className="pdf-modal-content">
                    <div className="pdf-container">
                        <PDFViewer width="100%" height="100%">
                            <OrderReportDocument
                                orderData={orderData}
                                reportTitle={reportTitle}
                            />
                        </PDFViewer>
                    </div>

                    <div className="pdf-modal-actions">
                        <button className="close-btn" onClick={onClose}>Close</button>
                        <PDFDownloadLink
                            document={
                                <OrderReportDocument
                                    orderData={orderData}
                                    reportTitle={reportTitle}
                                />
                            }
                            fileName={generateFileName('Order')}
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

// Custom hook for order report PDF functionality
export const useOrderReportPDF = (orderData: OrderItem[]) => {
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [reportTitle, setReportTitle] = useState("Order Management Report");

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