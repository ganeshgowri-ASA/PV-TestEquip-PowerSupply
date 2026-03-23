'use client';

import { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/Toast';
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

const TEMPLATE_RECIPES: Recipe[] = [
  {
    id: 'tmpl-tc200', name: 'TC 200 Cycles - IEC 61215', type: 'TC', standard: 'IEC 61215:2021',
    params: { tempMin: -40, tempMax: 85, cycles: 200, rampRate: 1.67, dwellTime: 15 },
    ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  {
    id: 'tmpl-tc50', name: 'TC 50 Cycles - IEC 61215', type: 'TC', standard: 'IEC 61215:2021',
    params: { tempMin: -40, tempMax: 85, cycles: 50, rampRate: 1.67, dwellTime: 15 },
    ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  {
    id: 'tmpl-tc400', name: 'TC 400 Extended', type: 'TC', standard: 'IEC 61215:2021',
    params: { tempMin: -40, tempMax: 85, cycles: 400, rampRate: 1.67, dwellTime: 15 },
    ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  {
    id: 'tmpl-hf10', name: 'HF 10 Cycles - IEC 61215', type: 'HF', standard: 'IEC 61215:2021',
    params: { tempMin: -40, tempMax: 85, cycles: 10, humidity: 85, dwellTime: 1200 },
    ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  {
    id: 'tmpl-letid-pvel', name: 'LETID Sensitivity - PVEL', type: 'LETID', standard: 'PVEL LETID Protocol',
    params: { irradiance: 1000, cellTemp: 75, currentFraction: 1.0, duration: 162 },
    ps: 'LETID_PRECISION', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  {
    id: 'tmpl-letid-iec', name: 'LETID IEC 61215 MQT19', type: 'LETID', standard: 'IEC 61215:2021',
    params: { irradiance: 1000, cellTemp: 75, currentFraction: 0.075, duration: 162 },
    ps: 'LETID_PRECISION', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  {
    id: 'tmpl-pid-a', name: 'PID Condition A - IEC 62804', type: 'PID', standard: 'IEC TS 62804-1:2025',
    params: { voltageStress: -1000, humidity: 85, temperature: 85, duration: 96 },
    ps: 'PID_HIGH_VOLTAGE', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  {
    id: 'tmpl-pid-hv', name: 'PID +4000V HV Test', type: 'PID', standard: 'IEC TS 62804-1:2025',
    params: { voltageStress: 4000, humidity: 85, temperature: 85, duration: 96 },
    ps: 'PID_HIGH_VOLTAGE', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
  },
  {
    id: 'tmpl-custom', name: 'Customer-Specific Template', type: 'TC', standard: 'Custom',
    params: { tempMin: -40, tempMax: 85, cycles: 100, rampRate: 2.0, dwellTime: 10 },
    ps: 'TC_HF_BIDIRECTIONAL', calibration: { ...DEFAULT_CALIBRATION }, moduleSettings: { ...DEFAULT_MODULE_SETTINGS },
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

interface RecipeManagerProps {
  selectedModule?: PVModule | null;
}

export default function RecipeManager({ selectedModule }: RecipeManagerProps) {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>(TEMPLATE_RECIPES.slice(0, 8));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [rampInput, setRampInput] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [filterType, setFilterType] = useState<TestType | 'ALL'>('ALL');
  const [runningRecipe, setRunningRecipe] = useState<string | null>(null);
  const [cycleProgress, setCycleProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRecipes = filterType === 'ALL' ? recipes : recipes.filter(r => r.type === filterType);

  // Auto-fill Iinject when module selected
  const getModuleIinject = (): string => {
    if (!selectedModule) return '\u2014';
    return `${selectedModule.Isc.toFixed(2)}A (1xIsc)`;
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingId(recipe.id);
    const edited = { ...recipe, params: { ...recipe.params }, calibration: { ...recipe.calibration }, moduleSettings: { ...recipe.moduleSettings } };
    // Pre-fill module-specific values
    if (selectedModule && recipe.type === 'LETID') {
      edited.params.currentFraction = 1.0; // PVEL default
    }
    setEditRecipe(edited);
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

  const handleAddFromTemplate = (template: Recipe) => {
    const newRecipe: Recipe = {
      ...template,
      id: `r${Date.now()}`,
      params: { ...template.params },
      calibration: { ...template.calibration },
      moduleSettings: { ...template.moduleSettings },
    };
    setRecipes(prev => [...prev, newRecipe]);
    setShowTemplates(false);
    toast('success', `Template added: ${template.name}`);
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

  const handleSimulateRun = (recipe: Recipe) => {
    if (runningRecipe) {
      toast('warning', 'A recipe is already running');
      return;
    }
    setRunningRecipe(recipe.id);
    setCycleProgress(prev => ({ ...prev, [recipe.id]: 0 }));
    const totalCycles = recipe.params.cycles || recipe.params.duration || 10;
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setCycleProgress(prev => ({ ...prev, [recipe.id]: Math.min(current, totalCycles) }));
      if (current >= totalCycles) {
        clearInterval(interval);
        setRunningRecipe(null);
        toast('success', `Recipe "${recipe.name}" completed!`);
      }
    }, 200);
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

  // Timeline visualization for a recipe
  const renderTimeline = (recipe: Recipe) => {
    if (recipe.type === 'TC' || recipe.type === 'HF') {
      const ramp = recipe.params.rampRate || 1.67;
      const dwell = recipe.params.dwellTime || 15;
      const deltaT = (recipe.params.tempMax || 85) - (recipe.params.tempMin || -40);
      const rampTimeMin = deltaT / ramp;
      const cycleTimeMin = 2 * rampTimeMin + 2 * dwell;
      const totalTimeHr = (cycleTimeMin * (recipe.params.cycles || 200)) / 60;

      return (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Ramp: {rampTimeMin.toFixed(0)}min</span>
            <span>|</span>
            <span>Dwell: {dwell}min</span>
            <span>|</span>
            <span>Cycle: {cycleTimeMin.toFixed(0)}min</span>
            <span>|</span>
            <span className="text-blue-300">Total: {totalTimeHr.toFixed(1)}hr</span>
          </div>
          {/* Mini SVG timeline */}
          <svg viewBox="0 0 300 40" className="w-full max-w-xs">
            <line x1="10" y1="35" x2="290" y2="35" stroke="#374151" strokeWidth="1" />
            {/* Ramp up */}
            <line x1="10" y1="35" x2="60" y2="5" stroke="#3b82f6" strokeWidth="2" />
            <text x="35" y="25" fill="#6b7280" fontSize="7" textAnchor="middle">Ramp</text>
            {/* Hot dwell */}
            <line x1="60" y1="5" x2="130" y2="5" stroke="#ef4444" strokeWidth="2" />
            <text x="95" y="15" fill="#6b7280" fontSize="7" textAnchor="middle">+{recipe.params.tempMax}\u00B0C</text>
            {/* Ramp down */}
            <line x1="130" y1="5" x2="180" y2="35" stroke="#3b82f6" strokeWidth="2" />
            {/* Cold dwell */}
            <line x1="180" y1="35" x2="250" y2="35" stroke="#22d3ee" strokeWidth="2" />
            <text x="215" y="30" fill="#6b7280" fontSize="7" textAnchor="middle">{recipe.params.tempMin}\u00B0C</text>
            {/* Next cycle indicator */}
            <line x1="250" y1="35" x2="290" y2="10" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3" />
          </svg>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold mb-1">Test Recipe Manager</h2>
          <p className="text-gray-400 text-sm">
            Full CRUD - TC / HF / LETID / PID recipes
            {selectedModule && (
              <span className="text-blue-300 ml-2">| Module: {selectedModule.manufacturer} {selectedModule.model} (Iinject: {getModuleIinject()})</span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={handleCreate}>+ New Recipe</Button>
          <Button size="sm" variant="outline" onClick={() => setShowTemplates(!showTemplates)}>
            {showTemplates ? 'Hide Templates' : 'Templates'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportJSON}>Export JSON</Button>
          <Button size="sm" variant="outline" onClick={handleExportCSV}>Export CSV</Button>
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Import</Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
        </div>
      </div>

      {/* Template Library */}
      {showTemplates && (
        <Card className="border-yellow-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-400">Recipe Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {TEMPLATE_RECIPES.map((tmpl) => (
                <button key={tmpl.id}
                  onClick={() => handleAddFromTemplate(tmpl)}
                  className="text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{tmpl.type}</Badge>
                    <span className="text-xs text-gray-300">{tmpl.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{tmpl.standard}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Type Filter */}
      <div className="flex gap-2">
        {(['ALL', 'TC', 'HF', 'LETID', 'PID'] as const).map((t) => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterType === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >{t}</button>
        ))}
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
        {filteredRecipes.map((recipe) => {
          const isEditing = editingId === recipe.id && editRecipe;
          const isRunning = runningRecipe === recipe.id;
          const progress = cycleProgress[recipe.id] || 0;
          const totalCycles = recipe.params.cycles || recipe.params.duration || 10;

          return (
            <Card key={recipe.id} className={`transition-colors ${isEditing ? 'border-blue-500' : isRunning ? 'border-green-500' : 'hover:border-blue-700'}`}>
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
                {/* Cycle Progress */}
                {(isRunning || progress > 0) && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-green-400 font-mono">{progress}/{totalCycles}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(progress / totalCycles) * 100}%` }} />
                    </div>
                  </div>
                )}

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

                {/* Module-specific injection current */}
                {selectedModule && recipe.type === 'LETID' && !isEditing && (
                  <div className="p-2 bg-yellow-900/20 border border-yellow-700/50 rounded text-xs">
                    <span className="text-yellow-400">Module Iinject: </span>
                    <span className="text-yellow-200 font-mono">{selectedModule.Isc.toFixed(2)}A (1xIsc per PVEL)</span>
                  </div>
                )}

                {/* Timeline visualization */}
                {!isEditing && renderTimeline(recipe)}

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
                      <Button size="sm" variant="outline" onClick={() => handleSimulateRun(recipe)} disabled={!!runningRecipe}>
                        {isRunning ? 'Running...' : 'Simulate'}
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
