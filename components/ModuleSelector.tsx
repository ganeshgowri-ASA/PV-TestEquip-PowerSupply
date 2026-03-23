'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MODULE_DATABASE,
  MANUFACTURERS,
  TECHNOLOGIES,
  filterModules,
  type PVModule,
  type Technology,
} from '@/data/moduleDatabase';

interface ModuleSelectorProps {
  selectedModule: PVModule | null;
  onSelectModule: (mod: PVModule | null) => void;
}

export default function ModuleSelector({ selectedModule, onSelectModule }: ModuleSelectorProps) {
  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState<Technology | 'ALL'>('ALL');
  const [mfgFilter, setMfgFilter] = useState('ALL');
  const [wattageRange, setWattageRange] = useState<[number, number]>([0, 1000]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showCustom, setShowCustom] = useState(false);
  const [customModule, setCustomModule] = useState<Partial<PVModule>>({
    manufacturer: '', model: '', technology: 'PERC', Pmax: 0, Voc: 0, Isc: 0, Vmp: 0, Imp: 0, efficiency: 0, wafer: 'M10',
  });

  const filteredModules = useMemo(() => {
    return filterModules({
      search,
      technology: techFilter,
      manufacturer: mfgFilter,
      wattageMin: wattageRange[0] || undefined,
      wattageMax: wattageRange[1] || undefined,
    });
  }, [search, techFilter, mfgFilter, wattageRange]);

  const handleCustomSubmit = () => {
    const cm = customModule;
    if (!cm.manufacturer || !cm.model || !cm.Voc || !cm.Isc || !cm.Pmax) return;
    const tech = (cm.technology || 'PERC') as Technology;
    const mod: PVModule = {
      id: `custom-${Date.now()}`,
      manufacturer: cm.manufacturer!,
      model: cm.model!,
      technology: tech,
      Pmax: cm.Pmax!,
      Voc: cm.Voc!,
      Isc: cm.Isc!,
      Vmp: cm.Vmp || cm.Voc! * 0.84,
      Imp: cm.Imp || cm.Isc! * 0.94,
      efficiency: cm.efficiency || 0,
      wafer: cm.wafer || 'M10',
      testLimits: {
        tc: { Vmax: cm.Voc! * 1.15, Isc_TC: cm.Isc! },
        hf: { Vmax: cm.Voc! * 1.15, frequency: 1, Isc_HF: cm.Isc! },
        letid: { Iinject: cm.Isc!, Voc: cm.Voc!, cellTemp: 75 },
        pid: { Vbias: 1500, Imax_leak: 5, duration: 96 },
      },
    };
    onSelectModule(mod);
    setShowCustom(false);
  };

  const techColors: Record<string, string> = {
    PERC: 'bg-blue-900 text-blue-300',
    TOPCon: 'bg-emerald-900 text-emerald-300',
    HJT: 'bg-purple-900 text-purple-300',
    HBC: 'bg-orange-900 text-orange-300',
    Bifacial: 'bg-cyan-900 text-cyan-300',
    Monofacial: 'bg-gray-700 text-gray-300',
    Tandem: 'bg-pink-900 text-pink-300',
    CIGS: 'bg-lime-900 text-lime-300',
    CdTe: 'bg-amber-900 text-amber-300',
    'n-type': 'bg-indigo-900 text-indigo-300',
    'p-type': 'bg-rose-900 text-rose-300',
  };

  return (
    <div className="space-y-4">
      {/* Selected Module Badge */}
      {selectedModule && (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700 rounded-lg">
          <Badge className={techColors[selectedModule.technology] || 'bg-gray-700'}>
            {selectedModule.technology}
          </Badge>
          <div className="flex-1">
            <span className="font-semibold text-white">{selectedModule.manufacturer}</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-blue-300">{selectedModule.model}</span>
          </div>
          <div className="text-sm text-gray-400 space-x-4">
            <span>{selectedModule.Pmax}W</span>
            <span>{selectedModule.Voc}V</span>
            <span>{selectedModule.Isc}A</span>
            <span>{selectedModule.efficiency}%</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => onSelectModule(null)}>Clear</Button>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Module Selector</CardTitle>
            <div className="flex gap-2">
              <button onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded text-xs ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Table</button>
              <button onClick={() => setViewMode('card')}
                className={`px-2 py-1 rounded text-xs ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Cards</button>
              <Button size="sm" variant="outline" onClick={() => setShowCustom(!showCustom)}>
                {showCustom ? 'Hide Custom' : 'Custom Module'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search + Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Search manufacturer or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={techFilter} onChange={(e) => setTechFilter(e.target.value as Technology | 'ALL')}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
              <option value="ALL">All Technologies</option>
              {TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={mfgFilter} onChange={(e) => setMfgFilter(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
              <option value="ALL">All Manufacturers</option>
              {MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex gap-2 items-center">
              <Input type="number" placeholder="Min W" value={wattageRange[0] || ''}
                onChange={(e) => setWattageRange([Number(e.target.value), wattageRange[1]])} className="w-20" />
              <span className="text-gray-500 text-xs">to</span>
              <Input type="number" placeholder="Max W" value={wattageRange[1] || ''}
                onChange={(e) => setWattageRange([wattageRange[0], Number(e.target.value)])} className="w-20" />
              <span className="text-gray-500 text-xs">W</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">{filteredModules.length} modules found from {MODULE_DATABASE.length} total</p>

          {/* Custom Module Entry */}
          {showCustom && (
            <div className="border border-dashed border-yellow-600 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-yellow-400">Custom Module Entry</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Manufacturer</label>
                  <Input value={customModule.manufacturer} onChange={(e) => setCustomModule(p => ({ ...p, manufacturer: e.target.value }))} placeholder="e.g. Custom" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Model</label>
                  <Input value={customModule.model} onChange={(e) => setCustomModule(p => ({ ...p, model: e.target.value }))} placeholder="e.g. CST-600" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Technology</label>
                  <select value={customModule.technology} onChange={(e) => setCustomModule(p => ({ ...p, technology: e.target.value as Technology }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
                    {TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Wafer</label>
                  <select value={customModule.wafer} onChange={(e) => setCustomModule(p => ({ ...p, wafer: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
                    {['M2', 'M6', 'M10', 'G12', 'N/A'].map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Pmax (W)</label>
                  <Input type="number" value={customModule.Pmax || ''} onChange={(e) => setCustomModule(p => ({ ...p, Pmax: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Voc (V)</label>
                  <Input type="number" value={customModule.Voc || ''} onChange={(e) => setCustomModule(p => ({ ...p, Voc: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Isc (A)</label>
                  <Input type="number" value={customModule.Isc || ''} onChange={(e) => setCustomModule(p => ({ ...p, Isc: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Efficiency (%)</label>
                  <Input type="number" value={customModule.efficiency || ''} onChange={(e) => setCustomModule(p => ({ ...p, efficiency: Number(e.target.value) }))} />
                </div>
              </div>
              <Button size="sm" onClick={handleCustomSubmit}>Use Custom Module</Button>
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' ? (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="text-left p-2">Manufacturer</th>
                    <th className="text-left p-2">Model</th>
                    <th className="text-center p-2">Tech</th>
                    <th className="text-right p-2">Pmax</th>
                    <th className="text-right p-2">Voc</th>
                    <th className="text-right p-2">Isc</th>
                    <th className="text-right p-2">Eff%</th>
                    <th className="text-center p-2">Wafer</th>
                    <th className="text-center p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModules.map((mod) => (
                    <tr key={mod.id}
                      className={`border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${selectedModule?.id === mod.id ? 'bg-blue-900/20 border-blue-700' : ''}`}
                      onClick={() => onSelectModule(mod)}>
                      <td className="p-2 text-xs font-medium text-gray-300">{mod.manufacturer}</td>
                      <td className="p-2 text-xs text-blue-300">{mod.model}</td>
                      <td className="p-2 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${techColors[mod.technology] || 'bg-gray-700'}`}>
                          {mod.technology}
                        </span>
                      </td>
                      <td className="p-2 text-right text-xs font-mono">{mod.Pmax}W</td>
                      <td className="p-2 text-right text-xs font-mono">{mod.Voc}V</td>
                      <td className="p-2 text-right text-xs font-mono">{mod.Isc}A</td>
                      <td className="p-2 text-right text-xs font-mono">{mod.efficiency}%</td>
                      <td className="p-2 text-center text-xs text-gray-400">{mod.wafer}</td>
                      <td className="p-2 text-center">
                        <Button size="sm" variant={selectedModule?.id === mod.id ? 'default' : 'outline'}
                          className="h-6 px-2 text-xs"
                          onClick={(e) => { e.stopPropagation(); onSelectModule(mod); }}>
                          {selectedModule?.id === mod.id ? 'Selected' : 'Select'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
              {filteredModules.map((mod) => (
                <div key={mod.id}
                  onClick={() => onSelectModule(mod)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedModule?.id === mod.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{mod.manufacturer}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${techColors[mod.technology] || 'bg-gray-700'}`}>
                      {mod.technology}
                    </span>
                  </div>
                  <p className="text-xs text-blue-300 mb-2">{mod.model}</p>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-gray-500">Pmax</p>
                      <p className="font-mono text-gray-300">{mod.Pmax}W</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Voc</p>
                      <p className="font-mono text-gray-300">{mod.Voc}V</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Isc</p>
                      <p className="font-mono text-gray-300">{mod.Isc}A</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Eff</p>
                      <p className="font-mono text-gray-300">{mod.efficiency}%</p>
                    </div>
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
