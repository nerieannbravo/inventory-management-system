// Types for disposal API
export interface Bus {
  bus_id: string;
  plate_number: string;
  body_number: string;
  body_builder: string;
  bus_type: string;
  manufacturer: string;
  status: string;
  chasis_number: string;
  engine_number: string;
  seat_capacity: number;
  model: string;
  year_model: number;
  route?: string;
  condition: string;
  acquisition_date: string;
  acquisition_method: string;
  warranty_expiration_date?: string;
  registration_status: string;
  date_created: string;
  date_updated: string;
  created_by: number;
  inventoryItem?: any;
}

export interface BusDisposal {
  disposal_id: string;
  bus_id: string;
  disposal_date: string;
  disposal_method: string;
  reason: string;
  remarks?: string;
  date_created: string;
  date_updated: string;
  created_by: string;
  isdeleted: boolean;
  bus: Bus;
}

export interface StockDisposal {
  disposal_id: string;
  item_id: string;
  batch_id?: string;
  quantity: number;
  disposal_date: string;
  disposal_method: string;
  reason: string;
  remarks?: string;
  date_created: string;
  date_updated: string;
  created_by: string;
  isdeleted: boolean;
  inventoryItem: any;
}

export interface DisposalsResponse {
  success: boolean;
  data: {
    busDisposals: BusDisposal[];
    stockDisposals: StockDisposal[];
  };
}

export interface CreateDisposalRequest {
  type: 'bus' | 'stock';
  bus_id?: string;
  item_id?: string;
  batch_id?: string;
  quantity?: number;
  disposal_date: string;
  disposal_method: string;
  reason: string;
  remarks?: string;
  created_by?: string;
}

export interface UpdateDisposalRequest {
  type: 'bus' | 'stock';
  disposal_id: string;
  remarks?: string;
}

// Fetch all disposals
export async function fetchDisposals(type?: 'bus' | 'stock', status?: string): Promise<DisposalsResponse> {
  try {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);

    const url = `/api/disposal${params.toString() ? `?${params.toString()}` : ''}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch disposals: ${res.statusText}`);
    }

    const data: DisposalsResponse = await res.json();
    
    if (!data.success) {
      throw new Error('Failed to fetch disposals');
    }

    return data;
  } catch (error) {
    console.error('Error fetching disposals:', error);
    throw error;
  }
}

// Create a new disposal
export async function createDisposal(disposalData: CreateDisposalRequest): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch('/api/disposal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(disposalData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Failed to create disposal: ${res.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating disposal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Update disposal
export async function updateDisposal(updateData: UpdateDisposalRequest): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch('/api/disposal', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Failed to update disposal: ${res.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error updating disposal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Delete disposal
export async function deleteDisposal(type: 'bus' | 'stock', disposal_id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const params = new URLSearchParams();
    params.append('type', type);
    params.append('disposal_id', disposal_id);

    const res = await fetch(`/api/disposal?${params.toString()}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Failed to delete disposal: ${res.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error deleting disposal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Fetch available buses for disposal (active buses only)
export async function fetchAvailableBuses(): Promise<Bus[]> {
  try {
    const res = await fetch('/api/bus', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch buses: ${res.statusText}`);
    }

    const data = await res.json();
    
    if (!data.success) {
      throw new Error('Failed to fetch buses');
    }

    // Filter only active buses that are not decommissioned
    return data.buses.filter((bus: Bus) => bus.status === 'ACTIVE');
  } catch (error) {
    console.error('Error fetching available buses:', error);
    throw error;
  }
}