'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PS_TYPES = [
  {
    id: 'tc-hf',
    label: 'TC/HF',
    spec: '60V / 30A Bidirectional Regenerative',
    color: 'text-blue-400',
    maxV: 60,
    maxA: 30,
  },
  {
    id: 'letid',
    label: 'LETID',
    spec: '60V / 2A Precision',
    color: 'text-green-400',
    maxV: 60,
    maxA: 2,
  },
  {
    id: 'pid',
    label: 'PID',
    spec: '±4000V DC',
    color: 'text-red-400',
    maxV: 4000,
    maxA: 0.01,
  },
];

export default function PowerSupplyControl() {
  const [selected, setSelected] = useState('tc-hf');
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');

  const ps = PS_TYPES.find((p) => p.id === selected)!;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Power Supply Control</h2>
        <p className="text-gray-400 text-sm">Configure and monitor power supply setpoints</p>
      </div>

      {/* PS Selector */}
      <div className="flex gap-3">
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
      </div>

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
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                max={ps.maxV}
                min={0}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                Current Setpoint (A)
              </label>
              <Input
                type="number"
                placeholder={`0 – ${ps.maxA}`}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                max={ps.maxA}
                min={0}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button size="sm" variant="default">Apply Setpoints</Button>
            <Button size="sm" variant="outline">Reset</Button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Note: Actual hardware control requires Modbus RTU/TCP integration (Session 4)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
