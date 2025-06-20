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
    formatBusStatus,
    getBusStatusStyle
} from '@/utils/pdfReportUtils';
import "@/styles/pdfModal.css";

// Interface definitions
interface BusItem {
    id: number,
    bodyNumber: string,
    bodyBuilder: string,
    // route: string,
    busType: string,
    busStatus: string,
}

interface BusReportPDFProps {
    isOpen: boolean;
    onClose: () => void;
    busData: BusItem[];
    reportTitle?: string;
}

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
                        Total Bus: {totalBus}
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
                        <Text style={reportStyles.columnMedium}>Body Number</Text>
                        <Text style={reportStyles.columnMedium}>Body Builder</Text>
                        <Text style={reportStyles.columnLarge}>Route</Text>
                        <Text style={reportStyles.columnMedium}>Bus Type</Text>
                        <Text style={reportStyles.columnMedium}>Status</Text>
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
                            <Text style={reportStyles.columnMedium}>
                                {item.bodyNumber}
                            </Text>
                            <Text style={reportStyles.columnMedium}>
                                {item.bodyBuilder}
                            </Text>
                            {/* <Text style={reportStyles.columnLarge}>
                                {item.route}
                            </Text> */}
                            <Text style={reportStyles.columnMedium}>
                                {item.busType}
                            </Text>
                            <View style={reportStyles.statusContainer}>
                                <Text style={getBusStatusStyle(item.busStatus)}>
                                    {formatBusStatus(item.busStatus)}
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
                            fileName={generateFileName('bus')}
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