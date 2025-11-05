import React, { useMemo, useState } from 'react';
import type { Workshop, Student, FullClassInfo, LessonPlan, WeeklyClass } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { getWorkshopNameFromClassName } from '../utils/reportGenerator';
import { weeklySchedule, dayNames } from '../data/schedule';
import { Modal } from './Modal';
import { UserPlusIcon } from './icons/UserPlusIcon';

interface WorkshopDetailProps {
  workshop: Workshop;
  students: Student[];
  allClasses: FullClassInfo[];
  lessonPlans: LessonPlan[];
  onBack: () => void;
  isAdmin: boolean;
  onUpdateStudent: (student: Student) => Promise<void>;
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

const AddStudentToTurmaForm: React.FC<{
    availableStudents: Student[];
    onSave: (studentId: string) => void;
    onCancel: () => void;
}> = ({ availableStudents, onSave, onCancel }) => {
    const [selectedStudentId, setSelectedStudentId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudentId) {
            onSave(selectedStudentId);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="student-select" className="block text-sm font-medium text-on-surface-secondary">
                    Selecione um Aluno Avulso
                </label>
                <select
                    id="student-select"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-surface text-on-surface"
                    required
                >
                    <option value="" disabled>Selecione um aluno...</option>
                    {availableStudents.map(student => (
                        <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                </select>
            </div>
            {availableStudents.length === 0 && (
                <p className="text-sm text-center text-on-surface-secondary py-2">Não há alunos avulsos disponíveis para adicionar.</p>
            )}
            <div className="flex justify-end pt-4 space-x-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md shadow-sm hover:bg-slate-200">Cancelar</button>
                <button type="submit" disabled={!selectedStudentId} className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus disabled:opacity-50 disabled:cursor-not-allowed">Adicionar à Turma</button>
            </div>
        </form>
    );
};


export const WorkshopDetail: React.FC<WorkshopDetailProps> = ({ workshop, students, allClasses, lessonPlans, onBack, isAdmin, onUpdateStudent }) => {
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<WeeklyClass | null>(null);

  const workshopTurmas = useMemo(() => {
    return weeklySchedule
      .filter(c => getWorkshopNameFromClassName(c.name) === workshop.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [workshop.name]);

  const availableStudents = useMemo(() => {
    return students.filter(s => !s.workshopName).sort((a,b) => a.name.localeCompare(b.name));
  }, [students]);

  const now = new Date();

  const handleOpenAddStudentModal = (turma: WeeklyClass) => {
    setSelectedTurma(turma);
    setIsAddStudentModalOpen(true);
  };
  
  const handleCloseAddStudentModal = () => {
    setIsAddStudentModalOpen(false);
    setSelectedTurma(null);
  };

  const handleAddStudentToTurma = async (studentId: string) => {
    if (!studentId || !selectedTurma) return;

    const studentToAdd = students.find(s => s.id === studentId);
    if (studentToAdd) {
        await onUpdateStudent({ ...studentToAdd, workshopName: selectedTurma.name });
        handleCloseAddStudentModal();
    }
  };


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
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        <UserGroupIcon className="w-4 h-4 mr-2" />
                        <span>{turmaStudents.length} aluno{turmaStudents.length !== 1 ? 's' : ''}</span>
                    </div>
                    {isAdmin && (
                        <button 
                            onClick={() => handleOpenAddStudentModal(turma)}
                            className="px-3 py-1.5 text-sm font-medium text-secondary bg-secondary/10 border border-secondary/20 rounded-md shadow-sm hover:bg-secondary/20 flex items-center"
                        >
                            <UserPlusIcon className="h-4 w-4 mr-2" />
                            Adicionar Aluno
                        </button>
                    )}
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

      {selectedTurma && (
        <Modal 
            isOpen={isAddStudentModalOpen} 
            onClose={handleCloseAddStudentModal} 
            title={`Adicionar Aluno à Turma ${selectedTurma.name}`}
        >
            <AddStudentToTurmaForm
                availableStudents={availableStudents}
                onSave={handleAddStudentToTurma}
                onCancel={handleCloseAddStudentModal}
            />
        </Modal>
      )}
    </div>
  );
};