import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import {
  Employee,
  CompetencyLevel,
  Designation,
  EmployeeSkill,
} from '../../types/roster';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Award,
  Clock,
  Shield,
  UserCheck,
  UserX,
  X,
  Star,
} from 'lucide-react';

export const EmployeeMasterModule: React.FC = () => {
  const {
    employees,
    departments,
    shifts,
    skills,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    requestConfirm,
  } = useRoster();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedDesigFilter, setSelectedDesigFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formEmpCode, setFormEmpCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDeptId, setFormDeptId] = useState('');
  const [formDesignation, setFormDesignation] = useState<Designation>('Staff Nurse');
  const [formStatus, setFormStatus] = useState<'Full-Time' | 'Contract' | 'Probation' | 'Trainee'>('Full-Time');
  const [formMaxWeeklyHours, setFormMaxWeeklyHours] = useState(48);
  const [formMaxDailyHours, setFormMaxDailyHours] = useState(8);
  const [formEligibleShifts, setFormEligibleShifts] = useState<string[]>(['SHIFT-M', 'SHIFT-E', 'SHIFT-N']);
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formExperienceYears, setFormExperienceYears] = useState(3);
  const [formActive, setFormActive] = useState(true);
  const [formSkills, setFormSkills] = useState<EmployeeSkill[]>([]);

  // Filtered List
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDeptFilter === 'ALL' || emp.departmentId === selectedDeptFilter;
    const matchesDesig = selectedDesigFilter === 'ALL' || emp.designation === selectedDesigFilter;
    const matchesStatus =
      selectedStatusFilter === 'ALL' ||
      (selectedStatusFilter === 'ACTIVE' && emp.active) ||
      (selectedStatusFilter === 'INACTIVE' && !emp.active);

    return matchesSearch && matchesDept && matchesDesig && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormEmpCode(`EMP${String(employees.length + 1).padStart(3, '0')}`);
    setFormName('');
    setFormDeptId(departments[0]?.id || '');
    setFormDesignation('Staff Nurse');
    setFormStatus('Full-Time');
    setFormMaxWeeklyHours(48);
    setFormMaxDailyHours(8);
    setFormEligibleShifts(['SHIFT-M', 'SHIFT-E', 'SHIFT-N']);
    setFormPhone('+91 98621 ');
    setFormEmail('');
    setFormExperienceYears(3);
    setFormActive(true);
    setFormSkills([
      { skillId: 'SKILL-BLS', skillName: 'Basic Life Support (BLS)', competencyLevel: 4 },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormEmpCode(emp.empCode);
    setFormName(emp.name);
    setFormDeptId(emp.departmentId);
    setFormDesignation(emp.designation);
    setFormStatus(emp.employmentStatus);
    setFormMaxWeeklyHours(emp.maxWeeklyHours);
    setFormMaxDailyHours(emp.maxDailyHours || 8);
    setFormEligibleShifts(emp.eligibleShiftIds || []);
    setFormPhone(emp.phone);
    setFormEmail(emp.email);
    setFormExperienceYears(emp.experienceYears);
    setFormActive(emp.active);
    setFormSkills(emp.skills || []);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        empCode: formEmpCode,
        name: formName,
        departmentId: formDeptId,
        designation: formDesignation,
        employmentStatus: formStatus,
        maxWeeklyHours: Number(formMaxWeeklyHours),
        maxDailyHours: Number(formMaxDailyHours),
        eligibleShiftIds: formEligibleShifts,
        phone: formPhone,
        email: formEmail,
        experienceYears: Number(formExperienceYears),
        active: formActive,
        skills: formSkills,
      });
    } else {
      addEmployee({
        empCode: formEmpCode,
        name: formName,
        departmentId: formDeptId,
        designation: formDesignation,
        employmentStatus: formStatus,
        maxWeeklyHours: Number(formMaxWeeklyHours),
        maxDailyHours: Number(formMaxDailyHours),
        eligibleShiftIds: formEligibleShifts,
        phone: formPhone,
        email: formEmail,
        experienceYears: Number(formExperienceYears),
        active: formActive,
        joinedDate: new Date().toISOString().split('T')[0],
        totalHoursAssignedThisWeek: 0,
        nightShiftsThisMonth: 0,
        weekendShiftsThisMonth: 0,
        consecutiveWorkingDays: 0,
        skills: formSkills,
      });
    }

    setIsModalOpen(false);
  };

  const toggleShiftEligibility = (shiftId: string) => {
    setFormEligibleShifts((prev) =>
      prev.includes(shiftId) ? prev.filter((s) => s !== shiftId) : [...prev, shiftId]
    );
  };

  const updateCompetency = (skillId: string, level: CompetencyLevel) => {
    setFormSkills((prev) => {
      const existing = prev.find((s) => s.skillId === skillId);
      if (existing) {
        return prev.map((s) => (s.skillId === skillId ? { ...s, competencyLevel: level } : s));
      } else {
        const skillObj = skills.find((sk) => sk.id === skillId);
        return [
          ...prev,
          {
            skillId,
            skillName: skillObj?.name || skillId,
            competencyLevel: level,
          },
        ];
      }
    });
  };

  const removeSkill = (skillId: string) => {
    setFormSkills((prev) => prev.filter((s) => s.skillId !== skillId));
  };

  const competencyLabels: Record<CompetencyLevel, string> = {
    1: '1: Awareness',
    2: '2: Supervised',
    3: '3: Independent',
    4: '4: Advanced',
    5: '5: Expert/Trainer',
  };

  const designationsList: Designation[] = [
    'Senior Consultant',
    'Junior Resident',
    'Nursing Superintendent',
    'Head Nurse',
    'Senior Staff Nurse',
    'Staff Nurse',
    'OT Technician',
    'ICU Technician',
    'Lab Technologist',
    'Radiographer',
    'Front Desk Executive',
    'Patient Care Coordinator',
    'Housekeeping Supervisor',
    'Housekeeping Attendant',
    'Security Officer',
    'Security Guard',
    'Biomedical Engineer',
    'IT Support Specialist',
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls: Header + Search + Filter + Add */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Employee Master &amp; Skill Inventory
            </h1>
            <p className="text-xs text-slate-500">
              Manage clinical and support workforce records, shift certifications, working hour caps, and verified competency levels (1-5).
            </p>
          </div>
          <button
            id="add-employee-btn"
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white rounded-md transition-all shadow-xs shrink-0"
            style={{ backgroundColor: '#6C150B' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="employee-search-input"
              placeholder="Search by name, code, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#6C150B]"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              id="employee-dept-filter"
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-hidden"
            >
              <option value="ALL">All Departments ({employees.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Designation Filter */}
          <div>
            <select
              id="employee-desig-filter"
              value={selectedDesigFilter}
              onChange={(e) => setSelectedDesigFilter(e.target.value)}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-hidden"
            >
              <option value="ALL">All Designations</option>
              {designationsList.map((desig) => (
                <option key={desig} value={desig}>
                  {desig}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="employee-status-filter"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-hidden"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Staff Only</option>
              <option value="INACTIVE">Deactivated / Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Directory Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Showing {filteredEmployees.length} of {employees.length} Employees
          </span>
          <span className="text-xs text-slate-500">
            Competency Rating: 1 (Awareness) to 5 (Master/Trainer)
          </span>
        </div>

        {/* Mobile View: Employee Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredEmployees.map((emp) => {
            const dept = departments.find((d) => d.id === emp.departmentId);
            const eligibleShiftNames = shifts
              .filter((s) => emp.eligibleShiftIds?.includes(s.id))
              .map((s) => s.code);

            return (
              <div key={emp.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{emp.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {emp.empCode} &bull; {emp.employmentStatus}
                    </div>
                  </div>
                  {emp.active ? (
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
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Department</span>
                    <span className="font-semibold text-slate-800 truncate block">{dept?.name || emp.departmentId}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Designation</span>
                    <span className="font-medium text-slate-700 truncate block">{emp.designation}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 text-[11px]">Shifts: </span>
                    <span className="font-mono font-bold text-slate-700">{eligibleShiftNames.join(', ') || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Hours: </span>
                    <span className="font-bold text-slate-900">{emp.totalHoursAssignedThisWeek || 0}h</span>
                    <span className="text-slate-400"> / {emp.maxWeeklyHours}h</span>
                  </div>
                </div>

                {/* Skills */}
                {emp.skills && emp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {emp.skills.slice(0, 3).map((sk) => (
                      <span
                        key={sk.skillId}
                        className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-xs text-[10px] font-medium border ${
                          sk.competencyLevel >= 4
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{sk.skillName.split(' ')[0]}</span>
                        <span className="font-bold text-[9px] px-1 bg-white rounded-xs">
                          L{sk.competencyLevel}
                        </span>
                      </span>
                    ))}
                    {emp.skills.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        +{emp.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEditModal(emp)}
                    className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile &amp; Skills</span>
                  </button>
                  <button
                    onClick={() => {
                      requestConfirm({
                        title: 'Delete Employee Record',
                        message: `Are you sure you want to remove ${emp.name} (${emp.empCode}) from the employee master directory?`,
                        confirmLabel: 'Delete Employee',
                        variant: 'danger',
                        onConfirm: () => deleteEmployee(emp.id),
                      });
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md border border-slate-200 hover:bg-red-50 transition-colors"
                    title="Delete employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Table (md:) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Code &amp; Name</th>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">Designation</th>
                <th className="py-3 px-4 text-center">Max Weekly Hrs</th>
                <th className="py-3 px-4 text-left">Eligible Shifts</th>
                <th className="py-3 px-4 text-left">Key Skills &amp; Competency</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredEmployees.map((emp) => {
                const dept = departments.find((d) => d.id === emp.departmentId);
                const eligibleShiftNames = shifts
                  .filter((s) => emp.eligibleShiftIds?.includes(s.id))
                  .map((s) => s.code);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    {/* Name & ID */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {emp.empCode} &bull; {emp.employmentStatus}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{dept?.name || emp.departmentId}</span>
                      <div className="text-[10px] text-slate-500">{emp.experienceYears} yrs hospital exp</div>
                    </td>

                    {/* Designation */}
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {emp.designation}
                    </td>

                    {/* Max Hours & Weekly Load */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-900">{emp.maxWeeklyHours}h</span>
                      <div className="text-[10px] text-slate-500">
                        Assigned: {emp.totalHoursAssignedThisWeek || 0}h
                      </div>
                    </td>

                    {/* Eligible Shifts */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {eligibleShiftNames.map((code) => (
                          <span
                            key={code}
                            className="px-1.5 py-0.5 rounded-sm bg-slate-100 border border-slate-300 font-mono text-[10px] font-bold text-slate-700"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Skills & Competency */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {emp.skills?.slice(0, 3).map((sk) => (
                          <span
                            key={sk.skillId}
                            className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-xs text-[10px] font-medium border ${
                              sk.competencyLevel >= 4
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                            title={`${sk.skillName} - Level ${sk.competencyLevel}/5`}
                          >
                            <span>{sk.skillName.split(' ')[0]}</span>
                            <span className="font-bold text-[9px] px-1 bg-white rounded-xs">
                              L{sk.competencyLevel}
                            </span>
                          </span>
                        ))}
                        {emp.skills && emp.skills.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{emp.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Active Status */}
                    <td className="py-3 px-4 text-center">
                      {emp.active ? (
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

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(emp)}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-sm transition-colors"
                        title="Edit employee and skill matrix"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          requestConfirm({
                            title: 'Delete Employee Record',
                            message: `Are you sure you want to remove ${emp.name} (${emp.empCode}) from the employee master directory?`,
                            confirmLabel: 'Delete Employee',
                            variant: 'danger',
                            onConfirm: () => deleteEmployee(emp.id),
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                        title="Delete employee"
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

      {/* Add / Edit Employee Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingEmployee ? `Edit Employee: ${editingEmployee.name}` : 'Register New Employee'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure department role, shift certifications, working hour limits, and skill matrix.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Employee Code */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    value={formEmpCode}
                    onChange={(e) => setFormEmpCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#6C150B]"
                  />
                </div>

                {/* Employee Full Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anita Singh"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#6C150B]"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formDeptId}
                    onChange={(e) => setFormDeptId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Designation */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
                  <select
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value as Designation)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  >
                    {designationsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employment Status */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as 'Full-Time' | 'Contract' | 'Probation' | 'Trainee')
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  >
                    <option value="Full-Time">Full-Time (Permanent)</option>
                    <option value="Contract">Contractual Staff</option>
                    <option value="Probation">Probationary Period</option>
                    <option value="Trainee">Trainee / Intern</option>
                  </select>
                </div>

                {/* Experience in Years */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={formExperienceYears}
                    onChange={(e) => setFormExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  />
                </div>

                {/* Max Weekly Working Hours */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Weekly Hours Limit *</label>
                  <input
                    type="number"
                    min="10"
                    max="72"
                    value={formMaxWeeklyHours}
                    onChange={(e) => setFormMaxWeeklyHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500">Standard hospital norm: 48 hrs</span>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="form-active-check"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="rounded-sm text-[#6C150B] focus:ring-[#6C150B] w-4 h-4"
                  />
                  <label htmlFor="form-active-check" className="font-semibold text-slate-800">
                    Active &amp; Eligible for Roster Scheduling
                  </label>
                </div>
              </div>

              {/* Shift Eligibility Checkboxes */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Certified Shift Eligibility (Employee can be assigned to):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {shifts.map((shift) => (
                    <label
                      key={shift.id}
                      className={`flex items-center space-x-2 p-2 border rounded-md cursor-pointer transition-colors ${
                        formEligibleShifts.includes(shift.id)
                          ? 'bg-red-50/50 border-[#6C150B] text-[#6C150B] font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formEligibleShifts.includes(shift.id)}
                        onChange={() => toggleShiftEligibility(shift.id)}
                        className="rounded-sm text-[#6C150B]"
                      />
                      <span>{shift.name} ({shift.code})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skills & Competency Matrix (1 to 5) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">
                    Clinical &amp; Operational Skill Competencies (1 to 5)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    1: Aware | 2: Supervised | 3: Independent | 4: Advanced | 5: Master
                  </span>
                </div>

                <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1.5 bg-slate-50/40">
                  {skills.map((skill) => {
                    const empSkill = formSkills.find((s) => s.skillId === skill.id);
                    const currentLevel = empSkill?.competencyLevel || 0;

                    return (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded-sm text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-800">{skill.name}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">({skill.category})</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <button
                              type="button"
                              key={lvl}
                              onClick={() => updateCompetency(skill.id, lvl as CompetencyLevel)}
                              className={`w-6 h-6 rounded-sm text-[11px] font-bold transition-colors ${
                                currentLevel === lvl
                                  ? 'bg-[#6C150B] text-white shadow-2xs'
                                  : currentLevel > lvl
                                  ? 'bg-red-100 text-[#6C150B]'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                              title={competencyLabels[lvl as CompetencyLevel]}
                            >
                              {lvl}
                            </button>
                          ))}
                          {currentLevel > 0 && (
                            <button
                              type="button"
                              onClick={() => removeSkill(skill.id)}
                              className="p-1 text-slate-300 hover:text-red-600 ml-1"
                              title="Remove skill"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-bold rounded-md shadow-xs transition-colors"
                  style={{ backgroundColor: '#6C150B' }}
                >
                  {editingEmployee ? 'Save Changes' : 'Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
