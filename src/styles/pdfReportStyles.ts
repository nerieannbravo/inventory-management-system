import { StyleSheet } from '@react-pdf/renderer';

export const reportStyles = StyleSheet.create({
    // Page Layout
    page: {
        padding: 50,
        fontFamily: 'Helvetica',
    },

    // Header Section
    header: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginBottom: 10,
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

    // Divider
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#B3B3B3',
        marginVertical: 15,
    },

    // Summary Section
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

    // Table Layout
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
        minHeight: 30,
    },
    alternateRow: {
        backgroundColor: '#F3F2F9',
    },

    // Common Table Columns
    columnSmall: {
        flex: 1.5,
        textAlign: 'center',
        paddingRight: 8,
    },
    columnMedium: {
        flex: 2,
        textAlign: 'center',
        paddingRight: 8,
    },
    columnLarge: {
        flex: 3,
        textAlign: 'center',
        paddingRight: 8,
    },

    // Status Styles
    statusContainer: {
        flex: 2,
        textAlign: 'center',
    },
    statusChip: {
        padding: 3,
        borderRadius: 3,
        fontSize: 8,
        textAlign: 'center',
    },

    // Footer
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

// Status color schemes
export const statusColors = {
    // Stock Status Colors
    available: {
        backgroundColor: '#D1F7D1',
        color: '#23915F',
    },
    outOfStock: {
        backgroundColor: '#FFDDDD',
        color: '#A50000',
    },
    lowStock: {
        backgroundColor: '#FFF5C2',
        color: '#85643B',
    },
    maintenance: {
        backgroundColor: '#D6E4FF',
        color: '#0050B3',
    },
    expired: {
        backgroundColor: '#D9D9D9',
        color: 'black',
    },

    // Request Status Colors
    returned: {
        backgroundColor: '#D1F7D1',
        color: '#23915F',
    },
    notReturned: {
        backgroundColor: '#FFDDDD',
        color: '#A50000',
    },
    consumed: {
        backgroundColor: '#D6E4FF',
        color: '#0050B3',
    },

    // Order Status Colors
    approved: {
        backgroundColor: '#D1F7D1',
        color: '#23915F',
    },
    pending: {
        backgroundColor: '#FFF5C2',
        color: '#85643B',
    },
    completed: {
        backgroundColor: '#D6E4FF',
        color: '#0050B3',
    },

    // Bus Status Colors
    active: {
        backgroundColor: '#D1F7D1',
        color: '#23915F',
    },
    decommissioned: {
        backgroundColor: '#FFDDDD',
        color: '#A50000',
    },
    underMaintenance: {
        backgroundColor: '#D6E4FF',
        color: '#0050B3',
    },
};