import React from 'react';
import { useRoster } from '../../context/RosterContext';
import { ShijaLogo } from '../common/ShijaLogo';
import {
  LayoutDashboard,
  Users,
  Building,
  Clock,
  Sliders,
  TrendingUp,
  CalendarOff,
  CalendarCheck,
  AlertOctagon,
  Sparkles,
  FileSpreadsheet,
  X,
  RotateCcw,
  Calendar,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const {
    activeModule,
    setActiveModule,
    employees,
    departments,
    shifts,
    staffingNorms,
    leaves,
    assignments,
    selectedDate,
    setSelectedDate,
    getAllDepartmentSummaries,
    resetToDefaults,
    requestConfirm,
  } = useRoster();

  if (!isOpen) return null;

  const totalEmployeesCount = employees.length;
  const activeLeavesCount = leaves.filter((l) => l.date === selectedDate && l.status === 'Approved').length;
  const assignmentsTodayCount = assignments.filter((a) => a.date === selectedDate).length;
  const summaries = getAllDepartmentSummaries(selectedDate);
  const totalShortages = summaries.reduce((acc, s) => acc + s.shortage, 0);

  const navItems = [
    {
      category: 'Core Operations',
      items: [
        {
          id: 'dashboard',
          label: 'Management Dashboard',
          icon: LayoutDashboard,
          badge: totalShortages > 0 ? `${totalShortages} Gaps` : 'Optimal',
          badgeColor: totalShortages > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800',
        },
        {
          id: 'roster',
          label: 'Dynamic Roster Engine',
          icon: CalendarCheck,
          badge: `${assignmentsTodayCount} Rostered`,
          badgeColor: 'bg-blue-100 text-blue-800',
        },
        {
          id: 'shortages',
          label: 'Shortage & Gap Report',
          icon: AlertOctagon,
          badge: totalShortages > 0 ? `${totalShortages} Short` : '0',
          badgeColor: totalShortages > 0 ? 'bg-red-100 text-red-800 font-bold' : 'bg-slate-100 text-slate-600',
        },
        {
          id: 'whatif',
          label: 'What-If Simulation',
          icon: Sparkles,
          badge: 'Scenario',
          badgeColor: 'bg-amber-100 text-amber-800',
        },
      ],
    },
    {
      category: 'Master Data & Norms',
      items: [
        {
          id: 'employees',
          label: 'Employee Master & Skills',
          icon: Users,
          badge: `${totalEmployeesCount}`,
          badgeColor: 'bg-slate-100 text-slate-700',
        },
        {
          id: 'departments',
          label: 'Department Master',
          icon: Building,
          badge: `${departments.length}`,
          badgeColor: 'bg-slate-100 text-slate-700',
        },
        {
          id: 'shifts',
          label: 'Shift Master',
          icon: Clock,
          badge: `${shifts.length}`,
          badgeColor: 'bg-slate-100 text-slate-700',
        },
        {
          id: 'norms',
          label: 'Staffing Norms (Ratios)',
          icon: Sliders,
          badge: `${staffingNorms.length} Active`,
          badgeColor: 'bg-slate-100 text-slate-700',
        },
      ],
    },
    {
      category: 'Operational Inputs',
      items: [
        {
          id: 'demand',
          label: 'Operational Demand Input',
          icon: TrendingUp,
          badge: 'Daily',
          badgeColor: 'bg-slate-100 text-slate-700',
        },
        {
          id: 'leaves',
          label: 'Leave & Weekly Off',
          icon: CalendarOff,
          badge: activeLeavesCount > 0 ? `${activeLeavesCount} Absent` : '0',
          badgeColor: activeLeavesCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600',
        },
        {
          id: 'export',
          label: 'Data Export & Printing',
          icon: FileSpreadsheet,
          badge: 'CSV/Print',
          badgeColor: 'bg-slate-100 text-slate-700',
        },
      ],
    },
  ];

  const handleSelectModule = (id: string) => {
    setActiveModule(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-4/5 max-w-xs bg-slate-900 text-slate-200 flex flex-col justify-between h-full shadow-2xl z-10 animate-in slide-in-from-left duration-250">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center space-x-3">
              <ShijaLogo size="sm" className="w-9 h-9" />
              <div>
                <h2 className="font-bold text-slate-100 text-sm tracking-tight">Shija Hospitals</h2>
                <p className="text-[11px] text-slate-400">Roster Intelligence</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              aria-label="Close Navigation Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Date Selector in Mobile Drawer */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/90">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Active Roster Date:</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-xs text-white font-medium focus:outline-hidden focus:border-[#6C150B]"
            />
          </div>

          {/* Navigation Links (Scrollable) */}
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
            {navItems.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.category}
                </h3>
                <div className="space-y-1 mt-1">
                  {section.items.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeModule === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`mobile-nav-item-${item.id}`}
                        onClick={() => handleSelectModule(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#6C150B] text-white shadow-xs font-bold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <IconComponent
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-white' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm shrink-0 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Drawer Footer with Quick Reset */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                onClose();
                requestConfirm({
                  title: 'Reset Roster Database',
                  message: 'Are you sure you want to reset all modified roster data, norms, and employees to the original Shija Hospitals sample dataset?',
                  confirmLabel: 'Reset Database',
                  variant: 'danger',
                  onConfirm: () => resetToDefaults(),
                });
              }}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-semibold text-slate-300 hover:text-red-400 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Baseline</span>
            </button>
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Shija Hospitals V1</span>
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Engine Active</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
