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
    return `${reportType}-report-${dateStr}.pdf`;
};

// Status formatting functions
export const formatStockStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'available': 'Available',
        'out-of-stock': 'Out of Stock',
        'low-stock': 'Low Stock',
        'maintenance': 'Under Maintenance',
        'expired': 'Expired'
    };
    return statusMap[status] || status;
};

export const formatRequestStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'returned': 'Returned',
        'not-returned': 'Not Returned',
        'consumed': 'Consumed'
    };
    return statusMap[status] || status;
};

export const formatOrderStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'approved': 'Approved',
        'pending': 'Pending',
        'completed': 'Completed'
    };
    return statusMap[status] || status;
};

export const formatBusStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'active': 'Active',
        'decommissioned': 'Decommissioned',
        'under-maintenance': 'Under Maintenance'
    };
    return statusMap[status] || status;
};

// Status style functions
export const getStockStatusStyle = (status: string) => {
    const statusStyleMap: Record<string, any> = {
        'available': [reportStyles.statusChip, statusColors.available],
        'out-of-stock': [reportStyles.statusChip, statusColors.outOfStock],
        'low-stock': [reportStyles.statusChip, statusColors.lowStock],
        'maintenance': [reportStyles.statusChip, statusColors.maintenance],
        'expired': [reportStyles.statusChip, statusColors.expired]
    };
    return statusStyleMap[status] || [reportStyles.statusChip];
};

export const getRequestStatusStyle = (status: string) => {
    const statusStyleMap: Record<string, any> = {
        'returned': [reportStyles.statusChip, statusColors.returned],
        'not-returned': [reportStyles.statusChip, statusColors.notReturned],
        'consumed': [reportStyles.statusChip, statusColors.consumed]
    };
    return statusStyleMap[status] || [reportStyles.statusChip];
};

export const getOrderStatusStyle = (status: string) => {
    const statusStyleMap: Record<string, any> = {
        'approved': [reportStyles.statusChip, statusColors.approved],
        'pending': [reportStyles.statusChip, statusColors.pending],
        'completed': [reportStyles.statusChip, statusColors.completed]
    };
    return statusStyleMap[status] || [reportStyles.statusChip];
};

export const getBusStatusStyle = (status: string) => {
    const statusStyleMap: Record<string, any> = {
        'active': [reportStyles.statusChip, statusColors.active],
        'decommissioned': [reportStyles.statusChip, statusColors.decommissioned],
        'under-maintenance': [reportStyles.statusChip, statusColors.underMaintenance]
    };
    return statusStyleMap[status] || [reportStyles.statusChip];
};