'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/Toast';

interface SimRecipe {
  id: string;
  name: string;
  type: 'TC' | 'HF' | 'LETID' | 'PID';
  durationHours: number;
  energyKwh: number;
  params: Record<string, number | string>;
}

const SIM_RECIPES: SimRecipe[] = [
  { id: 'tc200', name: 'TC 200 Cycles', type: 'TC', durationHours: 500, energyKwh: 9000,
    params: { tempMin: -40, tempMax: 85, rampRate: '1.67 C/min', dwellTime: '15 min', cycles: 200 } },
  { id: 'hf10', name: 'HF 10 Cycles', type: 'HF', durationHours: 240, energyKwh: 5760,
    params: { tempMin: -40, tempMax: 85, humidity: '85%', dwellTime: '20 hr', cycles: 10 } },
  { id: 'letid', name: 'LETID Sensitivity', type: 'LETID', durationHours: 162, energyKwh: 1944,
    params: { cellTemp: '75 C', irradiance: '1000 W/m2', currentFraction: 0.5, duration: '162 hr' } },
  { id: 'pid', name: 'PID Stress 96h', type: 'PID', durationHours: 96, energyKwh: 192,
    params: { voltageStress: '-1000V', temperature: '85 C', humidity: '85%', duration: '96 hr' } },
];

const TYPE_COLORS: Record<string, string> = {
  TC: 'text-blue-400',
  HF: 'text-cyan-400',
  LETID: 'text-yellow-400',
  PID: 'text-red-400',
};

function generateGraphData(type: string, points: number): { x: number; y: number }[] {
  const data: { x: number; y: number }[] = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    let y = 0;
    switch (type) {
      case 'TC':
      case 'HF': {
        const cyclePos = (t * 4) % 1;
        if (cyclePos < 0.3) y = -40 + (125 * cyclePos / 0.3);
        else if (cyclePos < 0.5) y = 85;
        else if (cyclePos < 0.8) y = 85 - (125 * (cyclePos - 0.5) / 0.3);
        else y = -40;
        break;
      }
      case 'LETID': {
        if (t < 0.05) y = 2 * t / 0.05;
        else y = 2 * (1 - 0.001 * Math.sin(t * 50));
        break;
      }
      case 'PID': {
        if (t < 0.02) y = -1000 * t / 0.02;
        else y = -1000;
        break;
      }
    }
    data.push({ x: t * 100, y });
  }
  return data;
}

