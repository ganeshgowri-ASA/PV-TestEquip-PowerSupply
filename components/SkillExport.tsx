'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/Toast';

const SESSIONS = [
  { id: 1, name: 'App Scaffold', status: 'Done', folder: '/app /components /lib /prisma', desc: 'Next.js 14, TypeScript, Tailwind, Shadcn/ui, Prisma schema' },
  { id: 2, name: 'Nexar API Integration', status: 'Done', folder: '/app/api/nexar /lib/nexar-client.ts', desc: 'GraphQL queries, pricing, BOM export, Indian vendor alternatives' },
  { id: 3, name: 'Dashboard & KPIs', status: 'Done', folder: '/app/dashboard /components/charts', desc: 'Sourcing dashboard, price trends, vendor KPIs, recipe cards' },
  { id: 4, name: 'PS Configurator', status: 'Done', folder: '/app/configurator /lib/calculations.ts', desc: 'TC/HF/LETID/PID recipe builder, ABSI calculator, PDF/JSON export' },
  { id: 5, name: 'CAD Generation', status: 'Planned', folder: '/cad /scripts/freecad', desc: 'FreeCAD Python: rack assembly, views, BOM PDF, cable routing DXF' },
  { id: 6, name: 'PCB Schematics', status: 'Planned', folder: '/pcb /schematics', desc: 'KiCAD: TC-HF, LETID, PID boards - Gerber/BOM export' },
  { id: 7, name: 'Documentation', status: 'Planned', folder: '/docs /public/exports', desc: 'Engineering report, Modbus map, safety interlocks, BOM/BOQ PDF' },
  { id: 8, name: 'Skill Template', status: 'Done', folder: '/skills /templates', desc: 'Reusable skill for future test equipment (chambers, tracers, EL/PL)' },
];

