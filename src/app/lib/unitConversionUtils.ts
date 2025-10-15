/**
 * UNIT CONVERSION HELPER FUNCTIONS
 * 
 * Simple utility functions for converting between supplier and canonical units.
 * These functions are type-safe and don't depend on Prisma client types.
 */

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert quantity from supplier unit to canonical unit (InventoryItem unit)
 * 
 * @param quantityInSupplierUnit - Quantity in supplier's unit
 * @param conversionFactor - Multiplier from supplier unit to canonical unit
 * @returns Quantity in canonical unit (rounded to nearest integer)
 * 
 * @example
 * // Supplier sells in boxes, 1 box = 24 pieces
 * convertToCanonical(5, 24); // Returns: 120 pieces
 */
export function convertToCanonical(
  quantityInSupplierUnit: number,
  conversionFactor: number
): number {
  if (conversionFactor <= 0) {
    throw new Error('Conversion factor must be positive');
  }
  return Math.round(quantityInSupplierUnit * conversionFactor);
}

/**
 * Convert quantity from canonical unit to supplier unit
 * 
 * @param quantityInCanonicalUnit - Quantity in canonical unit
 * @param conversionFactor - Multiplier from supplier unit to canonical unit
 * @returns Quantity in supplier unit (rounded to 2 decimal places)
 * 
 * @example
 * // Need 120 pieces, supplier sells in boxes of 24
 * convertToSupplier(120, 24); // Returns: 5 boxes
 */
export function convertToSupplier(
  quantityInCanonicalUnit: number,
  conversionFactor: number
): number {
  if (conversionFactor <= 0) {
    throw new Error('Conversion factor must be positive');
  }
  return Math.round((quantityInCanonicalUnit / conversionFactor) * 100) / 100;
}

// ============================================================================
// COST CALCULATION
// ============================================================================

/**
 * Calculate total cost for a quantity in supplier units
 * 
 * @param quantityInSupplierUnit - Quantity in supplier's unit
 * @param unitPriceInSupplierUnit - Price per supplier unit
 * @returns Total cost (rounded to 2 decimal places)
 * 
 * @example
 * // Order 5 boxes at ₱300 per box
 * calculateCost(5, 300); // Returns: 1500
 */
export function calculateCost(
  quantityInSupplierUnit: number,
  unitPriceInSupplierUnit: number
): number {
  return Math.round(quantityInSupplierUnit * unitPriceInSupplierUnit * 100) / 100;
}

/**
 * Calculate unit price in canonical unit based on supplier unit price
 * 
 * @param unitPriceInSupplierUnit - Price per supplier unit
 * @param conversionFactor - Multiplier from supplier unit to canonical unit
 * @returns Unit price in canonical unit (rounded to 2 decimal places)
 * 
 * @example
 * // Box costs ₱300, 1 box = 24 pieces
 * calculateCanonicalUnitPrice(300, 24); // Returns: 12.5 (₱12.50 per piece)
 */
export function calculateCanonicalUnitPrice(
  unitPriceInSupplierUnit: number,
  conversionFactor: number
): number {
  if (conversionFactor <= 0) {
    throw new Error('Conversion factor must be positive');
  }
  return Math.round((unitPriceInSupplierUnit / conversionFactor) * 100) / 100;
}

// ============================================================================
// REORDER CALCULATIONS
// ============================================================================

/**
 * Calculate how many supplier units to order to reach reorder level
 * 
 * @param currentStock - Current stock in canonical units
 * @param reorderLevel - Target reorder level in canonical units
 * @param conversionFactor - Multiplier from supplier unit to canonical unit
 * @param roundUp - Whether to round up the order quantity (default: true)
 * @returns Order quantity in supplier units
 * 
 * @example
 * // Current: 100 pieces, Target: 500 pieces, Box = 24 pieces
 * calculateReorderQuantity(100, 500, 24, true); 
 * // Returns: 17 boxes (will receive 408 pieces)
 */
export function calculateReorderQuantity(
  currentStock: number,
  reorderLevel: number,
  conversionFactor: number,
  roundUp: boolean = true
): number {
  const neededInCanonical = Math.max(reorderLevel - currentStock, 0);
  
  if (neededInCanonical === 0) {
    return 0; // No reorder needed
  }

  const neededInSupplierUnit = neededInCanonical / conversionFactor;
  
  return roundUp 
    ? Math.ceil(neededInSupplierUnit) 
    : Math.floor(neededInSupplierUnit);
}

