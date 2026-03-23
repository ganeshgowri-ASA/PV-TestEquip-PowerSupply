'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/Toast';
import ModuleSelector from '@/components/ModuleSelector';
import type { PVModule, Technology } from '@/data/moduleDatabase';

const PS_TYPES = [
  {
    id: 'tc-hf', label: 'TC/HF',
    spec: '60V / 30A Bidirectional Regenerative',
    color: 'text-blue-400', gaugeColor: '#3b82f6',
    maxV: 60, maxA: 30, minV: 0, minA: 0,
    fields: [
      { key: 'voltage', label: 'Voltage Setpoint (V)', min: 0, max: 60, step: 0.1 },
      { key: 'current', label: 'Current Setpoint (A)', min: 0, max: 30, step: 0.1 },
      { key: 'rampRate', label: 'Ramp Rate (V/s)', min: 0, max: 10, step: 0.1 },
    ],
  },
  {
    id: 'letid', label: 'LETID',
    spec: '60V / 2A Precision',
    color: 'text-yellow-400', gaugeColor: '#eab308',
    maxV: 60, maxA: 2, minV: 0, minA: 0,
    fields: [
      { key: 'voltage', label: 'Voltage Setpoint (V)', min: 0, max: 60, step: 0.01 },
      { key: 'current', label: 'Current Setpoint (A)', min: 0, max: 2, step: 0.001 },
      { key: 'rampRate', label: 'Ramp Rate (V/s)', min: 0, max: 5, step: 0.01 },
    ],
  },
  {
    id: 'pid', label: 'PID',
    spec: '\u00B14000V DC / nA\u2013mA',
    color: 'text-red-400', gaugeColor: '#ef4444',
    maxV: 4000, maxA: 0.005, minV: -4000, minA: 0,
    fields: [
      { key: 'voltage', label: 'Voltage Setpoint (V)', min: -4000, max: 4000, step: 1 },
      { key: 'current', label: 'Current Limit (mA)', min: 0, max: 5, step: 0.001 },
      { key: 'rampRate', label: 'Ramp Rate (V/s)', min: 0, max: 100, step: 1 },
    ],
  },
];

const TECHNOLOGY_OPTIONS: Technology[] = ['PERC', 'TOPCon', 'HJT', 'HBC', 'Bifacial', 'Monofacial', 'Tandem', 'n-type', 'p-type'];

interface ChannelState {
  on: boolean;
  voltage: number;
  current: number;
  rampRate: number;
  kelvinMode: boolean;
  polarity: 'positive' | 'negative';
  appliedV: number;
  appliedA: number;
  fault: boolean;
}

