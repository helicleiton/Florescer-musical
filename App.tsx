import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db, auth } from './firebase/config';
// The importmap in index.html maps "firebase/app" to the compat library,
// which provides the v8 namespaced API and types like `firebase.User`.
// FIX: Use compat imports to get correct Firebase v8 types like `firebase.User`.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import { ToastProvider, useToast } from './contexts/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Workshops } from './components/Instruments';
import { Schedule } from './components/Schedule';
import { StudentProfile } from './components/StudentProfile';
import { WorkshopDetail } from './components/WorkshopDetail';
import { Syllabus } from './components/Syllabus';
import { MyChildProfile } from './components/MyChildProfile';

import type { Student, Workshop, MusicClass, LessonPlan, StudentNote, Attendance, WorkshopLessonPlan, FullClassInfo } from './types';
import { initialStudents } from './data/initialStudents';
import { weeklySchedule } from './data/schedule';
import { generateAllFixedClasses } from './utils/reportGenerator';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { MenuIcon } from './components/icons/MenuIcon';


const AppContent: React.FC<{ user: firebase.User; userRole: 'admin' | 'viewer' | 'parent' }> = ({ user, userRole }) => {
  type View = 'dashboard' | 'students' | 'workshops' | 'schedule' | 'syllabus' | 'myChild';
  
  const [currentView, setCurrentView] = useState<View>(userRole === 'parent' ? 'myChild' : 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [musicClasses, setMusicClasses] = useState<MusicClass[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [workshopLessonPlans, setWorkshopLessonPlans] = useState<WorkshopLessonPlan[]>([]);
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [myChild, setMyChild] = useState<Student | null>(null);

  const { addToast } = useToast();
  const isAdmin = userRole === 'admin';

  const workshops: Workshop[] = useMemo(() => {
    const workshopNames = new Set<string>();
    weeklySchedule.forEach(item => {
        const nameParts = item.name.split(' ');
        // Remove the class letter/number (A, B, C, E1, E2...) if it exists
        const workshopName = (nameParts.length > 1 && /^[A-Z]\d*$/.test(nameParts[nameParts.length - 1]))
            ? nameParts.slice(0, -1).join(' ')
            : item.name;
        workshopNames.add(workshopName);
    });

    return Array.from(workshopNames).map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
    })).sort((a,b) => a.name.localeCompare(b.name));
  }, []);

  const allFixedClasses = useMemo(() => generateAllFixedClasses(), []);

  // Data fetching effects
  useEffect(() => {
    const unsubscribers = [
      db.collection('students').orderBy('name').onSnapshot(snapshot => {
        const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        setStudents(studentsData);
      }),
      db.collection('musicClasses').onSnapshot(snapshot => {
        const classesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MusicClass));
        setMusicClasses(classesData);
      }),
      db.collection('lessonPlans').onSnapshot(snapshot => {
        const plansData = snapshot.docs.map(doc => ({ classId: doc.id, ...doc.data() } as LessonPlan));
        setLessonPlans(plansData);
      }),
      db.collection('workshopLessonPlans').onSnapshot(snapshot => {
        const plansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkshopLessonPlan));
        setWorkshopLessonPlans(plansData);
      }),
      db.collection('studentNotes').orderBy('date', 'desc').onSnapshot(snapshot => {
        const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentNote));
        setStudentNotes(notesData);
      }),
      db.collection('attendances').onSnapshot(snapshot => {
        const attendanceData = snapshot.docs.map(doc => ({ classId: doc.id, ...doc.data() } as Attendance));
        setAttendances(attendanceData);
      }),
    ];
    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  useEffect(() => {
    if (userRole === 'parent' && students.length > 0) {
      const foundChild = students.find(s => s.parentUserId === user.uid);
      setMyChild(foundChild || null);
    }
  }, [userRole, students, user.uid]);
  
  // Handlers
  const handleLogout = () => {
    auth.signOut().then(() => {
        addToast("Você saiu com sucesso.", 'info');
    }).catch(error => {
        addToast(`Erro ao sair: ${error.message}`, 'error');
    });
  };

  const withAdminCheck = <T extends any[]>(func: (...args: T) => Promise<any>, actionName: string) => {
    return async (...args: T) => {
        if (!isAdmin) {
            addToast(`Apenas administradores podem ${actionName}.`, 'error');
            return;
        }
        try {
            await func(...args);
        } catch (error: any) {
            addToast(`Erro ao ${actionName}: ${error.message}`, 'error');
            console.error(`Error during ${actionName}:`, error);
        }
    };
  };

  const handleAddStudent = withAdminCheck(async (studentData: Omit<Student, 'id'>) => {
    await db.collection('students').add(studentData);
    addToast('Aluno adicionado com sucesso!', 'success');
  }, 'adicionar aluno');

  const handleUpdateStudent = withAdminCheck(async (studentData: Student) => {
    const { id, ...data } = studentData;
    await db.collection('students').doc(id).update(data);
    addToast('Aluno atualizado com sucesso!', 'success');
  }, 'atualizar aluno');

  const handleDeleteStudent = withAdminCheck(async (id: string) => {
    await db.collection('students').doc(id).delete();
    addToast('Aluno removido com sucesso!', 'success');
  }, 'remover aluno');

  const handleSaveLessonPlan = withAdminCheck(async (plan: LessonPlan) => {
    await db.collection('lessonPlans').doc(plan.classId).set({ content: plan.content });
    addToast('Plano de aula salvo!', 'success');
  }, 'salvar plano de aula');
  
  const handleSaveWorkshopLessonPlan = withAdminCheck(async (plan: WorkshopLessonPlan) => {
    const { id, ...dataToSave } = plan;
    await db.collection('workshopLessonPlans').doc(id).set(dataToSave, { merge: true });
    addToast(`Plano para a aula ${plan.lessonNumber} salvo!`, 'success');
  }, 'salvar planejamento');

  const handleSaveAttendance = withAdminCheck(async (attendance: Attendance) => {
    await db.collection('attendances').doc(attendance.classId).set({ records: attendance.records });
    addToast('Frequência salva!', 'success');
  }, 'salvar frequência');

  const handleAddNote = withAdminCheck(async (note: Omit<StudentNote, 'id'>) => {
    await db.collection('studentNotes').add(note);
    addToast('Anotação adicionada.', 'success');
  }, 'adicionar anotação');

  const handleDeleteNote = withAdminCheck(async (id: string) => {
    await db.collection('studentNotes').doc(id).delete();
    addToast('Anotação removida.', 'success');
  }, 'remover anotação');

  // Navigation handlers
  const handleSelectStudent = (id: string) => {
    if (userRole === 'parent') return;
    const student = students.find(s => s.id === id);
    if (student) {
        setSelectedStudent(student);
    }
  };
  
  const handleSelectWorkshop = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setCurrentView('workshops');
  };

  const handleBackFromProfile = () => {
    setSelectedStudent(null);
  };
  
  const handleBackFromWorkshopDetail = () => {
    setSelectedWorkshop(null);
  };
  
  const renderView = () => {
    if (selectedStudent && userRole !== 'parent') {
      return (
        <StudentProfile
          student={selectedStudent}
          notes={studentNotes.filter(n => n.studentId === selectedStudent.id)}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onBack={handleBackFromProfile}
          isAdmin={isAdmin}
          onUpdateStudent={handleUpdateStudent}
        />
      );
    }
    if (selectedWorkshop) {
        return (
            <WorkshopDetail
                workshop={selectedWorkshop}
                students={students}
                allClasses={allFixedClasses}
                lessonPlans={lessonPlans}
                onBack={handleBackFromWorkshopDetail}
                isAdmin={isAdmin}
                onUpdateStudent={handleUpdateStudent}
            />
        );
    }

    switch (currentView) {
      case 'dashboard':
        return userRole !== 'parent' ? <Dashboard students={students} workshops={workshops} /> : null;
      case 'students':
        return userRole !== 'parent' ? <Students
          students={students}
          onAdd={handleAddStudent}
          onUpdate={handleUpdateStudent}
          onDelete={handleDeleteStudent}
          onSelectStudent={handleSelectStudent}
          isAdmin={isAdmin}
        /> : null;
      case 'myChild':
        if (userRole === 'parent') {
            if (myChild) {
                return <MyChildProfile student={myChild} />;
            }
            return (
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-on-surface mb-4">Bem-vindo(a)!</h2>
                    <p className="text-on-surface-secondary">Seu perfil de responsável ainda não foi vinculado a um aluno. Por favor, entre em contato com a administração do projeto para fazer a vinculação.</p>
                </div>
            );
        }
        return null;
      case 'workshops':
        return <Workshops students={students} workshops={workshops} onSelectWorkshop={handleSelectWorkshop}/>;
      case 'schedule':
        return <Schedule 
            musicClasses={musicClasses}
            lessonPlans={lessonPlans}
            onSavePlan={handleSaveLessonPlan}
            students={students}
            attendances={attendances}
            onSaveAttendance={handleSaveAttendance}
            isAdmin={isAdmin}
        />;
      case 'syllabus':
          return <Syllabus
              workshops={workshops}
              lessonPlans={workshopLessonPlans}
              onSaveLessonPlan={handleSaveWorkshopLessonPlan}
              isAdmin={isAdmin}
          />;
      default:
        return userRole !== 'parent' ? <Dashboard students={students} workshops={workshops} /> : <div />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
        user={user}
        userRole={userRole}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex-shrink-0 bg-surface border-b border-slate-200">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-4 text-slate-500 hover:text-primary"
              aria-label="Abrir menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
        </div>
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

const App: React.FC = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'viewer' | 'parent' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        try {
            const roleDoc = await db.collection('roles').doc(userAuth.uid).get();
            if (roleDoc.exists) {
                setUserRole(roleDoc.data()?.role || 'viewer');
            } else {
                setUserRole('viewer'); // Default role if not found
            }
            setUser(userAuth);
        } catch (error) {
            console.error("Error fetching user role:", error);
            setUser(userAuth); // Log in user even if role fetch fails
            setUserRole('viewer');
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <SpinnerIcon className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return user && userRole ? <AppContent user={user} userRole={userRole} /> : <Auth />;
}


const Root: React.FC = () => {
    return (
        <ToastProvider>
            <App />
            <ToastContainer />
        </ToastProvider>
    );
};

export default Root;