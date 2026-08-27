import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { Department } from '../../types/roster';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  Sliders,
  X,
  Activity,
  Layers,
} from 'lucide-react';

export const DepartmentMasterModule: React.FC = () => {
  const {
    departments,
    employees,
    staffingNorms,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    requestConfirm,
  } = useRoster();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<Department['type']>('Inpatient');
  const [formHOD, setFormHOD] = useState('');
  const [formMetric, setFormMetric] = useState('');
  const [formActive, setFormActive] = useState(true);

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setFormCode('NEW');
    setFormName('');
    setFormType('Inpatient');
    setFormHOD('');
    setFormMetric('Occupied Beds');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormCode(dept.code);
    setFormName(dept.name);
    setFormType(dept.type);
    setFormHOD(dept.headOfDepartment || '');
    setFormMetric(dept.defaultDemandMetric || 'Occupied Beds');
    setFormActive(dept.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    if (editingDept) {
      updateDepartment(editingDept.id, {
        code: formCode.toUpperCase(),
        name: formName,
        type: formType,
        headOfDepartment: formHOD,
        defaultDemandMetric: formMetric,
        active: formActive,
      });
    } else {
      addDepartment({
        code: formCode.toUpperCase(),
        name: formName,
        type: formType,
        headOfDepartment: formHOD,
        defaultDemandMetric: formMetric,
        active: formActive,
      });
    }

    setIsModalOpen(false);
  };

  const deptTypes: Department['type'][] = [
    'Critical Care',
    'Inpatient',
    'Emergency',
    'Surgical',
    'Outpatient',
    'Diagnostic',
    'Support',
    'Administrative',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Department Master &amp; Cost Center Hierarchy
          </h1>
          <p className="text-xs text-slate-500">
            Define hospital clinical units, critical wards, diagnostic centers, and operational support departments.
          </p>
        </div>
        <button
          id="add-dept-btn"
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white rounded-md transition-all shadow-xs shrink-0"
          style={{ backgroundColor: '#6C150B' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const deptStaff = employees.filter((e) => e.departmentId === dept.id);
          const activeNorms = staffingNorms.filter((n) => n.departmentId === dept.id && n.active);

          return (
            <div
              key={dept.id}
              className={`bg-white border rounded-lg p-4 shadow-2xs transition-all hover:shadow-xs ${
                dept.active ? 'border-slate-200' : 'border-slate-300 opacity-60 bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 border border-slate-300 text-slate-700">
                      {dept.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                  </div>
                  <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {dept.type}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(dept)}
                    className="p-1 text-slate-400 hover:text-slate-900 rounded-sm cursor-pointer"
                    title="Edit Department"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      requestConfirm({
                        title: 'Delete Department',
                        message: `Are you sure you want to remove ${dept.name} (${dept.code})? Staff assigned to this department should be reassigned.`,
                        confirmLabel: 'Delete Department',
                        variant: 'danger',
                        onConfirm: () => deleteDepartment(dept.id),
                      });
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-sm cursor-pointer"
                    title="Delete Department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Head of Dept:</span>
                  <span className="font-semibold text-slate-800">{dept.headOfDepartment || 'Unassigned'}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Default Demand:</span>
                  <span className="font-medium text-slate-700">{dept.defaultDemandMetric || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Staff Strength:</span>
                  <span className="inline-flex items-center space-x-1 font-bold text-slate-900">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span>{deptStaff.length} Employees</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Active Norms:</span>
                  <span className="text-slate-700 font-medium">
                    {activeNorms.length > 0
                      ? `1 : ${activeNorms[0].ratio} (${activeNorms[0].demandMetric})`
                      : 'No active norm'}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Status</span>
                {dept.active ? (
                  <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-500">
                    <XCircle className="w-3 h-3 text-slate-400" />
                    <span>Inactive</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingDept ? `Edit Department: ${editingDept.name}` : 'Add New Department'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICU, OT, LAB"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intensive Care Unit (ICU)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as Department['type'])}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                >
                  {deptTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Head of Department (HOD)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. L. Tomba Singh"
                  value={formHOD}
                  onChange={(e) => setFormHOD(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Demand Metric</label>
                <input
                  type="text"
                  placeholder="e.g. Occupied Beds, Footfall, Scans"
                  value={formMetric}
                  onChange={(e) => setFormMetric(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="dept-active-check"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded-sm text-[#6C150B]"
                />
                <label htmlFor="dept-active-check" className="font-semibold text-slate-800">
                  Active Department
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
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
