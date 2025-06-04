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
    empName: {
        flex: 3,
        textAlign: 'center',
        paddingRight: 8,
    },
    reqType: {
        flex: 2,
        textAlign: 'center',
        paddingRight: 8,
    },
    itemName: {
        flex: 3,
        textAlign: 'center',
        paddingRight: 8,
    },
    reqDate: {
        flex: 2,
        textAlign: 'center',
        paddingRight: 8,
    },
    status: {
        flex: 2,
        textAlign: 'center',
    },
    statusChip: {
        padding: 3,
        borderRadius: 3,
        fontSize: 8,
        textAlign: 'center',
    },
    statusReturned: {
        backgroundColor: '#D1F7D1',
        color: '#23915F',
    },
    statusNotReturned: {
        backgroundColor: '#FFDDDD',
        color: '#A50000',
    },
    statusConsumed: {
        backgroundColor: '#D6E4FF',
        color: '#0050B3',
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

    // Format status for display
    const formatStatus = (reqStatus: string) => {
        switch (reqStatus) {
            case "returned":
                return "Returned";
            case "not-returned":
                return "Not Returned";
            case "consumed":
                return "Consumed";
            default:
                return reqStatus;
        }
    };

    // Get status style
    const getStatusStyle = (reqStatus: string) => {
        switch (reqStatus) {
            case "returned":
                return [reportStyles.statusChip, reportStyles.statusReturned];
            case "not-returned":
                return [reportStyles.statusChip, reportStyles.statusNotReturned];
            case "consumed":
                return [reportStyles.statusChip, reportStyles.statusConsumed];
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
                        <Text style={reportStyles.empName}>Employee Name</Text>
                        <Text style={reportStyles.reqType}>Request Type</Text>
                        <Text style={reportStyles.itemName}>Item Name</Text>
                        <Text style={reportStyles.reqDate}>Request Date</Text>
                        <Text style={reportStyles.status}>Status</Text>
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
                            <Text style={reportStyles.empName}>
                                {item.empName}
                            </Text>
                            <Text style={reportStyles.reqType}>
                                {item.type}
                            </Text>
                            <Text style={reportStyles.itemName}>
                                {item.itemName}
                            </Text>
                            <Text style={reportStyles.reqDate}>
                                {item.reqDate}
                            </Text>
                            <View style={reportStyles.status}>
                                <Text style={getStatusStyle(item.reqStatus)}>
                                    {formatStatus(item.reqStatus)}
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

    const generateFileName = () => {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10);
        return `request-report-${dateStr}.pdf`;
    };

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