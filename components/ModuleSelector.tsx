'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MODULE_DATABASE, MANUFACTURERS, TECHNOLOGIES, type PVModule, type Technology } from '@/data/moduleDatabase';

interface ModuleSelectorProps {
  selectedModule: PVModule | null;
  onSelectModule: (mod: PVModule | null) => void;
}

export default function ModuleSelector({ selectedModule, onSelectModule }: ModuleSelectorProps) {
  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState<Technology | 'ALL'>('ALL');
  const [mfgFilter, setMfgFilter] = useState('ALL');
  const [wattageRange, setWattageRange] = useState<[number, number]>([400, 750]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showCustom, setShowCustom] = useState(false);
  const [customModule, setCustomModule] = useState<PVModule>({
    id: 'custom-1',
    manufacturer: '',
    model: '',
    technology: 'PERC',
    Pmax: 0,
    Voc: 0,
    Isc: 0,
    Vmp: 0,
    Imp: 0,
    efficiency: 0,
    wafer: 'M10',
    testLimits: {
      tc: { Vmax: 0, Isc_TC: 0 },
      hf: { Vmax: 0, frequency: 1, Isc_HF: 0 },
      letid: { Iinject: 0, Voc: 0, cellTemp: 75 },
      pid: { Vbias: 1000, Imax_leak: 5, duration: 96 },
    },
  });

  const filtered = useMemo(() => {
    return MODULE_DATABASE.filter((m) => {
      if (search && !m.model.toLowerCase().includes(search.toLowerCase()) && !m.manufacturer.toLowerCase().includes(search.toLowerCase())) return false;
      if (techFilter !== 'ALL' && m.technology !== techFilter) return false;
      if (mfgFilter !== 'ALL' && m.manufacturer !== mfgFilter) return false;
      if (m.Pmax < wattageRange[0] || m.Pmax > wattageRange[1]) return false;
      return true;
    });
  }, [search, techFilter, mfgFilter, wattageRange]);

  const handleCustomSubmit = () => {
    const m = { ...customModule };
    m.testLimits = {
      tc: { Vmax: m.Voc * 1.15, Isc_TC: m.Isc },
      hf: { Vmax: m.Voc * 1.15, frequency: 1, Isc_HF: m.Isc },
      letid: { Iinject: m.Isc, Voc: m.Voc, cellTemp: 75 },
      pid: { Vbias: 1000, Imax_leak: 5, duration: 96 },
    };
    onSelectModule(m);
    setShowCustom(false);
  };

  return (
    <div className="space-y-4">
      {/* Selected Module Badge */}
      {selectedModule && (
        <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
          <Badge variant="success">Selected</Badge>
          <span className="text-sm font-medium text-blue-200">
            {selectedModule.manufacturer} {selectedModule.model}
          </span>
          <Badge variant="outline" className="text-xs">{selectedModule.technology}</Badge>
          <span className="text-xs text-gray-400">
            {selectedModule.Pmax}W | Voc={selectedModule.Voc}V | Isc={selectedModule.Isc}A | {selectedModule.efficiency}%
          </span>
          <Button size="sm" variant="outline" className="ml-auto h-6 text-xs" onClick={() => onSelectModule(null)}>
            Clear
          </Button>
        </div>
      )}

      {/* Search & Filters */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">PV Module Database ({MODULE_DATABASE.length} modules)</CardTitle>
            <div className="flex gap-2">
              <button onClick={() => setViewMode('table')} className={`px-2 py-1 rounded text-xs ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Table</button>
              <button onClick={() => setViewMode('card')} className={`px-2 py-1 rounded text-xs ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Cards</button>
              <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => setShowCustom(!showCustom)}>
                {showCustom ? 'Hide Custom' : '+ Custom Module'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search Bar */}
          <Input
            placeholder="Search by manufacturer or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm"
          />

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Technology</label>
              <select value={techFilter} onChange={(e) => setTechFilter(e.target.value as Technology | 'ALL')}
                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white">
                <option value="ALL">All Technologies</option>
                {TECHNOLOGIES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Manufacturer</label>
              <select value={mfgFilter} onChange={(e) => setMfgFilter(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white">
                <option value="ALL">All Manufacturers</option>
                {MANUFACTURERS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Min Wattage</label>
              <Input type="number" value={wattageRange[0]} onChange={(e) => setWattageRange([Number(e.target.value), wattageRange[1]])}
                className="w-20 h-7 text-xs" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Max Wattage</label>
              <Input type="number" value={wattageRange[1]} onChange={(e) => setWattageRange([wattageRange[0], Number(e.target.value)])}
                className="w-20 h-7 text-xs" />
            </div>
            <div className="flex items-end">
              <span className="text-xs text-gray-500 mb-1">{filtered.length} results</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Module Form */}
      {showCustom && (
        <Card className="border-yellow-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-400">Custom Module Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Manufacturer</label>
                <Input value={customModule.manufacturer} onChange={(e) => setCustomModule({ ...customModule, manufacturer: e.target.value })} className="h-7 text-xs" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Model</label>
                <Input value={customModule.model} onChange={(e) => setCustomModule({ ...customModule, model: e.target.value })} className="h-7 text-xs" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Technology</label>
                <select value={customModule.technology} onChange={(e) => setCustomModule({ ...customModule, technology: e.target.value as Technology })}
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white w-full h-7">
                  {TECHNOLOGIES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Pmax (W)</label>
                <Input type="number" value={customModule.Pmax || ''} onChange={(e) => setCustomModule({ ...customModule, Pmax: Number(e.target.value) })} className="h-7 text-xs" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Voc (V)</label>
                <Input type="number" value={customModule.Voc || ''} onChange={(e) => setCustomModule({ ...customModule, Voc: Number(e.target.value) })} className="h-7 text-xs" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Isc (A)</label>
                <Input type="number" value={customModule.Isc || ''} onChange={(e) => setCustomModule({ ...customModule, Isc: Number(e.target.value) })} className="h-7 text-xs" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Vmp (V)</label>
                <Input type="number" value={customModule.Vmp || ''} onChange={(e) => setCustomModule({ ...customModule, Vmp: Number(e.target.value) })} className="h-7 text-xs" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Imp (A)</label>
                <Input type="number" value={customModule.Imp || ''} onChange={(e) => setCustomModule({ ...customModule, Imp: Number(e.target.value) })} className="h-7 text-xs" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Efficiency (%)</label>
                <Input type="number" value={customModule.efficiency || ''} onChange={(e) => setCustomModule({ ...customModule, efficiency: Number(e.target.value) })} className="h-7 text-xs" />
              </div>
            </div>
            <Button size="sm" onClick={handleCustomSubmit}>Use Custom Module</Button>
          </CardContent>
        </Card>
      )}

      {/* Module Results */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900 z-10">
                  <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="text-left p-2">Manufacturer</th>
                    <th className="text-left p-2">Model</th>
                    <th className="text-center p-2">Tech</th>
                    <th className="text-center p-2">Pmax</th>
                    <th className="text-center p-2">Voc</th>
                    <th className="text-center p-2">Isc</th>
                    <th className="text-center p-2">Eff%</th>
                    <th className="text-center p-2">Wafer</th>
                    <th className="text-center p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id}
                      className={`border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer ${selectedModule?.id === m.id ? 'bg-blue-900/20' : ''}`}
                      onClick={() => onSelectModule(m)}
                    >
                      <td className="p-2 text-xs text-gray-300">{m.manufacturer}</td>
                      <td className="p-2 text-xs text-blue-300 font-mono">{m.model}</td>
                      <td className="p-2 text-center"><Badge variant="outline" className="text-xs">{m.technology}</Badge></td>
                      <td className="p-2 text-center text-xs font-mono">{m.Pmax}W</td>
                      <td className="p-2 text-center text-xs font-mono">{m.Voc}V</td>
                      <td className="p-2 text-center text-xs font-mono">{m.Isc}A</td>
                      <td className="p-2 text-center text-xs font-mono">{m.efficiency}%</td>
                      <td className="p-2 text-center text-xs text-gray-400">{m.wafer}</td>
                      <td className="p-2 text-center">
                        <Button size="sm" variant={selectedModule?.id === m.id ? 'default' : 'outline'} className="h-6 px-2 text-xs"
                          onClick={(e) => { e.stopPropagation(); onSelectModule(m); }}>
                          {selectedModule?.id === m.id ? 'Selected' : 'Select'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
          {filtered.map((m) => (
            <Card key={m.id}
              className={`cursor-pointer transition-colors ${selectedModule?.id === m.id ? 'border-blue-500 bg-blue-900/10' : 'hover:border-gray-600'}`}
              onClick={() => onSelectModule(m)}
            >
              <CardContent className="pt-4 pb-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{m.manufacturer}</p>
                    <p className="text-sm font-medium text-blue-300">{m.model}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{m.technology}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Pmax</p>
                    <p className="text-sm font-mono font-semibold">{m.Pmax}W</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Voc</p>
                    <p className="text-sm font-mono">{m.Voc}V</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Isc</p>
                    <p className="text-sm font-mono">{m.Isc}A</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{m.efficiency}% eff.</span>
                  <span>{m.wafer}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
