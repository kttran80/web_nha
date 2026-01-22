import TodoApp from '@/app/components/TodoApp';

export default function Page() {
  return (
    <main style={{ padding: 24, maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 16 }}>TODO</h1>
      <TodoApp />
    </main>
  );
}
