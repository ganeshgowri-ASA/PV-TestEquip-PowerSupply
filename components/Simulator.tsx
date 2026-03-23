'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

type TestType = 'TC' | 'HF' | 'LETID' | 'PID';

interface SimRecipe {
  id: string;
  name: string;
  type: TestType;
  standard: string;
  tempMin: number;
  tempMax: number;
  rampRate: number;
  dwellTime: number;
  cycles: number;
  humidity: number | null;
  voltage: number | null;
  currentMax: number;
  duration: string;
}

const RECIPES: SimRecipe[] = [
  {
    id: 'tc200', name: 'TC 200 Cycles', type: 'TC', standard: 'IEC 61215:2021 MQT 11',
    tempMin: -40, tempMax: 85, rampRate: 1.67, dwellTime: 15, cycles: 200,
    humidity: null, voltage: null, currentMax: 30, duration: '~700 hr',
  },
  {
    id: 'tc400', name: 'TC 400 Extended', type: 'TC', standard: 'IEC 61215:2021 MQT 11',
    tempMin: -40, tempMax: 85, rampRate: 1.67, dwellTime: 15, cycles: 400,
    humidity: null, voltage: null, currentMax: 30, duration: '~1400 hr',
  },
  {
    id: 'hf10', name: 'HF 10 Cycles', type: 'HF', standard: 'IEC 61215:2021 MQT 12',
    tempMin: -40, tempMax: 85, rampRate: 1.67, dwellTime: 20, cycles: 10,
    humidity: 85, voltage: null, currentMax: 30, duration: '~450 hr',
  },
  {
    id: 'letid-pvel', name: 'LETID PVEL Protocol', type: 'LETID', standard: 'PVEL LETID Sensitivity',
    tempMin: 25, tempMax: 75, rampRate: 2.0, dwellTime: 162, cycles: 1,
    humidity: null, voltage: null, currentMax: 2, duration: '162 hr',
  },
  {
    id: 'letid-iec', name: 'LETID IEC 61215 MQT 19', type: 'LETID', standard: 'IEC 61215:2021 MQT 19',
    tempMin: 25, tempMax: 75, rampRate: 2.0, dwellTime: 96, cycles: 1,
    humidity: null, voltage: null, currentMax: 2, duration: '96 hr',
  },
  {
    id: 'pid-neg', name: 'PID Stress -1000V', type: 'PID', standard: 'IEC TS 62804-1:2025',
    tempMin: 25, tempMax: 85, rampRate: 2.0, dwellTime: 96, cycles: 1,
    humidity: 85, voltage: -1000, currentMax: 0.005, duration: '96 hr',
  },
  {
    id: 'pid-pos', name: 'PID Recovery +1000V', type: 'PID', standard: 'IEC TS 62804-1:2025',
    tempMin: 25, tempMax: 85, rampRate: 2.0, dwellTime: 48, cycles: 1,
    humidity: 85, voltage: 1000, currentMax: 0.005, duration: '48 hr',
  },
  {
    id: 'pid-4kv', name: 'PID Extreme -4000V', type: 'PID', standard: 'IEC TS 62804-1:2025',
    tempMin: 25, tempMax: 85, rampRate: 2.0, dwellTime: 96, cycles: 1,
    humidity: 85, voltage: -4000, currentMax: 0.005, duration: '96 hr',
  },
];

const TYPE_COLORS: Record<TestType, string> = {
  TC: 'text-blue-400',
  HF: 'text-cyan-400',
  LETID: 'text-yellow-400',
  PID: 'text-red-400',
};

const TYPE_BG: Record<TestType, string> = {
  TC: 'bg-blue-500',
  HF: 'bg-cyan-500',
  LETID: 'bg-yellow-500',
  PID: 'bg-red-500',
};

