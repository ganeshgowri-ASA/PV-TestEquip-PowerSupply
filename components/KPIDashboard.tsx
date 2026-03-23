'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModuleSelector from '@/components/ModuleSelector';
import type { PVModule } from '@/data/moduleDatabase';

const TECH_STANDARDS: Record<string, string[]> = {
  PERC: ['IEC 61215:2021 (TC/HF/LETID)', 'IEC TS 62804-1:2025 (PID)'],
  TOPCon: ['IEC 61215:2021 (TC/HF/LETID)', 'IEC TS 62804-1:2025 (PID)'],
  HJT: ['IEC 61215:2021 (TC/HF)', 'PVEL LETID Sensitivity Test Protocol', 'IEC TS 62804-1:2025 (PID)'],
  HBC: ['IEC 61215:2021 (TC/HF)', 'PVEL LETID Sensitivity Test Protocol', 'IEC TS 62804-1:2025 (PID)'],
  Bifacial: ['IEC 61215:2021 (TC/HF/LETID)', 'IEC TS 62804-1:2025 (PID)', 'IEC TS 60904-1-2 Bifacial Measurement'],
  Monofacial: ['IEC 61215:2021 (TC/HF/LETID)', 'IEC TS 62804-1:2025 (PID)'],
  Tandem: ['IEC 61215:2021 (TC/HF)', 'IEC TS 62804-1:2025 (PID)', 'Tandem-specific aging protocols'],
  CIGS: ['IEC 61646:2008', 'IEC TS 62804-1:2025 (PID)'],
  CdTe: ['IEC 61646:2008', 'IEC TS 62804-1:2025 (PID)'],
  'n-type': ['IEC 61215:2021 (TC/HF/LETID)', 'IEC TS 62804-1:2025 (PID)'],
  'p-type': ['IEC 61215:2021 (TC/HF/LETID)', 'IEC TS 62804-1:2025 (PID)', 'LID/LETID enhanced protocols'],
};

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

const TECH_COLORS: Record<string, string> = {
  PERC: 'bg-blue-900/50 border-blue-700 text-blue-300',
  TOPCon: 'bg-emerald-900/50 border-emerald-700 text-emerald-300',
  HJT: 'bg-purple-900/50 border-purple-700 text-purple-300',
  HBC: 'bg-orange-900/50 border-orange-700 text-orange-300',
  Bifacial: 'bg-cyan-900/50 border-cyan-700 text-cyan-300',
  Monofacial: 'bg-gray-800/50 border-gray-600 text-gray-300',
  Tandem: 'bg-pink-900/50 border-pink-700 text-pink-300',
  CIGS: 'bg-lime-900/50 border-lime-700 text-lime-300',
  CdTe: 'bg-amber-900/50 border-amber-700 text-amber-300',
  'n-type': 'bg-indigo-900/50 border-indigo-700 text-indigo-300',
  'p-type': 'bg-rose-900/50 border-rose-700 text-rose-300',
};

