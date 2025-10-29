import React, { useState } from 'react';
import type { Student, Workshop } from '../types';
import { Modal } from './Modal';

interface StudentsProps {
  students: Student[];
  workshops: Workshop[];
  onAdd: (studentData: Omit<Student, 'id' | 'registrationDate'>) => Promise<void>;
  onUpdate: (studentData: Student) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const StudentForm: React.FC<{
  student: Partial<Student> | null;
  onSave: (student: Omit<Student, 'id'> & { id?: string }) => void;
  onCancel: () => void;
  workshops: Workshop[];
}> = ({ student, onSave, onCancel, workshops }) => {
  const [name, setName] = useState(student?.name || '');
  const [age, setAge] = useState(student?.age || 0);
  const [workshopId, setWorkshopId] = useState(student?.workshopId || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age > 0) {
      onSave({ ...(student || {}), name, age, workshopId });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
      </div>
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">Idade</label>
        <input type="number" id="age" value={age} onChange={(e) => setAge(parseInt(e.target.value, 10))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required min="1" />
      </div>
      <div>
        <label htmlFor="workshop" className="block text-sm font-medium text-gray-700">Oficina</label>
        <select id="workshop" value={workshopId || ''} onChange={(e) => setWorkshopId(e.target.value || null)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
          <option value="">Nenhuma</option>
          {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>
      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus">Salvar</button>
      </div>
    </form>
  );
};

export const Students: React.FC<StudentsProps> = ({ students, workshops, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleAddStudent = (studentData: Omit<Student, 'id' | 'registrationDate'>) => {
    const newStudentData = {
      ...studentData,
      registrationDate: new Date().toISOString(),
    };
    onAdd(newStudentData);
    setIsModalOpen(false);
  };

  const handleEditStudent = (studentData: Omit<Student, 'id'> & { id?: string }) => {
    if (editingStudent) {
        onUpdate({ ...editingStudent, ...studentData });
    }
    setEditingStudent(null);
    setIsModalOpen(false);
  };
  
  const handleDeleteStudent = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este aluno?")) {
      onDelete(id);
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };
  
  const getWorkshopName = (id: string | null) => {
    if (!id) return 'N/A';
    return workshops.find(w => w.id === id)?.name || 'Desconhecido';
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-on-surface">Alunos</h2>
        <button onClick={openAddModal} className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Adicionar Aluno
        </button>
      </div>

      <div className="bg-surface rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Idade</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oficina</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.length > 0 ? students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.age}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getWorkshopName(student.workshopId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(student.registrationDate).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => openEditModal(student)} className="text-secondary hover:text-secondary/80">Editar</button>
                  <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:text-red-800">Remover</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">Nenhum aluno cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStudent ? "Editar Aluno" : "Adicionar Aluno"}>
        <StudentForm 
          student={editingStudent}
          onSave={editingStudent ? handleEditStudent : handleAddStudent}
          onCancel={() => { setIsModalOpen(false); setEditingStudent(null); }}
          workshops={workshops}
        />
      </Modal>
    </div>
  );
};