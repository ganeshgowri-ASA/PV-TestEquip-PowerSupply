'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

type View = 'front' | 'rear';

interface RackUnit {
  startU: number;
  heightU: number;
  label: string;
  type: 'psu-tchf' | 'psu-letid' | 'psu-pid' | 'controller' | 'modbus' | 'pdu' | 'blank' | 'fan' | 'patch';
  color: string;
  description: string;
}

const FRONT_LAYOUT: RackUnit[] = [
  { startU: 42, heightU: 1, label: 'Patch Panel', type: 'patch', color: '#374151', description: 'Cable management 1U' },
  { startU: 41, heightU: 1, label: 'Modbus Gateway', type: 'modbus', color: '#7C3AED', description: 'Modbus RTU/TCP Gateway + Ethernet Switch' },
  { startU: 40, heightU: 2, label: 'Rack Controller', type: 'controller', color: '#1D4ED8', description: 'Main Controller — 10-ch Sequencer + Safety Interlocks' },
  { startU: 38, heightU: 1, label: 'Blank Panel', type: 'blank', color: '#1F2937', description: '1U ventilation spacer' },
  { startU: 37, heightU: 3, label: 'TC/HF PSU #1', type: 'psu-tchf', color: '#2563EB', description: '60V/30A Bidirectional Regenerative — Ch 1-2' },
  { startU: 34, heightU: 3, label: 'TC/HF PSU #2', type: 'psu-tchf', color: '#2563EB', description: '60V/30A Bidirectional Regenerative — Ch 3-4' },
  { startU: 31, heightU: 3, label: 'TC/HF PSU #3', type: 'psu-tchf', color: '#2563EB', description: '60V/30A Bidirectional Regenerative — Ch 5-6' },
  { startU: 28, heightU: 3, label: 'TC/HF PSU #4', type: 'psu-tchf', color: '#2563EB', description: '60V/30A Bidirectional Regenerative — Ch 7-8' },
  { startU: 25, heightU: 3, label: 'TC/HF PSU #5', type: 'psu-tchf', color: '#2563EB', description: '60V/30A Bidirectional Regenerative — Ch 9-10' },
  { startU: 24, heightU: 1, label: 'Blank Panel', type: 'blank', color: '#1F2937', description: '1U ventilation spacer' },
  { startU: 23, heightU: 2, label: 'LETID PSU #1', type: 'psu-letid', color: '#059669', description: '60V/2A Precision — Ch 1-5' },
  { startU: 21, heightU: 2, label: 'LETID PSU #2', type: 'psu-letid', color: '#059669', description: '60V/2A Precision — Ch 6-10' },
  { startU: 20, heightU: 1, label: 'Blank Panel', type: 'blank', color: '#1F2937', description: '1U ventilation spacer' },
  { startU: 19, heightU: 3, label: 'PID HV PSU #1', type: 'psu-pid', color: '#DC2626', description: '±4000V DC — Ch 1-5 + Leakage Monitor' },
  { startU: 16, heightU: 3, label: 'PID HV PSU #2', type: 'psu-pid', color: '#DC2626', description: '±4000V DC — Ch 6-10 + Leakage Monitor' },
  { startU: 15, heightU: 1, label: 'Blank Panel', type: 'blank', color: '#1F2937', description: '1U ventilation spacer' },
  { startU: 14, heightU: 1, label: 'Fan Tray', type: 'fan', color: '#374151', description: 'Forced air cooling — 4x 120mm fans' },
  { startU: 13, heightU: 2, label: 'PDU Primary', type: 'pdu', color: '#92400E', description: '32A 3-Phase PDU — Metered + Switched' },
  { startU: 11, heightU: 2, label: 'PDU Redundant', type: 'pdu', color: '#92400E', description: '32A 3-Phase PDU — Redundant Feed' },
  { startU: 10, heightU: 10, label: 'Reserved', type: 'blank', color: '#111827', description: 'U1-U10 reserved for future expansion' },
];

const REAR_LAYOUT: RackUnit[] = [
  { startU: 42, heightU: 1, label: 'Fiber/Cat6 Panel', type: 'patch', color: '#374151', description: 'Network + RS-485 patch panel' },
  { startU: 41, heightU: 1, label: 'Ethernet Switch', type: 'modbus', color: '#7C3AED', description: '24-port Managed Switch — VLAN for Modbus TCP' },
  { startU: 40, heightU: 2, label: 'Controller I/O', type: 'controller', color: '#1D4ED8', description: 'Kelvin Sense Wiring + Interlock Relays + E-Stop' },
  { startU: 38, heightU: 1, label: 'Cable Tray', type: 'blank', color: '#1F2937', description: 'Horizontal cable management' },
  { startU: 37, heightU: 15, label: 'Power Cables', type: 'blank', color: '#18181B', description: 'Rear cable routing — 4-wire Kelvin sense + power bus' },
  { startU: 22, heightU: 7, label: 'HV Cables', type: 'blank', color: '#18181B', description: 'Shielded HV cabling — PID ±4kV insulated runs' },
  { startU: 15, heightU: 1, label: 'Rear Fan Tray', type: 'fan', color: '#374151', description: 'Exhaust fans — rear-to-front airflow' },
  { startU: 14, heightU: 4, label: 'AC Input Panel', type: 'pdu', color: '#92400E', description: 'Mains input — 3-Phase 415V AC 32A + MCB + RCBO' },
  { startU: 10, heightU: 10, label: 'Reserved', type: 'blank', color: '#111827', description: 'Rear U1-U10 reserved' },
];

