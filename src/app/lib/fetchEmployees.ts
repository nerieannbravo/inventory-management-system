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

// Use env variable
const HR_EMPLOYEES_URL = process.env.HR_EMPLOYEES_URL!;
if (!HR_EMPLOYEES_URL) {
  throw new Error("HR_EMPLOYEES_URL is not defined in .env");
}

export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const res = await fetch(HR_EMPLOYEES_URL, {
      headers: {
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch employees: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data as Employee[];
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
}

export async function fetchEmployeeById(id: string): Promise<Employee | null> {
  try {
    // Use query param instead of hardcoded different base URL
    const url = `${HR_EMPLOYEES_URL}?id=${encodeURIComponent(id)}`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch employee with ID ${id}: ${res.status} ${res.statusText}`);
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
