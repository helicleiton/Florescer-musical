import React from 'react';
import type { Workshop, Student } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { weeklySchedule, dayNames } from '../data/schedule';
import { getWorkshopNameFromClassName } from '../utils/reportGenerator';

interface WorkshopsProps {
  workshops: Workshop[];
  students: Student[];
  onSelectWorkshop: (workshop: Workshop) => void;
}

const getWorkshopColorStyle = (workshopName: string) => {
  const lowerCaseName = workshopName.toLowerCase();
  if (lowerCaseName.includes('teclado')) return { text: 'text-sky-500', bg: 'bg-sky-50' };
  if (lowerCaseName.includes('violão')) return { text: 'text-amber-500', bg: 'bg-amber-50' };
  if (lowerCaseName.includes('vocal')) return { text: 'text-rose-500', bg: 'bg-rose-50' };
  return { text: 'text-primary', bg: 'bg-emerald-50' }; // Musicalização
};

export const Workshops: React.FC<WorkshopsProps> = ({ workshops, students, onSelectWorkshop }) => {

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-on-surface">Oficinas</h2>
      </div>

      {workshops.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workshops.map((workshop) => {
            const workshopClasses = weeklySchedule.filter(c => getWorkshopNameFromClassName(c.name) === workshop.name);
            const workshopStudents = students.filter(s => s.workshopName && getWorkshopNameFromClassName(s.workshopName) === workshop.name);
            const colors = getWorkshopColorStyle(workshop.name);

            return (
              <button 
                key={workshop.id} 
                onClick={() => onSelectWorkshop(workshop)}
                className="bg-surface rounded-lg shadow-sm overflow-hidden flex flex-col text-left hover:shadow-lg hover:ring-2 hover:ring-primary/50 transition-all duration-200"
              >
                <div className="p-6 flex-1">
                  <h3 className={`text-2xl font-bold ${colors.text} mb-4`}>{workshop.name}</h3>

                  <div className="space-y-2">
                     <div className="flex items-center text-on-surface-secondary">
                        <CalendarIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span>{workshopClasses.length} turma{workshopClasses.length !== 1 ? 's' : ''} na grade</span>
                     </div>
                     <div className="flex items-center text-on-surface-secondary">
                        <UserGroupIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span>{workshopStudents.length} aluno{workshopStudents.length !== 1 ? 's' : ''} matriculado{workshopStudents.length !== 1 ? 's' : ''}</span>
                     </div>
                  </div>
                </div>

                <div className={`border-t border-slate-200 px-6 py-3 mt-auto ${colors.bg}`}>
                    <p className={`font-semibold text-sm ${colors.text} text-center`}>
                        Ver Detalhes
                    </p>
                </div>

              </button>
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
