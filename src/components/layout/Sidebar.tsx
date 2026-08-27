import React from 'react';
import { useRoster } from '../../context/RosterContext';
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
  HelpCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
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
    getAllDepartmentSummaries,
  } = useRoster();

  // Calculate live badge counters
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

  return (
    <aside className="hidden md:flex w-64 bg-slate-900 text-slate-200 shrink-0 min-h-[calc(100vh-4rem)] flex-col justify-between border-r border-slate-800">
      <div className="py-4 px-3 space-y-6">
        {navItems.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {section.category}
            </h3>
            <div className="space-y-0.5 mt-1.5">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#6C150B] text-white shadow-xs font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
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

      {/* Hospital Footer Card */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 m-2 rounded-lg">
        <div className="flex items-start space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0 animate-pulse" />
          <div className="text-[11px] text-slate-400 leading-tight">
            <p className="font-semibold text-slate-200">Shija Roster Engine</p>
            <p className="text-slate-400 text-[10px] mt-0.5">
              Deterministic &bull; Skill-Aware &bull; Fair Load Balancing
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