export default function SkillExport() {
  const { toast } = useToast();

  const exportJSON = () => {
    const config = {
      project: 'PV-TestEquip-PowerSupply',
      company: 'Antaryami Solar Analytics',
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      targetModule: { technology: 'HJT', voc: 60, isc: 27, pmax: 1100, channels: 10 },
      testTypes: ['TC', 'HF', 'LETID', 'PID'],
      standards: ['IEC 61215:2021', 'IEC TS 62804-1:2025', 'PVEL LETID Protocol'],
      powerSupplies: {
        'TC/HF': { model: 'Itech IT6500C', spec: '60V/30A Bidirectional Regenerative', qty: 5 },
        LETID: { model: 'Keysight E36312A', spec: '60V/2A Precision', qty: 2 },
        PID: { model: 'Glassman EH', spec: '\u00B14000V HV', qty: 1 },
      },
      sessions: SESSIONS,
      rack: { standard: '19" EIA-310', height: '42U', units: 10, maxRacks: 5 },
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pv-testequip-config.json'; a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Project config exported as JSON');
  };

  const exportPDFReport = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text('PV TestEquip Power Supply', 14, 25);
      doc.setFontSize(12);
      doc.text('System Engineering Report', 14, 33);
      doc.setFontSize(9);
      doc.text(`Antaryami Solar Analytics | ${new Date().toLocaleDateString('en-IN')}`, 14, 40);

      doc.setFontSize(14);
      doc.text('1. Target Module', 14, 55);
      doc.setFontSize(9);
      doc.text('Technology: HJT Bifacial | Voc: 60V | Isc: 27A | Pmax: 1100W | Channels: 10/rack', 14, 62);

      doc.setFontSize(14);
      doc.text('2. Power Supply Configuration', 14, 75);
      autoTable(doc, {
        startY: 80,
        head: [['Test Type', 'Model', 'Specification', 'Qty/Rack', 'Standard']],
        body: [
          ['TC/HF', 'Itech IT6500C', '60V/30A Bidirectional', '5', 'IEC 61215:2021'],
          ['LETID', 'Keysight E36312A', '60V/2A Precision', '2', 'PVEL Protocol'],
          ['PID', 'Glassman EH', '\u00B14000V DC', '1', 'IEC TS 62804-1:2025'],
        ],
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 64, 120] },
      });

      doc.setFontSize(14);
      doc.text('3. Session Status', 14, 130);
      autoTable(doc, {
        startY: 135,
        head: [['Session', 'Name', 'Status', 'Description']],
        body: SESSIONS.map(s => [s.id, s.name, s.status, s.desc]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [30, 64, 120] },
      });

      doc.save('pv-testequip-report.pdf');
      toast('success', 'PDF report generated');
    } catch {
      toast('error', 'Failed to generate PDF');
    }
  };

  const exportAgentsMd = () => {
    const content = SESSIONS.map(s => `## Session ${s.id}: ${s.name}\n- Status: ${s.status}\n- Folders: ${s.folder}\n- ${s.desc}\n`).join('\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'agents.md'; a.click();
    URL.revokeObjectURL(url);
    toast('success', 'agents.md exported');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Session Orchestration & Skill Export</h2>
        <p className="text-gray-400 text-sm">Claude Code session map - PV TestEquip Power Supply Platform</p>
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
                    <Badge variant={s.status === 'Done' ? 'success' : 'secondary'} className="text-xs">{s.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{s.desc}</p>
                  <p className="text-xs font-mono text-blue-400">{s.folder}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Architecture Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">System Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 800 300" className="w-full" xmlns="http://www.w3.org/2000/svg">
            {/* PLC */}
            <rect x="340" y="10" width="120" height="50" rx="6" fill="#3b1e5f" stroke="#a855f7" strokeWidth="1.5" />
            <text x="400" y="30" textAnchor="middle" fill="#e5e7eb" fontSize="10" fontWeight="600">Siemens S7-1200</text>
            <text x="400" y="45" textAnchor="middle" fill="#a855f7" fontSize="8">PLC Controller</text>

            {/* HMI */}
            <rect x="520" y="10" width="120" height="50" rx="6" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="580" y="30" textAnchor="middle" fill="#e5e7eb" fontSize="10" fontWeight="600">Weintek MT8102iE</text>
            <text x="580" y="45" textAnchor="middle" fill="#3b82f6" fontSize="8">HMI Touchscreen</text>

            {/* Modbus line */}
            <line x1="400" y1="60" x2="400" y2="90" stroke="#6b7280" strokeWidth="1.5" />
            <text x="415" y="80" fill="#6b7280" fontSize="7">Modbus RTU</text>

            {/* Bus */}
            <rect x="50" y="90" width="700" height="25" rx="3" fill="#1a1a2e" stroke="#374151" strokeWidth="1" />
            <text x="400" y="107" textAnchor="middle" fill="#6b7280" fontSize="9">RS-485 / Modbus Communication Bus</text>

            {/* TC/HF */}
            <line x1="130" y1="115" x2="130" y2="150" stroke="#3b82f6" strokeWidth="1" />
            <rect x="60" y="150" width="140" height="60" rx="6" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="130" y="170" textAnchor="middle" fill="#e5e7eb" fontSize="9" fontWeight="600">TC/HF Power Supply</text>
            <text x="130" y="185" textAnchor="middle" fill="#3b82f6" fontSize="8">Itech IT6500C</text>
            <text x="130" y="200" textAnchor="middle" fill="#6b7280" fontSize="7">60V/30A Bidirectional</text>

            {/* LETID */}
            <line x1="350" y1="115" x2="350" y2="150" stroke="#eab308" strokeWidth="1" />
            <rect x="280" y="150" width="140" height="60" rx="6" fill="#3b3a1e" stroke="#eab308" strokeWidth="1.5" />
            <text x="350" y="170" textAnchor="middle" fill="#e5e7eb" fontSize="9" fontWeight="600">LETID Power Supply</text>
            <text x="350" y="185" textAnchor="middle" fill="#eab308" fontSize="8">Keysight E36312A</text>
            <text x="350" y="200" textAnchor="middle" fill="#6b7280" fontSize="7">60V/2A Precision 4-Wire</text>

            {/* PID */}
            <line x1="570" y1="115" x2="570" y2="150" stroke="#ef4444" strokeWidth="1" />
            <rect x="500" y="150" width="140" height="60" rx="6" fill="#5f1e1e" stroke="#ef4444" strokeWidth="1.5" />
            <text x="570" y="170" textAnchor="middle" fill="#e5e7eb" fontSize="9" fontWeight="600">PID HV Supply</text>
            <text x="570" y="185" textAnchor="middle" fill="#ef4444" fontSize="8">Glassman EH Series</text>
            <text x="570" y="200" textAnchor="middle" fill="#6b7280" fontSize="7">{'\u00B1'}4000V DC nA-mA</text>

            {/* DAQ */}
            <line x1="700" y1="115" x2="700" y2="150" stroke="#22c55e" strokeWidth="1" />
            <rect x="640" y="150" width="120" height="60" rx="6" fill="#1e5f3a" stroke="#22c55e" strokeWidth="1.5" />
            <text x="700" y="170" textAnchor="middle" fill="#e5e7eb" fontSize="9" fontWeight="600">Data Logger</text>
            <text x="700" y="185" textAnchor="middle" fill="#22c55e" fontSize="8">DAQ970A</text>
            <text x="700" y="200" textAnchor="middle" fill="#6b7280" fontSize="7">PT100/Humidity</text>

            {/* Modules */}
            <line x1="130" y1="210" x2="130" y2="240" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" />
            <line x1="350" y1="210" x2="350" y2="240" stroke="#eab308" strokeWidth="1" strokeDasharray="4" />
            <line x1="570" y1="210" x2="570" y2="240" stroke="#ef4444" strokeWidth="1" strokeDasharray="4" />
            <rect x="40" y="240" width="600" height="45" rx="6" fill="#0a0a1a" stroke="#374151" strokeWidth="1.5" />
            <text x="340" y="260" textAnchor="middle" fill="#e5e7eb" fontSize="10" fontWeight="600">PV Module Under Test (10 Channels per Rack)</text>
            <text x="340" y="275" textAnchor="middle" fill="#6b7280" fontSize="8">HJT Bifacial | Voc: 60V | Isc: 27A | Pmax: 1100W</text>

            {/* HMI to PLC */}
            <line x1="520" y1="35" x2="460" y2="35" stroke="#6b7280" strokeWidth="1" strokeDasharray="3" />
            <text x="490" y="30" textAnchor="middle" fill="#6b7280" fontSize="7">Ethernet</text>
          </svg>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Export Options</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={exportAgentsMd}>Export agents.md</Button>
          <Button variant="outline" size="sm" onClick={exportJSON}>Export Project JSON</Button>
          <Button variant="outline" size="sm" onClick={exportPDFReport}>Generate PDF Report</Button>
        </CardContent>
      </Card>
    </div>
  );
}
