'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MODULE_DATABASE,
  ALL_TECHNOLOGIES,
  MANUFACTURERS,
  type PVModule,
  type Technology,
} from '@/data/moduleDatabase';

interface ModuleSelectorProps {
  selectedModule: PVModule | null;
  onSelectModule: (mod: PVModule | null) => void;
}

const WATTAGE_RANGES = [
  { label: 'All', min: 0, max: 9999 },
  { label: '300-450W', min: 300, max: 450 },
  { label: '450-550W', min: 450, max: 550 },
  { label: '550-650W', min: 550, max: 650 },
  { label: '650-750W', min: 650, max: 750 },
];

export default function ModuleSelector({ selectedModule, onSelectModule }: ModuleSelectorProps) {
  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState<'ALL' | Technology>('ALL');
  const [mfgFilter, setMfgFilter] = useState('ALL');
  const [wattageIdx, setWattageIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showCustom, setShowCustom] = useState(false);
  const [customModule, setCustomModule] = useState<Partial<PVModule>>({
    manufacturer: '', model: '', technology: 'PERC' as Technology,
    Pmax: 0, Voc: 0, Isc: 0, Vmp: 0, Imp: 0, efficiency: 0,
  });

  const wattageRange = WATTAGE_RANGES[wattageIdx];

  const filtered = useMemo(() => {
    return MODULE_DATABASE.filter(m => {
      const matchSearch = search === '' ||
        m.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
        m.model.toLowerCase().includes(search.toLowerCase());
      const matchTech = techFilter === 'ALL' || m.technology === techFilter;
      const matchMfg = mfgFilter === 'ALL' || m.manufacturer === mfgFilter;
      const matchWatt = m.Pmax >= wattageRange.min && m.Pmax <= wattageRange.max;
      return matchSearch && matchTech && matchMfg && matchWatt;
    });
  }, [search, techFilter, mfgFilter, wattageRange]);

  const handleCustomSubmit = () => {
    const c = customModule;
    if (!c.manufacturer || !c.model || !c.Voc || !c.Isc || !c.Pmax) return;
    const tech = (c.technology || 'PERC') as Technology;
    const pidV = tech === 'HJT' || tech === 'HBC' ? 4000 : tech === 'TOPCon' || tech === 'n-type' ? 2000 : 1000;
    const mod: PVModule = {
      id: `custom-${Date.now()}`,
      manufacturer: c.manufacturer || 'Custom',
      model: c.model || 'Custom Module',
      technology: tech,
      Pmax: c.Pmax || 0,
      Voc: c.Voc || 0,
      Isc: c.Isc || 0,
      Vmp: c.Vmp || 0,
      Imp: c.Imp || 0,
      efficiency: c.efficiency || 0,
      testLimits: {
        tc: { Vmax: (c.Voc || 0) * 1.1, Isc_TC: c.Isc || 0 },
        hf: { Vmax: (c.Voc || 0) * 1.1, frequency: 1, Isc_HF: c.Isc || 0 },
        letid: { Iinject: c.Isc || 0, Voc: c.Voc || 0, cellTemp: 75 },
        pid: { Vbias: pidV, Imax_leak: 5, duration: 96 },
      },
    };
    onSelectModule(mod);
    setShowCustom(false);
  };

  return (
    <div className="space-y-4">
      {/* Selected Module Badge */}
      {selectedModule && (
        <div className="flex items-center gap-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
          <Badge variant="default" className="text-sm px-3 py-1">Selected</Badge>
          <span className="text-sm font-semibold text-blue-300">
            {selectedModule.manufacturer} {selectedModule.model}
          </span>
          <Badge variant="outline" className="text-xs">{selectedModule.technology}</Badge>
          <span className="text-xs text-gray-400">
            {selectedModule.Pmax}W | Voc={selectedModule.Voc}V | Isc={selectedModule.Isc}A | {selectedModule.efficiency}%
          </span>
          <Button size="sm" variant="ghost" className="ml-auto text-xs" onClick={() => onSelectModule(null)}>
            Clear
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">PV Module Selector</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant={viewMode === 'table' ? 'default' : 'outline'} onClick={() => setViewMode('table')} className="text-xs h-7">Table</Button>
              <Button size="sm" variant={viewMode === 'card' ? 'default' : 'outline'} onClick={() => setViewMode('card')} className="text-xs h-7">Cards</Button>
              <Button size="sm" variant="outline" onClick={() => setShowCustom(!showCustom)} className="text-xs h-7">
                {showCustom ? 'Hide Custom' : 'Custom Module'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Search</label>
              <Input
                placeholder="Search manufacturer or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Technology</label>
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value as 'ALL' | Technology)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              >
                <option value="ALL">All Technologies</option>
                {ALL_TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Manufacturer</label>
              <select
                value={mfgFilter}
                onChange={(e) => setMfgFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              >
                <option value="ALL">All Manufacturers</option>
                {MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Wattage Range</label>
              <select
                value={wattageIdx}
                onChange={(e) => setWattageIdx(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              >
                {WATTAGE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
              </select>
            </div>
          </div>

          <p className="text-xs text-gray-500">{filtered.length} modules found</p>

          {/* Custom Module Entry */}
          {showCustom && (
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg space-y-3">
              <p className="text-sm font-medium text-yellow-400">Custom Module Entry</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Manufacturer</label>
                  <Input className="h-7 text-xs" value={customModule.manufacturer || ''} onChange={e => setCustomModule(p => ({ ...p, manufacturer: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Model</label>
                  <Input className="h-7 text-xs" value={customModule.model || ''} onChange={e => setCustomModule(p => ({ ...p, model: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Technology</label>
                  <select value={customModule.technology || 'PERC'} onChange={e => setCustomModule(p => ({ ...p, technology: e.target.value as Technology }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white h-7">
                    {ALL_TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Pmax (W)</label>
                  <Input className="h-7 text-xs" type="number" value={customModule.Pmax || ''} onChange={e => setCustomModule(p => ({ ...p, Pmax: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Efficiency (%)</label>
                  <Input className="h-7 text-xs" type="number" step="0.1" value={customModule.efficiency || ''} onChange={e => setCustomModule(p => ({ ...p, efficiency: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Voc (V)</label>
                  <Input className="h-7 text-xs" type="number" step="0.1" value={customModule.Voc || ''} onChange={e => setCustomModule(p => ({ ...p, Voc: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Isc (A)</label>
                  <Input className="h-7 text-xs" type="number" step="0.01" value={customModule.Isc || ''} onChange={e => setCustomModule(p => ({ ...p, Isc: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Vmp (V)</label>
                  <Input className="h-7 text-xs" type="number" step="0.1" value={customModule.Vmp || ''} onChange={e => setCustomModule(p => ({ ...p, Vmp: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Imp (A)</label>
                  <Input className="h-7 text-xs" type="number" step="0.01" value={customModule.Imp || ''} onChange={e => setCustomModule(p => ({ ...p, Imp: Number(e.target.value) }))} />
                </div>
                <div className="flex items-end">
                  <Button size="sm" onClick={handleCustomSubmit} className="h-7 text-xs">Use Custom Module</Button>
                </div>
              </div>
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900 z-10">
                  <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="text-left p-2">Manufacturer</th>
                    <th className="text-left p-2">Model</th>
                    <th className="text-center p-2">Tech</th>
                    <th className="text-right p-2">Pmax</th>
                    <th className="text-right p-2">Voc</th>
                    <th className="text-right p-2">Isc</th>
                    <th className="text-right p-2">Eff.</th>
                    <th className="text-center p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => (
                    <tr
                      key={m.id}
                      className={`border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer ${selectedModule?.id === m.id ? 'bg-blue-900/20 border-blue-700' : ''}`}
                      onClick={() => onSelectModule(m)}
                    >
                      <td className="p-2 text-xs text-gray-300">{m.manufacturer}</td>
                      <td className="p-2 text-xs text-blue-300 font-mono">{m.model}</td>
                      <td className="p-2 text-center"><Badge variant="outline" className="text-xs">{m.technology}</Badge></td>
                      <td className="p-2 text-right text-xs font-mono">{m.Pmax}W</td>
                      <td className="p-2 text-right text-xs font-mono">{m.Voc}V</td>
                      <td className="p-2 text-right text-xs font-mono">{m.Isc}A</td>
                      <td className="p-2 text-right text-xs font-mono">{m.efficiency}%</td>
                      <td className="p-2 text-center">
                        <Button size="sm" variant={selectedModule?.id === m.id ? 'default' : 'ghost'} className="h-6 px-2 text-xs"
                          onClick={(e) => { e.stopPropagation(); onSelectModule(m); }}>
                          {selectedModule?.id === m.id ? 'Selected' : 'Select'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Card View */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
              {filtered.map(m => (
                <div
                  key={m.id}
                  onClick={() => onSelectModule(m)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedModule?.id === m.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-400">{m.manufacturer}</p>
                      <p className="text-sm font-medium text-blue-300">{m.model}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{m.technology}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-gray-500">Pmax: <span className="text-gray-300 font-mono">{m.Pmax}W</span></span>
                    <span className="text-gray-500">Eff: <span className="text-gray-300 font-mono">{m.efficiency}%</span></span>
                    <span className="text-gray-500">Voc: <span className="text-gray-300 font-mono">{m.Voc}V</span></span>
                    <span className="text-gray-500">Isc: <span className="text-gray-300 font-mono">{m.Isc}A</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
