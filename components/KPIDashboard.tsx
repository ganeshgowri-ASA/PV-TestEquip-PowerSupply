'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModuleSelector from '@/components/ModuleSelector';
import type { PVModule } from '@/data/moduleDatabase';

const KPI_CARDS = [
  {
    title: 'TC/HF Power Supply',
    spec: '60V / 30A Bidirectional',
    status: 'Design Phase',
    variant: 'warning' as const,
    details: ['Regenerative Mode', 'IEC 61215:2021', '10 Channels'],
  },
  {
    title: 'LETID Power Supply',
    spec: '60V / 2A Precision',
    status: 'Design Phase',
    variant: 'warning' as const,
    details: ['4-Wire Kelvin', 'IEC 61215:2021', 'PVEL Protocol'],
  },
  {
    title: 'PID Power Supply',
    spec: '±4000V DC / nA–mA',
    status: 'Design Phase',
    variant: 'warning' as const,
    details: ['Safety Interlocks', 'IEC TS 62804-1:2025', '5mA Trip'],
  },
];

function moduleToSpecs(m: PVModule) {
  return [
    { label: 'Technology', value: m.technology },
    { label: 'Voc', value: `${m.Voc}V` },
    { label: 'Isc', value: `${m.Isc}A` },
    { label: 'Pmax', value: `${m.Pmax}W` },
    { label: 'Efficiency', value: `${m.efficiency}%` },
    { label: 'Channels/Rack', value: '10' },
  ];
}

const DEFAULT_MODULE_SPECS = [
  { label: 'Technology', value: 'HJT Bifacial' },
  { label: 'Voc', value: '60V' },
  { label: 'Isc', value: '27A' },
  { label: 'Pmax', value: '1100W' },
  { label: 'Channels/Rack', value: '10' },
  { label: 'Standard', value: 'IEC 61215:2021' },
];

export default function KPIDashboard() {
  const [selectedModule, setSelectedModule] = useState<PVModule | null>(null);

  const specs = selectedModule ? moduleToSpecs(selectedModule) : DEFAULT_MODULE_SPECS;
  const moduleLabel = selectedModule
    ? `${selectedModule.manufacturer} — ${selectedModule.model}`
    : 'HJT Bifacial (Default)';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">System KPIs</h2>
        <p className="text-gray-400 text-sm">Antaryami Solar Analytics — Power Supply Design Status</p>
      </div>

      {/* Power Supply Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {KPI_CARDS.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{card.title}</CardTitle>
                <Badge variant={card.variant}>{card.status}</Badge>
              </div>
              <p className="text-blue-400 font-mono text-sm">{card.spec}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {card.details.map((d) => (
                  <li key={d} className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                    {d}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module Selector */}
      <ModuleSelector onSelect={setSelectedModule} selected={selectedModule} />

      {/* Module Specs — dynamic based on selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Target Module — {moduleLabel}</CardTitle>
            {selectedModule && (
              <button
                className="text-xs text-gray-500 hover:text-gray-300"
                onClick={() => setSelectedModule(null)}
              >
                Reset to default
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specs.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="text-lg font-semibold text-blue-300 mt-1">{value}</p>
              </div>
            ))}
          </div>

          {/* Show test limits when a module is selected */}
          {selectedModule && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Test Limits (auto-computed)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-900 rounded-md p-2">
                  <p className="text-xs text-gray-500 font-semibold mb-1">TC</p>
                  <p>Vmax: <span className="text-blue-300 font-mono">{selectedModule.testLimits.tc.Vmax}V</span></p>
                  <p>Isc: <span className="text-blue-300 font-mono">{selectedModule.testLimits.tc.Isc}A</span></p>
                </div>
                <div className="bg-gray-900 rounded-md p-2">
                  <p className="text-xs text-gray-500 font-semibold mb-1">HF</p>
                  <p>Vmax: <span className="text-blue-300 font-mono">{selectedModule.testLimits.hf.Vmax}V</span></p>
                  <p>Freq: <span className="text-blue-300 font-mono">{selectedModule.testLimits.hf.freq}Hz</span></p>
                  <p>Isc: <span className="text-blue-300 font-mono">{selectedModule.testLimits.hf.Isc}A</span></p>
                </div>
                <div className="bg-gray-900 rounded-md p-2">
                  <p className="text-xs text-gray-500 font-semibold mb-1">LETID</p>
                  <p>Iinj: <span className="text-blue-300 font-mono">{selectedModule.testLimits.letid.Iinject}A</span></p>
                  <p>Voc: <span className="text-blue-300 font-mono">{selectedModule.testLimits.letid.Voc}V</span></p>
                  <p>Cell: <span className="text-blue-300 font-mono">{selectedModule.testLimits.letid.cellTemp}°C</span></p>
                </div>
                <div className="bg-gray-900 rounded-md p-2">
                  <p className="text-xs text-gray-500 font-semibold mb-1">PID</p>
                  <p>Vbias: <span className="text-blue-300 font-mono">{selectedModule.testLimits.pid.Vbias}V</span></p>
                  <p>Ileak: <span className="text-blue-300 font-mono">{selectedModule.testLimits.pid.ImaxLeak}mA</span></p>
                  <p>Dur: <span className="text-blue-300 font-mono">{selectedModule.testLimits.pid.duration}h</span></p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-400 uppercase tracking-widest">Applicable Standards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              'IEC 61215:2021 — TC / HF / LETID',
              'IEC TS 62804-1:2025 — PID',
              'PVEL LETID Sensitivity Test Protocol',
              'Modbus RTU/TCP — All Power Supplies',
            ].map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">✓</span> {s}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-400 uppercase tracking-widest">Design Principles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              'Indian vendor alternatives for all components',
              'Safety interlocks on PID (5mA trip)',
              'Regenerative mode for TC/HF',
              'Export: PDF, PNG, CSV, Excel, STEP, DXF',
            ].map((p) => (
              <div key={p} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-blue-400">→</span> {p}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
