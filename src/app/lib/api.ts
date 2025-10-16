export async function getSuppliers() {
  const res = await fetch('/api/supplier');
  if (!res.ok) throw new Error('Failed to fetch suppliers');
  return res.json();
}

export async function createSupplier(payload: any) {
  const res = await fetch('/api/supplier', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to create supplier');
  return res.json();
}

export async function updateSupplier(payload: any) {
  const res = await fetch('/api/supplier', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to update supplier');
  return res.json();
}

export async function deleteSupplier(payload: any) {
  const res = await fetch('/api/supplier', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to delete supplier');
  return res.json();
}

// Unit Measures
export async function getUnitMeasures() {
  const res = await fetch('/api/unit-measure');
  if (!res.ok) throw new Error('Failed to fetch unit measures');
  return res.json();
}

export async function createUnitMeasure(payload: any) {
  const res = await fetch('/api/unit-measure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to create unit measure');
  return res.json();
}

export async function updateUnitMeasure(payload: any) {
  const res = await fetch('/api/unit-measure', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to update unit measure');
  return res.json();
}

export async function deleteUnitMeasure(payload: any) {
  const res = await fetch('/api/unit-measure', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to delete unit measure');
  return res.json();
}

// Categories
export async function getCategories() {
  const res = await fetch('/api/category');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

// Items
export async function getItems() {
  const res = await fetch('/api/item');
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
}

export async function createItem(payload: any) {
  const res = await fetch('/api/item', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to create item');
  return res.json();
}

export async function updateItem(payload: any) {
  const res = await fetch('/api/item', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to update item');
  return res.json();
}

export async function deleteItem(payload: any) {
  const res = await fetch('/api/item', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to delete item');
  return res.json();
}