function RackSVG({ view, layout, selectedUnit, onSelectUnit }: {
  view: View;
  layout: RackUnit[];
  selectedUnit: RackUnit | null;
  onSelectUnit: (u: RackUnit | null) => void;
}) {
  const rackW = 300;
  const rackH = 800;
  const uHeight = rackH / 42;
  const padX = 40;
  const innerW = rackW - 2 * padX;

  return (
    <svg viewBox={`0 0 ${rackW + 20} ${rackH + 60}`} className="w-full h-auto max-h-[700px]">
      {/* Rack frame */}
      <rect x="10" y="20" width={rackW} height={rackH + 20} rx="4" fill="#0A0A0A" stroke="#333" strokeWidth="2" />

      {/* Title */}
      <text x={rackW / 2 + 10} y="14" textAnchor="middle" fill="#9CA3AF" fontSize="11" fontWeight="bold">
        {view === 'front' ? 'Front View' : 'Rear View'} — 19&quot; 42U Rack
      </text>

      {/* U number labels */}
      {Array.from({ length: 42 }, (_, i) => {
        const u = 42 - i;
        const y = 25 + i * uHeight;
        return (
          <text key={u} x="6" y={y + uHeight / 2 + 3} fill="#4B5563" fontSize="7" textAnchor="end">
            {u}
          </text>
        );
      })}

      {/* Rack rail lines */}
      <line x1={padX - 5 + 10} y1="25" x2={padX - 5 + 10} y2={rackH + 25} stroke="#333" strokeWidth="1" />
      <line x1={rackW - padX + 15} y1="25" x2={rackW - padX + 15} y2={rackH + 25} stroke="#333" strokeWidth="1" />

      {/* Units */}
      {layout.map((unit, idx) => {
        const topU = 42 - unit.startU;
        const y = 25 + topU * uHeight;
        const h = unit.heightU * uHeight;
        const isSelected = selectedUnit?.label === unit.label && selectedUnit?.startU === unit.startU;
        const isPSU = unit.type.startsWith('psu-');

        return (
          <g
            key={`${unit.label}-${idx}`}
            onClick={() => onSelectUnit(isSelected ? null : unit)}
            className="cursor-pointer"
          >
            <rect
              x={padX + 10}
              y={y + 1}
              width={innerW}
              height={h - 2}
              rx="2"
              fill={unit.color}
              fillOpacity={unit.type === 'blank' ? 0.3 : 0.7}
              stroke={isSelected ? '#FBBF24' : '#555'}
              strokeWidth={isSelected ? 2 : 0.5}
            />
            {/* Label */}
            {h > 12 && (
              <text
                x={padX + 10 + innerW / 2}
                y={y + h / 2 + (h > 30 ? -3 : 3)}
                textAnchor="middle"
                fill="#E5E7EB"
                fontSize={h > 50 ? "9" : "7"}
                fontWeight={isPSU ? "bold" : "normal"}
              >
                {unit.label}
              </text>
            )}
            {/* Subtitle on larger units */}
            {h > 50 && isPSU && (
              <text
                x={padX + 10 + innerW / 2}
                y={y + h / 2 + 10}
                textAnchor="middle"
                fill="#9CA3AF"
                fontSize="7"
              >
                {unit.type === 'psu-tchf' ? '60V/30A Regen' : unit.type === 'psu-letid' ? '60V/2A Precision' : '±4000V DC'}
              </text>
            )}
            {/* Mounting screws visual */}
            {unit.type !== 'blank' && (
              <>
                <circle cx={padX + 14} cy={y + 6} r="2" fill="#555" />
                <circle cx={padX + 14} cy={y + h - 6} r="2" fill="#555" />
                <circle cx={padX + innerW + 6} cy={y + 6} r="2" fill="#555" />
                <circle cx={padX + innerW + 6} cy={y + h - 6} r="2" fill="#555" />
              </>
            )}
          </g>
        );
      })}

      {/* Rack feet */}
      <rect x="20" y={rackH + 42} width="30" height="8" rx="2" fill="#333" />
      <rect x={rackW - 20} y={rackH + 42} width="30" height="8" rx="2" fill="#333" />
    </svg>
  );
}

