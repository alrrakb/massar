import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, ShieldCheck, XCircle, BookOpen, FileText, ClipboardList,
  GraduationCap, Calendar, Layers, AlertTriangle, UserCheck, RotateCcw, Flag,
} from 'lucide-react';
import { adminControlApi } from '../api/adminControlApi';
import Portal from '../../../components/Portal';
import type { CourseForReview, CourseDetails } from '../types';

interface Props {
  course: CourseForReview;
  onClose: () => void;
  onApprove: (id: number, notes?: string) => Promise<void>;
  onReject: (id: number, notes: string) => Promise<void>;
  onResetToReview: (id: number) => Promise<void>;
  onReport: (id: number, reason: string) => Promise<void>;
}

export default function CourseReviewModal({ course, onClose, onApprove, onReject, onResetToReview, onReport }: Props) {
  const { t, i18n } = useTranslation('content');
  const dateLocale = i18n.language.startsWith('ar') ? 'ar-SA' : 'en-US';

  const [details, setDetails] = useState<CourseDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [notes, setNotes] = useState(course.review_notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [reportMode, setReportMode] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    setDetailsLoading(true);
    adminControlApi.getCourseDetails(course.id)
      .then(setDetails)
      .catch(() => setDetails(null))
      .finally(() => setDetailsLoading(false));
  }, [course.id]);

  const handleApprove = async () => {
    setSubmitting(true);
    try { await onApprove(course.id, notes.trim() || undefined); onClose(); }
    finally { setSubmitting(false); }
  };

  const handleReject = async () => {
    if (!notes.trim()) { setNotesError(t('review.rejectionRequiredCourse')); return; }
    setNotesError('');
    setSubmitting(true);
    try { await onReject(course.id, notes.trim()); onClose(); }
    finally { setSubmitting(false); }
  };

  const handleResetToReview = async () => {
    setSubmitting(true);
    try { await onResetToReview(course.id); onClose(); }
    finally { setSubmitting(false); }
  };

  const handleSubmitReport = async () => {
    if (reportReason.trim().length < 20) { setReportError(t('review.report.minChars')); return; }
    setReportSubmitting(true);
    setReportError('');
    try { await onReport(course.id, reportReason.trim()); setReportMode(false); setReportReason(''); }
    catch { setReportError(t('review.report.failed')); }
    finally { setReportSubmitting(false); }
  };

  const isAlreadyDecided = course.approval_status !== 'pending';
  const statusLabel = course.approval_status === 'approved' ? t('review.approvedLabel') : t('review.rejectedLabel');

  return (
    <Portal><div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 400 }}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col"
        style={{ background: 'var(--bg-panel)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <BookOpen size={22} style={{ color: '#6366f1' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>{course.title}</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{course.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Course meta */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <GraduationCap size={14} />, label: t('review.meta.teacher'),    value: course.teacher?.full_name ?? '—', color: '#a78bfa' },
              { icon: <Calendar size={14} />,      label: t('review.meta.submitted'),   value: new Date(course.created_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' }), color: '#38bdf8' },
              { icon: <Layers size={14} />,        label: t('review.meta.department'),  value: course.department ?? '—', color: '#fb923c' },
              { icon: <FileText size={14} />,      label: t('review.meta.credits'),     value: course.credits != null ? String(course.credits) : '—', color: '#34d399' },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ color: item.color }}>{item.icon}</span>
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {course.description && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{t('review.description')}</h4>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-main)' }}>{course.description}</p>
            </div>
          )}

          {/* Materials */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <FileText size={13} /> {t('review.materialsSection')} ({details?.materials.length ?? course.materials_count})
            </h4>
            {detailsLoading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />)}
              </div>
            ) : details?.materials.length ? (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                {details.materials.map((m, idx) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                    style={{ borderBottom: idx < details.materials.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: 'rgba(255,255,255,0.03)' }}
                  >
                    <span style={{ color: 'var(--text-main)' }}>{m.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>{m.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('review.noMaterials')}</p>
            )}
          </div>

          {/* Exams */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <ClipboardList size={13} /> {t('review.examsSection')} ({details?.exams.length ?? course.exams_count})
            </h4>
            {detailsLoading ? (
              <div className="space-y-2">
                {[1].map(i => <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />)}
              </div>
            ) : details?.exams.length ? (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                {details.exams.map((e, idx) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                    style={{ borderBottom: idx < details.exams.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: 'rgba(255,255,255,0.03)' }}
                  >
                    <span style={{ color: 'var(--text-main)' }}>{e.title}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('review.examSummary', { questions: e.total_questions, duration: e.duration_minutes })}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('review.noExams')}</p>
            )}
          </div>

          {/* Already decided banner */}
          {isAlreadyDecided && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
              <AlertTriangle size={16} style={{ color: '#fbbf24' }} />
              <span className="text-sm" style={{ color: '#fbbf24' }}>
                {t('review.alreadyDecidedCourse', { status: statusLabel })}
              </span>
            </div>
          )}

          {/* Reviewer info */}
          {isAlreadyDecided && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: course.approval_status === 'approved' ? 'rgba(52,211,153,0.08)' : 'rgba(251,113,133,0.08)', border: `1px solid ${course.approval_status === 'approved' ? 'rgba(52,211,153,0.2)' : 'rgba(251,113,133,0.2)'}` }}>
              <UserCheck size={15} style={{ color: course.approval_status === 'approved' ? '#34d399' : '#fb7185', flexShrink: 0 }} />
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: course.approval_status === 'approved' ? '#34d399' : '#fb7185', fontWeight: 600 }}>
                  {statusLabel}
                </span>
                {t('review.reviewedBy')}
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                  {course.reviewer?.full_name ?? course.reviewer?.email ?? 'Admin'}
                </span>
                {course.reviewed_at && (
                  <span style={{ color: 'var(--text-muted)' }}>
                    {' · '}{new Date(course.reviewed_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Notes field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              {t('review.notesLabel')} {isAlreadyDecided ? '' : t('review.notesRequired')}
            </label>
            <textarea
              value={notes}
              onChange={e => { setNotes(e.target.value); if (notesError) setNotesError(''); }}
              rows={3}
              placeholder={t('review.notesPlaceholder')}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: notesError ? '1px solid #fb7185' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                color: 'var(--text-main)',
                padding: '10px 14px',
                fontSize: 14,
                resize: 'vertical',
                outline: 'none',
              }}
            />
            {notesError && <p className="mt-1 text-xs" style={{ color: '#fb7185' }}>{notesError}</p>}
          </div>
        </div>

        {/* File Report section */}
        {reportMode && (
          <div className="px-6 pb-4 space-y-2">
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(251,113,133,0.07)', border: '1px solid rgba(251,113,133,0.2)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#fb7185' }}>{t('review.report.sectionTitle')}</p>
              <textarea
                value={reportReason}
                onChange={e => { setReportReason(e.target.value); if (reportError) setReportError(''); }}
                rows={3}
                placeholder={t('review.report.placeholder')}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: reportError ? '1px solid #fb7185' : '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text-main)', padding: '8px 12px', fontSize: 13, resize: 'vertical', outline: 'none' }}
              />
              {reportError && <p className="text-xs" style={{ color: '#fb7185' }}>{reportError}</p>}
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setReportMode(false); setReportReason(''); setReportError(''); }} className="px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/10" style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {t('actions.cancel')}
                </button>
                <button onClick={handleSubmitReport} disabled={reportSubmitting || reportReason.trim().length < 20} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50" style={{ background: 'rgba(251,113,133,0.15)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.3)' }}>
                  <Flag size={11} />{reportSubmitting ? t('actions.filing') : t('actions.fileReport')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => { setReportMode(m => !m); setReportReason(''); setReportError(''); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors hover:bg-white/10"
            style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
            title={t('actions.fileReportTitle')}
          >
            <Flag size={13} style={{ color: '#fb7185' }} /> {t('actions.fileReport')}
          </button>
          <div className="flex items-center gap-3">
            <button onClick={onClose} disabled={submitting} className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/10" style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {t('actions.cancel')}
            </button>
            {isAlreadyDecided ? (
              <button onClick={handleResetToReview} disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                <RotateCcw size={15} />{submitting ? t('actions.saving') : t('actions.reReview')}
              </button>
            ) : (
              <>
                <button onClick={handleReject} disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50" style={{ background: 'rgba(251,113,133,0.15)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.3)' }}>
                  <XCircle size={15} />{submitting ? t('actions.saving') : t('actions.reject')}
                </button>
                <button onClick={handleApprove} disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                  <ShieldCheck size={15} />{submitting ? t('actions.saving') : t('actions.approve')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div></Portal>
  );
}
