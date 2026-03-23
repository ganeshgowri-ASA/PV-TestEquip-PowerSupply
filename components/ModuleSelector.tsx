'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  type PVModule,
  moduleDatabase,
  manufacturers,
  technologies,
  filterModules,
} from '@/data/moduleDatabase';

interface ModuleSelectorProps {
  onSelect?: (module: PVModule) => void;
  selected?: PVModule | null;
}

export default function ModuleSelector({ onSelect, selected }: ModuleSelectorProps) {
  const [search, setSearch] = useState('');
  const [mfgFilter, setMfgFilter] = useState('');
  const [techFilter, setTechFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterModules({ manufacturer: mfgFilter || undefined, technology: techFilter || undefined, search: search || undefined }),
    [search, mfgFilter, techFilter]
  );

  const handleSelect = (mod: PVModule) => {
    onSelect?.(mod);
  };

  const toggleExpand = (key: string) => {
    setExpanded((prev) => (prev === key ? null : key));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">PV Module Selector</CardTitle>
        <p className="text-xs text-gray-400">{moduleDatabase.length} modules from {manufacturers.length} manufacturers</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search model, manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={mfgFilter}
            onChange={(e) => setMfgFilter(e.target.value)}
            className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Manufacturers</option>
            {manufacturers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Technologies</option>
            {technologies.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-500">{filtered.length} module{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Module list */}
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
          {filtered.map((mod) => {
            const key = `${mod.manufacturer}-${mod.model}`;
            const isSelected = selected?.manufacturer === mod.manufacturer && selected?.model === mod.model;
            const isExpanded = expanded === key;

            return (
              <div
                key={key}
                className={`rounded-lg border p-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/30'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
                onClick={() => handleSelect(mod)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-200">{mod.manufacturer}</span>
                      <Badge variant="secondary" className="text-[10px]">{mod.technology}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{mod.model}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-blue-300">{mod.Pmax}W</p>
                    <p className="text-[10px] text-gray-500">{mod.efficiency}%</p>
                  </div>
                </div>

                {/* Quick specs row */}
                <div className="flex gap-3 mt-2 text-[11px] text-gray-500">
                  <span>Voc: {mod.Voc}V</span>
                  <span>Isc: {mod.Isc}A</span>
                  <span>Vmp: {mod.Vmp}V</span>
                  <span>Imp: {mod.Imp}A</span>
                </div>

                {/* Expand toggle */}
                <button
                  className="text-[10px] text-blue-400 mt-1 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(key);
                  }}
                >
                  {isExpanded ? 'Hide test limits' : 'Show test limits'}
                </button>

                {isExpanded && (
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                    <div className="rounded bg-gray-800 p-2">
                      <p className="font-medium text-orange-300 mb-1">TC</p>
                      <p>Vmax: {mod.testLimits.tc.Vmax.toFixed(1)}V</p>
                      <p>Isc: {mod.testLimits.tc.Isc}A</p>
                    </div>
                    <div className="rounded bg-gray-800 p-2">
                      <p className="font-medium text-cyan-300 mb-1">HF</p>
                      <p>Vmax: {mod.testLimits.hf.Vmax.toFixed(1)}V</p>
                      <p>Freq: {mod.testLimits.hf.freq} cyc</p>
                      <p>Isc: {mod.testLimits.hf.Isc}A</p>
                    </div>
                    <div className="rounded bg-gray-800 p-2">
                      <p className="font-medium text-yellow-300 mb-1">LETID</p>
                      <p>Iinject: {mod.testLimits.letid.Iinject}A</p>
                      <p>Voc: {mod.testLimits.letid.Voc}V</p>
                      <p>Temp: {mod.testLimits.letid.cellTemp}&deg;C</p>
                    </div>
                    <div className="rounded bg-gray-800 p-2">
                      <p className="font-medium text-red-300 mb-1">PID</p>
                      <p>Vbias: {mod.testLimits.pid.Vbias}V</p>
                      <p>Imax: {mod.testLimits.pid.ImaxLeak}mA</p>
                      <p>Dur: {mod.testLimits.pid.duration}h</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No modules match your filters.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
