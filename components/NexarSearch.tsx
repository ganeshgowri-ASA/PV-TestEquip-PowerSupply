'use client';

import { useState, useCallback } from 'react';
import { Search, Loader2, ExternalLink } from 'lucide-react';

interface SearchResult {
  part: {
    mpn: string;
    name: string;
    manufacturer: { name: string };
    medianPrice1000?: { price: number; currency: string };
    sellers: {
      company: { name: string };
      offers: { inventoryLevel: number; prices: { quantity: number; price: number }[] }[];
    }[];
    specs: { attribute: { name: string }; displayValue: string }[];
  };
}

export default function NexarSearch() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'mpn' | 'general' | 'alternatives'>('mpn');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/nexar/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type: searchType, limit: 10 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, searchType]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Nexar Component Search</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter MPN or keyword..."
            className="w-full bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as any)}
          className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2.5 text-sm text-white"
        >
          <option value="mpn">MPN</option>
          <option value="general">Keyword</option>
          <option value="alternatives">Alternatives</option>
        </select>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-6 py-2.5 rounded-md text-sm font-medium flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {results.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/50 text-gray-400">
                <th className="text-left py-3 px-4">MPN</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Manufacturer</th>
                <th className="text-right py-3 px-4">Price (1K)</th>
                <th className="text-right py-3 px-4">Sellers</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-t border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 px-4 font-mono text-xs text-white">{r.part.mpn}</td>
                  <td className="py-2 px-4 text-xs text-gray-300">{r.part.name}</td>
                  <td className="py-2 px-4 text-xs text-gray-400">{r.part.manufacturer?.name}</td>
                  <td className="py-2 px-4 text-right text-gray-300">
                    {r.part.medianPrice1000
                      ? `$${r.part.medianPrice1000.price.toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="py-2 px-4 text-right text-gray-400">
                    {r.part.sellers?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-600">
        For multi-marketplace search across Mouser, Digi-Key, Element14, TME — visit{' '}
        <a href="/dashboard/sourcing" className="text-blue-400 hover:underline">
          Component Sourcing Dashboard
        </a>
      </p>
    </div>
  );
}
