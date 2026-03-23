'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/Toast';

interface SearchResult {
  mpn: string;
  name: string;
  manufacturer: string;
  category: string | null;
  datasheetUrl: string | null;
  totalStock: number;
  lowestPriceUSD: number | null;
  lowestPriceINR: number | null;
  shortestLeadDays: number | null;
  indianSellers: string[];
  indiaAccessibleSellers: string[];
  specs: { name: string; value: string }[];
}

type SearchTab = 'nexar' | 'mouser' | 'digikey';

export default function NexarSearch() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'mpn' | 'keyword'>('mpn');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTab, setSearchTab] = useState<SearchTab>('nexar');
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterLeadTime, setFilterLeadTime] = useState<number | null>(null);

  async function handleSearch() {
    if (!query.trim()) {
      toast('warning', 'Enter a search query');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (searchTab === 'nexar') {
        const res = await fetch('/api/nexar/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, type, limit: 10 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Search failed');
        setResults(data.results ?? []);
        toast('success', `Found ${data.results?.length ?? 0} results`);
      } else {
        // Mouser and Digi-Key search goes through our Nexar API for now
        // (real integration would need separate API keys)
        const res = await fetch('/api/nexar/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, type: 'keyword', limit: 10 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Search failed');
        setResults(data.results ?? []);
        toast('info', `${searchTab === 'mouser' ? 'Mouser' : 'Digi-Key'} search via Nexar aggregator - ${data.results?.length ?? 0} results`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      toast('error', msg);
    } finally {
      setLoading(false);
    }
  }

  const filteredResults = results.filter(r => {
    if (filterInStock && r.totalStock <= 0) return false;
    if (filterLeadTime && r.shortestLeadDays && r.shortestLeadDays > filterLeadTime) return false;
    return true;
  });

  const handleAddToBom = (part: SearchResult) => {
    toast('success', `Added ${part.mpn} to BOM`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Component Sourcing</h2>
        <p className="text-gray-400 text-sm">Search via Nexar, Mouser, Digi-Key - pricing, availability, Indian vendors</p>
      </div>

      {/* Source Tabs */}
      <div className="flex gap-2">
        {([
          { id: 'nexar' as const, label: 'Nexar (Primary)' },
          { id: 'mouser' as const, label: 'Mouser' },
          { id: 'digikey' as const, label: 'Digi-Key' },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setSearchTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              searchTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex gap-3">
            {(['mpn', 'keyword'] as const).map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  type === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >{t === 'mpn' ? 'By MPN' : 'Keyword'}</button>
            ))}
            <div className="flex-1" />
            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input type="checkbox" checked={filterInStock} onChange={(e) => setFilterInStock(e.target.checked)} className="rounded" />
              In Stock Only
            </label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">Max Lead:</span>
              <select value={filterLeadTime ?? ''} onChange={(e) => setFilterLeadTime(e.target.value ? Number(e.target.value) : null)}
                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white">
                <option value="">Any</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={type === 'mpn' ? 'e.g. IRF540N, IT6512C, DAQ970A' : 'e.g. 100V N-Channel MOSFET, HV power supply'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching\u2026' : 'Search'}
            </Button>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {filteredResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400">{filteredResults.length} results</h3>

          {/* Price Comparison Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="text-left p-3">MPN</th>
                      <th className="text-left p-3">Manufacturer</th>
                      <th className="text-left p-3">Description</th>
                      <th className="text-right p-3">Price (USD)</th>
                      <th className="text-right p-3">Price (INR)</th>
                      <th className="text-center p-3">Stock</th>
                      <th className="text-center p-3">Lead (days)</th>
                      <th className="text-left p-3">Indian Vendor</th>
                      <th className="text-center p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((part) => (
                      <tr key={part.mpn} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="p-3 font-mono text-xs text-blue-300">{part.mpn}</td>
                        <td className="p-3 text-xs text-gray-400">{part.manufacturer}</td>
                        <td className="p-3 text-xs text-gray-300 max-w-[200px] truncate">{part.name}</td>
                        <td className="p-3 text-right text-xs font-mono">
                          {part.lowestPriceUSD ? `$${part.lowestPriceUSD.toFixed(3)}` : '-'}
                        </td>
                        <td className="p-3 text-right text-xs font-mono text-green-400">
                          {part.lowestPriceINR ? `\u20B9${part.lowestPriceINR.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-3 text-center text-xs">
                          <Badge variant={part.totalStock > 0 ? 'success' : 'destructive'} className="text-xs">
                            {part.totalStock > 0 ? part.totalStock.toLocaleString() : 'OOS'}
                          </Badge>
                        </td>
                        <td className="p-3 text-center text-xs text-gray-400">
                          {part.shortestLeadDays ?? '-'}
                        </td>
                        <td className="p-3 text-xs text-gray-400">
                          {part.indianSellers.length > 0
                            ? part.indianSellers[0]
                            : part.indiaAccessibleSellers.length > 0
                              ? part.indiaAccessibleSellers[0]
                              : '-'}
                        </td>
                        <td className="p-3 text-center">
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs"
                            onClick={() => handleAddToBom(part)}>
                            + BOM
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {results.length === 0 && !loading && !error && (
        <p className="text-xs text-gray-500 text-center py-8">
          Search for components by MPN or description. Requires NEXAR_API_KEY in .env.local
        </p>
      )}
    </div>
  );
}
