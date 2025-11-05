import React, { useState } from 'react';
import type { MusicClass, Student } from '../types';
import { Modal } from './Modal';

interface ClassesProps {
  classes: MusicClass[];
  students: Student[];
  onAdd: (classData: Omit<MusicClass, 'id'>) => Promise<void>;
  onUpdate: (classData: MusicClass) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ClassForm: React.FC<{
  musicClass: Partial<MusicClass> | null;
  onSave: (musicClass: Omit<MusicClass, 'id'> & { id?: string }) => void;
  onCancel: () => void;
  students: Student[];
}> = ({ musicClass, onSave, onCancel, students }) => {
  const [topic, setTopic] = useState(musicClass?.topic || '');
  const [teacher, setTeacher] = useState(musicClass?.teacher || '');
  const [date, setDate] = useState(musicClass?.date ? musicClass.date.split('T')[0] : '');
  const [time, setTime] = useState(musicClass?.date ? new Date(musicClass.date).toTimeString().substring(0, 5) : '');
  const [studentIds, setStudentIds] = useState<string[]>(musicClass?.studentIds || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic && teacher && date && time) {
      const dateTime = new Date(`${date}T${time}:00`).toISOString();
      onSave({ ...(musicClass || {}), topic, teacher, date: dateTime, studentIds });
    }
  };

  const handleStudentSelection = (studentId: string) => {
    setStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-on-surface-secondary">Tópico da Aula</label>
        <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-surface text-on-surface" required />
      </div>
      <div>
        <label htmlFor="teacher" className="block text-sm font-medium text-on-surface-secondary">Professor</label>
        <input type="text" id="teacher" value={teacher} onChange={(e) => setTeacher(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-surface text-on-surface" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-on-surface-secondary">Data</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-surface text-on-surface" required />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-on-surface-secondary">Hora</label>
          <input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-surface text-on-surface" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface-secondary">Alunos</label>
        <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-slate-300 p-2 space-y-2">
            {students.length > 0 ? students.map(student => (
                <div key={student.id} className="flex items-center">
                    <input
                        id={`student-${student.id}`}
                        type="checkbox"
                        checked={studentIds.includes(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={`student-${student.id}`} className="ml-3 text-sm text-on-surface-secondary">{student.name}</label>
                </div>
            )) : <p className="text-sm text-gray-500">Nenhum aluno cadastrado.</p>}
        </div>
      </div>
      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md shadow-sm hover:bg-slate-200">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus">Salvar</button>
      </div>
    </form>
  );
};


export const Classes: React.FC<ClassesProps> = ({ classes, students, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<MusicClass | null>(null);

  const handleAddClass = (classData: Omit<MusicClass, 'id'>) => {
    onAdd(classData);
    setIsModalOpen(false);
  };

  const handleEditClass = (classData: Omit<MusicClass, 'id'> & { id?: string }) => {
    if (editingClass) {
      onUpdate({ ...editingClass, ...classData } as MusicClass);
    }
    setEditingClass(null);
    setIsModalOpen(false);
  };
  
  const handleDeleteClass = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta aula?")) {
      onDelete(id);
    }
  };

  const openAddModal = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const openEditModal = (musicClass: MusicClass) => {
    setEditingClass(musicClass);
    setIsModalOpen(true);
  };
  
  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Desconhecido';

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-on-surface">Aulas Avulsas</h2>
        <button onClick={openAddModal} className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Agendar Aula
        </button>
      </div>

      <div className="bg-surface rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data & Hora</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tópico</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professor</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alunos</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.length > 0 ? classes.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div>{new Date(c.date).toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'})}</div>
                  <div className="text-xs text-gray-500">{new Date(c.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', timeZone: 'America/Sao_Paulo'})}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.topic}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.teacher}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(c.studentIds || []).map(getStudentName).join(', ') || 'Nenhum'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => openEditModal(c)} className="text-secondary hover:text-secondary/80">Editar</button>
                  <button onClick={() => handleDeleteClass(c.id)} className="text-red-600 hover:text-red-800">Remover</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">Nenhuma aula agendada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClass ? "Editar Aula" : "Agendar Nova Aula"}>
        <ClassForm 
          musicClass={editingClass}
          onSave={editingClass ? handleEditClass : handleAddClass}
          onCancel={() => { setIsModalOpen(false); setEditingClass(null); }}
          students={students}
        />
      </Modal>
    </div>
  );
};