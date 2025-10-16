/**
 * @deprecated FTMS Integration Removed
 * 
 * This file was previously used to fetch items from an external FTMS (Finance Tracking Management System).
 * The system has been updated to serve as the primary source for item records.
 * 
 * Use the internal /api/item endpoint instead for all item operations.
 * 
 * FTMS integration has been completely removed from the system.
 */

// Define the item structure we use in the UI (flattened per line item)
export interface Item {
  transaction_id: string; // from parent transaction
  item_id: string;
  item_name: string;
  item_unit: string;
  quantity: number;
}

/**
 * @deprecated Use /api/item GET endpoint instead
 * This function now returns an empty array as FTMS integration is removed.
 */
export async function fetchItems(): Promise<Item[]> {
  console.warn('fetchItems() is deprecated. FTMS integration has been removed. Use /api/item instead.');
  return [];
}

/**
 * @deprecated FTMS integration removed. Use /api/item?itemId={id} instead
 */
export async function fetchItemById(transaction_id: string): Promise<Item[] | null> {
  console.warn('fetchItemById() is deprecated. FTMS integration has been removed. Use /api/item instead.');
  return null;
}

/**
 * @deprecated FTMS integration removed. All items are managed internally now.
 */
export async function fetchAvailableItems(): Promise<Item[]> {
  console.warn('fetchAvailableItems() is deprecated. FTMS integration has been removed. Use /api/item instead.');
  return [];
}