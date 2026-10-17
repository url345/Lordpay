'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function entrar() {
    setLoading(true);
    setErro('');
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (error) {
      setErro('E-mail ou senha inválidos');
      setLoading(false);
      return;
    }
    window.location.href = '/admin';
  }

  const campo = {
    padding: 14,
    borderRadius: 10,
    border: '1px solid #27272a',
    background: '#111',
    color: '#fff',
    fontSize: 16,
  } as const;

  return (
    <main
      style={{
        maxWidth: 380,
        margin: '0 auto',
        padding: 24,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 12,
      }}
    >
      <h1 style={{ color: '#22c55e', margin: 0 }}>LordPay</h1>
      <p style={{ color: '#a1a1aa', margin: '0 0 8px' }}>Acesso restrito</p>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={campo}
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        style={campo}
      />
      {erro && <div style={{ color: '#f87171' }}>{erro}</div>}
      <button
        onClick={entrar}
        disabled={loading}
        style={{
          padding: 14,
          border: 0,
          borderRadius: 10,
          background: '#22c55e',
          color: '#000',
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </main>
  );
}
