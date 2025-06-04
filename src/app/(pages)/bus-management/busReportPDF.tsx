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
interface BusItem {
    id: number,
    bodyNumber: string,
    bodyBuilder: string,
    route: string,
    busType: string,
    busStatus: string,
}

interface BusReportPDFProps {
    isOpen: boolean;
    onClose: () => void;
    busData: BusItem[];
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
    bodyNumber: {
        flex: 2,
        textAlign: 'center',
        paddingRight: 8,
    },
    bodyBuilder: {
        flex: 2,
        textAlign: 'center',
        paddingRight: 8,
    },
    route: {
        flex: 3,
        textAlign: 'center',
        paddingRight: 8,
    },
    busType: {
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
    statusActive: {
        backgroundColor: '#D1F7D1',
        color: '#23915F',
    },
    statusDecommissioned: {
        backgroundColor: '#FFDDDD',
        color: '#A50000',
    },
    statusMaintenance: {
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
const BusReportDocument: React.FC<{
    busData: BusItem[],
    reportTitle?: string
}> = ({ busData, reportTitle = "Bus Management Report" }) => {

    const today = new Date();

    // Calculate summary statistics
    const totalBus = busData.length;
    const activeBus = busData.filter(item => item.busStatus === 'active').length;
    const decommissionedBus = busData.filter(item => item.busStatus === 'decommissioned').length;
    const maintenanceBus = busData.filter(item => item.busStatus === 'under-maintenance').length;

    // Format status for display
    const formatStatus = (busStatus: string) => {
        switch (busStatus) {
            case "active":
                return "Active";
            case "decommissioned":
                return "Decommissioned";
            case "under-maintenance":
                return "Under Maintenance";
            default:
                return busStatus;
        }
    };

    // Get status style
    const getStatusStyle = (busStatus: string) => {
        switch (busStatus) {
            case "active":
                return [reportStyles.statusChip, reportStyles.statusActive];
            case "decommissioned":
                return [reportStyles.statusChip, reportStyles.statusDecommissioned];
            case "under-maintenance":
                return [reportStyles.statusChip, reportStyles.statusMaintenance];
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
                        Total Item Requests: {totalBus}
                    </Text>
                </View>

                {/* Divider */}
                <View style={reportStyles.divider} />

                {/* Summary Section */}
                <View style={reportStyles.summarySection}>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{activeBus}</Text>
                        <Text style={reportStyles.summaryLabel}>Active Bus</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{decommissionedBus}</Text>
                        <Text style={reportStyles.summaryLabel}>Decommissioned Bus</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{maintenanceBus}</Text>
                        <Text style={reportStyles.summaryLabel}>Under Maintenance Bus</Text>
                    </View>
                </View>

                {/* Table */}
                <View style={reportStyles.table}>
                    {/* Table Header */}
                    <View style={reportStyles.tableHeader}>
                        <Text style={reportStyles.bodyNumber}>Body Number</Text>
                        <Text style={reportStyles.bodyBuilder}>Body Builder</Text>
                        <Text style={reportStyles.route}>Route</Text>
                        <Text style={reportStyles.busType}>Bus Type</Text>
                        <Text style={reportStyles.status}>Status</Text>
                    </View>

                    {/* Table Rows */}
                    {busData.map((item, index) => (
                        <View
                            key={item.id}
                            style={[
                                reportStyles.tableRow,
                                index % 2 === 1 ? reportStyles.alternateRow : {}
                            ]}
                        >
                            <Text style={reportStyles.bodyNumber}>
                                {item.bodyNumber}
                            </Text>
                            <Text style={reportStyles.bodyBuilder}>
                                {item.bodyBuilder}
                            </Text>
                            <Text style={reportStyles.route}>
                                {item.route}
                            </Text>
                            <Text style={reportStyles.busType}>
                                {item.busType}
                            </Text>
                            <View style={reportStyles.status}>
                                <Text style={getStatusStyle(item.busStatus)}>
                                    {formatStatus(item.busStatus)}
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
export const BusReportPreviewModal: React.FC<BusReportPDFProps> = ({
    isOpen,
    onClose,
    busData,
    reportTitle
}) => {
    if (!isOpen) return null;

    const generateFileName = () => {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10);
        return `bus-report-${dateStr}.pdf`;
    };

    return (
        <div className="pdf-modal-overlay">
            <div className="pdf-modal">
                <div className="pdf-modal-content">
                    <div className="pdf-container">
                        <PDFViewer width="100%" height="100%">
                            <BusReportDocument
                                busData={busData}
                                reportTitle={reportTitle}
                            />
                        </PDFViewer>
                    </div>

                    <div className="pdf-modal-actions">
                        <button className="close-btn" onClick={onClose}>Close</button>
                        <PDFDownloadLink
                            document={
                                <BusReportDocument
                                    busData={busData}
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

// Custom hook for bus report PDF functionality
export const useBusReportPDF = (busData: BusItem[]) => {
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [reportTitle, setReportTitle] = useState("Bus Management Report");

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