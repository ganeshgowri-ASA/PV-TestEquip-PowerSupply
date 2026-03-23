'use client';

import Link from 'next/link';
import { ClipboardList, ArrowRight } from 'lucide-react';

export default function BOMManager() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ClipboardList className="h-12 w-12 text-cyan-400 mb-4" />
      <h2 className="text-xl font-semibold mb-2">BOM Manager</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        Full BOM table with add/remove, CSV import, and export to CSV/PDF/Excel
        on the dedicated BOM page.
      </p>
      <Link
        href="/dashboard/bom"
        className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
      >
        Open BOM Manager <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
