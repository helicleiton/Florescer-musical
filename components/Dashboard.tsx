import React from 'react';
import type { Student, MusicClass, Workshop } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { MusicalNoteIcon } from './icons/MusicalNoteIcon';

interface DashboardProps {
  students: Student[];
  classes: MusicClass[];
  workshops: Workshop[];
  onSeedDatabase: () => void;
  showSeedButton: boolean;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-surface p-6 rounded-lg shadow-sm flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-3xl font-bold text-on-surface">{value}</p>
      <p className="text-on-surface-secondary">{label}</p>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ students, classes, workshops, onSeedDatabase, showSeedButton }) => {
  if (showSeedButton) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-center">
        <div className="p-4 mb-4 text-white rounded-full bg-primary">
            <MusicalNoteIcon className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-on-surface mb-4">Bem-vindo ao Florescer Musical!</h2>
        <p className="max-w-md text-on-surface-secondary mb-8">
          Seu banco de dados está pronto, mas parece vazio. Clique no botão abaixo para adicionar alguns dados de exemplo e ver o aplicativo em ação.
        </p>
        <button
          onClick={onSeedDatabase}
          className="px-6 py-3 font-semibold text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transition-all"
        >
          Inserir Dados de Exemplo
        </button>
      </div>
    );
  }

  const studentsInWorkshops = students.filter(s => s.workshopName).length;
  const upcomingClasses = classes
    .filter(c => new Date(c.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Desconhecido';

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-on-surface mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<UserGroupIcon className="w-6 h-6 text-white"/>} 
          label="Total de Alunos" 
          value={students.length} 
          color="bg-sky-500"
        />
        <StatCard 
          icon={<CalendarIcon className="w-6 h-6 text-white"/>} 
          label="Próximas Aulas" 
          value={upcomingClasses.length} 
          color="bg-emerald-500"
        />
        <StatCard 
          icon={<MusicalNoteIcon className="w-6 h-6 text-white"/>} 
          label="Alunos em Oficinas" 
          value={studentsInWorkshops}
          color="bg-amber-500"
        />
      </div>

      <div className="bg-surface p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-on-surface mb-4">Próximas Aulas Agendadas</h3>
        {upcomingClasses.length > 0 ? (
          <ul className="divide-y divide-slate-200">
            {upcomingClasses.map(c => (
              <li key={c.id} className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-primary">{c.topic}</p>
                    <p className="text-sm text-on-surface-secondary">Prof. {c.teacher}</p>
                    <p className="text-sm text-on-surface-secondary mt-1">
                      Alunos: {c.studentIds.map(getStudentName).join(', ') || 'Nenhum aluno inscrito'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-on-surface">{new Date(c.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                    <p className="text-sm text-on-surface-secondary">{new Date(c.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', timeZone: 'UTC'})}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-on-surface-secondary py-8">Nenhuma aula agendada.</p>
        )}
      </div>
    </div>
  );
};