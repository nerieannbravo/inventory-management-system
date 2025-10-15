export interface SupplierItemType {
  id?: number;
  itemId?: string; // itemId (string from InventoryItem.itemId)
  itemName?: string;
  unitPrice?: number;
  averageDeliveryTime?: string;
  notes?: string;
}

export interface SupplierType {
  id?: number;
  supplierId?: string;
  supplierName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  status?: string;
  remarks?: string;
  linkedItems?: SupplierItemType[];
}

export interface InventoryItemType {
  itemId?: string;
  itemName?: string;
  unitMeasure?: string;
}
