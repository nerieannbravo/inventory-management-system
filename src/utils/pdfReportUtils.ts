import { reportStyles, statusColors } from '@/styles/pdfReportStyles';

// Interface for batch data
interface BatchData {
    batch_id: string;
    usable_quantity: number;
    defective_quantity: number;
    missing_quantity: number;
    expiration_date: string | null;
}

// Interface for stock item with batches
interface StockItemWithBatches {
    batches?: BatchData[];
}

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

// Expired count utility function
export const getExpiredBatchCount = (item: StockItemWithBatches): number => {
    if (!item.batches) return 0;
    
    const now = new Date();
    // Set time to 00:00:00 for both dates to compare only the date part
    now.setHours(0, 0, 0, 0);
    
    return item.batches.filter(
        batch => batch.expiration_date && 
            new Date(batch.expiration_date).setHours(0, 0, 0, 0) <= now.getTime()
    ).length;
};

// Enhanced status formatting function that handles expired count
export const formatStockStatusWithExpiredCount = (status: string, item?: StockItemWithBatches): string => {
    if (status === "EXPIRED" && item) {
        const expiredCount = getExpiredBatchCount(item);
        return `${expiredCount} Expired`;
    }
    return formatStockStatus(status);
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

// Bus-specific formatting functions
export const formatBodyBuilder = (builder?: string): string => {
    if (!builder) return "Unknown";
    const upper = ["RBM", "DARJ"];
    return upper.includes(builder.toUpperCase())
        ? builder.toUpperCase()
        : builder.charAt(0).toUpperCase() + builder.slice(1).toLowerCase();
};

export const formatBusCondition = (condition: string): string => {
    switch (condition) {
        case "BRAND_NEW":
        case "brand_new":
            return "Brand New";
        case "SECOND_HAND":
        case "second_hand":
            return "Second Hand";
        default:
            return condition;
    }
};

export const formatBusType = (type?: string): string => {
    if (!type) return "Unknown";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
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
        'DECOMMISIONED': [reportStyles.statusChip, statusColors.decommissioned],
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