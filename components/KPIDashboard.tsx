'use client';

import { Dispatch, SetStateAction } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModuleSelector from '@/components/ModuleSelector';
import type { PVModule } from '@/data/moduleDatabase';

interface KPIDashboardProps {
  selectedModule: PVModule | null;
  onSelectModule: Dispatch<SetStateAction<PVModule | null>>;
}

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
    spec: '\u00B14000V DC / nA\u2013mA',
    status: 'Design Phase',
    variant: 'warning' as const,
    details: ['Safety Interlocks', 'IEC TS 62804-1:2025', '5mA Trip'],
  },
];

const TECH_CARDS = [
  { tech: 'HJT', icon: 'H', desc: 'Heterojunction', type: 'n-type' },
  { tech: 'TOPCon', icon: 'T', desc: 'Tunnel Oxide Passivated', type: 'n-type' },
  { tech: 'PERC', icon: 'P', desc: 'Passivated Emitter Rear', type: 'p-type' },
  { tech: 'HBC', icon: 'B', desc: 'Back Contact', type: 'n-type' },
  { tech: 'IBC', icon: 'I', desc: 'Interdigitated Back Contact', type: 'n-type' },
  { tech: 'Bifacial', icon: 'Bf', desc: 'Bifacial Module', type: 'n/p-type' },
  { tech: 'Thin Film', icon: 'TF', desc: 'CdTe / CIGS', type: 'thin-film' },
  { tech: 'Perovskite', icon: 'Pk', desc: 'Tandem / Single', type: 'emerging' },
];

function getStandardsForTech(tech: string): string[] {
  const base = ['IEC 61215:2021 \u2014 TC / HF'];
  if (['HJT', 'HBC', 'TOPCon', 'PERC', 'Bifacial', 'n-type', 'p-type'].includes(tech)) {
    base.push('IEC 61215:2021 \u2014 LETID (MQT 19)');
    base.push('PVEL LETID Sensitivity Test Protocol');
  }
  base.push('IEC TS 62804-1:2025 \u2014 PID');
  base.push('Modbus RTU/TCP \u2014 All Power Supplies');
  return base;
}

export default function KPIDashboard({ selectedModule, onSelectModule }: KPIDashboardProps) {

  const moduleSpecs = selectedModule
    ? [
        { label: 'Technology', value: selectedModule.technology },
        { label: 'Voc', value: `${selectedModule.Voc}V` },
        { label: 'Isc', value: `${selectedModule.Isc}A` },
        { label: 'Pmax', value: `${selectedModule.Pmax}W` },
        { label: 'Efficiency', value: `${selectedModule.efficiency}%` },
        { label: 'Standard', value: 'IEC 61215:2021' },
      ]
    : [
        { label: 'Technology', value: 'Select Module' },
        { label: 'Voc', value: '\u2014' },
        { label: 'Isc', value: '\u2014' },
        { label: 'Pmax', value: '\u2014' },
        { label: 'Efficiency', value: '\u2014' },
        { label: 'Standard', value: 'IEC 61215:2021' },
      ];

  const moduleTitle = selectedModule
    ? `Target Module \u2014 ${selectedModule.manufacturer} ${selectedModule.model}`
    : 'Target Module \u2014 HJT Bifacial';

  const standards = selectedModule
    ? getStandardsForTech(selectedModule.technology)
    : [
        'IEC 61215:2021 \u2014 TC / HF / LETID',
        'IEC TS 62804-1:2025 \u2014 PID',
        'PVEL LETID Sensitivity Test Protocol',
        'Modbus RTU/TCP \u2014 All Power Supplies',
      ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">System KPIs</h2>
          <p className="text-gray-400 text-sm">Antaryami Solar Analytics &mdash; Power Supply Design Status</p>
        </div>
      </div>

      <ModuleSelector onSelect={onSelectModule} selected={selectedModule} />

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

      {selectedModule && selectedModule.testLimits && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-400 uppercase tracking-widest">Test Limits Matrix</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="text-left p-3">Test Type</th>
                    <th className="text-center p-3">Standard</th>
                    <th className="text-center p-3">V Limit</th>
                    <th className="text-center p-3">I Limit</th>
                    <th className="text-center p-3">Additional</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 text-blue-400 font-medium">TC (Thermal Cycling)</td>
                    <td className="p-3 text-center text-xs text-gray-400">IEC 61215:2021</td>
                    <td className="p-3 text-center font-mono text-xs">{selectedModule.testLimits.tc.Vmax.toFixed(1)}V</td>
                    <td className="p-3 text-center font-mono text-xs">{selectedModule.testLimits.tc.Isc.toFixed(2)}A</td>
                    <td className="p-3 text-center text-xs text-gray-400">200/400 cycles, -40&deg;C to +85&deg;C</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 text-cyan-400 font-medium">HF (Humidity Freeze)</td>
                    <td className="p-3 text-center text-xs text-gray-400">IEC 61215:2021</td>
                    <td className="p-3 text-center font-mono text-xs">{selectedModule.testLimits.hf.Vmax.toFixed(1)}V</td>
                    <td className="p-3 text-center font-mono text-xs">{selectedModule.testLimits.hf.Isc.toFixed(2)}A</td>
                    <td className="p-3 text-center text-xs text-gray-400">10 cycles, 85%RH</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 text-yellow-400 font-medium">LETID</td>
                    <td className="p-3 text-center text-xs text-gray-400">PVEL / IEC 61215</td>
                    <td className="p-3 text-center font-mono text-xs">{selectedModule.testLimits.letid.Voc.toFixed(1)}V</td>
                    <td className="p-3 text-center font-mono text-xs">{selectedModule.testLimits.letid.Iinject.toFixed(2)}A (1xIsc)</td>
                    <td className="p-3 text-center text-xs text-gray-400">{selectedModule.testLimits.letid.cellTemp}&deg;C cell temp</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 text-red-400 font-medium">PID</td>
                    <td className="p-3 text-center text-xs text-gray-400">IEC TS 62804-1:2025</td>
                    <td className="p-3 text-center font-mono text-xs">&plusmn;{selectedModule.testLimits.pid.Vbias}V</td>
                    <td className="p-3 text-center font-mono text-xs">{selectedModule.testLimits.pid.ImaxLeak}mA max leak</td>
                    <td className="p-3 text-center text-xs text-gray-400">{selectedModule.testLimits.pid.duration}hr duration</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400 uppercase tracking-widest">PV Cell Technologies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TECH_CARDS.map((tc) => (
              <div
                key={tc.tech}
                className={`p-3 rounded-lg border transition-colors ${
                  selectedModule?.technology === tc.tech
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-blue-300">
                    {tc.icon}
                  </span>
                  <span className="text-sm font-medium">{tc.tech}</span>
                </div>
                <p className="text-xs text-gray-400">{tc.desc}</p>
                <p className="text-xs text-gray-500 mt-1">{tc.type}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-400 uppercase tracking-widest">Applicable Standards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {standards.map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">{'\u2713'}</span> {s}
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
                <span className="text-blue-400">{'\u2192'}</span> {p}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
