import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Workshops } from './components/Instruments';
import { Classes } from './components/Classes';
import { Schedule } from './components/Schedule';
import type { Student, MusicClass, Workshop, LessonPlan } from './types';
import { MenuIcon } from './components/icons/MenuIcon';
import { MusicalNoteIcon } from './components/icons/MusicalNoteIcon';
import { db } from './firebase/config';
import { collection, onSnapshot, doc, addDoc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

type View = 'dashboard' | 'students' | 'classes' | 'workshops' | 'schedule';

function App() {
  const [currentView, setCurrentView] = useState<View>('workshops');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [classes, setClasses] = useState<MusicClass[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Efeitos para ouvir as coleções do Firestore em tempo real ---
  useEffect(() => {
    const qStudents = query(collection(db, 'students'), orderBy('name', 'asc'));
    const unsubscribeStudents = onSnapshot(qStudents, (querySnapshot) => {
      const studentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(studentsData);
      setLoading(false);
    });

    const qWorkshops = query(collection(db, 'workshops'), orderBy('name', 'asc'));
    const unsubscribeWorkshops = onSnapshot(qWorkshops, (querySnapshot) => {
      const workshopsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workshop));
      setWorkshops(workshopsData);
    });

    const qClasses = query(collection(db, 'classes'), orderBy('date', 'desc'));
    const unsubscribeClasses = onSnapshot(qClasses, (querySnapshot) => {
      const classesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MusicClass));
      setClasses(classesData);
    });
    
    const unsubscribeLessonPlans = onSnapshot(collection(db, 'lessonPlans'), (querySnapshot) => {
      const lessonPlansData = querySnapshot.docs.map(doc => ({ classId: doc.id, ...doc.data() } as LessonPlan));
      setLessonPlans(lessonPlansData);
    });

    // Limpa os listeners ao desmontar o componente
    return () => {
      unsubscribeStudents();
      unsubscribeWorkshops();
      unsubscribeClasses();
      unsubscribeLessonPlans();
    };
  }, []);

  // --- Funções CRUD para interagir com o Firestore ---
  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    await addDoc(collection(db, 'students'), studentData);
  };
  const updateStudent = async (studentData: Student) => {
    const studentRef = doc(db, 'students', studentData.id);
    await setDoc(studentRef, studentData, { merge: true });
  };
  const deleteStudent = async (id: string) => {
    await deleteDoc(doc(db, 'students', id));
  };
  
  const addWorkshop = async (workshopData: Omit<Workshop, 'id'>) => {
    await addDoc(collection(db, 'workshops'), workshopData);
  };
  const updateWorkshop = async (workshopData: Workshop) => {
    const workshopRef = doc(db, 'workshops', workshopData.id);
    await setDoc(workshopRef, workshopData, { merge: true });
  };
  const deleteWorkshop = async (id: string) => {
    await deleteDoc(doc(db, 'workshops', id));
  };

  const addClass = async (classData: Omit<MusicClass, 'id'>) => {
    await addDoc(collection(db, 'classes'), classData);
  };
  const updateClass = async (classData: MusicClass) => {
    const classRef = doc(db, 'classes', classData.id);
    await setDoc(classRef, classData, { merge: true });
  };
  const deleteClass = async (id: string) => {
    await deleteDoc(doc(db, 'classes', id));
  };

  const saveLessonPlan = async (lessonPlan: LessonPlan) => {
    // Usamos classId como ID do documento para facilitar a busca
    await setDoc(doc(db, 'lessonPlans', lessonPlan.classId), lessonPlan);
  };


  const renderView = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-full"><p>Carregando dados...</p></div>
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard students={students} classes={classes} workshops={workshops} />;
      case 'students':
        return <Students 
                  students={students} 
                  workshops={workshops} 
                  onAdd={addStudent} 
                  onUpdate={updateStudent} 
                  onDelete={deleteStudent} 
                />;
      case 'workshops':
        return <Workshops 
                  workshops={workshops} 
                  students={students} 
                  onAdd={addWorkshop}
                  onUpdate={updateWorkshop}
                  onDelete={deleteWorkshop}
                />;
      case 'classes':
        return <Classes 
                  classes={classes} 
                  students={students} 
                  onAdd={addClass}
                  onUpdate={updateClass}
                  onDelete={deleteClass}
                />;
      case 'schedule':
        return <Schedule lessonPlans={lessonPlans} onSavePlan={saveLessonPlan} />;
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