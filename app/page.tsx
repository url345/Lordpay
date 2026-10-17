export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <h1 style={{ color: '#22c55e', fontSize: 40, margin: 0 }}>LordPay</h1>
      <p style={{ color: '#a1a1aa', margin: 0 }}>Gateway de pagamentos Pix</p>
    </main>
  );
}
