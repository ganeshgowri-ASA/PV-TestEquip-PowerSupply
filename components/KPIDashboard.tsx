'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModuleSelector from '@/components/ModuleSelector';
import { type PVModule, ALL_TECHNOLOGIES, getStandardsForTechnology } from '@/data/moduleDatabase';

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

const TECH_CARDS: { tech: string; color: string; desc: string }[] = [
  { tech: 'PERC', color: 'text-blue-400', desc: 'Passivated Emitter Rear Contact, p-type mainstream' },
  { tech: 'TOPCon', color: 'text-green-400', desc: 'Tunnel Oxide Passivated Contact, n-type high efficiency' },
  { tech: 'HJT', color: 'text-yellow-400', desc: 'Heterojunction, low-temp process, high bifaciality' },
  { tech: 'HBC', color: 'text-purple-400', desc: 'Heterojunction Back Contact, highest efficiency' },
  { tech: 'Bifacial', color: 'text-cyan-400', desc: 'Dual-sided light absorption, any cell type' },
  { tech: 'Monofacial', color: 'text-gray-400', desc: 'Standard single-sided module' },
  { tech: 'Tandem', color: 'text-orange-400', desc: 'Perovskite-silicon tandem, next-gen >30%' },
  { tech: 'CIGS', color: 'text-emerald-400', desc: 'Copper Indium Gallium Selenide thin film' },
  { tech: 'CdTe', color: 'text-red-400', desc: 'Cadmium Telluride thin film (First Solar)' },
  { tech: 'n-type', color: 'text-sky-400', desc: 'n-type silicon, various architectures' },
  { tech: 'p-type', color: 'text-rose-400', desc: 'p-type silicon, traditional architecture' },
];

export default function KPIDashboard() {
  const [selectedModule, setSelectedModule] = useState<PVModule | null>(null);

  const moduleSpecs = selectedModule
    ? [
        { label: 'Technology', value: selectedModule.technology },
        { label: 'Voc', value: `${selectedModule.Voc}V` },
        { label: 'Isc', value: `${selectedModule.Isc}A` },
        { label: 'Pmax', value: `${selectedModule.Pmax}W` },
        { label: 'Vmp', value: `${selectedModule.Vmp}V` },
        { label: 'Imp', value: `${selectedModule.Imp}A` },
        { label: 'Efficiency', value: `${selectedModule.efficiency}%` },
        { label: 'Channels/Rack', value: '10' },
      ]
    : [
        { label: 'Technology', value: 'HJT Bifacial' },
        { label: 'Voc', value: '60V' },
        { label: 'Isc', value: '27A' },
        { label: 'Pmax', value: '1100W' },
        { label: 'Channels/Rack', value: '10' },
        { label: 'Standard', value: 'IEC 61215:2021' },
      ];

  const standards = selectedModule
    ? getStandardsForTechnology(selectedModule.technology)
    : ['IEC 61215:2021 \u2014 TC / HF / LETID', 'IEC TS 62804-1:2025 \u2014 PID', 'PVEL LETID Sensitivity Test Protocol', 'Modbus RTU/TCP \u2014 All Power Supplies'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">System KPIs</h2>
        <p className="text-gray-400 text-sm">Antaryami Solar Analytics \u2014 Power Supply Design Status</p>
      </div>

      {/* Module Selector */}
      <ModuleSelector selectedModule={selectedModule} onSelectModule={setSelectedModule} />

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

      {/* Module Specs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">
              {selectedModule
                ? `${selectedModule.manufacturer} ${selectedModule.model}`
                : 'Target Module \u2014 HJT Bifacial'}
            </CardTitle>
            {selectedModule && (
              <Badge variant="default">{selectedModule.technology}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {moduleSpecs.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="text-lg font-semibold text-blue-300 mt-1">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Matrix Table */}
      {selectedModule && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Target Test Matrix \u2014 {selectedModule.model}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="text-left p-2">Test Type</th>
                    <th className="text-left p-2">Standard</th>
                    <th className="text-right p-2">Vmax / Vbias</th>
                    <th className="text-right p-2">Isc / Iinject / Ileak</th>
                    <th className="text-right p-2">Duration / Cycles</th>
                    <th className="text-right p-2">Temp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="p-2 text-blue-400 font-medium">TC (Thermal Cycling)</td>
                    <td className="p-2 text-xs text-gray-400">IEC 61215:2021</td>
                    <td className="p-2 text-right font-mono text-xs">{selectedModule.testLimits.tc.Vmax.toFixed(1)}V</td>
                    <td className="p-2 text-right font-mono text-xs">{selectedModule.testLimits.tc.Isc_TC}A</td>
                    <td className="p-2 text-right font-mono text-xs">200 cycles</td>
                    <td className="p-2 text-right font-mono text-xs">-40/+85{'\u00B0'}C</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-2 text-cyan-400 font-medium">HF (Humidity Freeze)</td>
                    <td className="p-2 text-xs text-gray-400">IEC 61215:2021</td>
                    <td className="p-2 text-right font-mono text-xs">{selectedModule.testLimits.hf.Vmax.toFixed(1)}V</td>
                    <td className="p-2 text-right font-mono text-xs">{selectedModule.testLimits.hf.Isc_HF}A</td>
                    <td className="p-2 text-right font-mono text-xs">10 cycles</td>
                    <td className="p-2 text-right font-mono text-xs">-40/+85{'\u00B0'}C 85%RH</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-2 text-yellow-400 font-medium">LETID</td>
                    <td className="p-2 text-xs text-gray-400">IEC 61215 / PVEL</td>
                    <td className="p-2 text-right font-mono text-xs">{selectedModule.testLimits.letid.Voc}V</td>
                    <td className="p-2 text-right font-mono text-xs">{selectedModule.testLimits.letid.Iinject}A (1xIsc)</td>
                    <td className="p-2 text-right font-mono text-xs">162 hr</td>
                    <td className="p-2 text-right font-mono text-xs">{selectedModule.testLimits.letid.cellTemp}{'\u00B0'}C</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-2 text-red-400 font-medium">PID</td>
                    <td className="p-2 text-xs text-gray-400">IEC TS 62804-1:2025</td>
                    <td className="p-2 text-right font-mono text-xs">{'\u00B1'}{selectedModule.testLimits.pid.Vbias}V</td>
                    <td className="p-2 text-right font-mono text-xs">{selectedModule.testLimits.pid.Imax_leak}mA max leak</td>
                    <td className="p-2 text-right font-mono text-xs">{selectedModule.testLimits.pid.duration} hr</td>
                    <td className="p-2 text-right font-mono text-xs">85{'\u00B0'}C 85%RH</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technology Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">PV Cell Technologies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {TECH_CARDS.map(({ tech, color, desc }) => (
              <div key={tech} className={`p-3 rounded-lg border border-gray-700 bg-gray-800/40 ${selectedModule?.technology === tech ? 'border-blue-500 bg-blue-900/20' : ''}`}>
                <p className={`text-sm font-semibold ${color}`}>{tech}</p>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Standards & Design Principles */}
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
