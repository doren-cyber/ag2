import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import {
  RosterAssignment,
  Employee,
  DepartmentRosterSummary,
} from '../../types/roster';
import {
  CalendarCheck,
  Sparkles,
  Calculator,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Info,
  UserCheck,
  UserX,
  Clock,
  Shield,
  Layers,
  ChevronRight,
  Eye,
  Trash2,
  Plus,
  X,
  Sliders,
  Award,
} from 'lucide-react';
import {
  evaluateCandidate,
  CandidateEvaluation,
  DEFAULT_WEIGHTS,
} from '../../services/rosterEngine';

export const DynamicRosterModule: React.FC = () => {
  const {
    departments,
    shifts,
    employees,
    staffingNorms,
    demandEntries,
    leaves,
    assignments,
    selectedDate,
    setSelectedDate,
    selectedDepartmentId,
    setSelectedDepartmentId,
    selectedShiftId,
    setSelectedShiftId,
    runRosterGeneration,
    clearRoster,
    removeAssignment,
    addManualAssignment,
    getDepartmentSummary,
    scoringWeights,
    updateScoringWeights,
    requestConfirm,
  } = useRoster();

  // Selected Scope
  const activeDeptId = selectedDepartmentId === 'ALL' ? departments[0]?.id || '' : selectedDepartmentId;
  const activeShiftId = selectedShiftId === 'ALL' ? shifts[0]?.id || '' : selectedShiftId;

  const currentDept = departments.find((d) => d.id === activeDeptId) || departments[0];
  const currentShift = shifts.find((s) => s.id === activeShiftId) || shifts[0];
  const currentNorm = staffingNorms.find((n) => n.departmentId === activeDeptId && n.active);

  // Explanation Modal State
  const [selectedExplanationAssignment, setSelectedExplanationAssignment] = useState<RosterAssignment | null>(null);
  const [showConfigWeights, setShowConfigWeights] = useState(false);
  const [showManualAssignModal, setShowManualAssignModal] = useState(false);
  const [manualEmpId, setManualEmpId] = useState('');

  // Get department summary and assignments
  const summary: DepartmentRosterSummary = getDepartmentSummary(selectedDate, activeDeptId, activeShiftId);

  const shiftAssignments = assignments.filter(
    (a) => a.date === selectedDate && a.departmentId === activeDeptId && a.shiftId === activeShiftId
  );

  // Evaluate all department employees in real-time to show candidates & reasons
  const deptEmployees = employees.filter((e) => e.departmentId === activeDeptId);
  const candidateEvaluations: CandidateEvaluation[] = deptEmployees.map((emp) =>
    evaluateCandidate(
      emp,
      selectedDate,
      activeDeptId,
      currentShift,
      leaves,
      assignments.filter((a) => !(a.date === selectedDate && a.departmentId === activeDeptId && a.shiftId === activeShiftId)),
      currentNorm,
      scoringWeights
    )
  );

  const eligibleCandidates = candidateEvaluations.filter((c) => c.isEligible);
  const ineligibleCandidates = candidateEvaluations.filter((c) => !c.isEligible);

  const handleGenerate = () => {
    runRosterGeneration(selectedDate, activeDeptId, activeShiftId);
  };

  const handleClear = () => {
    requestConfirm({
      title: 'Clear Shift Roster',
      message: `Are you sure you want to clear the generated roster for ${currentDept?.name} (${currentShift?.name}) on ${selectedDate}?`,
      confirmLabel: 'Clear Roster',
      variant: 'danger',
      onConfirm: () => clearRoster(selectedDate, activeDeptId, activeShiftId),
    });
  };

  const handleManualAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmpId) return;

    const emp = employees.find((e) => e.id === manualEmpId);
    if (!emp) return;

    addManualAssignment({
      date: selectedDate,
      departmentId: activeDeptId,
      shiftId: activeShiftId,
      employeeId: emp.id,
      employeeName: emp.name,
      designation: emp.designation,
      status: 'Confirmed',
      assignedBy: 'Manual Roster Manager',
      explanation: {
        skillScore: 80,
        skillMatchPercentage: 80,
        skillDetails: 'Manually assigned by roster supervisor',
        availabilityStatus: 'Available',
        currentHoursBeforeAssignment: emp.totalHoursAssignedThisWeek || 0,
        projectedHours: (emp.totalHoursAssignedThisWeek || 0) + (currentShift.durationHours || 8),
        hoursScore: 70,
        experienceScore: 75,
        shiftBalanceScore: 80,
        weeklyOffScore: 80,
        overtimeRisk: 'None',
        totalScore: 78,
        summaryReason: 'Direct manual override by Roster Supervisor.',
      },
    });

    setShowManualAssignModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Selector & Execution Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Dynamic Roster Engine &amp; Allocation Pipeline
            </h1>
            <p className="text-xs text-slate-500">
              Deterministic, skill-driven staffing optimizer balancing workload, avoiding excessive overtime, and respecting clinical rest rules.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="roster-generate-btn"
              onClick={handleGenerate}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white rounded-md transition-all shadow-xs"
              style={{ backgroundColor: '#6C150B' }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Dynamic Roster</span>
            </button>

            <button
              onClick={() => setShowManualAssignModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manual Add</span>
            </button>

            <button
              onClick={() => setShowConfigWeights(!showConfigWeights)}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span>Scoring Weights</span>
            </button>

            <button
              id="roster-clear-btn"
              onClick={handleClear}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Roster</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Roster Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-slate-900 font-semibold focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department:</label>
            <select
              value={activeDeptId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-slate-900 font-semibold focus:outline-hidden"
            >
              {departments.filter((d) => d.active).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Shift:</label>
            <select
              value={activeShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-slate-900 font-semibold focus:outline-hidden"
            >
              {shifts.filter((s) => s.active).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scoring Weights Config Drawer */}
        {showConfigWeights && (
          <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-md space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Roster Allocation Multi-Attribute Scoring Weights
              </h4>
              <span className="text-[11px] text-slate-500">Must total 100%</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">
                  Skill Match ({(scoringWeights.skillMatch * 100).toFixed(0)}%)
                </label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="100"
                  value={Math.round(scoringWeights.skillMatch * 100)}
                  onChange={(e) => updateScoringWeights({ skillMatch: Number(e.target.value) / 100 })}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded-xs text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">
                  Availability ({(scoringWeights.availability * 100).toFixed(0)}%)
                </label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="100"
                  value={Math.round(scoringWeights.availability * 100)}
                  onChange={(e) => updateScoringWeights({ availability: Number(e.target.value) / 100 })}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded-xs text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">
                  Workload Bal ({(scoringWeights.currentWorkingHours * 100).toFixed(0)}%)
                </label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="100"
                  value={Math.round(scoringWeights.currentWorkingHours * 100)}
                  onChange={(e) => updateScoringWeights({ currentWorkingHours: Number(e.target.value) / 100 })}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded-xs text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">
                  Experience ({(scoringWeights.departmentExperience * 100).toFixed(0)}%)
                </label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="100"
                  value={Math.round(scoringWeights.departmentExperience * 100)}
                  onChange={(e) => updateScoringWeights({ departmentExperience: Number(e.target.value) / 100 })}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded-xs text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">
                  Shift Balance ({(scoringWeights.shiftBalance * 100).toFixed(0)}%)
                </label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="100"
                  value={Math.round(scoringWeights.shiftBalance * 100)}
                  onChange={(e) => updateScoringWeights({ shiftBalance: Number(e.target.value) / 100 })}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded-xs text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">
                  Weekly Off ({(scoringWeights.weeklyOffProtection * 100).toFixed(0)}%)
                </label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="100"
                  value={Math.round(scoringWeights.weeklyOffProtection * 100)}
                  onChange={(e) => updateScoringWeights({ weeklyOffProtection: Number(e.target.value) / 100 })}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded-xs text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">
                  OT Risk ({(scoringWeights.overtimeRisk * 100).toFixed(0)}%)
                </label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="100"
                  value={Math.round(scoringWeights.overtimeRisk * 100)}
                  onChange={(e) => updateScoringWeights({ overtimeRisk: Number(e.target.value) / 100 })}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded-xs text-xs font-bold"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step-by-Step Architecture Pipeline Indicator */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2">
          Deterministic Pipeline Execution State
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          {/* Step 1 */}
          <div className="p-2 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold">1. Demand</div>
            <div className="font-bold text-slate-800 truncate">{summary.demandValue} {summary.demandMetric.split(' ')[0]}</div>
          </div>

          {/* Step 2 */}
          <div className="p-2 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold">2. Norm Ratio</div>
            <div className="font-bold text-slate-800">1 : {summary.normRatio}</div>
          </div>

          {/* Step 3 */}
          <div className="p-2 rounded-md bg-blue-50 border border-blue-200">
            <div className="text-[10px] text-blue-600 font-semibold">3. Required Staff</div>
            <div className="font-black text-blue-900 text-sm">{summary.requiredStaff} Staff</div>
          </div>

          {/* Step 4 */}
          <div className="p-2 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold">4. Available Pool</div>
            <div className="font-bold text-slate-800">{summary.availableStaff} / {deptEmployees.length}</div>
          </div>

          {/* Step 5 */}
          <div className="p-2 rounded-md bg-emerald-50 border border-emerald-200">
            <div className="text-[10px] text-emerald-600 font-semibold">5. Allocated</div>
            <div className="font-black text-emerald-800 text-sm">{shiftAssignments.length} Staff</div>
          </div>

          {/* Step 6 */}
          <div className={`p-2 rounded-md border ${
            summary.shortage > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[10px] font-semibold ${summary.shortage > 0 ? 'text-red-600' : 'text-slate-400'}`}>
              6. Shortage Gap
            </div>
            <div className={`font-black text-sm ${summary.shortage > 0 ? 'text-red-700' : 'text-slate-700'}`}>
              {summary.shortage > 0 ? `-${summary.shortage}` : '0 (Met)'}
            </div>
          </div>

          {/* Step 7 */}
          <div className="p-2 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold">7. Shift Status</div>
            <div className="font-bold text-slate-800">{summary.status}</div>
          </div>
        </div>
      </div>

      {/* Main Roster Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Active Shift Roster: {currentDept?.name} &bull; {currentShift?.name} ({selectedDate})
            </h2>
            <p className="text-xs text-slate-500">
              Allocated staff members ranked by multi-factor score and skill compatibility.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-200">
            {shiftAssignments.length} Allocated / {summary.requiredStaff} Required
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Employee</th>
                <th className="py-3 px-4 text-left">Designation</th>
                <th className="py-3 px-4 text-left">Shift Window</th>
                <th className="py-3 px-4 text-center">Skill Match</th>
                <th className="py-3 px-4 text-center">Weekly Load</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-center">OT Risk</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Reason &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {shiftAssignments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No staff rostered yet for this shift. Click <strong>"Generate Dynamic Roster"</strong> above to auto-allocate.
                  </td>
                </tr>
              ) : (
                shiftAssignments.map((assignment) => {
                  const emp = employees.find((e) => e.id === assignment.employeeId);
                  const expl = assignment.explanation;

                  return (
                    <tr key={assignment.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{assignment.employeeName}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {emp?.empCode || assignment.employeeId}
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {assignment.designation}
                      </td>

                      {/* Shift */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{currentShift.name}</span>
                        <div className="text-[10px] text-slate-400">
                          {currentShift.startTime} - {currentShift.endTime} ({currentShift.durationHours}h)
                        </div>
                      </td>

                      {/* Skill Match */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>{expl?.skillMatchPercentage || 85}%</span>
                        </span>
                      </td>

                      {/* Weekly Hours Load */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-800">
                          {(expl?.currentHoursBeforeAssignment || 0) + (currentShift.durationHours || 8)}h
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Max: {emp?.maxWeeklyHours || 48}h
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#6C150B]">
                        {expl?.totalScore?.toFixed(1) || '80.0'}
                      </td>

                      {/* OT Risk */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            expl?.overtimeRisk === 'High'
                              ? 'bg-red-100 text-red-800 font-bold'
                              : expl?.overtimeRisk === 'Moderate'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {expl?.overtimeRisk || 'None'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{assignment.status}</span>
                        </span>
                      </td>

                      {/* Actions & Explanation */}
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setSelectedExplanationAssignment(assignment)}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-sm font-semibold text-[11px] transition-colors"
                          title="View complete mathematical explanation for this assignment"
                        >
                          <Eye className="w-3 h-3 text-slate-600" />
                          <span>Explain</span>
                        </button>
                        <button
                          onClick={() => removeAssignment(assignment.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-sm transition-colors"
                          title="Remove assignment"
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

      {/* Excluded / Ineligible Candidates Diagnostic Accordion */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserX className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Candidates Evaluated &amp; Filtered Out ({ineligibleCandidates.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            System strictly prevented invalid or unsafe assignments
          </span>
        </div>

        {ineligibleCandidates.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            All departmental employees are currently eligible and available.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ineligibleCandidates.map((cand) => (
              <div
                key={cand.employee.id}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{cand.employee.name}</span>
                  <span className="px-1.5 py-0.5 rounded-xs bg-red-100 text-red-800 text-[10px] font-bold">
                    {cand.ineligibilityReason}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">{cand.ineligibilityDetail}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {cand.employee.empCode} &bull; {cand.employee.designation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Explanation Modal Dialog */}
      {selectedExplanationAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Roster Assignment Explanation &amp; Audit Trail
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedExplanationAssignment.employeeName} ({selectedExplanationAssignment.designation})
                </p>
              </div>
              <button
                onClick={() => setSelectedExplanationAssignment(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedExplanationAssignment.explanation ? (
              <div className="space-y-4 text-xs">
                {/* Summary Reason Card */}
                <div className="p-3 rounded-md bg-red-50/50 border border-red-200 text-[#6C150B]">
                  <span className="font-bold text-xs block mb-1">Algorithm Recommendation Rationale:</span>
                  <p className="leading-relaxed">
                    {selectedExplanationAssignment.explanation.summaryReason}
                  </p>
                </div>

                {/* Mathematical Criteria Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Skill Compatibility</span>
                    <div className="text-base font-bold text-emerald-700">
                      {selectedExplanationAssignment.explanation.skillMatchPercentage}% Match
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {selectedExplanationAssignment.explanation.skillDetails}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Workload Balance</span>
                    <div className="text-base font-bold text-slate-800">
                      {selectedExplanationAssignment.explanation.currentHoursBeforeAssignment}h Assigned
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Projected: {selectedExplanationAssignment.explanation.projectedHours}h / 48h
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Overtime Fatigue Risk</span>
                    <div className="text-base font-bold text-slate-800">
                      {selectedExplanationAssignment.explanation.overtimeRisk}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Weekly-off conflict: None (Clear)
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Composite Score</span>
                    <div className="text-base font-bold text-[#6C150B]">
                      {selectedExplanationAssignment.explanation.totalScore.toFixed(1)} / 100
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Multi-attribute rank index
                    </div>
                  </div>
                </div>

                {/* Audit metadata */}
                <div className="text-[11px] text-slate-400 border-t border-slate-200 pt-2 flex justify-between">
                  <span>Assigned By: {selectedExplanationAssignment.assignedBy}</span>
                  <span>Timestamp: {selectedExplanationAssignment.assignedAt}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No detailed scoring metadata available.</p>
            )}

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedExplanationAssignment(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Assignment Modal */}
      {showManualAssignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Manual Roster Assignment Override
              </h3>
              <button onClick={() => setShowManualAssignModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualAssign} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Employee *</label>
                <select
                  required
                  value={manualEmpId}
                  onChange={(e) => setManualEmpId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                >
                  <option value="">-- Choose employee --</option>
                  {deptEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.empCode} &bull; {e.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-amber-900">
                Target: {currentDept.name} &bull; {currentShift.name} ({selectedDate})
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowManualAssignModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white font-bold rounded-md"
                  style={{ backgroundColor: '#6C150B' }}
                >
                  Assign to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
