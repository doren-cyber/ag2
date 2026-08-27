import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Employee,
  Department,
  Shift,
  Skill,
  StaffingNorm,
  DemandEntry,
  LeaveRecord,
  RosterAssignment,
  ScoringWeights,
  UserRole,
  DepartmentRosterSummary,
} from '../types/roster';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_SHIFTS,
  INITIAL_SKILLS,
  INITIAL_STAFFING_NORMS,
  INITIAL_EMPLOYEES,
  INITIAL_LEAVES,
  INITIAL_DEMANDS,
  INITIAL_ASSIGNMENTS,
} from '../data/initialData';
import {
  DEFAULT_WEIGHTS,
  generateDynamicRosterForShift,
  calculateStaffRequirement,
} from '../services/rosterEngine';

interface RosterContextType {
  // Master data
  employees: Employee[];
  departments: Department[];
  shifts: Shift[];
  skills: Skill[];
  staffingNorms: StaffingNorm[];
  demandEntries: DemandEntry[];
  leaves: LeaveRecord[];
  assignments: RosterAssignment[];
  scoringWeights: ScoringWeights;

  // App Navigation & Role
  activeModule: string;
  setActiveModule: (module: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedDepartmentId: string;
  setSelectedDepartmentId: (deptId: string) => void;
  selectedShiftId: string;
  setSelectedShiftId: (shiftId: string) => void;

  // CRUD & State actions
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (id: string, shift: Partial<Shift>) => void;
  deleteShift: (id: string) => void;

  addStaffingNorm: (norm: Omit<StaffingNorm, 'id'>) => void;
  updateStaffingNorm: (id: string, norm: Partial<StaffingNorm>) => void;
  deleteStaffingNorm: (id: string) => void;

  addDemandEntry: (demand: Omit<DemandEntry, 'id' | 'recordedAt'>) => void;
  updateDemandEntry: (id: string, demand: Partial<DemandEntry>) => void;
  deleteDemandEntry: (id: string) => void;

  addLeaveRecord: (leave: Omit<LeaveRecord, 'id' | 'appliedOn'>) => void;
  updateLeaveRecord: (id: string, leave: Partial<LeaveRecord>) => void;
  deleteLeaveRecord: (id: string) => void;

  updateScoringWeights: (weights: Partial<ScoringWeights>) => void;

  // Engine Actions
  runRosterGeneration: (
    targetDate: string,
    targetDeptId: string,
    targetShiftId: string
  ) => {
    generatedCount: number;
    shortageCount: number;
    summaries: DepartmentRosterSummary[];
  };
  runFullHospitalRosterGeneration: (targetDate: string) => {
    generatedCount: number;
    shortageCount: number;
    summaries: DepartmentRosterSummary[];
  };
  clearRoster: (date: string, deptId?: string, shiftId?: string) => void;
  removeAssignment: (assignmentId: string) => void;
  addManualAssignment: (assignment: Omit<RosterAssignment, 'id' | 'assignedAt'>) => void;

  // Summaries & Computations
  getDepartmentSummary: (
    date: string,
    deptId: string,
    shiftId?: string
  ) => DepartmentRosterSummary;
  getAllDepartmentSummaries: (date: string, shiftId?: string) => DepartmentRosterSummary[];

  // Utilities
  resetToDefaults: () => void;
  notification: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissNotification: () => void;

  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  } | null;
  requestConfirm: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }) => void;
  closeConfirm: () => void;
}

const RosterContext = createContext<RosterContextType | undefined>(undefined);

const STORAGE_KEY = 'SHIJA_ROSTER_STATE_V1';