function GaugeSVG({ value, max, min, label, unit, color }: {
  value: number; max: number; min: number; label: string; unit: string; color: string;
}) {
  const range = max - min;
  const pct = range > 0 ? Math.max(0, Math.min(1, (value - min) / range)) : 0;
  const angle = -135 + pct * 270;

  return (
    <svg viewBox="0 0 120 100" className="w-full max-w-[150px]">
      <path d="M 15 85 A 50 50 0 1 1 105 85" fill="none" stroke="#1f2937" strokeWidth="8" strokeLinecap="round" />
      <path d="M 15 85 A 50 50 0 1 1 105 85" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${pct * 235} 235`} opacity="0.8" />
      <line x1="60" y1="75" x2={60 + 35 * Math.cos(angle * Math.PI / 180)} y2={75 + 35 * Math.sin(angle * Math.PI / 180)}
        stroke="#e5e7eb" strokeWidth="1.5" />
      <circle cx="60" cy="75" r="3" fill="#e5e7eb" />
      <text x="60" y="65" textAnchor="middle" fill={color} fontSize="14" fontFamily="monospace" fontWeight="bold">
        {typeof value === 'number' && !isNaN(value) ? (Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(2)) : '0.00'}
      </text>
      <text x="60" y="95" textAnchor="middle" fill="#6b7280" fontSize="8">{label} ({unit})</text>
    </svg>
  );
}

export default function PowerSupplyControl() {
  const { toast } = useToast();
  const [selected, setSelected] = useState('tc-hf');
  const [activeChannel, setActiveChannel] = useState(1);
  const [technology, setTechnology] = useState<Technology>('HJT');
  const [selectedModule, setSelectedModule] = useState<PVModule | null>(null);
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [channels, setChannels] = useState<Record<number, ChannelState>>(() => {
    const init: Record<number, ChannelState> = {};
    for (let i = 1; i <= 10; i++) {
      init[i] = { on: false, voltage: 0, current: 0, rampRate: 1, kelvinMode: false, polarity: 'negative', appliedV: 0, appliedA: 0, fault: false };
    }
    return init;
  });

  const ps = PS_TYPES.find((p) => p.id === selected)!;
  const ch = channels[activeChannel];

  // Auto-set limits when module + technology are selected
  useEffect(() => {
    if (!selectedModule) return;
    const limits = selectedModule.testLimits;
    if (selected === 'tc-hf') {
      setChannels(prev => ({
        ...prev,
        [activeChannel]: {
          ...prev[activeChannel],
          voltage: Math.min(limits.tc.Vmax, ps.maxV),
          current: Math.min(limits.tc.Isc_TC, ps.maxA),
        },
      }));
    } else if (selected === 'letid') {
      setChannels(prev => ({
        ...prev,
        [activeChannel]: {
          ...prev[activeChannel],
          voltage: Math.min(limits.letid.Voc, ps.maxV),
          current: Math.min(limits.letid.Iinject, ps.maxA),
        },
      }));
    } else if (selected === 'pid') {
      setChannels(prev => ({
        ...prev,
        [activeChannel]: {
          ...prev[activeChannel],
          voltage: limits.pid.Vbias,
          current: limits.pid.Imax_leak,
        },
      }));
    }
  }, [selectedModule, selected, activeChannel, ps.maxV, ps.maxA]);

  // Simulate real-time gauge fluctuation
  useEffect(() => {
    if (emergencyStop) return;
    const interval = setInterval(() => {
      setChannels(prev => {
        const updated = { ...prev };
        for (let i = 1; i <= 10; i++) {
          if (updated[i].on && updated[i].appliedV > 0) {
            const noise = (Math.random() - 0.5) * 0.02;
            updated[i] = {
              ...updated[i],
              appliedV: updated[i].voltage * (1 + noise),
              appliedA: updated[i].current * (1 + noise * 0.5),
            };
          }
        }
        return updated;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [emergencyStop]);

  const updateChannel = useCallback((field: keyof ChannelState, value: ChannelState[keyof ChannelState]) => {
    setChannels(prev => ({
      ...prev,
      [activeChannel]: { ...prev[activeChannel], [field]: value },
    }));
  }, [activeChannel]);

  const handleApply = () => {
    if (emergencyStop) {
      toast('error', 'Emergency stop is active. Reset to continue.');
      return;
    }
    const v = ch.voltage;
    const a = selected === 'pid' ? ch.current / 1000 : ch.current;
    if (v === 0 && a === 0) {
      toast('warning', 'Set voltage and current before applying');
      return;
    }
    if (selected !== 'pid' && (v < 0 || v > ps.maxV)) {
      toast('error', `Voltage must be between ${ps.minV}V and ${ps.maxV}V`);
      return;
    }
    if (selected === 'pid' && (v < ps.minV || v > ps.maxV)) {
      toast('error', `Voltage must be between ${ps.minV}V and ${ps.maxV}V`);
      return;
    }
    setChannels(prev => ({
      ...prev,
      [activeChannel]: { ...prev[activeChannel], appliedV: v, appliedA: a },
    }));
    toast('success', `Setpoints applied to Channel ${activeChannel}: ${v}V / ${selected === 'pid' ? ch.current + 'mA' : a + 'A'}`);
  };

  const handleReset = () => {
    setChannels(prev => ({
      ...prev,
      [activeChannel]: { ...prev[activeChannel], voltage: 0, current: 0, rampRate: 1, appliedV: 0, appliedA: 0, on: false, fault: false },
    }));
    toast('info', `Channel ${activeChannel} reset`);
  };

  const toggleChannel = () => {
    if (emergencyStop) {
      toast('error', 'Emergency stop is active. Reset to continue.');
      return;
    }
    const newState = !ch.on;
    updateChannel('on', newState);
    toast(newState ? 'success' : 'warning', `Channel ${activeChannel} ${newState ? 'ON' : 'OFF'}`);
  };

  const handleEmergencyStop = () => {
    setEmergencyStop(true);
    setChannels(prev => {
      const updated = { ...prev };
      for (let i = 1; i <= 10; i++) {
        updated[i] = { ...updated[i], on: false, appliedV: 0, appliedA: 0 };
      }
      return updated;
    });
    toast('error', 'EMERGENCY STOP ACTIVATED - All channels OFF');
  };

  const handleEmergencyReset = () => {
    setEmergencyStop(false);
    toast('info', 'Emergency stop cleared. Channels remain off.');
  };

  const handleConnect = () => {
    setConnectionStatus(prev => prev === 'connected' ? 'disconnected' : 'connected');
    toast('info', connectionStatus === 'connected' ? 'Disconnected from PSU' : 'Connected to PSU (simulated)');
  };

  const interlockOk = selected !== 'pid' || (ch.appliedA * 1000 < 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Power Supply Control</h2>
          <p className="text-gray-400 text-sm">Configure and monitor power supply setpoints per channel</p>
        </div>
        {/* Emergency Stop Button */}
        <div className="flex items-center gap-3">
          {emergencyStop ? (
            <Button size="sm" variant="outline" onClick={handleEmergencyReset}
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-900">
              Reset E-Stop
            </Button>
          ) : (
            <button onClick={handleEmergencyStop}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-900/50 border-2 border-red-500 animate-pulse hover:animate-none transition-all text-sm uppercase tracking-wider">
              EMERGENCY STOP
            </button>
          )}
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={handleConnect}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            connectionStatus === 'connected'
              ? 'border-green-600 bg-green-900/30 text-green-400'
              : 'border-gray-600 bg-gray-800 text-gray-400'
          }`}>
          <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-gray-500'}`} />
          {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
        </button>
        {emergencyStop && (
          <div className="px-3 py-1.5 rounded-lg border border-red-600 bg-red-900/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            E-STOP ACTIVE
          </div>
        )}
        {!interlockOk && (
          <div className="px-3 py-1.5 rounded-lg border border-yellow-600 bg-yellow-900/30 text-yellow-400 text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            INTERLOCK TRIPPED (5mA)
          </div>
        )}
      </div>

      {/* Module Selector Toggle */}
      <div className="flex gap-3 items-center flex-wrap">
        <Button size="sm" variant="outline" onClick={() => setShowModuleSelector(!showModuleSelector)}>
          {showModuleSelector ? 'Hide Module Selector' : 'Select PV Module'}
        </Button>
        {selectedModule && (
          <Badge className="bg-blue-900 text-blue-300">
            {selectedModule.manufacturer} {selectedModule.model} ({selectedModule.Pmax}W)
          </Badge>
        )}
      </div>

      {showModuleSelector && (
        <ModuleSelector selectedModule={selectedModule} onSelectModule={(mod) => { setSelectedModule(mod); if (mod) setTechnology(mod.technology); }} />
      )}

      {/* PS Type + Technology Selectors */}
      <div className="flex gap-3 flex-wrap items-center">
        {PS_TYPES.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
              selected === p.id
                ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="border-l border-gray-700 pl-3 ml-1">
          <select value={technology} onChange={(e) => setTechnology(e.target.value as Technology)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
            {TECHNOLOGY_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Channel Selector */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Channel Selector (1-10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(chNum => (
              <button
                key={chNum}
                onClick={() => setActiveChannel(chNum)}
                className={`relative px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  activeChannel === chNum
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
                }`}
              >
                Ch {chNum}
                <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${channels[chNum].on ? 'bg-green-400' : channels[chNum].fault ? 'bg-red-400' : 'bg-gray-600'}`} />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Interlock Status */}
      {selected === 'pid' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Safety Interlock Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Leakage Current', ok: interlockOk, value: `${(ch.appliedA * 1000).toFixed(3)}mA / 5mA` },
                { label: 'Door Interlock', ok: true, value: 'Closed' },
                { label: 'Ground Fault', ok: true, value: 'Normal' },
                { label: 'Over-Temperature', ok: true, value: '42 deg C / 85 deg C max' },
              ].map(item => (
                <div key={item.label} className={`p-2 rounded border text-xs ${item.ok ? 'border-green-800 bg-green-900/20' : 'border-red-800 bg-red-900/20'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${item.ok ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
                    <span className={item.ok ? 'text-green-400' : 'text-red-400'}>{item.label}</span>
                  </div>
                  <span className="text-gray-400">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Control Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`text-base ${ps.color}`}>{ps.label} Power Supply - Ch {activeChannel}</CardTitle>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{ps.spec}</Badge>
                <Badge variant="outline" className="text-xs">{technology}</Badge>
                <button
                  onClick={toggleChannel}
                  className={`relative w-14 h-7 rounded-full transition-colors ${ch.on ? 'bg-green-600' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${ch.on ? 'left-7' : 'left-0.5'}`} />
                </button>
                <span className={`text-xs font-medium ${ch.on ? 'text-green-400' : 'text-gray-500'}`}>{ch.on ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {ps.fields.map((field) => (
                <div key={field.key}>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">{field.label}</label>
                  <Input
                    type="number"
                    placeholder={`${field.min} \u2013 ${field.max}`}
                    value={ch[field.key as keyof ChannelState] as number || ''}
                    onChange={(e) => updateChannel(field.key as keyof ChannelState, parseFloat(e.target.value) || 0)}
                    max={field.max}
                    min={field.min}
                    step={field.step}
                  />
                </div>
              ))}
            </div>

            {/* LETID-specific: 4-wire Kelvin mode */}
            {selected === 'letid' && (
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <label className="text-xs text-gray-400">4-Wire Kelvin Sensing</label>
                <button
                  onClick={() => updateChannel('kelvinMode', !ch.kelvinMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${ch.kelvinMode ? 'bg-yellow-600' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${ch.kelvinMode ? 'left-6' : 'left-0.5'}`} />
                </button>
                <span className={`text-xs ${ch.kelvinMode ? 'text-yellow-400' : 'text-gray-500'}`}>
                  {ch.kelvinMode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            )}

            {/* PID-specific: Polarity toggle */}
            {selected === 'pid' && (
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <label className="text-xs text-gray-400">Polarity</label>
                <div className="flex gap-2">
                  {(['positive', 'negative'] as const).map(pol => (
                    <button
                      key={pol}
                      onClick={() => updateChannel('polarity', pol)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        ch.polarity === pol
                          ? pol === 'positive' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {pol === 'positive' ? '+V' : '-V'}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-2">Safety interlock: trips at 5mA leakage</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button size="sm" variant="default" onClick={handleApply} disabled={emergencyStop}>Apply Setpoints</Button>
              <Button size="sm" variant="outline" onClick={handleReset}>Reset</Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Gauges */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Real-time Readout - Ch {activeChannel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <GaugeSVG
                value={ch.appliedV}
                max={ps.maxV}
                min={ps.minV}
                label="Voltage"
                unit="V"
                color={ps.gaugeColor}
              />
              <GaugeSVG
                value={selected === 'pid' ? ch.appliedA * 1000 : ch.appliedA}
                max={selected === 'pid' ? ps.maxA * 1000 : ps.maxA}
                min={0}
                label="Current"
                unit={selected === 'pid' ? 'mA' : 'A'}
                color={ps.gaugeColor}
              />
            </div>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={ch.on ? 'success' : 'secondary'} className="text-xs">
                  {emergencyStop ? 'E-STOP' : ch.fault ? 'FAULT' : ch.on ? 'Active' : 'Standby'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Output</span>
                <Badge variant={ch.on ? 'success' : 'secondary'} className="text-xs">{ch.on ? 'ON' : 'OFF'}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Power</span>
                <span className="text-gray-300 font-mono">{(ch.appliedV * ch.appliedA).toFixed(2)} W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mode</span>
                <span className="text-gray-300">
                  {selected === 'tc-hf' ? 'Bidirectional Regen.' : selected === 'letid' ? 'Precision DC' : 'HV DC'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Technology</span>
                <span className="text-gray-300">{technology}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ramp Rate</span>
                <span className="text-gray-300 font-mono">{ch.rampRate} V/s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
