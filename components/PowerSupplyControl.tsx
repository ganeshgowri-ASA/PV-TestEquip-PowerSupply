'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

type PSType = 'tc-hf' | 'letid' | 'pid';

interface ChannelState {
  id: number;
  enabled: boolean;
  voltage: number;
  current: number;
  power: number;
  status: 'off' | 'on' | 'fault' | 'standby';
}

const PS_TYPES = [
  { id: 'tc-hf' as PSType, label: 'TC/HF', spec: '60V / 30A Bidirectional Regenerative', color: 'text-blue-400', borderColor: 'border-blue-500', bgColor: 'bg-blue-500/10', maxV: 60, maxA: 30 },
  { id: 'letid' as PSType, label: 'LETID', spec: '60V / 2A Precision', color: 'text-green-400', borderColor: 'border-green-500', bgColor: 'bg-green-500/10', maxV: 60, maxA: 2 },
  { id: 'pid' as PSType, label: 'PID', spec: '±4000V DC / nA–mA', color: 'text-red-400', borderColor: 'border-red-500', bgColor: 'bg-red-500/10', maxV: 4000, maxA: 0.005 },
];

// SVG Gauge component
function Gauge({ value, max, label, unit, color, size = 120 }: {
  value: number; max: number; label: string; unit: string; color: string; size?: number;
}) {
  const radius = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.52;
  const startAngle = -220;
  const endAngle = 40;
  const angleRange = endAngle - startAngle;
  const clampedValue = Math.min(Math.max(value, 0), max);
  const valueAngle = startAngle + (clampedValue / max) * angleRange;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (start: number, end: number, r: number) => {
    const s = toRad(start);
    const e = toRad(end);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const largeArc = Math.abs(end - start) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const needleEnd = toRad(valueAngle);
  const nx = cx + (radius - 8) * Math.cos(needleEnd);
  const ny = cy + (radius - 8) * Math.sin(needleEnd);

  const pct = (clampedValue / max) * 100;
  const displayValue = max >= 100 ? clampedValue.toFixed(0) : max >= 1 ? clampedValue.toFixed(2) : (clampedValue * 1000).toFixed(2);
  const displayUnit = max < 1 ? 'mA' : unit;

  return (
    <svg viewBox={`0 0 ${size} ${size * 0.7}`} className="w-full h-auto">
      {/* Background arc */}
      <path d={arcPath(startAngle, endAngle, radius)} fill="none" stroke="#374151" strokeWidth="8" strokeLinecap="round" />
      {/* Value arc */}
      <path d={arcPath(startAngle, valueAngle, radius)} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
      {/* Warning zone */}
      {pct > 80 && (
        <path d={arcPath(startAngle + angleRange * 0.8, valueAngle, radius)} fill="none" stroke={pct > 95 ? '#EF4444' : '#F59E0B'} strokeWidth="8" strokeLinecap="round" />
      )}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill="#E5E7EB" />
      {/* Value text */}
      <text x={cx} y={cy + 18} textAnchor="middle" fill="#E5E7EB" fontSize="14" fontWeight="bold" fontFamily="monospace">
        {displayValue}
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill="#9CA3AF" fontSize="8">
        {displayUnit}
      </text>
      {/* Label */}
      <text x={cx} y={size * 0.7 - 2} textAnchor="middle" fill="#6B7280" fontSize="9">
        {label}
      </text>
    </svg>
  );
}

function formatCurrent(a: number): string {
  if (a >= 1) return `${a.toFixed(2)} A`;
  if (a >= 0.001) return `${(a * 1000).toFixed(2)} mA`;
  return `${(a * 1e6).toFixed(1)} µA`;
}

export default function PowerSupplyControl() {
  const { addToast } = useToast();
  const [selected, setSelected] = useState<PSType>('tc-hf');
  const [voltageSetpoint, setVoltageSetpoint] = useState('');
  const [currentSetpoint, setCurrentSetpoint] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(1);
  const [channels, setChannels] = useState<ChannelState[]>(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1, enabled: false, voltage: 0, current: 0, power: 0, status: 'off' as const,
    }))
  );
  const [outputEnabled, setOutputEnabled] = useState(false);
  const [pidPolarity, setPidPolarity] = useState<'positive' | 'negative'>('negative');
  const [leakageCurrent, setLeakageCurrent] = useState(0);
  const [interlockTripped, setInterlockTripped] = useState(false);

  const ps = PS_TYPES.find((p) => p.id === selected)!;
  const ch = channels[selectedChannel - 1];

  // Simulate gauge readings when channels are on
  useEffect(() => {
    const interval = setInterval(() => {
      setChannels((prev) => prev.map((c) => {
        if (c.status !== 'on') return c;
        const vNoise = (Math.random() - 0.5) * 0.2;
        const iNoise = (Math.random() - 0.5) * (ps.maxA * 0.02);
        const v = Math.max(0, c.voltage + vNoise);
        const i = Math.max(0, c.current + iNoise);
        return { ...c, voltage: v, current: i, power: v * i };
      }));
      if (selected === 'pid' && outputEnabled) {
        const leak = Math.abs(Math.sin(Date.now() / 2000) * 0.002 + Math.random() * 0.001);
        setLeakageCurrent(leak);
        if (leak >= 0.005) {
          setInterlockTripped(true);
          addToast({ title: 'INTERLOCK TRIPPED', description: `Leakage ${(leak * 1000).toFixed(2)} mA exceeds 5 mA threshold`, variant: 'destructive', duration: 5000 });
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [selected, outputEnabled, ps.maxA, addToast]);

  const applySetpoints = useCallback(() => {
    const v = parseFloat(voltageSetpoint);
    const i = parseFloat(currentSetpoint);
    if (isNaN(v) || isNaN(i)) {
      addToast({ title: 'Invalid Input', description: 'Enter valid voltage and current values', variant: 'destructive' });
      return;
    }
    if (v > ps.maxV || i > ps.maxA) {
      addToast({ title: 'Value Exceeds Limit', description: `Max: ${ps.maxV}V / ${ps.maxA}A`, variant: 'warning' });
      return;
    }
    setChannels((prev) => prev.map((c) =>
      c.id === selectedChannel ? { ...c, voltage: v, current: i, power: v * i } : c
    ));
    addToast({ title: 'Setpoints Applied', description: `Ch ${selectedChannel}: ${v}V / ${selected === 'pid' ? formatCurrent(i) : `${i}A`}`, variant: 'success' });
  }, [voltageSetpoint, currentSetpoint, selectedChannel, ps, selected, addToast]);

  const applyToAllChannels = useCallback(() => {
    const v = parseFloat(voltageSetpoint);
    const i = parseFloat(currentSetpoint);
    if (isNaN(v) || isNaN(i)) {
      addToast({ title: 'Invalid Input', variant: 'destructive' });
      return;
    }
    setChannels((prev) => prev.map((c) => ({ ...c, voltage: v, current: i, power: v * i })));
    addToast({ title: 'All Channels Updated', description: `${v}V / ${selected === 'pid' ? formatCurrent(i) : `${i}A`}`, variant: 'success' });
  }, [voltageSetpoint, currentSetpoint, selected, addToast]);

  const resetSetpoints = useCallback(() => {
    setVoltageSetpoint('');
    setCurrentSetpoint('');
    setChannels((prev) => prev.map((c) => ({ ...c, voltage: 0, current: 0, power: 0, status: 'off', enabled: false })));
    setOutputEnabled(false);
    setInterlockTripped(false);
    addToast({ title: 'All Channels Reset', variant: 'default' });
  }, [addToast]);

  const toggleChannel = useCallback((chId: number) => {
    setChannels((prev) => prev.map((c) => {
      if (c.id !== chId) return c;
      const newEnabled = !c.enabled;
      return { ...c, enabled: newEnabled, status: newEnabled ? 'on' : 'off' };
    }));
  }, []);

  const toggleOutput = useCallback(() => {
    if (interlockTripped) {
      addToast({ title: 'Cannot Enable', description: 'Clear interlock trip first', variant: 'destructive' });
      return;
    }
    setOutputEnabled((prev) => {
      const next = !prev;
      setChannels((chs) => chs.map((c) => c.enabled ? { ...c, status: next ? 'on' : 'standby' } : c));
      addToast({ title: next ? 'Output Enabled' : 'Output Disabled', variant: next ? 'success' : 'warning' });
      return next;
    });
  }, [interlockTripped, addToast]);

  const clearInterlock = useCallback(() => {
    setInterlockTripped(false);
    setOutputEnabled(false);
    setChannels((prev) => prev.map((c) => ({ ...c, status: c.enabled ? 'standby' : 'off' })));
    addToast({ title: 'Interlock Cleared', description: 'Output disabled — re-enable manually', variant: 'warning' });
  }, [addToast]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Power Supply Control</h2>
        <p className="text-gray-400 text-sm">Configure setpoints, monitor channels, and control outputs for all test types</p>
      </div>

      {/* PS Type Selector */}
      <div className="flex gap-3">
        {PS_TYPES.map((p) => (
          <button
            key={p.id}
            onClick={() => { setSelected(p.id); resetSetpoints(); }}
            className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
              selected === p.id
                ? `${p.borderColor} ${p.bgColor} ${p.color}`
                : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Channel selector + gauges */}
        <div className="space-y-4">
          {/* Channel selector */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Channel Select (1–10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {channels.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChannel(c.id)}
                    className={`relative p-2 rounded-lg text-center text-xs font-mono transition-all ${
                      selectedChannel === c.id
                        ? `${ps.borderColor} ${ps.bgColor} border-2`
                        : 'border border-gray-700 bg-gray-900 hover:border-gray-500'
                    }`}
                  >
                    <div className={`text-sm font-bold ${selectedChannel === c.id ? ps.color : 'text-gray-300'}`}>
                      {c.id}
                    </div>
                    <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                      c.status === 'on' ? 'bg-green-400 animate-pulse' :
                      c.status === 'fault' ? 'bg-red-400 animate-pulse' :
                      c.status === 'standby' ? 'bg-yellow-400' :
                      'bg-gray-600'
                    }`} />
                  </button>
                ))}
              </div>
              {/* ON/OFF toggles */}
              <div className="grid grid-cols-5 gap-2 mt-2">
                {channels.map((c) => (
                  <button
                    key={`toggle-${c.id}`}
                    onClick={() => toggleChannel(c.id)}
                    className={`px-1 py-0.5 rounded text-xs font-medium transition-colors ${
                      c.enabled ? 'bg-green-700 text-green-100' : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {c.enabled ? 'ON' : 'OFF'}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Simulated gauges */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm text-gray-400">Ch {selectedChannel} — Live Readings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Gauge value={ch.voltage} max={ps.maxV} label="Voltage" unit="V"
                  color={selected === 'tc-hf' ? '#3B82F6' : selected === 'letid' ? '#10B981' : '#EF4444'} />
                <Gauge value={ch.current} max={ps.maxA} label="Current" unit="A"
                  color={selected === 'tc-hf' ? '#F59E0B' : selected === 'letid' ? '#06B6D4' : '#F97316'} />
              </div>
              <div className="text-center mt-2">
                <p className="text-xs text-gray-500">Power</p>
                <p className="text-lg font-mono font-bold text-gray-200">
                  {ch.power >= 1 ? `${ch.power.toFixed(1)} W` : `${(ch.power * 1000).toFixed(1)} mW`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Setpoint controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={`text-base ${ps.color}`}>{ps.label} Power Supply</CardTitle>
                <Badge variant="secondary">{ps.spec}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                    Voltage Setpoint (V)
                  </label>
                  <Input
                    type="number"
                    placeholder={`0 – ${ps.maxV}`}
                    value={voltageSetpoint}
                    onChange={(e) => setVoltageSetpoint(e.target.value)}
                    max={ps.maxV}
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                    Current Setpoint ({ps.maxA >= 1 ? 'A' : 'mA'})
                  </label>
                  <Input
                    type="number"
                    placeholder={`0 – ${ps.maxA >= 1 ? ps.maxA : ps.maxA * 1000}`}
                    value={currentSetpoint}
                    onChange={(e) => setCurrentSetpoint(e.target.value)}
                    max={ps.maxA}
                    min={0}
                    step={ps.maxA < 1 ? 0.0001 : 0.1}
                  />
                </div>
              </div>

              {/* PID-specific controls */}
              {selected === 'pid' && (
                <div className="space-y-3 p-3 rounded-lg border border-red-800 bg-red-950/20">
                  <h4 className="text-xs text-red-400 font-semibold uppercase">PID High Voltage Settings</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPidPolarity('negative')}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        pidPolarity === 'negative' ? 'bg-red-700 text-white' : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      -V (Stress)
                    </button>
                    <button
                      onClick={() => setPidPolarity('positive')}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        pidPolarity === 'positive' ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      +V (Recovery)
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Leakage Current</span>
                    <span className={`font-mono ${leakageCurrent * 1000 >= 4 ? 'text-red-400' : 'text-green-400'}`}>
                      {(leakageCurrent * 1000).toFixed(3)} mA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Interlock (5 mA)</span>
                    <Badge variant={interlockTripped ? 'destructive' : 'success'} className="text-xs">
                      {interlockTripped ? 'TRIPPED' : 'OK'}
                    </Badge>
                  </div>
                  {interlockTripped && (
                    <Button size="sm" variant="destructive" onClick={clearInterlock} className="w-full">
                      Clear Interlock
                    </Button>
                  )}
                </div>
              )}

              {/* LETID-specific info */}
              {selected === 'letid' && (
                <div className="space-y-2 p-3 rounded-lg border border-green-800 bg-green-950/20">
                  <h4 className="text-xs text-green-400 font-semibold uppercase">LETID Precision Mode</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-500">Regulation:</span> <span className="text-green-300">Linear (Low Noise)</span></div>
                    <div><span className="text-gray-500">Ripple:</span> <span className="text-green-300 font-mono">&lt;2 mV rms</span></div>
                    <div><span className="text-gray-500">Accuracy V:</span> <span className="text-green-300 font-mono">±0.05%</span></div>
                    <div><span className="text-gray-500">Accuracy I:</span> <span className="text-green-300 font-mono">±0.1%</span></div>
                    <div><span className="text-gray-500">Sensing:</span> <span className="text-green-300">4-Wire Kelvin</span></div>
                    <div><span className="text-gray-500">PVEL Fraction:</span> <span className="text-green-300 font-mono">0.5× Isc</span></div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap pt-2">
                <Button size="sm" onClick={applySetpoints}>Apply to Ch {selectedChannel}</Button>
                <Button size="sm" variant="secondary" onClick={applyToAllChannels}>Apply All Channels</Button>
                <Button size="sm" variant="outline" onClick={resetSetpoints}>Reset All</Button>
              </div>
            </CardContent>
          </Card>

          {/* Master output control */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Master Output</h4>
                  <p className="text-xs text-gray-500">{channels.filter((c) => c.enabled).length} channels enabled</p>
                </div>
                <Button
                  size="lg"
                  onClick={toggleOutput}
                  className={`min-w-[120px] font-bold text-lg ${
                    outputEnabled
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-green-700 hover:bg-green-600 text-white'
                  }`}
                >
                  {outputEnabled ? 'STOP' : 'START'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Channel status table */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">All Channels Status</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-500 uppercase">
                    <th className="p-2 text-left">Ch</th>
                    <th className="p-2 text-center">State</th>
                    <th className="p-2 text-right">V</th>
                    <th className="p-2 text-right">I</th>
                    <th className="p-2 text-right">W</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((c) => (
                    <tr key={c.id}
                      onClick={() => setSelectedChannel(c.id)}
                      className={`border-b border-gray-800 cursor-pointer transition-colors ${
                        selectedChannel === c.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'
                      }`}
                    >
                      <td className="p-2 font-mono font-bold">{c.id}</td>
                      <td className="p-2 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          c.status === 'on' ? 'bg-green-400' :
                          c.status === 'fault' ? 'bg-red-400' :
                          c.status === 'standby' ? 'bg-yellow-400' :
                          'bg-gray-600'
                        }`} />
                      </td>
                      <td className="p-2 text-right font-mono text-gray-300">
                        {c.status === 'on' ? c.voltage.toFixed(1) : '—'}
                      </td>
                      <td className="p-2 text-right font-mono text-gray-300">
                        {c.status === 'on' ? (ps.maxA >= 1 ? c.current.toFixed(2) : (c.current * 1000).toFixed(2)) : '—'}
                      </td>
                      <td className="p-2 text-right font-mono text-gray-300">
                        {c.status === 'on' ? c.power.toFixed(1) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-600 bg-gray-800/30">
                    <td colSpan={2} className="p-2 text-gray-500">Total</td>
                    <td className="p-2 text-right font-mono text-gray-300">—</td>
                    <td className="p-2 text-right font-mono text-gray-300">—</td>
                    <td className="p-2 text-right font-mono text-green-400 font-bold">
                      {channels.filter((c) => c.status === 'on').reduce((s, c) => s + c.power, 0).toFixed(0)} W
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>

          {/* Communication status */}
          <Card className="mt-4">
            <CardContent className="pt-4 space-y-2">
              <h4 className="text-xs text-gray-500 uppercase font-semibold">Communication</h4>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Modbus RTU (RS-485)</span>
                <Badge variant="success" className="text-xs">Connected</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Modbus TCP (Ethernet)</span>
                <Badge variant="success" className="text-xs">Connected</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Safety Interlock Chain</span>
                <Badge variant={interlockTripped ? 'destructive' : 'success'} className="text-xs">
                  {interlockTripped ? 'FAULT' : 'Healthy'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
