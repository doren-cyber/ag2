export type CompetencyLevel = 1 | 2 | 3 | 4 | 5;

export interface Skill {
  id: string;
  name: string;
  category: 'Clinical' | 'Diagnostic' | 'Support' | 'Administrative' | 'General';
  description?: string;
}

export interface EmployeeSkill {
  skillId: string;
  skillName: string;
  competencyLevel: CompetencyLevel; // 1: Awareness, 2: Basic/Supervised, 3: Competent/Independent, 4: Advanced, 5: Expert/Trainer
  certifiedDate?: string;
  expiryDate?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  type: 'Critical Care' | 'Inpatient' | 'Emergency' | 'Surgical' | 'Outpatient' | 'Diagnostic' | 'Support' | 'Administrative';
  headOfDepartment?: string;
  active: boolean;
  defaultDemandMetric?: string;
}

export interface Shift {
  id: string;
  code: string;
  name: string;
  startTime: string; // "07:00"
  endTime: string;   // "15:00"
  durationHours: number; // 8
  isNightShift: boolean;
  color: string;
  active: boolean;
  description?: string;
}

export type Designation = 
  | 'Senior Consultant'
  | 'Junior Resident'
  | 'Nursing Superintendent'
  | 'Head Nurse'
  | 'Senior Staff Nurse'
  | 'Staff Nurse'
  | 'OT Technician'
  | 'ICU Technician'
  | 'Lab Technologist'
  | 'Radiographer'
  | 'Front Desk Executive'
  | 'Patient Care Coordinator'
  | 'Housekeeping Supervisor'
  | 'Housekeeping Attendant'
  | 'Security Officer'
  | 'Security Guard'
  | 'Biomedical Engineer'
  | 'IT Support Specialist';

export interface Employee {
  id: string;
  empCode: string;
  name: string;
  departmentId: string;
  designation: Designation;
  employmentStatus: 'Full-Time' | 'Contract' | 'Probation' | 'Trainee';
  maxWeeklyHours: number; // e.g. 48 hours
  maxDailyHours: number;  // e.g. 8 or 12 hours
  eligibleShiftIds: string[]; // Shift IDs allowed
  skills: EmployeeSkill[];
  joinedDate: string;
  phone: string;
  email: string;
  active: boolean;
  experienceYears: number;
  totalHoursAssignedThisWeek?: number;
  nightShiftsThisMonth?: number;
  weekendShiftsThisMonth?: number;
  consecutiveWorkingDays?: number;
}

export interface StaffingNorm {
  id: string;
  departmentId: string;
  demandMetric: string; // e.g., "Occupied Beds", "OPD Volume", "OT Cases", "Laboratory Tests", "Radiology Scans", "Critical Beds"
  ratio: number; // e.g. 3 (meaning 1 staff per 3 units)
  minStaff: number; // minimum baseline floor regardless of low demand
  maxStaff: number; // cap
  requiredSkillIds?: string[];
  effectiveDate: string;
  active: boolean;
  notes?: string;
}

export interface DemandEntry {
  id: string;
  date: string; // YYYY-MM-DD
  departmentId: string;
  shiftId: string;
  demandMetric: string;
  demandValue: number;
  notes?: string;
  recordedBy?: string;
  recordedAt: string;
}

export type LeaveType = 'Leave' | 'Weekly Off' | 'Medical Leave' | 'Casual Leave' | 'Training / Deputation' | 'Unavailable';
export type LeaveStatus = 'Approved' | 'Pending' | 'Rejected';

export interface LeaveRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // for multi-day leaves
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
}

export interface AssignmentExplanation {
  skillScore: number;
  skillMatchPercentage: number;
  skillDetails: string;
  availabilityStatus: 'Available' | 'Preferred' | 'Neutral';
  currentHoursBeforeAssignment: number;
  projectedHours: number;
  hoursScore: number;
  experienceScore: number;
  shiftBalanceScore: number;
  weeklyOffScore: number;
  overtimeRisk: 'None' | 'Low' | 'Moderate' | 'High';
  totalScore: number;
  summaryReason: string;
}

export interface RosterAssignment {
  id: string;
  date: string;
  departmentId: string;
  shiftId: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  status: 'Draft' | 'Confirmed' | 'Published' | 'Modified';
  assignedBy: string;
  assignedAt: string;
  explanation: AssignmentExplanation;
  overtimeHours?: number;
  notes?: string;
}

export interface ShortageReasonBreakdown {
  reason: 'On Leave' | 'Weekly Off' | 'Shift Ineligible' | 'Max Hours Reached' | 'Skill Mismatch' | 'Already Assigned' | 'Inactive / Other';
  count: number;
  affectedEmployees: { id: string; name: string; detail: string }[];
}

export interface DepartmentRosterSummary {
  date: string;
  departmentId: string;
  departmentName?: string;
  shiftId: string;
  shiftName?: string;
  demandValue: number;
  demandMetric: string;
  normRatio: number;
  requiredStaff: number;
  availableStaff: number;
  eligibleStaff: number;
  allocatedStaff: number;
  shortage: number; // positive = shortage
  surplus: number;  // positive = excess
  status: 'Adequate' | 'Warning' | 'Shortage' | 'Critical';
  shortageReasons: ShortageReasonBreakdown[];
  mitigationSuggestions: string[];
}

export interface ScoringWeights {
  skillMatch: number;          // Default: 40%
  availability: number;        // Default: 20%
  currentWorkingHours: number; // Default: 15% (prefers fewer hours)
  departmentExperience: number;// Default: 10%
  shiftBalance: number;        // Default: 5% (avoids back-to-back night shifts)
  weeklyOffProtection: number; // Default: 5%
  overtimeRisk: number;        // Default: 5%
}

export interface WhatIfScenario {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  baseDemandValue: number;
  simulatedDemandValue: number;
  demandMetric: string;
  shiftId: string;
  extraAbsentStaffIds?: string[];
}

export type UserRole = 'ADMIN' | 'HR' | 'DEPARTMENT_HEAD' | 'ROSTER_MANAGER' | 'VIEW_ONLY';

export interface UserSession {
  role: UserRole;
  userName: string;
  departmentId?: string; // For Dept Head filter
}
