// Define the item structure we use in the UI (flattened per line item)
export interface Item {
  transaction_id: string; // from parent transaction
  item_id: string;
  item_name: string;
  item_unit: string;
  quantity: number;
}

// Fetch all items from the external API (via proxy route)
export async function fetchItems(): Promise<Item[]> {
  try {
    const url = `/api/external-inventory`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch items: ${res.statusText}`);
    }
    const payload = await res.json();
    const transactions: Array<{
      transaction_id: string;
      transaction_date?: string;
      items: Array<{ item_id: string; item_name: string; item_unit: string; quantity: number }>;
    }> = payload.data || [];

    // Flatten the transactions into individual line items, keeping transaction_id on each
    const flattened: Item[] = transactions.flatMap((tx) =>
      (tx.items || []).map((line) => ({
        transaction_id: tx.transaction_id,
        item_id: line.item_id,
        item_name: line.item_name,
        item_unit: line.item_unit,
        quantity: line.quantity,
      }))
    );
    return flattened;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
}

// Fetch a single item by transaction_id (via proxy route)
export async function fetchItemById(transaction_id: string): Promise<Item[] | null> {
  try {
    // Reuse fetchItems to get the flattened list and filter by transaction_id
    const items = await fetchItems();
    const matches = items.filter((it) => it.transaction_id === transaction_id);
    return matches.length ? matches : null;
  } catch (error) {
    console.error(`Error fetching items with transaction_id ${transaction_id}:`, error);
    throw error;
  }
}

// Fetch available items (not yet recorded in local DB)
export async function fetchAvailableItems(): Promise<Item[]> {
  try {
    // Fetch all items from the external API
    const allItems = await fetchItems();

    // Fetch items already in inventory (local DB)
    const inventoryResponse = await fetch('/api/item', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!inventoryResponse.ok) {
      throw new Error(`Error fetching inventory items: ${inventoryResponse.statusText}`);
    }
    const inventoryData = await inventoryResponse.json();
    // We'll assume that each batch in local DB has a f_item_id that matches the external transaction_id
    // If you store transaction_id somewhere else, adjust this accordingly
    const inventoryItems = inventoryData.batches || [];
    const recordedTransactionIds = inventoryItems.map((item: any) => item.f_item_id);

    // Filter out items already in local DB by transaction_id
    const availableItems = allItems.filter((item: Item) => !recordedTransactionIds.includes(item.transaction_id));
    return availableItems;
  } catch (error) {
    console.error('Error in fetchAvailableItems:', error);
    throw error;
  }
}