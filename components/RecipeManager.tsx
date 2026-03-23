'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

type TestType = 'TC' | 'HF' | 'LETID' | 'PID';
type ModuleType = 'HJT' | 'PERC' | 'TOPCon';

interface CalibrationFactors {
  voltageOffset: number;
  currentGain: number;
  temperatureOffset: number;
}

interface Recipe {
  id: string;
  name: string;
  type: TestType;
  standard: string;
  moduleType: ModuleType;
  tempMin: number;
  tempMax: number;
  rampRate: number;
  dwellTime: number;
  cycles: number;
  humidity: number | null;
  voltageStress: number | null;
  currentFraction: number;
  channelCount: number;
  calibration: CalibrationFactors;
  createdAt: string;
  notes: string;
}

const MODULE_PRESETS: Record<ModuleType, { voc: number; isc: number; pmax: number; bf: number }> = {
  HJT: { voc: 60, isc: 27, pmax: 1100, bf: 0.85 },
  PERC: { voc: 49.5, isc: 13.5, pmax: 540, bf: 0 },
  TOPCon: { voc: 52.5, isc: 18.3, pmax: 700, bf: 0.80 },
};

const DEFAULT_RECIPES: Recipe[] = [
  {
    id: 'r1', name: 'TC 200 Cycles — IEC 61215', type: 'TC', standard: 'IEC 61215:2021 MQT 11',
    moduleType: 'HJT', tempMin: -40, tempMax: 85, rampRate: 1.67, dwellTime: 15, cycles: 200,
    humidity: null, voltageStress: null, currentFraction: 1.0, channelCount: 10,
    calibration: { voltageOffset: 0, currentGain: 1.0, temperatureOffset: 0 },
    createdAt: '2024-09-01', notes: 'Standard TC200 per IEC 61215:2021',
  },
  {
    id: 'r2', name: 'TC 400 Extended', type: 'TC', standard: 'IEC 61215:2021 MQT 11',
    moduleType: 'HJT', tempMin: -40, tempMax: 85, rampRate: 1.67, dwellTime: 15, cycles: 400,
    humidity: null, voltageStress: null, currentFraction: 1.0, channelCount: 10,
    calibration: { voltageOffset: 0, currentGain: 1.0, temperatureOffset: 0 },
    createdAt: '2024-09-01', notes: 'Extended TC400 for qualification plus',
  },
  {
    id: 'r3', name: 'HF 10 Cycles — IEC 61215', type: 'HF', standard: 'IEC 61215:2021 MQT 12',
    moduleType: 'HJT', tempMin: -40, tempMax: 85, rampRate: 1.67, dwellTime: 20, cycles: 10,
    humidity: 85, voltageStress: null, currentFraction: 1.0, channelCount: 10,
    calibration: { voltageOffset: 0, currentGain: 1.0, temperatureOffset: 0 },
    createdAt: '2024-09-01', notes: 'Humidity freeze 85°C/85%RH dwell',
  },
  {
    id: 'r4', name: 'LETID Sensitivity — PVEL', type: 'LETID', standard: 'PVEL LETID Sensitivity',
    moduleType: 'HJT', tempMin: 25, tempMax: 75, rampRate: 2.0, dwellTime: 162, cycles: 1,
    humidity: null, voltageStress: null, currentFraction: 0.5, channelCount: 10,
    calibration: { voltageOffset: 0, currentGain: 1.0, temperatureOffset: 0 },
    createdAt: '2024-09-01', notes: '162h at 75°C, 0.5× Isc injection per PVEL',
  },
  {
    id: 'r5', name: 'LETID IEC MQT 19', type: 'LETID', standard: 'IEC 61215:2021 MQT 19',
    moduleType: 'HJT', tempMin: 25, tempMax: 75, rampRate: 2.0, dwellTime: 96, cycles: 1,
    humidity: null, voltageStress: null, currentFraction: 0.5, channelCount: 10,
    calibration: { voltageOffset: 0, currentGain: 1.0, temperatureOffset: 0 },
    createdAt: '2024-09-01', notes: '96h at 75°C per IEC 61215 MQT 19',
  },
  {
    id: 'r6', name: 'PID Stress -1000V', type: 'PID', standard: 'IEC TS 62804-1:2025',
    moduleType: 'HJT', tempMin: 25, tempMax: 85, rampRate: 2.0, dwellTime: 96, cycles: 1,
    humidity: 85, voltageStress: -1000, currentFraction: 0, channelCount: 10,
    calibration: { voltageOffset: 0, currentGain: 1.0, temperatureOffset: 0 },
    createdAt: '2024-09-01', notes: 'PID stress at -1000V, 85°C/85%RH, 96h',
  },
];

