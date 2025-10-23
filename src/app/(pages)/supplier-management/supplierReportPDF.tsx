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
    formatItemSupplierStatus,
    getItemSupplierStatusStyle
} from '@/utils/pdfReportUtils';
import "@/styles/pdfModal.css";

// Interface definitions
interface SupplierItem {
    id: number;
    supplierName: string;
    supplierAddress: string;
    supplierContact: string;
    // supplierEmail: string;
    linkedItem: number;
    supplierStatus: string;
}

interface SupplierReportPDFProps {
    isOpen: boolean;
    onClose: () => void;
    supplierData: SupplierItem[];
    reportTitle?: string;
}

// PDF Document Component
const SupplierReportDocument: React.FC<{
    supplierData: SupplierItem[],
    reportTitle?: string
}> = ({ supplierData, reportTitle = "Supplier Management Report" }) => {

    const today = new Date();

    // Calculate summary statistics
    const totalSupplier = supplierData.length;
    const activeSupplier = supplierData.filter(item => item.supplierStatus === 'ACTIVE' || item.supplierStatus === 'active').length;
    const inactiveSupplier = supplierData.filter(item => item.supplierStatus === 'INACTIVE' || item.supplierStatus === 'inactive').length;
    const flaggedSupplier = supplierData.filter(item => item.supplierStatus === 'FLAGGED' || item.supplierStatus === 'flagged').length;
    const blockedSupplier = supplierData.filter(item => item.supplierStatus === 'BLOCKED' || item.supplierStatus === 'blocked').length;

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
                        Total Supplier: {totalSupplier}
                    </Text>
                </View>

                {/* Divider */}
                <View style={reportStyles.divider} />

                {/* Summary Section */}
                <View style={reportStyles.summarySection}>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{activeSupplier}</Text>
                        <Text style={reportStyles.summaryLabel}>Active Supplier</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{inactiveSupplier}</Text>
                        <Text style={reportStyles.summaryLabel}>Inactive Supplier</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{flaggedSupplier}</Text>
                        <Text style={reportStyles.summaryLabel}>Flagged Supplier</Text>
                    </View>
                    <View style={reportStyles.summaryItem}>
                        <Text style={reportStyles.summaryNumber}>{blockedSupplier}</Text>
                        <Text style={reportStyles.summaryLabel}>Blocked Supplier</Text>
                    </View>
                </View>

                {/* Table */}
                <View style={reportStyles.table}>
                    {/* Table Header */}
                    <View style={reportStyles.tableHeader}>
                        <Text style={reportStyles.columnMedium}>Supplier Name</Text>
                        <Text style={reportStyles.columnMedium}>Address</Text>
                        <Text style={reportStyles.columnMedium}>Contact Number</Text>
                        {/* <Text style={reportStyles.columnMedium}>Email</Text> */}
                        <Text style={reportStyles.columnSmall}>Linked Item</Text>
                        <Text style={reportStyles.columnMedium}>Status</Text>
                    </View>

                    {/* Table Rows */}
                    {supplierData.map((item, index) => (
                        <View
                            key={item.id}
                            style={[
                                reportStyles.tableRow,
                                index % 2 === 1 ? reportStyles.alternateRow : {}
                            ]}
                        >
                            <Text style={reportStyles.columnMedium}>
                                {item.supplierName}
                            </Text>
                            <Text style={reportStyles.columnMedium}>
                                {item.supplierAddress}
                            </Text>
                            <Text style={reportStyles.columnMedium}>
                                {item.supplierContact}
                            </Text>
                            {/* <Text style={reportStyles.columnMedium}>
                                {item.supplierEmail}
                            </Text> */}
                            <Text style={reportStyles.columnSmall}>
                                {item.linkedItem}
                            </Text>
                            <View style={reportStyles.statusContainer}>
                                <Text style={getItemSupplierStatusStyle(item.supplierStatus)}>
                                    {formatItemSupplierStatus(item.supplierStatus)}
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
export const SupplierReportPreviewModal: React.FC<SupplierReportPDFProps> = ({
    isOpen,
    onClose,
    supplierData,
    reportTitle
}) => {
    if (!isOpen) return null;

    return (
        <div className="pdf-modal-overlay">
            <div className="pdf-modal">
                <div className="pdf-modal-content">
                    <div className="pdf-container">
                        <PDFViewer width="100%" height="100%">
                            <SupplierReportDocument
                                supplierData={supplierData}
                                reportTitle={reportTitle}
                            />
                        </PDFViewer>
                    </div>

                    <div className="pdf-modal-actions">
                        <button className="close-btn" onClick={onClose}>Close</button>
                        <PDFDownloadLink
                            document={
                                <SupplierReportDocument
                                    supplierData={supplierData}
                                    reportTitle={reportTitle}
                                />
                            }
                            fileName={generateFileName('Supplier')}
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

// Custom hook for supplier report PDF functionality
export const useSupplierReportPDF = (supplierData: SupplierItem[]) => {
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [reportTitle, setReportTitle] = useState("Supplier Management Report");

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