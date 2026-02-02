import { prisma } from "@/lib/prisma";

export async function GET() {
  const todos = await prisma.todo.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(todos);
}

export async function POST(req: Request) {
  const body = await req.json();
  const title = (body?.title ?? "").trim();
  const remindInMinutes =
    body.remindInMinutes === null || body.remindInMinutes === undefined
      ? null
      : Number(body.remindInMinutes);
  const remindAtRaw = body?.remindAt ?? body?.remind_at ?? null;

  if (!title) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const remindAt =
    remindAtRaw !== null && remindAtRaw !== undefined && remindAtRaw !== ""
      ? new Date(remindAtRaw as string)
      : typeof remindInMinutes === "number" &&
          Number.isFinite(remindInMinutes) &&
          remindInMinutes > 0
        ? new Date(Date.now() + remindInMinutes * 60_000)
        : null;

  const todo = await prisma.todo.create({ data: { title, remindAt } });
  return Response.json(todo, { status: 201 });
}