// Generate profile data points for the animated chart
function generateProfileData(recipe: SimRecipe): { time: number; temp: number; current: number }[] {
  const points: { time: number; temp: number; current: number }[] = [];
  const deltaT = recipe.tempMax - recipe.tempMin;
  const rampTime = deltaT / recipe.rampRate;
  const cycleMins = 2 * rampTime + 2 * recipe.dwellTime;
  const displayCycles = Math.min(recipe.cycles, recipe.type === 'TC' || recipe.type === 'HF' ? 3 : 1);

  if (recipe.type === 'LETID') {
    // Ramp up then hold
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const totalMins = recipe.dwellTime * 60;
      const rampMins = (recipe.tempMax - recipe.tempMin) / recipe.rampRate;
      if (frac * totalMins <= rampMins) {
        const t = recipe.tempMin + (frac * totalMins / rampMins) * (recipe.tempMax - recipe.tempMin);
        points.push({ time: frac * 100, temp: t, current: frac * totalMins > rampMins * 0.5 ? recipe.currentMax * 0.5 : 0 });
      } else {
        points.push({ time: frac * 100, temp: recipe.tempMax, current: recipe.currentMax });
      }
    }
    return points;
  }

  if (recipe.type === 'PID') {
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const rampMins = (recipe.tempMax - recipe.tempMin) / recipe.rampRate;
      const totalMins = recipe.dwellTime * 60;
      if (frac * totalMins <= rampMins) {
        points.push({ time: frac * 100, temp: recipe.tempMin + frac * totalMins / rampMins * (recipe.tempMax - recipe.tempMin), current: 0 });
      } else {
        // Random leakage current in nA-uA range
        const leak = (Math.sin(frac * 20) * 0.3 + 0.5) * recipe.currentMax;
        points.push({ time: frac * 100, temp: recipe.tempMax, current: leak });
      }
    }
    return points;
  }

  // TC/HF: show cyclic profile
  const stepsPerCycle = 40;
  for (let c = 0; c < displayCycles; c++) {
    for (let s = 0; s <= stepsPerCycle; s++) {
      const frac = s / stepsPerCycle;
      const baseTime = (c * cycleMins) + frac * cycleMins;
      const totalTime = displayCycles * cycleMins;
      let temp: number;
      let current: number;

      if (frac < 0.25) {
        // Cold dwell
        temp = recipe.tempMin;
        current = 0;
      } else if (frac < 0.5) {
        // Ramp up
        const rf = (frac - 0.25) / 0.25;
        temp = recipe.tempMin + rf * deltaT;
        current = rf * recipe.currentMax;
      } else if (frac < 0.75) {
        // Hot dwell
        temp = recipe.tempMax;
        current = recipe.currentMax;
      } else {
        // Ramp down
        const rf = (frac - 0.75) / 0.25;
        temp = recipe.tempMax - rf * deltaT;
        current = recipe.currentMax * (1 - rf);
      }

      points.push({ time: (baseTime / totalTime) * 100, temp, current });
    }
  }
  return points;
}

