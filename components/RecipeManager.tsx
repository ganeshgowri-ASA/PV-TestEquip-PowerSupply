'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/Toast';

type TestType = 'TC' | 'HF' | 'LETID' | 'PID';

interface Recipe {
  id: string;
  name: string;
  type: TestType;
  standard: string;
  params: Record<string, number>;
  ps: string;
  calibration: {
    tempOffset: number;
    humidityOffset: number;
    voltageCalFactor: number;
    currentShuntResistance: number;
  };
  moduleSettings: {
    moduleType: 'monofacial' | 'bifacial';
    currentMode: 'isc-based' | 'fixed';
    fixedCurrent: number;
  };
}

const DEFAULT_CALIBRATION = {
  tempOffset: 0, humidityOffset: 0, voltageCalFactor: 1.0, currentShuntResistance: 0.01,
};

const DEFAULT_MODULE_SETTINGS = {
  moduleType: 'bifacial' as const, currentMode: 'isc-based' as const, fixedCurrent: 0,
};

const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'r1', name: 'TC 200 Cycles - IEC 61215', type: 'TC', standard: 'IEC 61215:2021',
    params: { tempMin: -40, tempMax: 85, cycles: 200, rampRate: 1.67, dwellTime: 15 },
    ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  {
    id: 'r2', name: 'TC 400 Extended', type: 'TC', standard: 'IEC 61215:2021',
    params: { tempMin: -40, tempMax: 85, cycles: 400, rampRate: 1.67, dwellTime: 15 },
    ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  {
    id: 'r3', name: 'HF 10 Cycles - IEC 61215', type: 'HF', standard: 'IEC 61215:2021',
    params: { tempMin: -40, tempMax: 85, cycles: 10, humidity: 85, dwellTime: 1200 },
    ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  {
    id: 'r4', name: 'LETID Sensitivity - PVEL', type: 'LETID', standard: 'PVEL LETID Protocol',
    params: { irradiance: 1000, cellTemp: 75, currentFraction: 0.5, duration: 162 },
    ps: 'LETID_PRECISION', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  {
    id: 'r5', name: 'LETID IEC 61215 MQT19', type: 'LETID', standard: 'IEC 61215:2021',
    params: { irradiance: 1000, cellTemp: 75, currentFraction: 0.075, duration: 162 },
    ps: 'LETID_PRECISION', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { moduleType: 'bifacial', currentMode: 'isc-based', fixedCurrent: 0 },
  },
  {
    id: 'r6', name: 'PID Condition A - IEC 62804', type: 'PID', standard: 'IEC TS 62804-1:2025',
    params: { voltageStress: -1000, humidity: 85, temperature: 85, duration: 96 },
    ps: 'PID_HIGH_VOLTAGE', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  {
    id: 'r7', name: 'PID Condition B +4000V', type: 'PID', standard: 'IEC TS 62804-1:2025',
    params: { voltageStress: 4000, humidity: 85, temperature: 85, duration: 96 },
    ps: 'PID_HIGH_VOLTAGE', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
];

const TYPE_COLORS: Record<string, string> = {
  TC: 'text-blue-400', HF: 'text-cyan-400', LETID: 'text-yellow-400', PID: 'text-red-400',
};

const PARAM_LABELS: Record<string, string> = {
  tempMin: 'Min Temp (\u00B0C)', tempMax: 'Max Temp (\u00B0C)', cycles: 'Cycles', rampRate: 'Ramp Rate (\u00B0C/min)',
  dwellTime: 'Dwell Time (min)', humidity: 'Humidity (%RH)', irradiance: 'Irradiance (W/m\u00B2)',
  cellTemp: 'Cell Temp (\u00B0C)', currentFraction: 'Current Fraction (Isc)', duration: 'Duration (hr)',
  voltageStress: 'Voltage Stress (V)', temperature: 'Temperature (\u00B0C)',
};

export default function RecipeManager() {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [rampInput, setRampInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (recipe: Recipe) => {
    setEditingId(recipe.id);
    setEditRecipe({ ...recipe, params: { ...recipe.params }, calibration: { ...recipe.calibration }, moduleSettings: { ...recipe.moduleSettings } });
  };

  const handleSave = () => {
    if (!editRecipe) return;
    if (!editRecipe.name.trim()) {
      toast('error', 'Recipe name is required');
      return;
    }
    setRecipes(prev => prev.map(r => r.id === editRecipe.id ? editRecipe : r));
    setEditingId(null);
    setEditRecipe(null);
    toast('success', `Recipe "${editRecipe.name}" saved`);
  };

  const handleDelete = (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    setRecipes(prev => prev.filter(r => r.id !== id));
    toast('info', `Recipe "${recipe?.name}" deleted`);
  };

  const handleClone = (recipe: Recipe) => {
    const cloned: Recipe = {
      ...recipe,
      id: `r${Date.now()}`,
      name: `${recipe.name} (Copy)`,
      params: { ...recipe.params },
      calibration: { ...recipe.calibration },
      moduleSettings: { ...recipe.moduleSettings },
    };
    setRecipes(prev => [...prev, cloned]);
    toast('success', `Recipe cloned: ${cloned.name}`);
  };

  const handleCreate = () => {
    const newRecipe: Recipe = {
      id: `r${Date.now()}`,
      name: 'New Recipe',
      type: 'TC',
      standard: 'IEC 61215:2021',
      params: { tempMin: -40, tempMax: 85, cycles: 200, rampRate: 1.67, dwellTime: 15 },
      ps: 'TC_HF_BIDIRECTIONAL',
      calibration: { ...DEFAULT_CALIBRATION },
      moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
    };
    setRecipes(prev => [...prev, newRecipe]);
    handleEdit(newRecipe);
    toast('info', 'New recipe created - edit parameters below');
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(recipes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pv-test-recipes.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Recipes exported as JSON');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (Array.isArray(imported)) {
          setRecipes(prev => [...prev, ...imported.map((r: Recipe) => ({ ...r, id: `r${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }))]);
          toast('success', `Imported ${imported.length} recipes`);
        } else {
          toast('error', 'Invalid JSON format - expected array of recipes');
        }
      } catch {
        toast('error', 'Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const calculateRampTime = () => {
    const rate = parseFloat(rampInput);
    if (!rate || rate <= 0) {
      toast('error', 'Enter a valid ramp rate in \u00B0C/min');
      return;
    }
    const deltaT = 125; // -40 to 85
    const timeMin = deltaT / rate;
    toast('info', `Ramp time for ${deltaT}\u00B0C at ${rate}\u00B0C/min = ${timeMin.toFixed(1)} min (${(timeMin / 60).toFixed(2)} hr)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Test Recipe Manager</h2>
          <p className="text-gray-400 text-sm">Full CRUD - TC / HF / LETID / PID recipes</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleCreate}>+ New Recipe</Button>
          <Button size="sm" variant="outline" onClick={handleExportJSON}>Export JSON</Button>
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Import JSON</Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
        </div>
      </div>

      {/* Ramp Rate Calculator */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Ramp Rate Calculator (\u00B0C/min)</label>
              <Input type="number" placeholder="e.g. 1.67" value={rampInput} onChange={(e) => setRampInput(e.target.value)} />
            </div>
            <Button size="sm" onClick={calculateRampTime}>Calculate Time</Button>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map((recipe) => {
          const isEditing = editingId === recipe.id && editRecipe;

          return (
            <Card key={recipe.id} className={`transition-colors ${isEditing ? 'border-blue-500' : 'hover:border-blue-700'}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  {isEditing ? (
                    <Input
                      value={editRecipe!.name}
                      onChange={(e) => setEditRecipe({ ...editRecipe!, name: e.target.value })}
                      className="text-sm"
                    />
                  ) : (
                    <CardTitle className={`text-sm ${TYPE_COLORS[recipe.type]}`}>{recipe.name}</CardTitle>
                  )}
                  <Badge variant="outline" className="shrink-0 text-xs">{recipe.type}</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {isEditing ? (
                    <select
                      value={editRecipe!.type}
                      onChange={(e) => setEditRecipe({ ...editRecipe!, type: e.target.value as TestType })}
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-xs text-white"
                    >
                      {['TC', 'HF', 'LETID', 'PID'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : recipe.standard}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(recipe.params).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-gray-500">{PARAM_LABELS[k] || k}</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editRecipe!.params[k]}
                          onChange={(e) => setEditRecipe({
                            ...editRecipe!,
                            params: { ...editRecipe!.params, [k]: parseFloat(e.target.value) || 0 },
                          })}
                          className="w-20 h-6 text-xs"
                        />
                      ) : (
                        <span className="text-gray-300 font-mono">{String(v)}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Module Settings */}
                {isEditing && (
                  <div className="border-t border-gray-700 pt-2 space-y-2">
                    <p className="text-xs text-gray-400 font-medium">Module Settings</p>
                    <div className="flex gap-2">
                      {(['monofacial', 'bifacial'] as const).map(t => (
                        <button key={t} onClick={() => setEditRecipe({ ...editRecipe!, moduleSettings: { ...editRecipe!.moduleSettings, moduleType: t } })}
                          className={`px-2 py-1 rounded text-xs ${editRecipe!.moduleSettings.moduleType === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                        >{t}</button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {(['isc-based', 'fixed'] as const).map(t => (
                        <button key={t} onClick={() => setEditRecipe({ ...editRecipe!, moduleSettings: { ...editRecipe!.moduleSettings, currentMode: t } })}
                          className={`px-2 py-1 rounded text-xs ${editRecipe!.moduleSettings.currentMode === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                        >{t === 'isc-based' ? 'Isc-based' : 'Fixed Current'}</button>
                      ))}
                    </div>
                    {editRecipe!.moduleSettings.currentMode === 'fixed' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Fixed Current (A):</span>
                        <Input type="number" value={editRecipe!.moduleSettings.fixedCurrent}
                          onChange={(e) => setEditRecipe({ ...editRecipe!, moduleSettings: { ...editRecipe!.moduleSettings, fixedCurrent: parseFloat(e.target.value) || 0 } })}
                          className="w-24 h-6 text-xs" step="0.01" />
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2 pt-1">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={handleSave}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditRecipe(null); }}>Cancel</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowCalibration(!showCalibration)}>
                        {showCalibration ? 'Hide Cal.' : 'Calibration'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(recipe)}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => handleClone(recipe)}>Clone</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(recipe.id)}>Delete</Button>
                    </>
                  )}
                </div>

                {/* Calibration Section */}
                {isEditing && showCalibration && (
                  <div className="border-t border-gray-700 pt-2 space-y-2">
                    <p className="text-xs text-gray-400 font-medium">Calibration Factors</p>
                    {([
                      ['tempOffset', 'Temp Offset (\u00B0C)'],
                      ['humidityOffset', 'Humidity Offset (%RH)'],
                      ['voltageCalFactor', 'Voltage Cal Factor'],
                      ['currentShuntResistance', 'Current Shunt (\u03A9)'],
                    ] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-500">{label}</span>
                        <Input type="number" step="0.001"
                          value={editRecipe!.calibration[key]}
                          onChange={(e) => setEditRecipe({
                            ...editRecipe!,
                            calibration: { ...editRecipe!.calibration, [key]: parseFloat(e.target.value) || 0 },
                          })}
                          className="w-24 h-6 text-xs" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
