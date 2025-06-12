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
    formatRequestStatus,
    getRequestStatusStyle,
    formatRequestType
} from '@/utils/pdfReportUtils';
import "@/styles/pdfModal.css";

// Interface definitions
interface RequestItem {
    request_id: string;
    inventoryItem: {
        item_id: string;
        item_name: string;
    };
    emp_id: string;
    empName: string;
    request_type: string;
    quantity: number;
    status: string;
    date_created: string;
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
    const totalRequests = requestData.length;
    const returnedRequests = requestData.filter(request => request.status === 'RETURNED').length;
    const notReturnedRequests = requestData.filter(request => request.status === 'NOT_RETURNED').length;
    const consumedRequests = requestData.filter(request => request.status === 'CONSUMED').length;

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
                        Total Item Requests: {totalRequests}
                    </Text>
                </View>

                {/* Divider */}
                <View style={reportStyles.divider} />

                {/* Summary Section */}
                <View style={reportStyles.summarySection}>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{returnedRequests}</Text>
                        <Text style={reportStyles.summaryLabel}>Returned Items</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{notReturnedRequests}</Text>
                        <Text style={reportStyles.summaryLabel}>Not Returned Items</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{consumedRequests}</Text>
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
                        <Text style={reportStyles.columnSmall}>Quantity</Text>
                        <Text style={reportStyles.columnMedium}>Request Date</Text>
                        <Text style={reportStyles.columnMedium}>Status</Text>
                    </View>

                    {/* Table Rows */}
                    {requestData.map((request, index) => (
                        <View
                            key={request.request_id}
                            style={[
                                reportStyles.tableRow,
                                index % 2 === 1 ? reportStyles.alternateRow : {}
                            ]}
                        >
                            <Text style={reportStyles.columnLarge}>
                                {request.empName}
                            </Text>
                            <Text style={reportStyles.columnMedium}>
                                {formatRequestType(request.request_type)}
                            </Text>
                            <Text style={reportStyles.columnLarge}>
                                {request.inventoryItem.item_name}
                            </Text>
                            <Text style={reportStyles.columnSmall}>
                                {request.quantity}
                            </Text>
                            <Text style={reportStyles.columnMedium}>
                                {request.date_created
                                    ? new Date(request.date_created).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })
                                    : 'N/A'
                                }
                            </Text>
                            <View style={reportStyles.statusContainer}>
                                <Text style={getRequestStatusStyle(request.status)}>
                                    {formatRequestStatus(request.status)}
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
                            fileName={generateFileName('Request')}
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