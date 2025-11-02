import React, { useState, useMemo, useEffect } from 'react';
import type { LessonPlan, Student, Attendance, AttendanceStatus, FullClassInfo, MusicClass } from '../types';
import { Modal } from './Modal';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { weeklySchedule, dayNames } from '../data/schedule';
import { generateAttendanceReportPDF } from '../utils/reportGenerator';
import { DownloadIcon } from './icons/DownloadIcon';


interface ScheduleProps {
  musicClasses: MusicClass[];
  lessonPlans: LessonPlan[];
  onSavePlan: (plan: LessonPlan) => Promise<void>;
  students: Student[];
  attendances: Attendance[];
  onSaveAttendance: (attendance: Attendance) => Promise<void>;
  isAdmin: boolean;
}

const SAO_PAULO_OFFSET_HOURS = 3;
// As datas de início/fim do curso agora estão em UTC, representando o momento exato em São Paulo
// A aula inaugural foi em 01/11, as aulas regulares começam em 04/11.
const courseStartDate = new Date('2025-11-04T03:00:00Z');   // Representa 00:00 de 4 de Nov em SP
const courseEndDate = new Date('2026-05-01T02:59:59Z');   // Representa 23:59:59 de 30 de Abr em SP

const getWorkshopColorStyle = (className: string) => {
  const lowerCaseName = className.toLowerCase();
  if (lowerCaseName.includes('teclado')) return { text: 'text-sky-500', border: 'border-sky-500' };
  if (lowerCaseName.includes('violão')) return { text: 'text-amber-500', border: 'border-amber-500' };
  if (lowerCaseName.includes('vocal')) return { text: 'text-rose-500', border: 'border-rose-500' };
  return { text: 'text-primary', border: 'border-primary' }; // Musicalização
};

