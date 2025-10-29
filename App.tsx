import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Workshops } from './components/Instruments';
import { Classes } from './components/Classes';
import { Schedule } from './components/Schedule';
import { StudentProfile } from './components/StudentProfile';
import type { Student, MusicClass, Workshop, LessonPlan, StudentNote } from './types';
import { MenuIcon } from './components/icons/MenuIcon';
import { MusicalNoteIcon } from './components/icons/MusicalNoteIcon';
import { db } from './firebase/config';
import { collection, onSnapshot, doc, addDoc, setDoc, deleteDoc, query, orderBy, writeBatch } from 'firebase/firestore';
import { weeklySchedule } from './data/schedule';

type View = 'dashboard' | 'students' | 'classes' | 'workshops' | 'schedule';

const getWorkshopNameFromClassName = (className: string): string => {
  const parts = className.split(' ');
  // Verifica se a última parte é uma letra maiúscula única (ex: "A", "B")
  if (parts.length > 1 && /^[A-Z]$/.test(parts[parts.length - 1])) {
    return parts.slice(0, -1).join(' ');
  }
  return className;
};

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<MusicClass[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);

  const derivedWorkshops: Workshop[] = useMemo(() => {
    const workshopNames = new Set(weeklySchedule.map(c => getWorkshopNameFromClassName(c.name)));
    return Array.from(workshopNames).map(name => ({
        id: name.toLowerCase().replace(/\s/g, '-'),
        name: name
    })).sort((a,b) => a.name.localeCompare(b.name));
  }, []);

  // --- Efeitos para ouvir as coleções do Firestore em tempo real ---
  useEffect(() => {
    const qStudents = query(collection(db, 'students'), orderBy('name', 'asc'));
    const unsubscribeStudents = onSnapshot(qStudents, (querySnapshot) => {
      const studentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(studentsData);
      setLoading(false); // Desativa o loading quando os dados chegam
    }, (error) => {
      console.error("Erro ao buscar alunos: ", error);
      setLoading(false); // Desativa o loading mesmo se der erro
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
    
    const qNotes = query(collection(db, 'studentNotes'), orderBy('date', 'desc'));
    const unsubscribeNotes = onSnapshot(qNotes, (querySnapshot) => {
        const notesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentNote));
        setStudentNotes(notesData);
    });

    // Limpa os listeners ao desmontar o componente
    return () => {
      unsubscribeStudents();
      unsubscribeClasses();
      unsubscribeLessonPlans();
      unsubscribeNotes();
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
  
  const addStudentNote = async (noteData: Omit<StudentNote, 'id'>) => {
      await addDoc(collection(db, 'studentNotes'), noteData);
  };
  const deleteStudentNote = async (id: string) => {
      await deleteDoc(doc(db, 'studentNotes', id));
  };

  const seedDatabase = async () => {
    if (!window.confirm("Isso irá apagar os dados existentes e inserir dados de exemplo no banco de dados. Deseja continuar?")) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);

      // Sample Students
      const student1Ref = doc(collection(db, 'students'));
      batch.set(student1Ref, { name: 'Ana Silva', age: 12, workshopName: 'Violão A', registrationDate: new Date().toISOString() });
      
      const student2Ref = doc(collection(db, 'students'));
      batch.set(student2Ref, { name: 'Bruno Costa', age: 10, workshopName: 'Teclado B', registrationDate: new Date().toISOString() });
      
      const student3Ref = doc(collection(db, 'students'));
      batch.set(student3Ref, { name: 'Carla Dias', age: 8, workshopName: 'Musicalização Infantil A', registrationDate: new Date().toISOString() });

      const student4Ref = doc(collection(db, 'students'));
      batch.set(student4Ref, { name: 'Daniel Faria', age: 14, workshopName: null, registrationDate: new Date().toISOString() });

      const student5Ref = doc(collection(db, 'students'));
      batch.set(student5Ref, { name: 'Elisa Gomes', age: 15, workshopName: 'Técnica Vocal', registrationDate: new Date().toISOString() });
      
      const student6Ref = doc(collection(db, 'students'));
      batch.set(student6Ref, { name: 'Felipe Mendes', age: 13, workshopName: 'Violão C', registrationDate: new Date().toISOString() });

      const student7Ref = doc(collection(db, 'students'));
      batch.set(student7Ref, { name: 'Gabriela Lima', age: 11, workshopName: 'Teclado D', registrationDate: new Date().toISOString() });

      // Sample Classes
      const classDate = new Date();
      classDate.setDate(classDate.getDate() + 7);
      const class1Ref = doc(collection(db, 'classes'));
      batch.set(class1Ref, { topic: 'Introdução a Acordes Maiores', teacher: 'Helicleiton', date: classDate.toISOString(), studentIds: [student1Ref.id, student4Ref.id] });
      
      const class2Date = new Date();
      class2Date.setDate(class2Date.getDate() + 10);
      const class2Ref = doc(collection(db, 'classes'));
      batch.set(class2Ref, { topic: 'Leitura de Partituras', teacher: 'Karla Silva', date: class2Date.toISOString(), studentIds: [student3Ref.id, student7Ref.id] });

      await batch.commit();
      alert('Dados de exemplo inseridos com sucesso!');
    } catch (error) {
      console.error("Erro ao inserir dados de exemplo: ", error);
      alert("Ocorreu um erro ao inserir os dados. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
  };

  const handleBackToStudents = () => {
    setSelectedStudentId(null);
    setCurrentView('students'); // Garante que a view correta seja mostrada ao voltar
  };

  const renderView = () => {
    if (loading) {
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
                    classes={classes}
                    notes={studentNotes.filter(n => n.studentId === selectedStudentId)}
                    onAddNote={addStudentNote}
                    onDeleteNote={deleteStudentNote}
                    onBack={handleBackToStudents}
                />;
    }
    
    const showSeedButton = !loading && students.length === 0 && classes.length === 0;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
                  students={students} 
                  classes={classes} 
                  workshops={derivedWorkshops} 
                  onSeedDatabase={seedDatabase}
                  showSeedButton={showSeedButton}
                />;
      case 'students':
        return <Students 
                  students={students} 
                  onAdd={addStudent} 
                  onUpdate={updateStudent} 
                  onDelete={deleteStudent} 
                  onSelectStudent={handleSelectStudent}
                />;
      case 'workshops':
        return <Workshops 
                  workshops={derivedWorkshops} 
                  students={students} 
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
        return <Dashboard 
                  students={students} 
                  classes={classes} 
                  workshops={derivedWorkshops} 
                  onSeedDatabase={seedDatabase}
                  showSeedButton={showSeedButton}
                />;
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