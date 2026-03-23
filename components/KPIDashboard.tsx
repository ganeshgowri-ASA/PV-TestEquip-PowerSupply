'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const KPI_CARDS = [
  {
    title: 'TC/HF Power Supply',
    spec: '60V / 30A Bidirectional',
    status: 'Active',
    variant: 'success' as const,
    details: ['Regenerative Mode — SiC Full-Bridge', 'IEC 61215:2021 MQT 11/12', '10 Channels — 4-Wire Kelvin', 'Efficiency >95%'],
  },
  {
    title: 'LETID Power Supply',
    spec: '60V / 2A Precision',
    status: 'Active',
    variant: 'success' as const,
    details: ['Linear Regulation — Low Noise <2mV', 'IEC 61215:2021 MQT 19 + PVEL', '10 Channels — ±0.05% Accuracy', 'Current Fraction 0.5× Isc'],
  },
  {
    title: 'PID Power Supply',
    spec: '±4000V DC / nA–mA',
    status: 'Active',
    variant: 'success' as const,
    details: ['Safety Interlocks — 5mA Trip', 'IEC TS 62804-1:2025', 'Polarity Switching via Relays', 'Shielded HV Cabling — 6kV Isolation'],
  },
];

const MODULE_SPECS = [
  { label: 'Technology', value: 'HJT Bifacial' },
  { label: 'Voc', value: '60V' },
  { label: 'Isc', value: '27A' },
  { label: 'Pmax', value: '1100W' },
  { label: 'Bifaciality', value: '0.85' },
  { label: 'Channels/Rack', value: '10' },
];

const SYSTEM_KPIs = [
  { label: 'Total BOM Components', value: '36', unit: 'items' },
  { label: 'Estimated BOM Cost', value: '₹1.2L', unit: 'INR' },
  { label: 'Rack Height', value: '42U', unit: '19" EIA' },
  { label: 'Max Power Draw', value: '22kW', unit: '3-Phase' },
  { label: 'Communication', value: 'Modbus', unit: 'RTU/TCP' },
  { label: 'Indian Vendors', value: '100%', unit: 'coverage' },
];

export default function KPIDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">System KPIs</h2>
        <p className="text-gray-400 text-sm">Antaryami Solar Analytics — PV Module Reliability Test Equipment</p>
      </div>

      {/* System KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {SYSTEM_KPIs.map(({ label, value, unit }) => (
          <Card key={label}>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-blue-300 mt-1">{value}</p>
              <p className="text-xs text-gray-500">{unit}</p>
            </CardContent>
          </Card>
        ))}
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
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shrink-0" />
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
          <CardTitle className="text-base">Target Module — HJT Bifacial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {MODULE_SPECS.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="text-lg font-semibold text-blue-300 mt-1">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Standards & Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-400 uppercase tracking-widest">Applicable Standards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              'IEC 61215:2021 — TC (MQT 11) / HF (MQT 12) / LETID (MQT 19)',
              'IEC TS 62804-1:2025 — PID Stress & Recovery',
              'PVEL LETID Sensitivity Test Protocol — 162h at 75°C',
              'Modbus RTU/TCP — All Power Supplies + Controller',
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
              'Safety interlocks on PID (5 mA leakage trip)',
              'Regenerative mode for TC/HF (SiC full-bridge)',
              'Export: PDF, PNG, CSV, Excel, JSON, SVG',
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
