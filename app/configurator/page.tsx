'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  ModuleProfile,
  MODULE_PRESETS,
  TestType,
  TEST_SPECS,
  calculateABSICurrent,
  calculateCycleTiming,
  calculatePowerSupplySizing,
  buildRecipeConfig,
  createPIDConfig,
  PID_LEAKAGE_THRESHOLD_MA,
  recipeToJSON,
  formatDuration,
  formatCurrent,
  type RecipeConfig,
  type PIDConfig,
  type CycleTiming,
} from '@/lib/calculations';

// ─── Timing Diagram SVG Component ───────────────────────────────────────────────

function TimingDiagram({ timing, testType, tempMin, tempMax }: {
  timing: CycleTiming;
  testType: TestType;
  tempMin: number;
  tempMax: number;
}) {
  const width = 800;
  const height = 260;
  const padL = 60, padR = 20, padT = 30, padB = 40;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const cyclesToShow = Math.min(timing.totalCycles, 4);
  const totalTime = timing.singleCycleTime * cyclesToShow;

  const toX = (t: number) => padL + (t / totalTime) * plotW;
  const toY = (temp: number) => padT + plotH - ((temp - tempMin) / (tempMax - tempMin)) * plotH;

  // Build temperature profile path
  const points: string[] = [];
  for (let c = 0; c < cyclesToShow; c++) {
    const offset = c * timing.singleCycleTime;
    // Start at cold dwell
    if (c === 0) points.push(`M ${toX(0)} ${toY(tempMin)}`);
    // Cold dwell
    points.push(`L ${toX(offset + timing.dwellCold)} ${toY(tempMin)}`);
    // Ramp up
    points.push(`L ${toX(offset + timing.dwellCold + timing.rampUpTime)} ${toY(tempMax)}`);
    // Hot dwell
    points.push(`L ${toX(offset + timing.dwellCold + timing.rampUpTime + timing.dwellHot)} ${toY(tempMax)}`);
    // Ramp down
    points.push(`L ${toX(offset + timing.singleCycleTime)} ${toY(tempMin)}`);
  }

  // Power supply current sync (simplified: current on during ramp/dwell, off during transitions)
  const currentPoints: string[] = [];
  const cyH = 30;
  const cyBase = height - 10;
  for (let c = 0; c < cyclesToShow; c++) {
    const offset = c * timing.singleCycleTime;
    const rampStart = offset + timing.dwellCold;
    const rampEnd = rampStart + timing.rampUpTime;
    const dwellEnd = rampEnd + timing.dwellHot;
    // Current injection during hot dwell
    if (c === 0) currentPoints.push(`M ${toX(0)} ${cyBase}`);
    currentPoints.push(`L ${toX(rampStart)} ${cyBase}`);
    currentPoints.push(`L ${toX(rampStart)} ${cyBase - cyH}`);
    currentPoints.push(`L ${toX(dwellEnd)} ${cyBase - cyH}`);
    currentPoints.push(`L ${toX(dwellEnd)} ${cyBase}`);
    currentPoints.push(`L ${toX(offset + timing.singleCycleTime)} ${cyBase}`);
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full bg-gray-900 rounded-lg border border-gray-700">
      {/* Grid */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#374151" strokeWidth="1" />
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#374151" strokeWidth="1" />

      {/* Y-axis labels */}
      <text x={padL - 8} y={toY(tempMax) + 4} textAnchor="end" fill="#9CA3AF" fontSize="11">{tempMax}°C</text>
      <text x={padL - 8} y={toY(tempMin) + 4} textAnchor="end" fill="#9CA3AF" fontSize="11">{tempMin}°C</text>
      <text x={padL - 8} y={toY((tempMax + tempMin) / 2) + 4} textAnchor="end" fill="#6B7280" fontSize="10">
        {((tempMax + tempMin) / 2).toFixed(0)}°C
      </text>

      {/* Horizontal grid lines */}
      <line x1={padL} y1={toY(tempMax)} x2={padL + plotW} y2={toY(tempMax)} stroke="#374151" strokeDasharray="4,4" />
      <line x1={padL} y1={toY(tempMin)} x2={padL + plotW} y2={toY(tempMin)} stroke="#374151" strokeDasharray="4,4" />
      <line x1={padL} y1={toY(0)} x2={padL + plotW} y2={toY(0)} stroke="#4B5563" strokeDasharray="2,4" />

      {/* Temperature curve */}
      <path d={points.join(' ')} fill="none" stroke="#3B82F6" strokeWidth="2.5" />

      {/* PS current sync overlay */}
      <path d={currentPoints.join(' ')} fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4,2" />

      {/* Cycle markers */}
      {Array.from({ length: cyclesToShow }).map((_, i) => {
        const cx = toX((i + 0.5) * timing.singleCycleTime);
        return (
          <text key={i} x={cx} y={padT + plotH + 16} textAnchor="middle" fill="#6B7280" fontSize="10">
            Cycle {i + 1}
          </text>
        );
      })}

      {/* Legend */}
      <line x1={padL + plotW - 180} y1={12} x2={padL + plotW - 155} y2={12} stroke="#3B82F6" strokeWidth="2.5" />
      <text x={padL + plotW - 150} y={16} fill="#9CA3AF" fontSize="10">Chamber Temp</text>
      <line x1={padL + plotW - 70} y1={12} x2={padL + plotW - 45} y2={12} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4,2" />
      <text x={padL + plotW - 40} y={16} fill="#9CA3AF" fontSize="10">PS Current</text>

      {/* X-axis label */}
      <text x={padL + plotW / 2} y={height - 2} textAnchor="middle" fill="#6B7280" fontSize="11">
        Time ({timing.singleCycleTime.toFixed(0)} min/cycle × {cyclesToShow} shown of {timing.totalCycles})
      </text>

      {/* Title */}
      <text x={padL + 4} y={18} fill="#D1D5DB" fontSize="12" fontWeight="bold">
        {TEST_SPECS[testType].label} — Chamber ↔ Power Supply Sync
      </text>
    </svg>
  );
}

// ─── Section Card ───────────────────────────────────────────────────────────────

function Section({ title, children, badge }: { title: string; children: React.ReactNode; badge?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="px-5 py-3 bg-gray-800/60 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">{title}</h3>
        {badge && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700">{badge}</span>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Input Field ────────────────────────────────────────────────────────────────

function Field({ label, unit, value, onChange, min, max, step, disabled, type = 'number' }: {
  label: string; unit?: string; value: number | string; onChange: (v: string) => void;
  min?: number; max?: number; step?: number; disabled?: boolean; type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-400 mb-1 block">{label}{unit && <span className="text-gray-500"> ({unit})</span>}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </label>
  );
}

// ─── Stat Display ───────────────────────────────────────────────────────────────

function Stat({ label, value, unit, accent }: { label: string; value: string | number; unit?: string; accent?: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${accent ? 'bg-blue-900/30 border border-blue-700' : 'bg-gray-800/60 border border-gray-700'}`}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-lg font-bold ${accent ? 'text-blue-300' : 'text-white'}`}>
        {value}{unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

// ─── Main Configurator Page ─────────────────────────────────────────────────────

export default function ConfiguratorPage() {
  // Module Profile State
  const [presetKey, setPresetKey] = useState<string>('HJT');
  const [moduleProfile, setModuleProfile] = useState<ModuleProfile>({ ...MODULE_PRESETS.HJT });
  const [customMode, setCustomMode] = useState(false);

  // Test Type State
  const [testType, setTestType] = useState<TestType>('TC');

  // Recipe Overrides
  const spec = TEST_SPECS[testType];
  const [tempMin, setTempMin] = useState(spec.tempMin);
  const [tempMax, setTempMax] = useState(spec.tempMax);
  const [rampRate, setRampRate] = useState(spec.rampRateDefault);
  const [dwellTime, setDwellTime] = useState(spec.dwellTimeDefault);
  const [cycles, setCycles] = useState(spec.cyclesDefault);

  // Rack Config
  const [channelCount, setChannelCount] = useState(10);

  // PID Config
  const [pidVoltage, setPidVoltage] = useState(1000);
  const [pidPolarity, setPidPolarity] = useState<'positive' | 'negative'>('negative');
  const [pidLeakageThreshold, setPidLeakageThreshold] = useState(PID_LEAKAGE_THRESHOLD_MA);

  // Apply preset
  const applyPreset = useCallback((key: string) => {
    setPresetKey(key);
    setModuleProfile({ ...MODULE_PRESETS[key] });
    setCustomMode(false);
  }, []);

  // Apply test type
  const applyTestType = useCallback((tt: TestType) => {
    setTestType(tt);
    const s = TEST_SPECS[tt];
    setTempMin(s.tempMin);
    setTempMax(s.tempMax);
    setRampRate(s.rampRateDefault);
    setDwellTime(s.dwellTimeDefault);
    setCycles(s.cyclesDefault);
  }, []);

  // Computed values
  const absiCurrent = useMemo(() =>
    calculateABSICurrent(moduleProfile.isc, moduleProfile.bifacialityFactor),
    [moduleProfile.isc, moduleProfile.bifacialityFactor]
  );

  const timing = useMemo(() =>
    calculateCycleTiming(tempMin, tempMax, rampRate, dwellTime, cycles),
    [tempMin, tempMax, rampRate, dwellTime, cycles]
  );

  const sizing = useMemo(() =>
    calculatePowerSupplySizing(moduleProfile.voc, absiCurrent, channelCount),
    [moduleProfile.voc, absiCurrent, channelCount]
  );

  const recipe = useMemo<RecipeConfig>(() =>
    buildRecipeConfig(testType, moduleProfile, {
      tempMin, tempMax, rampRate, dwellTime, cycles, channelCount,
      pidVoltage, pidPolarity, pidLeakageThreshold,
    }),
    [testType, moduleProfile, tempMin, tempMax, rampRate, dwellTime, cycles, channelCount, pidVoltage, pidPolarity, pidLeakageThreshold]
  );

  // ─── Export Functions ───────────────────────────────────────────────────────

  const exportJSON = useCallback(() => {
    const json = recipeToJSON(recipe);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipe_${testType}_${moduleProfile.technology}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [recipe, testType, moduleProfile.technology]);

  const exportPDF = useCallback(async () => {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();
    const s = TEST_SPECS[testType];

    doc.setFontSize(16);
    doc.text('PV Test Equipment — Recipe Sheet', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Antaryami Solar Analytics | ${new Date().toLocaleDateString('en-IN')}`, 14, 28);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Module Profile', 14, 40);
    (doc as any).autoTable({
      startY: 44,
      head: [['Parameter', 'Value']],
      body: [
        ['Technology', moduleProfile.technology],
        ['Type', moduleProfile.type],
        ['Voc', `${moduleProfile.voc} V`],
        ['Isc', `${moduleProfile.isc} A`],
        ['Pmax', `${moduleProfile.pmax} W`],
        ['Bifaciality Factor', moduleProfile.bifacialityFactor.toString()],
        ['ABSI Current', `${absiCurrent.toFixed(2)} A`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] },
    });

    const y1 = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Test: ${s.label} (${s.standard})`, 14, y1);
    (doc as any).autoTable({
      startY: y1 + 4,
      head: [['Parameter', 'Value']],
      body: [
        ['Temp Min', `${tempMin} °C`],
        ['Temp Max', `${tempMax} °C`],
        ['Ramp Rate', `${rampRate} °C/min`],
        ['Dwell Time', `${dwellTime} min`],
        ['Cycles', cycles.toString()],
        ['Humidity', spec.humidityRH ? `${spec.humidityRH} %RH` : 'N/A'],
        ['Total Test Time', formatDuration(timing.totalTestTime)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] },
    });

    const y2 = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Power Supply Sizing', 14, y2);
    (doc as any).autoTable({
      startY: y2 + 4,
      head: [['Parameter', 'Value']],
      body: [
        ['Channels', channelCount.toString()],
        ['Rated Voltage', `${sizing.ratedVoltage} V`],
        ['Rated Current / Ch', `${sizing.ratedCurrent} A`],
        ['Power / Channel', `${sizing.powerPerChannel.toFixed(0)} W`],
        ['Total Rated Power', `${sizing.ratedPowerTotal} W`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] },
    });

    if (testType === 'PID' && recipe.pidConfig) {
      const y3 = (doc as any).lastAutoTable.finalY + 10;
      doc.text('PID Configuration', 14, y3);
      (doc as any).autoTable({
        startY: y3 + 4,
        head: [['Parameter', 'Value']],
        body: [
          ['Voltage', `${recipe.pidConfig.polarity === 'negative' ? '-' : '+'}${recipe.pidConfig.voltage} V`],
          ['Current Range', `${formatCurrent(recipe.pidConfig.currentRangeMin)} – ${formatCurrent(recipe.pidConfig.currentRangeMax)}`],
          ['Leakage Interlock', `${pidLeakageThreshold} mA`],
          ['Duration', `${recipe.pidConfig.testDuration} hr`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [153, 27, 27] },
      });
    }

    doc.save(`recipe_${testType}_${moduleProfile.technology}_${Date.now()}.pdf`);
  }, [recipe, testType, moduleProfile, absiCurrent, tempMin, tempMax, rampRate, dwellTime, cycles, timing, sizing, channelCount, pidLeakageThreshold, spec]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 border-b border-blue-700 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Power Supply Configurator</h1>
            <p className="text-blue-300 text-sm mt-1">IEC 61215:2021 / IEC TS 62804-1:2025 — Recipe Builder & Rack Planner</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportJSON}
              className="px-4 py-2 text-sm bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
              Export JSON
            </button>
            <button onClick={exportPDF}
              className="px-4 py-2 text-sm bg-blue-700 border border-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
              Export PDF
            </button>
            <a href="/" className="px-4 py-2 text-sm bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center">
              Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-6 space-y-6">

        {/* ── Section 1: Module Profile ─────────────────────────────────────── */}
        <Section title="Module Profile" badge={moduleProfile.technology}>
          <div className="space-y-4">
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(MODULE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    presetKey === key && !customMode
                      ? 'bg-blue-700 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
              <button
                onClick={() => setCustomMode(true)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  customMode
                    ? 'bg-amber-700 border-amber-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Module Fields */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Field label="Voc" unit="V" value={moduleProfile.voc} min={0} max={200} step={0.1}
                disabled={!customMode}
                onChange={v => setModuleProfile(p => ({ ...p, voc: parseFloat(v) || 0 }))} />
              <Field label="Isc" unit="A" value={moduleProfile.isc} min={0} max={100} step={0.1}
                disabled={!customMode}
                onChange={v => setModuleProfile(p => ({ ...p, isc: parseFloat(v) || 0 }))} />
              <Field label="Pmax" unit="W" value={moduleProfile.pmax} min={0} max={5000} step={1}
                disabled={!customMode}
                onChange={v => setModuleProfile(p => ({ ...p, pmax: parseFloat(v) || 0 }))} />
              <div>
                <span className="text-xs text-gray-400 mb-1 block">Type</span>
                <select
                  value={moduleProfile.type}
                  disabled={!customMode}
                  onChange={e => {
                    const t = e.target.value as 'monofacial' | 'bifacial';
                    setModuleProfile(p => ({
                      ...p,
                      type: t,
                      bifacialityFactor: t === 'monofacial' ? 0 : p.bifacialityFactor || 0.85,
                    }));
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white disabled:opacity-50"
                >
                  <option value="monofacial">Monofacial</option>
                  <option value="bifacial">Bifacial</option>
                </select>
              </div>
              <Field label="Bifaciality Factor" value={moduleProfile.bifacialityFactor} min={0} max={1} step={0.01}
                disabled={!customMode || moduleProfile.type === 'monofacial'}
                onChange={v => setModuleProfile(p => ({ ...p, bifacialityFactor: parseFloat(v) || 0 }))} />
              <Stat label="ABSI Current" value={absiCurrent.toFixed(2)} unit="A" accent />
            </div>

            {/* ABSI Formula */}
            <div className="mt-2 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-xs text-gray-400">
                <span className="text-blue-400 font-mono">I_ABSI = Isc + (Isc × BF) × BF</span>
                {' '}= {moduleProfile.isc} + ({moduleProfile.isc} × {moduleProfile.bifacialityFactor}) × {moduleProfile.bifacialityFactor}
                {' '}= <span className="text-blue-300 font-semibold">{absiCurrent.toFixed(2)} A</span>
                <span className="ml-3 text-gray-500">| IEC 61215:2021 MQT 06</span>
              </p>
            </div>
          </div>
        </Section>

        {/* ── Section 2: Test Type Selector ──────────────────────────────────── */}
        <Section title="Test Type" badge={spec.standard}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(TEST_SPECS) as TestType[]).map(tt => {
                const s = TEST_SPECS[tt];
                return (
                  <button
                    key={tt}
                    onClick={() => applyTestType(tt)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      testType === tt
                        ? 'bg-blue-900/40 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-gray-800 border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <p className="text-sm font-bold text-white">{s.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.standard}</p>
                    <p className="text-xs text-gray-500 mt-2">{s.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ── Section 3: Recipe Builder ──────────────────────────────────────── */}
        <Section title="Recipe Builder" badge={`${formatDuration(timing.totalTestTime)} total`}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Field label="Temp Min" unit="°C" value={tempMin} min={-80} max={200}
              onChange={v => setTempMin(parseFloat(v) || 0)} />
            <Field label="Temp Max" unit="°C" value={tempMax} min={-80} max={200}
              onChange={v => setTempMax(parseFloat(v) || 0)} />
            <Field label="Ramp Rate" unit="°C/min" value={rampRate} min={0.1} max={20} step={0.1}
              onChange={v => setRampRate(parseFloat(v) || 0.1)} />
            <Field label={testType === 'LETID' || testType === 'PID' ? 'Dwell Time (hr)' : 'Dwell Time (min)'} value={dwellTime} min={1}
              onChange={v => setDwellTime(parseInt(v) || 1)} />
            <Field label="Cycles" value={cycles} min={1} max={10000}
              onChange={v => setCycles(parseInt(v) || 1)} />
          </div>

          {spec.humidityRH && (
            <div className="mt-3 px-4 py-2 bg-cyan-900/20 border border-cyan-800 rounded-lg">
              <p className="text-xs text-cyan-300">Humidity: {spec.humidityRH}% RH (per {spec.standard})</p>
            </div>
          )}

          {/* Timing stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <Stat label="Ramp Up" value={timing.rampUpTime.toFixed(1)} unit="min" />
            <Stat label="Ramp Down" value={timing.rampDownTime.toFixed(1)} unit="min" />
            <Stat label="Single Cycle" value={timing.singleCycleTime.toFixed(1)} unit="min" />
            <Stat label="Total Test Time" value={formatDuration(timing.totalTestTime)} accent />
          </div>
        </Section>

        {/* ── Section 4: PID Configuration (conditional) ────────────────────── */}
        {testType === 'PID' && (
          <Section title="PID Configuration" badge="IEC TS 62804-1:2025">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Test Voltage" unit="V" value={pidVoltage} min={100} max={4000} step={100}
                onChange={v => setPidVoltage(parseInt(v) || 1000)} />
              <div>
                <span className="text-xs text-gray-400 mb-1 block">Polarity</span>
                <select
                  value={pidPolarity}
                  onChange={e => setPidPolarity(e.target.value as 'positive' | 'negative')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white"
                >
                  <option value="negative">Negative (-V)</option>
                  <option value="positive">Positive (+V)</option>
                </select>
              </div>
              <Field label="Leakage Interlock" unit="mA" value={pidLeakageThreshold} min={0.1} max={50} step={0.1}
                onChange={v => setPidLeakageThreshold(parseFloat(v) || 5)} />
              <Stat label="Applied Voltage" value={`${pidPolarity === 'negative' ? '-' : '+'}${pidVoltage}`} unit="V" accent />
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <Stat label="Current Range Min" value={formatCurrent(1e-9)} />
              <Stat label="Current Range Max" value={formatCurrent(5e-3)} />
              <div className="p-3 rounded-lg bg-red-900/30 border border-red-700">
                <p className="text-xs text-gray-400">Safety Interlock</p>
                <p className="text-lg font-bold text-red-400">Trip @ {pidLeakageThreshold} mA</p>
              </div>
            </div>

            <div className="mt-3 px-4 py-2 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-xs text-red-300">
                WARNING: High voltage test. Safety interlock will trip and disconnect power at {pidLeakageThreshold} mA leakage current.
                All connections must use HV-rated cables and connectors. Operator must follow facility HV safety procedures.
              </p>
            </div>
          </Section>
        )}

        {/* ── Section 5: 10-Channel Rack Configurator ───────────────────────── */}
        <Section title="Rack Configurator" badge={`${channelCount} channels`}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Field label="Number of Channels" value={channelCount} min={1} max={20}
                onChange={v => setChannelCount(parseInt(v) || 1)} />
              <div className="flex-1" />
              <Stat label="Total Power" value={sizing.ratedPowerTotal.toLocaleString()} unit="W" accent />
            </div>

            {/* Channel Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Array.from({ length: channelCount }).map((_, i) => (
                <div key={i} className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">CH {i + 1}</p>
                  <p className="text-sm font-mono text-green-400">{moduleProfile.voc}V / {absiCurrent.toFixed(1)}A</p>
                  <p className="text-xs text-gray-500">{sizing.powerPerChannel.toFixed(0)} W</p>
                </div>
              ))}
            </div>

            {/* Sizing Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
              <Stat label="Rated Voltage" value={sizing.ratedVoltage} unit="V" />
              <Stat label="Rated Current / Ch" value={sizing.ratedCurrent} unit="A" />
              <Stat label="Power / Channel" value={sizing.powerPerChannel.toFixed(0)} unit="W" />
              <Stat label="Safety Margin" value={`${((sizing.safetyMargin - 1) * 100).toFixed(0)}%`} />
              <Stat label="Total Rated Power" value={sizing.ratedPowerTotal.toLocaleString()} unit="W" accent />
            </div>

            <div className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-xs text-gray-400">
                <span className="text-gray-300 font-semibold">Topology:</span>
                {testType === 'TC' || testType === 'HF'
                  ? ' Bidirectional regenerative, 4-wire Kelvin sensing, Modbus RTU/TCP'
                  : testType === 'PID'
                  ? ' Unidirectional HV DC, nA-resolution ammeter, safety interlock, Modbus RTU/TCP'
                  : ' Unidirectional precision CC/CV, 4-wire Kelvin sensing, Modbus RTU/TCP'
                }
              </p>
            </div>
          </div>
        </Section>

        {/* ── Section 6: Timing Diagram ─────────────────────────────────────── */}
        <Section title="Chamber ↔ Power Supply Timing Diagram">
          <TimingDiagram timing={timing} testType={testType} tempMin={tempMin} tempMax={tempMax} />
        </Section>

        {/* ── Section 7: Recipe Summary & Export ────────────────────────────── */}
        <Section title="Recipe Summary">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Key Parameters */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">Configuration Overview</h4>
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Test Type" value={spec.label} />
                <Stat label="Standard" value={spec.standard} />
                <Stat label="Module" value={`${moduleProfile.technology} ${moduleProfile.type}`} />
                <Stat label="ABSI Current" value={`${absiCurrent.toFixed(2)} A`} accent />
                <Stat label="Temperature Range" value={`${tempMin}°C to ${tempMax}°C`} />
                <Stat label="Total Duration" value={formatDuration(timing.totalTestTime)} accent />
                <Stat label="Channels" value={channelCount.toString()} />
                <Stat label="Total Power" value={`${sizing.ratedPowerTotal.toLocaleString()} W`} accent />
              </div>
            </div>

            {/* Right: JSON Preview */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">JSON Config Preview</h4>
              <pre className="p-4 bg-gray-800 border border-gray-700 rounded-lg text-xs text-green-300 overflow-auto max-h-80 font-mono">
                {recipeToJSON(recipe)}
              </pre>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
            <button onClick={exportPDF}
              className="px-6 py-2.5 text-sm font-medium bg-blue-700 border border-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
              Download PDF Recipe Sheet
            </button>
            <button onClick={exportJSON}
              className="px-6 py-2.5 text-sm font-medium bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
              Download JSON Config
            </button>
          </div>
        </Section>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-gray-600 border-t border-gray-800">
          Antaryami Solar Analytics — PV Test Equipment Power Supply Configurator
          <br />IEC 61215:2021 | IEC TS 62804-1:2025 | PVEL LETID Protocol
        </footer>
      </main>
    </div>
  );
}
