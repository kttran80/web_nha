import { prisma } from '@/lib/prisma';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const body = await req.json();
  const done = Boolean(body?.done);
  const { id } = await params;

  const todo = await prisma.todo.update({
    where: { id: id },
    data: { done },
  });

  return Response.json(todo);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await prisma.todo.delete({ where: { id: id } });
  return Response.json({ ok: true });
}
