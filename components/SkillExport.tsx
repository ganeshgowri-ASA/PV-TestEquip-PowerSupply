'use client';

import { Download } from 'lucide-react';

export default function SkillExport() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Download className="h-12 w-12 text-purple-400 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Skill Export</h2>
      <p className="text-gray-400 max-w-md">
        Reusable PV test equipment skill template export.
        Coming in Session 8.
      </p>
    </div>
  );
}
