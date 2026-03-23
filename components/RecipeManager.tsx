'use client';

import Link from 'next/link';
import { Beaker, ArrowRight } from 'lucide-react';

export default function RecipeManager() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Beaker className="h-12 w-12 text-amber-400 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Recipe Manager</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        View TC/HF/LETID/PID test recipes with synchronized timing diagrams
        on the dedicated recipes page.
      </p>
      <Link
        href="/dashboard/recipes"
        className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
      >
        Open Recipes <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
