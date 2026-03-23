'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SESSIONS = [
  { id: 1, name: 'App Scaffold', status: 'Done', folder: '/app /components /lib /prisma', desc: 'Next.js 14, TypeScript, Tailwind, Shadcn/ui, Prisma schema' },
  { id: 2, name: 'Nexar API Integration', status: 'Planned', folder: '/app/api/nexar /lib/nexar-client.ts', desc: 'GraphQL queries, pricing, BOM export, Indian vendor alternatives' },
  { id: 3, name: 'Dashboard & KPIs', status: 'Planned', folder: '/app/dashboard /components/charts', desc: 'Sourcing dashboard, price trends, vendor KPIs, recipe cards' },
  { id: 4, name: 'PS Configurator', status: 'Planned', folder: '/app/configurator /lib/calculations.ts', desc: 'TC/HF/LETID/PID recipe builder, ABSI calculator, PDF/JSON export' },
  { id: 5, name: 'CAD Generation', status: 'Planned', folder: '/cad /scripts/freecad', desc: 'FreeCAD Python: rack assembly, views, BOM PDF, cable routing DXF' },
  { id: 6, name: 'PCB Schematics', status: 'Planned', folder: '/pcb /schematics', desc: 'KiCAD: TC-HF, LETID, PID boards — Gerber/BOM export' },
  { id: 7, name: 'Documentation', status: 'Planned', folder: '/docs /public/exports', desc: 'Engineering report, Modbus map, safety interlocks, BOM/BOQ PDF' },
  { id: 8, name: 'Skill Template', status: 'Planned', folder: '/skills /templates', desc: 'Reusable skill for future test equipment (chambers, tracers, EL/PL)' },
];

export default function SkillExport() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Session Orchestration & Skill Export</h2>
        <p className="text-gray-400 text-sm">Claude Code session map — PV TestEquip Power Supply Platform</p>
      </div>

      <div className="space-y-3">
        {SESSIONS.map((s) => (
          <Card key={s.id} className={s.status === 'Done' ? 'border-green-800' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-600 font-mono">Session {s.id}</span>
                    <h3 className="text-sm font-medium text-white">{s.name}</h3>
                    <Badge variant={s.status === 'Done' ? 'success' : 'secondary'} className="text-xs">
                      {s.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{s.desc}</p>
                  <p className="text-xs font-mono text-blue-400">{s.folder}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Export Options</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm">Export agents.md</Button>
          <Button variant="outline" size="sm">Export CLAUDE.md</Button>
          <Button variant="outline" size="sm">Download Skill Template</Button>
        </CardContent>
      </Card>
    </div>
  );
}
