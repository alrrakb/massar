import { X, GitCompare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Portal from '../../../components/Portal';
import type { AuditAction } from '../types';

interface Props {
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  actionType: AuditAction;
  entityInfo: string;
  onClose: () => void;
}

function fmt(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'string') return `"${v}"`;
  if (typeof v === 'object') return JSON.stringify(v, null, 2);
  return String(v);
}

export default function DiffViewer({ oldData, newData, actionType, entityInfo, onClose }: Props) {
  const { t } = useTranslation('security');

  const isInsert = !oldData && newData !== null;
  const isDelete = oldData !== null && !newData;
  const isUpdate = oldData !== null && newData !== null;

  const allKeys = isUpdate
    ? Array.from(new Set([...Object.keys(oldData!), ...Object.keys(newData!)]))
    : [];
  const changedKeys   = isUpdate ? allKeys.filter(k => JSON.stringify(oldData![k]) !== JSON.stringify(newData![k])) : [];
  const unchangedKeys = isUpdate ? allKeys.filter(k => JSON.stringify(oldData![k]) === JSON.stringify(newData![k])) : [];

  const insertKeys = isInsert ? Object.keys(newData!) : [];
  const deleteKeys = isDelete ? Object.keys(oldData!) : [];

  const changedCount = isUpdate ? changedKeys.length : (insertKeys.length || deleteKeys.length);

  const title = `${t(`actions.${actionType}`, { defaultValue: actionType })} · ${entityInfo}`;

  return (
    <Portal>
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', zIndex: 400 }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl flex flex-col"
          style={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 30px 70px rgba(0,0,0,0.7)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(99,102,241,0.07)' }}
          >
            <div className="flex items-center gap-2.5">
              <GitCompare size={16} style={{ color: '#6366f1' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{title}</span>
            </div>
            <div className="flex items-center gap-5">
              {isInsert && (
                <span className="text-xs font-mono" style={{ color: '#34d399' }}>
                  {t('diff.fieldsInserted', { count: insertKeys.length })}
                </span>
              )}
              {isDelete && (
                <span className="text-xs font-mono" style={{ color: '#fb7185' }}>
                  {t('diff.fieldsDeleted', { count: deleteKeys.length })}
                </span>
              )}
              {isUpdate && (
                <span className="text-xs font-mono" style={{ color: '#fbbf24' }}>
                  {t('diff.fieldsChanged', { count: changedKeys.length })}
                </span>
              )}
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* File legend bar */}
          <div
            className="flex items-center gap-6 px-5 py-2 text-xs"
            style={{ fontFamily: 'ui-monospace,SFMono-Regular,monospace', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            {(isDelete || isUpdate) && <span style={{ color: '#fb7185' }}>--- a/old_data</span>}
            {(isInsert || isUpdate) && <span style={{ color: '#34d399' }}>+++ b/new_data</span>}
            <span style={{ color: '#fbbf24' }}>{t('diff.fieldsChanged', { count: changedCount })}</span>
          </div>

          {/* Diff body */}
          <div
            className="overflow-y-auto flex-1 p-4 space-y-1"
            style={{ fontFamily: 'ui-monospace,SFMono-Regular,monospace', fontSize: 12, lineHeight: 1.6 }}
          >
            {/* INSERT: all keys green */}
            {isInsert && insertKeys.map(key => (
              <div key={key} className="flex gap-2 px-3 py-1 rounded" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <span style={{ color: '#34d399', flexShrink: 0, userSelect: 'none' }}>+</span>
                <span style={{ color: '#34d399', flexShrink: 0 }}>{key}:</span>
                <span style={{ color: '#6ee7b7', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{fmt(newData![key])}</span>
              </div>
            ))}

            {/* DELETE: all keys red */}
            {isDelete && deleteKeys.map(key => (
              <div key={key} className="flex gap-2 px-3 py-1 rounded" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.15)' }}>
                <span style={{ color: '#fb7185', flexShrink: 0, userSelect: 'none' }}>−</span>
                <span style={{ color: '#fb7185', flexShrink: 0 }}>{key}:</span>
                <span style={{ color: '#fca5a5', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{fmt(oldData![key])}</span>
              </div>
            ))}

            {/* UPDATE: changed fields first */}
            {isUpdate && changedKeys.length === 0 && (
              <p className="text-xs px-2" style={{ color: 'var(--text-muted)' }}>{t('diff.noChanges')}</p>
            )}
            {isUpdate && changedKeys.map(key => {
              const inOld = key in oldData!;
              const inNew = key in newData!;
              return (
                <div key={key} className="space-y-0.5">
                  {inOld && (
                    <div className="flex gap-2 px-3 py-1 rounded" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.15)' }}>
                      <span style={{ color: '#fb7185', flexShrink: 0, userSelect: 'none' }}>−</span>
                      <span style={{ color: '#fb7185', flexShrink: 0 }}>{key}:</span>
                      <span style={{ color: '#fca5a5', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{fmt(oldData![key])}</span>
                    </div>
                  )}
                  {inNew && (
                    <div className="flex gap-2 px-3 py-1 rounded" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                      <span style={{ color: '#34d399', flexShrink: 0, userSelect: 'none' }}>+</span>
                      <span style={{ color: '#34d399', flexShrink: 0 }}>{key}:</span>
                      <span style={{ color: '#6ee7b7', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{fmt(newData![key])}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unchanged fields (context lines) */}
            {isUpdate && unchangedKeys.length > 0 && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
                  {t('diff.unchanged', { count: unchangedKeys.length })}
                </p>
                {unchangedKeys.map(key => (
                  <div key={key} className="flex gap-2 px-3 py-0.5">
                    <span style={{ color: 'rgba(148,163,184,0.3)', flexShrink: 0, userSelect: 'none' }}> </span>
                    <span style={{ color: 'rgba(148,163,184,0.4)', flexShrink: 0 }}>{key}:</span>
                    <span style={{ color: 'rgba(148,163,184,0.4)', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{fmt(oldData![key])}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {t('diff.close')}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
