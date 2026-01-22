import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  const done = Boolean(body?.done);

  const todo = await prisma.todo.update({
    where: { id: params.id },
    data: { done },
  });

  return Response.json(todo);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  await prisma.todo.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
