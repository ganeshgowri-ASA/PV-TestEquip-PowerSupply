'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModuleSelector from '@/components/ModuleSelector';
import { type PVModule } from '@/data/moduleDatabase';

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

function moduleSpecs(mod: PVModule | null) {
  if (!mod) {
    return [
      { label: 'Technology', value: 'HJT Bifacial' },
      { label: 'Voc', value: '60V' },
      { label: 'Isc', value: '27A' },
      { label: 'Pmax', value: '1100W' },
      { label: 'Channels/Rack', value: '10' },
      { label: 'Standard', value: 'IEC 61215:2021' },
    ];
  }
  return [
    { label: 'Technology', value: mod.technology },
    { label: 'Voc', value: `${mod.Voc}V` },
    { label: 'Isc', value: `${mod.Isc}A` },
    { label: 'Pmax', value: `${mod.Pmax}W` },
    { label: 'Efficiency', value: `${mod.efficiency}%` },
    { label: 'Vmp / Imp', value: `${mod.Vmp}V / ${mod.Imp}A` },
  ];
}

export default function KPIDashboard() {
  const [selectedModule, setSelectedModule] = useState<PVModule | null>(null);

  const specs = moduleSpecs(selectedModule);
  const moduleTitle = selectedModule
    ? `${selectedModule.manufacturer} — ${selectedModule.model}`
    : 'Target Module — HJT Bifacial (default)';

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

      {/* Module Specs — driven by selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{moduleTitle}</CardTitle>
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

          {/* Test Limits summary when module selected */}
          {selectedModule && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg bg-orange-950/20 border border-orange-900/30 p-3">
                <p className="text-xs font-medium text-orange-300 mb-1">TC Test Limits</p>
                <p className="text-xs text-gray-400">Vmax: {selectedModule.testLimits.tc.Vmax.toFixed(1)}V</p>
                <p className="text-xs text-gray-400">Isc: {selectedModule.testLimits.tc.Isc}A</p>
              </div>
              <div className="rounded-lg bg-cyan-950/20 border border-cyan-900/30 p-3">
                <p className="text-xs font-medium text-cyan-300 mb-1">HF Test Limits</p>
                <p className="text-xs text-gray-400">Vmax: {selectedModule.testLimits.hf.Vmax.toFixed(1)}V</p>
                <p className="text-xs text-gray-400">Freq: {selectedModule.testLimits.hf.freq} cycles</p>
              </div>
              <div className="rounded-lg bg-yellow-950/20 border border-yellow-900/30 p-3">
                <p className="text-xs font-medium text-yellow-300 mb-1">LETID Limits</p>
                <p className="text-xs text-gray-400">Iinject: {selectedModule.testLimits.letid.Iinject}A</p>
                <p className="text-xs text-gray-400">Cell Temp: {selectedModule.testLimits.letid.cellTemp}&deg;C</p>
              </div>
              <div className="rounded-lg bg-red-950/20 border border-red-900/30 p-3">
                <p className="text-xs font-medium text-red-300 mb-1">PID Limits</p>
                <p className="text-xs text-gray-400">Vbias: {selectedModule.testLimits.pid.Vbias}V</p>
                <p className="text-xs text-gray-400">Imax Leak: {selectedModule.testLimits.pid.ImaxLeak}mA</p>
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
