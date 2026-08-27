import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  Users,
  Building,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { calculateStaffRequirement } from '../../services/rosterEngine';

export const WhatIfSimulationModule: React.FC = () => {
  const {
    departments,
    shifts,
    staffingNorms,
    employees,
    leaves,
    selectedDate,
  } = useRoster();

  // Simulation Parameters
  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || '');
  const [surgePercent, setSurgePercent] = useState<number>(30); // +30%
  const [absenteeCount, setAbsenteeCount] = useState<number>(2); // 2 staff sudden sick
  const [customRatio, setCustomRatio] = useState<number>(0); // 0 = use existing
  const [baseDemand, setBaseDemand] = useState<number>(30);

  const currentDept = departments.find((d) => d.id === selectedDeptId) || departments[0];
  const activeNorm = staffingNorms.find((n) => n.departmentId === selectedDeptId && n.active);

  const actualRatio = customRatio > 0 ? customRatio : (activeNorm?.ratio || 3);
  const deptStaff = employees.filter((e) => e.departmentId === selectedDeptId);

  // Baseline Calculation
  const baselineReq = calculateStaffRequirement(baseDemand, activeNorm);
  const baselineAvailable = deptStaff.length - leaves.filter((l) => {
    const emp = employees.find((e) => e.id === l.employeeId);
    return emp?.departmentId === selectedDeptId && l.date === selectedDate;
  }).length;
  const baselineShortage = Math.max(0, baselineReq.roundedRequirement - baselineAvailable);

  // Simulated Calculation
  const simulatedDemand = Math.round(baseDemand * (1 + surgePercent / 100));
  const simNorm = activeNorm ? { ...activeNorm, ratio: actualRatio } : undefined;
  const simulatedReq = calculateStaffRequirement(simulatedDemand, simNorm);
  const simulatedAvailable = Math.max(0, baselineAvailable - absenteeCount);
  const simulatedShortage = Math.max(0, simulatedReq.roundedRequirement - simulatedAvailable);

  const requirementDelta = simulatedReq.roundedRequirement - baselineReq.roundedRequirement;
  const shortageDelta = simulatedShortage - baselineShortage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            What-If Scenario Simulator &amp; Stress Testing
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Model demand surges, epidemic waves, mass absenteeism, and ratio policy adjustments in a sandboxed hospital digital twin.
        </p>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Controls */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            Stress Test Parameters
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Department</label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Baseline Operational Demand ({activeNorm?.demandMetric || 'Beds/Volume'})
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={baseDemand}
                onChange={(e) => setBaseDemand(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden font-bold"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Demand Surge Impact:</span>
                <span className="text-[#6C150B] font-bold">+{surgePercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={surgePercent}
                onChange={(e) => setSurgePercent(Number(e.target.value))}
                className="w-full accent-[#6C150B]"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (Normal)</span>
                <span>+50% (High Surge)</span>
                <span>+100% (Crisis)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Sudden Absenteeism / Sick Calls:</span>
                <span className="text-red-700 font-bold">+{absenteeCount} staff</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={absenteeCount}
                onChange={(e) => setAbsenteeCount(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Modified Staffing Ratio (1 Staff : N)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={customRatio || (activeNorm?.ratio || 3)}
                onChange={(e) => setCustomRatio(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden font-bold"
              />
              <span className="text-[10px] text-slate-400">
                Standard institutional norm is 1 : {activeNorm?.ratio || 3}
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSurgePercent(30);
                  setAbsenteeCount(2);
                  setCustomRatio(0);
                  setBaseDemand(30);
                }}
                className="w-full py-1.5 text-slate-700 font-semibold bg-slate-100 hover:bg-slate-200 rounded-md transition-colors text-xs flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Simulation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Simulation Results & Stress Comparison */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Baseline Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-700 uppercase">Standard Baseline</span>
                <span className="text-[10px] font-mono text-slate-400">1:{activeNorm?.ratio || 3} Ratio</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Demand:</span>
                  <span className="font-bold text-slate-800">{baseDemand} {activeNorm?.demandMetric}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Required Staff:</span>
                  <span className="font-bold text-slate-800">{baselineReq.roundedRequirement} Staff</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Available Pool:</span>
                  <span className="font-bold text-slate-800">{baselineAvailable} Staff</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-700">Net Shortage:</span>
                  <span className={`font-bold ${baselineShortage > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {baselineShortage > 0 ? `-${baselineShortage} Staff` : 'Met (0)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Stress Card */}
            <div className="bg-white border-2 border-[#6C150B] rounded-lg p-4 shadow-xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#6C150B] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-md">
                Simulated Outcome
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-[#6C150B] uppercase">Surge Scenario</span>
                <span className="text-[10px] font-mono text-slate-400">1:{actualRatio} Ratio</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Simulated Demand:</span>
                  <span className="font-bold text-slate-900">{simulatedDemand} (+{surgePercent}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Required Staff:</span>
                  <span className="font-black text-slate-900 text-sm">{simulatedReq.roundedRequirement} Staff</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Available After Sick Calls:</span>
                  <span className="font-bold text-slate-900">{simulatedAvailable} Staff</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-900">Simulated Deficit:</span>
                  <span className={`font-black text-sm ${simulatedShortage > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {simulatedShortage > 0 ? `-${simulatedShortage} Staff` : 'Covered (0)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Decision & Recommendations Panel */}
          <div className="bg-slate-900 text-white rounded-lg p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Workforce Intelligence Contingency Plan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-800 p-3 rounded-md border border-slate-700">
                <div className="text-slate-400 text-[11px]">Staffing Gap Increase</div>
                <div className="text-xl font-bold text-red-400 mt-1">
                  +{shortageDelta} Staff Deficit
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Additional clinical coverage required to maintain safe patient-to-nurse ratios.
                </p>
              </div>

              <div className="bg-slate-800 p-3 rounded-md border border-slate-700">
                <div className="text-slate-400 text-[11px]">Float Pool Mobilization</div>
                <div className="text-xl font-bold text-blue-400 mt-1">
                  {Math.min(simulatedShortage, 3)} Float Nurses
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Redeploy qualified cross-trained personnel from low-occupancy general wards.
                </p>
              </div>

              <div className="bg-slate-800 p-3 rounded-md border border-slate-700">
                <div className="text-slate-400 text-[11px]">Overtime Budget Impact</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  ~{simulatedShortage * 8} OT Hours
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Estimated premium shift hours for on-call activation.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-md border border-slate-700 text-xs text-slate-300">
              <strong>Simulated Rationale:</strong> Demand expanded by {surgePercent}% with {absenteeCount} sudden absences creates a critical care deficit of {simulatedShortage} personnel in {currentDept.name}. Recommend triggering Level-2 surge protocols and cross-departmental staff mobilization.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
