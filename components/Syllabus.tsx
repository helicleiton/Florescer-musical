import React, { useState, useEffect } from 'react';
import type { Workshop, WorkshopLessonPlan } from '../types';

interface LessonPlanningProps {
  workshops: Workshop[];
  lessonPlans: WorkshopLessonPlan[];
  onSaveLessonPlan: (plan: WorkshopLessonPlan) => Promise<void>;
  isAdmin: boolean;
}

const LessonItem: React.FC<{
    plan: WorkshopLessonPlan;
    onSave: (content: string) => Promise<void>;
    isAdmin: boolean;
}> = ({ plan, onSave, isAdmin }) => {
    const [content, setContent] = useState(plan.content);
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setContent(plan.content);
        setIsDirty(false);
    }, [plan.content]);

    const handleSave = async () => {
        setLoading(true);
        await onSave(content);
        setLoading(false);
        setIsDirty(false);
    };
    
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        setIsDirty(true);
    };

    return (
        <div className="bg-slate-50 p-4 rounded-md">
            <h4 className="font-semibold text-on-surface mb-2">
                Aula {String(plan.lessonNumber).padStart(2, '0')}
            </h4>
            <textarea
                value={content}
                onChange={handleContentChange}
                readOnly={!isAdmin}
                rows={8}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary text-sm bg-surface text-on-surface placeholder:text-on-surface-secondary disabled:bg-slate-100"
                placeholder={isAdmin ? "Descreva o conteúdo e objetivos desta aula..." : "Nenhum conteúdo definido."}
                disabled={!isAdmin}
            />
            {isAdmin && (
                <div className="text-right mt-2">
                    <button
                        onClick={handleSave}
                        disabled={loading || !isDirty}
                        className="px-4 py-1.5 text-xs font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus disabled:bg-primary/50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Salvando...' : 'Salvar Aula'}
                    </button>
                </div>
            )}
        </div>
    );
};

export const Syllabus: React.FC<LessonPlanningProps> = ({ workshops, lessonPlans, onSaveLessonPlan, isAdmin }) => {
    const [localLessonPlans, setLocalLessonPlans] = useState<WorkshopLessonPlan[]>([]);

    const allPlans = [...lessonPlans, ...localLessonPlans];

    const handleAddLesson = (workshopId: string) => {
        const plansForWorkshop = allPlans.filter(p => p.workshopId === workshopId);
        const nextLessonNumber = plansForWorkshop.length > 0
            ? Math.max(...plansForWorkshop.map(p => p.lessonNumber)) + 1
            : 1;

        const newPlan: WorkshopLessonPlan = {
            id: `${workshopId}-${nextLessonNumber}`,
            workshopId: workshopId,
            lessonNumber: nextLessonNumber,
            content: ''
        };

        setLocalLessonPlans(prev => [...prev, newPlan]);
    };
    
    const handleSave = async (planToSave: WorkshopLessonPlan, newContent: string) => {
        const finalPlan = { ...planToSave, content: newContent };
        await onSaveLessonPlan(finalPlan);
        
        setLocalLessonPlans(prev => prev.filter(p => p.id !== planToSave.id));
    };

    return (
        <div className="p-8">
        <h2 className="text-3xl font-bold text-on-surface mb-6">Planejamento de Aulas</h2>
        
        <div className="space-y-6">
            {workshops.map(workshop => {
                const plansForWorkshop = allPlans
                    .filter(p => p.workshopId === workshop.id)
                    .sort((a, b) => a.lessonNumber - b.lessonNumber);

                return (
                    <div key={workshop.id} className="bg-surface rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-primary mb-4">{workshop.name}</h3>
                            {plansForWorkshop.length > 0 ? (
                                <div className="space-y-4">
                                {plansForWorkshop.map(plan => (
                                    <LessonItem
                                        key={plan.id}
                                        plan={plan}
                                        isAdmin={isAdmin}
                                        onSave={(content) => handleSave(plan, content)}
                                    />
                                ))}
                                </div>
                            ) : (
                                <p className="text-center text-on-surface-secondary py-8">Nenhuma aula planejada para esta oficina.</p>
                            )}
                        </div>
                        {isAdmin && (
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                            <button
                            onClick={() => handleAddLesson(workshop.id)}
                            className="w-full px-4 py-2 text-sm font-medium text-primary border-2 border-dashed border-primary/50 rounded-md hover:bg-primary/10 hover:border-primary transition-colors flex items-center justify-center"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Adicionar Aula
                            </button>
                        </div>
                        )}
                    </div>
                );
            })}
        </div>
        </div>
    );
};