// Animated profile chart component using SVG
function ProfileChart({ recipe, progress }: { recipe: SimRecipe; progress: number }) {
  const data = generateProfileData(recipe);
  const width = 700;
  const height = 280;
  const pad = { top: 20, right: 60, bottom: 30, left: 50 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const tempMin = Math.min(recipe.tempMin, 0) - 10;
  const tempMax = recipe.tempMax + 10;
  const tempRange = tempMax - tempMin;

  const scaleX = (t: number) => pad.left + (t / 100) * chartW;
  const scaleY = (temp: number) => pad.top + chartH - ((temp - tempMin) / tempRange) * chartH;

  const visibleData = data.filter((d) => d.time <= progress);

  const tempPath = visibleData.map((d, i) =>
    `${i === 0 ? 'M' : 'L'} ${scaleX(d.time).toFixed(1)} ${scaleY(d.temp).toFixed(1)}`
  ).join(' ');

  const currentMax = recipe.currentMax || 1;
  const currentPath = visibleData.map((d, i) => {
    const y = pad.top + chartH - (d.current / currentMax) * chartH;
    return `${i === 0 ? 'M' : 'L'} ${scaleX(d.time).toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  // Grid lines
  const gridTemps = [];
  for (let t = Math.ceil(tempMin / 20) * 20; t <= tempMax; t += 20) {
    gridTemps.push(t);
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Grid */}
      {gridTemps.map((t) => (
        <g key={t}>
          <line x1={pad.left} y1={scaleY(t)} x2={width - pad.right} y2={scaleY(t)}
            stroke="#374151" strokeWidth="0.5" strokeDasharray="4 4" />
          <text x={pad.left - 5} y={scaleY(t) + 3} textAnchor="end"
            fill="#6B7280" fontSize="10">{t}°C</text>
        </g>
      ))}

      {/* Axes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="#4B5563" strokeWidth="1" />
      <line x1={pad.left} y1={pad.top + chartH} x2={width - pad.right} y2={pad.top + chartH} stroke="#4B5563" strokeWidth="1" />

      {/* 0°C reference line */}
      {tempMin < 0 && tempMax > 0 && (
        <line x1={pad.left} y1={scaleY(0)} x2={width - pad.right} y2={scaleY(0)}
          stroke="#6B7280" strokeWidth="1" strokeDasharray="2 2" />
      )}

      {/* Temperature trace */}
      {tempPath && <path d={tempPath} fill="none" stroke="#3B82F6" strokeWidth="2" />}

      {/* Current trace */}
      {currentPath && <path d={currentPath} fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.7" />}

      {/* Progress indicator */}
      {progress < 100 && (
        <line x1={scaleX(progress)} y1={pad.top} x2={scaleX(progress)} y2={pad.top + chartH}
          stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </line>
      )}

      {/* Legend */}
      <rect x={width - pad.right - 10} y={pad.top} width="8" height="8" fill="#3B82F6" rx="1" />
      <text x={width - pad.right + 2} y={pad.top + 7} fill="#93C5FD" fontSize="9">Temp</text>
      <rect x={width - pad.right - 10} y={pad.top + 14} width="8" height="8" fill="#F59E0B" rx="1" />
      <text x={width - pad.right + 2} y={pad.top + 21} fill="#FCD34D" fontSize="9">Current</text>

      {/* Time axis label */}
      <text x={pad.left + chartW / 2} y={height - 5} textAnchor="middle" fill="#6B7280" fontSize="10">
        Time ({recipe.type === 'TC' || recipe.type === 'HF' ? `${Math.min(recipe.cycles, 3)} cycles shown` : recipe.duration})
      </text>

      {/* Right axis label for current */}
      <text x={width - 5} y={pad.top + chartH / 2} textAnchor="middle" fill="#FCD34D" fontSize="9"
        transform={`rotate(-90, ${width - 5}, ${pad.top + chartH / 2})`}>
        {recipe.currentMax >= 1 ? `0–${recipe.currentMax}A` : `0–${recipe.currentMax * 1000}mA`}
      </text>
    </svg>
  );
}

type SimState = 'idle' | 'running' | 'paused' | 'complete' | 'deployed';

export default function Simulator() {
  const { addToast } = useToast();
  const [selectedRecipe, setSelectedRecipe] = useState<SimRecipe>(RECIPES[0]);
  const [simState, setSimState] = useState<SimState>('idle');
  const [progress, setProgress] = useState(0);
  const [filterType, setFilterType] = useState<TestType | 'All'>('All');
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredRecipes = filterType === 'All' ? RECIPES : RECIPES.filter((r) => r.type === filterType);

  const startSimulation = useCallback(() => {
    setSimState('running');
    setProgress(0);
    addToast({ title: 'Simulation Started', description: `Running ${selectedRecipe.name}`, variant: 'success' });
  }, [selectedRecipe, addToast]);

  const pauseSimulation = useCallback(() => {
    setSimState('paused');
    addToast({ title: 'Simulation Paused', variant: 'warning' });
  }, [addToast]);

  const resumeSimulation = useCallback(() => {
    setSimState('running');
    addToast({ title: 'Simulation Resumed', variant: 'default' });
  }, [addToast]);

  const resetSimulation = useCallback(() => {
    setSimState('idle');
    setProgress(0);
    if (animRef.current) clearInterval(animRef.current);
  }, []);

  const deployToHardware = useCallback(() => {
    setSimState('deployed');
    addToast({
      title: 'Deployed to Hardware',
      description: `${selectedRecipe.name} recipe sent via Modbus RTU/TCP to rack controller`,
      variant: 'success',
      duration: 5000,
    });
  }, [selectedRecipe, addToast]);

  useEffect(() => {
    if (simState === 'running') {
      animRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setSimState('complete');
            addToast({ title: 'Simulation Complete', description: `${selectedRecipe.name} finished`, variant: 'success' });
            return 100;
          }
          return p + 0.5;
        });
      }, 50);
    } else {
      if (animRef.current) clearInterval(animRef.current);
    }
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [simState, selectedRecipe, addToast]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Test Profile Simulator</h2>
        <p className="text-gray-400 text-sm">Select a recipe, preview animated thermal/electrical profiles, and deploy to hardware</p>
      </div>

      {/* Recipe filter */}
      <div className="flex gap-2 flex-wrap">
        {(['All', 'TC', 'HF', 'LETID', 'PID'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterType === t
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe list */}
        <div className="space-y-2 lg:col-span-1">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Available Recipes</h3>
          {filteredRecipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => { setSelectedRecipe(recipe); resetSimulation(); }}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedRecipe.id === recipe.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${TYPE_COLORS[recipe.type]}`}>{recipe.name}</span>
                <Badge variant="outline" className="text-xs">{recipe.type}</Badge>
              </div>
              <p className="text-xs text-gray-500">{recipe.standard}</p>
              <div className="flex gap-3 mt-1 text-xs text-gray-500">
                <span>{recipe.tempMin}°C to {recipe.tempMax}°C</span>
                <span>{recipe.duration}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Chart & controls */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-base ${TYPE_COLORS[selectedRecipe.type]}`}>
                  {selectedRecipe.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={simState === 'running' ? 'success' : simState === 'complete' ? 'success' : simState === 'deployed' ? 'success' : 'secondary'}>
                    {simState === 'idle' ? 'Ready' : simState === 'running' ? 'Simulating...' : simState === 'paused' ? 'Paused' : simState === 'complete' ? 'Complete' : 'Deployed'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                <ProfileChart recipe={selectedRecipe} progress={simState === 'idle' ? 100 : progress} />
              </div>

              {/* Progress bar */}
              {simState !== 'idle' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        simState === 'complete' || simState === 'deployed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipe parameters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Recipe Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Temperature Range</p>
                  <p className="text-sm font-mono text-gray-200">{selectedRecipe.tempMin}°C to {selectedRecipe.tempMax}°C</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ramp Rate</p>
                  <p className="text-sm font-mono text-gray-200">{selectedRecipe.rampRate} °C/min</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dwell Time</p>
                  <p className="text-sm font-mono text-gray-200">{selectedRecipe.dwellTime} {selectedRecipe.dwellTime > 60 ? 'hr' : 'min'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cycles</p>
                  <p className="text-sm font-mono text-gray-200">{selectedRecipe.cycles}</p>
                </div>
                {selectedRecipe.humidity !== null && (
                  <div>
                    <p className="text-xs text-gray-500">Humidity</p>
                    <p className="text-sm font-mono text-gray-200">{selectedRecipe.humidity}% RH</p>
                  </div>
                )}
                {selectedRecipe.voltage !== null && (
                  <div>
                    <p className="text-xs text-gray-500">Voltage Stress</p>
                    <p className="text-sm font-mono text-gray-200">{selectedRecipe.voltage}V</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Max Current</p>
                  <p className="text-sm font-mono text-gray-200">
                    {selectedRecipe.currentMax >= 1 ? `${selectedRecipe.currentMax}A` : `${selectedRecipe.currentMax * 1000}mA`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estimated Duration</p>
                  <p className="text-sm font-mono text-gray-200">{selectedRecipe.duration}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Control buttons */}
          <div className="flex gap-3 flex-wrap">
            {simState === 'idle' && (
              <Button onClick={startSimulation}>Start Simulation</Button>
            )}
            {simState === 'running' && (
              <Button variant="outline" onClick={pauseSimulation}>Pause</Button>
            )}
            {simState === 'paused' && (
              <>
                <Button onClick={resumeSimulation}>Resume</Button>
                <Button variant="destructive" onClick={resetSimulation}>Reset</Button>
              </>
            )}
            {(simState === 'complete') && (
              <>
                <Button onClick={deployToHardware} className="bg-green-700 hover:bg-green-600 text-white">
                  Deploy to Hardware
                </Button>
                <Button variant="outline" onClick={resetSimulation}>New Simulation</Button>
              </>
            )}
            {simState === 'deployed' && (
              <>
                <Badge variant="success" className="px-4 py-2 text-sm">Deployed via Modbus RTU/TCP</Badge>
                <Button variant="outline" onClick={resetSimulation}>New Simulation</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
