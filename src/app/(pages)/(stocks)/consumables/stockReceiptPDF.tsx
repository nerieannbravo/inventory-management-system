import React, { useState } from "react";
import { styles } from '@/app/(pages)/(stocks)/consumables/stockReceiptStyles';
import {
    Document,
    Page,
    Text,
    View,
    PDFViewer,
    PDFDownloadLink
} from '@react-pdf/renderer';

import "@/styles/pdfModal.css";

// Interface definitions
interface StockForm {
    name: string;
    quantity: number;
    unit: string;
    price: number;
    usable: number;
    defective: number;
    missing: number;
    reorder: number;
    status: string;
    expiration: string;
}

interface PdfPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    stockForms: StockForm[];
    receiptNumber?: string;
}

// PDF Document Component
const StockReceiptDocument: React.FC<{
    stockForms: StockForm[],
    receiptNumber?: string
}> = ({ stockForms, receiptNumber }) => {

    // Create receipt number if not provided
    const today = new Date();
    const defaultReceiptNo = `INV-${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${today.getFullYear()}-001`;
    const receiptNo = receiptNumber || defaultReceiptNo;

    // Calculate total value
    const totalValue = stockForms.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header Section */}
                <View style={styles.header}>
                    {/* Company Name */}
                    <Text style={styles.companyName}>Agila Bus Transport Corp.</Text>

                    {/* Receipt Title */}
                    <Text style={styles.title}>Stock Additional Receipt</Text>
                    <Text style={styles.dateTime}>
                        {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} {today.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                    </Text>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Information Section */}
                <View style={styles.infoSection}>
                    {/* Reference Number */}
                    <View style={styles.infoColumn}>
                        <Text style={styles.infoLabel}>Reference</Text>
                        <Text style={styles.infoValue}>#{receiptNo}</Text>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.itemName}>Item Name</Text>
                        <Text style={styles.quantity}>Quantity</Text>
                        <Text style={styles.unit}>Unit Measure</Text>
                        <Text style={styles.price}>Unit Price</Text>
                        <Text style={styles.totalPrice}>Total Price</Text>
                    </View>

                    {/* Table Rows */}
                    {stockForms.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.itemName}>
                                {item.name}
                            </Text>
                            <Text style={styles.quantity}>
                                {item.quantity}
                            </Text>
                            <Text style={styles.unit}>
                                {item.unit}
                            </Text>
                            <Text style={styles.price}>
                                Php {item.price.toFixed(2)}
                            </Text>
                            <Text style={styles.totalPrice}>
                                Php {(item.quantity * item.price).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Total */}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Value:</Text>
                    <Text style={styles.totalValue}>Php {totalValue.toFixed(2)}</Text>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    This is an electronically generated receipt. Authorized by Agila Bus Transport Corp.
                </Text>
            </Page>
        </Document>
    );
};

// PDF Preview Modal Component
export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
    isOpen,
    onClose,
    stockForms,
    receiptNumber
}) => {
    if (!isOpen) return null;

    return (
        <div className="pdf-modal-overlay">
            <div className="pdf-modal">
                <div className="pdf-modal-content">
                    <div className="pdf-container">
                        <PDFViewer width="100%" height="100%">
                            <StockReceiptDocument stockForms={stockForms} receiptNumber={receiptNumber} />
                        </PDFViewer>
                    </div>

                    <div className="pdf-modal-actions">
                        <button className="close-btn" onClick={onClose}>Close</button>
                        {/* <PDFDownloadLink
                            document={<StockReceiptDocument stockForms={stockForms} receiptNumber={receiptNumber} />}
                            fileName={`stock-receipt-${new Date().toISOString().slice(0, 10)}.pdf`}
                            className="download-btn"
                        >
                            {({ blob, url, loading, error }) =>
                                loading ?
                                    'Preparing document...' :
                                    <><i className="ri-file-download-line" /> Download PDF</>
                            }
                        </PDFDownloadLink> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Custom hook for PDF preview functionality
export const useStockReceiptPDF = (stockForms: StockForm[]) => {
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [receiptNumber, setReceiptNumber] = useState<string | undefined>(
        `INV-${String(new Date().getDate()).padStart(2, '0')}${String(new Date().getMonth() + 1).padStart(2, '0')}${new Date().getFullYear()}-001`
    );

    const handlePreviewReceipt = () => {
        setShowPdfPreview(true);
    };

    const handleClosePdfPreview = () => {
        setShowPdfPreview(false);
    };

    return {
        showPdfPreview,
        handlePreviewReceipt,
        handleClosePdfPreview,
        receiptNumber,
        setReceiptNumber
    };
};