const AttendanceForm: React.FC<{
  students: Student[];
  initialRecords: { [studentId: string]: AttendanceStatus };
  onSave: (records: { [studentId: string]: AttendanceStatus }) => void;
  onCancel: () => void;
  isAdmin: boolean;
}> = ({ students, initialRecords, onSave, onCancel, isAdmin }) => {
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
                            <label key={option.value} className={`flex items-center space-x-1.5 ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}>
                                <input 
                                    type="radio" 
                                    name={`status-${student.id}`} 
                                    value={option.value}
                                    checked={records[student.id] === option.value}
                                    onChange={() => handleStatusChange(student.id, option.value)}
                                    className={`form-radio h-4 w-4 text-primary focus:${option.radioColor}`}
                                    disabled={!isAdmin}
                                />
                                <span className={`text-sm ${option.color}`}>{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )) : <p className="text-center text-gray-500 py-4">Nenhum aluno encontrado para esta turma.</p>}
        </div>
      <div className="flex justify-end pt-4 mt-4 border-t space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md shadow-sm hover:bg-slate-200">Fechar</button>
        {isAdmin && (
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus">Salvar Frequência</button>
        )}
      </div>
    </form>
  );
};


export const Schedule: React.FC<ScheduleProps> = ({ musicClasses, lessonPlans, onSavePlan, students, attendances, onSaveAttendance, isAdmin }) => {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  const [selectedClass, setSelectedClass] = useState<FullClassInfo | null>(null);
  const [lessonPlanContent, setLessonPlanContent] = useState('');
  
  const [studentsForSelectedClass, setStudentsForSelectedClass] = useState<Student[]>([]);
  const [currentAttendance, setCurrentAttendance] = useState<{ classId: string, records: { [key: string]: AttendanceStatus} } | null>(null);
  
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState<'upcoming' | 'past'>('upcoming');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [extraClassesLoaded, setExtraClassesLoaded] = useState(false);

  const uniqueTeachers = useMemo(() => {
    const teachers = new Set(weeklySchedule.map(c => c.teacher));
    return Array.from(teachers).sort();
  }, []);

  const uniqueTopics = useMemo(() => {
      const topics = new Set(weeklySchedule.map(c => c.name));
      return Array.from(topics).sort();
  }, []);

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
    
    const classesByName: { [key: string]: typeof classesRaw } = {};
    for (const cls of classesRaw) {
      if (!classesByName[cls.name]) {
        classesByName[cls.name] = [];
      }
      classesByName[cls.name].push(cls);
    }

    const enumeratedClasses: any[] = [];
    Object.keys(classesByName).forEach(className => {
      const sortedGroup = classesByName[className].sort((a, b) => a.date.getTime() - b.date.getTime());
      sortedGroup.forEach((cls, index) => {
        enumeratedClasses.push({ ...cls, aulaNumber: index + 1 });
      });
    });

    const fixedClasses: FullClassInfo[] = enumeratedClasses.map(cls => ({...cls, isExtra: false}));

    if (!extraClassesLoaded) {
        return fixedClasses;
    }

    const extraClasses: FullClassInfo[] = musicClasses.map(mc => {
        const classDate = new Date(mc.date);
        return {
            id: mc.id,
            name: mc.topic,
            teacher: mc.teacher,
            date: classDate,
            day: classDate.getUTCDay(),
            time: classDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', timeZone: 'America/Sao_Paulo'}),
            isExtra: true,
            studentIds: mc.studentIds,
        };
    });

    return [...fixedClasses, ...extraClasses];
  }, [musicClasses, extraClassesLoaded]);
  
  const filteredClasses = useMemo(() => {
      return allClasses.filter(c => {
          const teacherMatch = selectedTeacher === 'all' || c.teacher === selectedTeacher;
          const topicMatch = selectedTopic === 'all' || c.name === selectedTopic;
          
          const startFilterDate = startDate ? new Date(startDate) : null;
          if (startFilterDate) {
            startFilterDate.setUTCHours(0, 0, 0, 0);
          }

          const endFilterDate = endDate ? new Date(endDate) : null;
          if (endFilterDate) {
            endFilterDate.setUTCHours(23, 59, 59, 999);
          }

          const startDateMatch = !startFilterDate || c.date >= startFilterDate;
          const endDateMatch = !endFilterDate || c.date <= endFilterDate;

          return teacherMatch && topicMatch && startDateMatch && endDateMatch;
      });
  }, [allClasses, selectedTeacher, selectedTopic, startDate, endDate]);

  const now = new Date();
  const upcomingClasses = filteredClasses.filter(c => c.date >= now).sort((a, b) => a.date.getTime() - b.date.getTime());
  const pastClasses = filteredClasses.filter(c => c.date < now).sort((a, b) => b.date.getTime() - a.date.getTime());

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
    const studentsInClass = cls.isExtra
        ? students.filter(s => cls.studentIds?.includes(s.id))
        : students.filter(s => s.workshopName === cls.name);

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

  const handleClearFilters = () => {
    setSelectedTeacher('all');
    setSelectedTopic('all');
    setStartDate('');
    setEndDate('');
  };
  
  const handleGenerateReport = async () => {
    const classesToReport = pastClasses;
    if (classesToReport.length === 0) {
        alert("Não há aulas passadas (com os filtros atuais) para gerar um relatório.");
        return;
    }
    setIsGeneratingPdf(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 100));
        generateAttendanceReportPDF(classesToReport, students, attendances);
    } catch (error) {
        console.error("Failed to generate PDF report:", error);
    } finally {
        setIsGeneratingPdf(false);
    }
  };
  
  const handleLoadExtraClasses = () => {
    setExtraClassesLoaded(true);
  };

  const renderClassList = (classList: FullClassInfo[]) => {
    const groupClassesByDay = (classes: FullClassInfo[]): Map<string, FullClassInfo[]> => {
      const groups = new Map<string, FullClassInfo[]>();
      classes.forEach(cls => {
          const dateKey = cls.date.toISOString().split('T')[0];
          if (!groups.has(dateKey)) {
              groups.set(dateKey, []);
          }
          groups.get(dateKey)!.push(cls);
      });
      return groups;
    };
  
    const groupedClasses = groupClassesByDay(classList);
  
    if (groupedClasses.size === 0) {
      return (
        <div className="text-center text-on-surface-secondary py-16 bg-surface rounded-lg shadow-sm">
          <p>Nenhuma aula encontrada com os filtros selecionados.</p>
        </div>
      );
    }
  
    return (
      <div className="space-y-8">
        {Array.from(groupedClasses.entries()).map(([dateKey, classesForDay]) => {
          const date = new Date(`${dateKey}T00:00:00`);
          const formattedDate = date.toLocaleDateString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
  
          return (
            <div key={dateKey}>
              <h3 className="text-xl font-bold text-on-surface mb-4 pb-2 border-b-2 border-primary/20 capitalize">
                {formattedDate}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {classesForDay.sort((a,b) => a.date.getTime() - b.date.getTime()).map(c => {
                  const hasPlan = lessonPlans.some(p => p.classId === c.id && p.content.trim() !== '');
                  const attendanceRecord = attendances.find(a => a.classId === c.id);
                  const hasAttendance = attendanceRecord && Object.keys(attendanceRecord.records).length > 0;
                  const colors = getWorkshopColorStyle(c.name);
  
                  return (
                    <div key={c.id} className={`bg-surface rounded-lg shadow-md border-l-4 ${c.isExtra ? 'border-secondary' : colors.border} flex flex-col overflow-hidden`}>
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-lg text-on-surface">{c.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}</p>
                            <p className={`font-semibold ${c.isExtra ? 'text-secondary' : colors.text}`}>{c.name}</p>
                            <p className="text-sm text-on-surface-secondary">{c.isExtra ? 'Aula Avulsa' : `Aula ${String(c.aulaNumber).padStart(2, '0')}`} &bull; Prof. {c.teacher}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {hasPlan && (
                              <div className="p-1.5 bg-sky-100 rounded-full" title="Plano de aula preenchido">
                                <ClipboardDocumentListIcon className="w-5 h-5 text-sky-600" />
                              </div>
                            )}
                            {hasAttendance && (
                              <div className="p-1.5 bg-green-100 rounded-full" title="Frequência preenchida">
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-50/70 p-3 grid grid-cols-2 gap-2 border-t border-slate-200">
                          <button onClick={() => openAttendanceModal(c)} className="w-full px-3 py-1.5 text-sm font-medium text-primary border border-primary/50 rounded-md hover:bg-primary/10 transition-colors whitespace-nowrap">
                              Frequência
                          </button>
                          <button onClick={() => openPlanModal(c)} className="w-full px-3 py-1.5 text-sm font-medium text-secondary border border-secondary/50 rounded-md hover:bg-secondary/10 transition-colors whitespace-nowrap">
                              {hasPlan ? 'Ver Plano' : 'Planejar'}
                          </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-on-surface mb-6">Horário das Aulas</h2>
      
      <div className="bg-surface p-4 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
              <div className="lg:col-span-1">
                  <label htmlFor="teacher-filter" className="block text-sm font-medium text-on-surface-secondary mb-1">
                      Professor
                  </label>
                  <select
                      id="teacher-filter"
                      value={selectedTeacher}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface text-on-surface"
                  >
                      <option value="all">Todos</option>
                      {uniqueTeachers.map(teacher => (
                          <option key={teacher} value={teacher}>{teacher}</option>
                      ))}
                  </select>
              </div>
              <div className="lg:col-span-1">
                  <label htmlFor="topic-filter" className="block text-sm font-medium text-on-surface-secondary mb-1">
                      Oficina
                  </label>
                  <select
                      id="topic-filter"
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface text-on-surface"
                  >
                      <option value="all">Todas</option>
                      {uniqueTopics.map(topic => (
                          <option key={topic} value={topic}>{topic}</option>
                      ))}
                  </select>
              </div>
              <div className="lg:col-span-1">
                  <label htmlFor="start-date-filter" className="block text-sm font-medium text-on-surface-secondary mb-1">
                      Data de Início
                  </label>
                  <input
                      type="date"
                      id="start-date-filter"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface text-on-surface"
                  />
              </div>
              <div className="lg:col-span-1">
                  <label htmlFor="end-date-filter" className="block text-sm font-medium text-on-surface-secondary mb-1">
                      Data de Fim
                  </label>
                  <input
                      type="date"
                      id="end-date-filter"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface text-on-surface"
                  />
              </div>
               <div className="lg:col-span-1">
                    <button
                        onClick={handleLoadExtraClasses}
                        disabled={extraClassesLoaded}
                        className="w-full px-4 py-2 text-sm font-medium text-secondary bg-secondary/10 border border-secondary/20 rounded-md shadow-sm hover:bg-secondary/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v4m-2-2h4" />
                        </svg>
                        {extraClassesLoaded ? 'Avulsas OK' : 'Ver Avulsas'}
                    </button>
              </div>
              <div className="lg:col-span-1">
                  <button 
                      onClick={handleClearFilters}
                      className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md shadow-sm hover:bg-slate-200"
                  >
                      Limpar Filtros
                  </button>
              </div>
              <div className="lg:col-span-1">
                  <button 
                      onClick={handleGenerateReport}
                      disabled={isGeneratingPdf}
                      className="w-full px-4 py-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-md shadow-sm hover:bg-primary/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-wait"
                  >
                      <DownloadIcon className="h-5 w-5 mr-2" />
                      {isGeneratingPdf ? 'Gerando...' : 'Relatório'}
                  </button>
              </div>
          </div>
      </div>


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
      
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setViewMode('upcoming')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'upcoming'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Aulas Futuras
            </button>
            <button
              onClick={() => setViewMode('past')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'past'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Aulas Passadas
            </button>
          </nav>
        </div>
      </div>
      
      {viewMode === 'upcoming' && renderClassList(upcomingClasses)}
      {viewMode === 'past' && renderClassList(pastClasses)}

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
            className="w-full p-2 bg-surface text-on-surface border border-slate-300 rounded-md focus:ring-primary focus:border-primary placeholder:text-on-surface-secondary"
            placeholder={isAdmin ? "Digite o conteúdo e os objetivos para esta aula..." : "Visualizando plano de aula..."}
            readOnly={!isAdmin}
          ></textarea>
          <div className="flex justify-end pt-4 space-x-2">
            <button onClick={() => setIsPlanModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md shadow-sm hover:bg-slate-200">Fechar</button>
            {isAdmin && (
              <button onClick={handleSavePlan} className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus">Salvar Plano</button>
            )}
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
                isAdmin={isAdmin}
            />
        </Modal>
      )}

    </div>
  );
};