export default function Simulator() {
  const { toast } = useToast();
  const [selectedRecipe, setSelectedRecipe] = useState<SimRecipe>(SIM_RECIPES[0]);
  const [selectedChannels, setSelectedChannels] = useState<number[]>([1, 2, 3]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deployed, setDeployed] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const graphData = generateGraphData(selectedRecipe.type, 200);
  const yLabel = selectedRecipe.type === 'TC' || selectedRecipe.type === 'HF' ? 'Temperature (C)' :
    selectedRecipe.type === 'LETID' ? 'Current (A)' : 'Voltage (V)';

  const yMin = Math.min(...graphData.map(d => d.y));
  const yMax = Math.max(...graphData.map(d => d.y));
  const yRange = yMax - yMin || 1;

  const toggleChannel = (ch: number) => {
    setSelectedChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const startSimulation = useCallback(() => {
    setIsRunning(true);
    setProgress(0);
    toast('info', `Simulation started: ${selectedRecipe.name}`);
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRunning(false);
          toast('success', `Simulation complete: ${selectedRecipe.name}`);
          return 100;
        }
        return prev + 0.5;
      });
    }, 50);
  }, [selectedRecipe, toast]);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    toast('warning', 'Simulation stopped');
  }, [toast]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleDeploy = () => {
    setDeployed(true);
    toast('success', `Recipe "${selectedRecipe.name}" deployed to channels [${selectedChannels.join(', ')}]`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Test Simulator</h2>
        <p className="text-gray-400 text-sm">Simulate test recipes and preview execution profiles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Recipe Selection */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select Recipe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SIM_RECIPES.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => { setSelectedRecipe(recipe); setProgress(0); setIsRunning(false); setDeployed(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                  selectedRecipe.id === recipe.id
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
                }`}
              >
                <span className={`font-medium ${TYPE_COLORS[recipe.type]}`}>{recipe.name}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{recipe.type} - {recipe.durationHours}h</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Graph and Controls */}
        <div className="lg:col-span-3 space-y-4">
          {/* Timeline Graph */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{selectedRecipe.name} - Profile Graph</CardTitle>
                <Badge variant="outline" className={TYPE_COLORS[selectedRecipe.type]}>{selectedRecipe.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <svg viewBox="0 0 820 250" className="w-full" xmlns="http://www.w3.org/2000/svg">
                {/* Grid */}
                <rect x="60" y="10" width="740" height="200" fill="#0a0a1a" stroke="#1f2937" strokeWidth="1" />
                {[0, 1, 2, 3, 4].map(i => (
                  <g key={i}>
                    <line x1="60" y1={10 + i * 50} x2="800" y2={10 + i * 50} stroke="#1f2937" strokeWidth="0.5" />
                    <text x="55" y={15 + i * 50} textAnchor="end" fill="#6b7280" fontSize="9">
                      {(yMax - (yRange * i / 4)).toFixed(0)}
                    </text>
                  </g>
                ))}
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <g key={i}>
                    <line x1={60 + i * 148} y1="10" x2={60 + i * 148} y2="210" stroke="#1f2937" strokeWidth="0.5" />
                    <text x={60 + i * 148} y="225" textAnchor="middle" fill="#6b7280" fontSize="9">
                      {((selectedRecipe.durationHours * i) / 5).toFixed(0)}h
                    </text>
                  </g>
                ))}

                {/* Y-axis label */}
                <text x="15" y="110" textAnchor="middle" fill="#6b7280" fontSize="9" transform="rotate(-90, 15, 110)">{yLabel}</text>
                <text x="430" y="245" textAnchor="middle" fill="#6b7280" fontSize="9">Time</text>

                {/* Data line */}
                <polyline
                  fill="none"
                  stroke={selectedRecipe.type === 'TC' ? '#3b82f6' : selectedRecipe.type === 'HF' ? '#06b6d4' : selectedRecipe.type === 'LETID' ? '#eab308' : '#ef4444'}
                  strokeWidth="1.5"
                  points={graphData.map(d => {
                    const x = 60 + (d.x / 100) * 740;
                    const y = 10 + ((yMax - d.y) / yRange) * 200;
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Progress indicator */}
                {isRunning && progress > 0 && (
                  <line
                    x1={60 + (progress / 100) * 740}
                    y1="10"
                    x2={60 + (progress / 100) * 740}
                    y2="210"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />
                )}
              </svg>
            </CardContent>
          </Card>

          {/* Channel Selection & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Target Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(ch => (
                    <button
                      key={ch}
                      onClick={() => toggleChannel(ch)}
                      className={`px-2 py-2 rounded text-xs font-medium transition-colors ${
                        selectedChannels.includes(ch)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Ch{ch}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Estimated Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-semibold text-white">
                      {selectedRecipe.durationHours < 24
                        ? `${selectedRecipe.durationHours}h`
                        : `${Math.floor(selectedRecipe.durationHours / 24)}d ${selectedRecipe.durationHours % 24}h`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Energy</p>
                    <p className="font-semibold text-white">{(selectedRecipe.energyKwh * selectedChannels.length / 10).toFixed(0)} kWh</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Channels</p>
                    <p className="font-semibold text-white">{selectedChannels.length} of 10</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge variant={isRunning ? 'success' : progress >= 100 ? 'success' : 'secondary'} className="text-xs">
                      {isRunning ? 'Running' : progress >= 100 ? 'Complete' : 'Idle'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Simulation Progress</span>
                <span className="font-mono text-blue-400">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex gap-3">
                {!isRunning ? (
                  <Button size="sm" onClick={startSimulation} disabled={selectedChannels.length === 0}>
                    {progress >= 100 ? 'Restart Simulation' : 'Start Simulation'}
                  </Button>
                ) : (
                  <Button size="sm" variant="destructive" onClick={stopSimulation}>
                    Stop Simulation
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={deployed ? 'secondary' : 'outline'}
                  onClick={handleDeploy}
                  disabled={isRunning || selectedChannels.length === 0}
                >
                  {deployed ? 'Deployed' : 'Deploy to Hardware'}
                </Button>
              </div>
              {deployed && (
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-sm text-green-300">
                  Recipe &quot;{selectedRecipe.name}&quot; deployed to channels [{selectedChannels.join(', ')}].
                  Hardware will begin execution upon physical confirmation.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipe Parameters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recipe Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(selectedRecipe.params).map(([key, value]) => (
                  <div key={key} className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="font-mono text-sm text-white mt-1">{String(value)}</p>
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
