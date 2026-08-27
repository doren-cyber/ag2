import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { DemandEntry } from '../../types/roster';
import {
  TrendingUp,
  Calendar,
  Building,
  Clock,
  Plus,
  Trash2,
  Calculator,
  CheckCircle2,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { calculateStaffRequirement } from '../../services/rosterEngine';

export const DemandInputModule: React.FC = () => {
  const {
    demandEntries,
    departments,
    shifts,
    staffingNorms,
    selectedDate,
    addDemandEntry,
    deleteDemandEntry,
    setActiveModule,
    setSelectedDepartmentId,
    setSelectedShiftId,
    requestConfirm,
  } = useRoster();

  const [entryDate, setEntryDate] = useState(selectedDate);
  const [deptId, setDeptId] = useState(departments[0]?.id || '');
  const [shiftId, setShiftId] = useState(shifts[0]?.id || '');
  const [demandValue, setDemandValue] = useState<number>(30);
  const [notes, setNotes] = useState('');
  const [recordedBy, setRecordedBy] = useState('Nursing Supervisor / Charge Nurse');

  const selectedDept = departments.find((d) => d.id === deptId);
  const selectedNorm = staffingNorms.find((n) => n.departmentId === deptId && n.active);
  const metricName = selectedNorm?.demandMetric || selectedDept?.defaultDemandMetric || 'Operational Units';

  const requirementCalc = calculateStaffRequirement(demandValue, selectedNorm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (demandValue <= 0) return;

    addDemandEntry({
      date: entryDate,
      departmentId: deptId,
      shiftId,
      demandMetric: metricName,
      demandValue: Number(demandValue),
      notes: notes || undefined,
      recordedBy,
    });

    setNotes('');
  };

  const filteredEntries = demandEntries.filter(
    (d) => d.date === entryDate
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Operational Demand Logging &amp; Real-Time Requirement
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Capture hospital workload telemetry (Occupied Beds, Emergency Footfall, Surgical Cases, Diagnostics) to trigger dynamic staffing ratios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand Entry Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            <TrendingUp className="w-4 h-4 text-[#6C150B]" />
            <h2 className="text-sm font-bold text-slate-900">Record Operational Demand</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operational Date</label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hospital Department</label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
              >
                {departments.filter((d) => d.active).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Shift Window</label>
              <select
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
              >
                {shifts.filter((s) => s.active).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.startTime} - {s.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Workload Value ({metricName}) *
                </label>
                {selectedNorm && (
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200">
                    Norm 1:{selectedNorm.ratio}
                  </span>
                )}
              </div>
              <input
                type="number"
                min="1"
                max="5000"
                required
                value={demandValue}
                onChange={(e) => setDemandValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#6C150B]"
              />
            </div>

            {/* Calculated Requirement Output Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Ceiling Calculation:</span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {demandValue} &divide; {selectedNorm?.ratio || 1} = {requirementCalc.rawCalculated}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-900">Required Staff:</span>
                <span className="text-base font-black text-[#6C150B]">
                  {requirementCalc.roundedRequirement} Staff
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Recorded By</label>
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden text-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operational Notes</label>
              <input
                type="text"
                placeholder="e.g. Surge expected from OPD referrals"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              id="save-demand-btn"
              className="w-full py-2 px-4 text-white font-bold rounded-md shadow-xs transition-colors flex items-center justify-center space-x-2"
              style={{ backgroundColor: '#6C150B' }}
            >
              <Plus className="w-4 h-4" />
              <span>Log Demand &amp; Compute</span>
            </button>
          </form>
        </div>

        {/* Existing Demand Logs for Selected Date */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Logged Demand telemetry ({entryDate})
                </h2>
                <p className="text-xs text-slate-500">
                  Active workload inputs driving dynamic staff calculations.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                {filteredEntries.length} Recorded Entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-left">Department</th>
                    <th className="py-3 px-4 text-left">Shift</th>
                    <th className="py-3 px-4 text-left">Demand Value</th>
                    <th className="py-3 px-4 text-center">Req Staff</th>
                    <th className="py-3 px-4 text-left">Notes &amp; Recorder</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No demand entries logged for {entryDate}. Use the form on the left to add workload.
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => {
                      const dept = departments.find((d) => d.id === entry.departmentId);
                      const shift = shifts.find((s) => s.id === entry.shiftId);
                      const norm = staffingNorms.find((n) => n.departmentId === entry.departmentId && n.active);
                      const req = calculateStaffRequirement(entry.demandValue, norm);

                      return (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {dept?.name || entry.departmentId}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-700">
                              {shift?.name || entry.shiftId}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">
                              {entry.demandValue} {entry.demandMetric}
                            </div>
                            <div className="text-[10px] text-slate-400">Ratio 1:{norm?.ratio || 1}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-sm border border-emerald-200">
                              {req.roundedRequirement} Staff
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-800">{entry.notes || '-'}</div>
                            <div className="text-[10px] text-slate-400">By: {entry.recordedBy}</div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                requestConfirm({
                                  title: 'Delete Demand Log',
                                  message: `Are you sure you want to delete this demand log of ${entry.demandValue} ${entry.demandMetric} for ${dept?.name || entry.departmentId}?`,
                                  confirmLabel: 'Delete Log',
                                  variant: 'danger',
                                  onConfirm: () => deleteDemandEntry(entry.id),
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-sm cursor-pointer"
                              title="Delete demand record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Demand inputs automatically update required headcount in the Dynamic Roster Engine.
            </span>
            <button
              onClick={() => {
                setActiveModule('roster');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-md transition-colors"
              style={{ backgroundColor: '#6C150B' }}
            >
              <span>Go to Dynamic Roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
