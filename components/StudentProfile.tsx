import React, { useState } from 'react';
import type { Student, StudentNote } from '../types';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { TrashIcon } from './icons/TrashIcon';

interface StudentProfileProps {
  student: Student;
  notes: StudentNote[];
  onAddNote: (note: Omit<StudentNote, 'id'>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onBack: () => void;
  isAdmin: boolean;
}

const InfoCard: React.FC<{title: string, value: string | number}> = ({title, value}) => (
    <div>
        <p className="text-sm text-on-surface-secondary">{title}</p>
        <p className="font-medium text-on-surface">{value}</p>
    </div>
);

export const StudentProfile: React.FC<StudentProfileProps> = ({ student, notes, onAddNote, onDeleteNote, onBack, isAdmin }) => {
    const [newNote, setNewNote] = useState('');

    const handleAddNote = () => {
        if (newNote.trim()) {
            onAddNote({
                studentId: student.id,
                content: newNote,
                date: new Date().toISOString()
            });
            setNewNote('');
        }
    };
    
    return (
        <div className="p-8">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 mr-4 text-on-surface rounded-full hover:bg-slate-200 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <UserCircleIcon className="w-16 h-16 text-slate-300 mr-4" />
                <div>
                    <h2 className="text-3xl font-bold text-on-surface">{student.name}</h2>
                    <p className="text-on-surface-secondary">Perfil do Aluno</p>
                </div>
            </div>

            {/* Details Card */}
            <div className="bg-surface p-6 rounded-lg shadow-sm mb-6">
                 <h3 className="text-xl font-semibold text-on-surface mb-4">Detalhes</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                     <InfoCard title="Idade" value={`${student.age} anos`} />
                     <InfoCard title="Matrícula" value={new Date(student.registrationDate).toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'})} />
                     <InfoCard title="Oficina" value={student.workshopName || 'Nenhuma'} />
                 </div>
            </div>

            <div className="mt-6">
                {/* Notes Card */}
                <div className="bg-surface p-6 rounded-lg shadow-sm flex flex-col">
                    <h3 className="text-xl font-semibold text-on-surface mb-4 flex items-center">
                        <DocumentTextIcon className="w-6 h-6 mr-2 text-on-surface-secondary" />
                        Anotações de Progresso
                    </h3>
                    <div className="flex-1 space-y-3 max-h-72 overflow-y-auto mb-4 pr-2">
                        {notes.length > 0 ? notes.map(note => (
                            <div key={note.id} className="bg-slate-50 p-3 rounded-md group relative">
                                <p className="text-sm text-on-surface whitespace-pre-wrap">{note.content}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-on-surface-secondary">{new Date(note.date).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo'})}</p>
                                    {isAdmin && (
                                      <button onClick={() => onDeleteNote(note.id)} className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1 rounded-full hover:bg-red-100">
                                          <TrashIcon className="w-4 h-4 text-red-500" />
                                      </button>
                                    )}
                                </div>
                            </div>
                        )) : (
                           <p className="text-sm text-center text-on-surface-secondary py-4">Nenhuma anotação adicionada.</p>
                        )}
                    </div>
                    {isAdmin && (
                        <div className="mt-auto pt-4 border-t border-slate-200">
                            <textarea 
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                                placeholder="Adicionar nova anotação..."
                            />
                            <button onClick={handleAddNote} className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus">
                                Salvar Anotação
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};