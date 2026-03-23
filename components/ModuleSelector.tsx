'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  moduleDatabase,
  manufacturers,
  technologies,
  type PVModule,
} from '@/data/moduleDatabase';

interface ModuleSelectorProps {
  onSelect?: (module: PVModule) => void;
  selected?: PVModule | null;
}

export default function ModuleSelector({ onSelect, selected }: ModuleSelectorProps) {
  const [search, setSearch] = useState('');
  const [filterMfr, setFilterMfr] = useState('');
  const [filterTech, setFilterTech] = useState('');

  const filtered = useMemo(() => {
    let list = moduleDatabase;
    if (filterMfr) list = list.filter((m) => m.manufacturer === filterMfr);
    if (filterTech) list = list.filter((m) => m.technology === filterTech);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.manufacturer.toLowerCase().includes(q) ||
          m.model.toLowerCase().includes(q) ||
          m.technology.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, filterMfr, filterTech]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">PV Module Selector</CardTitle>
        <p className="text-xs text-gray-400">
          {moduleDatabase.length} modules from {manufacturers.length} manufacturers
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Search model, manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterMfr}
            onChange={(e) => setFilterMfr(e.target.value)}
          >
            <option value="">All Manufacturers</option>
            {manufacturers.map((mfr) => (
              <option key={mfr} value={mfr}>
                {mfr}
              </option>
            ))}
          </select>
          <select
            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterTech}
            onChange={(e) => setFilterTech(e.target.value)}
          >
            <option value="">All Technologies</option>
            {technologies.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-500">{filtered.length} modules found</p>

        {/* Module list */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {filtered.map((mod) => {
            const isSelected =
              selected?.manufacturer === mod.manufacturer &&
              selected?.model === mod.model;
            return (
              <button
                key={`${mod.manufacturer}-${mod.model}`}
                onClick={() => onSelect?.(mod)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-100 truncate">
                      {mod.manufacturer} — {mod.model}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {mod.Pmax}W | Voc {mod.Voc}V | Isc {mod.Isc}A | {mod.efficiency}%
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {mod.technology}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected module detail */}
        {selected && (
          <div className="mt-4 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
            <h4 className="text-sm font-semibold text-blue-300 mb-3">
              Selected: {selected.manufacturer} {selected.model}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              {[
                { label: 'Pmax', value: `${selected.Pmax}W` },
                { label: 'Voc', value: `${selected.Voc}V` },
                { label: 'Isc', value: `${selected.Isc}A` },
                { label: 'Vmp', value: `${selected.Vmp}V` },
                { label: 'Imp', value: `${selected.Imp}A` },
                { label: 'Efficiency', value: `${selected.efficiency}%` },
                { label: 'Technology', value: selected.technology },
                { label: 'TC Vmax', value: `${selected.testLimits.tc.Vmax}V` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-blue-200 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="text-xs p-2 rounded bg-gray-800">
                <span className="text-gray-500">TC:</span>{' '}
                <span className="text-gray-300">
                  {selected.testLimits.tc.Vmax}V / {selected.testLimits.tc.Isc}A
                </span>
              </div>
              <div className="text-xs p-2 rounded bg-gray-800">
                <span className="text-gray-500">HF:</span>{' '}
                <span className="text-gray-300">
                  {selected.testLimits.hf.Vmax}V / {selected.testLimits.hf.freq} cyc
                </span>
              </div>
              <div className="text-xs p-2 rounded bg-gray-800">
                <span className="text-gray-500">LETID:</span>{' '}
                <span className="text-gray-300">
                  {selected.testLimits.letid.Iinject}A / {selected.testLimits.letid.cellTemp}C
                </span>
              </div>
              <div className="text-xs p-2 rounded bg-gray-800">
                <span className="text-gray-500">PID:</span>{' '}
                <span className="text-gray-300">
                  {selected.testLimits.pid.Vbias}V / {selected.testLimits.pid.duration}h
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
