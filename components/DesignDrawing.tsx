'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/Toast';

interface UnitSpec {
  slot: number;
  type: 'TC/HF' | 'LETID' | 'PID' | 'DAQ' | 'PLC' | 'Empty';
  label: string;
  voltage: string;
  current: string;
  power: string;
  model: string;
}

const RACK_UNITS: UnitSpec[] = [
  { slot: 1, type: 'PLC', label: 'Siemens S7-1200 PLC', voltage: '24V DC', current: '1A', power: '24W', model: '6ES7214-1AG40-0XB0' },
  { slot: 2, type: 'DAQ', label: 'Keysight DAQ970A', voltage: '110-240V AC', current: '0.5A', power: '50W', model: 'DAQ970A' },
  { slot: 3, type: 'TC/HF', label: 'TC/HF PS Ch1-2', voltage: '60V', current: '30A', power: '1800W', model: 'Itech IT6500C' },
  { slot: 4, type: 'TC/HF', label: 'TC/HF PS Ch3-4', voltage: '60V', current: '30A', power: '1800W', model: 'Itech IT6500C' },
  { slot: 5, type: 'TC/HF', label: 'TC/HF PS Ch5-6', voltage: '60V', current: '30A', power: '1800W', model: 'Itech IT6500C' },
  { slot: 6, type: 'TC/HF', label: 'TC/HF PS Ch7-8', voltage: '60V', current: '30A', power: '1800W', model: 'Itech IT6500C' },
  { slot: 7, type: 'TC/HF', label: 'TC/HF PS Ch9-10', voltage: '60V', current: '30A', power: '1800W', model: 'Itech IT6500C' },
  { slot: 8, type: 'LETID', label: 'LETID PS Ch1-5', voltage: '60V', current: '2A', power: '120W', model: 'Keysight E36312A' },
  { slot: 9, type: 'LETID', label: 'LETID PS Ch6-10', voltage: '60V', current: '2A', power: '120W', model: 'Keysight E36312A' },
  { slot: 10, type: 'PID', label: 'PID HV Supply', voltage: '\u00B14000V', current: 'nA-mA', power: '200W', model: 'Glassman EH' },
];

const TYPE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  'TC/HF': { fill: '#1e3a5f', stroke: '#3b82f6', text: 'text-blue-400' },
  'LETID': { fill: '#3b3a1e', stroke: '#eab308', text: 'text-yellow-400' },
  'PID': { fill: '#5f1e1e', stroke: '#ef4444', text: 'text-red-400' },
  'DAQ': { fill: '#1e5f3a', stroke: '#22c55e', text: 'text-green-400' },
  'PLC': { fill: '#3a1e5f', stroke: '#a855f7', text: 'text-purple-400' },
  'Empty': { fill: '#1a1a2e', stroke: '#374151', text: 'text-gray-500' },
};

// Cable routing data for rear view
const CABLE_ROUTES = [
  { from: 1, to: 3, label: 'Modbus RS485', color: '#a855f7' },
  { from: 1, to: 8, label: 'Modbus RS485', color: '#a855f7' },
  { from: 1, to: 10, label: 'Modbus RS485', color: '#a855f7' },
  { from: 2, to: 3, label: 'Sense Lines', color: '#22c55e' },
  { from: 2, to: 8, label: 'Sense Lines', color: '#22c55e' },
  { from: 2, to: 10, label: 'Sense Lines', color: '#22c55e' },
];

