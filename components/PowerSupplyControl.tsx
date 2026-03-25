'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/Toast';
import type { PVModule } from '@/data/moduleDatabase';

const TECHNOLOGY_OPTIONS: string[] = ['PERC', 'TOPCon', 'HJT', 'HBC', 'Bifacial', 'Tandem', 'n-type', 'p-type'];

const PS_TYPES = [
  {
    id: 'tc-hf', label: 'TC/HF',
    spec: '60V / 30A Bidirectional Regenerative',
    color: 'text-blue-400', gaugeColor: '#3b82f6',
    maxV: 60, maxA: 30, minV: 0, minA: 0,
    fields: [
      { key: 'voltage', label: 'Voltage Setpoint (V)', min: 0, max: 60, step: 0.1 },
      { key: 'current', label: 'Current Setpoint (A)', min: 0, max: 30, step: 0.1 },
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
    ],
  },
];

interface ChannelState {
  on: boolean;
  voltage: number;
  current: number;
  kelvinMode: boolean;
  polarity: 'positive' | 'negative';
  appliedV: number;
  appliedA: number;
  rampRate: number;
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

interface PowerSupplyControlProps {
  selectedModule?: PVModule | null;
}

export default function PowerSupplyControl({ selectedModule }: PowerSupplyControlProps) {
  const { toast } = useToast();
  const [selected, setSelected] = useState('tc-hf');
  const [activeChannel, setActiveChannel] = useState(1);
  const [technology, setTechnology] = useState<string>('HJT');
  const [connected, setConnected] = useState(false);
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [channels, setChannels] = useState<Record<number, ChannelState>>(() => {
    const init: Record<number, ChannelState> = {};
    for (let i = 1; i <= 10; i++) {
      init[i] = { on: false, voltage: 0, current: 0, kelvinMode: false, polarity: 'negative', appliedV: 0, appliedA: 0, rampRate: 1.0, fault: false };
    }
    return init;
  });

  const ps = PS_TYPES.find((p) => p.id === selected)!;
  const ch = channels[activeChannel];

  // Auto-set limits when module selected
  useEffect(() => {
    if (!selectedModule) return;
    setTechnology(selectedModule.technology);

    setChannels(prev => {
      const updated = { ...prev };
      for (let i = 1; i <= 10; i++) {
        if (!updated[i].on) {
          if (selected === 'tc-hf') {
            updated[i] = { ...updated[i], voltage: selectedModule.testLimits.tc.Vmax, current: selectedModule.testLimits.tc.Isc };
          } else if (selected === 'letid') {
            updated[i] = { ...updated[i], voltage: selectedModule.Voc, current: Math.min(selectedModule.Isc, 2) };
          } else if (selected === 'pid') {
            updated[i] = { ...updated[i], voltage: selectedModule.testLimits.pid.Vbias, current: selectedModule.testLimits.pid.ImaxLeak };
          }
        }
      }
      return updated;
    });
  }, [selectedModule, selected]);

  // Simulate real-time gauge fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      if (emergencyStop) return;
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
      toast('error', 'Emergency stop active - reset before applying');
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
      [activeChannel]: { ...prev[activeChannel], voltage: 0, current: 0, appliedV: 0, appliedA: 0, on: false, fault: false },
    }));
    toast('info', `Channel ${activeChannel} reset`);
  };

  const toggleChannel = () => {
    if (emergencyStop) {
      toast('error', 'Emergency stop active - cannot enable channel');
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
    toast('error', 'EMERGENCY STOP activated - all channels OFF');
  };

  const handleResetEmergency = () => {
    setEmergencyStop(false);
    toast('info', 'Emergency stop cleared');
  };

  const activeCount = Object.values(channels).filter(c => c.on).length;
  const faultCount = Object.values(channels).filter(c => c.fault).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Power Supply Control</h2>
          <p className="text-gray-400 text-sm">Configure and monitor power supply setpoints per channel</p>
        </div>
        {/* Emergency Stop */}
        <div className="flex items-center gap-3">
          {emergencyStop ? (
            <Button size="sm" variant="outline" onClick={handleResetEmergency} className="border-yellow-600 text-yellow-400">
              Reset E-Stop
            </Button>
          ) : (
            <button
              onClick={handleEmergencyStop}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-900/50 text-sm uppercase tracking-wider transition-colors animate-pulse hover:animate-none"
            >
              EMERGENCY STOP
            </button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
          <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-300">{connected ? 'Connected' : 'Disconnected'}</span>
          <button onClick={() => setConnected(!connected)} className="text-xs text-blue-400 hover:underline ml-1">
            {connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
          <span className="text-xs text-gray-400">Active:</span>
          <span className="text-xs font-mono text-green-400">{activeCount}/10</span>
        </div>
        {faultCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 border border-red-700 rounded-lg">
            <span className="text-xs text-red-400">Faults: {faultCount}</span>
          </div>
        )}
        {emergencyStop && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/50 border border-red-500 rounded-lg animate-pulse">
            <span className="text-xs text-red-300 font-bold">E-STOP ACTIVE</span>
          </div>
        )}
        {selectedModule && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/20 border border-blue-700 rounded-lg">
            <span className="text-xs text-blue-300">Module: {selectedModule.manufacturer} {selectedModule.model}</span>
          </div>
        )}
      </div>

      {/* Technology & PS Type Selectors */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Technology</label>
          <select value={technology} onChange={(e) => setTechnology(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white">
            {TECHNOLOGY_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Power Supply Type</label>
          <div className="flex gap-2">
            {PS_TYPES.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`px-4 py-1.5 rounded-lg border transition-colors text-sm font-medium ${
                  selected === p.id
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
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
                <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                  channels[chNum].fault ? 'bg-red-400' : channels[chNum].on ? 'bg-green-400' : 'bg-gray-600'
                }`} />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Interlock Panel */}
      {selected === 'pid' && (
        <Card className="border-red-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-400">Safety Interlock Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Door Interlock', status: true },
                { label: 'Over-Current (5mA)', status: true },
                { label: 'Ground Fault', status: true },
                { label: 'Temperature Limit', status: true },
              ].map(({ label, status }) => (
                <div key={label} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded">
                  <span className={`w-2 h-2 rounded-full ${status ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-xs text-gray-300">{label}</span>
                  <span className={`text-xs ml-auto ${status ? 'text-green-400' : 'text-red-400'}`}>{status ? 'OK' : 'TRIP'}</span>
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
            <div className="grid grid-cols-2 gap-4">
              {ps.fields.map((field) => (
                <div key={field.key}>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">{field.label}</label>
                  <Input
                    type="number"
                    placeholder={`${field.min} \u2013 ${field.max}`}
                    value={ch[field.key as 'voltage' | 'current'] || ''}
                    onChange={(e) => updateChannel(field.key as keyof ChannelState, parseFloat(e.target.value) || 0)}
                    max={field.max}
                    min={field.min}
                    step={field.step}
                  />
                </div>
              ))}
            </div>

            {/* Ramp Rate */}
            <div className="p-3 bg-gray-800 rounded-lg">
              <label className="text-xs text-gray-400 block mb-1">Ramp Rate (V/s)</label>
              <div className="flex items-center gap-3">
                <Input type="number" value={ch.rampRate} min={0.1} max={100} step={0.1}
                  onChange={(e) => updateChannel('rampRate', parseFloat(e.target.value) || 1)}
                  className="w-24 h-7 text-xs" />
                <span className="text-xs text-gray-500">Time to setpoint: {ch.voltage > 0 ? (ch.voltage / ch.rampRate).toFixed(1) : '0.0'}s</span>
              </div>
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
              <Button size="sm" variant="default" onClick={handleApply}>Apply Setpoints</Button>
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
                <Badge variant={ch.on ? 'success' : 'secondary'} className="text-xs">{ch.on ? 'Active' : 'Standby'}</Badge>
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
              <div className="flex justify-between">
                <span className="text-gray-500">Output</span>
                <Badge variant={ch.on ? 'success' : 'warning'} className="text-xs">{ch.on ? 'ON' : 'OFF'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
