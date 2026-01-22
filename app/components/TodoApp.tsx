'use client';

import { useEffect, useMemo, useState } from 'react';

type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const remaining = useMemo(() => todos.filter((t) => !t.done).length, [todos]);

  async function refresh() {
    const res = await fetch('/api/todos', { cache: 'no-store' });
    const data = (await res.json()) as Todo[];
    setTodos(data);
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
        body: JSON.stringify({ title: t }),
      });

      if (!res.ok) return;
      setTitle('');
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
        body: JSON.stringify({ done: !todo.done }),
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

  return (
    <section
      style={{
        border: '1px solid #ddd',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Add a task...'
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #ccc',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTodo();
          }}
          disabled={loading}
        />
        <button
          onClick={addTodo}
          disabled={loading || !title.trim()}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid #333',
            cursor: 'pointer',
          }}
        >
          ADD
        </button>
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
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 10px',
              border: '1px solid #eee',
              borderRadius: 10,
            }}
          >
            <input
              type='checkbox'
              checked={t.done}
              onChange={() => toggle(t)}
              disabled={loading}
            />
            <span
              style={{
                flex: 1,
                textDecoration: t.done ? 'line-through' : 'none',
                opacity: t.done ? 0.6 : 1,
              }}
            >
              {t.title}
            </span>
            <button
              onClick={() => remove(t)}
              disabled={loading}
              style={{
                border: '1px solid #ccc',
                borderRadius: 10,
                padding: '6px 10px',
                cursor: 'pointer',
              }}
              aria-label='Delete'
              title='Delete'
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