/**
 * Calculate actual quantity that will be received after rounding
 * 
 * @param currentStock - Current stock in canonical units
 * @param reorderLevel - Target reorder level in canonical units
 * @param conversionFactor - Multiplier from supplier unit to canonical unit
 * @returns Object with order details
 * 
 * @example
 * calculateReorderDetails(100, 500, 24);
 * // Returns: {
 * //   neededCanonical: 400,
 * //   orderSupplier: 17,
 * //   willReceiveCanonical: 408,
 * //   excessCanonical: 8
 * // }
 */
export function calculateReorderDetails(
  currentStock: number,
  reorderLevel: number,
  conversionFactor: number
) {
  const neededCanonical = Math.max(reorderLevel - currentStock, 0);
  const orderSupplier = Math.ceil(neededCanonical / conversionFactor);
  const willReceiveCanonical = orderSupplier * conversionFactor;
  const excessCanonical = willReceiveCanonical - neededCanonical;

  return {
    neededCanonical,
    orderSupplier,
    willReceiveCanonical,
    excessCanonical,
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate conversion factor value
 * 
 * @param factor - Conversion factor to validate
 * @returns true if valid, false otherwise
 */
export function validateConversionFactor(factor: number): boolean {
  return typeof factor === 'number' && factor > 0 && factor <= 1000000;
}

/**
 * Validate quantities are non-negative
 */
export function validateQuantity(quantity: number): boolean {
  return typeof quantity === 'number' && quantity >= 0;
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format conversion string for display
 * 
 * @example
 * formatConversion(5, "boxes", 120, "pieces", 24);
 * // Returns: "5 boxes (120 pieces) [×24]"
 */
export function formatConversion(
  supplierQty: number,
  supplierUnit: string,
  canonicalQty: number,
  canonicalUnit: string,
  conversionFactor: number
): string {
  return `${supplierQty} ${supplierUnit} (${canonicalQty} ${canonicalUnit}) [×${conversionFactor}]`;
}

/**
 * Format cost with currency
 */
export function formatCost(amount: number, currency: string = '₱'): string {
  return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ============================================================================
// BATCH CONVERSION UTILITIES
// ============================================================================

/**
 * Convert multiple items with different conversion factors
 * 
 * @param items - Array of items with supplier quantities and conversion factors
 * @returns Array of items with canonical quantities added
 * 
 * @example
 * convertBatch([
 *   { supplierQty: 5, conversionFactor: 24, name: "Water" },
 *   { supplierQty: 10, conversionFactor: 1, name: "Pens" }
 * ]);
 * // Returns: [
 * //   { supplierQty: 5, conversionFactor: 24, name: "Water", canonicalQty: 120 },
 * //   { supplierQty: 10, conversionFactor: 1, name: "Pens", canonicalQty: 10 }
 * // ]
 */
export function convertBatch<T extends { supplierQty: number; conversionFactor: number }>(
  items: T[]
): Array<T & { canonicalQty: number }> {
  return items.map(item => ({
    ...item,
    canonicalQty: convertToCanonical(item.supplierQty, item.conversionFactor),
  }));
}

/**
 * Calculate total canonical quantity from multiple suppliers
 */
export function calculateTotalCanonical(
  items: Array<{ supplierQty: number; conversionFactor: number }>
): number {
  return items.reduce((total, item) => {
    return total + convertToCanonical(item.supplierQty, item.conversionFactor);
  }, 0);
}

// ============================================================================
// COMPARISON UTILITIES
// ============================================================================

/**
 * Compare supplier offers for the same canonical quantity
 * 
 * @param targetCanonical - Target quantity in canonical units
 * @param suppliers - Array of supplier options
 * @returns Sorted array from cheapest to most expensive
 * 
 * @example
 * compareSupplierOffers(400, [
 *   { name: "A", conversionFactor: 24, unitPrice: 300 },
 *   { name: "B", conversionFactor: 1, unitPrice: 15 }
 * ]);
 * // Returns suppliers sorted by total cost for 400 pieces
 */
export function compareSupplierOffers<T extends { 
  conversionFactor: number; 
  unitPrice: number 
}>(
  targetCanonical: number,
  suppliers: T[]
): Array<T & { 
  orderQty: number; 
  willReceive: number; 
  totalCost: number;
  unitPriceCanonical: number;
}> {
  const compared = suppliers.map(supplier => {
    const orderQty = Math.ceil(targetCanonical / supplier.conversionFactor);
    const willReceive = orderQty * supplier.conversionFactor;
    const totalCost = calculateCost(orderQty, supplier.unitPrice);
    const unitPriceCanonical = calculateCanonicalUnitPrice(
      supplier.unitPrice, 
      supplier.conversionFactor
    );

    return {
      ...supplier,
      orderQty,
      willReceive,
      totalCost,
      unitPriceCanonical,
    };
  });

  return compared.sort((a, b) => a.totalCost - b.totalCost);
}

// ============================================================================
// EXAMPLES
// ============================================================================

/**
 * Example usage scenarios
 */
export const examples = {
  /**
   * Example 1: Receive stock from supplier
   */
  receiveStock: () => {
    const supplierQty = 5; // 5 boxes
    const conversionFactor = 24; // 1 box = 24 pieces
    const canonicalQty = convertToCanonical(supplierQty, conversionFactor);
    
    console.log(`Received: ${supplierQty} boxes`);
    console.log(`Converted: ${canonicalQty} pieces`);
    console.log(`Add to currentStock: ${canonicalQty}`);
    
    return canonicalQty; // 120
  },

  /**
   * Example 2: Calculate purchase order
   */
  createPurchaseOrder: () => {
    const currentStock = 100; // pieces
    const reorderLevel = 500; // pieces
    const conversionFactor = 24; // 1 box = 24 pieces
    const unitPrice = 300; // ₱300 per box

    const details = calculateReorderDetails(currentStock, reorderLevel, conversionFactor);
    const totalCost = calculateCost(details.orderSupplier, unitPrice);

    console.log(`Current Stock: ${currentStock} pieces`);
    console.log(`Reorder Level: ${reorderLevel} pieces`);
    console.log(`Needed: ${details.neededCanonical} pieces`);
    console.log(`Order: ${details.orderSupplier} boxes`);
    console.log(`Will Receive: ${details.willReceiveCanonical} pieces`);
    console.log(`Excess: ${details.excessCanonical} pieces`);
    console.log(`Total Cost: ${formatCost(totalCost)}`);

    return details;
  },

  /**
   * Example 3: Compare suppliers
   */
  compareSuppliers: () => {
    const neededPieces = 400;
    
    const suppliers = [
      { name: 'Supplier A', conversionFactor: 24, unitPrice: 300 }, // Boxes
      { name: 'Supplier B', conversionFactor: 1, unitPrice: 15 },   // Pieces
    ];

    const comparison = compareSupplierOffers(neededPieces, suppliers);

    console.log(`Needed: ${neededPieces} pieces\n`);
    
    comparison.forEach((s, i) => {
      console.log(`${i + 1}. ${s.name}`);
      console.log(`   Order: ${s.orderQty} units`);
      console.log(`   Will Receive: ${s.willReceive} pieces`);
      console.log(`   Total Cost: ${formatCost(s.totalCost)}`);
      console.log(`   Unit Price: ${formatCost(s.unitPriceCanonical)}/piece\n`);
    });

    return comparison;
  },
};

// ============================================================================
// TYPE DEFINITIONS FOR API INTEGRATION
// ============================================================================

export interface ConversionInput {
  supplierQuantity: number;
  conversionFactor: number;
  supplierUnit: string;
  canonicalUnit: string;
}

export interface ConversionResult {
  supplierQuantity: number;
  canonicalQuantity: number;
  supplierUnit: string;
  canonicalUnit: string;
  conversionFactor: number;
  formatted: string;
}

export interface ReorderCalculation {
  currentStock: number;
  reorderLevel: number;
  neededCanonical: number;
  orderSupplier: number;
  willReceiveCanonical: number;
  excessCanonical: number;
  estimatedCost: number;
  conversionFactor: number;
}

export interface SupplierComparison {
  supplierId: number;
  supplierName: string;
  orderQuantity: number;
  supplierUnit: string;
  willReceive: number;
  canonicalUnit: string;
  totalCost: number;
  unitPriceInCanonical: number;
  conversionFactor: number;
}
