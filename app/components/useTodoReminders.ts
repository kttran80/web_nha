'use client';

import { useEffect, useRef } from 'react';

type Todo = {
  id: string;
  title: string;
  remindAt: string | Date | null;
  reminderSentAt: string | Date | null;
  completed: boolean;
};

function toMs(d: string | Date) {
  return (d instanceof Date ? d : new Date(d)).getTime();
}

export function useTodoReminders(todos: Todo[]) {
  // giữ timeoutId theo todoId để tránh set trùng
  const timersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Notification có thể không tồn tại (Safari setting / privacy)
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    // xin quyền nếu chưa hỏi
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const now = Date.now();

    for (const t of todos) {
      // bỏ qua nếu không có remindAt / đã gửi / đã hoàn thành
      if (!t.remindAt || t.reminderSentAt || t.completed) continue;

      // tránh tạo timer lại
      if (timersRef.current.has(t.id)) continue;

      const remindAtMs = toMs(t.remindAt);
      const delay = remindAtMs - now;

      // quá giờ rồi thì để cron hoặc lần refresh xử lý; hoặc nhắc ngay nếu muốn
      if (delay <= 0) continue;

      // giới hạn: setTimeout rất dài có thể không ổn định; mình ưu tiên chỉ set nếu < 2 giờ
      // (bạn có thể tăng nếu muốn)
      if (delay > 2 * 60 * 60 * 1000) continue;

      const timeoutId = window.setTimeout(async () => {
        try {
          if (Notification.permission === 'granted') {
            new Notification('Todo reminder', { body: t.title });
          } else {
            // nếu không được phép notification, ít nhất log/hoặc UI toast
            console.log('REMINDER:', t.title);
          }

          // mark đã gửi (client-side guarantee)
          await fetch(`/api/todos/${t.id}/reminder-sent`, { method: 'POST' });
        } catch (e) {
          console.error('Reminder failed', e);
        } finally {
          timersRef.current.delete(t.id);
        }
      }, delay);

      timersRef.current.set(t.id, timeoutId);
    }

    // cleanup khi todos thay đổi hoặc unmount
    return () => {
      for (const [, id] of timersRef.current) {
        window.clearTimeout(id);
      }
      timersRef.current.clear();
    };
  }, [todos]);
}
