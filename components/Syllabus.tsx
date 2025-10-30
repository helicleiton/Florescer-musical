import React, { useState, useEffect } from 'react';
import type { Workshop, Syllabus as SyllabusType } from '../types';

interface SyllabusProps {
  workshops: Workshop[];
  syllabi: SyllabusType[];
  onSaveSyllabus: (syllabus: SyllabusType) => Promise<void>;
  isAdmin: boolean;
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const Syllabus: React.FC<SyllabusProps> = ({ workshops, syllabi, onSaveSyllabus, isAdmin }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [contents, setContents] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const selectedYear = currentDate.getFullYear();
  const selectedMonth = currentDate.getMonth(); // 0-11

  useEffect(() => {
    const initialContents: { [key: string]: string } = {};
    workshops.forEach(workshop => {
      const syllabusId = `${workshop.id}-${selectedYear}-${selectedMonth + 1}`;
      const existingSyllabus = syllabi.find(s => s.id === syllabusId);
      initialContents[workshop.id] = existingSyllabus?.content || '';
    });
    setContents(initialContents);
  }, [syllabi, workshops, selectedYear, selectedMonth]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(e.target.value, 10));
    setCurrentDate(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = parseInt(e.target.value, 10);
    if (!isNaN(newYear) && newYear > 2020 && newYear < 2050) {
      const newDate = new Date(currentDate);
      newDate.setFullYear(newYear);
      setCurrentDate(newDate);
    }
  };

  const handleContentChange = (workshopId: string, newContent: string) => {
    setContents(prev => ({ ...prev, [workshopId]: newContent }));
  };

  const handleSave = async (workshopId: string) => {
    setLoading(prev => ({ ...prev, [workshopId]: true }));
    const syllabusData: SyllabusType = {
      id: `${workshopId}-${selectedYear}-${selectedMonth + 1}`,
      workshopId,
      year: selectedYear,
      month: selectedMonth + 1, // 1-12
      content: contents[workshopId] || '',
    };
    await onSaveSyllabus(syllabusData);
    setLoading(prev => ({ ...prev, [workshopId]: false }));
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-on-surface mb-6">Planejamento Programático</h2>
      
      <div className="bg-surface p-4 rounded-lg shadow-sm mb-8 flex items-center space-x-4">
        <h3 className="text-lg font-semibold text-on-surface">Selecione o Mês/Ano:</h3>
        <div>
          <label htmlFor="month-select" className="sr-only">Mês</label>
          <select 
            id="month-select"
            value={selectedMonth} 
            onChange={handleMonthChange}
            className="p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface text-on-surface"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="year-input" className="sr-only">Ano</label>
          <input 
            type="number" 
            id="year-input"
            value={selectedYear}
            onChange={handleYearChange}
            className="p-2 w-28 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface text-on-surface"
          />
        </div>
      </div>

      <div className="space-y-6">
        {workshops.map(workshop => (
          <div key={workshop.id} className="bg-surface rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-primary mb-4">{workshop.name}</h3>
              <textarea
                value={contents[workshop.id] || ''}
                onChange={(e) => handleContentChange(workshop.id, e.target.value)}
                readOnly={!isAdmin}
                rows={10}
                className="w-full p-3 border border-slate-300 rounded-md focus:ring-primary focus:border-primary text-sm bg-surface text-on-surface placeholder:text-on-surface-secondary disabled:bg-slate-50"
                placeholder={isAdmin ? "Digite o conteúdo programático para esta oficina neste mês..." : "Nenhum conteúdo programático definido para este mês."}
                disabled={!isAdmin}
              />
            </div>
            {isAdmin && (
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
                <button 
                  onClick={() => handleSave(workshop.id)}
                  disabled={loading[workshop.id]}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus disabled:bg-primary/50 disabled:cursor-not-allowed"
                >
                  {loading[workshop.id] ? 'Salvando...' : 'Salvar Conteúdo'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
