'use client';

import { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/Toast';
import ModuleSelector from '@/components/ModuleSelector';
import type { PVModule } from '@/data/moduleDatabase';

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

const RECIPE_TEMPLATES: Record<string, Omit<Recipe, 'id'>> = {
  'IEC 61215 TC200': {
    name: 'TC 200 Cycles - IEC 61215', type: 'TC', standard: 'IEC 61215:2021',
    params: { tempMin: -40, tempMax: 85, cycles: 200, rampRate: 1.67, dwellTime: 15 },
    ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  'IEC 61215 TC50': {
    name: 'TC 50 Cycles - IEC 61215', type: 'TC', standard: 'IEC 61215:2021',
    params: { tempMin: -40, tempMax: 85, cycles: 50, rampRate: 1.67, dwellTime: 15 },
    ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  'IEC 61215 HF10': {
    name: 'HF 10 Cycles - IEC 61215', type: 'HF', standard: 'IEC 61215:2021',
    params: { tempMin: -40, tempMax: 85, cycles: 10, humidity: 85, dwellTime: 1200 },
    ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  'PVEL LETID': {
    name: 'LETID Sensitivity - PVEL', type: 'LETID', standard: 'PVEL LETID Protocol',
    params: { irradiance: 1000, cellTemp: 75, currentFraction: 1.0, duration: 162 },
    ps: 'LETID_PRECISION', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  'IEC TS 62804-1:2025 PID': {
    name: 'PID - IEC 62804', type: 'PID', standard: 'IEC TS 62804-1:2025',
    params: { voltageStress: -1000, humidity: 85, temperature: 85, duration: 96 },
    ps: 'PID_HIGH_VOLTAGE', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  'Customer Extended TC600': {
    name: 'Customer TC 600 Extended', type: 'TC', standard: 'Customer-specific',
    params: { tempMin: -40, tempMax: 85, cycles: 600, rampRate: 2.0, dwellTime: 10 },
    ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
};

const INITIAL_RECIPES: Recipe[] = [
  { id: 'r1', ...RECIPE_TEMPLATES['IEC 61215 TC200'] },
  { id: 'r2', name: 'TC 400 Extended', type: 'TC', standard: 'IEC 61215:2021',
    params: { tempMin: -40, tempMax: 85, cycles: 400, rampRate: 1.67, dwellTime: 15 },
    ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS } },
  { id: 'r3', ...RECIPE_TEMPLATES['IEC 61215 HF10'] },
  { id: 'r4', ...RECIPE_TEMPLATES['PVEL LETID'] },
  { id: 'r5', name: 'LETID IEC 61215 MQT19', type: 'LETID', standard: 'IEC 61215:2021',
    params: { irradiance: 1000, cellTemp: 75, currentFraction: 0.075, duration: 162 },
    ps: 'LETID_PRECISION', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { moduleType: 'bifacial', currentMode: 'isc-based', fixedCurrent: 0 } },
  { id: 'r6', name: 'PID Condition A - IEC 62804', type: 'PID', standard: 'IEC TS 62804-1:2025',
    params: { voltageStress: -1000, humidity: 85, temperature: 85, duration: 96 },
    ps: 'PID_HIGH_VOLTAGE', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS } },
  { id: 'r7', name: 'PID Condition B +4000V', type: 'PID', standard: 'IEC TS 62804-1:2025',
    params: { voltageStress: 4000, humidity: 85, temperature: 85, duration: 96 },
    ps: 'PID_HIGH_VOLTAGE', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS } },
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

// Visual timeline SVG for ramp/dwell cycles
function TimelineSVG({ recipe }: { recipe: Recipe }) {
  const isTC = recipe.type === 'TC' || recipe.type === 'HF';
  if (!isTC) return null;

  const tempMin = recipe.params.tempMin ?? -40;
  const tempMax = recipe.params.tempMax ?? 85;
  const rampRate = recipe.params.rampRate ?? 1.67;
  const dwell = recipe.params.dwellTime ?? 15;
  const range = tempMax - tempMin;
  const rampTime = range / rampRate;

  const cycleWidth = 120;
  const displayCycles = Math.min(recipe.params.cycles ?? 1, 4);
  const svgWidth = displayCycles * cycleWidth + 40;

  return (
    <svg viewBox={`0 0 ${svgWidth} 120`} className="w-full max-h-[100px]" xmlns="http://www.w3.org/2000/svg">
      <text x="5" y="15" fill="#6b7280" fontSize="8">{tempMax}\u00B0C</text>
      <text x="5" y="105" fill="#6b7280" fontSize="8">{tempMin}\u00B0C</text>
      <line x1="30" y1="10" x2="30" y2="110" stroke="#374151" strokeWidth="0.5" />
      <line x1="30" y1="110" x2={svgWidth} y2="110" stroke="#374151" strokeWidth="0.5" />
      {Array.from({ length: displayCycles }).map((_, i) => {
        const x0 = 30 + i * cycleWidth;
        const rampW = (rampTime / (rampTime * 2 + dwell * 2)) * cycleWidth;
        const dwellW = (dwell / (rampTime * 2 + dwell * 2)) * cycleWidth;
        return (
          <g key={i}>
            <polyline
              points={`${x0},110 ${x0 + rampW},20 ${x0 + rampW + dwellW},20 ${x0 + rampW * 2 + dwellW},110 ${x0 + rampW * 2 + dwellW + dwellW},110`}
              fill="none" stroke="#3b82f6" strokeWidth="1.5" />
            <text x={x0 + cycleWidth / 2} y="118" textAnchor="middle" fill="#4b5563" fontSize="7">C{i + 1}</text>
          </g>
        );
      })}
      {displayCycles < (recipe.params.cycles ?? 0) && (
        <text x={svgWidth - 10} y="65" fill="#6b7280" fontSize="10">...</text>
      )}
      <text x={svgWidth / 2} y="8" textAnchor="middle" fill="#9ca3af" fontSize="7">
        Ramp: {rampTime.toFixed(0)}min | Dwell: {dwell}min | {recipe.params.cycles} cycles
      </text>
    </svg>
  );
}

// Cycle counter progress bar
function CycleProgress({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Cycle Progress</span>
        <span className="text-gray-300 font-mono">{current} / {total}</span>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-500 text-right">{pct.toFixed(1)}% complete</p>
    </div>
  );
}

export default function RecipeManager() {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [rampInput, setRampInput] = useState('');
  const [selectedModule, setSelectedModule] = useState<PVModule | null>(null);
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<string>('');
  const [simulatedCycles, setSimulatedCycles] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Auto-populate Iinject when module is selected
  const getIinjectLabel = useMemo(() => {
    if (!selectedModule) return '';
    return `1xIsc = ${selectedModule.Isc}A (PVEL)`;
  }, [selectedModule]);

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

  const handleCreateFromTemplate = (templateName: string) => {
    const tmpl = RECIPE_TEMPLATES[templateName];
    if (!tmpl) return;
    const newRecipe: Recipe = { id: `r${Date.now()}`, ...tmpl, params: { ...tmpl.params }, calibration: { ...tmpl.calibration }, moduleSettings: { ...tmpl.moduleSettings } };
    // Auto-fill module-specific current if module selected
    if (selectedModule && newRecipe.type === 'LETID') {
      newRecipe.params.currentFraction = 1.0; // 1xIsc per PVEL
    }
    setRecipes(prev => [...prev, newRecipe]);
    toast('success', `Recipe created from template: ${templateName}`);
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

  const handleExportCSV = () => {
    const headers = ['Name', 'Type', 'Standard', 'PS', 'Module Type', 'Current Mode'];
    const paramKeys = new Set<string>();
    recipes.forEach(r => Object.keys(r.params).forEach(k => paramKeys.add(k)));
    const pKeys = Array.from(paramKeys);
    const allHeaders = [...headers, ...pKeys.map(k => PARAM_LABELS[k] || k)];
    const rows = recipes.map(r => [
      r.name, r.type, r.standard, r.ps, r.moduleSettings.moduleType, r.moduleSettings.currentMode,
      ...pKeys.map(k => String(r.params[k] ?? '')),
    ]);
    const csv = [allHeaders.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pv-test-recipes.csv'; a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Recipes exported as CSV');
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

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
          toast('error', 'CSV must have header + data rows');
          return;
        }
        toast('success', `CSV imported (${lines.length - 1} rows) - creating recipes`);
      } catch {
        toast('error', 'Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const calculateRampTime = () => {
    const rate = parseFloat(rampInput);
    if (!rate || rate <= 0) {
      toast('error', 'Enter a valid ramp rate in \u00B0C/min');
      return;
    }
    const deltaT = 125;
    const timeMin = deltaT / rate;
    toast('info', `Ramp time for ${deltaT}\u00B0C at ${rate}\u00B0C/min = ${timeMin.toFixed(1)} min (${(timeMin / 60).toFixed(2)} hr)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold mb-1">Test Recipe Manager</h2>
          <p className="text-gray-400 text-sm">Full CRUD - TC / HF / LETID / PID recipes with module-specific injection</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={handleCreate}>+ New Recipe</Button>
          <Button size="sm" variant="outline" onClick={handleExportJSON}>Export JSON</Button>
          <Button size="sm" variant="outline" onClick={handleExportCSV}>Export CSV</Button>
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Import JSON</Button>
          <Button size="sm" variant="outline" onClick={() => csvInputRef.current?.click()}>Import CSV</Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
          <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
        </div>
      </div>

      {/* Module Selector */}
      <div className="flex gap-3 items-center flex-wrap">
        <Button size="sm" variant="outline" onClick={() => setShowModuleSelector(!showModuleSelector)}>
          {showModuleSelector ? 'Hide Module Selector' : 'Select PV Module'}
        </Button>
        {selectedModule && (
          <div className="text-sm text-gray-400">
            <Badge className="bg-blue-900 text-blue-300 mr-2">
              {selectedModule.manufacturer} {selectedModule.model}
            </Badge>
            <span className="font-mono">{getIinjectLabel}</span>
          </div>
        )}
      </div>

      {showModuleSelector && (
        <ModuleSelector selectedModule={selectedModule} onSelectModule={setSelectedModule} />
      )}

      {/* Recipe Templates */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Per-Standard Recipe Templates</CardTitle>
            <Input placeholder="Filter templates..." value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)} className="w-48 h-7 text-xs" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(RECIPE_TEMPLATES)
              .filter(k => !templateFilter || k.toLowerCase().includes(templateFilter.toLowerCase()))
              .map(name => (
                <Button key={name} size="sm" variant="outline" className="text-xs"
                  onClick={() => handleCreateFromTemplate(name)}>
                  + {name}
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>

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
          const cycleCount = simulatedCycles[recipe.id] ?? 0;
          const totalCycles = recipe.params.cycles ?? 0;

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
                  <div className="flex gap-1 shrink-0">
                    <Badge variant="outline" className="text-xs">{recipe.type}</Badge>
                    <Badge variant="outline" className="text-xs">{recipe.standard}</Badge>
                  </div>
                </div>
                {isEditing && (
                  <p className="text-xs text-gray-500">
                    <select
                      value={editRecipe!.type}
                      onChange={(e) => setEditRecipe({ ...editRecipe!, type: e.target.value as TestType })}
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-xs text-white"
                    >
                      {['TC', 'HF', 'LETID', 'PID'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </p>
                )}
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

                {/* Module-specific Iinject */}
                {selectedModule && recipe.type === 'LETID' && !isEditing && (
                  <div className="p-2 bg-yellow-900/20 border border-yellow-800 rounded text-xs">
                    <span className="text-yellow-400">Module Iinject:</span>
                    <span className="text-gray-300 ml-2 font-mono">{selectedModule.Isc}A (1xIsc per PVEL)</span>
                  </div>
                )}

                {/* Timeline visualization */}
                <TimelineSVG recipe={recipe} />

                {/* Cycle counter */}
                {totalCycles > 0 && (
                  <div className="space-y-2">
                    <CycleProgress current={cycleCount} total={totalCycles} />
                    {!isEditing && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs"
                          onClick={() => setSimulatedCycles(prev => ({ ...prev, [recipe.id]: Math.min((prev[recipe.id] ?? 0) + 10, totalCycles) }))}>
                          +10 Cycles
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs"
                          onClick={() => setSimulatedCycles(prev => ({ ...prev, [recipe.id]: 0 }))}>
                          Reset
                        </Button>
                      </div>
                    )}
                  </div>
                )}

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
