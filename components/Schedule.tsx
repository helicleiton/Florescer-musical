import React, { useState, useMemo, useEffect } from 'react';
import type { LessonPlan, Student, Attendance, AttendanceStatus } from '../types';
import { Modal } from './Modal';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import type { WeeklyClass } from '../data/schedule';
import { weeklySchedule, dayNames } from '../data/schedule';


interface ScheduleProps {
  lessonPlans: LessonPlan[];
  onSavePlan: (plan: LessonPlan) => Promise<void>;
  students: Student[];
  attendances: Attendance[];
  onSaveAttendance: (attendance: Attendance) => Promise<void>;
}

interface FullClassInfo extends WeeklyClass {
    id: string;
    date: Date;
    aulaNumber: number;
}

const SAO_PAULO_OFFSET_HOURS = 3;
// As datas de início/fim do curso agora estão em UTC, representando o momento exato em São Paulo
const courseStartDate = new Date('2025-11-01T03:00:00Z'); // Representa 00:00 de 1 de Nov em SP
const courseEndDate = new Date('2026-05-01T02:59:59Z');   // Representa 23:59:59 de 30 de Abr em SP

const getWorkshopColorStyle = (className: string) => {
  const lowerCaseName = className.toLowerCase();
  if (lowerCaseName.includes('teclado')) return { text: 'text-sky-500', icon: 'text-sky-500' };
  if (lowerCaseName.includes('violão')) return { text: 'text-amber-500', icon: 'text-amber-500' };
  if (lowerCaseName.includes('vocal')) return { text: 'text-rose-500', icon: 'text-rose-500' };
  return { text: 'text-primary', icon: 'text-primary' }; // Musicalização
};

