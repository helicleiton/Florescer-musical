import React, { useState, useMemo } from 'react';
import type { Student } from '../types';
import { Modal } from './Modal';
import { weeklySchedule, dayNames } from '../data/schedule';
import { SearchIcon } from './icons/SearchIcon';

interface StudentsProps {
  students: Student[];
  onAdd: (studentData: Omit<Student, 'id' | 'registrationDate'>) => Promise<void>;
  onUpdate: (studentData: Student) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelectStudent: (id: string) => void;
}

const StudentForm: React.FC<{
  student: Partial<Student> | null;
  onSave: (student: Omit<Student, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}> = ({ student, onSave, onCancel }) => {
  const [name, setName] = useState(student?.name || '');
  const [age, setAge] = useState(student?.age || 0);
  const [workshopName, setWorkshopName] = useState(student?.workshopName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age > 0) {
      onSave({ ...(student || {}), name, age, workshopName: workshopName || null });
    }
  };

  const sortedSchedule = useMemo(() => [...weeklySchedule].sort((a, b) => {
    if (a.day !== b.day) {
      return a.day - b.day;
    }
    const timeA = a.time.split(' ')[0];
    const timeB = b.time.split(' ')[0];
    return timeA.localeCompare(timeB);
  }), []);

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
        <label htmlFor="workshop" className="block text-sm font-medium text-gray-700">Oficina / Turma</label>
        <select 
          id="workshop" 
          value={workshopName} 
          onChange={(e) => setWorkshopName(e.target.value)} 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Nenhuma - Aluno Avulso</option>
          {sortedSchedule.map(w => {
            const label = `${w.name} - ${dayNames[w.day]} ${w.time} (Prof. ${w.teacher})`;
            return <option key={label} value={w.name}>{label}</option>
          })}
        </select>
      </div>
      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus">Salvar</button>
      </div>
    </form>
  );
};

export const Students: React.FC<StudentsProps> = ({ students, onAdd, onUpdate, onDelete, onSelectStudent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchTerm) {
      return students;
    }
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);
  
  const groupedAndSortedStudents = useMemo(() => {
    const groups: { [key: string]: Student[] } = {};

    filteredStudents.forEach(student => {
        const groupName = student.workshopName || 'Alunos Avulsos';
        if (!groups[groupName]) {
            groups[groupName] = [];
        }
        groups[groupName].push(student);
    });

    for (const groupName in groups) {
        groups[groupName].sort((a, b) => a.name.localeCompare(b.name));
    }

    const scheduleOrder = weeklySchedule.map(item => item.name);
    
    const sortedGroupNames = Object.keys(groups).sort((a, b) => {
        if (a === 'Alunos Avulsos') return 1;
        if (b === 'Alunos Avulsos') return -1;

        const indexA = scheduleOrder.indexOf(a);
        const indexB = scheduleOrder.indexOf(b);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        return a.localeCompare(b);
    });
    
    return sortedGroupNames.map(groupName => ({
        groupName,
        students: groups[groupName]
    }));
  }, [filteredStudents]);


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
  
  return (
    <div className="p-8 flex flex-col h-full">
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-on-surface">Alunos</h2>
          <button onClick={openAddModal} className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Adicionar Aluno
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
        {groupedAndSortedStudents.length > 0 ? (
          groupedAndSortedStudents.map(({ groupName, students: studentsInGroup }) => {
            const workshopInfo = weeklySchedule.find(w => w.name === groupName);
            return (
              <div key={groupName} className="bg-surface rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {groupName}
                    </h3>
                    {workshopInfo && (
                       <p className="text-sm text-on-surface-secondary">
                          {dayNames[workshopInfo.day]}, {workshopInfo.time} &ndash; Prof. {workshopInfo.teacher}
                       </p>
                    )}
                  </div>
                  <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {studentsInGroup.length} aluno{studentsInGroup.length > 1 ? 's' : ''}
                  </span>
                </div>
                <ul className="divide-y divide-gray-200">
                  {studentsInGroup.map((student) => (
                    <li key={student.id} className="px-6 py-3 flex flex-wrap justify-between items-center hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-[150px] mb-2 sm:mb-0">
                        <button onClick={() => onSelectStudent(student.id)} className="font-medium text-gray-900 hover:text-primary transition-colors text-left">
                          {student.name}
                        </button>
                        <p className="text-sm text-gray-500">{student.age} anos</p>
                      </div>
                      <div className="text-sm text-gray-500 hidden sm:block mx-4">
                         Matrícula: {new Date(student.registrationDate).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex-shrink-0 text-right text-sm font-medium space-x-4">
                        <button onClick={() => openEditModal(student)} className="text-secondary hover:text-secondary/80">Editar</button>
                        <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:text-red-800">Remover</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })
        ) : (
          <div className="bg-surface rounded-lg shadow-sm text-center py-16">
            <p className="text-gray-500">
                {students.length > 0 ? 'Nenhum aluno encontrado com este nome.' : 'Nenhum aluno cadastrado.'}
            </p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStudent ? "Editar Aluno" : "Adicionar Aluno"}>
        <StudentForm 
          student={editingStudent}
          onSave={editingStudent ? handleEditStudent : handleAddStudent}
          onCancel={() => { setIsModalOpen(false); setEditingStudent(null); }}
        />
      </Modal>
    </div>
  );
};
