'use client';

import { useEffect, useMemo, useState } from 'react';

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  remindAt: string | null;
  reminderSentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [reminderDrafts, setReminderDrafts] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const remaining = useMemo(
    () => todos.filter((t) => !t.completed).length,
    [todos]
  );

  function toLocalInputValue(iso: string | null | undefined) {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (value: number) => String(value).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  async function refresh() {
    const res = await fetch('/api/todos', { cache: 'no-store' });
    const data = (await res.json()) as Todo[];
    setTodos(data);
    setReminderDrafts(
      data.reduce<Record<string, string>>((acc, todo) => {
        acc[todo.id] = toLocalInputValue(todo.remindAt);
        return acc;
      }, {})
    );
  }

  useEffect(() => {
    refresh();
  }, []);

  async function addTodo() {
    const t = title.trim();
    if (!t) return;

    setLoading(true);
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: t,
          remindAt: remindAt.trim() ? remindAt.trim() : null,
        }),
      });

      if (!res.ok) return;
      setTitle('');
      setRemindAt('');
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function toggle(todo: Todo) {
    setLoading(true);
    try {
      await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function updateReminder(todo: Todo) {
    setLoading(true);
    try {
      const draft = reminderDrafts[todo.id] ?? '';
      await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remindAt: draft.trim() ? draft.trim() : null,
        }),
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove(todo: Todo) {
    setLoading(true);
    try {
      await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' });
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    section: {
      border: '1px solid var(--card-border)',
      borderRadius: 16,
      padding: 16,
      background: 'var(--card-bg)',
      boxShadow: '0 18px 40px rgba(0,0,0,0.25)',
    },
    label: {
      display: 'grid',
      gap: 6,
      color: 'var(--button-text)',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.3,
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: 12,
      border: '1px solid var(--input-border)',
      background: 'var(--input-bg)',
      color: 'var(--input-text)',
    },
    button: {
      padding: '10px 14px',
      borderRadius: 12,
      border: '1px solid var(--button-border)',
      background: 'var(--button-bg)',
      color: 'var(--button-text)',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    smallButton: {
      border: '1px solid var(--button-border)',
      borderRadius: 12,
      padding: '6px 10px',
      cursor: 'pointer',
      background: 'var(--button-bg)',
      color: 'var(--button-text)',
    },
  } as const;

  return (
    <section style={styles.section}>
      <div style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
        <label style={styles.label}>
          <span>Task</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Add a task...'
            style={styles.input}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTodo();
            }}
            disabled={loading}
          />
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 10,
            alignItems: 'end',
          }}
        >
          <label style={styles.label}>
            <span>Reminder time</span>
            <input
              type='datetime-local'
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              style={styles.input}
              disabled={loading}
            />
          </label>
          <button
            onClick={addTodo}
            disabled={loading || !title.trim()}
            style={{ ...styles.button, height: 42 }}
          >
            ADD
          </button>
        </div>
      </div>

      <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 10 }}>
        Remaining: {remaining}
      </div>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gap: 8,
        }}
      >
        {todos.map((t) => (
          <li
            key={t.id}
            style={{
              display: 'grid',
              gap: 8,
              padding: '10px 12px',
              border: '1px solid var(--card-border)',
              borderRadius: 16,
              background: 'var(--card-bg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type='checkbox'
                checked={t.completed}
                onChange={() => toggle(t)}
                disabled={loading}
              />
              <span
                style={{
                  flex: 1,
                  textDecoration: t.completed ? 'line-through' : 'none',
                  opacity: t.completed ? 0.6 : 1,
                }}
              >
                {t.title}
              </span>
              <button
                onClick={() => remove(t)}
                disabled={loading}
                style={styles.smallButton}
                aria-label='Delete'
                title='Delete'
              >
                ✕
              </button>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 10,
                alignItems: 'end',
              }}
            >
              <label style={styles.label}>
                <span>Reminder time</span>
                <input
                  type='datetime-local'
                  value={reminderDrafts[t.id] ?? ''}
                  onChange={(e) =>
                    setReminderDrafts((prev) => ({
                      ...prev,
                      [t.id]: e.target.value,
                    }))
                  }
                  style={styles.input}
                  disabled={loading}
                />
              </label>
              <button
                onClick={() => updateReminder(t)}
                disabled={loading}
                style={styles.button}
              >
                Update reminder
              </button>
            </div>
            {t.remindAt && (
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Current: {new Date(t.remindAt).toLocaleString()}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