export default function DesignDrawing() {
  const { toast } = useToast();
  const [rackCount, setRackCount] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<UnitSpec | null>(null);
  const [view, setView] = useState<'front' | 'rear' | 'cable'>('front');

  const totalUnits = rackCount * 10;
  const tcCount = rackCount * 5;
  const letidCount = rackCount * 2;
  const pidCount = rackCount * 1;

  const handleExportPDF = () => {
    toast('info', 'PDF export: Rack drawing will be generated via FreeCAD Python scripts (see /cad folder)');
  };

  const handleExportDXF = () => {
    toast('info', 'DXF export: CAD drawing will be generated via FreeCAD Python scripts (see /cad folder)');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Design & Drawing</h2>
          <p className="text-gray-400 text-sm">19&quot; Rack Layout - 42U Standard - Power Supply Arrangement</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Racks:</label>
            <select
              value={rackCount}
              onChange={(e) => setRackCount(Number(e.target.value))}
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1">
            {(['front', 'rear', 'cable'] as const).map(v => (
              <button key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded text-xs font-medium ${view === v ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >{v === 'cable' ? 'Cable Routing' : v.charAt(0).toUpperCase() + v.slice(1)}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExportPDF}>Export PDF</Button>
            <Button size="sm" variant="outline" onClick={handleExportDXF}>Export DXF</Button>
          </div>
        </div>
      </div>

      {/* Power Supply Count Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{tcCount}</p>
            <p className="text-xs text-gray-400">TC/HF Units</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{letidCount}</p>
            <p className="text-xs text-gray-400">LETID Units</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-red-400">{pidCount}</p>
            <p className="text-xs text-gray-400">PID Units</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-green-400">{rackCount}</p>
            <p className="text-xs text-gray-400">DAQ Units</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-white">{totalUnits}</p>
            <p className="text-xs text-gray-400">Total Units</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Rack Layout */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {view === 'front' ? 'Front View' : view === 'rear' ? 'Rear View' : 'Cable Routing Diagram'} - Rack 1 of {rackCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {view === 'cable' ? (
                /* Cable Routing Diagram */
                <svg viewBox="0 0 500 700" className="w-full max-w-lg mx-auto" xmlns="http://www.w3.org/2000/svg">
                  <rect x="30" y="10" width="440" height="680" rx="4" fill="#0a0a1a" stroke="#374151" strokeWidth="2" />
                  {/* Simplified slot labels */}
                  {RACK_UNITS.map((unit, i) => {
                    const y = 20 + i * 65;
                    const colors = TYPE_COLORS[unit.type];
                    return (
                      <g key={unit.slot}>
                        <rect x="50" y={y} width="160" height="58" rx="3" fill={colors.fill} stroke={colors.stroke} strokeWidth="1" opacity="0.7" />
                        <text x="60" y={y + 22} fill="#e5e7eb" fontSize="9" fontWeight="600">{unit.label}</text>
                        <text x="60" y={y + 38} fill="#9ca3af" fontSize="7">U{unit.slot}</text>
                      </g>
                    );
                  })}
                  {/* Cable routing lines */}
                  {CABLE_ROUTES.map((route, i) => {
                    const y1 = 20 + (route.from - 1) * 65 + 29;
                    const y2 = 20 + (route.to - 1) * 65 + 29;
                    const xMid = 260 + i * 25;
                    return (
                      <g key={i}>
                        <path d={`M 210 ${y1} H ${xMid} V ${y2} H 210`}
                          fill="none" stroke={route.color} strokeWidth="1.5" strokeDasharray="4" opacity="0.7" />
                        <text x={xMid + 3} y={(y1 + y2) / 2} fill={route.color} fontSize="6" transform={`rotate(-90, ${xMid + 3}, ${(y1 + y2) / 2})`}>
                          {route.label}
                        </text>
                      </g>
                    );
                  })}
                  {/* Cable tray */}
                  <rect x="240" y="10" width="3" height="680" fill="#374151" opacity="0.5" />
                  <text x="250" y="700" fill="#6b7280" fontSize="9">Cable Tray (vertical)</text>
                  {/* Legend */}
                  <g transform="translate(350, 20)">
                    <text x="0" y="0" fill="#9ca3af" fontSize="8" fontWeight="600">Cable Legend</text>
                    <line x1="0" y1="12" x2="30" y2="12" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4" />
                    <text x="35" y="15" fill="#a855f7" fontSize="7">Modbus RS485</text>
                    <line x1="0" y1="27" x2="30" y2="27" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4" />
                    <text x="35" y="30" fill="#22c55e" fontSize="7">Sense Lines</text>
                    <line x1="0" y1="42" x2="30" y2="42" stroke="#3b82f6" strokeWidth="1.5" />
                    <text x="35" y="45" fill="#3b82f6" fontSize="7">Power</text>
                    <line x1="0" y1="57" x2="30" y2="57" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="35" y="60" fill="#ef4444" fontSize="7">HV (PID)</text>
                  </g>
                </svg>
              ) : (
                /* Front/Rear views */
                <svg viewBox="0 0 500 700" className="w-full max-w-lg mx-auto" xmlns="http://www.w3.org/2000/svg">
                  {/* Rack Frame */}
                  <rect x="30" y="10" width="440" height="680" rx="4" fill="#0a0a1a" stroke="#374151" strokeWidth="2" />
                  {/* Rack Rails */}
                  <rect x="30" y="10" width="15" height="680" fill="#1f2937" stroke="#374151" strokeWidth="1" />
                  <rect x="455" y="10" width="15" height="680" fill="#1f2937" stroke="#374151" strokeWidth="1" />

                  {/* Dimensions */}
                  <text x="250" y="705" textAnchor="middle" fill="#6b7280" fontSize="10">19&quot; (482.6mm) | 42U Rack</text>
                  <line x1="20" y1="10" x2="20" y2="690" stroke="#4b5563" strokeWidth="1" strokeDasharray="4" />
                  <text x="15" y="350" textAnchor="middle" fill="#6b7280" fontSize="9" transform="rotate(-90, 15, 350)">1866mm (42U)</text>

                  {/* Units */}
                  {RACK_UNITS.map((unit, i) => {
                    const y = 20 + i * 65;
                    const colors = TYPE_COLORS[unit.type];
                    const isSelected = selectedUnit?.slot === unit.slot;

                    if (view === 'front') {
                      return (
                        <g key={unit.slot} onClick={() => setSelectedUnit(unit)} className="cursor-pointer">
                          <rect x="50" y={y} width="400" height="58" rx="3"
                            fill={colors.fill} stroke={isSelected ? '#ffffff' : colors.stroke}
                            strokeWidth={isSelected ? 2.5 : 1.5}
                            opacity={isSelected ? 1 : 0.85}
                          />
                          <text x="38" y={y + 34} textAnchor="middle" fill="#6b7280" fontSize="8">U{unit.slot}</text>
                          <text x="65" y={y + 22} fill="#e5e7eb" fontSize="11" fontWeight="600">{unit.label}</text>
                          <text x="65" y={y + 38} fill="#9ca3af" fontSize="9">{unit.model}</text>
                          <circle cx="420" cy={y + 20} r="5" fill="#22c55e" opacity="0.8" />
                          <circle cx="420" cy={y + 38} r="5" fill="#3b82f6" opacity="0.6" />
                          <rect x="300" y={y + 8} width="90" height="42" rx="2" fill="#0d1117" stroke="#374151" strokeWidth="0.5" />
                          <text x="345" y={y + 26} textAnchor="middle" fill={colors.stroke} fontSize="10" fontFamily="monospace">{unit.voltage}</text>
                          <text x="345" y={y + 42} textAnchor="middle" fill={colors.stroke} fontSize="9" fontFamily="monospace">{unit.current}</text>
                          {[0, 1, 2, 3].map((j) => (
                            <rect key={j} x={140 + j * 22} y={y + 10} width="15" height="3" rx="1" fill="#1f2937" />
                          ))}
                        </g>
                      );
                    } else {
                      return (
                        <g key={unit.slot} onClick={() => setSelectedUnit(unit)} className="cursor-pointer">
                          <rect x="50" y={y} width="400" height="58" rx="3"
                            fill={colors.fill} stroke={isSelected ? '#ffffff' : colors.stroke}
                            strokeWidth={isSelected ? 2.5 : 1.5}
                            opacity={isSelected ? 1 : 0.85}
                          />
                          <text x="38" y={y + 34} textAnchor="middle" fill="#6b7280" fontSize="8">U{unit.slot}</text>
                          <text x="65" y={y + 22} fill="#e5e7eb" fontSize="11" fontWeight="600">{unit.label} (Rear)</text>
                          <rect x="300" y={y + 5} width="20" height="20" rx="2" fill="#1a1a2e" stroke="#4b5563" strokeWidth="1" />
                          <text x="310" y={y + 19} textAnchor="middle" fill="#6b7280" fontSize="7">OUT</text>
                          <rect x="330" y={y + 5} width="20" height="20" rx="2" fill="#1a1a2e" stroke="#4b5563" strokeWidth="1" />
                          <text x="340" y={y + 19} textAnchor="middle" fill="#6b7280" fontSize="7">RS485</text>
                          <rect x="360" y={y + 5} width="20" height="20" rx="2" fill="#1a1a2e" stroke="#4b5563" strokeWidth="1" />
                          <text x="370" y={y + 19} textAnchor="middle" fill="#6b7280" fontSize="7">ETH</text>
                          <circle cx="410" cy={y + 29} r="18" fill="none" stroke="#374151" strokeWidth="1" />
                          {[0, 60, 120, 180, 240, 300].map((deg) => (
                            <line key={deg} x1="410" y1={y + 29} x2={410 + 12 * Math.cos(deg * Math.PI / 180)} y2={y + 29 + 12 * Math.sin(deg * Math.PI / 180)} stroke="#374151" strokeWidth="0.8" />
                          ))}
                          <line x1="80" y={y + 40} x2="280" y2={y + 40} stroke="#374151" strokeWidth="0.5" strokeDasharray="3" />
                          <text x="65" y={y + 44} fill="#4b5563" fontSize="7">Cable routing</text>
                        </g>
                      );
                    }
                  })}
                </svg>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Unit Detail + Legend + Specs */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Unit Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUnit ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={TYPE_COLORS[selectedUnit.type].text}>
                      {selectedUnit.type}
                    </Badge>
                    <span className="text-sm font-medium">Slot U{selectedUnit.slot}</span>
                  </div>
                  <h3 className={`font-semibold ${TYPE_COLORS[selectedUnit.type].text}`}>{selectedUnit.label}</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'Model', value: selectedUnit.model },
                      { label: 'Voltage', value: selectedUnit.voltage },
                      { label: 'Current', value: selectedUnit.current },
                      { label: 'Power', value: selectedUnit.power },
                      { label: 'Communication', value: 'Modbus RTU/TCP' },
                      { label: 'Mounting', value: '19" Rack Mount' },
                      { label: 'Sensing', value: selectedUnit.type === 'LETID' ? '4-Wire Kelvin' : 'Standard' },
                      { label: 'Safety', value: selectedUnit.type === 'PID' ? '5mA Interlock Trip' : 'Standard Protection' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-500">{label}</span>
                        <span className="text-gray-300 font-mono text-xs">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Click a unit in the rack to view specifications</p>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(TYPE_COLORS).filter(([k]) => k !== 'Empty').map(([type, colors]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.fill, border: `1px solid ${colors.stroke}` }} />
                  <span className={`text-xs ${colors.text}`}>{type}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rack Specifications */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Rack Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs">
                {[
                  ['Standard', '19" EIA-310'],
                  ['Height', '42U (1866mm)'],
                  ['Width', '600mm'],
                  ['Depth', '1000mm'],
                  ['Max Load', '800 kg'],
                  ['Ventilation', 'Forced air, front-to-rear'],
                  ['Power Input', '3-Phase 415V AC'],
                  ['Cable Entry', 'Top & Bottom'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-300">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
