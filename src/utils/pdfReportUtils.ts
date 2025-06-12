import { reportStyles, statusColors } from '@/styles/pdfReportStyles';

// Common formatting functions
export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

export const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
};

export const generateFileName = (reportType: string): string => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    return `${reportType}-Report-${dateStr}.pdf`;
};

// Status formatting functions - Updated to handle original API status format
export const formatStockStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        // Original API format
        'AVAILABLE': 'Available',
        'OUT_OF_STOCK': 'Out of Stock',
        'LOW_STOCK': 'Low Stock',
        'UNDER_MAINTENANCE': 'Under Maintenance',
        'EXPIRED': 'Expired',
    };
    return statusMap[status] || status;
};

export const formatRequestStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'RETURNED': 'Returned',
        'NOT_RETURNED': 'Not Returned',
        'CONSUMED': 'Consumed'
    };
    return statusMap[status] || status;
};

export const formatOrderStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'APRROVED': 'Approved',
        'PENDING': 'Pending',
        'COMPLETED': 'Completed'
    };
    return statusMap[status] || status;
};

export const formatBusStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'ACTIVE': 'Active',
        'DECOMMISSIONED': 'Decommissioned',
        'UNDER_MAINTENANCE': 'Under Maintenance'
    };
    return statusMap[status] || status;
};

// Status style functions - Updated to handle original API status format
export const getStockStatusStyle = (status: string) => {
    const statusStyleMap: Record<string, any> = {
        'AVAILABLE': [reportStyles.statusChip, statusColors.available],
        'OUT_OF_STOCK': [reportStyles.statusChip, statusColors.outOfStock],
        'LOW_STOCK': [reportStyles.statusChip, statusColors.lowStock],
        'UNDER_MAINTENANCE': [reportStyles.statusChip, statusColors.maintenance],
        'EXPIRED': [reportStyles.statusChip, statusColors.expired],
    };
    return statusStyleMap[status] || [reportStyles.statusChip];
};

export const getRequestStatusStyle = (status: string) => {
    const statusStyleMap: Record<string, any> = {
        'RETURNED': [reportStyles.statusChip, statusColors.returned],
        'NOT_RETURNED': [reportStyles.statusChip, statusColors.notReturned],
        'CONSUMED': [reportStyles.statusChip, statusColors.consumed]
    };
    return statusStyleMap[status] || [reportStyles.statusChip];
};

export const getOrderStatusStyle = (status: string) => {
    const statusStyleMap: Record<string, any> = {
        'APPROVED': [reportStyles.statusChip, statusColors.approved],
        'PENDING': [reportStyles.statusChip, statusColors.pending],
        'COMPLETED': [reportStyles.statusChip, statusColors.completed]
    };
    return statusStyleMap[status] || [reportStyles.statusChip];
};

export const getBusStatusStyle = (status: string) => {
    const statusStyleMap: Record<string, any> = {
        'ACTIVE': [reportStyles.statusChip, statusColors.active],
        'DECOMMISSIONED': [reportStyles.statusChip, statusColors.decommissioned],
        'UNDER_MAINTENANCE': [reportStyles.statusChip, statusColors.underMaintenance]
    };
    return statusStyleMap[status] || [reportStyles.statusChip];
};

// Request type formatting
export const formatRequestType = (type: string): string => {
    const statusMap: Record<string, string> = {
        'BORROW': 'Borrow',
        'CONSUME': 'Consume'
    };
    return statusMap[type] || type;
};