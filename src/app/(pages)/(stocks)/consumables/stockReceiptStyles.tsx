import { StyleSheet } from '@react-pdf/renderer';

// Define styles for the PDF
export const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginBottom: 10,
        marginTop: 10,
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    title: {
        fontSize: 12,
        fontWeight: 'medium',
        textAlign: 'center',
        marginBottom: 5,
    },
    dateTime: {
        color: '#555',
        fontSize: 10,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    receiptNumber: {
        fontSize: 10,
        marginTop: 5,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginVertical: 10,
    },
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 15,
    },
    infoColumn: {
        flexDirection: 'column',
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    infoValue: {
        fontSize: 12,
        marginBottom: 3,
    },
    table: {
        marginTop: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        padding: 8,
        paddingRight: 8,
        paddingLeft: 8,
        fontWeight: 'bold',
        fontSize: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        padding: 8,
        paddingRight: 8,
        paddingLeft: 8,
        fontSize: 10,
    },
    itemName: {
        flex: 2,
        paddingRight: 8,
        paddingLeft: 8,
    },
    quantity: {
        flex: 1,
        paddingRight: 8,
        paddingLeft: 8,
        textAlign: 'center',
    },
    unit: {
        flex: 1,
        paddingRight: 8,
        paddingLeft: 8,
        textAlign: 'center',
    },
    price: {
        flex: 1,
        paddingRight: 8,
        paddingLeft: 8,
        textAlign: 'right',
    },
    totalPrice: {
        flex: 1,
        paddingRight: 8,
        paddingLeft: 8,
        textAlign: 'right',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        padding: 8,
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        marginRight: 10,
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 'bold',
        width: 70,
        textAlign: 'right',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: '#555',
    }
});