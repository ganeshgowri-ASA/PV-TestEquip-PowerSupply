'use client';

import Link from 'next/link';
import { BarChart3, ArrowRight } from 'lucide-react';

export default function KPIDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BarChart3 className="h-12 w-12 text-blue-400 mb-4" />
      <h2 className="text-xl font-semibold mb-2">KPI Dashboard</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        View comprehensive KPIs, cost analytics, stock health, and vendor metrics
        on the dedicated dashboard page.
      </p>
      <Link
        href="/dashboard"
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
      >
        Open Dashboard <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
