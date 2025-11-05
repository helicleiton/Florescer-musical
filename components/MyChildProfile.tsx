import React from 'react';
import type { Student } from '../types';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { weeklySchedule, dayNames } from '../data/schedule';
import { CalendarIcon } from './icons/CalendarIcon';

interface MyChildProfileProps {
  student: Student;
}

const InfoCard: React.FC<{title: string, value: string | number}> = ({title, value}) => (
    <div>
        <p className="text-sm text-on-surface-secondary">{title}</p>
        <p className="font-medium text-on-surface">{value}</p>
    </div>
);

export const MyChildProfile: React.FC<MyChildProfileProps> = ({ student }) => {
    const studentClass = student.workshopName 
        ? weeklySchedule.find(c => c.name === student.workshopName) 
        : null;

    return (
        <div className="p-8">
            <div className="flex items-center mb-6">
                <UserCircleIcon className="w-16 h-16 text-slate-300 mr-4" />
                <div>
                    <h2 className="text-3xl font-bold text-on-surface">{student.name}</h2>
                    <p className="text-on-surface-secondary">Informações do Aluno</p>
                </div>
            </div>

            {/* Details Card */}
            <div className="bg-surface p-6 rounded-lg shadow-sm mb-6">
                 <h3 className="text-xl font-semibold text-on-surface mb-4">Detalhes</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                     <InfoCard title="Idade" value={`${student.age} anos`} />
                     <InfoCard title="Matrícula" value={new Date(student.registrationDate).toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'})} />
                     <InfoCard title="Oficina / Turma" value={student.workshopName || 'Nenhuma'} />
                 </div>
            </div>

            {/* Class Info Card */}
            {studentClass && (
                <div className="bg-surface p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-on-surface mb-4 flex items-center">
                        <CalendarIcon className="w-6 h-6 mr-2 text-on-surface-secondary" />
                        Informações da Turma
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                        <InfoCard title="Dia da Semana" value={dayNames[studentClass.day]} />
                        <InfoCard title="Horário" value={studentClass.time} />
                        <InfoCard title="Professor(a)" value={studentClass.teacher} />
                    </div>
                </div>
            )}
        </div>
    );
};
