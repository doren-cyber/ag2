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
  Search,
  Filter,
  Edit2,
  ArrowRightLeft,
  Building,
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
    updateAssignment,
    addManualAssignment,
    getDepartmentSummary,
    scoringWeights,
    updateScoringWeights,
    requestConfirm,
    showNotification,
  } = useRoster();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartmentId, setFilterDepartmentId] = useState<string>('CURRENT');
  const [filterShiftId, setFilterShiftId] = useState<string>('CURRENT');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Selected Scope for Engine Generation & Calculator
  const activeDeptId = selectedDepartmentId === 'ALL' ? departments[0]?.id || '' : selectedDepartmentId;
  const activeShiftId = selectedShiftId === 'ALL' ? shifts[0]?.id || '' : selectedShiftId;

  const currentDept = departments.find((d) => d.id === activeDeptId) || departments[0];
  const currentShift = shifts.find((s) => s.id === activeShiftId) || shifts[0];
  const currentNorm = staffingNorms.find((n) => n.departmentId === activeDeptId && n.active);

  // Modal States
  const [selectedExplanationAssignment, setSelectedExplanationAssignment] = useState<RosterAssignment | null>(null);
  const [showConfigWeights, setShowConfigWeights] = useState(false);
  const [showManualAssignModal, setShowManualAssignModal] = useState(false);
  const [manualEmpId, setManualEmpId] = useState('');

  // Edit Assignment Modal State
  const [editingAssignment, setEditingAssignment] = useState<RosterAssignment | null>(null);
  const [editForm, setEditForm] = useState<{
    departmentId: string;
    shiftId: string;
    status: 'Confirmed' | 'Draft' | 'Published' | 'Modified';
    notes: string;
    swapEmployeeId: string;
  }>({
    departmentId: '',
    shiftId: '',
    status: 'Confirmed',
    notes: '',
    swapEmployeeId: '',
  });

  // Get department summary for the active focus department & shift
  const summary: DepartmentRosterSummary = getDepartmentSummary(selectedDate, activeDeptId, activeShiftId);

  // Determine effective filter values for the assignments list
  const effectiveDeptFilter = filterDepartmentId === 'CURRENT' ? activeDeptId : filterDepartmentId;
  const effectiveShiftFilter = filterShiftId === 'CURRENT' ? activeShiftId : filterShiftId;

  // Filter assignments based on search, department, shift, and status
  const allDateAssignments = assignments.filter((a) => a.date === selectedDate);

  const displayedAssignments = allDateAssignments.filter((assignment) => {
    // Department Filter
    if (effectiveDeptFilter !== 'ALL' && assignment.departmentId !== effectiveDeptFilter) {
      return false;
    }
    // Shift Filter
    if (effectiveShiftFilter !== 'ALL' && assignment.shiftId !== effectiveShiftFilter) {
      return false;
    }
    // Status Filter
    if (filterStatus !== 'ALL' && assignment.status !== filterStatus) {
      return false;
    }
    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const emp = employees.find((e) => e.id === assignment.employeeId);
      const dept = departments.find((d) => d.id === assignment.departmentId);
      const sh = shifts.find((s) => s.id === assignment.shiftId);

      const nameMatch = assignment.employeeName.toLowerCase().includes(q);
      const codeMatch = emp?.empCode.toLowerCase().includes(q) || false;
      const desigMatch = assignment.designation.toLowerCase().includes(q);
      const deptMatch = dept?.name.toLowerCase().includes(q) || dept?.code.toLowerCase().includes(q) || false;
      const shiftMatch = sh?.name.toLowerCase().includes(q) || sh?.code.toLowerCase().includes(q) || false;
      const reasonMatch = assignment.explanation?.summaryReason?.toLowerCase().includes(q) || false;

      return nameMatch || codeMatch || desigMatch || deptMatch || shiftMatch || reasonMatch;
    }

    return true;
  });

  // Shift assignments strictly matching active dept & shift for count badges
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

    setManualEmpId('');
    setShowManualAssignModal(false);
  };

  // Open Edit Modal for an assignment
  const handleOpenEdit = (assignment: RosterAssignment) => {
    setEditingAssignment(assignment);
    setEditForm({
      departmentId: assignment.departmentId,
      shiftId: assignment.shiftId,
      status: (assignment.status as any) || 'Confirmed',
      notes: assignment.explanation?.summaryReason || '',
      swapEmployeeId: '',
    });
  };

  // Save Assignment Updates
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    const targetShift = shifts.find((s) => s.id === editForm.shiftId) || currentShift;
    const targetDept = departments.find((d) => d.id === editForm.departmentId) || currentDept;

    // Check if swap is requested
    if (editForm.swapEmployeeId) {
      const swapEmp = employees.find((e) => e.id === editForm.swapEmployeeId);
      if (swapEmp) {
        updateAssignment(editingAssignment.id, {
          departmentId: editForm.departmentId,
          shiftId: editForm.shiftId,
          employeeId: swapEmp.id,
          employeeName: swapEmp.name,
          designation: swapEmp.designation,
          status: editForm.status,
          assignedBy: 'Supervisor Reassignment',
          explanation: {
            ...editingAssignment.explanation,
            summaryReason: editForm.notes || `Reassigned / swapped to ${swapEmp.name} by supervisor.`,
          },
        });
        setEditingAssignment(null);
        return;
      }
    }

    // Standard update
    updateAssignment(editingAssignment.id, {
      departmentId: editForm.departmentId,
      shiftId: editForm.shiftId,
      status: editForm.status,
      assignedBy: 'Supervisor Modification',
      explanation: {
        ...editingAssignment.explanation,
        summaryReason: editForm.notes || `Modified shift/status to ${targetShift.name} (${editForm.status}).`,
      },
    });

    setEditingAssignment(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Selector & Execution Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Dynamic Roster Engine &amp; Allocation Pipeline
            </h1>
            <p className="text-xs text-slate-500">
              Deterministic, skill-driven staffing optimizer balancing workload, avoiding excessive overtime, and respecting clinical rest rules.
            </p>
          </div>

          {/* Action Buttons: Responsive Grid / Row */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <button
              id="roster-generate-btn"
              onClick={handleGenerate}
              className="col-span-2 sm:col-span-1 flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-2 text-xs font-bold text-white rounded-md transition-all shadow-xs cursor-pointer hover:opacity-90"
              style={{ backgroundColor: '#6C150B' }}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Generate Dynamic Roster</span>
            </button>

            <button
              id="roster-manual-add-btn"
              onClick={() => setShowManualAssignModal(true)}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Manual Add</span>
            </button>

            <button
              id="roster-scoring-weights-btn"
              onClick={() => setShowConfigWeights(!showConfigWeights)}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Weights</span>
            </button>

            <button
              id="roster-clear-btn"
              onClick={handleClear}
              className="col-span-2 sm:col-span-1 flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Clear Roster</span>
            </button>
          </div>
        </div>

        {/* Primary Operational Scope Row */}
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
            <label className="block font-semibold text-slate-700 mb-1">Primary Department:</label>
            <select
              value={activeDeptId}
              onChange={(e) => {
                setSelectedDepartmentId(e.target.value);
                if (filterDepartmentId === 'CURRENT') {
                  // Keep aligned
                }
              }}
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
            <label className="block font-semibold text-slate-700 mb-1">Shift Target:</label>
            <select
              value={activeShiftId}
              onChange={(e) => {
                setSelectedShiftId(e.target.value);
                if (filterShiftId === 'CURRENT') {
                  // Keep aligned
                }
              }}
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
                  Overtime Risk ({(scoringWeights.overtimeRisk * 100).toFixed(0)}%)
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

              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">
                  Dept Exp ({(scoringWeights.departmentExperience * 100).toFixed(0)}%)
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
                  Shift Bal ({(scoringWeights.shiftBalance * 100).toFixed(0)}%)
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
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => updateScoringWeights(DEFAULT_WEIGHTS)}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline"
              >
                Reset to Standard Hospital Defaults
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Staffing Requirement Step-by-Step Diagnostic Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-[#6C150B]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Deterministic Staffing Computation &amp; Clinical Norm Audit
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">
            {currentDept.name} &bull; {currentShift.name} ({currentShift.startTime} - {currentShift.endTime})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {/* Step 1 */}
          <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold">1. Operational Demand</div>
            <div className="font-bold text-slate-900">
              {summary.demandValue} <span className="text-[11px] font-normal text-slate-500">{summary.demandMetric}</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold">2. Approved Norm Ratio</div>
            <div className="font-bold text-slate-900">
              1 Staff : {summary.normRatio} {summary.demandMetric}
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold">3. Required Staff</div>
            <div className="font-bold text-[#6C150B]">
              {summary.requiredStaff} Staff
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold">4. Available Pool</div>
            <div className="font-bold text-slate-900">
              {summary.availableStaff} Active
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold">5. Rostered Staff</div>
            <div className="font-bold text-emerald-700">
              {summary.allocatedStaff} Assigned
            </div>
          </div>

          {/* Step 6 */}
          <div className={`p-2 rounded-md border ${
            summary.shortage > 0
              ? 'bg-red-50 border-red-200'
              : summary.surplus > 0
              ? 'bg-blue-50 border-blue-200'
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="text-[10px] text-slate-400 font-semibold">6. Deficit / Surplus</div>
            <div className={`font-bold ${
              summary.shortage > 0
                ? 'text-red-700'
                : summary.surplus > 0
                ? 'text-blue-700'
                : 'text-emerald-700'
            }`}>
              {summary.shortage > 0
                ? `-${summary.shortage} Short`
                : summary.surplus > 0
                ? `+${summary.surplus} Surplus`
                : '0 (Balanced)'}
            </div>
          </div>

          {/* Step 7 */}
          <div className={`p-2 rounded-md border ${
            summary.status === 'Critical' || summary.status === 'Shortage'
              ? 'bg-red-50 border-red-200'
              : summary.status === 'Surplus'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="text-[10px] text-slate-400 font-semibold">7. Shift Status</div>
            <div className={`font-bold ${
              summary.status === 'Critical' || summary.status === 'Shortage'
                ? 'text-red-700'
                : summary.status === 'Surplus'
                ? 'text-blue-700'
                : 'text-slate-800'
            }`}>
              {summary.status}
            </div>
          </div>
        </div>
      </div>

      {/* Main Roster Management & Filter View */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        {/* Header with Title and Quick Counts */}
        <div className="px-4 sm:px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Roster Management &amp; Assignment Directory ({selectedDate})
            </h2>
            <p className="text-xs text-slate-500">
              Search, filter by department, inspect mathematical scores, and reassign or edit staff allocations.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              Showing {displayedAssignments.length} of {allDateAssignments.length} Assignments
            </span>
          </div>
        </div>

        {/* Dedicated Search Bar and Department / Shift Filter Controls */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Search Roster Assignments:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="roster-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by employee name, code, designation, department..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#6C150B] focus:ring-1 focus:ring-[#6C150B]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Department Filter */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                <Building className="w-3 h-3 text-slate-500" />
                <span>Filter by Department:</span>
              </label>
              <select
                id="roster-dept-filter"
                value={filterDepartmentId}
                onChange={(e) => setFilterDepartmentId(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-[#6C150B]"
              >
                <option value="CURRENT">Current: {currentDept.name}</option>
                <option value="ALL">All Departments (Hospital-Wide)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Filter */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Filter by Shift:</span>
              </label>
              <select
                id="roster-shift-filter"
                value={filterShiftId}
                onChange={(e) => setFilterShiftId(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-[#6C150B]"
              >
                <option value="CURRENT">Current: {currentShift.name}</option>
                <option value="ALL">All Shifts</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                <Filter className="w-3 h-3 text-slate-500" />
                <span>Status:</span>
              </label>
              <select
                id="roster-status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-[#6C150B]"
              >
                <option value="ALL">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Published">Published</option>
                <option value="Modified">Modified</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Quick Active Filter Badges */}
          {(searchQuery || filterDepartmentId !== 'CURRENT' || filterShiftId !== 'CURRENT' || filterStatus !== 'ALL') && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Active Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                  <span>Query: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterDepartmentId !== 'CURRENT' && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                  <span>Dept: {filterDepartmentId === 'ALL' ? 'All' : departments.find((d) => d.id === filterDepartmentId)?.name}</span>
                  <button onClick={() => setFilterDepartmentId('CURRENT')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterShiftId !== 'CURRENT' && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                  <span>Shift: {filterShiftId === 'ALL' ? 'All' : shifts.find((s) => s.id === filterShiftId)?.name}</span>
                  <button onClick={() => setFilterShiftId('CURRENT')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterStatus !== 'ALL' && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                  <span>Status: {filterStatus}</span>
                  <button onClick={() => setFilterStatus('ALL')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterDepartmentId('CURRENT');
                  setFilterShiftId('CURRENT');
                  setFilterStatus('ALL');
                }}
                className="text-[#6C150B] font-bold hover:underline ml-1"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Mobile View: Roster Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {displayedAssignments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <AlertTriangle className="w-6 h-6 mx-auto text-slate-300" />
              <p>No roster assignments match the selected filters or search query.</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#6C150B] font-semibold underline text-xs inline-block"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            displayedAssignments.map((assignment) => {
              const emp = employees.find((e) => e.id === assignment.employeeId);
              const dept = departments.find((d) => d.id === assignment.departmentId);
              const sh = shifts.find((s) => s.id === assignment.shiftId) || currentShift;
              const expl = assignment.explanation;

              return (
                <div key={assignment.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{assignment.employeeName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {emp?.empCode || assignment.employeeId} &bull; {assignment.designation}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                        {dept?.name} &bull; <strong className="text-slate-800">{sh.name}</strong> ({sh.startTime} - {sh.endTime})
                      </div>
                    </div>
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      assignment.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : assignment.status === 'Modified'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : assignment.status === 'Published'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{assignment.status}</span>
                    </span>
                  </div>

                  {/* Badges & Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-md">
                      <span className="text-[10px] text-emerald-700 block font-medium">Skill Match</span>
                      <span className="font-bold text-emerald-800 text-xs">{expl?.skillMatchPercentage || 85}%</span>
                    </div>

                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-md">
                      <span className="text-[10px] text-slate-500 block font-medium">Weekly Load</span>
                      <span className="font-bold text-slate-800 text-xs">
                        {(expl?.currentHoursBeforeAssignment || 0) + (sh.durationHours || 8)}h / {emp?.maxWeeklyHours || 48}h
                      </span>
                    </div>

                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-md">
                      <span className="text-[10px] text-slate-500 block font-medium">Score / OT</span>
                      <span className="font-bold text-[#6C150B] text-xs">
                        {expl?.totalScore?.toFixed(1) || '80.0'} ({expl?.overtimeRisk || 'Low'})
                      </span>
                    </div>
                  </div>

                  {/* Reason snippet */}
                  {expl?.summaryReason && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded-sm border border-slate-100">
                      "{expl.summaryReason}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEdit(assignment)}
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-md font-semibold text-xs transition-colors"
                      title="Edit or reassign employee"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setSelectedExplanationAssignment(assignment)}
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Explain</span>
                    </button>

                    <button
                      onClick={() => removeAssignment(assignment.id)}
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 text-red-700 hover:bg-red-50 rounded-md border border-red-200 font-semibold text-xs transition-colors"
                      title="Remove assignment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table (md:) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Employee</th>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">Shift Window</th>
                <th className="py-3 px-4 text-center">Skill Match</th>
                <th className="py-3 px-4 text-center">Weekly Load</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-center">OT Risk</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {displayedAssignments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    No staff assignments match the current search query or filter criteria.
                  </td>
                </tr>
              ) : (
                displayedAssignments.map((assignment) => {
                  const emp = employees.find((e) => e.id === assignment.employeeId);
                  const dept = departments.find((d) => d.id === assignment.departmentId);
                  const sh = shifts.find((s) => s.id === assignment.shiftId) || currentShift;
                  const expl = assignment.explanation;

                  return (
                    <tr key={assignment.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{assignment.employeeName}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {emp?.empCode || assignment.employeeId} &bull; {assignment.designation}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-medium text-slate-900">{dept?.name || assignment.departmentId}</span>
                        <div className="text-[10px] text-slate-400">{dept?.code}</div>
                      </td>

                      {/* Shift */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{sh.name}</span>
                        <div className="text-[10px] text-slate-400">
                          {sh.startTime} - {sh.endTime} ({sh.durationHours}h)
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
                          {(expl?.currentHoursBeforeAssignment || 0) + (sh.durationHours || 8)}h
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
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          assignment.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : assignment.status === 'Modified'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : assignment.status === 'Published'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{assignment.status}</span>
                        </span>
                      </td>

                      {/* Actions & Explanation */}
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(assignment)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-sm font-semibold text-[11px] transition-colors"
                          title="Edit shift, department or swap staff assignment"
                        >
                          <Edit2 className="w-3 h-3 text-slate-600" />
                          <span>Edit</span>
                        </button>
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
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserX className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {currentDept.name} &bull; Candidates Evaluated &amp; Filtered Out ({ineligibleCandidates.length})
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

      {/* Edit / Reassign Assignment Modal Dialog */}
      {editingAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-[#6C150B]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit &amp; Reassign Roster Allocation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Modify shift assignment, department allocation, or swap staff member.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingAssignment(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Employee Summary Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{editingAssignment.employeeName}</span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {employees.find((e) => e.id === editingAssignment.employeeId)?.empCode}
                  </span>
                </div>
                <div className="text-slate-600 text-xs mt-0.5">
                  Designation: <strong className="text-slate-800">{editingAssignment.designation}</strong>
                </div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Roster Date: <strong className="text-slate-700">{editingAssignment.date}</strong>
                </div>
              </div>

              {/* Department Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Allocated Department:
                </label>
                <select
                  value={editForm.departmentId}
                  onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-medium text-slate-900 focus:outline-hidden focus:border-[#6C150B]"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code}) - {dept.type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shift Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Allocated Shift:
                </label>
                <select
                  value={editForm.shiftId}
                  onChange={(e) => setEditForm({ ...editForm, shiftId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-medium text-slate-900 focus:outline-hidden focus:border-[#6C150B]"
                >
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name} ({shift.startTime} - {shift.endTime}, {shift.durationHours} Hours)
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assignment Status:
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-medium text-slate-900 focus:outline-hidden focus:border-[#6C150B]"
                >
                  <option value="Confirmed">Confirmed (Standard Allocation)</option>
                  <option value="Published">Published (Notified to Staff)</option>
                  <option value="Modified">Modified (Supervisor Adjustment)</option>
                  <option value="Draft">Draft (Preliminary Assignment)</option>
                </select>
              </div>

              {/* Swap with available employee (Optional) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                  <span>Swap / Replace with Another Staff Member (Optional):</span>
                </label>
                <select
                  value={editForm.swapEmployeeId}
                  onChange={(e) => setEditForm({ ...editForm, swapEmployeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:border-[#6C150B]"
                >
                  <option value="">-- Keep Current Staff ({editingAssignment.employeeName}) --</option>
                  {employees
                    .filter((e) => e.active && e.id !== editingAssignment.employeeId)
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        Swap to: {emp.name} ({emp.empCode} &bull; {emp.designation})
                      </option>
                    ))}
                </select>
              </div>

              {/* Supervisor Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supervisor Notes / Reason for Change:
                </label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="e.g. Swapped shift at employee request; covering patient surge in ICU..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:border-[#6C150B]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingAssignment(null)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-bold rounded-md hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#6C150B' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                {/* Reason Banner */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                  <span className="font-bold text-emerald-900 block mb-1">Algorithmic Decision Summary:</span>
                  <p className="text-emerald-800">
                    {selectedExplanationAssignment.explanation.summaryReason}
                  </p>
                </div>

                {/* Score Breakdown Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Skill Compatibility</span>
                    <div className="text-base font-bold text-slate-800">
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
