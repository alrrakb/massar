import { Fingerprint, Activity, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AdminSession } from '../types';
import { ACTION_BADGE } from '../types';

interface Props {
  sessions: AdminSession[];
  loading: boolean;
  onRefresh: () => void;
}

export default function AdminSessionManager({ sessions, loading, onRefresh }: Props) {
  const { t } = useTranslation('security');

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return t('sessions.justNow');
    if (m < 60) return t('sessions.minutesAgo', { m });
    const h = Math.floor(m / 60);
    if (h < 24) return t('sessions.hoursAgo', { h });
    return t('sessions.daysAgo', { d: Math.floor(h / 24) });
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <Fingerprint size={16} style={{ color: '#6366f1' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{t('sessions.title')}</h3>
          <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
            {t('sessions.admin', { count: sessions.length })}
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <RefreshCw size={12} />{t('sessions.refresh')}
        </button>
      </div>

      {loading ? (
        <div className="p-5 space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-12 text-center">
          <Fingerprint size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('sessions.noAdmins')}</p>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {sessions.map(session => {
            const lastBadge = session.last_action_type
              ? ACTION_BADGE[session.last_action_type as keyof typeof ACTION_BADGE]
              : null;
            return (
              <div key={session.id} className="flex items-center gap-4 px-5 py-4">
                {/* Avatar placeholder */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'rgba(99,102,241,0.2)', color: '#6366f1' }}
                >
                  {(session.full_name ?? session.email ?? '?')[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                      {session.full_name ?? 'Unknown Admin'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {session.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {session.last_action_at && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t('sessions.lastActive', { time: timeAgo(session.last_action_at) })}
                      </span>
                    )}
                    {lastBadge && session.last_action_type && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: lastBadge.bg, color: lastBadge.color }}>
                        {t(`actions.${session.last_action_type}`, { defaultValue: session.last_action_type })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Today's actions */}
                <div className="text-end flex-shrink-0">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Activity size={12} style={{ color: '#6366f1' }} />
                    <span className="text-sm font-semibold" style={{ color: session.actions_today > 0 ? '#6366f1' : 'var(--text-muted)' }}>
                      {session.actions_today}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('sessions.actionsToday')}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
