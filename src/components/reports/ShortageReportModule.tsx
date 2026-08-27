import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { DepartmentRosterSummary } from '../../types/roster';
import {
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Calendar,
  Building,
  ShieldAlert,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { exportRosterToCSV } from '../../utils/exportUtils';

export const ShortageReportModule: React.FC = () => {
  const {
    departments,
    shifts,
    selectedDate,
    setSelectedDate,
    getDepartmentSummary,
    assignments,
    demandEntries,
  } = useRoster();

  const [filterDept, setFilterDept] = useState('ALL');
  const [filterShift, setFilterShift] = useState('ALL');

  // Compute department summaries across all shifts
  const summaries: DepartmentRosterSummary[] = [];

  const targetDepts = filterDept === 'ALL' ? departments : departments.filter((d) => d.id === filterDept);
  const targetShifts = filterShift === 'ALL' ? shifts : shifts.filter((s) => s.id === filterShift);

  targetDepts.forEach((dept) => {
    targetShifts.forEach((shift) => {
      summaries.push(getDepartmentSummary(selectedDate, dept.id, shift.id));
    });
  });

  const totalRequired = summaries.reduce((acc, s) => acc + s.requiredStaff, 0);
  const totalAllocated = summaries.reduce((acc, s) => acc + s.allocatedStaff, 0);
  const totalShortage = summaries.reduce((acc, s) => acc + (s.shortage > 0 ? s.shortage : 0), 0);
  const totalSurplus = summaries.reduce((acc, s) => acc + (s.surplus > 0 ? s.surplus : 0), 0);

  const criticalShortageUnits = summaries.filter((s) => s.status === 'Critical' || s.shortage > 1);

  const handleExportCSV = () => {
    exportRosterToCSV(assignments, departments, shifts, selectedDate);
  };

  const handleExportReportCSV = () => {
    const headers = [
      'Date',
      'Department',
      'Shift',
      'Demand Metric',
      'Demand Value',
      'Staffing Ratio',
      'Required Staff',
      'Allocated Staff',
      'Shortage',
      'Surplus',
      'Status',
    ];

    const rows = summaries.map((s) => [
      s.date,
      `"${s.departmentName || s.departmentId}"`,
      `"${s.shiftName || s.shiftId}"`,
      `"${s.demandMetric}"`,
      s.demandValue,
      `"1:${s.normRatio}"`,
      s.requiredStaff,
      s.allocatedStaff,
      s.shortage,
      s.surplus,
      `"${s.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SHIJA_Staffing_Shortage_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Hospital Staffing Deficit &amp; Surplus Audit
          </h1>
          <p className="text-xs text-slate-500">
            Real-time gap analysis comparing operational demand requirements against active shift roster allocations.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleExportReportCSV}
            className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Deficit CSV</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-white rounded-md transition-colors shadow-2xs"
            style={{ backgroundColor: '#6C150B' }}
          >
            <Download className="w-4 h-4" />
            <span>Export Full Roster CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Staff Required</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalRequired}</div>
          <span className="text-[10px] text-slate-400">Demand-driven ceiling sum</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Allocated</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{totalAllocated}</div>
          <span className="text-[10px] text-slate-400">Confirmed shift assignments</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] text-red-600 font-bold uppercase">Clinical Shortage Deficit</span>
          <div className="text-2xl font-bold text-red-700 mt-1">-{totalShortage}</div>
          <span className="text-[10px] text-red-500 font-medium">Uncovered patient care slots</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Surplus Buffer</span>
          <div className="text-2xl font-bold text-blue-700 mt-1">+{totalSurplus}</div>
          <span className="text-[10px] text-slate-400">Available reserve buffer</span>
        </div>
      </div>

      {/* Clinical Risk Alerts */}
      {criticalShortageUnits.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-2 text-red-900 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-red-700" />
            <span>Priority Administrative Actions Required ({criticalShortageUnits.length} Critical Gaps)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {criticalShortageUnits.map((u, i) => (
              <div key={i} className="bg-white/90 p-2.5 rounded-md border border-red-200 text-slate-800">
                <span className="font-bold text-red-900">
                  {u.departmentName || u.departmentId} &bull; {u.shiftName || u.shiftId}:
                </span>
                <span className="text-red-700 font-semibold ml-1">Deficit of {u.shortage} staff</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Recommendation: Redeploy general reserve nurse pool or approve on-call overtime compensation.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-md text-slate-900 font-semibold focus:outline-hidden"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Department:</span>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-hidden"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Shift:</span>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-hidden"
            >
              <option value="ALL">All Shifts</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-slate-400 text-[11px]">
          Displaying {summaries.length} hospital unit/shift intersections
        </span>
      </div>

      {/* Main Shortage Audit Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">Shift</th>
                <th className="py-3 px-4 text-left">Operational Demand</th>
                <th className="py-3 px-4 text-center">Norm Ratio</th>
                <th className="py-3 px-4 text-center">Req Staff</th>
                <th className="py-3 px-4 text-center">Allocated</th>
                <th className="py-3 px-4 text-center">Variance (Gap)</th>
                <th className="py-3 px-4 text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {summaries.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {s.departmentName || s.departmentId}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {s.shiftName || s.shiftId}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800">
                      {s.demandValue} {s.demandMetric}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-medium text-slate-600">
                    1 : {s.normRatio}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    {s.requiredStaff}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    {s.allocatedStaff}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {s.shortage > 0 ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full font-bold text-xs bg-red-100 text-red-800">
                        -{s.shortage} Short
                      </span>
                    ) : s.surplus > 0 ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full font-semibold text-xs bg-blue-100 text-blue-800">
                        +{s.surplus} Surplus
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full font-semibold text-xs bg-emerald-100 text-emerald-800">
                        Balanced (0)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        s.status === 'Critical'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : s.status === 'Shortage'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : s.status === 'Surplus'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : s.status === 'Warning'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : s.status === 'Adequate'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <span>{s.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
