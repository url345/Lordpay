import type { CSSProperties } from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { requireAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const labels: Record<string, string> = {
  pending: 'Aguardando',
  paid: 'Pago',
  expired: 'Expirado',
  cancelled: 'Cancelado',
};

const periodos: Record<string, string> = {
  hoje: 'Hoje',
  '7d': '7 dias',
  '30d': '30 dias',
  todos: 'Tudo',
};

const brl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const card: CSSProperties = {
  background: '#111',
  border: '1px solid #27272a',
  borderRadius: 12,
  padding: 16,
};

function chip(ativo: boolean): CSSProperties {
  return {
    padding: '8px 12px',
    borderRadius: 20,
    fontSize: 14,
    textDecoration: 'none',
    border: '1px solid ' + (ativo ? '#22c55e' : '#27272a'),
    color: ativo ? '#000' : '#a1a1aa',
    background: ativo ? '#22c55e' : '#111',
  };
}

export default async function Admin({
  searchParams,
}: {
  searchParams: { status?: string; periodo?: string };
}) {
  if (!(await requireAdmin())) redirect('/login');

  const status = searchParams.status ?? 'todos';
  const periodo = searchParams.periodo ?? '30d';

  let q = db()
    .from('charges')
    .select('public_id, amount_cents, description, status, created_at, paid_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (periodo !== 'todos') {
    const d = new Date();
    if (periodo === 'hoje') d.setHours(0, 0, 0, 0);
    else d.setDate(d.getDate() - (periodo === '7d' ? 7 : 30));
    q = q.gte('created_at', d.toISOString());
  }

  const { data } = await q;
  const todas = data ?? [];
  const pagas = todas.filter((c) => c.status === 'paid');
  const pendentes = todas.filter((c) => c.status === 'pending');
  const totalPago = pagas.reduce((s, c) => s + c.amount_cents, 0);
  const lista =
    status === 'todos' ? todas : todas.filter((c) => c.status === status);

  const href = (s: string, p: string) => `/admin?status=${s}&periodo=${p}`;

  return (
    <main
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <h1 style={{ color: '#22c55e', margin: 0 }}>LordPay</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
        }}
      >
        <div style={card}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Total recebido</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>
            {brl(totalPago)}
          </div>
        </div>
        <div style={card}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Transações pagas</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{pagas.length}</div>
        </div>
        <div style={card}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Pendentes</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{pendentes.length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(periodos).map(([k, v]) => (
          <a key={k} href={href(status, k)} style={chip(periodo === k)}>
            {v}
          </a>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['todos', 'pending', 'paid', 'expired', 'cancelled'].map((s) => (
          <a key={s} href={href(s, periodo)} style={chip(status === s)}>
            {s === 'todos' ? 'Todos' : labels[s]}
          </a>
        ))}
      </div>

      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ color: '#a1a1aa', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Data</th>
              <th style={{ padding: 12 }}>Valor</th>
              <th style={{ padding: 12 }}>Identificador</th>
              <th style={{ padding: 12 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((c) => (
              <tr key={c.public_id} style={{ borderTop: '1px solid #27272a' }}>
                <td style={{ padding: 12, whiteSpace: 'nowrap' }}>
                  {new Date(c.created_at).toLocaleString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                  })}
                </td>
                <td style={{ padding: 12 }}>{brl(c.amount_cents)}</td>
                <td style={{ padding: 12 }}>
                  <a href={`/pay/${c.public_id}`} style={{ color: '#22c55e' }}>
                    {c.public_id}
                  </a>
                </td>
                <td style={{ padding: 12 }}>{labels[c.status] ?? c.status}</td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 16, color: '#a1a1aa' }}>
                  Nenhuma transação neste filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
