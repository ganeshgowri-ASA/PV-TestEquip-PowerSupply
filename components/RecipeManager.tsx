'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/Toast';
import ModuleSelector from '@/components/ModuleSelector';
import { type PVModule } from '@/data/moduleDatabase';

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

const RECIPE_TEMPLATES: { label: string; recipe: Omit<Recipe, 'id'> }[] = [
  {
    label: 'IEC 61215 TC200',
    recipe: {
      name: 'TC 200 Cycles - IEC 61215', type: 'TC', standard: 'IEC 61215:2021',
      params: { tempMin: -40, tempMax: 85, cycles: 200, rampRate: 1.67, dwellTime: 15 },
      ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
    },
  },
  {
    label: 'IEC 61215 TC50',
    recipe: {
      name: 'TC 50 Cycles - IEC 61215 (Screening)', type: 'TC', standard: 'IEC 61215:2021',
      params: { tempMin: -40, tempMax: 85, cycles: 50, rampRate: 1.67, dwellTime: 15 },
      ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
    },
  },
  {
    label: 'IEC 61215 HF10',
    recipe: {
      name: 'HF 10 Cycles - IEC 61215', type: 'HF', standard: 'IEC 61215:2021',
      params: { tempMin: -40, tempMax: 85, cycles: 10, humidity: 85, dwellTime: 1200 },
      ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
    },
  },
  {
    label: 'PVEL LETID',
    recipe: {
      name: 'LETID Sensitivity - PVEL', type: 'LETID', standard: 'PVEL LETID Protocol',
      params: { irradiance: 1000, cellTemp: 75, currentFraction: 1.0, duration: 162 },
      ps: 'LETID_PRECISION', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
    },
  },
  {
    label: 'IEC TS 62804-1:2025 PID',
    recipe: {
      name: 'PID Condition A - IEC 62804', type: 'PID', standard: 'IEC TS 62804-1:2025',
      params: { voltageStress: -1000, humidity: 85, temperature: 85, duration: 96 },
      ps: 'PID_HIGH_VOLTAGE', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
    },
  },
  {
    label: 'Customer TC Extended',
    recipe: {
      name: 'TC 600 Cycles - Extended (Customer)', type: 'TC', standard: 'Customer-Specific',
      params: { tempMin: -40, tempMax: 85, cycles: 600, rampRate: 2.0, dwellTime: 10 },
      ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
    },
  },
];

const INITIAL_RECIPES: Recipe[] = [
  { id: 'r1', ...RECIPE_TEMPLATES[0].recipe },
  { id: 'r2', name: 'TC 400 Extended', type: 'TC', standard: 'IEC 61215:2021', params: { tempMin: -40, tempMax: 85, cycles: 400, rampRate: 1.67, dwellTime: 15 }, ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS } },
  { id: 'r3', ...RECIPE_TEMPLATES[2].recipe },
  { id: 'r4', ...RECIPE_TEMPLATES[3].recipe },
  { id: 'r5', name: 'LETID IEC 61215 MQT19', type: 'LETID', standard: 'IEC 61215:2021', params: { irradiance: 1000, cellTemp: 75, currentFraction: 0.075, duration: 162 }, ps: 'LETID_PRECISION', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { moduleType: 'bifacial', currentMode: 'isc-based', fixedCurrent: 0 } },
  { id: 'r6', ...RECIPE_TEMPLATES[4].recipe },
  { id: 'r7', name: 'PID Condition B +4000V', type: 'PID', standard: 'IEC TS 62804-1:2025', params: { voltageStress: 4000, humidity: 85, temperature: 85, duration: 96 }, ps: 'PID_HIGH_VOLTAGE', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS } },
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