export const RosterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_EMPLOYEES`);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_DEPTS`);
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_SHIFTS`);
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });

  const [skills] = useState<Skill[]>(INITIAL_SKILLS);

  const [staffingNorms, setStaffingNorms] = useState<StaffingNorm[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_NORMS`);
    return saved ? JSON.parse(saved) : INITIAL_STAFFING_NORMS;
  });

  const [demandEntries, setDemandEntries] = useState<DemandEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_DEMANDS`);
    return saved ? JSON.parse(saved) : INITIAL_DEMANDS;
  });

  const [leaves, setLeaves] = useState<LeaveRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_LEAVES`);
    return saved ? JSON.parse(saved) : INITIAL_LEAVES;
  });

  const [assignments, setAssignments] = useState<RosterAssignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ASSIGNMENTS`);
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [scoringWeights, setScoringWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);

  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('ROSTER_MANAGER');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-25');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('ALL');
  const [selectedShiftId, setSelectedShiftId] = useState<string>('ALL');

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  } | null>({
    message: 'Welcome to Shija Hospitals Dynamic Roster System. Core engine is active.',
    type: 'info',
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  } | null>(null);

  const requestConfirm = (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }) => {
    setConfirmDialog({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel || 'Confirm',
      cancelLabel: options.cancelLabel || 'Cancel',
      variant: options.variant || 'danger',
      onConfirm: options.onConfirm,
    });
  };

  const closeConfirm = () => {
    setConfirmDialog(null);
  };

  const showNotification = (
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const dismissNotification = () => setNotification(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_EMPLOYEES`, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_DEPTS`, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_SHIFTS`, JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_NORMS`, JSON.stringify(staffingNorms));
  }, [staffingNorms]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_DEMANDS`, JSON.stringify(demandEntries));
  }, [demandEntries]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_LEAVES`, JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ASSIGNMENTS`, JSON.stringify(assignments));
  }, [assignments]);

  // Employee CRUD
  const addEmployee = (emp: Omit<Employee, 'id'>) => {
    const newId = `EMP-${String(employees.length + 1).padStart(3, '0')}`;
    const newEmp: Employee = { ...emp, id: newId };
    setEmployees((prev) => [newEmp, ...prev]);
    showNotification(`Added employee: ${newEmp.name} (${newEmp.empCode})`, 'success');
  };

  const updateEmployee = (id: string, emp: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...emp } : e)));
    showNotification(`Updated employee records.`, 'success');
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    showNotification(`Employee removed from directory.`, 'warning');
  };

  // Department CRUD
  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newId = `DEP-${dept.code.toUpperCase()}`;
    const newDept: Department = { ...dept, id: newId };
    setDepartments((prev) => [...prev, newDept]);
    showNotification(`Department "${newDept.name}" created.`, 'success');
  };

  const updateDepartment = (id: string, dept: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...dept } : d)));
    showNotification(`Department settings saved.`, 'success');
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    showNotification(`Department removed.`, 'warning');
  };

  // Shift CRUD
  const addShift = (shift: Omit<Shift, 'id'>) => {
    const newId = `SHIFT-${shift.code.toUpperCase()}`;
    const newShift: Shift = { ...shift, id: newId };
    setShifts((prev) => [...prev, newShift]);
    showNotification(`Shift "${newShift.name}" configured.`, 'success');
  };

  const updateShift = (id: string, shift: Partial<Shift>) => {
    setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, ...shift } : s)));
    showNotification(`Shift updated.`, 'success');
  };

  const deleteShift = (id: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== id));
    showNotification(`Shift removed.`, 'warning');
  };

  // Staffing Norms CRUD
  const addStaffingNorm = (norm: Omit<StaffingNorm, 'id'>) => {
    const newId = `NORM-${Date.now()}`;
    const newNorm: StaffingNorm = { ...norm, id: newId };
    setStaffingNorms((prev) => [...prev, newNorm]);
    showNotification(`Staffing Norm added.`, 'success');
  };

  const updateStaffingNorm = (id: string, norm: Partial<StaffingNorm>) => {
    setStaffingNorms((prev) => prev.map((n) => (n.id === id ? { ...n, ...norm } : n)));
    showNotification(`Staffing Norm updated.`, 'success');
  };

  const deleteStaffingNorm = (id: string) => {
    setStaffingNorms((prev) => prev.filter((n) => n.id !== id));
    showNotification(`Staffing norm removed.`, 'warning');
  };

  // Demand Entries CRUD
  const addDemandEntry = (demand: Omit<DemandEntry, 'id' | 'recordedAt'>) => {
    const newId = `DEM-${Date.now()}`;
    const newDemand: DemandEntry = {
      ...demand,
      id: newId,
      recordedAt: new Date().toISOString(),
    };
    setDemandEntries((prev) => [newDemand, ...prev]);
    showNotification(`Demand recorded: ${demand.demandValue} ${demand.demandMetric}`, 'success');
  };

  const updateDemandEntry = (id: string, demand: Partial<DemandEntry>) => {
    setDemandEntries((prev) => prev.map((d) => (d.id === id ? { ...d, ...demand } : d)));
    showNotification(`Demand entry updated.`, 'success');
  };

  const deleteDemandEntry = (id: string) => {
    setDemandEntries((prev) => prev.filter((d) => d.id !== id));
    showNotification(`Demand record deleted.`, 'info');
  };

  // Leave Master CRUD
  const addLeaveRecord = (leave: Omit<LeaveRecord, 'id' | 'appliedOn'>) => {
    const newId = `LEV-${Date.now()}`;
    const newLeave: LeaveRecord = {
      ...leave,
      id: newId,
      appliedOn: new Date().toISOString().split('T')[0],
    };
    setLeaves((prev) => [newLeave, ...prev]);
    showNotification(`Leave / Weekly off logged (${leave.type})`, 'success');
  };

  const updateLeaveRecord = (id: string, leave: Partial<LeaveRecord>) => {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, ...leave } : l)));
    showNotification(`Leave status updated.`, 'success');
  };

  const deleteLeaveRecord = (id: string) => {
    setLeaves((prev) => prev.filter((l) => l.id !== id));
    showNotification(`Leave record removed.`, 'info');
  };

  const updateScoringWeights = (weights: Partial<ScoringWeights>) => {
    setScoringWeights((prev) => ({ ...prev, ...weights }));
    showNotification(`Roster scoring weights adjusted.`, 'info');
  };

  // Single Department & Shift Roster Generation
  const runRosterGeneration = (
    targetDate: string,
    targetDeptId: string,
    targetShiftId: string
  ) => {
    const dept = departments.find((d) => d.id === targetDeptId);
    const shift = shifts.find((s) => s.id === targetShiftId);
    if (!dept || !shift) {
      showNotification('Please select a valid Department and Shift.', 'error');
      return { generatedCount: 0, shortageCount: 0, summaries: [] };
    }

    const norm = staffingNorms.find((n) => n.departmentId === targetDeptId && n.active);
    const demand = demandEntries.find(
      (d) => d.date === targetDate && d.departmentId === targetDeptId && d.shiftId === targetShiftId
    ) || demandEntries.find(
      (d) => d.date === targetDate && d.departmentId === targetDeptId
    );

    const demandVal = demand ? demand.demandValue : 12; // default if not specified

    // Clear existing assignments for this specific date/dept/shift
    const remainingAssignments = assignments.filter(
      (a) => !(a.date === targetDate && a.departmentId === targetDeptId && a.shiftId === targetShiftId)
    );

    const result = generateDynamicRosterForShift(
      targetDate,
      dept,
      shift,
      employees,
      demandVal,
      norm,
      leaves,
      remainingAssignments,
      `Roster Engine (${currentRole})`,
      scoringWeights
    );

    setAssignments([...remainingAssignments, ...result.newAssignments]);

    if (result.summary.shortage > 0) {
      showNotification(
        `Generated ${result.newAssignments.length} assignments. Warning: Staff Shortage of ${result.summary.shortage} detected.`,
        'warning'
      );
    } else {
      showNotification(
        `Successfully generated roster for ${dept.name} (${result.newAssignments.length} staff allocated).`,
        'success'
      );
    }

    return {
      generatedCount: result.newAssignments.length,
      shortageCount: result.summary.shortage,
      summaries: [result.summary],
    };
  };

  // Full Hospital Multi-Department Batch Roster Generation
  const runFullHospitalRosterGeneration = (targetDate: string) => {
    let totalGenerated = 0;
    let totalShortages = 0;
    const summaries: DepartmentRosterSummary[] = [];
    let currentWorkingAssignments = assignments.filter((a) => a.date !== targetDate);

    departments.filter((d) => d.active).forEach((dept) => {
      // Primary shifts for this dept
      const activeShifts = shifts.filter((s) => s.active);
      const defaultShift = activeShifts[0] || shifts[0];

      const norm = staffingNorms.find((n) => n.departmentId === dept.id && n.active);
      const demand = demandEntries.find(
        (d) => d.date === targetDate && d.departmentId === dept.id
      );
      const demandVal = demand ? demand.demandValue : 15;

      const result = generateDynamicRosterForShift(
        targetDate,
        dept,
        defaultShift,
        employees,
        demandVal,
        norm,
        leaves,
        currentWorkingAssignments,
        `Full Hospital Engine (${currentRole})`,
        scoringWeights
      );

      currentWorkingAssignments = [...currentWorkingAssignments, ...result.newAssignments];
      totalGenerated += result.newAssignments.length;
      totalShortages += result.summary.shortage;
      summaries.push(result.summary);
    });

    setAssignments(currentWorkingAssignments);
    showNotification(
      `Full Hospital Roster Generated for ${targetDate}: ${totalGenerated} staff allocated across ${departments.length} departments. Total shortage: ${totalShortages}.`,
      totalShortages > 0 ? 'warning' : 'success'
    );

    return {
      generatedCount: totalGenerated,
      shortageCount: totalShortages,
      summaries,
    };
  };

  const clearRoster = (date: string, deptId?: string, shiftId?: string) => {
    setAssignments((prev) =>
      prev.filter((a) => {
        if (a.date !== date) return true;
        if (deptId && deptId !== 'ALL' && a.departmentId !== deptId) return true;
        if (shiftId && shiftId !== 'ALL' && a.shiftId !== shiftId) return true;
        return false;
      })
    );
    showNotification(`Roster cleared for selected scope (${date}).`, 'info');
  };

  const removeAssignment = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    showNotification(`Staff assignment removed.`, 'info');
  };

  const addManualAssignment = (assignment: Omit<RosterAssignment, 'id' | 'assignedAt'>) => {
    const newAssignment: RosterAssignment = {
      ...assignment,
      id: `ROST-${assignment.date}-${assignment.departmentId}-${assignment.shiftId}-${assignment.employeeId}`,
      assignedAt: new Date().toISOString(),
    };
    setAssignments((prev) => [...prev.filter((a) => a.id !== newAssignment.id), newAssignment]);
    showNotification(`Manual assignment created for ${assignment.employeeName}.`, 'success');
  };

  // Summaries & Computations
  const getDepartmentSummary = (
    date: string,
    deptId: string,
    shiftId?: string
  ): DepartmentRosterSummary => {
    const dept = departments.find((d) => d.id === deptId) || departments[0];
    const targetShift = (shiftId && shiftId !== 'ALL' ? shifts.find((s) => s.id === shiftId) : null) || shifts[0];
    const norm = staffingNorms.find((n) => n.departmentId === deptId && n.active);
    const demand = demandEntries.find(
      (d) => d.date === date && d.departmentId === deptId && (shiftId === 'ALL' || !shiftId || d.shiftId === shiftId)
    ) || demandEntries.find((d) => d.date === date && d.departmentId === deptId);

    const demandVal = demand ? demand.demandValue : (dept.type === 'Critical Care' ? 12 : 30);
    const { roundedRequirement } = calculateStaffRequirement(demandVal, norm);

    const deptEmployees = employees.filter((e) => e.departmentId === deptId && e.active);
    const deptLeaves = leaves.filter(
      (l) => l.date === date && l.status === 'Approved' && deptEmployees.some((e) => e.id === l.employeeId)
    );

    const deptAssignments = assignments.filter(
      (a) => a.date === date && a.departmentId === deptId && (shiftId === 'ALL' || !shiftId || a.shiftId === shiftId)
    );

    const allocatedStaff = deptAssignments.length;
    const availableStaff = deptEmployees.length - deptLeaves.length;
    const shortage = Math.max(0, roundedRequirement - allocatedStaff);
    const surplus = Math.max(0, availableStaff - roundedRequirement);

    let status: DepartmentRosterSummary['status'] = 'Adequate';
    if (shortage >= 3) {
      status = 'Critical';
    } else if (shortage > 0) {
      status = 'Shortage';
    } else if (surplus > 0 || availableStaff > roundedRequirement) {
      status = 'Surplus';
    } else if (availableStaff === roundedRequirement) {
      status = 'Adequate';
    }

    return {
      date,
      departmentId: deptId,
      departmentName: dept?.name || deptId,
      shiftId: targetShift.id,
      shiftName: targetShift.name || targetShift.id,
      demandValue: demandVal,
      demandMetric: norm?.demandMetric || 'Units',
      normRatio: norm?.ratio || 1,
      requiredStaff: roundedRequirement,
      availableStaff,
      eligibleStaff: deptEmployees.filter((e) => !deptLeaves.some((l) => l.employeeId === e.id)).length,
      allocatedStaff,
      shortage,
      surplus,
      status,
      shortageReasons: [
        {
          reason: 'On Leave' as const,
          count: deptLeaves.filter((l) => l.type !== 'Weekly Off').length,
          affectedEmployees: deptLeaves
            .filter((l) => l.type !== 'Weekly Off')
            .map((l) => ({
              id: l.employeeId,
              name: employees.find((e) => e.id === l.employeeId)?.name || l.employeeId,
              detail: `${l.type}: ${l.reason}`,
            })),
        },
        {
          reason: 'Weekly Off' as const,
          count: deptLeaves.filter((l) => l.type === 'Weekly Off').length,
          affectedEmployees: deptLeaves
            .filter((l) => l.type === 'Weekly Off')
            .map((l) => ({
              id: l.employeeId,
              name: employees.find((e) => e.id === l.employeeId)?.name || l.employeeId,
              detail: 'Scheduled weekly off',
            })),
        },
      ].filter((r) => r.count > 0),
      mitigationSuggestions: shortage > 0
        ? [
            'Request floating nurse from Ward/General pool.',
            'Authorize 4-hr OT for available staff in previous shift.',
            'Review pending elective cases or non-critical shifts.',
          ]
        : [],
    };
  };

  const getAllDepartmentSummaries = (date: string, shiftId?: string): DepartmentRosterSummary[] => {
    return departments
      .filter((d) => d.active)
      .map((dept) => getDepartmentSummary(date, dept.id, shiftId));
  };

  const resetToDefaults = () => {
    localStorage.removeItem(`${STORAGE_KEY}_EMPLOYEES`);
    localStorage.removeItem(`${STORAGE_KEY}_DEPTS`);
    localStorage.removeItem(`${STORAGE_KEY}_SHIFTS`);
    localStorage.removeItem(`${STORAGE_KEY}_NORMS`);
    localStorage.removeItem(`${STORAGE_KEY}_DEMANDS`);
    localStorage.removeItem(`${STORAGE_KEY}_LEAVES`);
    localStorage.removeItem(`${STORAGE_KEY}_ASSIGNMENTS`);

    setEmployees(INITIAL_EMPLOYEES);
    setDepartments(INITIAL_DEPARTMENTS);
    setShifts(INITIAL_SHIFTS);
    setStaffingNorms(INITIAL_STAFFING_NORMS);
    setDemandEntries(INITIAL_DEMANDS);
    setLeaves(INITIAL_LEAVES);
    setAssignments(INITIAL_ASSIGNMENTS);
    setScoringWeights(DEFAULT_WEIGHTS);

    showNotification('System database reset to initial Shija Hospitals baseline.', 'info');
  };

  return (
    <RosterContext.Provider
      value={{
        employees,
        departments,
        shifts,
        skills,
        staffingNorms,
        demandEntries,
        leaves,
        assignments,
        scoringWeights,
        activeModule,
        setActiveModule,
        currentRole,
        setCurrentRole,
        selectedDate,
        setSelectedDate,
        selectedDepartmentId,
        setSelectedDepartmentId,
        selectedShiftId,
        setSelectedShiftId,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addShift,
        updateShift,
        deleteShift,
        addStaffingNorm,
        updateStaffingNorm,
        deleteStaffingNorm,
        addDemandEntry,
        updateDemandEntry,
        deleteDemandEntry,
        addLeaveRecord,
        updateLeaveRecord,
        deleteLeaveRecord,
        updateScoringWeights,
        runRosterGeneration,
        runFullHospitalRosterGeneration,
        clearRoster,
        removeAssignment,
        addManualAssignment,
        getDepartmentSummary,
        getAllDepartmentSummaries,
        resetToDefaults,
        notification,
        showNotification,
        dismissNotification,
        confirmDialog,
        requestConfirm,
        closeConfirm,
      }}
    >
      {children}
    </RosterContext.Provider>
  );
};

export const useRoster = (): RosterContextType => {
  const context = useContext(RosterContext);
  if (!context) {
    throw new Error('useRoster must be used within a RosterProvider');
  }
  return context;
};
