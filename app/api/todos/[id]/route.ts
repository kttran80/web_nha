import { prisma } from '@/lib/prisma';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const body = await req.json();
  const { id } = await params;

  const completed =
    body?.completed === undefined && body?.done === undefined
      ? undefined
      : Boolean(body?.completed ?? body?.done);
  const remindAtRaw = body?.remindAt ?? body?.remind_at ?? null;
  const remindAt =
    remindAtRaw === null || remindAtRaw === ''
      ? null
      : new Date(remindAtRaw as string);

  const todo = await prisma.todo.update({
    where: { id: id },
    data: {
      ...(completed === undefined ? {} : { completed }),
      ...(remindAtRaw === undefined ? {} : { remindAt }),
    },
  });

  return Response.json(todo);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await prisma.todo.delete({ where: { id: id } });
  return Response.json({ ok: true });
}
