import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Workshops } from './components/Instruments';
import { Classes } from './components/Classes';
import { Schedule } from './components/Schedule';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Student, MusicClass, Workshop, LessonPlan } from './types';
import { MenuIcon } from './components/icons/MenuIcon';
import { MusicalNoteIcon } from './components/icons/MusicalNoteIcon';

type View = 'dashboard' | 'students' | 'classes' | 'workshops' | 'schedule';

const initialWorkshops: Workshop[] = [
  { id: 'w1', name: 'Teclado' },
  { id: 'w2', name: 'Musicalização' },
  { id: 'w3', name: 'Violão' },
  { id: 'w4', name: 'Técnica Vocal' },
];

const initialStudents: Student[] = [
    { id: 's1', name: 'Ana Clara Farias', age: 12, workshopId: 'w1', registrationDate: new Date('2025-02-10T10:00:00Z').toISOString() },
    { id: 's2', name: 'Bruno Santos Lima', age: 10, workshopId: 'w3', registrationDate: new Date('2025-02-12T11:30:00Z').toISOString() },
    { id: 's3', name: 'Carla Dias Souza', age: 14, workshopId: 'w2', registrationDate: new Date('2025-02-15T09:00:00Z').toISOString() },
    { id: 's4', name: 'Daniel Alves Pereira', age: 9, workshopId: 'w1', registrationDate: new Date('2025-03-01T14:00:00Z').toISOString() },
    { id: 's5', name: 'Eduarda Lima Castro', age: 11, workshopId: 'w4', registrationDate: new Date('2025-03-05T16:20:00Z').toISOString() },
    { id: 's6', name: 'Felipe Costa Azevedo', age: 13, workshopId: 'w3', registrationDate: new Date('2025-03-10T08:45:00Z').toISOString() },
    { id: 's7', name: 'Gabriela Melo', age: 15, workshopId: null, registrationDate: new Date('2025-03-11T13:00:00Z').toISOString() },
    { id: 's8', name: 'Heitor Martins Rocha', age: 8, workshopId: 'w2', registrationDate: new Date('2025-03-12T15:00:00Z').toISOString() },
];


function App() {
  const [currentView, setCurrentView] = useState<View>('workshops');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [students, setStudents] = useLocalStorage<Student[]>('students', initialStudents);
  const [workshops, setWorkshops] = useLocalStorage<Workshop[]>('workshops', initialWorkshops);
  const [classes, setClasses] = useLocalStorage<MusicClass[]>('classes', []);
  const [lessonPlans, setLessonPlans] = useLocalStorage<LessonPlan[]>('lessonPlans', []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard students={students} classes={classes} workshops={workshops} />;
      case 'students':
        return <Students students={students} setStudents={setStudents} workshops={workshops} />;
      case 'workshops':
        return <Workshops workshops={workshops} setWorkshops={setWorkshops} students={students} />;
      case 'classes':
        return <Classes classes={classes} setClasses={setClasses} students={students} />;
      case 'schedule':
        return <Schedule lessonPlans={lessonPlans} setLessonPlans={setLessonPlans} />;
      default:
        return <Dashboard students={students} classes={classes} workshops={workshops} />;
    }
  };

  return (
    <div className="flex bg-background text-on-surface min-h-screen font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1">
         {/* Mobile Header */}
        <header className="md:hidden bg-surface shadow-sm flex items-center justify-between p-4 sticky top-0 z-10">
          <div className="flex items-center">
             <div className="p-1.5 mr-3 text-white rounded-lg bg-primary">
               <MusicalNoteIcon className="w-5 h-5" />
             </div>
             <h1 className="text-lg font-bold text-on-surface">
               Florescer <span className="font-normal text-primary">Musical</span>
             </h1>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-on-surface rounded-md hover:bg-slate-100">
            <MenuIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="flex-1">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
