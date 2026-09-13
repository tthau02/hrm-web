export type Role = 'admin' | 'hr_manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  department?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export type EmployeeStatus = 'active' | 'probation' | 'resigned' | 'on_leave';

export const EmployeeStatusEnum = {
  ACTIVE: 'active',
  PROBATION: 'probation',
  ON_LEAVE: 'on_leave',
  RESIGNED: 'resigned',
} as const;

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  [EmployeeStatusEnum.ACTIVE]: 'Chính thức',
  [EmployeeStatusEnum.PROBATION]: 'Thử việc',
  [EmployeeStatusEnum.ON_LEAVE]: 'Nghỉ phép',
  [EmployeeStatusEnum.RESIGNED]: 'Đã thôi việc',
};

export const EMPLOYEE_STATUS_OPTIONS = [
  { label: EMPLOYEE_STATUS_LABELS[EmployeeStatusEnum.ACTIVE], value: EmployeeStatusEnum.ACTIVE },
  { label: EMPLOYEE_STATUS_LABELS[EmployeeStatusEnum.PROBATION], value: EmployeeStatusEnum.PROBATION },
  { label: EMPLOYEE_STATUS_LABELS[EmployeeStatusEnum.ON_LEAVE], value: EmployeeStatusEnum.ON_LEAVE },
  { label: EMPLOYEE_STATUS_LABELS[EmployeeStatusEnum.RESIGNED], value: EmployeeStatusEnum.RESIGNED },
];

export interface Department {
  id: string;
  name: string;
  code: string;
  managerName: string;
  employeeCount: number;
  description?: string;
}

export interface Employee {
  id: string;
  code: string; // e.g., "EMP001"
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  departmentId: string;
  departmentName: string;
  position: string;
  status: EmployeeStatus;
  salary: number;
  joinDate: string;
  birthDate?: string;
  address?: string;
}

export interface EmployeeFilterParams {
  search?: string;
  departmentId?: string;
  status?: EmployeeStatus | 'all';
  page?: number;
  pageSize?: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'on_time' | 'late' | 'early_leave' | 'absent' | 'leave_approved';
  workHours?: number;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  attendanceToday: number;
  attendanceRate: number;
  turnoverRate: number;
  departmentDistribution: { name: string; value: number }[];
  hiringTrend: { month: string; hires: number; departures: number }[];
  attendanceTrend: { day: string; present: number; absent: number; late: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}
