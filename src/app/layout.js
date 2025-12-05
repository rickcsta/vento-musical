// app/layout.js (layout raiz)
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayoutLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Vento Musical',
  description: 'Projeto de extensão do IFPB',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* ClientLayoutLayout NÃO deve ter <html> ou <body> dentro dele */}
        <ClientLayoutLayout>{children}</ClientLayoutLayout>
      </body>
    </html>
  );
}