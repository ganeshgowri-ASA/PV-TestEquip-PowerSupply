'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Beaker,
  Thermometer,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sun,
  ShieldAlert,
} from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  standard: string;
  type: 'TC' | 'HF' | 'LETID' | 'PID';
  color: string;
  icon: React.ReactNode;
  cycles: number;
  rampRate: string;
  dwellTime: string;
  tempHigh: number;
  tempLow: number;
  currentInjection: string;
  voltage: string;
  description: string;
  chamberProfile: { time: number; temp: number }[];
  psProfile: { time: number; current: number; voltage: number }[];
}

const RECIPES: Recipe[] = [
  {
    id: 'tc',
    name: 'Thermal Cycling (TC)',
    standard: 'IEC 61215:2021 — MQT 11',
    type: 'TC',
    color: '#3b82f6',
    icon: <Thermometer className="h-5 w-5" />,
    cycles: 200,
    rampRate: '100 °C/hr max',
    dwellTime: '10 min at extremes',
    tempHigh: 85,
    tempLow: -40,
    currentInjection: 'Isc × 1.25 = 33.75A (forward bias)',
    voltage: '60V max (Voc)',
    description:
      'Bidirectional regenerative cycling between -40°C and +85°C with ABSI current injection per IEC 61215. 4-wire Kelvin sensing. 10 channels per rack.',
    chamberProfile: [
      { time: 0, temp: 25 },
      { time: 15, temp: -40 },
      { time: 25, temp: -40 },
      { time: 55, temp: 85 },
      { time: 65, temp: 85 },
      { time: 95, temp: -40 },
      { time: 105, temp: -40 },
      { time: 135, temp: 85 },
      { time: 145, temp: 85 },
      { time: 160, temp: 25 },
    ],
    psProfile: [
      { time: 0, current: 0, voltage: 0 },
      { time: 15, current: 0, voltage: 0 },
      { time: 25, current: 33.75, voltage: 55 },
      { time: 55, current: 33.75, voltage: 55 },
      { time: 65, current: 0, voltage: 0 },
      { time: 95, current: 33.75, voltage: 55 },
      { time: 105, current: 33.75, voltage: 55 },
      { time: 135, current: 0, voltage: 0 },
      { time: 145, current: 0, voltage: 0 },
      { time: 160, current: 0, voltage: 0 },
    ],
  },
  {
    id: 'hf',
    name: 'Humidity Freeze (HF)',
    standard: 'IEC 61215:2021 — MQT 12',
    type: 'HF',
    color: '#06b6d4',
    icon: <RotateCcw className="h-5 w-5" />,
    cycles: 10,
    rampRate: '100 °C/hr max',
    dwellTime: '20 hr at 85°C/85%RH',
    tempHigh: 85,
    tempLow: -40,
    currentInjection: 'Isc × 1.25 = 33.75A',
    voltage: '60V max (Voc)',
    description:
      'Combined humidity and freeze cycling. 20h dwell at 85°C/85%RH followed by ramp to -40°C. Regenerative power supply returns energy to grid during discharge.',
    chamberProfile: [
      { time: 0, temp: 25 },
      { time: 5, temp: 85 },
      { time: 25, temp: 85 },
      { time: 35, temp: -40 },
      { time: 40, temp: -40 },
      { time: 50, temp: 85 },
      { time: 70, temp: 85 },
      { time: 80, temp: -40 },
      { time: 85, temp: -40 },
      { time: 95, temp: 25 },
    ],
    psProfile: [
      { time: 0, current: 0, voltage: 0 },
      { time: 5, current: 33.75, voltage: 55 },
      { time: 25, current: 33.75, voltage: 55 },
      { time: 35, current: 0, voltage: 0 },
      { time: 40, current: 0, voltage: 0 },
      { time: 50, current: 33.75, voltage: 55 },
      { time: 70, current: 33.75, voltage: 55 },
      { time: 80, current: 0, voltage: 0 },
      { time: 85, current: 0, voltage: 0 },
      { time: 95, current: 0, voltage: 0 },
    ],
  },
  {
    id: 'letid',
    name: 'LETID Sensitivity',
    standard: 'PVEL Protocol + IEC 61215',
    type: 'LETID',
    color: '#f59e0b',
    icon: <Sun className="h-5 w-5" />,
    cycles: 1,
    rampRate: '5 °C/min',
    dwellTime: '162 hr at 75°C',
    tempHigh: 75,
    tempLow: 25,
    currentInjection: 'Isc × 1.0 = 27A (precision)',
    voltage: '60V / 2A precision',
    description:
      'Light & elevated temperature induced degradation test. Precision 60V/2A supply with ±0.1% regulation. Continuous current injection at Isc for 162 hours at 75°C.',
    chamberProfile: [
      { time: 0, temp: 25 },
      { time: 10, temp: 75 },
      { time: 90, temp: 75 },
      { time: 130, temp: 75 },
      { time: 170, temp: 75 },
      { time: 180, temp: 25 },
    ],
    psProfile: [
      { time: 0, current: 0, voltage: 0 },
      { time: 10, current: 27, voltage: 55 },
      { time: 90, current: 27, voltage: 55 },
      { time: 130, current: 27, voltage: 55 },
      { time: 170, current: 27, voltage: 55 },
      { time: 180, current: 0, voltage: 0 },
    ],
  },
  {
    id: 'pid',
    name: 'PID (Potential Induced Degradation)',
    standard: 'IEC TS 62804-1:2025',
    type: 'PID',
    color: '#ef4444',
    icon: <ShieldAlert className="h-5 w-5" />,
    cycles: 1,
    rampRate: '5 °C/min',
    dwellTime: '96 hr at 85°C/85%RH',
    tempHigh: 85,
    tempLow: 25,
    currentInjection: 'nA to mA leakage monitoring',
    voltage: '±4000V DC (system voltage)',
    description:
      'High-voltage stress test at ±4000V DC with nA-mA leakage current monitoring. Safety interlock trips at 5mA. 85°C/85%RH damp heat conditions for 96 hours.',
    chamberProfile: [
      { time: 0, temp: 25 },
      { time: 10, temp: 85 },
      { time: 50, temp: 85 },
      { time: 100, temp: 85 },
      { time: 110, temp: 25 },
    ],
    psProfile: [
      { time: 0, current: 0, voltage: 0 },
      { time: 10, current: 0.001, voltage: 4000 },
      { time: 50, current: 0.002, voltage: 4000 },
      { time: 100, current: 0.003, voltage: 4000 },
      { time: 110, current: 0, voltage: 0 },
    ],
  },
];

