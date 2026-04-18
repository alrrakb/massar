import { Calendar, Clock } from 'lucide-react';
import { format, isTomorrow, isToday } from 'date-fns';

interface UpcomingExam {
  id: number;
  title: string;
  subject: string;
  start_time: string | null;
  duration_minutes: number;
  status: string;
  total_questions: number;
}

interface UpcomingExamsProps {
  exams: UpcomingExam[];
}

function getStatusLabel(status: string, startTime: string | null): { text: string; color: string } {
  if (status === 'ongoing') return { text: 'Live Now', color: '#34d399' };
  if (startTime && isToday(new Date(startTime))) return { text: 'Today', color: '#fb923c' };
  if (startTime && isTomorrow(new Date(startTime))) return { text: 'Tomorrow', color: '#38bdf8' };
  return { text: 'Upcoming', color: '#94a3b8' };
}

export default function UpcomingExams({ exams }: UpcomingExamsProps) {
  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <Calendar size={32} style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-muted)' }}>No upcoming exams</p>
        <p className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
          Create an exam to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {exams.map((exam) => {
        const statusInfo = getStatusLabel(exam.status, exam.start_time);
        const dateStr = exam.start_time
          ? format(new Date(exam.start_time), 'MMM d, h:mm a')
          : 'No date set';

        return (
          <div
            key={exam.id}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>
                {exam.title}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Calendar size={12} /> {dateStr}
                </span>
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Clock size={12} /> {exam.duration_minutes}m
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {exam.total_questions}Q
                </span>
              </div>
            </div>
            <span
              className="text-xs font-semibold px-2 py-1 rounded-full shrink-0"
              style={{ color: statusInfo.color, background: `${statusInfo.color}20` }}
            >
              {statusInfo.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
