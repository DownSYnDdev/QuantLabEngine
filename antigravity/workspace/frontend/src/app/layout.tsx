import type { Metadata } from 'next';
import { Fira_Code, Fira_Sans } from 'next/font/google';
import './globals.css';
import { TenantProvider } from '@/contexts/TenantContext';
import { Sidebar } from '@/components/layout/Sidebar';

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
});

const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fira-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'QuantLab - Trading Platform',
  description: 'White-label simulated trading engine for prop firms',
  keywords: ['trading', 'quantlab', 'prop firm', 'backtesting', 'algorithmic trading'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${firaCode.variable} ${firaSans.variable} font-sans bg-slate-950 text-slate-200 antialiased`}
      >
        <TenantProvider>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content area */}
            <main className="flex-1 ml-64 transition-all duration-300">
              {children}
            </main>
          </div>
        </TenantProvider>
      </body>
    </html>
  );
}
