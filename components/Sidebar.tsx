import React from 'react';
import { MusicalNoteIcon } from './icons/MusicalNoteIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
// FIX: Import firebase v9 compat to get User type.
import firebase from 'firebase/compat/app';
import { PencilSquareIcon } from './icons/PencilSquareIcon';

type View = 'dashboard' | 'students' | 'workshops' | 'schedule' | 'syllabus';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  user: firebase.User | null;
  userRole: 'admin' | 'viewer' | null;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isLogout?: boolean;
}> = ({ icon, label, isActive, onClick, isLogout = false }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-primary text-white'
        : isLogout 
        ? 'text-slate-600 hover:bg-red-50 hover:text-red-600'
        : 'text-slate-600 hover:bg-emerald-50 hover:text-primary'
    }`}
  >
    <span className="w-6 h-6 mr-3">{icon}</span>
    {label}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen, onLogout, user, userRole }) => {
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
            icon={<PencilSquareIcon />}
            label="Planejamento"
            isActive={currentView === 'syllabus'}
            onClick={() => handleNavClick('syllabus')}
          />
        </nav>
        <div className="mt-auto">
           <div className="pt-4 border-t border-slate-200">
             {user && userRole && (
                <div className="px-4 pb-4">
                    <div className="flex items-center">
                        <UserCircleIcon className="w-8 h-8 mr-3 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-on-surface truncate" title={user.email ?? ''}>
                                {user.email}
                            </p>
                            <p className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block mt-1">
                                {userRole === 'admin' ? 'Administrador' : 'Visualizador'}
                            </p>
                        </div>
                    </div>
                </div>
             )}
             <NavItem
                icon={<LogoutIcon />}
                label="Sair"
                isActive={false}
                onClick={onLogout}
                isLogout={true}
             />
           </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400 mb-1">
              Instituto Novo Milênio
            </p>
            <p className="text-xs text-slate-400">
              Desenvolvido por Helicleiton
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
