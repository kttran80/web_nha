'use client';

import { useEffect, useMemo, useState } from 'react';

type DealFilter = {
  id: number;
  profile: string;
  keywords: string[];
  merchants: string[];
  categories: string[];
  min_price: string | number | null;
  max_price: string | number | null;
  updated_at: string;
};

type DealFilterDraft = {
  id?: number;
  profile: string;
  keywordsText: string;
  merchantsText: string;
  categoriesText: string;
  minPriceText: string;
  maxPriceText: string;
};

function arrayToText(values: string[] | null | undefined) {
  if (!values || values.length === 0) return '';
  return values.join(', ');
}

function textToArray(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeNumberText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function rowToDraft(row: DealFilter): DealFilterDraft {
  return {
    id: row.id,
    profile: row.profile ?? 'default',
    keywordsText: arrayToText(row.keywords),
    merchantsText: arrayToText(row.merchants),
    categoriesText: arrayToText(row.categories),
    minPriceText: row.min_price === null ? '' : String(row.min_price),
    maxPriceText: row.max_price === null ? '' : String(row.max_price),
  };
}

export default function DealFiltersPage() {
  const [rows, setRows] = useState<DealFilterDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<DealFilterDraft>({
    profile: 'default',
    keywordsText: '',
    merchantsText: '',
    categoriesText: '',
    minPriceText: '',
    maxPriceText: '',
  });

  async function loadRows() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/deal-filters');
      if (!res.ok) throw new Error('Failed to fetch deal filters');
      const data: DealFilter[] = await res.json();
      setRows(data.map(rowToDraft));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  const canCreate = useMemo(() => newRow.profile.trim().length > 0, [newRow.profile]);

  async function saveRow(draft: DealFilterDraft) {
    if (!draft.id) return;

    setSavingId(draft.id);
    setError(null);

    try {
      const res = await fetch('/api/deal-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draft.id,
          profile: draft.profile,
          keywords: textToArray(draft.keywordsText),
          merchants: textToArray(draft.merchantsText),
          categories: textToArray(draft.categoriesText),
          min_price: normalizeNumberText(draft.minPriceText),
          max_price: normalizeNumberText(draft.maxPriceText),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'Failed to save');
      }

      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSavingId(null);
    }
  }

  async function createRow() {
    if (!canCreate) return;
    setSavingId(-1);
    setError(null);

    try {
      const res = await fetch('/api/deal-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: newRow.profile,
          keywords: textToArray(newRow.keywordsText),
          merchants: textToArray(newRow.merchantsText),
          categories: textToArray(newRow.categoriesText),
          min_price: normalizeNumberText(newRow.minPriceText),
          max_price: normalizeNumberText(newRow.maxPriceText),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'Failed to create');
      }

      setNewRow({
        profile: 'default',
        keywordsText: '',
        merchantsText: '',
        categoriesText: '',
        minPriceText: '',
        maxPriceText: '',
      });

      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Deal Filters
      </h1>

      <p style={{ color: '#555', marginBottom: '1.5rem' }}>
        Manage keyword, merchant, and category filters for your Slickdeals ingestion.
      </p>

      <section
        style={{
          padding: '1.25rem',
          border: '1px solid #d0d4db',
          borderRadius: 12,
          marginBottom: '2rem',
          background: '#f8f9fb',
          boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
        }}
      >
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Add New Filter</h2>
        <div style={{ display: 'grid', gap: '0.9rem' }}>
          <label style={{ display: 'grid', gap: '0.4rem' }}>
            <span style={{ fontWeight: 600 }}>Profile</span>
            <input
              value={newRow.profile}
              onChange={(e) => setNewRow({ ...newRow, profile: e.target.value })}
              placeholder="default"
              style={{
                width: '100%',
                padding: '0.65rem 0.8rem',
                borderRadius: 8,
                border: '1px solid #c5c9d2',
                background: '#fff',
              }}
            />
          </label>
          <label style={{ display: 'grid', gap: '0.4rem' }}>
            <span style={{ fontWeight: 600 }}>Keywords</span>
            <input
              value={newRow.keywordsText}
              onChange={(e) => setNewRow({ ...newRow, keywordsText: e.target.value })}
              placeholder="macbook, mac mini, ipad"
              style={{
                width: '100%',
                padding: '0.65rem 0.8rem',
                borderRadius: 8,
                border: '1px solid #c5c9d2',
                background: '#fff',
              }}
            />
          </label>
          <label style={{ display: 'grid', gap: '0.4rem' }}>
            <span style={{ fontWeight: 600 }}>Merchants</span>
            <input
              value={newRow.merchantsText}
              onChange={(e) => setNewRow({ ...newRow, merchantsText: e.target.value })}
              placeholder="bestbuy, amazon"
              style={{
                width: '100%',
                padding: '0.65rem 0.8rem',
                borderRadius: 8,
                border: '1px solid #c5c9d2',
                background: '#fff',
              }}
            />
          </label>
          <label style={{ display: 'grid', gap: '0.4rem' }}>
            <span style={{ fontWeight: 600 }}>Categories</span>
            <input
              value={newRow.categoriesText}
              onChange={(e) => setNewRow({ ...newRow, categoriesText: e.target.value })}
              placeholder="electronics, laptops"
              style={{
                width: '100%',
                padding: '0.65rem 0.8rem',
                borderRadius: 8,
                border: '1px solid #c5c9d2',
                background: '#fff',
              }}
            />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontWeight: 600 }}>Min price</span>
              <input
                value={newRow.minPriceText}
                onChange={(e) => setNewRow({ ...newRow, minPriceText: e.target.value })}
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  borderRadius: 8,
                  border: '1px solid #c5c9d2',
                  background: '#fff',
                }}
              />
            </label>
            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontWeight: 600 }}>Max price</span>
              <input
                value={newRow.maxPriceText}
                onChange={(e) => setNewRow({ ...newRow, maxPriceText: e.target.value })}
                placeholder="999"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  borderRadius: 8,
                  border: '1px solid #c5c9d2',
                  background: '#fff',
                }}
              />
            </label>
          </div>
        </div>
        <button
          onClick={createRow}
          disabled={!canCreate || savingId === -1}
          style={{
            marginTop: '1rem',
            padding: '0.7rem 1.1rem',
            borderRadius: 8,
            border: '1px solid #1d4ed8',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          {savingId === -1 ? 'Creating...' : 'Create filter'}
        </button>
      </section>

      <section>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Existing Filters</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        {!loading && rows.length === 0 && <p>No filters yet.</p>}

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {rows.map((row, index) => (
            <div
              key={row.id ?? index}
              style={{
                border: '1px solid #d0d4db',
                borderRadius: 12,
                padding: '1rem 1.1rem',
                background: '#fff',
                boxShadow: '0 10px 24px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '1rem' }}>#{row.id}</strong>
                <button
                  onClick={() => saveRow(row)}
                  disabled={savingId === row.id}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: 8,
                    border: '1px solid #0f766e',
                    background: '#14b8a6',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  {savingId === row.id ? 'Saving...' : 'Save'}
                </button>
              </div>
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                <label style={{ display: 'grid', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 600 }}>Profile</span>
                  <input
                    value={row.profile}
                    onChange={(e) => {
                      const updated = [...rows];
                      updated[index] = { ...row, profile: e.target.value };
                      setRows(updated);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      borderRadius: 8,
                      border: '1px solid #c5c9d2',
                      background: '#fff',
                    }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 600 }}>Keywords</span>
                  <input
                    value={row.keywordsText}
                    onChange={(e) => {
                      const updated = [...rows];
                      updated[index] = { ...row, keywordsText: e.target.value };
                      setRows(updated);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      borderRadius: 8,
                      border: '1px solid #c5c9d2',
                      background: '#fff',
                    }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 600 }}>Merchants</span>
                  <input
                    value={row.merchantsText}
                    onChange={(e) => {
                      const updated = [...rows];
                      updated[index] = { ...row, merchantsText: e.target.value };
                      setRows(updated);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      borderRadius: 8,
                      border: '1px solid #c5c9d2',
                      background: '#fff',
                    }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 600 }}>Categories</span>
                  <input
                    value={row.categoriesText}
                    onChange={(e) => {
                      const updated = [...rows];
                      updated[index] = { ...row, categoriesText: e.target.value };
                      setRows(updated);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      borderRadius: 8,
                      border: '1px solid #c5c9d2',
                      background: '#fff',
                    }}
                  />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label style={{ display: 'grid', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 600 }}>Min price</span>
                    <input
                      value={row.minPriceText}
                      onChange={(e) => {
                        const updated = [...rows];
                        updated[index] = { ...row, minPriceText: e.target.value };
                        setRows(updated);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.8rem',
                        borderRadius: 8,
                        border: '1px solid #c5c9d2',
                        background: '#fff',
                      }}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 600 }}>Max price</span>
                    <input
                      value={row.maxPriceText}
                      onChange={(e) => {
                        const updated = [...rows];
                        updated[index] = { ...row, maxPriceText: e.target.value };
                        setRows(updated);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.8rem',
                        borderRadius: 8,
                        border: '1px solid #c5c9d2',
                        background: '#fff',
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