const AttendanceForm: React.FC<{
  students: Student[];
  initialRecords: { [studentId: string]: AttendanceStatus };
  onSave: (records: { [studentId: string]: AttendanceStatus }) => void;
  onCancel: () => void;
}> = ({ students, initialRecords, onSave, onCancel }) => {
  const [records, setRecords] = useState(initialRecords);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(records);
  };
  
  const statusOptions: { value: AttendanceStatus, label: string, color: string, radioColor: string }[] = [
      { value: 'present', label: 'Presente', color: 'text-green-600', radioColor: 'ring-green-500' },
      { value: 'absent', label: 'Ausente', color: 'text-red-600', radioColor: 'ring-red-500' },
      { value: 'justified', label: 'Justificada', color: 'text-amber-600', radioColor: 'ring-amber-500' },
  ];

  return (
    <form onSubmit={handleSubmit}>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 -mr-2">
            {students.length > 0 ? students.sort((a,b) => a.name.localeCompare(b.name)).map(student => (
                <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md bg-slate-50">
                    <p className="font-medium text-gray-800 mb-2 sm:mb-0">{student.name}</p>
                    <div className="flex items-center space-x-4">
                        {statusOptions.map(option => (
                            <label key={option.value} className="flex items-center space-x-1.5 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name={`status-${student.id}`} 
                                    value={option.value}
                                    checked={records[student.id] === option.value}
                                    onChange={() => handleStatusChange(student.id, option.value)}
                                    className={`form-radio h-4 w-4 text-primary focus:${option.radioColor}`}
                                />
                                <span className={`text-sm ${option.color}`}>{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )) : <p className="text-center text-gray-500 py-4">Nenhum aluno encontrado para esta turma.</p>}
        </div>
      <div className="flex justify-end pt-4 mt-4 border-t space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus">Salvar Frequência</button>
      </div>
    </form>
  );
};


export const Schedule: React.FC<ScheduleProps> = ({ lessonPlans, onSavePlan, students, attendances, onSaveAttendance }) => {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  const [selectedClass, setSelectedClass] = useState<FullClassInfo | null>(null);
  const [lessonPlanContent, setLessonPlanContent] = useState('');
  
  const [studentsForSelectedClass, setStudentsForSelectedClass] = useState<Student[]>([]);
  const [currentAttendance, setCurrentAttendance] = useState<{ classId: string, records: { [key: string]: AttendanceStatus} } | null>(null);

  const allClasses = useMemo(() => {
    const classesRaw = [];
    let currentDate = new Date(courseStartDate);
    while (currentDate <= courseEndDate) {
      const dayOfWeek = currentDate.getUTCDay();
      for (const scheduleItem of weeklySchedule) {
        if (scheduleItem.day === dayOfWeek) {
          const startTime = scheduleItem.time.split(' ')[0];
          const [hours, minutes] = startTime.split(':').map(Number);
          const classDate = new Date(currentDate);
          // Ajusta o horário para UTC, considerando que o horário da grade é de São Paulo (UTC-3)
          classDate.setUTCHours(hours + SAO_PAULO_OFFSET_HOURS, minutes, 0, 0);
          
          classesRaw.push({
            id: `${scheduleItem.name}-${classDate.toISOString()}`,
            name: scheduleItem.name,
            teacher: scheduleItem.teacher,
            date: classDate,
            day: scheduleItem.day,
            time: scheduleItem.time
          });
        }
      }
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    // Group by class name to enumerate
    const classesByName: { [key: string]: typeof classesRaw } = {};
    for (const cls of classesRaw) {
      if (!classesByName[cls.name]) {
        classesByName[cls.name] = [];
      }
      classesByName[cls.name].push(cls);
    }

    const enumeratedClasses: FullClassInfo[] = [];
    Object.keys(classesByName).forEach(className => {
      const sortedGroup = classesByName[className].sort((a, b) => a.date.getTime() - b.date.getTime());
      sortedGroup.forEach((cls, index) => {
        enumeratedClasses.push({ ...cls, aulaNumber: index + 1 });
      });
    });

    return enumeratedClasses;
  }, []);

  const now = new Date();
  const upcomingClasses = allClasses.filter(c => c.date >= now).sort((a, b) => a.date.getTime() - b.date.getTime());
  const pastClasses = allClasses.filter(c => c.date < now).sort((a, b) => b.date.getTime() - a.date.getTime());

  const openPlanModal = (cls: FullClassInfo) => {
    setSelectedClass(cls);
    const existingPlan = lessonPlans.find(p => p.classId === cls.id);
    setLessonPlanContent(existingPlan?.content || '');
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = () => {
    if (!selectedClass) return;
    onSavePlan({ classId: selectedClass.id, content: lessonPlanContent });
    setIsPlanModalOpen(false);
    setSelectedClass(null);
    setLessonPlanContent('');
  };

  const openAttendanceModal = (cls: FullClassInfo) => {
    const studentsInClass = students.filter(s => s.workshopName === cls.name);
    const existingAttendance = attendances.find(a => a.classId === cls.id) || { classId: cls.id, records: {} };
    
    setSelectedClass(cls);
    setStudentsForSelectedClass(studentsInClass);
    setCurrentAttendance(existingAttendance);
    setIsAttendanceModalOpen(true);
  };
  
  const handleSaveAttendance = (records: { [studentId: string]: AttendanceStatus }) => {
      if (!selectedClass) return;
      onSaveAttendance({ classId: selectedClass.id, records });
      setIsAttendanceModalOpen(false);
  };

  const renderClassList = (classList: FullClassInfo[], title: string) => (
    <div className="bg-surface p-6 rounded-lg shadow-sm mb-8">
      <h3 className="text-xl font-semibold text-on-surface mb-4">{title}</h3>
      {classList.length > 0 ? (
        <ul className="divide-y divide-slate-200">
          {classList.map(c => {
            const hasPlan = lessonPlans.some(p => p.classId === c.id && p.content.trim() !== '');
            const attendanceRecord = attendances.find(a => a.classId === c.id);
            const hasAttendance = attendanceRecord && Object.keys(attendanceRecord.records).length > 0;
            const colors = getWorkshopColorStyle(c.name);
            return (
              <li key={c.id} className="py-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center">
                     <div className="flex flex-col items-center mr-3 space-y-1">
                        {hasPlan && <PencilSquareIcon className={`w-5 h-5 ${colors.icon}`} title="Plano de aula preenchido" />}
                        {hasAttendance && <CheckCircleIcon className="w-5 h-5 text-green-500" title="Frequência preenchida" />}
                     </div>
                    <div>
                      <p className={`font-semibold ${colors.text}`}>{c.name} - Aula {String(c.aulaNumber).padStart(2, '0')}</p>
                      <p className="text-sm text-on-surface-secondary">Prof. {c.teacher}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                     <div className="text-right">
                        <p className="font-medium text-on-surface">{c.date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
                        <p className="text-sm text-on-surface-secondary">{c.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}</p>
                      </div>
                      <button onClick={() => openAttendanceModal(c)} className="px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary/10 transition-colors">
                        {hasAttendance ? 'Ver/Editar' : 'Frequência'}
                      </button>
                      <button onClick={() => openPlanModal(c)} className="px-3 py-1.5 text-sm font-medium text-secondary border border-secondary rounded-md hover:bg-secondary/10 transition-colors">
                        Planejar
                      </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-center text-on-surface-secondary py-8">Nenhuma aula nesta categoria.</p>
      )}
    </div>
  );

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-on-surface mb-6">Horário das Aulas</h2>

      <div className="bg-surface p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-xl font-semibold text-on-surface mb-4">Grade Semanal de Referência</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }, (_, i) => (i + 1) % 7).map(dayIndex => {
             // Show only days with classes: Tue, Thu, Sat
            if (![2, 4, 6].includes(dayIndex)) return null;

            const dayClasses = weeklySchedule.filter(c => c.day === dayIndex).sort((a, b) => a.time.localeCompare(b.time));
            if (dayClasses.length === 0) return null;
            return (
              <div key={dayIndex}>
                <h4 className="font-bold text-center mb-2 border-b pb-2">{dayNames[dayIndex]}</h4>
                <div className="space-y-2">
                  {dayClasses.map(c => (
                    <div key={`${c.day}-${c.time}-${c.name}`} className="text-sm p-2 rounded-md bg-slate-50 text-center">
                      <p className="font-semibold text-slate-800">{c.time}</p>
                      <p className="text-slate-600">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.teacher}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          }).filter(Boolean)}
        </div>
      </div>

      {renderClassList(upcomingClasses, "Aulas Futuras")}
      {renderClassList(pastClasses, "Aulas Passadas")}

      <Modal 
        isOpen={isPlanModalOpen} 
        onClose={() => setIsPlanModalOpen(false)} 
        title={`Planejamento - ${selectedClass?.name} (${selectedClass?.date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`}
      >
        <div>
          <textarea
            value={lessonPlanContent}
            onChange={(e) => setLessonPlanContent(e.target.value)}
            rows={10}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            placeholder="Digite o conteúdo e os objetivos para esta aula..."
          ></textarea>
          <div className="flex justify-end pt-4 space-x-2">
            <button onClick={() => setIsPlanModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200">Cancelar</button>
            <button onClick={handleSavePlan} className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus">Salvar Plano</button>
          </div>
        </div>
      </Modal>

      {selectedClass && (
        <Modal
            isOpen={isAttendanceModalOpen}
            onClose={() => setIsAttendanceModalOpen(false)}
            title={`Frequência - ${selectedClass?.name} (${selectedClass?.date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`}
        >
            <AttendanceForm
                students={studentsForSelectedClass}
                initialRecords={currentAttendance?.records || {}}
                onSave={handleSaveAttendance}
                onCancel={() => setIsAttendanceModalOpen(false)}
            />
        </Modal>
      )}

    </div>
  );
};