// Simple timeline bar component
function TimelineBar({ recipe }: { recipe: Recipe }) {
  const { type, params } = recipe;
  if (type === 'TC' || type === 'HF') {
    const ramp = params.rampRate || 1.67;
    const dwell = params.dwellTime || 15;
    const deltaT = (params.tempMax || 85) - (params.tempMin || -40);
    const rampTimeMin = deltaT / ramp;
    const cycleTime = rampTimeMin * 2 + dwell * 2;
    const totalHr = (cycleTime * (params.cycles || 200)) / 60;
    const rampPct = (rampTimeMin / cycleTime) * 100;
    const dwellPct = (dwell / cycleTime) * 100;

    return (
      <div className="mt-2">
        <p className="text-xs text-gray-500 mb-1">Cycle Profile ({cycleTime.toFixed(0)} min/cycle, {totalHr.toFixed(0)} hr total)</p>
        <div className="flex h-4 rounded overflow-hidden text-[8px]">
          <div className="bg-red-600 flex items-center justify-center text-white" style={{ width: `${rampPct}%` }}>Ramp{'\u2191'}</div>
          <div className="bg-orange-500 flex items-center justify-center text-white" style={{ width: `${dwellPct}%` }}>Hot</div>
          <div className="bg-blue-600 flex items-center justify-center text-white" style={{ width: `${rampPct}%` }}>Ramp{'\u2193'}</div>
          <div className="bg-cyan-500 flex items-center justify-center text-white" style={{ width: `${dwellPct}%` }}>Cold</div>
        </div>
      </div>
    );
  }
  if (type === 'LETID') {
    return (
      <div className="mt-2">
        <p className="text-xs text-gray-500 mb-1">LETID Profile ({params.duration || 162} hr)</p>
        <div className="flex h-4 rounded overflow-hidden text-[8px]">
          <div className="bg-yellow-600 flex items-center justify-center text-white" style={{ width: '5%' }}>Ramp</div>
          <div className="bg-yellow-500 flex items-center justify-center text-white" style={{ width: '90%' }}>Current Injection @ {params.cellTemp || 75}{'\u00B0'}C</div>
          <div className="bg-gray-600 flex items-center justify-center text-white" style={{ width: '5%' }}>Cool</div>
        </div>
      </div>
    );
  }
  if (type === 'PID') {
    return (
      <div className="mt-2">
        <p className="text-xs text-gray-500 mb-1">PID Profile ({params.duration || 96} hr)</p>
        <div className="flex h-4 rounded overflow-hidden text-[8px]">
          <div className="bg-red-700 flex items-center justify-center text-white" style={{ width: '5%' }}>Ramp</div>
          <div className="bg-red-500 flex items-center justify-center text-white" style={{ width: '90%' }}>HV Stress {params.voltageStress || 0}V</div>
          <div className="bg-gray-600 flex items-center justify-center text-white" style={{ width: '5%' }}>Cool</div>
        </div>
      </div>
    );
  }
  return null;
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
  const [showTemplates, setShowTemplates] = useState(false);
  const [cycleProgress, setCycleProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When module selected, auto-fill injection current for LETID recipes
  const applyModuleToRecipes = (mod: PVModule) => {
    setSelectedModule(mod);
    setRecipes(prev => prev.map(r => {
      if (r.type === 'LETID' && r.moduleSettings.currentMode === 'isc-based') {
        return { ...r, params: { ...r.params, currentFraction: 1.0 }, moduleSettings: { ...r.moduleSettings, fixedCurrent: mod.Isc } };
      }
      if (r.type === 'PID') {
        return { ...r, params: { ...r.params, voltageStress: mod.testLimits.pid.Vbias } };
      }
      return r;
    }));
    toast('success', `Module applied: ${mod.manufacturer} ${mod.model} (Isc=${mod.Isc}A)`);
  };

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

  const handleAddTemplate = (tmpl: typeof RECIPE_TEMPLATES[0]) => {
    const newRecipe: Recipe = {
      id: `r${Date.now()}`,
      ...tmpl.recipe,
      params: { ...tmpl.recipe.params },
      calibration: { ...tmpl.recipe.calibration },
      moduleSettings: { ...tmpl.recipe.moduleSettings },
    };
    setRecipes(prev => [...prev, newRecipe]);
    toast('success', `Template added: ${tmpl.label}`);
    setShowTemplates(false);
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
    const headers = ['Name', 'Type', 'Standard', 'Parameters'];
    const rows = recipes.map(r => [
      r.name, r.type, r.standard,
      Object.entries(r.params).map(([k, v]) => `${k}=${v}`).join('; '),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pv-test-recipes.csv';
    a.click();
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

  const simulateProgress = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    const totalCycles = recipe.params.cycles || recipe.params.duration || 100;
    let current = cycleProgress[recipeId] || 0;
    if (current >= totalCycles) {
      setCycleProgress(prev => ({ ...prev, [recipeId]: 0 }));
      return;
    }
    const interval = setInterval(() => {
      current += 1;
      setCycleProgress(prev => ({ ...prev, [recipeId]: current }));
      if (current >= totalCycles) clearInterval(interval);
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Test Recipe Manager</h2>
          <p className="text-gray-400 text-sm">Full CRUD - TC / HF / LETID / PID recipes with module-specific injection</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={handleCreate}>+ New Recipe</Button>
          <Button size="sm" variant="outline" onClick={() => setShowTemplates(!showTemplates)}>Templates</Button>
          <Button size="sm" variant="outline" onClick={handleExportJSON}>Export JSON</Button>
          <Button size="sm" variant="outline" onClick={handleExportCSV}>Export CSV</Button>
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Import</Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
        </div>
      </div>

      {/* Module Selector for Recipes */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Module-Specific Current Injection</CardTitle>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setShowModuleSelector(!showModuleSelector)}>
              {selectedModule ? `${selectedModule.manufacturer} ${selectedModule.model}` : 'Select Module'}
            </Button>
          </div>
        </CardHeader>
        {showModuleSelector && (
          <CardContent>
            <ModuleSelector selectedModule={selectedModule} onSelectModule={(mod) => { if (mod) applyModuleToRecipes(mod); else setSelectedModule(null); }} />
          </CardContent>
        )}
        {selectedModule && !showModuleSelector && (
          <CardContent>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <Badge variant="default" className="text-xs">{selectedModule.technology}</Badge>
              <span>Isc = {selectedModule.Isc}A (PVEL: 1xIsc injection)</span>
              <span>|</span>
              <span>PID Vbias = {'\u00B1'}{selectedModule.testLimits.pid.Vbias}V</span>
              <span>|</span>
              <span>Voc = {selectedModule.Voc}V</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Template Selector */}
      {showTemplates && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Per-Standard Recipe Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {RECIPE_TEMPLATES.map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => handleAddTemplate(tmpl)}
                  className="p-3 border border-gray-700 rounded-lg text-left hover:border-blue-500 hover:bg-blue-900/10 transition-colors"
                >
                  <p className="text-sm font-medium text-blue-300">{tmpl.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{tmpl.recipe.standard}</p>
                  <Badge variant="outline" className="text-xs mt-1">{tmpl.recipe.type}</Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ramp Rate Calculator */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Ramp Rate Calculator ({'\u00B0'}C/min)</label>
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
          const progress = cycleProgress[recipe.id] || 0;
          const totalForProgress = recipe.params.cycles || recipe.params.duration || 100;
          const progressPct = Math.min(100, (progress / totalForProgress) * 100);

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

                {/* Module-specific injection info */}
                {selectedModule && recipe.type === 'LETID' && (
                  <div className="p-2 bg-yellow-900/20 border border-yellow-800 rounded text-xs text-yellow-400">
                    Iinject = {recipe.params.currentFraction || 1}x Isc = {((recipe.params.currentFraction || 1) * selectedModule.Isc).toFixed(2)}A (PVEL Protocol)
                  </div>
                )}

                {/* Timeline visualization */}
                {!isEditing && <TimelineBar recipe={recipe} />}

                {/* Cycle Progress Bar */}
                {progress > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-gray-300 font-mono">{progress}/{totalForProgress} {recipe.type === 'TC' || recipe.type === 'HF' ? 'cycles' : 'hr'}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${progressPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progressPct}%` }} />
                    </div>
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
                <div className="flex gap-2 pt-1 flex-wrap">
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
                      <Button size="sm" variant="outline" onClick={() => simulateProgress(recipe.id)}>
                        {progress > 0 && progress < totalForProgress ? 'Running...' : progress >= totalForProgress ? 'Reset' : 'Simulate'}
                      </Button>
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
