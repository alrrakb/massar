import { useState } from 'react';
import {
  History, Search, Filter, ChevronLeft, ChevronRight,
  GitCompare, RefreshCw, ChevronDown, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DiffViewer from './DiffViewer';
import type { AuditLog, AuditFilters, AuditAction } from '../types';
import { ACTION_BADGE, ALL_ACTIONS } from '../types';
import { PAGE_SIZE } from '../api/auditApi';

interface Props {
  logs: AuditLog[];
  count: number;
  page: number;
  totalPages: number;
  loading: boolean;
  filters: AuditFilters;
  onPageChange: (p: number) => void;
  onFilterChange: (patch: Partial<AuditFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
}

function fmtDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function ActivityLogTable({
  logs, count, page, totalPages, loading,
  filters, onPageChange, onFilterChange, onClearFilters, onRefresh,
}: Props) {
  const { t, i18n } = useTranslation('security');
  const isRtl = i18n.language.startsWith('ar');
  const dateLocale = isRtl ? 'ar-SA' : 'en-US';

  const [diffEntry, setDiffEntry] = useState<AuditLog | null>(null);
  const [localAdminName, setLocalAdminName] = useState(filters.adminName ?? '');
  const [localDateFrom,  setLocalDateFrom ] = useState(filters.dateFrom  ?? '');
  const [localDateTo,    setLocalDateTo   ] = useState(filters.dateTo    ?? '');
  const hasFilters = !!(filters.adminName || filters.actionType || filters.dateFrom || filters.dateTo);

  const applyFilters = () => {
    onFilterChange({
      adminName: localAdminName || undefined,
      dateFrom:  localDateFrom  || undefined,
      dateTo:    localDateTo    || undefined,
    });
  };

  const handleClear = () => {
    setLocalAdminName('');
    setLocalDateFrom('');
    setLocalDateTo('');
    onClearFilters();
  };

  const TABLE_HEADERS = [
    t('table.timestamp'),
    t('table.admin'),
    t('table.action'),
    t('table.entity'),
    t('table.entityId'),
    t('table.changes'),
  ];

  const from = page * PAGE_SIZE + 1;
  const to   = Math.min((page + 1) * PAGE_SIZE, count);

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Admin name search */}
          <div className="relative flex-1 min-w-40">
            <Search
              size={14}
              style={{
                position: 'absolute',
                insetInlineStart: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder={t('filters.searchPlaceholder')}
              value={localAdminName}
              onChange={e => setLocalAdminName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              style={{
                width: '100%',
                paddingInlineStart: 32, paddingInlineEnd: 12, paddingTop: 7, paddingBottom: 7,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: 'var(--text-main)', fontSize: 13, outline: 'none',
              }}
            />
          </div>

          {/* Action type select */}
          <div className="relative">
            <select
              value={filters.actionType ?? ''}
              onChange={e => onFilterChange({ actionType: (e.target.value as AuditAction) || undefined })}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: 'var(--text-main)', padding: '7px 32px 7px 12px',
                fontSize: 13, appearance: 'none', cursor: 'pointer', minWidth: 160,
              }}
            >
              <option value="" style={{ background: '#1e293b' }}>{t('filters.allActions')}</option>
              {ALL_ACTIONS.map(a => (
                <option key={a} value={a} style={{ background: '#1e293b' }}>{t(`actions.${a}`)}</option>
              ))}
            </select>
            <ChevronDown
              size={13}
              style={{
                position: 'absolute',
                insetInlineEnd: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <Filter size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="date"
              value={localDateFrom}
              onChange={e => setLocalDateFrom(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: 'var(--text-main)', padding: '7px 10px',
                fontSize: 13, outline: 'none',
              }}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t('filters.dateArrow')}</span>
            <input
              type="date"
              value={localDateTo}
              onChange={e => setLocalDateTo(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: 'var(--text-main)', padding: '7px 10px',
                fontSize: 13, outline: 'none',
              }}
            />
          </div>

          {/* Buttons */}
          <button
            onClick={applyFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            <Search size={12} />{t('filters.apply')}
          </button>
          {hasFilters && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <X size={12} />{t('filters.clear')}
            </button>
          )}
          <button
            onClick={onRefresh}
            className="ms-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />{t('filters.refresh')}
          </button>
        </div>

        {/* Result summary */}
        <div className="flex items-center gap-2">
          <History size={13} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('summary.events', { count })} — {t('summary.page', { current: page + 1, total: totalPages })}
            {hasFilters && <span style={{ color: '#fbbf24' }}> {t('summary.filtered')}</span>}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="h-4 bg-white/10 rounded w-36" />
                <div className="h-4 bg-white/10 rounded w-24" />
                <div className="h-6 bg-white/10 rounded-full w-28" />
                <div className="h-4 bg-white/10 rounded w-20" />
                <div className="h-4 bg-white/10 rounded flex-1" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <History size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--text-muted)' }}>{t('table.noEvents')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {TABLE_HEADERS.map(h => (
                    <th key={h} className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const badge = ACTION_BADGE[log.action_type];
                  const hasChanges = log.old_data !== null || log.new_data !== null;
                  return (
                    <tr key={log.id} style={{ borderBottom: idx < logs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      {/* Timestamp */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)', fontFamily: 'ui-monospace,SFMono-Regular,monospace' }}>
                        {fmtDate(log.created_at, dateLocale)}
                      </td>

                      {/* Admin */}
                      <td className="px-4 py-3">
                        {log.admin ? (
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                              {log.admin.full_name ?? '—'}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'ui-monospace,SFMono-Regular,monospace' }}>
                              {log.admin.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('table.systemTrigger')}</span>
                        )}
                      </td>

                      {/* Action badge */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                          style={{ background: badge?.bg ?? 'rgba(148,163,184,0.1)', color: badge?.color ?? '#94a3b8' }}
                        >
                          {t(`actions.${log.action_type}`, { defaultValue: log.action_type })}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'ui-monospace,SFMono-Regular,monospace' }}>
                        {log.entity_affected}
                      </td>

                      {/* Entity ID */}
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'ui-monospace,SFMono-Regular,monospace', maxWidth: 120 }}>
                        <span className="truncate block" title={log.entity_id ?? ''}>
                          {log.entity_id ?? '—'}
                        </span>
                      </td>

                      {/* View Changes */}
                      <td className="px-4 py-3">
                        {hasChanges ? (
                          <button
                            onClick={() => setDiffEntry(log)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                            style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.25)' }}
                          >
                            <GitCompare size={12} />{t('table.viewChanges')}
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('summary.showing', { from, to, total: count })}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30"
                style={{ color: 'var(--text-muted)' }}
              >
                {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const pg = totalPages <= 7 ? i : (page < 4 ? i : (page > totalPages - 4 ? totalPages - 7 + i : page - 3 + i));
                return (
                  <button
                    key={pg}
                    onClick={() => onPageChange(pg)}
                    className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: pg === page ? 'rgba(99,102,241,0.2)' : 'transparent',
                      color:      pg === page ? '#6366f1' : 'var(--text-muted)',
                      border:     pg === page ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                    }}
                  >
                    {pg + 1}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30"
                style={{ color: 'var(--text-muted)' }}
              >
                {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Diff Viewer modal */}
      {diffEntry && (
        <DiffViewer
          oldData={diffEntry.old_data}
          newData={diffEntry.new_data}
          actionType={diffEntry.action_type}
          entityInfo={`${diffEntry.entity_affected}#${diffEntry.entity_id ?? '?'}`}
          onClose={() => setDiffEntry(null)}
        />
      )}
    </div>
  );
}
