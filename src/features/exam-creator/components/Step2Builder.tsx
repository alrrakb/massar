import { useState, useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Sparkles, Plus, AlertCircle, BookOpen } from 'lucide-react';
import { ExamFormData } from '../types';
import QuestionCard from './QuestionCard';
import QuestionBankPicker from './QuestionBankPicker';
import AIQuestionGenerator from './AIQuestionGenerator';
import { Question } from '../../../features/question-bank/types';
import type { GeneratedQuestion } from '../../../features/ai-question-generator/types';
import styles from '../ExamCreator.module.css';
import { toast } from 'react-hot-toast';

export function Step2Builder() {
    const { control, watch, formState: { errors } } = useFormContext<ExamFormData>();
    const [showPicker, setShowPicker] = useState(false);
    const [showAIGenerator, setShowAIGenerator] = useState(false);

    useEffect(() => {
        console.log('showAIGenerator changed:', showAIGenerator);
    }, [showAIGenerator]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'questions'
    });

    const addQuestion = () => {
        append({
            text: '',
            type: 'mcq',
            options: ['', '', '', ''],
            correct_answer: '',
            marks: 1,
            image_url: null,
            explanation: '',
        });
    };

    const handleAIGeneration = () => {
        console.log('AI button clicked, opening AI generator modal');
        setShowAIGenerator(true);
    };

    const handleAIQuestionsGenerated = (questions: GeneratedQuestion[]) => {
        questions.forEach(q => {
            append({
                text: q.text,
                type: q.type,
                options: q.options || [],
                correct_answer: q.correct_answer,
                marks: q.marks,
                image_url: null,
                explanation: q.explanation || '',
            });
        });
        
        toast.success(`Added ${questions.length} AI-generated questions! 🤖`);
        setShowAIGenerator(false);
    };

    const handleImportFromBank = () => {
        setShowPicker(true);
    };

    const handleSelectQuestions = (selectedQuestions: Question[]) => {
        // Map question bank format to exam creator format
        selectedQuestions.forEach(q => {
            let options: string[] = [];
            let correctAnswer = '';
            let type: 'mcq' | 'true_false' | 'essay' | 'short_answer' = 'mcq';

            if (q.type === 'multiple_choice' && q.options) {
                options = q.options.map(opt => opt.text);
                correctAnswer = q.options.find(opt => opt.isCorrect)?.text || '';
                type = 'mcq';
            } else if (q.type === 'true_false') {
                options = ['True', 'False'];
                correctAnswer = q.correct_answer === 'true' ? 'True' : 'False';
                type = 'true_false';
            } else if (q.type === 'essay') {
                type = 'essay';
            } else {
                type = 'short_answer';
                correctAnswer = q.correct_answer || '';
            }

            append({
                text: q.content,
                type,
                options,
                correct_answer: correctAnswer,
                marks: 1,
                image_url: null,
                explanation: q.explanation || '',
            });
        });

        toast.success(`Added ${selectedQuestions.length} question${selectedQuestions.length !== 1 ? 's' : ''} from Question Bank`, { icon: '📚' });
    };

    return (
        <div className={styles.formArea}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <h3 className={styles.title} style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Question Builder</h3>
                    <p className={styles.subtitle} style={{ margin: 0, fontSize: '0.85rem' }}>Add and configure questions for your exam</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={handleImportFromBank} className={styles.bankBtn} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                        <BookOpen size={14} /> From Bank
                    </button>
                    <button type="button" onClick={handleAIGeneration} className={styles.aiBtn} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                        <Sparkles size={14} /> AI Generate
                    </button>
                </div>
            </div>

            {errors.questions?.message && (
                <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={16} /> {errors.questions.message as string}
                </div>
            )}

            {fields.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '50px', height: '50px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                        <Plus size={24} color="#818cf8" />
                    </div>
                    <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1rem' }}>No Questions Yet</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>Start building your exam by adding your first question manually.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
                        <button type="button" onClick={addQuestion} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}>
                            + Add Manually
                        </button>
                        <button type="button" onClick={handleImportFromBank} className={styles.bankBtn} style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                            <BookOpen size={14} /> Import from Bank
                        </button>
                        <button type="button" onClick={handleAIGeneration} className={styles.aiBtn} style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                            <Sparkles size={14} /> AI Defaults
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {fields.map((field, index) => (
                        <QuestionCard
                            key={field.id} // useFieldArray provides unique un-predictable IDs
                            index={index}
                            remove={remove}
                        />
                    ))}

                    <button type="button" onClick={addQuestion} className={styles.btnOutline} style={{ width: '100%', padding: '1rem', justifyContent: 'center', borderStyle: 'dashed' }}>
                        <Plus size={18} /> Add Another Question
                    </button>
                </div>
            )}

            {/* Question Bank Picker Modal */}
            {showPicker && (
                <QuestionBankPicker
                    onSelectQuestions={handleSelectQuestions}
                    onClose={() => setShowPicker(false)}
                />
            )}

            {/* AI Question Generator Modal */}
            {showAIGenerator && (
                <AIQuestionGenerator
                    courseId={watch('course_id') || undefined}
                    onQuestionsGenerated={handleAIQuestionsGenerated}
                    onClose={() => setShowAIGenerator(false)}
                />
            )}
        </div>
    );
}

export default Step2Builder;
