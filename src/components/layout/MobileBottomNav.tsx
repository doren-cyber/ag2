import React from 'react';
import { useRoster } from '../../context/RosterContext';
import {
  LayoutDashboard,
  CalendarCheck,
  AlertOctagon,
  Sparkles,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const {
    activeModule,
    setActiveModule,
    selectedDate,
    getAllDepartmentSummaries,
  } = useRoster();

  const summaries = getAllDepartmentSummaries(selectedDate);
  const totalShortages = summaries.reduce((acc, s) => acc + s.shortage, 0);

  const mainTabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'roster',
      label: 'Roster',
      icon: CalendarCheck,
    },
    {
      id: 'shortages',
      label: 'Gaps',
      icon: AlertOctagon,
      badge: totalShortages > 0 ? String(totalShortages) : null,
    },
    {
      id: 'whatif',
      label: 'Simulation',
      icon: Sparkles,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 safe-area-pb">
      <nav className="flex items-center justify-around">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;

          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              onClick={() => setActiveModule(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg transition-colors relative ${
                isActive
                  ? 'text-[#6C150B] font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center border-2 border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#6C150B]' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-[#6C150B] rounded-full" />
              )}
            </button>
          );
        })}

        {/* More / Full Menu Button */}
        <button
          id="mobile-tab-menu"
          onClick={onOpenMenu}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg transition-colors relative ${
            !['dashboard', 'roster', 'shortages', 'whatif'].includes(activeModule)
              ? 'text-[#6C150B] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Menu className="w-5 h-5 stroke-2" />
            {!['dashboard', 'roster', 'shortages', 'whatif'].includes(activeModule) && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#6C150B] rounded-full border border-white" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium tracking-tight">
            Menu
          </span>
        </button>
      </nav>
    </div>
  );
};
