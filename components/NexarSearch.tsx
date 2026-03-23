'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NexarResult {
  mpn: string;
  name: string;
  manufacturer: { name: string };
  medianPrice1000?: { price: number; currency: string };
  sellers: { company: { name: string }; offers: { inventoryLevel: number }[] }[];
}

export default function NexarSearch() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'mpn' | 'general' | 'alternatives'>('mpn');
  const [results, setResults] = useState<NexarResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/nexar/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type, limit: 10 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setResults(data.results?.map((r: { part: NexarResult }) => r.part) ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Component Sourcing</h2>
        <p className="text-gray-400 text-sm">Search components via Nexar API — pricing, availability, Indian vendors</p>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex gap-3">
            {(['mpn', 'general', 'alternatives'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  type === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {t === 'mpn' ? 'By MPN' : t === 'general' ? 'General' : 'Alternatives'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={type === 'mpn' ? 'e.g. IRF540N' : 'e.g. 100V N-Channel MOSFET'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching…' : 'Search'}
            </Button>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400">{results.length} results</h3>
          {results.map((part) => (
            <Card key={part.mpn} className="hover:border-blue-700 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-blue-300 truncate">{part.mpn}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{part.name}</p>
                    <p className="text-xs text-gray-500">{part.manufacturer?.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {part.medianPrice1000 && (
                      <p className="text-sm font-semibold text-green-400">
                        ${part.medianPrice1000.price.toFixed(3)}
                        <span className="text-xs text-gray-500 ml-1">/{part.medianPrice1000.currency}</span>
                      </p>
                    )}
                    <Badge variant="secondary" className="text-xs mt-1">
                      {part.sellers?.length ?? 0} sellers
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {results.length === 0 && !loading && !error && (
        <p className="text-xs text-gray-600 text-center py-8">
          Search for components by MPN or description. Requires NEXAR_API_KEY in .env.local
        </p>
      )}
    </div>
  );
}
