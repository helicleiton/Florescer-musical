import React from 'react';
import { MusicalNoteIcon } from './icons/MusicalNoteIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';

type View = 'dashboard' | 'students' | 'classes' | 'workshops' | 'schedule';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-primary text-white'
        : 'text-slate-600 hover:bg-emerald-50 hover:text-primary'
    }`}
  >
    <span className="w-6 h-6 mr-3">{icon}</span>
    {label}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
  const handleNavClick = (view: View) => {
    setCurrentView(view);
    if (window.innerWidth < 768) { // md breakpoint
        setIsOpen(false);
    }
  };
  
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setIsOpen(false)} aria-hidden="true" />}

      <div className={`fixed top-0 left-0 h-full flex flex-col w-64 p-4 bg-surface border-r border-slate-200 z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex items-center mb-10">
          <div className="p-2 mr-3 text-white rounded-lg bg-primary">
            <MusicalNoteIcon className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-on-surface">
            Florescer <span className="font-normal text-primary">Musical</span>
          </h1>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem
            icon={<DashboardIcon />}
            label="Dashboard"
            isActive={currentView === 'dashboard'}
            onClick={() => handleNavClick('dashboard')}
          />
          <NavItem
            icon={<UserGroupIcon />}
            label="Alunos"
            isActive={currentView === 'students'}
            onClick={() => handleNavClick('students')}
          />
          <NavItem
            icon={<MusicalNoteIcon />}
            label="Oficinas"
            isActive={currentView === 'workshops'}
            onClick={() => handleNavClick('workshops')}
          />
          <NavItem
            icon={<CalendarIcon />}
            label="Horário"
            isActive={currentView === 'schedule'}
            onClick={() => handleNavClick('schedule')}
          />
          <NavItem
            icon={<ClipboardDocumentListIcon />}
            label="Aulas Avulsas"
            isActive={currentView === 'classes'}
            onClick={() => handleNavClick('classes')}
          />
        </nav>
        <div className="mt-auto text-center">
          <p className="text-xs text-slate-400 mb-1">
            Instituto Novo Milênio
          </p>
          <p className="text-xs text-slate-400">
            Desenvolvido por Helicleiton
          </p>
        </div>
      </div>
    </>
  );
};
