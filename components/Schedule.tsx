import React, { useState, useMemo } from 'react';
import type { LessonPlan } from '../types';
import { Modal } from './Modal';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import type { WeeklyClass } from '../data/schedule';
import { weeklySchedule, dayNames } from '../data/schedule';


interface ScheduleProps {
  lessonPlans: LessonPlan[];
  onSavePlan: (plan: LessonPlan) => Promise<void>;
}

interface FullClassInfo extends WeeklyClass {
    id: string;
    date: Date;
    aulaNumber: number;
}

const courseStartDate = new Date('2025-11-01T00:00:00Z');
const courseEndDate = new Date('2026-04-30T23:59:59Z');

const getWorkshopColorStyle = (className: string) => {
  const lowerCaseName = className.toLowerCase();
  if (lowerCaseName.includes('teclado')) return { text: 'text-sky-500', icon: 'text-sky-500' };
  if (lowerCaseName.includes('violão')) return { text: 'text-amber-500', icon: 'text-amber-500' };
  if (lowerCaseName.includes('vocal')) return { text: 'text-rose-500', icon: 'text-rose-500' };
  return { text: 'text-primary', icon: 'text-primary' }; // Musicalização
};


export const Schedule: React.FC<ScheduleProps> = ({ lessonPlans, onSavePlan }) => {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<FullClassInfo | null>(null);
  const [lessonPlanContent, setLessonPlanContent] = useState('');

  const allClasses = useMemo(() => {
    const classesRaw = [];
    let currentDate = new Date(courseStartDate);
    while (currentDate <= courseEndDate) {
      const dayOfWeek = currentDate.getUTCDay();
      for (const scheduleItem of weeklySchedule) {
        if (scheduleItem.day === dayOfWeek) {
          const [hours, minutes] = scheduleItem.time.split(':').map(Number);
          const classDate = new Date(currentDate);
          classDate.setUTCHours(hours, minutes, 0, 0);
          
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

  const renderClassList = (classList: FullClassInfo[], title: string) => (
    <div className="bg-surface p-6 rounded-lg shadow-sm mb-8">
      <h3 className="text-xl font-semibold text-on-surface mb-4">{title}</h3>
      {classList.length > 0 ? (
        <ul className="divide-y divide-slate-200">
          {classList.map(c => {
            const hasPlan = lessonPlans.some(p => p.classId === c.id && p.content.trim() !== '');
            const colors = getWorkshopColorStyle(c.name);
            return (
              <li key={c.id} className="py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                     {hasPlan && <PencilSquareIcon className={`w-5 h-5 ${colors.icon} mr-3 flex-shrink-0`} title="Plano de aula preenchido" />}
                    <div>
                      <p className={`font-semibold ${colors.text}`}>{c.name} - Aula {String(c.aulaNumber).padStart(2, '0')}</p>
                      <p className="text-sm text-on-surface-secondary">Prof. {c.teacher}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-4">
                     <div>
                        <p className="font-medium text-on-surface">{c.date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                        <p className="text-sm text-on-surface-secondary">{c.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</p>
                      </div>
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
        title={`Planejamento - ${selectedClass?.name} (${selectedClass?.date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })})`}
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
    </div>
  );
};