import React from 'react';
import { useRoster } from '../../context/RosterContext';
import { ShijaLogo } from '../common/ShijaLogo';
import { 
  Calendar, 
  RotateCcw, 
  Printer, 
  Info,
  AlertCircle,
  CheckCircle,
  X,
  Menu,
} from 'lucide-react';

interface HeaderProps {
  onOpenMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const {
    selectedDate,
    setSelectedDate,
    resetToDefaults,
    notification,
    dismissNotification,
    setActiveModule,
    requestConfirm,
  } = useRoster();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Mobile Menu Button + Organization Identity */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {/* Hamburger Button for Mobile */}
            <button
              id="mobile-header-menu-btn"
              onClick={onOpenMenu}
              className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              className="cursor-pointer hover:opacity-95 transition-opacity shrink-0"
              onClick={() => setActiveModule('dashboard')}
              title="Shija Hospitals & Research Institute"
            >
              <ShijaLogo size="sm" className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base lg:text-lg truncate">
                  Shija Hospitals
                </span>
                <span className="hidden sm:inline font-semibold text-slate-600 text-sm">
                  &amp; Research Institute
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded-sm bg-red-50 text-[#6C150B] border border-red-200 shrink-0">
                  V1
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate hidden xs:block">
                Dynamic Roster &amp; Workforce Intelligence Engine
              </p>
            </div>
          </div>

          {/* Right Action Controls: Date Selector, Reset, Quick Print */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Global Date Selector */}
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-md px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs text-slate-700 font-medium space-x-1 sm:space-x-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
              <span className="text-slate-500 hidden sm:inline">Date:</span>
              <input
                type="date"
                id="global-roster-date-picker"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-900 font-semibold focus:outline-hidden cursor-pointer text-xs w-[110px] sm:w-auto"
              />
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
              className="flex items-center space-x-1 px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
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
          className={`px-3 sm:px-4 py-2 text-xs flex items-center justify-between border-t transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : notification.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : notification.type === 'error'
              ? 'bg-red-50 text-red-900 border-red-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center space-x-2 w-full min-w-0 pr-2">
            {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
            {notification.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
            <span className="font-medium truncate sm:whitespace-normal">{notification.message}</span>
          </div>
          <button 
            onClick={dismissNotification}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-sm shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};