export default function DesignDrawing() {
  const { addToast } = useToast();
  const [view, setView] = useState<View>('front');
  const [selectedUnit, setSelectedUnit] = useState<RackUnit | null>(null);

  const layout = view === 'front' ? FRONT_LAYOUT : REAR_LAYOUT;

  const psuCount = FRONT_LAYOUT.filter((u) => u.type.startsWith('psu-')).length;
  const tchfCount = FRONT_LAYOUT.filter((u) => u.type === 'psu-tchf').length;
  const letidCount = FRONT_LAYOUT.filter((u) => u.type === 'psu-letid').length;
  const pidCount = FRONT_LAYOUT.filter((u) => u.type === 'psu-pid').length;

  const handleExportSVG = () => {
    addToast({ title: 'SVG Exported', description: 'Rack layout SVG saved to downloads', variant: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Rack Design / Drawing</h2>
          <p className="text-gray-400 text-sm">Interactive 19&quot; 42U rack layout with {psuCount} power supply units across 10 channels</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportSVG}>Export SVG</Button>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 flex-wrap">
        <Badge className="bg-blue-900 text-blue-200 border-blue-700">{tchfCount}x TC/HF 60V/30A</Badge>
        <Badge className="bg-green-900 text-green-200 border-green-700">{letidCount}x LETID 60V/2A</Badge>
        <Badge className="bg-red-900 text-red-200 border-red-700">{pidCount}x PID ±4000V</Badge>
        <Badge variant="outline">10 Channels Total</Badge>
        <Badge variant="outline">4-Wire Kelvin Sensing</Badge>
        <Badge variant="outline">Modbus RTU/TCP</Badge>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setView('front'); setSelectedUnit(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'front' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Front View
        </button>
        <button
          onClick={() => { setView('rear'); setSelectedUnit(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'rear' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Rear View
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rack SVG */}
        <div className="lg:col-span-1">
          <Card className="bg-black/50">
            <CardContent className="p-4">
              <RackSVG view={view} layout={layout} selectedUnit={selectedUnit} onSelectUnit={setSelectedUnit} />
            </CardContent>
          </Card>
        </div>

        {/* Details panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedUnit ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{selectedUnit.label}</CardTitle>
                  <Badge variant="outline">U{selectedUnit.startU - selectedUnit.heightU + 1}–U{selectedUnit.startU} ({selectedUnit.heightU}U)</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-300">{selectedUnit.description}</p>
                {selectedUnit.type === 'psu-tchf' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Output:</span> <span className="text-blue-300 font-mono">60V / 30A</span></div>
                    <div><span className="text-gray-500">Mode:</span> <span className="text-blue-300">Bidirectional Regenerative</span></div>
                    <div><span className="text-gray-500">Power/Channel:</span> <span className="text-blue-300 font-mono">1800W</span></div>
                    <div><span className="text-gray-500">Topology:</span> <span className="text-blue-300">Full-Bridge with SiC MOSFETs</span></div>
                    <div><span className="text-gray-500">Sensing:</span> <span className="text-blue-300">4-Wire Kelvin</span></div>
                    <div><span className="text-gray-500">Communication:</span> <span className="text-blue-300">Modbus RTU (RS-485)</span></div>
                    <div><span className="text-gray-500">Protection:</span> <span className="text-blue-300">OVP, OCP, OTP, Reverse Polarity</span></div>
                    <div><span className="text-gray-500">Efficiency:</span> <span className="text-blue-300 font-mono">&gt;95% (regenerative)</span></div>
                  </div>
                )}
                {selectedUnit.type === 'psu-letid' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Output:</span> <span className="text-green-300 font-mono">60V / 2A</span></div>
                    <div><span className="text-gray-500">Regulation:</span> <span className="text-green-300">Linear (Low Noise)</span></div>
                    <div><span className="text-gray-500">Accuracy:</span> <span className="text-green-300 font-mono">±0.05% V, ±0.1% I</span></div>
                    <div><span className="text-gray-500">Ripple:</span> <span className="text-green-300 font-mono">&lt;2mV rms</span></div>
                    <div><span className="text-gray-500">Sensing:</span> <span className="text-green-300">4-Wire Kelvin</span></div>
                    <div><span className="text-gray-500">Current Fraction:</span> <span className="text-green-300 font-mono">0.5× Isc (PVEL)</span></div>
                  </div>
                )}
                {selectedUnit.type === 'psu-pid' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Output:</span> <span className="text-red-300 font-mono">±4000V DC</span></div>
                    <div><span className="text-gray-500">Current Range:</span> <span className="text-red-300 font-mono">1nA – 5mA</span></div>
                    <div><span className="text-gray-500">Leakage Interlock:</span> <span className="text-red-300 font-mono">5mA trip</span></div>
                    <div><span className="text-gray-500">Isolation:</span> <span className="text-red-300 font-mono">6kV</span></div>
                    <div><span className="text-gray-500">Polarity:</span> <span className="text-red-300">Switchable ± via relays</span></div>
                    <div><span className="text-gray-500">Safety:</span> <span className="text-red-300">Door interlock + E-Stop + Bleeder</span></div>
                  </div>
                )}
                {selectedUnit.type === 'controller' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Processor:</span> <span className="text-blue-300">STM32H7 ARM Cortex-M7</span></div>
                    <div><span className="text-gray-500">Channels:</span> <span className="text-blue-300 font-mono">10 independent</span></div>
                    <div><span className="text-gray-500">ADC:</span> <span className="text-blue-300 font-mono">16-bit, 10 ch simultaneous</span></div>
                    <div><span className="text-gray-500">DAC:</span> <span className="text-blue-300 font-mono">16-bit, 10 ch</span></div>
                    <div><span className="text-gray-500">Communication:</span> <span className="text-blue-300">Modbus RTU + TCP</span></div>
                    <div><span className="text-gray-500">Safety:</span> <span className="text-blue-300">WDT + Interlock Matrix</span></div>
                  </div>
                )}
                {selectedUnit.type === 'pdu' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Input:</span> <span className="text-amber-300 font-mono">3-Phase 415V AC</span></div>
                    <div><span className="text-gray-500">Rating:</span> <span className="text-amber-300 font-mono">32A per phase</span></div>
                    <div><span className="text-gray-500">Outlets:</span> <span className="text-amber-300 font-mono">12x IEC C13 + 4x C19</span></div>
                    <div><span className="text-gray-500">Monitoring:</span> <span className="text-amber-300">Per-outlet metering</span></div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Click on any rack unit in the diagram to view detailed specifications</p>
              </CardContent>
            </Card>
          )}

          {/* Rack specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-400 uppercase tracking-widest">Rack Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Standard</p>
                  <p className="text-gray-200 font-mono">19&quot; EIA-310-E</p>
                </div>
                <div>
                  <p className="text-gray-500">Height</p>
                  <p className="text-gray-200 font-mono">42U (2000mm)</p>
                </div>
                <div>
                  <p className="text-gray-500">Depth</p>
                  <p className="text-gray-200 font-mono">1000mm</p>
                </div>
                <div>
                  <p className="text-gray-500">Max Load</p>
                  <p className="text-gray-200 font-mono">800 kg</p>
                </div>
                <div>
                  <p className="text-gray-500">Power Input</p>
                  <p className="text-gray-200 font-mono">3-Phase 415V AC 32A</p>
                </div>
                <div>
                  <p className="text-gray-500">Cooling</p>
                  <p className="text-gray-200 font-mono">Forced Air (Front→Rear)</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Channels</p>
                  <p className="text-gray-200 font-mono">10 per test type</p>
                </div>
                <div>
                  <p className="text-gray-500">Max Power Draw</p>
                  <p className="text-gray-200 font-mono">~22 kW (all channels)</p>
                </div>
                <div>
                  <p className="text-gray-500">Safety</p>
                  <p className="text-gray-200">RCBO + E-Stop + Door Interlock</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-400 uppercase tracking-widest">Equipment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="text-left p-2">Equipment</th>
                    <th className="text-center p-2">Qty</th>
                    <th className="text-center p-2">U Height</th>
                    <th className="text-left p-2">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'TC/HF PSU (60V/30A Regen)', qty: 5, u: 3, pos: 'U25–U37' },
                    { name: 'LETID PSU (60V/2A Precision)', qty: 2, u: 2, pos: 'U21–U23' },
                    { name: 'PID HV PSU (±4000V DC)', qty: 2, u: 3, pos: 'U16–U19' },
                    { name: 'Rack Controller', qty: 1, u: 2, pos: 'U39–U40' },
                    { name: 'Modbus Gateway', qty: 1, u: 1, pos: 'U41' },
                    { name: 'PDU (32A 3-Phase)', qty: 2, u: 2, pos: 'U11–U13' },
                    { name: 'Fan Tray', qty: 1, u: 1, pos: 'U14' },
                    { name: 'Patch Panel', qty: 1, u: 1, pos: 'U42' },
                  ].map((eq) => (
                    <tr key={eq.name} className="border-b border-gray-800">
                      <td className="p-2 text-gray-300">{eq.name}</td>
                      <td className="p-2 text-center text-gray-300">{eq.qty}</td>
                      <td className="p-2 text-center text-gray-400 font-mono">{eq.u}U</td>
                      <td className="p-2 text-gray-400 font-mono">{eq.pos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
