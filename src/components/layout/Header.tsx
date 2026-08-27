import React from 'react';
import { useRoster } from '../../context/RosterContext';
import { UserRole } from '../../types/roster';
import { ShijaLogo } from '../common/ShijaLogo';
import { 
  Building2, 
  Calendar, 
  RotateCcw, 
  ShieldCheck, 
  UserCheck, 
  Printer, 
  Info,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    selectedDate,
    setSelectedDate,
    resetToDefaults,
    notification,
    dismissNotification,
    setActiveModule,
    requestConfirm,
  } = useRoster();

  const roles: { value: UserRole; label: string; badge: string }[] = [
    { value: 'ROSTER_MANAGER', label: 'Roster Manager', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { value: 'DEPARTMENT_HEAD', label: 'Department Head', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
    { value: 'HR', label: 'HR Manager', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'ADMIN', label: 'Hospital Admin', badge: 'bg-purple-100 text-purple-800 border-purple-300' },
    { value: 'VIEW_ONLY', label: 'View Only (Auditor)', badge: 'bg-slate-100 text-slate-700 border-slate-300' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Organization & App Identity */}
          <div className="flex items-center space-x-3">
            <div 
              className="cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setActiveModule('dashboard')}
              title="Shija Hospitals & Research Institute"
            >
              <ShijaLogo size="md" className="w-11 h-11" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  Shija Hospitals & Research Institute
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-red-50 text-[#6C150B] border border-red-200">
                  Prototype V1
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Agile Workforce Platform &bull; Dynamic Roster &amp; Workforce Intelligence Engine
              </p>
            </div>
          </div>

          {/* Right Action Controls: Date Selector, Role Switcher, Reset, Quick Print */}
          <div className="flex items-center space-x-3">
            {/* Global Date Selector */}
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-700 font-medium space-x-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500">Roster Date:</span>
              <input
                type="date"
                id="global-roster-date-picker"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-900 font-semibold focus:outline-hidden cursor-pointer"
              />
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-md px-2 py-1 space-x-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#6C150B]" />
              <label htmlFor="role-select" className="text-slate-500 hidden md:inline">Role:</label>
              <select
                id="role-select"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-transparent text-slate-900 font-semibold focus:outline-hidden cursor-pointer text-xs pr-1"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Print / Export Button */}
            <button
              id="header-print-btn"
              onClick={() => setActiveModule('export')}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors shadow-2xs"
              title="Print hospital roster sheet"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Sheet</span>
            </button>

            {/* Reset Sample Baseline */}
            <button
              id="header-reset-btn"
              onClick={() => {
                requestConfirm({
                  title: 'Reset Roster Database',
                  message: 'Are you sure you want to reset all modified roster data, norms, and employees to the original Shija Hospitals sample dataset?',
                  confirmLabel: 'Reset Database',
                  variant: 'danger',
                  onConfirm: () => resetToDefaults(),
                });
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
              title="Reset data store to realistic prototype baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Notification Banner */}
      {notification && (
        <div 
          id="global-notification-banner"
          className={`px-4 py-2 text-xs flex items-center justify-between border-t transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : notification.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : notification.type === 'error'
              ? 'bg-red-50 text-red-900 border-red-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center space-x-2 w-full">
            {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
            {notification.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button 
            onClick={dismissNotification}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded-sm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};