const TYPE_COLORS: Record<TestType, string> = { TC: 'text-blue-400', HF: 'text-cyan-400', LETID: 'text-yellow-400', PID: 'text-red-400' };
const TYPE_BORDER: Record<TestType, string> = { TC: 'border-blue-700', HF: 'border-cyan-700', LETID: 'border-yellow-700', PID: 'border-red-700' };

export default function RecipeManager() {
  const { addToast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>(DEFAULT_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editing, setEditing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState<TestType | 'All'>('All');

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<TestType>('TC');
  const [formModule, setFormModule] = useState<ModuleType>('HJT');
  const [formTempMin, setFormTempMin] = useState('-40');
  const [formTempMax, setFormTempMax] = useState('85');
  const [formRampRate, setFormRampRate] = useState('1.67');
  const [formDwellTime, setFormDwellTime] = useState('15');
  const [formCycles, setFormCycles] = useState('200');
  const [formHumidity, setFormHumidity] = useState('');
  const [formVoltageStress, setFormVoltageStress] = useState('');
  const [formCurrentFrac, setFormCurrentFrac] = useState('1.0');
  const [formChannels, setFormChannels] = useState('10');
  const [formCalVoltOff, setFormCalVoltOff] = useState('0');
  const [formCalCurrGain, setFormCalCurrGain] = useState('1.0');
  const [formCalTempOff, setFormCalTempOff] = useState('0');
  const [formNotes, setFormNotes] = useState('');

  const filteredRecipes = filterType === 'All' ? recipes : recipes.filter((r) => r.type === filterType);

  const populateForm = useCallback((r: Recipe) => {
    setFormName(r.name);
    setFormType(r.type);
    setFormModule(r.moduleType);
    setFormTempMin(String(r.tempMin));
    setFormTempMax(String(r.tempMax));
    setFormRampRate(String(r.rampRate));
    setFormDwellTime(String(r.dwellTime));
    setFormCycles(String(r.cycles));
    setFormHumidity(r.humidity !== null ? String(r.humidity) : '');
    setFormVoltageStress(r.voltageStress !== null ? String(r.voltageStress) : '');
    setFormCurrentFrac(String(r.currentFraction));
    setFormChannels(String(r.channelCount));
    setFormCalVoltOff(String(r.calibration.voltageOffset));
    setFormCalCurrGain(String(r.calibration.currentGain));
    setFormCalTempOff(String(r.calibration.temperatureOffset));
    setFormNotes(r.notes);
  }, []);

  const buildRecipeFromForm = useCallback((): Omit<Recipe, 'id' | 'createdAt'> => ({
    name: formName,
    type: formType,
    standard: formType === 'TC' ? 'IEC 61215:2021 MQT 11' : formType === 'HF' ? 'IEC 61215:2021 MQT 12' : formType === 'LETID' ? 'IEC 61215:2021 MQT 19' : 'IEC TS 62804-1:2025',
    moduleType: formModule,
    tempMin: parseFloat(formTempMin) || 0,
    tempMax: parseFloat(formTempMax) || 0,
    rampRate: parseFloat(formRampRate) || 1.67,
    dwellTime: parseFloat(formDwellTime) || 15,
    cycles: parseInt(formCycles) || 1,
    humidity: formHumidity ? parseFloat(formHumidity) : null,
    voltageStress: formVoltageStress ? parseFloat(formVoltageStress) : null,
    currentFraction: parseFloat(formCurrentFrac) || 1.0,
    channelCount: parseInt(formChannels) || 10,
    calibration: {
      voltageOffset: parseFloat(formCalVoltOff) || 0,
      currentGain: parseFloat(formCalCurrGain) || 1.0,
      temperatureOffset: parseFloat(formCalTempOff) || 0,
    },
    notes: formNotes,
  }), [formName, formType, formModule, formTempMin, formTempMax, formRampRate, formDwellTime, formCycles, formHumidity, formVoltageStress, formCurrentFrac, formChannels, formCalVoltOff, formCalCurrGain, formCalTempOff, formNotes]);

  const createRecipe = useCallback(() => {
    if (!formName.trim()) {
      addToast({ title: 'Name Required', variant: 'destructive' });
      return;
    }
    const newRecipe: Recipe = {
      ...buildRecipeFromForm(),
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setRecipes((prev) => [...prev, newRecipe]);
    setShowCreate(false);
    setSelectedRecipe(newRecipe);
    addToast({ title: 'Recipe Created', description: newRecipe.name, variant: 'success' });
  }, [buildRecipeFromForm, formName, addToast]);

  const updateRecipe = useCallback(() => {
    if (!selectedRecipe || !formName.trim()) return;
    const updated: Recipe = {
      ...buildRecipeFromForm(),
      id: selectedRecipe.id,
      createdAt: selectedRecipe.createdAt,
    };
    setRecipes((prev) => prev.map((r) => r.id === updated.id ? updated : r));
    setSelectedRecipe(updated);
    setEditing(false);
    addToast({ title: 'Recipe Updated', description: updated.name, variant: 'success' });
  }, [buildRecipeFromForm, formName, selectedRecipe, addToast]);

  const deleteRecipe = useCallback((id: string) => {
    const r = recipes.find((x) => x.id === id);
    setRecipes((prev) => prev.filter((x) => x.id !== id));
    if (selectedRecipe?.id === id) setSelectedRecipe(null);
    addToast({ title: 'Recipe Deleted', description: r?.name ?? '', variant: 'warning' });
  }, [recipes, selectedRecipe, addToast]);

  const duplicateRecipe = useCallback((r: Recipe) => {
    const copy: Recipe = { ...r, id: `r${Date.now()}`, name: `${r.name} (Copy)`, createdAt: new Date().toISOString().split('T')[0] };
    setRecipes((prev) => [...prev, copy]);
    addToast({ title: 'Recipe Duplicated', description: copy.name, variant: 'success' });
  }, [addToast]);

  const exportJSON = useCallback(() => {
    const data = JSON.stringify(recipes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PV-TestEquip-Recipes.json';
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'JSON Exported', description: `${recipes.length} recipes`, variant: 'success' });
  }, [recipes, addToast]);

  const importJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const imported = JSON.parse(evt.target?.result as string) as Recipe[];
          if (!Array.isArray(imported) || imported.length === 0) throw new Error('Invalid format');
          setRecipes((prev) => [...prev, ...imported.map((r) => ({ ...r, id: `r${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }))]);
          addToast({ title: 'Recipes Imported', description: `${imported.length} recipes added`, variant: 'success' });
        } catch {
          addToast({ title: 'Import Failed', description: 'Invalid JSON file', variant: 'destructive' });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [addToast]);

  // Ramp rate calculator
  const deltaT = Math.abs(parseFloat(formTempMax) - parseFloat(formTempMin)) || 125;
  const rampRate = parseFloat(formRampRate) || 1.67;
  const rampTimeMins = deltaT / rampRate;
  const dwellMins = parseFloat(formDwellTime) || 15;
  const cycleTimeMins = 2 * rampTimeMins + 2 * dwellMins;
  const totalCycles = parseInt(formCycles) || 1;
  const totalHours = (cycleTimeMins * totalCycles) / 60;

  // Module-specific ABSI
  const mod = MODULE_PRESETS[formModule];
  const absiCurrent = mod.isc + (mod.isc * mod.bf * mod.bf);

  const resetForm = useCallback(() => {
    setFormName(''); setFormType('TC'); setFormModule('HJT');
    setFormTempMin('-40'); setFormTempMax('85'); setFormRampRate('1.67');
    setFormDwellTime('15'); setFormCycles('200'); setFormHumidity('');
    setFormVoltageStress(''); setFormCurrentFrac('1.0'); setFormChannels('10');
    setFormCalVoltOff('0'); setFormCalCurrGain('1.0'); setFormCalTempOff('0');
    setFormNotes('');
  }, []);

  const RecipeForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-gray-500 uppercase block mb-1">Recipe Name</label>
          <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. TC 200 Custom" />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase block mb-1">Test Type</label>
          <div className="flex gap-1">
            {(['TC', 'HF', 'LETID', 'PID'] as TestType[]).map((t) => (
              <button key={t} onClick={() => setFormType(t)}
                className={`px-2 py-1 rounded text-xs font-medium ${formType === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase block mb-1">Module Type</label>
          <div className="flex gap-1">
            {(['HJT', 'PERC', 'TOPCon'] as ModuleType[]).map((m) => (
              <button key={m} onClick={() => setFormModule(m)}
                className={`px-2 py-1 rounded text-xs font-medium ${formModule === m ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Temperature & timing */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500 uppercase block mb-1">Temp Min (°C)</label>
          <Input type="number" value={formTempMin} onChange={(e) => setFormTempMin(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase block mb-1">Temp Max (°C)</label>
          <Input type="number" value={formTempMax} onChange={(e) => setFormTempMax(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase block mb-1">Ramp Rate (°C/min)</label>
          <Input type="number" value={formRampRate} onChange={(e) => setFormRampRate(e.target.value)} step="0.01" />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase block mb-1">Dwell ({formType === 'LETID' || formType === 'PID' ? 'hr' : 'min'})</label>
          <Input type="number" value={formDwellTime} onChange={(e) => setFormDwellTime(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase block mb-1">Cycles</label>
          <Input type="number" value={formCycles} onChange={(e) => setFormCycles(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase block mb-1">Channels</label>
          <Input type="number" value={formChannels} onChange={(e) => setFormChannels(e.target.value)} min="1" max="10" />
        </div>
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500 uppercase block mb-1">Humidity (%RH)</label>
          <Input type="number" value={formHumidity} onChange={(e) => setFormHumidity(e.target.value)} placeholder="—" />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase block mb-1">Voltage Stress (V)</label>
          <Input type="number" value={formVoltageStress} onChange={(e) => setFormVoltageStress(e.target.value)} placeholder="—" />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase block mb-1">Current Fraction (× Isc)</label>
          <Input type="number" value={formCurrentFrac} onChange={(e) => setFormCurrentFrac(e.target.value)} step="0.1" />
        </div>
      </div>

      {/* Calibration factors */}
      <div className="p-3 rounded-lg border border-gray-700 bg-gray-900/50">
        <h4 className="text-xs text-gray-400 uppercase font-semibold mb-2">Calibration Factors</h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">V Offset (V)</label>
            <Input type="number" value={formCalVoltOff} onChange={(e) => setFormCalVoltOff(e.target.value)} step="0.001" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">I Gain (×)</label>
            <Input type="number" value={formCalCurrGain} onChange={(e) => setFormCalCurrGain(e.target.value)} step="0.001" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">T Offset (°C)</label>
            <Input type="number" value={formCalTempOff} onChange={(e) => setFormCalTempOff(e.target.value)} step="0.1" />
          </div>
        </div>
      </div>

      {/* Ramp rate calculator */}
      <div className="p-3 rounded-lg border border-blue-800 bg-blue-950/20">
        <h4 className="text-xs text-blue-400 uppercase font-semibold mb-2">Ramp Rate Calculator</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div><span className="text-gray-500">Delta T:</span> <span className="text-blue-300 font-mono">{deltaT}°C</span></div>
          <div><span className="text-gray-500">Ramp Time:</span> <span className="text-blue-300 font-mono">{rampTimeMins.toFixed(1)} min</span></div>
          <div><span className="text-gray-500">Cycle Time:</span> <span className="text-blue-300 font-mono">{cycleTimeMins.toFixed(1)} min</span></div>
          <div><span className="text-gray-500">Total Duration:</span> <span className="text-blue-300 font-mono">{totalHours < 24 ? `${totalHours.toFixed(1)} hr` : `${(totalHours / 24).toFixed(1)} days`}</span></div>
        </div>
      </div>

      {/* Module-specific */}
      <div className="p-3 rounded-lg border border-gray-700 bg-gray-900/50">
        <h4 className="text-xs text-gray-400 uppercase font-semibold mb-2">Module: {formModule} — {MODULE_PRESETS[formModule].pmax}W</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div><span className="text-gray-500">Voc:</span> <span className="text-gray-200 font-mono">{mod.voc}V</span></div>
          <div><span className="text-gray-500">Isc:</span> <span className="text-gray-200 font-mono">{mod.isc}A</span></div>
          <div><span className="text-gray-500">Bifaciality:</span> <span className="text-gray-200 font-mono">{mod.bf}</span></div>
          <div><span className="text-gray-500">ABSI Current:</span> <span className="text-gray-200 font-mono">{absiCurrent.toFixed(2)}A</span></div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs text-gray-500 uppercase block mb-1">Notes</label>
        <textarea
          value={formNotes}
          onChange={(e) => setFormNotes(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Test Recipe Manager</h2>
          <p className="text-gray-400 text-sm">{recipes.length} recipes — TC / HF / LETID / PID — IEC 61215:2021 | IEC TS 62804-1:2025</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => { resetForm(); setShowCreate(true); setEditing(false); setSelectedRecipe(null); }}>
            New Recipe
          </Button>
          <Button size="sm" variant="outline" onClick={exportJSON}>Export JSON</Button>
          <Button size="sm" variant="outline" onClick={importJSON}>Import JSON</Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['All', 'TC', 'HF', 'LETID', 'PID'] as const).map((t) => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterType === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}>
            {t} ({t === 'All' ? recipes.length : recipes.filter((r) => r.type === t).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe list */}
        <div className="space-y-2 lg:col-span-1 max-h-[700px] overflow-y-auto pr-1">
          {filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className={`cursor-pointer transition-all ${
                selectedRecipe?.id === recipe.id ? `${TYPE_BORDER[recipe.type]} bg-gray-800/50` : 'hover:border-gray-600'
              }`}
              onClick={() => { setSelectedRecipe(recipe); setShowCreate(false); setEditing(false); }}
            >
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-medium ${TYPE_COLORS[recipe.type]}`}>{recipe.name}</p>
                    <p className="text-xs text-gray-500">{recipe.standard}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">{recipe.type}</Badge>
                    <Badge variant="secondary" className="text-xs">{recipe.moduleType}</Badge>
                  </div>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  <span>{recipe.tempMin}°C to {recipe.tempMax}°C</span>
                  <span>{recipe.cycles} cyc</span>
                  <span>{recipe.channelCount} ch</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail / Form panel */}
        <div className="lg:col-span-2">
          {showCreate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Create New Recipe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RecipeForm />
                <div className="flex gap-2">
                  <Button onClick={createRecipe}>Create Recipe</Button>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedRecipe && !showCreate && (
            editing ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Edit Recipe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RecipeForm />
                  <div className="flex gap-2">
                    <Button onClick={updateRecipe}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-base ${TYPE_COLORS[selectedRecipe.type]}`}>{selectedRecipe.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { populateForm(selectedRecipe); setEditing(true); }}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => duplicateRecipe(selectedRecipe)}>Duplicate</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteRecipe(selectedRecipe.id)}>Delete</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{selectedRecipe.type}</Badge>
                    <Badge variant="secondary">{selectedRecipe.standard}</Badge>
                    <Badge variant="secondary">{selectedRecipe.moduleType} ({MODULE_PRESETS[selectedRecipe.moduleType].pmax}W)</Badge>
                    <Badge variant="outline">Created: {selectedRecipe.createdAt}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div><span className="text-gray-500">Temp Range:</span> <span className="text-gray-200 font-mono">{selectedRecipe.tempMin}°C to {selectedRecipe.tempMax}°C</span></div>
                    <div><span className="text-gray-500">Ramp Rate:</span> <span className="text-gray-200 font-mono">{selectedRecipe.rampRate} °C/min</span></div>
                    <div><span className="text-gray-500">Dwell Time:</span> <span className="text-gray-200 font-mono">{selectedRecipe.dwellTime} {selectedRecipe.type === 'LETID' || selectedRecipe.type === 'PID' ? 'hr' : 'min'}</span></div>
                    <div><span className="text-gray-500">Cycles:</span> <span className="text-gray-200 font-mono">{selectedRecipe.cycles}</span></div>
                    <div><span className="text-gray-500">Channels:</span> <span className="text-gray-200 font-mono">{selectedRecipe.channelCount}</span></div>
                    <div><span className="text-gray-500">Current Fraction:</span> <span className="text-gray-200 font-mono">{selectedRecipe.currentFraction}× Isc</span></div>
                    {selectedRecipe.humidity !== null && (
                      <div><span className="text-gray-500">Humidity:</span> <span className="text-gray-200 font-mono">{selectedRecipe.humidity}% RH</span></div>
                    )}
                    {selectedRecipe.voltageStress !== null && (
                      <div><span className="text-gray-500">Voltage Stress:</span> <span className="text-gray-200 font-mono">{selectedRecipe.voltageStress}V</span></div>
                    )}
                  </div>

                  {/* Calibration */}
                  <div className="p-3 rounded-lg border border-gray-700 bg-gray-900/50">
                    <h4 className="text-xs text-gray-400 uppercase font-semibold mb-2">Calibration Factors</h4>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div><span className="text-gray-500">V Offset:</span> <span className="font-mono text-gray-200">{selectedRecipe.calibration.voltageOffset}V</span></div>
                      <div><span className="text-gray-500">I Gain:</span> <span className="font-mono text-gray-200">{selectedRecipe.calibration.currentGain}×</span></div>
                      <div><span className="text-gray-500">T Offset:</span> <span className="font-mono text-gray-200">{selectedRecipe.calibration.temperatureOffset}°C</span></div>
                    </div>
                  </div>

                  {selectedRecipe.notes && (
                    <div className="p-3 rounded-lg border border-gray-700 bg-gray-900/50">
                      <h4 className="text-xs text-gray-400 uppercase font-semibold mb-1">Notes</h4>
                      <p className="text-sm text-gray-300">{selectedRecipe.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )}

          {!selectedRecipe && !showCreate && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Select a recipe from the list or create a new one</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
