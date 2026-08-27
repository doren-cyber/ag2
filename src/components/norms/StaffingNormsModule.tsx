import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { StaffingNorm } from '../../types/roster';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Calculator,
  Info,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { calculateStaffRequirement } from '../../services/rosterEngine';

export const StaffingNormsModule: React.FC = () => {
  const {
    staffingNorms,
    departments,
    skills,
    addStaffingNorm,
    updateStaffingNorm,
    deleteStaffingNorm,
    requestConfirm,
  } = useRoster();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNorm, setEditingNorm] = useState<StaffingNorm | null>(null);

  // Form State
  const [formDeptId, setFormDeptId] = useState('');
  const [formMetric, setFormMetric] = useState('');
  const [formRatio, setFormRatio] = useState(3);
  const [formMinStaff, setFormMinStaff] = useState(2);
  const [formMaxStaff, setFormMaxStaff] = useState(30);
  const [formRequiredSkills, setFormRequiredSkills] = useState<string[]>([]);
  const [formEffectiveDate, setFormEffectiveDate] = useState('2026-01-01');
  const [formActive, setFormActive] = useState(true);
  const [formNotes, setFormNotes] = useState('');

  // Interactive Live Calculator Sandbox
  const [testDemandValue, setTestDemandValue] = useState<number>(121);
  const [testNormId, setTestNormId] = useState<string>(staffingNorms[0]?.id || '');

  const selectedTestNorm = staffingNorms.find((n) => n.id === testNormId) || staffingNorms[0];
  const testCalculation = calculateStaffRequirement(testDemandValue, selectedTestNorm);

  const handleOpenAdd = () => {
    setEditingNorm(null);
    setFormDeptId(departments[0]?.id || '');
    setFormMetric('Occupied Beds');
    setFormRatio(3);
    setFormMinStaff(2);
    setFormMaxStaff(30);
    setFormRequiredSkills([]);
    setFormEffectiveDate(new Date().toISOString().split('T')[0]);
    setFormActive(true);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (norm: StaffingNorm) => {
    setEditingNorm(norm);
    setFormDeptId(norm.departmentId);
    setFormMetric(norm.demandMetric);
    setFormRatio(norm.ratio);
    setFormMinStaff(norm.minStaff);
    setFormMaxStaff(norm.maxStaff);
    setFormRequiredSkills(norm.requiredSkillIds || []);
    setFormEffectiveDate(norm.effectiveDate);
    setFormActive(norm.active);
    setFormNotes(norm.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMetric.trim() || formRatio <= 0) return;

    if (editingNorm) {
      updateStaffingNorm(editingNorm.id, {
        departmentId: formDeptId,
        demandMetric: formMetric,
        ratio: Number(formRatio),
        minStaff: Number(formMinStaff),
        maxStaff: Number(formMaxStaff),
        requiredSkillIds: formRequiredSkills,
        effectiveDate: formEffectiveDate,
        active: formActive,
        notes: formNotes,
      });
    } else {
      addStaffingNorm({
        departmentId: formDeptId,
        demandMetric: formMetric,
        ratio: Number(formRatio),
        minStaff: Number(formMinStaff),
        maxStaff: Number(formMaxStaff),
        requiredSkillIds: formRequiredSkills,
        effectiveDate: formEffectiveDate,
        active: formActive,
        notes: formNotes,
      });
    }

    setIsModalOpen(false);
  };

  const toggleSkill = (skillId: string) => {
    setFormRequiredSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Staffing Norms &amp; Workload Ratios
            </h1>
            <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-amber-50 text-amber-900 border border-amber-200">
              Planning Norms
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic ratios defining required clinical and operational headcount per unit demand using mathematical ceiling rounding.
          </p>
        </div>
        <button
          id="add-norm-btn"
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white rounded-md transition-all shadow-xs shrink-0"
          style={{ backgroundColor: '#6C150B' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Staffing Norm</span>
        </button>
      </div>

      {/* Interactive Ceiling Calculator Sandbox */}
      <div className="bg-slate-900 text-white rounded-lg p-4 shadow-sm border border-slate-800">
        <div className="flex items-center space-x-2 mb-3">
          <Calculator className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Ceiling Rounding Simulator &amp; Rule Verifier
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Select Norm Formula:</label>
            <select
              value={testNormId}
              onChange={(e) => setTestNormId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-md py-1.5 px-2.5 focus:outline-hidden"
            >
              {staffingNorms.map((n) => {
                const dept = departments.find((d) => d.id === n.departmentId);
                return (
                  <option key={n.id} value={n.id}>
                    {dept?.name || n.departmentId} (1:{n.ratio} {n.demandMetric})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Enter Test Demand Input:</label>
            <input
              type="number"
              min="0"
              value={testDemandValue}
              onChange={(e) => setTestDemandValue(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-white font-bold rounded-md py-1.5 px-2.5 focus:outline-hidden"
            />
          </div>

          <div className="bg-slate-800/80 p-3 rounded-md border border-slate-700 col-span-2 flex items-center justify-between">
            <div>
              <div className="text-slate-400 text-[11px]">Formula Breakdown:</div>
              <div className="font-mono text-xs text-amber-300 font-bold">
                {testDemandValue} &divide; {selectedTestNorm?.ratio} = {testCalculation.rawCalculated} &rarr; ceil() = {Math.ceil(testDemandValue / (selectedTestNorm?.ratio || 1))}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Bounds applied: Min Floor {selectedTestNorm?.minStaff} &bull; Max Cap {selectedTestNorm?.maxStaff}
              </div>
            </div>

            <div className="text-right pl-4 border-l border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Calculated Staff</div>
              <div className="text-2xl font-black text-emerald-400">{testCalculation.roundedRequirement}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Staffing Norms Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Active Staffing Standards &amp; Ratios
          </span>
          <span className="text-xs text-slate-500">
            {staffingNorms.filter((n) => n.active).length} Active Formulas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">Demand Metric</th>
                <th className="py-3 px-4 text-center">Norm Ratio</th>
                <th className="py-3 px-4 text-center">Min Floor</th>
                <th className="py-3 px-4 text-center">Max Cap</th>
                <th className="py-3 px-4 text-left">Mandatory Skill Req</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {staffingNorms.map((norm) => {
                const dept = departments.find((d) => d.id === norm.departmentId);
                const reqSkillNames = skills
                  .filter((s) => norm.requiredSkillIds?.includes(s.id))
                  .map((s) => s.name);

                return (
                  <tr key={norm.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{dept?.name || norm.departmentId}</div>
                      <div className="text-[10px] text-slate-400">{norm.notes || 'Planning ratio'}</div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {norm.demandMetric}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-sm border border-slate-200">
                        1 : {norm.ratio}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {norm.minStaff}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {norm.maxStaff}
                    </td>

                    <td className="py-3 px-4">
                      {reqSkillNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {reqSkillNames.map((sn) => (
                            <span
                              key={sn}
                              className="px-1.5 py-0.5 rounded-xs bg-red-50 text-[#6C150B] border border-red-200 text-[10px] font-medium"
                            >
                              {sn.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None specified</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {norm.active ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(norm)}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
                        title="Edit norm"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          requestConfirm({
                            title: 'Delete Staffing Norm',
                            message: `Are you sure you want to delete the staffing norm for ${dept?.name || norm.departmentId}?`,
                            confirmLabel: 'Delete Norm',
                            variant: 'danger',
                            onConfirm: () => deleteStaffingNorm(norm.id),
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm cursor-pointer"
                        title="Delete norm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingNorm ? 'Edit Staffing Norm' : 'Define New Staffing Norm'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Department *</label>
                <select
                  value={formDeptId}
                  onChange={(e) => setFormDeptId(e.target.value)}
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
                <label className="block font-semibold text-slate-700 mb-1">Demand Metric Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Occupied Beds, OPD Registrations, Scans"
                  value={formMetric}
                  onChange={(e) => setFormMetric(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ratio (1 Staff : N) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formRatio}
                    onChange={(e) => setFormRatio(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md focus:outline-hidden font-bold"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 3 beds per staff</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Floor *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formMinStaff}
                    onChange={(e) => setFormMinStaff(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Cap *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formMaxStaff}
                    onChange={(e) => setFormMaxStaff(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mandatory Required Skills:</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50/50">
                  {skills.map((s) => (
                    <label key={s.id} className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formRequiredSkills.includes(s.id)}
                        onChange={() => toggleSkill(s.id)}
                        className="rounded-sm text-[#6C150B]"
                      />
                      <span>{s.name} ({s.category})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Notes &amp; Guidelines</label>
                <input
                  type="text"
                  placeholder="e.g. NABH standard critical care ratio"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="norm-active-check"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded-sm text-[#6C150B]"
                />
                <label htmlFor="norm-active-check" className="font-semibold text-slate-800">
                  Active Staffing Norm
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white font-bold rounded-md"
                  style={{ backgroundColor: '#6C150B' }}
                >
                  Save Norm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
