import { prisma } from '@/lib/prisma';

type DealFilterRow = {
  id: number;
  profile: string;
  keywords: string[];
  merchants: string[];
  categories: string[];
  min_price: string | number | null;
  max_price: string | number | null;
  updated_at: string;
};

function normalizeTextArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === 'string' ? v.trim() : ''))
      .filter((v) => v.length > 0);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }

  return [];
}

function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET() {
  const rows = await prisma.$queryRaw<DealFilterRow[]>`
    SELECT id, profile, keywords, merchants, categories, min_price, max_price, updated_at
    FROM deal_filters
    ORDER BY updated_at DESC, id DESC
  `;

  return Response.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();

  const id = body?.id ? Number(body.id) : null;
  const profile = (body?.profile ?? 'default').toString().trim() || 'default';
  const keywords = normalizeTextArray(body?.keywords);
  const merchants = normalizeTextArray(body?.merchants);
  const categories = normalizeTextArray(body?.categories);
  const minPrice = normalizeNumber(body?.min_price ?? body?.minPrice);
  const maxPrice = normalizeNumber(body?.max_price ?? body?.maxPrice);

  if (id && Number.isFinite(id)) {
    const updated = await prisma.$queryRaw<DealFilterRow[]>`
      UPDATE deal_filters
      SET profile = ${profile},
          keywords = ${keywords}::text[],
          merchants = ${merchants}::text[],
          categories = ${categories}::text[],
          min_price = ${minPrice}::numeric,
          max_price = ${maxPrice}::numeric,
          updated_at = now()
      WHERE id = ${id}
      RETURNING id, profile, keywords, merchants, categories, min_price, max_price, updated_at
    `;

    if (!updated[0]) {
      return Response.json({ error: 'Deal filter not found' }, { status: 404 });
    }

    return Response.json(updated[0]);
  }

  const inserted = await prisma.$queryRaw<DealFilterRow[]>`
    INSERT INTO deal_filters (profile, keywords, merchants, categories, min_price, max_price)
    VALUES (${profile}, ${keywords}::text[], ${merchants}::text[], ${categories}::text[], ${minPrice}::numeric, ${maxPrice}::numeric)
    RETURNING id, profile, keywords, merchants, categories, min_price, max_price, updated_at
  `;

  return Response.json(inserted[0], { status: 201 });
}
