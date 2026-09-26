import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from '../../router/Router';
import logoImg from '../../assets/logo.png';

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  isUnread: boolean;
  type: 'info' | 'success' | 'update';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: '🎉 NOA-E 2.0 플랫폼에 오신 것을 환영합니다!',
    time: '방금 전',
    isUnread: true,
    type: 'success',
  },
  {
    id: '2',
    title: '🤖 에이전트 스튜디오에 신규 기능이 추가되었습니다.',
    time: '1시간 전',
    isUnread: true,
    type: 'update',
  },
  {
    id: '3',
    title: '📚 기초 지식 학습하기 튜토리얼을 시작해보세요.',
    time: '1일 전',
    isUnread: false,
    type: 'info',
  },
];

export const Header: React.FC = () => {
  const { pathname } = useLocation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const notiRef = useRef<HTMLDivElement>(null);

  const isStudio = pathname.startsWith('/noa-e/studio');
  const isNodes = pathname.startsWith('/noa-e/nodes');
  const isTemplates = pathname.startsWith('/noa-e/templates');
  const isLearn = pathname.startsWith('/noa-e/learn');
  const isMyPage = pathname.startsWith('/noa-e/mypage');

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="h-16 w-full px-6 flex items-center justify-between gap-space-lg">
        {/* Logo & Brand - Left aligned */}
        <div className="flex items-center gap-space-xl">
          <Link to="/noa-e" className="flex items-center group py-1" data-path="home">
            <img
              src={logoImg}
              alt="NOA-E"
              className="h-8 w-auto object-contain hover:brightness-110 transition-all"
            />
          </Link>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/noa-e/studio"
              data-path="agent-builder"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isStudio
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              Studio
            </Link>
            <Link
              to="/noa-e/nodes"
              data-path="node-explorer"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isNodes
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              Nodes
            </Link>
            <Link
              to="/noa-e/templates"
              data-path="templates"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isTemplates
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              Templates
            </Link>
            <Link
              to="/noa-e/learn"
              data-path="learn"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isLearn
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              Learn
            </Link>
          </nav>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Button & Dropdown */}
          <div className="relative" ref={notiRef}>
            <button
              aria-label="알림"
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all relative ${
                isNotificationOpen
                  ? 'bg-surface-container-highest text-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(77,142,255,0.8)] animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface-container-low/95 border border-outline-variant/30 shadow-2xl backdrop-blur-xl p-4 z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface text-sm">알림</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-mono font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-outline hover:text-primary transition-colors font-medium"
                      type="button"
                    >
                      모두 읽음
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto no-scrollbar">
                  {notifications.map((noti) => (
                    <div
                      key={noti.id}
                      className={`p-3 rounded-xl transition-all flex items-start gap-3 ${
                        noti.isUnread
                          ? 'bg-surface-container/90 border border-primary/20'
                          : 'bg-surface-container-lowest/40 opacity-70'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="flex flex-col flex-1">
                        <span className="text-xs font-semibold text-on-surface leading-snug">
                          {noti.title}
                        </span>
                        <span className="text-[10px] text-outline mt-1 font-mono">
                          {noti.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* My Page Avatar Button */}
          <Link
            to="/noa-e/mypage"
            aria-label="마이페이지"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isMyPage
                ? 'bg-primary text-on-primary ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_14px_rgba(77,142,255,0.5)]'
                : 'bg-primary-container text-white hover:brightness-110 shadow-[0_0_10px_rgba(77,142,255,0.35)] hover:scale-105 active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

