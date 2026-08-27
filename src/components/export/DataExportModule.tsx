import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { ShijaLogo } from '../common/ShijaLogo';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  CheckCircle,
  Building,
  Calendar,
  Users,
  Clock,
  Layers,
} from 'lucide-react';
import {
  exportRosterToCSV,
  exportEmployeesToCSV,
} from '../../utils/exportUtils';

export const DataExportModule: React.FC = () => {
  const {
    departments,
    shifts,
    employees,
    assignments,
    selectedDate,
    setSelectedDate,
  } = useRoster();

  const [printDeptId, setPrintDeptId] = useState(departments[0]?.id || '');
  const [printShiftId, setPrintShiftId] = useState(shifts[0]?.id || '');

  const printDept = departments.find((d) => d.id === printDeptId) || departments[0];
  const printShift = shifts.find((s) => s.id === printShiftId) || shifts[0];

  const printableAssignments = assignments.filter(
    (a) => a.date === selectedDate && a.departmentId === printDeptId && a.shiftId === printShiftId
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (hidden in print) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Data Export &amp; Institutional Print Center
          </h1>
          <p className="text-xs text-slate-500">
            Export structured roster datasets in standard CSV format for Excel/MIS reporting or generate formatted physical shift handover rosters.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white rounded-md transition-all shadow-xs shrink-0"
          style={{ backgroundColor: '#6C150B' }}
        >
          <Printer className="w-4 h-4" />
          <span>Print Shift Handover Sheet</span>
        </button>
      </div>

      {/* Quick Export Cards (hidden in print) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        {/* Export Roster CSV */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-md bg-red-50 text-[#6C150B]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Dynamic Roster Data</h3>
              <p className="text-[11px] text-slate-500">Current date shift allocations</p>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Includes assignment IDs, employee codes, skill match scores, weekly hours, and full decision rationale.
          </p>
          <button
            onClick={() => exportRosterToCSV(assignments, departments, shifts, selectedDate)}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-md text-xs font-semibold text-slate-800 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster (CSV)</span>
          </button>
        </div>

        {/* Export Employee Master CSV */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-md bg-blue-50 text-blue-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Employee Master &amp; Skills</h3>
              <p className="text-[11px] text-slate-500">Complete staff repository</p>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Export all {employees.length} hospital employees with designations, competencies, weekly hours caps, and shift preferences.
          </p>
          <button
            onClick={() => exportEmployeesToCSV(employees, departments)}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-md text-xs font-semibold text-slate-800 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Employees (CSV)</span>
          </button>
        </div>

        {/* Print Configuration Filter */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-800">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Handover Sheet Scope</h3>
              <p className="text-[11px] text-slate-500">Select department &amp; shift</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <select
              value={printDeptId}
              onChange={(e) => setPrintDeptId(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            <select
              value={printShiftId}
              onChange={(e) => setPrintShiftId(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
            >
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Formatted Official Printable Handover Sheet */}
      <div className="bg-white border border-slate-300 rounded-lg p-8 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Official Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6 text-center space-y-1">
          <div className="flex items-center justify-center space-x-3">
            <ShijaLogo size="sm" className="w-10 h-10" />
            <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
              Shija Hospitals &amp; Research Institute Pvt. Ltd.
            </h2>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            HealthCity, Langol, Imphal West, Manipur - 795004 &bull; Clinical Workforce Management Division
          </p>
          <div className="pt-2">
            <span className="inline-block bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-sm border border-slate-300 uppercase tracking-wider">
              Official Shift Duty &amp; Handover Roster
            </span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-md mb-6 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Department / Unit:</span>
            <div className="font-bold text-slate-900">{printDept?.name} ({printDept?.code})</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Roster Date:</span>
            <div className="font-bold text-slate-900">{selectedDate}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Shift &amp; Timings:</span>
            <div className="font-bold text-slate-900">
              {printShift?.name} ({printShift?.startTime} - {printShift?.endTime})
            </div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Total Staff on Duty:</span>
            <div className="font-bold text-emerald-800">{printableAssignments.length} Assigned Staff</div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full divide-y divide-slate-300 text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase">
              <tr>
                <th className="py-2.5 px-3 text-left border-r border-slate-300 w-10">#</th>
                <th className="py-2.5 px-3 text-left border-r border-slate-300">Emp Code</th>
                <th className="py-2.5 px-3 text-left border-r border-slate-300">Staff Full Name</th>
                <th className="py-2.5 px-3 text-left border-r border-slate-300">Designation</th>
                <th className="py-2.5 px-3 text-left border-r border-slate-300">Duty Station / Bed Area</th>
                <th className="py-2.5 px-3 text-left border-r border-slate-300">Handover Status</th>
                <th className="py-2.5 px-3 text-right">Staff Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {printableAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active staff assigned to this shift yet.
                  </td>
                </tr>
              ) : (
                printableAssignments.map((a, idx) => {
                  const emp = employees.find((e) => e.id === a.employeeId);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 border-r border-slate-200">
                        {emp?.empCode || a.employeeId}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                        {a.employeeName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200">
                        {a.designation}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 border-r border-slate-200">
                        Assigned Ward Station
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700 border-r border-slate-200">
                        Confirmed Active
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300 font-mono">
                        ___________________
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Handover Signatures & Verification Block */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-xs">
          <div className="space-y-4">
            <p className="font-bold text-slate-800">Outgoing Shift In-Charge / Nurse Supervisor:</p>
            <div className="pt-6 border-b border-dashed border-slate-400 w-48" />
            <span className="text-[11px] text-slate-500">Signature &amp; Handover Time</span>
          </div>

          <div className="space-y-4 text-right">
            <p className="font-bold text-slate-800">Incoming Shift In-Charge / Head of Department:</p>
            <div className="pt-6 border-b border-dashed border-slate-400 w-48 ml-auto" />
            <span className="text-[11px] text-slate-500">Signature &amp; Acceptance Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};
