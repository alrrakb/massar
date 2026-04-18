import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, RefreshCw } from 'lucide-react';
import { notificationService } from '../../api/notificationService';
import { NotificationWithReadStatus } from '../../types';
import { supabase } from '../../../../services/supabase';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationWithReadStatus[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadNotifications();
        subscribeToNotifications();

        // Click outside to close
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const [notifs, count] = await Promise.all([
                notificationService.getMyNotifications(),
                notificationService.getUnreadCount()
            ]);
            setNotifications(notifs);
            setUnreadCount(count);
        } catch (err) {
            console.error('Error loading notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToNotifications = () => {
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notification_recipients'
                },
                () => {
                    // Reload notifications when new one arrives
                    loadNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleToggle = () => {
        if (!isOpen) {
            // Opening - mark all as read after a delay
            setTimeout(() => {
                if (unreadCount > 0) {
                    notificationService.markAllAsRead();
                    setUnreadCount(0);
                    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                }
            }, 2000);
        }
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = async (e: React.MouseEvent, recipientId: string) => {
        e.stopPropagation();
        try {
            await notificationService.markAsRead(recipientId);
            setNotifications(prev =>
                prev.map(n =>
                    n.recipient_id === recipientId ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.bellBtn}
                onClick={handleToggle}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                        <h3 className={styles.dropdownTitle}>Notifications</h3>
                        <div className={styles.headerActions}>
                            <button
                                className={styles.refreshBtn}
                                onClick={loadNotifications}
                                disabled={loading}
                                title="Refresh notifications"
                            >
                                <RefreshCw size={16} className={loading ? styles.spin : ''} />
                            </button>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.notificationsList}>
                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner}></div>
                                <span>Loading...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.empty}>
                                <Bell size={40} color="#64748b" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`${styles.notificationItem} ${!notification.is_read ? styles.unread : ''}`}
                                >
                                    <div className={styles.notificationContent}>
                                        <div className={styles.notificationHeader}>
                                            <h4 className={styles.notificationTitle}>
                                                {notification.title}
                                            </h4>
                                            {!notification.is_read && (
                                                <button
                                                    className={styles.readBtn}
                                                    onClick={(e) => handleMarkAsRead(e, notification.recipient_id)}
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <p className={styles.notificationMessage}>
                                            {notification.message}
                                        </p>
                                        <div className={styles.notificationFooter}>
                                            <span className={styles.sender}>
                                                From: {notification.sender?.full_name || 'Admin'}
                                            </span>
                                            <span className={styles.time}>
                                                {formatTime(notification.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
