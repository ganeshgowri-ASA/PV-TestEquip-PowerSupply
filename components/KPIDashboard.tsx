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

const MODULE_SPECS = [
  { label: 'Technology', value: 'HJT Bifacial' },
  { label: 'Voc', value: '60V' },
  { label: 'Isc', value: '27A' },
  { label: 'Pmax', value: '1100W' },
  { label: 'Channels/Rack', value: '10' },
  { label: 'Standard', value: 'IEC 61215:2021' },
];

export default function KPIDashboard() {
  const [selectedModule, setSelectedModule] = useState<PVModule | null>(null);

  const moduleSpecs = selectedModule
    ? [
        { label: 'Technology', value: selectedModule.technology },
        { label: 'Voc', value: `${selectedModule.Voc}V` },
        { label: 'Isc', value: `${selectedModule.Isc}A` },
        { label: 'Pmax', value: `${selectedModule.Pmax}W` },
        { label: 'Efficiency', value: `${selectedModule.efficiency}%` },
        { label: 'Standard', value: 'IEC 61215:2021' },
      ]
    : MODULE_SPECS;

  const moduleTitle = selectedModule
    ? `Target Module — ${selectedModule.manufacturer} ${selectedModule.model}`
    : 'Target Module — HJT Bifacial';

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

      {/* Module Specs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{moduleTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {moduleSpecs.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="text-lg font-semibold text-blue-300 mt-1">{value}</p>
              </div>
            ))}
          </div>
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
