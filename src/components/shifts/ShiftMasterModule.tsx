import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { Shift } from '../../types/roster';
import { Clock, Plus, Edit2, Trash2, CheckCircle, XCircle, X, Moon, Sun, Sunrise } from 'lucide-react';

export const ShiftMasterModule: React.FC = () => {
  const { shifts, addShift, updateShift, deleteShift, requestConfirm } = useRoster();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formStartTime, setFormStartTime] = useState('07:00');
  const [formEndTime, setFormEndTime] = useState('15:00');
  const [formDuration, setFormDuration] = useState(8);
  const [formIsNight, setFormIsNight] = useState(false);
  const [formColor, setFormColor] = useState('#0284C7');
  const [formDesc, setFormDesc] = useState('');
  const [formActive, setFormActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingShift(null);
    setFormCode(`S${shifts.length + 1}`);
    setFormName('');
    setFormStartTime('08:00');
    setFormEndTime('16:00');
    setFormDuration(8);
    setFormIsNight(false);
    setFormColor('#0284C7');
    setFormDesc('');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shift: Shift) => {
    setEditingShift(shift);
    setFormCode(shift.code);
    setFormName(shift.name);
    setFormStartTime(shift.startTime);
    setFormEndTime(shift.endTime);
    setFormDuration(shift.durationHours);
    setFormIsNight(shift.isNightShift);
    setFormColor(shift.color || '#0284C7');
    setFormDesc(shift.description || '');
    setFormActive(shift.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    if (editingShift) {
      updateShift(editingShift.id, {
        code: formCode.toUpperCase(),
        name: formName,
        startTime: formStartTime,
        endTime: formEndTime,
        durationHours: Number(formDuration),
        isNightShift: formIsNight,
        color: formColor,
        description: formDesc,
        active: formActive,
      });
    } else {
      addShift({
        code: formCode.toUpperCase(),
        name: formName,
        startTime: formStartTime,
        endTime: formEndTime,
        durationHours: Number(formDuration),
        isNightShift: formIsNight,
        color: formColor,
        description: formDesc,
        active: formActive,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Shift Master &amp; Operating Windows
          </h1>
          <p className="text-xs text-slate-500">
            Configure dynamic shift schedules, operational handover windows, and night shift safety parameters.
          </p>
        </div>
        <button
          id="add-shift-btn"
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white rounded-md transition-all shadow-xs shrink-0"
          style={{ backgroundColor: '#6C150B' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Shift</span>
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: shift.color || '#6C150B' }}
            />

            <div className="flex items-start justify-between mt-1">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 border border-slate-300 text-slate-800">
                    {shift.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{shift.name}</h3>
                </div>
                {shift.isNightShift && (
                  <span className="inline-flex items-center space-x-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Moon className="w-3 h-3 text-indigo-500" />
                    <span>Night Shift (Recovery Aware)</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleOpenEdit(shift)}
                  className="p-1 text-slate-400 hover:text-slate-900 rounded-sm cursor-pointer"
                  title="Edit Shift"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    requestConfirm({
                      title: 'Delete Shift Definition',
                      message: `Are you sure you want to remove ${shift.name} (${shift.code})?`,
                      confirmLabel: 'Delete Shift',
                      variant: 'danger',
                      onConfirm: () => deleteShift(shift.id),
                    });
                  }}
                  className="p-1 text-slate-400 hover:text-red-600 rounded-sm cursor-pointer"
                  title="Delete Shift"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Timings:</span>
                <span className="font-bold text-slate-800">
                  {shift.startTime} &ndash; {shift.endTime}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Shift Duration:</span>
                <span className="font-semibold text-slate-800">{shift.durationHours} Hours</span>
              </div>

              <div className="text-[11px] text-slate-500 italic">
                {shift.description || 'Standard operational shift'}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Status</span>
              {shift.active ? (
                <span className="inline-flex items-center space-x-1 font-semibold text-emerald-700">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 font-semibold text-slate-500">
                  <XCircle className="w-3 h-3 text-slate-400" />
                  <span>Inactive</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingShift ? `Edit Shift: ${editingShift.name}` : 'Create Shift'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="M / E / N / G"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift Color</label>
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full h-8 px-1 py-1 border border-slate-300 rounded-md cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shift Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Shift"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Hrs)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="Operational details or handover notes"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsNight}
                    onChange={(e) => setFormIsNight(e.target.checked)}
                    className="rounded-sm text-[#6C150B]"
                  />
                  <span className="font-semibold text-slate-800">Night Shift</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="rounded-sm text-[#6C150B]"
                  />
                  <span className="font-semibold text-slate-800">Active</span>
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
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
