import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, BookOpen } from 'lucide-react';

export default function EmptyDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div
        className="flex items-center justify-center w-20 h-20 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))' }}
      >
        <Sparkles size={36} style={{ color: 'var(--primary)' }} />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
          Start Your Teaching Journey
        </h2>
        <p className="text-sm mt-2 max-w-md" style={{ color: 'var(--text-muted)' }}>
          Create your first exam, upload course materials, or let AI generate questions for you.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          onClick={() => navigate('/teacher/create-exam')}
          className="btn-primary flex items-center gap-2"
        >
          <Sparkles size={16} /> AI Quiz Generator
        </button>
        <button
          onClick={() => navigate('/teacher/create-exam')}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus size={16} /> Create Exam
        </button>
        <button
          onClick={() => navigate('/teacher/courses')}
          className="btn-secondary flex items-center gap-2"
        >
          <BookOpen size={16} /> Add Course
        </button>
      </div>
    </div>
  );
}
