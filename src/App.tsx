import React, { useState } from 'react';
import { RosterProvider, useRoster } from './context/RosterContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { EmployeeMasterModule } from './components/employees/EmployeeMasterModule';
import { DepartmentMasterModule } from './components/departments/DepartmentMasterModule';
import { ShiftMasterModule } from './components/shifts/ShiftMasterModule';
import { StaffingNormsModule } from './components/norms/StaffingNormsModule';
import { DemandInputModule } from './components/demand/DemandInputModule';
import { LeaveMasterModule } from './components/leaves/LeaveMasterModule';
import { DynamicRosterModule } from './components/roster/DynamicRosterModule';
import { ShortageReportModule } from './components/reports/ShortageReportModule';
import { WhatIfSimulationModule } from './components/simulation/WhatIfSimulationModule';
import { DataExportModule } from './components/export/DataExportModule';
import { ConfirmDialog } from './components/common/ConfirmDialog';

const MainContent: React.FC = () => {
  const { activeModule, confirmDialog, closeConfirm } = useRoster();

  return (
    <main className="flex-1 min-w-0 bg-slate-100 p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto">
        {activeModule === 'dashboard' && <DashboardModule />}
        {activeModule === 'employees' && <EmployeeMasterModule />}
        {activeModule === 'departments' && <DepartmentMasterModule />}
        {activeModule === 'shifts' && <ShiftMasterModule />}
        {activeModule === 'norms' && <StaffingNormsModule />}
        {activeModule === 'demand' && <DemandInputModule />}
        {activeModule === 'leaves' && <LeaveMasterModule />}
        {activeModule === 'roster' && <DynamicRosterModule />}
        {activeModule === 'shortages' && <ShortageReportModule />}
        {activeModule === 'whatif' && <WhatIfSimulationModule />}
        {activeModule === 'export' && <DataExportModule />}
      </div>

      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          cancelLabel={confirmDialog.cancelLabel}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={closeConfirm}
        />
      )}
    </main>
  );
};

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <RosterProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-[#6C150B] selection:text-white">
        <Header onOpenMenu={() => setIsMobileMenuOpen(true)} />
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar />
          <MainContent />
        </div>
        
        {/* Mobile Navigation Drawer */}
        <MobileDrawer 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />

        {/* Mobile Sticky Bottom Bar */}
        <MobileBottomNav 
          onOpenMenu={() => setIsMobileMenuOpen(true)} 
        />
      </div>
    </RosterProvider>
  );
}

