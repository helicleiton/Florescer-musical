import React, { useMemo } from 'react';
import type { Workshop, Student, FullClassInfo, LessonPlan } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { getWorkshopNameFromClassName } from '../utils/reportGenerator';
import { weeklySchedule, dayNames } from '../data/schedule';

interface WorkshopDetailProps {
  workshop: Workshop;
  students: Student[];
  allClasses: FullClassInfo[];
  lessonPlans: LessonPlan[];
  onBack: () => void;
}

const ClassTimelineCard: React.FC<{ cls: FullClassInfo; plan: string | undefined }> = ({ cls, plan }) => {
  return (
    <div className="bg-slate-50 p-3 rounded-md border-l-4 border-slate-300 text-sm">
      <div className="flex justify-between items-center mb-1.5">
        <h5 className="font-bold text-slate-800">Aula {String(cls.aulaNumber).padStart(2, '0')}</h5>
        <p className="font-medium text-slate-600">{cls.date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
      </div>
      <div className="text-slate-600 pl-2 border-l-2 border-slate-200">
        <p className="font-semibold text-slate-700 mb-1">Plano:</p>
        <p className="whitespace-pre-wrap text-xs">{plan || 'Nenhum plano definido.'}</p>
      </div>
    </div>
  );
};

export const WorkshopDetail: React.FC<WorkshopDetailProps> = ({ workshop, students, allClasses, lessonPlans, onBack }) => {
  const workshopTurmas = useMemo(() => {
    return weeklySchedule
      .filter(c => getWorkshopNameFromClassName(c.name) === workshop.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [workshop.name]);

  const now = new Date();

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 mr-4 text-on-surface rounded-full hover:bg-slate-200 transition-colors">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-primary">{workshop.name}</h2>
          <p className="text-on-surface-secondary">Detalhes por Turma</p>
        </div>
      </div>

      <div className="space-y-8">
        {workshopTurmas.length > 0 ? workshopTurmas.map(turma => {
          const turmaStudents = students
            .filter(s => s.workshopName === turma.name)
            .sort((a, b) => a.name.localeCompare(b.name));
          
          const turmaClasses = allClasses.filter(c => c.name === turma.name);

          const futureClasses = turmaClasses.filter(c => c.date >= now).sort((a, b) => a.date.getTime() - b.date.getTime());
          const pastClasses = turmaClasses.filter(c => c.date < now).sort((a, b) => b.date.getTime() - a.date.getTime());

          return (
            <div key={turma.name} className="bg-surface p-6 rounded-lg shadow-sm">
              <div className="flex flex-wrap gap-2 justify-between items-center mb-6 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-on-surface">{turma.name}</h3>
                  <p className="text-sm text-on-surface-secondary">{dayNames[turma.day]}, {turma.time} – Prof. {turma.teacher}</p>
                </div>
                <div className="flex items-center text-sm font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    <span>{turmaStudents.length} aluno{turmaStudents.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Student List */}
                <div className="lg:col-span-1">
                  <h4 className="font-semibold text-on-surface mb-3">Alunos Matriculados</h4>
                  <ul className="space-y-2 max-h-96 overflow-y-auto pr-2 -mr-2">
                    {turmaStudents.length > 0 ? turmaStudents.map(student => (
                      <li key={student.id} className="p-2 rounded-md bg-slate-50 text-on-surface-secondary text-sm">
                        {student.name}
                      </li>
                    )) : (
                      <p className="text-sm text-center text-on-surface-secondary py-4">Nenhum aluno nesta turma.</p>
                    )}
                  </ul>
                </div>

                {/* Classes and Plans */}
                <div className="lg:col-span-2">
                  <h4 className="font-semibold text-on-surface mb-3 flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2 text-on-surface-secondary" />
                    Cronograma de Aulas
                  </h4>
                  <div className="space-y-6 max-h-96 overflow-y-auto pr-2 -mr-2">
                     {/* Future Classes */}
                     <div>
                        <h5 className="font-semibold text-primary/80 text-sm mb-2">Próximas Aulas</h5>
                        <div className="space-y-2">
                            {futureClasses.length > 0 ? futureClasses.map(cls => (
                                <ClassTimelineCard
                                    key={cls.id}
                                    cls={cls}
                                    plan={lessonPlans.find(p => p.classId === cls.id)?.content}
                                />
                            )) : (
                                <p className="text-xs text-center text-on-surface-secondary py-3">Nenhuma aula futura agendada.</p>
                            )}
                        </div>
                     </div>

                     {/* Past Classes */}
                     <div>
                        <h5 className="font-semibold text-slate-500 text-sm mb-2">Aulas Passadas</h5>
                         <div className="space-y-2">
                            {pastClasses.length > 0 ? pastClasses.map(cls => (
                                <ClassTimelineCard
                                    key={cls.id}
                                    cls={cls}
                                    plan={lessonPlans.find(p => p.classId === cls.id)?.content}
                                />
                            )) : (
                                 <p className="text-xs text-center text-on-surface-secondary py-3">Nenhuma aula passada encontrada.</p>
                            )}
                        </div>
                     </div>
                  </div>
                </div>
              </div>

            </div>
          );
        }) : (
            <p className="text-center text-on-surface-secondary py-16 bg-surface rounded-lg shadow-sm">
                Nenhuma turma encontrada para esta oficina.
            </p>
        )}
      </div>
    </div>
  );
};