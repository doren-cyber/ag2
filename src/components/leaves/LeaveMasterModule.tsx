import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { LeaveRecord, LeaveType, LeaveStatus } from '../../types/roster';
import {
  CalendarOff,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  UserX,
  X,
} from 'lucide-react';

export const LeaveMasterModule: React.FC = () => {
  const {
    leaves,
    employees,
    departments,
    selectedDate,
    addLeaveRecord,
    updateLeaveRecord,
    deleteLeaveRecord,
    requestConfirm,
  } = useRoster();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRecord | null>(null);

  const [formEmpId, setFormEmpId] = useState(employees[0]?.id || '');
  const [formDate, setFormDate] = useState(selectedDate);
  const [formEndDate, setFormEndDate] = useState('');
  const [formType, setFormType] = useState<LeaveType>('Weekly Off');
  const [formReason, setFormReason] = useState('Scheduled weekly off');
  const [formStatus, setFormStatus] = useState<LeaveStatus>('Approved');

  const [filterDept, setFilterDept] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const handleOpenAdd = () => {
    setEditingLeave(null);
    setFormEmpId(employees[0]?.id || '');
    setFormDate(selectedDate);
    setFormEndDate('');
    setFormType('Weekly Off');
    setFormReason('Scheduled weekly off');
    setFormStatus('Approved');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (leave: LeaveRecord) => {
    setEditingLeave(leave);
    setFormEmpId(leave.employeeId);
    setFormDate(leave.date);
    setFormEndDate(leave.endDate || '');
    setFormType(leave.type);
    setFormReason(leave.reason);
    setFormStatus(leave.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmpId || !formDate) return;

    if (editingLeave) {
      updateLeaveRecord(editingLeave.id, {
        employeeId: formEmpId,
        date: formDate,
        endDate: formEndDate || undefined,
        type: formType,
        reason: formReason,
        status: formStatus,
      });
    } else {
      addLeaveRecord({
        employeeId: formEmpId,
        date: formDate,
        endDate: formEndDate || undefined,
        type: formType,
        reason: formReason,
        status: formStatus,
      });
    }

    setIsModalOpen(false);
  };

  const filteredLeaves = leaves.filter((l) => {
    const emp = employees.find((e) => e.id === l.employeeId);
    const matchesDept = filterDept === 'ALL' || emp?.departmentId === filterDept;
    const matchesType = filterType === 'ALL' || l.type === filterType;
    return matchesDept && matchesType;
  });

  const leaveTypes: LeaveType[] = [
    'Leave',
    'Weekly Off',
    'Medical Leave',
    'Casual Leave',
    'Training / Deputation',
    'Unavailable',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Leave, Weekly Off &amp; Availability Register
          </h1>
          <p className="text-xs text-slate-500">
            Log statutory rest days, emergency medical leaves, and official off-duty blocks. Roster engine strictly blocks unavailable personnel.
          </p>
        </div>
        <button
          id="add-leave-btn"
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white rounded-md transition-all shadow-xs shrink-0"
          style={{ backgroundColor: '#6C150B' }}
        >
          <Plus className="w-4 h-4" />
          <span>Log Leave / Weekly Off</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Filter Dept:</span>
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
            <span className="text-slate-500 font-semibold">Absence Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-hidden"
            >
              <option value="ALL">All Types</option>
              {leaveTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-slate-500">
          Showing {filteredLeaves.length} registered absence records
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Employee</th>
                <th className="py-3 px-4 text-left">Department &amp; Role</th>
                <th className="py-3 px-4 text-left">Effective Date(s)</th>
                <th className="py-3 px-4 text-left">Absence Type</th>
                <th className="py-3 px-4 text-left">Reason / Remarks</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLeaves.map((leave) => {
                const emp = employees.find((e) => e.id === leave.employeeId);
                const dept = departments.find((d) => d.id === emp?.departmentId);

                return (
                  <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp?.name || leave.employeeId}</div>
                      <div className="text-[11px] font-mono text-slate-500">{emp?.empCode}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{dept?.name}</span>
                      <div className="text-[10px] text-slate-500">{emp?.designation}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {leave.date}
                      {leave.endDate && <span> to {leave.endDate}</span>}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          leave.type === 'Weekly Off'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : leave.type === 'Medical Leave'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {leave.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {leave.reason}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {leave.status === 'Approved' ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Approved</span>
                        </span>
                      ) : leave.status === 'Pending' ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(leave)}
                        className="p-1 text-slate-400 hover:text-slate-900 rounded-sm"
                        title="Edit leave"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          requestConfirm({
                            title: 'Delete Leave Record',
                            message: `Are you sure you want to delete this ${leave.type} record for ${emp?.name || leave.employeeId}?`,
                            confirmLabel: 'Delete Record',
                            variant: 'danger',
                            onConfirm: () => deleteLeaveRecord(leave.id),
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-sm cursor-pointer"
                        title="Delete leave"
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
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingLeave ? 'Edit Absence Record' : 'Log Leave or Weekly Off'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee *</label>
                <select
                  value={formEmpId}
                  onChange={(e) => setFormEmpId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                >
                  {employees.map((e) => {
                    const dept = departments.find((d) => d.id === e.departmentId);
                    return (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.empCode} &bull; {dept?.code || e.departmentId})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Absence Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as LeaveType)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  >
                    {leaveTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Approval Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as LeaveStatus)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  >
                    <option value="Approved">Approved (Blocks Roster)</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Clinical Handover Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled weekly off or personal leave"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                />
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
