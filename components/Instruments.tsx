import React, { useState } from 'react';
import type { Workshop, Student } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { weeklySchedule, dayNames } from '../data/schedule';

interface WorkshopsProps {
  workshops: Workshop[];
  students: Student[];
}

const getWorkshopColorStyle = (workshopName: string) => {
  const lowerCaseName = workshopName.toLowerCase();
  if (lowerCaseName.includes('teclado')) return { text: 'text-sky-500', border: 'border-sky-500' };
  if (lowerCaseName.includes('violão')) return { text: 'text-amber-500', border: 'border-amber-500' };
  if (lowerCaseName.includes('vocal')) return { text: 'text-rose-500', border: 'border-rose-500' };
  return { text: 'text-primary', border: 'border-primary' }; // Musicalização
};

export const Workshops: React.FC<WorkshopsProps> = ({ workshops, students }) => {
  const [expandedWorkshopId, setExpandedWorkshopId] = useState<string | null>(null);
  
  const toggleStudentList = (workshopId: string) => {
    setExpandedWorkshopId(prevId => prevId === workshopId ? null : workshopId);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-on-surface">Oficinas</h2>
      </div>

      {workshops.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workshops.map((workshop) => {
            const workshopClasses = weeklySchedule.filter(c => c.name.toLowerCase().includes(workshop.name.toLowerCase()));
            const workshopStudents = students.filter(s => s.workshopId === workshop.id);
            const colors = getWorkshopColorStyle(workshop.name);

            return (
              <div key={workshop.id} className="bg-surface rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-2xl font-bold ${colors.text} mb-4`}>{workshop.name}</h3>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-on-surface mb-2 flex items-center"><CalendarIcon className="w-5 h-5 mr-2 text-on-surface-secondary"/> Turmas e Horários</h4>
                    {workshopClasses.length > 0 ? (
                      <ul className="space-y-2">
                        {workshopClasses.map(c => (
                          <li key={c.name} className="flex justify-between p-2 rounded-md bg-slate-50">
                            <div>
                                <p className="font-medium text-slate-800">{c.name}</p>
                                <p className="text-sm text-slate-500">Prof. {c.teacher}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-slate-800">{dayNames[c.day]}</p>
                                <p className="text-sm text-slate-500">{c.time}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-on-surface-secondary italic">Nenhuma turma fixa encontrada.</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 px-6 py-4 mt-auto">
                    <button 
                        onClick={() => toggleStudentList(workshop.id)} 
                        className="w-full text-left font-semibold text-on-surface flex justify-between items-center"
                    >
                        <span className="flex items-center"><UserGroupIcon className="w-5 h-5 mr-2 text-on-surface-secondary"/> Alunos Inscritos ({workshopStudents.length})</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${expandedWorkshopId === workshop.id ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {expandedWorkshopId === workshop.id && (
                        <div className={`mt-4 pl-2 border-l-2 ${colors.border}`}>
                            {workshopStudents.length > 0 ? (
                                <ul className="space-y-1">
                                    {workshopStudents.map(student => (
                                        <li key={student.id} className="text-on-surface-secondary ml-2">{student.name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-on-surface-secondary italic ml-2">Nenhum aluno inscrito nesta oficina.</p>
                            )}
                        </div>
                    )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
         <div className="text-center py-10 text-gray-500 bg-surface rounded-lg shadow-sm">
             <p>Nenhuma oficina encontrada.</p>
             <p className="text-sm mt-2">As oficinas são baseadas na grade de horários fixa.</p>
         </div>
      )}
    </div>
  );
};