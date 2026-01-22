import { prisma } from '@/lib/prisma';

export async function GET() {
  const todos = await prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });
  return Response.json(todos);
}

export async function POST(req: Request) {
  const body = await req.json();
  const title = (body?.title ?? '').trim();

  if (!title) {
    return Response.json({ error: 'Title is required' }, { status: 400 });
  }

  const todo = await prisma.todo.create({ data: { title } });
  return Response.json(todo, { status: 201 });
}
