import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Workshops } from './components/Instruments';
import { Schedule } from './components/Schedule';
import { Syllabus } from './components/Syllabus';
import { StudentProfile } from './components/StudentProfile';
import { Auth } from './components/Auth';
import type { Student, Workshop, LessonPlan, StudentNote, Attendance, WorkshopLessonPlan } from './types';
import { MenuIcon } from './components/icons/MenuIcon';
import { MusicalNoteIcon } from './components/icons/MusicalNoteIcon';
// FIX: Use Firebase v8 namespaced API.
import { db, auth } from './firebase/config';
// FIX: Import firebase v9 compat to get User type.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { weeklySchedule } from './data/schedule';
import { initialStudents } from './data/initialStudents';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ToastContainer } from './components/ToastContainer';


type View = 'dashboard' | 'students' | 'workshops' | 'schedule' | 'syllabus';
type UserRole = 'admin' | 'viewer';

const getWorkshopNameFromClassName = (className: string): string => {
  const parts = className.split(' ');
  if (parts.length > 1 && /^[A-Z]$/.test(parts[parts.length - 1])) {
    return parts.slice(0, -1).join(' ');
  }
  return className;
};

const AppContent: React.FC = () => {
  const { addToast } = useToast();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [workshopLessonPlans, setWorkshopLessonPlans] = useState<WorkshopLessonPlan[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [user, setUser] = useState<firebase.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const isAdmin = userRole === 'admin';


  const derivedWorkshops: Workshop[] = useMemo(() => {
    const workshopNames = new Set(weeklySchedule.map(c => getWorkshopNameFromClassName(c.name)));
    return Array.from(workshopNames).map(name => ({
        id: name.toLowerCase().replace(/\s/g, '-'),
        name: name
    })).sort((a,b) => a.name.localeCompare(b.name));
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setAuthLoading(true);
      if (currentUser) {
        setUser(currentUser);
        // Fetch role from Firestore
        try {
          const userDoc = await db.collection('users').doc(currentUser.uid).get();
          // The super admin email always overrides the role in DB
          if (currentUser.email === 'admin@florescer.com') {
              setUserRole('admin');
          } else if (userDoc.exists) {
            const role = userDoc.data()?.role;
            if (role === 'admin' || role === 'viewer') {
                setUserRole(role);
            } else {
                setUserRole('viewer'); // Default to viewer if role is invalid or missing
            }
          } else {
             // Default new/unassigned users to viewer
             setUserRole('viewer');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          addToast("Erro ao verificar permissões do usuário.", "error");
          setUserRole('viewer'); // Fail safe to viewer
        }
      } else {
        // No user logged in
        setUser(null);
        setUserRole(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [addToast]);

  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      setStudents([]);
      setLessonPlans([]);
      setStudentNotes([]);
      setAttendances([]);
      setWorkshopLessonPlans([]);
      return;
    }

    setDataLoading(true);

    const unsubs: (() => void)[] = [];

    // Setup listener for students with initialization logic
    const studentsQuery = db.collection('students').orderBy('name', 'asc');
    unsubs.push(studentsQuery.onSnapshot(
      async (querySnapshot) => {
        // Only populate if the database is truly empty and user is admin.
        if (querySnapshot.empty && isAdmin) {
          try {
            addToast('Nenhum aluno encontrado. Carregando lista inicial...', 'info');
            const batch = db.batch();
            initialStudents.forEach((student) => {
              const studentRef = db.collection('students').doc(); // Firestore generates ID
              batch.set(studentRef, {
                ...student,
                registrationDate: new Date().toISOString(),
              });
            });
            await batch.commit();
            // The onSnapshot listener will be called again automatically after the commit.
          } catch (error) {
            console.error('Erro ao popular a lista de alunos: ', error);
            addToast('Falha ao carregar a lista inicial de alunos.', 'error');
            setDataLoading(false);
          }
        } else {
          const studentsData = querySnapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Student)
          );
          setStudents(studentsData);
          setDataLoading(false);
        }
      },
      (error) => {
        console.error('Erro ao buscar alunos: ', error);
        addToast('Não foi possível carregar os alunos.', 'error');
        setDataLoading(false);
      }
    ));

    // Setup other listeners
    unsubs.push(db.collection('lessonPlans').onSnapshot((querySnapshot) => {
      const lessonPlansData = querySnapshot.docs.map(doc => ({ classId: doc.id, ...doc.data() } as LessonPlan));
      setLessonPlans(lessonPlansData);
    }));
      
    const notesQuery = db.collection('studentNotes').orderBy('date', 'desc');
    unsubs.push(notesQuery.onSnapshot((querySnapshot) => {
        const notesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentNote));
        setStudentNotes(notesData);
    }));

    unsubs.push(db.collection('attendances').onSnapshot((querySnapshot) => {
      const attendanceData = querySnapshot.docs.map(doc => ({ classId: doc.id, ...doc.data() } as Attendance));
      setAttendances(attendanceData);
    }));

    unsubs.push(db.collection('workshopLessonPlans').onSnapshot((querySnapshot) => {
        const plansData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkshopLessonPlan));
        setWorkshopLessonPlans(plansData);
    }));

    // Cleanup function
    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [user, addToast, isAdmin]);

  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      // FIX: Use v8 namespaced API to add a document.
      await db.collection('students').add(studentData);
      addToast('Aluno adicionado com sucesso!', 'success');
    } catch (error) {
      console.error("Erro ao adicionar aluno: ", error);
      addToast('Falha ao adicionar aluno.', 'error');
    }
  };
  const updateStudent = async (studentData: Student) => {
    try {
      // FIX: Use v8 namespaced API to set a document.
      const studentRef = db.collection('students').doc(studentData.id);
      await studentRef.set(studentData, { merge: true });
      addToast('Aluno atualizado com sucesso!', 'success');
    } catch (error) {
      console.error("Erro ao atualizar aluno: ", error);
      addToast('Falha ao atualizar aluno.', 'error');
    }
  };
  const deleteStudent = async (id: string) => {
    try {
      // FIX: Use v8 namespaced API to delete a document.
      await db.collection('students').doc(id).delete();
      addToast('Aluno removido com sucesso!', 'success');
    } catch (error) {
      console.error("Erro ao remover aluno: ", error);
      addToast('Falha ao remover aluno.', 'error');
    }
  };

  const saveLessonPlan = async (lessonPlan: LessonPlan) => {
    try {
      // FIX: Use v8 namespaced API to set a document.
      await db.collection('lessonPlans').doc(lessonPlan.classId).set(lessonPlan);
      addToast('Plano de aula salvo com sucesso!', 'success');
    } catch (error) {
      console.error("Erro ao salvar plano de aula: ", error);
      addToast('Falha ao salvar o plano de aula.', 'error');
    }
  };
  
  const addStudentNote = async (noteData: Omit<StudentNote, 'id'>) => {
    try {
      // FIX: Use v8 namespaced API to add a document.
      await db.collection('studentNotes').add(noteData);
      addToast('Anotação adicionada com sucesso!', 'success');
    } catch (error) {
      console.error("Erro ao adicionar anotação: ", error);
      addToast('Falha ao adicionar anotação.', 'error');
    }
  };
  const deleteStudentNote = async (id: string) => {
    try {
      // FIX: Use v8 namespaced API to delete a document.
      await db.collection('studentNotes').doc(id).delete();
      addToast('Anotação removida com sucesso!', 'success');
    } catch (error) {
      console.error("Erro ao remover anotação: ", error);
      addToast('Falha ao remover anotação.', 'error');
    }
  };

  const saveAttendance = async (attendanceData: Attendance) => {
    try {
      // FIX: Use v8 namespaced API to set a document.
      await db.collection('attendances').doc(attendanceData.classId).set({ records: attendanceData.records });
      addToast('Frequência salva com sucesso!', 'success');
    } catch (error) {
      console.error("Erro ao salvar frequência: ", error);
      addToast('Falha ao salvar frequência.', 'error');
    }
  };

  const saveWorkshopLessonPlan = async (planData: WorkshopLessonPlan) => {
    try {
      await db.collection('workshopLessonPlans').doc(planData.id).set(planData);
      addToast('Plano de aula salvo com sucesso!', 'success');
    } catch (error) {
      console.error("Erro ao salvar plano de aula: ", error);
      addToast('Falha ao salvar o plano de aula.', 'error');
    }
  };
  
  const handleSelectStudent = (id: string) => setSelectedStudentId(id);
  const handleBackToStudents = () => {
    setSelectedStudentId(null);
    setCurrentView('students');
  };
  const handleLogout = async () => {
    try {
      // FIX: Use v8 namespaced signOut.
      await auth.signOut();
    } catch (error) {
      console.error("Erro ao sair: ", error);
      addToast('Falha ao tentar sair.', 'error');
    }
  };

  const renderView = () => {
    if (dataLoading) {
      return <div className="flex items-center justify-center h-full"><p>Carregando dados...</p></div>
    }
    
    if (selectedStudentId) {
        const student = students.find(s => s.id === selectedStudentId);
        if (!student) {
            setSelectedStudentId(null);
            return <p>Aluno não encontrado.</p>;
        }
        return <StudentProfile 
                    student={student}
                    notes={studentNotes.filter(n => n.studentId === selectedStudentId)}
                    onAddNote={addStudentNote}
                    onDeleteNote={deleteStudentNote}
                    onBack={handleBackToStudents}
                    isAdmin={isAdmin}
                />;
    }

    switch (currentView) {
      case 'dashboard': return <Dashboard students={students} workshops={derivedWorkshops} />;
      case 'students': return <Students students={students} onAdd={addStudent} onUpdate={updateStudent} onDelete={deleteStudent} onSelectStudent={handleSelectStudent} isAdmin={isAdmin} />;
      case 'workshops': return <Workshops workshops={derivedWorkshops} students={students} />;
      case 'schedule': return <Schedule lessonPlans={lessonPlans} onSavePlan={saveLessonPlan} students={students} attendances={attendances} onSaveAttendance={saveAttendance} isAdmin={isAdmin} />;
      case 'syllabus': return <Syllabus workshops={derivedWorkshops} lessonPlans={workshopLessonPlans} onSaveLessonPlan={saveWorkshopLessonPlan} isAdmin={isAdmin} />;
      default: return <Dashboard students={students} workshops={derivedWorkshops} />;
    }
  };
  
  if (authLoading) {
    return <div className="flex items-center justify-center h-screen bg-background"><p className="text-on-surface">Verificando autenticação...</p></div>;
  }
  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex bg-background text-on-surface min-h-screen font-sans">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        user={user}
        userRole={userRole}
      />
      <div className="flex flex-col flex-1">
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

function App() {
  return (
    <ToastProvider>
      <AppContent />
      <ToastContainer />
    </ToastProvider>
  );
}

export default App;
