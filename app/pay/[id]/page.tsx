import { db } from '@/lib/supabase';
import PayActions from './PayActions';

export const dynamic = 'force-dynamic';

const labels: Record<string, string> = {
  pending: 'Aguardando pagamento',
  paid: 'Pago',
  expired: 'Expirado',
  cancelled: 'Cancelado',
};

export default async function PayPage({ params }: { params: { id: string } }) {
  const { data: c } = await db()
    .from('charges')
    .select('amount_cents, description, status, pix_copy_paste, pix_qr_base64')
    .eq('public_id', params.id)
    .maybeSingle();

  if (!c) {
    return (
      <main style={{ padding: 32, textAlign: 'center' }}>
        Cobrança não encontrada.
      </main>
    );
  }

  const valor = (c.amount_cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const pending = c.status === 'pending';

  return (
    <main
      style={{
        maxWidth: 420,
        margin: '0 auto',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <h1 style={{ color: '#22c55e', margin: 0 }}>LordPay</h1>
      <div>
        <div style={{ fontSize: 32, fontWeight: 700 }}>{valor}</div>
        {c.description && (
          <div style={{ color: '#a1a1aa' }}>{c.description}</div>
        )}
      </div>

      <div
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          background: '#111',
          border: '1px solid #22c55e',
          color: '#22c55e',
        }}
      >
        {labels[c.status] ?? c.status}
      </div>

      {pending && (
        <>
          {c.pix_qr_base64 && (
            <img
              alt="QR Code Pix"
              src={`data:image/png;base64,${c.pix_qr_base64}`}
              style={{ width: '100%', background: '#fff', borderRadius: 12 }}
            />
          )}
          {c.pix_copy_paste && (
            <>
              <div
                style={{
                  wordBreak: 'break-all',
                  fontSize: 12,
                  color: '#a1a1aa',
                  background: '#111',
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                {c.pix_copy_paste}
              </div>
              <PayActions code={c.pix_copy_paste} pending={pending} />
            </>
          )}
        </>
      )}

      {c.status === 'paid' && <p>Pagamento confirmado. Obrigado!</p>}
    </main>
  );
}
