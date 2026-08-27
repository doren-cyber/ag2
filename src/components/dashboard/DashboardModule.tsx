import React from 'react';
import { useRoster } from '../../context/RosterContext';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const {
    employees,
    departments,
    shifts,
    leaves,
    assignments,
    selectedDate,
    getAllDepartmentSummaries,
    runFullHospitalRosterGeneration,
    setActiveModule,
    setSelectedDepartmentId,
  } = useRoster();

  // Metrics computation for selectedDate
  const totalEmployees = employees.length;
  const leavesToday = leaves.filter(
    (l) => l.date === selectedDate && l.status === 'Approved'
  );
  const onLeaveCount = leavesToday.filter((l) => l.type !== 'Weekly Off').length;
  const onWeeklyOffCount = leavesToday.filter((l) => l.type === 'Weekly Off').length;
  const totalAvailable = totalEmployees - leavesToday.length;

  const departmentSummaries = getAllDepartmentSummaries(selectedDate);
  const totalRequired = departmentSummaries.reduce((acc, s) => acc + s.requiredStaff, 0);
  const totalAllocated = departmentSummaries.reduce((acc, s) => acc + s.allocatedStaff, 0);
  const totalShortage = departmentSummaries.reduce((acc, s) => acc + s.shortage, 0);
  const totalSurplus = departmentSummaries.reduce((acc, s) => acc + s.surplus, 0);

  // Overtime risk: employees currently rostered near or over max weekly hours
  const overtimeCount = employees.filter(
    (e) => (e.totalHoursAssignedThisWeek || 0) >= e.maxWeeklyHours - 4
  ).length;

  const handleGenerateFullRoster = () => {
    runFullHospitalRosterGeneration(selectedDate);
  };

  const handleDrilldown = (deptId: string) => {
    setSelectedDepartmentId(deptId);
    setActiveModule('roster');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Hospital Workforce Executive Dashboard
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Date: {selectedDate}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time dynamic staffing demand, constraint-aware allocation, and shortage analysis across all operational units.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="dash-generate-all-btn"
            onClick={handleGenerateFullRoster}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white rounded-md transition-all shadow-xs"
            style={{ backgroundColor: '#6C150B' }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Full Hospital Roster</span>
          </button>

          <button
            id="dash-view-gaps-btn"
            onClick={() => setActiveModule('shortages')}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Gap Analysis ({totalShortage})</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Staff */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Staff</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">{totalEmployees}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active Workforce Pool</div>
        </div>

        {/* Available Staff */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Available</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-700">{totalAvailable}</div>
          <div className="text-[10px] text-emerald-600 font-medium">Ready for duty</div>
        </div>

        {/* On Leave / Off */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">On Leave / Off</span>
            <UserX className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-700">{leavesToday.length}</div>
          <div className="text-[10px] text-slate-500">
            {onLeaveCount} Leave &bull; {onWeeklyOffCount} Off
          </div>
        </div>

        {/* Required Staff */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Required</span>
            <UserPlus className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-blue-900">{totalRequired}</div>
          <div className="text-[10px] text-blue-600 font-medium">From active norms</div>
        </div>

        {/* Allocated Staff */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Allocated</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{totalAllocated}</div>
          <div className="text-[10px] text-slate-500">
            {totalRequired > 0 ? Math.round((totalAllocated / totalRequired) * 100) : 100}% coverage
          </div>
        </div>

        {/* Staff Shortage */}
        <div className={`border rounded-lg p-3 shadow-2xs ${
          totalShortage > 0 ? 'bg-red-50/70 border-red-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Shortage</span>
            <AlertTriangle className={`w-4 h-4 ${totalShortage > 0 ? 'text-red-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl font-bold ${totalShortage > 0 ? 'text-red-700' : 'text-slate-700'}`}>
            {totalShortage}
          </div>
          <div className={`text-[10px] font-medium ${totalShortage > 0 ? 'text-red-600' : 'text-slate-500'}`}>
            {totalShortage > 0 ? 'Action required' : 'No shortages'}
          </div>
        </div>

        {/* Staff Surplus */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Surplus</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-700">{totalSurplus}</div>
          <div className="text-[10px] text-slate-500">Float buffer</div>
        </div>

        {/* Overtime Risk */}
        <div className={`border rounded-lg p-3 shadow-2xs ${
          overtimeCount > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">OT Risk</span>
            <Clock className={`w-4 h-4 ${overtimeCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl font-bold ${overtimeCount > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
            {overtimeCount}
          </div>
          <div className="text-[10px] text-slate-500">&gt;40h this week</div>
        </div>
      </div>

      {/* Department-Level Operational Status Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Department-Level Staffing &amp; Roster Status
            </h2>
            <p className="text-xs text-slate-500">
              Comparison of active demand requirement, available staff pool, allocated roster, and unmet gaps.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-600">Adequate</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-600">Tight / Warning</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span className="text-slate-600">Shortage</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">Operational Demand</th>
                <th className="py-3 px-4 text-center">Required</th>
                <th className="py-3 px-4 text-center">Available</th>
                <th className="py-3 px-4 text-center">Allocated</th>
                <th className="py-3 px-4 text-center">Gap (Shortage)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {departmentSummaries.map((summary) => {
                const dept = departments.find((d) => d.id === summary.departmentId);
                const isShortage = summary.shortage > 0;
                const isTight = summary.availableStaff === summary.requiredStaff && !isShortage;

                return (
                  <tr key={summary.departmentId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{dept?.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {dept?.code} &bull; {dept?.type}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {summary.demandValue} {summary.demandMetric}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Norm Ratio 1:{summary.normRatio}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-800 text-sm">
                      {summary.requiredStaff}
                    </td>

                    <td className="py-3 px-4 text-center font-semibold text-slate-700 text-sm">
                      {summary.availableStaff}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-emerald-700 text-sm">
                      {summary.allocatedStaff}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isShortage ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                          -{summary.shortage}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          0
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isShortage ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span>Shortage</span>
                        </span>
                      ) : isTight ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                          <span>Warning (Tight)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Adequate</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDrilldown(summary.departmentId)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-[#6C150B] hover:bg-red-50 rounded-md border border-red-200 transition-colors"
                        title="Open Dynamic Roster for this department"
                      >
                        <span>Manage Roster</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Explanatory Architecture Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-[#6C150B] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-800 mb-1">
            Dynamic Roster Pipeline Logic: Demand &rarr; Norms &rarr; Availability &rarr; Scoring &rarr; Fair Allocation
          </h4>
          <p className="leading-relaxed">
            The roster engine executes deterministic eligibility verification (active status, department match, certified shift eligibility, approved leaves, weekly offs, and weekly hour caps) followed by multi-attribute scoring (Skill Competency 40%, Availability 20%, Workload Balance 15%, Experience 10%, Shift Balance 5%, Weekly-Off Protection 5%, Overtime Risk 5%).
          </p>
        </div>
      </div>
    </div>
  );
};
