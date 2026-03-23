'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SAMPLE_RECIPES = [
  {
    id: 'r1',
    name: 'TC 200 Cycles — IEC 61215',
    type: 'TC',
    standard: 'IEC 61215:2021',
    params: { tempMin: -40, tempMax: 85, cycles: 200, rampRate: 3 },
    ps: 'TC_HF_BIDIRECTIONAL',
  },
  {
    id: 'r2',
    name: 'HF 10 Cycles — IEC 61215',
    type: 'HF',
    standard: 'IEC 61215:2021',
    params: { tempMin: -40, tempMax: 85, cycles: 10, humidity: 85 },
    ps: 'TC_HF_BIDIRECTIONAL',
  },
  {
    id: 'r3',
    name: 'LETID Sensitivity — PVEL Protocol',
    type: 'LETID',
    standard: 'PVEL LETID',
    params: { irradiance: 1000, cellTemp: 75, currentFraction: 0.5, duration: 96 },
    ps: 'LETID_PRECISION',
  },
  {
    id: 'r4',
    name: 'PID Stress — IEC 62804 Condition A',
    type: 'PID',
    standard: 'IEC TS 62804-1:2025',
    params: { voltageStress: -1000, humidity: 85, temperature: 85 },
    ps: 'PID_HIGH_VOLTAGE',
  },
];

const TYPE_COLORS: Record<string, string> = {
  TC: 'text-blue-400',
  HF: 'text-cyan-400',
  LETID: 'text-yellow-400',
  PID: 'text-red-400',
};

export default function RecipeManager() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Test Recipe Manager</h2>
          <p className="text-gray-400 text-sm">TC / HF / LETID / PID test recipes — IEC 61215:2021 | IEC TS 62804-1:2025</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAMPLE_RECIPES.map((recipe) => (
          <Card key={recipe.id} className="hover:border-blue-700 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className={`text-sm ${TYPE_COLORS[recipe.type]}`}>
                  {recipe.name}
                </CardTitle>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {recipe.type}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">{recipe.standard}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(recipe.params).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-gray-300 font-mono">{String(v)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-gray-600">
        Full recipe builder with export (PDF/JSON) will be implemented in Session 4 (Configurator).
      </p>
    </div>
  );
}
