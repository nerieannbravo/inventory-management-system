// src/components/reports/request/RequestReportPDF.tsx
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
    formatRequestStatus,
    getRequestStatusStyle
} from '@/utils/pdfReportUtils';
import "@/styles/pdfModal.css";

// Interface definitions
interface RequestItem {
    id: number;
    empName: string;
    type: string;
    itemName: string;
    reqDate: string;
    reqStatus: string;
}

interface RequestReportPDFProps {
    isOpen: boolean;
    onClose: () => void;
    requestData: RequestItem[];
    reportTitle?: string;
}

// PDF Document Component
const RequestReportDocument: React.FC<{
    requestData: RequestItem[],
    reportTitle?: string
}> = ({ requestData, reportTitle = "Request Management Report" }) => {

    const today = new Date();

    // Calculate summary statistics
    const totalItems = requestData.length;
    const returnedItems = requestData.filter(item => item.reqStatus === 'returned').length;
    const notReturnedItems = requestData.filter(item => item.reqStatus === 'not-returned').length;
    const consumedItems = requestData.filter(item => item.reqStatus === 'consumed').length;

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
                        Total Item Requests: {totalItems}
                    </Text>
                </View>

                {/* Divider */}
                <View style={reportStyles.divider} />

                {/* Summary Section */}
                <View style={reportStyles.summarySection}>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{returnedItems}</Text>
                        <Text style={reportStyles.summaryLabel}>Returned Items</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{notReturnedItems}</Text>
                        <Text style={reportStyles.summaryLabel}>Not Returned Items</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{consumedItems}</Text>
                        <Text style={reportStyles.summaryLabel}>Consumed Items</Text>
                    </View>
                </View>

                {/* Table */}
                <View style={reportStyles.table}>
                    {/* Table Header */}
                    <View style={reportStyles.tableHeader}>
                        <Text style={reportStyles.columnLarge}>Employee Name</Text>
                        <Text style={reportStyles.columnMedium}>Request Type</Text>
                        <Text style={reportStyles.columnLarge}>Item Name</Text>
                        <Text style={reportStyles.columnMedium}>Request Date</Text>
                        <Text style={reportStyles.columnMedium}>Status</Text>
                    </View>

                    {/* Table Rows */}
                    {requestData.map((item, index) => (
                        <View
                            key={item.id}
                            style={[
                                reportStyles.tableRow,
                                index % 2 === 1 ? reportStyles.alternateRow : {}
                            ]}
                        >
                            <Text style={reportStyles.columnLarge}>
                                {item.empName}
                            </Text>
                            <Text style={reportStyles.columnMedium}>
                                {item.type}
                            </Text>
                            <Text style={reportStyles.columnLarge}>
                                {item.itemName}
                            </Text>
                            <Text style={reportStyles.columnMedium}>
                                {item.reqDate}
                            </Text>
                            <View style={reportStyles.statusContainer}>
                                <Text style={getRequestStatusStyle(item.reqStatus)}>
                                    {formatRequestStatus(item.reqStatus)}
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
export const RequestReportPreviewModal: React.FC<RequestReportPDFProps> = ({
    isOpen,
    onClose,
    requestData,
    reportTitle
}) => {
    if (!isOpen) return null;

    return (
        <div className="pdf-modal-overlay">
            <div className="pdf-modal">
                <div className="pdf-modal-content">
                    <div className="pdf-container">
                        <PDFViewer width="100%" height="100%">
                            <RequestReportDocument
                                requestData={requestData}
                                reportTitle={reportTitle}
                            />
                        </PDFViewer>
                    </div>

                    <div className="pdf-modal-actions">
                        <button className="close-btn" onClick={onClose}>Close</button>
                        <PDFDownloadLink
                            document={
                                <RequestReportDocument
                                    requestData={requestData}
                                    reportTitle={reportTitle}
                                />
                            }
                            fileName={generateFileName('request')}
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

// Custom hook for request report PDF functionality
export const useRequestReportPDF = (requestData: RequestItem[]) => {
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [reportTitle, setReportTitle] = useState("Request Management Report");

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