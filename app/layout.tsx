import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PV TestEquip Power Supply | Antaryami Solar Analytics',
  description:
    'End-to-end power supply design and sourcing platform for PV module reliability testing — TC/HF, LETID, PID. IEC 61215:2021 | IEC TS 62804-1:2025',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
