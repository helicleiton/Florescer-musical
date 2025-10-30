import React, { useMemo } from 'react';
import type { Student, Workshop } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { weeklySchedule } from '../data/schedule';

// Adicionado para alinhar com a data de início real do curso
const courseStartDate = new Date('2025-11-01T03:00:00Z'); // Representa 00:00 de 1 de Nov em SP

interface DashboardProps {
  students: Student[];
  workshops: Workshop[];
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

export const Dashboard: React.FC<DashboardProps> = ({ students, workshops }) => {
  const upcomingFixedClasses = useMemo(() => {
    const SAO_PAULO_OFFSET_HOURS = 3;
    const courseEndDate = new Date('2026-05-01T02:59:59Z'); // Corresponds to 2026-04-30 23:59:59 in São Paulo (UTC-3)
    const allClasses = [];
    
    const now = new Date();
    // A verificação deve começar a partir de hoje ou da data de início do curso, o que for mais tarde.
    let currentDate = now > courseStartDate ? now : new Date(courseStartDate);
    currentDate.setUTCHours(0, 0, 0, 0);

    // Itera dia a dia até o fim do curso
    while (currentDate <= courseEndDate) {
      const dayOfWeek = currentDate.getUTCDay();
      const scheduledToday = weeklySchedule.filter(item => item.day === dayOfWeek);

      if (scheduledToday.length > 0) {
        for (const scheduleItem of scheduledToday) {
            const startTime = scheduleItem.time.split(' ')[0];
            const [hours, minutes] = startTime.split(':').map(Number);
            const classDate = new Date(currentDate);
            // Ajusta o horário para UTC, considerando que o horário da grade é de São Paulo (UTC-3)
            classDate.setUTCHours(hours + SAO_PAULO_OFFSET_HOURS, minutes, 0, 0);

            // Adiciona apenas se o horário da aula for no futuro
            if (classDate > new Date()) {
                allClasses.push({
                    id: `${scheduleItem.name}-${classDate.toISOString()}`,
                    name: scheduleItem.name,
                    teacher: scheduleItem.teacher,
                    date: classDate,
                });
            }
        }
      }
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    return allClasses.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []);
  
  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
      .slice(0, 5);
  }, [students]);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-on-surface mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard 
          icon={<UserGroupIcon className="w-6 h-6 text-white"/>} 
          label="Total de Alunos" 
          value={students.length} 
          color="bg-sky-500"
        />
        <StatCard 
          icon={<CalendarIcon className="w-6 h-6 text-white"/>} 
          label="Aulas Restantes" 
          value={upcomingFixedClasses.length} 
          color="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-on-surface mb-4">Próximas Aulas da Grade</h3>
          {upcomingFixedClasses.length > 0 ? (
            <ul className="divide-y divide-slate-200">
              {upcomingFixedClasses.slice(0, 5).map(c => (
                <li key={c.id} className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-primary">{c.name}</p>
                      <p className="text-sm text-on-surface-secondary">Prof. {c.teacher}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-on-surface">{c.date.toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'})}</p>
                      <p className="text-sm text-on-surface-secondary">{c.date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', timeZone: 'America/Sao_Paulo'})}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-on-surface-secondary py-8">O curso foi encerrado. Nenhuma aula futura encontrada.</p>
          )}
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-on-surface mb-4 flex items-center">
            <UserPlusIcon className="w-6 h-6 mr-2 text-on-surface-secondary" />
            Alunos Recentes
          </h3>
          {recentStudents.length > 0 ? (
            <ul className="divide-y divide-slate-200">
              {recentStudents.map(student => (
                <li key={student.id} className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sky-500">{student.name}</p>
                      <p className="text-sm text-on-surface-secondary">{student.workshopName || 'Aluno Avulso'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-on-surface">Matrícula</p>
                      <p className="text-sm text-on-surface-secondary">{new Date(student.registrationDate).toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'})}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-on-surface-secondary py-8">Nenhum aluno cadastrado recentemente.</p>
          )}
        </div>
      </div>
    </div>
  );
};