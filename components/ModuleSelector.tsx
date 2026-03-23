'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  type PVModule,
  MODULE_DATABASE,
  ALL_MANUFACTURERS,
  ALL_TECHNOLOGIES,
  filterModules,
} from '@/data/moduleDatabase';

interface ModuleSelectorProps {
  onSelect?: (module: PVModule) => void;
  selected?: PVModule | null;
}

export default function ModuleSelector({ onSelect, selected }: ModuleSelectorProps) {
  const [search, setSearch] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [technology, setTechnology] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterModules({ search, manufacturer: manufacturer || undefined, technology: technology || undefined }),
    [search, manufacturer, technology],
  );

  const handleSelect = (m: PVModule) => {
    onSelect?.(m);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">PV Module Selector</CardTitle>
        <p className="text-xs text-gray-400">
          {MODULE_DATABASE.length} modules · {ALL_MANUFACTURERS.length} manufacturers · {ALL_TECHNOLOGIES.length} technologies
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input
            placeholder="Search model or manufacturer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
          >
            <option value="">All Manufacturers</option>
            {ALL_MANUFACTURERS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
          >
            <option value="">All Technologies</option>
            {ALL_TECHNOLOGIES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <p className="text-xs text-gray-500">{filtered.length} module{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Module list */}
        <div className="max-h-[420px] overflow-y-auto space-y-1 pr-1">
          {filtered.map((m) => {
            const key = `${m.manufacturer}|${m.model}`;
            const isSelected = selected?.model === m.model && selected?.manufacturer === m.manufacturer;
            const isExpanded = expanded === key;

            return (
              <div
                key={key}
                className={`rounded-md border p-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/40'
                    : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
                }`}
              >
                <div
                  className="flex items-center justify-between gap-2"
                  onClick={() => handleSelect(m)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{m.manufacturer} — {m.model}</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{m.technology}</Badge>
                      <span className="text-xs text-gray-400">{m.Pmax}W · {m.efficiency}%</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-blue-400 hover:text-blue-300 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(isExpanded ? null : key);
                    }}
                  >
                    {isExpanded ? '▾ less' : '▸ specs'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-gray-700 space-y-2">
                    {/* Electrical specs */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                      {([
                        ['Pmax', `${m.Pmax}W`],
                        ['Voc', `${m.Voc}V`],
                        ['Isc', `${m.Isc}A`],
                        ['Vmp', `${m.Vmp}V`],
                        ['Imp', `${m.Imp}A`],
                        ['Eff', `${m.efficiency}%`],
                      ] as const).map(([label, val]) => (
                        <div key={label}>
                          <p className="text-[10px] text-gray-500 uppercase">{label}</p>
                          <p className="text-xs font-mono text-blue-300">{val}</p>
                        </div>
                      ))}
                    </div>
                    {/* Test limits */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-gray-900 rounded p-1.5">
                        <p className="text-[10px] text-gray-500 font-semibold mb-0.5">TC</p>
                        <p>Vmax: {m.testLimits.tc.Vmax}V</p>
                        <p>Isc: {m.testLimits.tc.Isc}A</p>
                      </div>
                      <div className="bg-gray-900 rounded p-1.5">
                        <p className="text-[10px] text-gray-500 font-semibold mb-0.5">HF</p>
                        <p>Vmax: {m.testLimits.hf.Vmax}V</p>
                        <p>Freq: {m.testLimits.hf.freq}Hz</p>
                        <p>Isc: {m.testLimits.hf.Isc}A</p>
                      </div>
                      <div className="bg-gray-900 rounded p-1.5">
                        <p className="text-[10px] text-gray-500 font-semibold mb-0.5">LETID</p>
                        <p>Iinj: {m.testLimits.letid.Iinject}A</p>
                        <p>Voc: {m.testLimits.letid.Voc}V</p>
                        <p>Cell: {m.testLimits.letid.cellTemp}°C</p>
                      </div>
                      <div className="bg-gray-900 rounded p-1.5">
                        <p className="text-[10px] text-gray-500 font-semibold mb-0.5">PID</p>
                        <p>Vbias: {m.testLimits.pid.Vbias}V</p>
                        <p>Ileak: {m.testLimits.pid.ImaxLeak}mA</p>
                        <p>Dur: {m.testLimits.pid.duration}h</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
