'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Search,
  ClipboardList,
  Beaker,
  Zap,
  Home,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'KPI Overview', icon: BarChart3 },
  { href: '/dashboard/sourcing', label: 'Component Sourcing', icon: Search },
  { href: '/dashboard/bom', label: 'BOM Manager', icon: ClipboardList },
  { href: '/dashboard/recipes', label: 'Test Recipes', icon: Beaker },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 border-b border-blue-700/50 px-6 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-yellow-400" />
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                PV TestEquip Power Supply
              </h1>
              <p className="text-blue-300 text-xs">
                TC/HF/LETID/PID — IEC 61215:2021 | IEC 62804 | HJT Bifacial
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-blue-300 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
            </Link>
            <div className="text-right">
              <p className="text-xs text-blue-300 font-medium">
                Antaryami Solar Analytics
              </p>
              <p className="text-xs text-blue-400/70">
                {new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-gray-900/80 border-b border-gray-800 px-6">
        <div className="max-w-screen-2xl mx-auto flex overflow-x-auto gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  isActive
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-screen-2xl mx-auto p-6">{children}</main>
    </div>
  );
}