export default function KPIDashboard() {
  const [selectedModule, setSelectedModule] = useState<PVModule | null>(null);

  const moduleSpecs = selectedModule
    ? [
        { label: 'Technology', value: selectedModule.technology },
        { label: 'Voc', value: `${selectedModule.Voc}V` },
        { label: 'Isc', value: `${selectedModule.Isc}A` },
        { label: 'Pmax', value: `${selectedModule.Pmax}W` },
        { label: 'Efficiency', value: `${selectedModule.efficiency}%` },
        { label: 'Wafer', value: selectedModule.wafer },
      ]
    : [
        { label: 'Technology', value: 'Select Module' },
        { label: 'Voc', value: '--' },
        { label: 'Isc', value: '--' },
        { label: 'Pmax', value: '--' },
        { label: 'Channels/Rack', value: '10' },
        { label: 'Standard', value: 'IEC 61215:2021' },
      ];

  const applicableStandards = selectedModule
    ? TECH_STANDARDS[selectedModule.technology] || TECH_STANDARDS['PERC']
    : ['IEC 61215:2021 \u2014 TC / HF / LETID', 'IEC TS 62804-1:2025 \u2014 PID', 'PVEL LETID Sensitivity Test Protocol'];

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
          <CardTitle className="text-base">
            {selectedModule
              ? `Target Module \u2014 ${selectedModule.manufacturer} ${selectedModule.model}`
              : 'Target Module \u2014 Select a module above'}
          </CardTitle>
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

      {/* Technology Cards */}
      <div>
        <h3 className="text-sm text-gray-400 uppercase tracking-widest mb-3">Technology Types</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Object.entries(TECH_COLORS).map(([tech, colorClass]) => (
            <div
              key={tech}
              className={`p-3 rounded-lg border text-center text-sm font-medium cursor-default ${colorClass} ${
                selectedModule?.technology === tech ? 'ring-2 ring-white' : ''
              }`}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>

      {/* Test Matrix Table */}
      {selectedModule && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-400 uppercase tracking-widest">
              Target Test Matrix \u2014 {selectedModule.technology}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase">
                    <th className="text-left p-2">Test Type</th>
                    <th className="text-left p-2">Standard</th>
                    <th className="text-right p-2">Voltage Limit</th>
                    <th className="text-right p-2">Current Limit</th>
                    <th className="text-right p-2">Duration/Cycles</th>
                    <th className="text-left p-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="p-2 text-blue-400 font-medium">TC (Thermal Cycling)</td>
                    <td className="p-2 text-gray-300">IEC 61215:2021</td>
                    <td className="p-2 text-right font-mono">{selectedModule.testLimits.tc.Vmax.toFixed(1)}V</td>
                    <td className="p-2 text-right font-mono">{selectedModule.testLimits.tc.Isc_TC.toFixed(2)}A</td>
                    <td className="p-2 text-right font-mono">200 cycles</td>
                    <td className="p-2 text-xs text-gray-400">-40 to 85 deg C</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-2 text-cyan-400 font-medium">HF (Humidity Freeze)</td>
                    <td className="p-2 text-gray-300">IEC 61215:2021</td>
                    <td className="p-2 text-right font-mono">{selectedModule.testLimits.hf.Vmax.toFixed(1)}V</td>
                    <td className="p-2 text-right font-mono">{selectedModule.testLimits.hf.Isc_HF.toFixed(2)}A</td>
                    <td className="p-2 text-right font-mono">10 cycles</td>
                    <td className="p-2 text-xs text-gray-400">85%RH, {selectedModule.testLimits.hf.frequency}Hz</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-2 text-yellow-400 font-medium">LETID</td>
                    <td className="p-2 text-gray-300">
                      {selectedModule.technology === 'HJT' || selectedModule.technology === 'HBC' ? 'PVEL Protocol' : 'IEC 61215:2021'}
                    </td>
                    <td className="p-2 text-right font-mono">{selectedModule.testLimits.letid.Voc.toFixed(1)}V</td>
                    <td className="p-2 text-right font-mono">{selectedModule.testLimits.letid.Iinject.toFixed(2)}A (1xIsc)</td>
                    <td className="p-2 text-right font-mono">162 hr</td>
                    <td className="p-2 text-xs text-gray-400">{selectedModule.testLimits.letid.cellTemp} deg C cell</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-2 text-red-400 font-medium">PID</td>
                    <td className="p-2 text-gray-300">IEC TS 62804-1:2025</td>
                    <td className="p-2 text-right font-mono">{'\u00B1'}{selectedModule.testLimits.pid.Vbias}V</td>
                    <td className="p-2 text-right font-mono">{selectedModule.testLimits.pid.Imax_leak}mA max leak</td>
                    <td className="p-2 text-right font-mono">{selectedModule.testLimits.pid.duration} hr</td>
                    <td className="p-2 text-xs text-gray-400">85 deg C / 85%RH</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Standards & Design Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-400 uppercase tracking-widest">Applicable Standards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {applicableStandards.map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">&#10003;</span> {s}
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-green-400">&#10003;</span> Modbus RTU/TCP \u2014 All Power Supplies
            </div>
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
