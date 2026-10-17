import type { ReactNode } from 'react';

export const metadata = {
  title: 'LordPay',
  description: 'Gateway de pagamentos Pix',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          background: '#000',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