export default function RecipesPage() {
  const [expandedId, setExpandedId] = useState<string>('tc');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Test Recipes</h2>
          <p className="text-sm text-gray-500">
            IEC 61215:2021 / IEC TS 62804-1:2025 / PVEL LETID Protocol
          </p>
        </div>
        <div className="text-xs text-gray-500">
          Target: HJT Bifacial — Voc 60V, Isc 27A, Pmax 1100W
        </div>
      </div>

      {/* Recipe Cards */}
      <div className="space-y-4">
        {RECIPES.map((recipe) => {
          const isExpanded = expandedId === recipe.id;
          return (
            <div
              key={recipe.id}
              className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden transition-all"
            >
              {/* Card Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? '' : recipe.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-800/30 transition-colors text-left"
              >
                <div
                  className="p-2.5 rounded-lg"
                  style={{ backgroundColor: `${recipe.color}20`, color: recipe.color }}
                >
                  {recipe.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{recipe.name}</h3>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${recipe.color}20`,
                        color: recipe.color,
                      }}
                    >
                      {recipe.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{recipe.standard}</p>
                </div>

                {/* Quick Stats */}
                <div className="hidden sm:flex items-center gap-6 text-xs text-gray-400">
                  <div className="text-center">
                    <p className="text-white font-medium">{recipe.cycles}</p>
                    <p>cycles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium">
                      {recipe.tempLow}°C / {recipe.tempHigh}°C
                    </p>
                    <p>temp range</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium">{recipe.dwellTime}</p>
                    <p>dwell</p>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-800 p-4 space-y-4">
                  {/* Description */}
                  <p className="text-sm text-gray-400">{recipe.description}</p>

                  {/* Parameters Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <ParamCard
                      icon={<RotateCcw className="h-3.5 w-3.5" />}
                      label="Cycles"
                      value={recipe.cycles.toString()}
                    />
                    <ParamCard
                      icon={<Thermometer className="h-3.5 w-3.5" />}
                      label="Ramp Rate"
                      value={recipe.rampRate}
                    />
                    <ParamCard
                      icon={<Clock className="h-3.5 w-3.5" />}
                      label="Dwell Time"
                      value={recipe.dwellTime}
                    />
                    <ParamCard
                      icon={<Thermometer className="h-3.5 w-3.5" />}
                      label="Temp High"
                      value={`${recipe.tempHigh}°C`}
                    />
                    <ParamCard
                      icon={<Zap className="h-3.5 w-3.5" />}
                      label="Current Injection"
                      value={recipe.currentInjection}
                    />
                    <ParamCard
                      icon={<Zap className="h-3.5 w-3.5" />}
                      label="Voltage"
                      value={recipe.voltage}
                    />
                  </div>

                  {/* Synchronized Timing Diagram */}
                  <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                      <Beaker className="h-4 w-4" style={{ color: recipe.color }} />
                      Synchronized Chamber + Power Supply Timing Diagram
                    </h4>

                    {/* Chamber Temperature Profile */}
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-2">Chamber Temperature Profile</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart
                          data={recipe.chamberProfile}
                          syncId={`recipe-${recipe.id}`}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis
                            dataKey="time"
                            stroke="#6b7280"
                            fontSize={10}
                            label={{ value: 'Time (min)', position: 'insideBottom', offset: -5, style: { fill: '#6b7280', fontSize: 10 } }}
                          />
                          <YAxis
                            stroke="#6b7280"
                            fontSize={10}
                            label={{ value: '°C', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 10 } }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#111827',
                              border: '1px solid #374151',
                              borderRadius: 8,
                            }}
                            formatter={(value: number) => [`${value}°C`, 'Temperature']}
                          />
                          <ReferenceLine y={0} stroke="#374151" strokeDasharray="3 3" />
                          <Line
                            type="linear"
                            dataKey="temp"
                            stroke={recipe.color}
                            strokeWidth={2}
                            dot={{ r: 3, fill: recipe.color }}
                            name="Temperature"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Power Supply Profile */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Power Supply Output</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart
                          data={recipe.psProfile}
                          syncId={`recipe-${recipe.id}`}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis
                            dataKey="time"
                            stroke="#6b7280"
                            fontSize={10}
                            label={{ value: 'Time (min)', position: 'insideBottom', offset: -5, style: { fill: '#6b7280', fontSize: 10 } }}
                          />
                          <YAxis
                            yAxisId="current"
                            stroke="#f59e0b"
                            fontSize={10}
                            label={{ value: 'A', angle: -90, position: 'insideLeft', style: { fill: '#f59e0b', fontSize: 10 } }}
                          />
                          <YAxis
                            yAxisId="voltage"
                            orientation="right"
                            stroke="#10b981"
                            fontSize={10}
                            label={{ value: 'V', angle: 90, position: 'insideRight', style: { fill: '#10b981', fontSize: 10 } }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#111827',
                              border: '1px solid #374151',
                              borderRadius: 8,
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Line
                            yAxisId="current"
                            type="stepAfter"
                            dataKey="current"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            name="Current (A)"
                          />
                          <Line
                            yAxisId="voltage"
                            type="stepAfter"
                            dataKey="voltage"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            name="Voltage (V)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ParamCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-md p-2.5">
      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs text-white font-medium">{value}</p>
    </div>
  );
}
