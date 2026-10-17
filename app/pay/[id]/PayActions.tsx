'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PayActions({
  code,
  pending,
}: {
  code: string;
  pending: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!pending) return;
    const t = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(t);
  }, [pending, router]);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      style={{
        width: '100%',
        padding: 14,
        border: 0,
        borderRadius: 10,
        background: '#22c55e',
        color: '#000',
        fontWeight: 700,
        fontSize: 16,
      }}
    >
      {copied ? 'Copiado!' : 'Copiar código Pix'}
    </button>
  );
}
