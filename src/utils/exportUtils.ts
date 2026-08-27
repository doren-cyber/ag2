import { RosterAssignment, Department, Shift, Employee, DepartmentRosterSummary } from '../types/roster';

export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportRosterToCSV(
  assignments: RosterAssignment[],
  departments: Department[],
  shifts: Shift[],
  date: string
): void {
  const headers = [
    'Assignment ID',
    'Date',
    'Department Code',
    'Department Name',
    'Shift Code',
    'Shift Name',
    'Shift Timings',
    'Employee Code / ID',
    'Employee Name',
    'Designation',
    'Status',
    'Skill Match %',
    'Total Score',
    'Weekly Hours (Projected)',
    'Assigned By',
    'Assigned At',
    'Reason / Recommendation Rationale',
  ];

  const rows = assignments
    .filter((a) => a.date === date)
    .map((a) => {
      const dept = departments.find((d) => d.id === a.departmentId);
      const shift = shifts.find((s) => s.id === a.shiftId);
      const expl = a.explanation;

      return [
        `"${a.id}"`,
        `"${a.date}"`,
        `"${dept?.code || ''}"`,
        `"${dept?.name || a.departmentId}"`,
        `"${shift?.code || ''}"`,
        `"${shift?.name || a.shiftId}"`,
        `"${shift ? `${shift.startTime}-${shift.endTime}` : ''}"`,
        `"${a.employeeId}"`,
        `"${a.employeeName}"`,
        `"${a.designation}"`,
        `"${a.status}"`,
        expl?.skillMatchPercentage || 85,
        expl?.totalScore?.toFixed(1) || 80,
        expl?.projectedHours || 40,
        `"${a.assignedBy}"`,
        `"${a.assignedAt}"`,
        `"${(expl?.summaryReason || '').replace(/"/g, '""')}"`,
      ];
    });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`SHIJA_Dynamic_Roster_${date}.csv`, csvContent);
}

export function exportEmployeesToCSV(employees: Employee[], departments: Department[]): void {
  const headers = [
    'Employee ID',
    'Employee Code',
    'Name',
    'Department Code',
    'Department Name',
    'Designation',
    'Employment Status',
    'Experience (Years)',
    'Max Weekly Hours',
    'Current Weekly Hours',
    'Eligible Shifts',
    'Competencies / Skills',
    'Active Status',
  ];

  const rows = employees.map((e) => {
    const dept = departments.find((d) => d.id === e.departmentId);
    return [
      `"${e.id}"`,
      `"${e.empCode}"`,
      `"${e.name}"`,
      `"${dept?.code || ''}"`,
      `"${dept?.name || e.departmentId}"`,
      `"${e.designation}"`,
      `"${e.employmentStatus}"`,
      e.experienceYears,
      e.maxWeeklyHours,
      e.totalHoursAssignedThisWeek || 0,
      `"${(e.eligibleShiftIds || []).join('; ')}"`,
      `"${(e.skills || []).map((s) => s.skillName).join('; ')}"`,
      e.active ? 'Active' : 'Inactive',
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`SHIJA_Employee_Master_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
}
