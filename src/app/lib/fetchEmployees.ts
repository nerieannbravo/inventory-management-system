export interface Employee {
  employeeNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  position: string;
  departmentId: number;
  department: string;
}

export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const url = 'https://hr-api.agilabuscorp.me/employees/inv';
    
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch employees: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
}

export async function fetchEmployeeById(id: string): Promise<Employee | null> {
  try {
    const url = `https://hr-api.agilabuscorp.me/employees/inv/${id}`;
    
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch employee with ID ${id}: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data || data.length === 0) return null;
    const emp = data[0];
    return {
      employeeNumber: emp.employeeNumber,
      firstName: emp.firstName,
      middleName: emp.middleName,
      lastName: emp.lastName,
      phone: emp.phone,
      position: emp.position,
      departmentId: emp.departmentId,
      department: emp.department,
    };
  } catch (error) {
    console.error(`Error fetching employee with ID ${id}:`, error);
    throw error;
  }
}