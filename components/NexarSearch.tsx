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

function getMouserSearchUrl(query: string): string {
  return `https://www.mouser.com/c/?q=${encodeURIComponent(query)}`;
}

function getDigiKeySearchUrl(query: string): string {
  return `https://www.digikey.com/en/products/result?keywords=${encodeURIComponent(query)}`;
}

export default function NexarSearch() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'mpn' | 'keyword'>('mpn');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nexarConfigError, setNexarConfigError] = useState(false);
  const [searchTab, setSearchTab] = useState<SearchTab>('nexar');
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterLeadTime, setFilterLeadTime] = useState<number | null>(null);
  const [externalSearchQuery, setExternalSearchQuery] = useState('');

  async function handleSearch() {
    if (!query.trim()) {
      toast('warning', 'Enter a search query');
      return;
    }

    // For Mouser and Digi-Key: open search in new tab and show direct links
    if (searchTab === 'mouser' || searchTab === 'digikey') {
      setExternalSearchQuery(query.trim());
      setResults([]);
      setError('');

      const url = searchTab === 'mouser'
        ? getMouserSearchUrl(query.trim())
        : getDigiKeySearchUrl(query.trim());

      window.open(url, '_blank', 'noopener,noreferrer');
      toast('info', `Opened ${searchTab === 'mouser' ? 'Mouser' : 'Digi-Key'} search in new tab`);
      return;
    }

    // Nexar search
    setLoading(true);
    setError('');
    setExternalSearchQuery('');
    try {
      const res = await fetch('/api/nexar/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type, limit: 10 }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Detect configuration errors
        if (data.code === 'NEXAR_NOT_CONFIGURED' || data.code === 'NEXAR_INVALID_FORMAT' || data.code === 'NEXAR_AUTH_FAILED') {
          setNexarConfigError(true);
          setError('');
          return;
        }
        throw new Error(data.error || 'Search failed');
      }
      setNexarConfigError(false);
      setResults(data.results ?? []);
      toast('success', `Found ${data.results?.length ?? 0} results`);
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

      {/* Nexar Configuration Warning */}
      {nexarConfigError && (
        <div className="rounded-lg border border-yellow-600/50 bg-yellow-900/20 p-4">
          <div className="flex gap-3">
            <span className="text-yellow-400 text-lg">&#9888;</span>
            <div className="space-y-1">
              <p className="text-yellow-300 text-sm font-medium">Nexar API Not Configured</p>
              <p className="text-yellow-400/80 text-xs">
                The Nexar API key is missing or invalid. To enable component search via Nexar:
              </p>
              <ol className="text-yellow-400/80 text-xs list-decimal list-inside space-y-0.5 mt-1">
                <li>Register at <span className="font-mono text-yellow-300">nexar.com/api</span> to get a client ID and secret</li>
                <li>Set <span className="font-mono text-yellow-300">NEXAR_API_KEY=clientId:clientSecret</span> in your environment variables (Vercel dashboard or .env.local)</li>
                <li>Redeploy / restart the application</li>
              </ol>
              <p className="text-yellow-400/80 text-xs mt-2">
                Meanwhile, you can use the <strong>Mouser</strong> and <strong>Digi-Key</strong> tabs to search directly on their websites.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Source Tabs */}
      <div className="flex gap-2">
        {([
          { id: 'nexar' as const, label: 'Nexar (Primary)' },
          { id: 'mouser' as const, label: 'Mouser' },
          { id: 'digikey' as const, label: 'Digi-Key' },
        ]).map(tab => (
          <button key={tab.id} onClick={() => { setSearchTab(tab.id); setExternalSearchQuery(''); }}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              searchTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          {/* Mouser/Digi-Key info banner */}
          {(searchTab === 'mouser' || searchTab === 'digikey') && (
            <div className="rounded-md bg-blue-900/20 border border-blue-700/40 px-3 py-2 text-xs text-blue-300">
              Searches will open {searchTab === 'mouser' ? 'Mouser' : 'Digi-Key'} results directly in a new browser tab.
            </div>
          )}
          <div className="flex gap-3">
            {searchTab === 'nexar' && (
              <>
                {(['mpn', 'keyword'] as const).map((t) => (
                  <button key={t} onClick={() => setType(t)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      type === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >{t === 'mpn' ? 'By MPN' : 'Keyword'}</button>
                ))}
              </>
            )}
            <div className="flex-1" />
            {searchTab === 'nexar' && (
              <>
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
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={
                searchTab !== 'nexar'
                  ? 'e.g. IRF540N, LM317, 100V MOSFET'
                  : type === 'mpn' ? 'e.g. IRF540N, IT6512C, DAQ970A' : 'e.g. 100V N-Channel MOSFET, HV power supply'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching\u2026' : searchTab !== 'nexar' ? `Search ${searchTab === 'mouser' ? 'Mouser' : 'Digi-Key'}` : 'Search'}
            </Button>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </CardContent>
      </Card>

      {/* External search links panel for Mouser/Digi-Key */}
      {externalSearchQuery && (searchTab === 'mouser' || searchTab === 'digikey') && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">
              Direct Search Links for &ldquo;{externalSearchQuery}&rdquo;
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            <div className="flex flex-col gap-2">
              <a
                href={getMouserSearchUrl(externalSearchQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-gray-800 px-4 py-3 text-sm text-blue-300 hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium">Mouser Electronics</span>
                <span className="text-gray-500 text-xs ml-auto">mouser.com</span>
                <span className="text-gray-500">&rarr;</span>
              </a>
              <a
                href={getDigiKeySearchUrl(externalSearchQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-gray-800 px-4 py-3 text-sm text-blue-300 hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium">Digi-Key Electronics</span>
                <span className="text-gray-500 text-xs ml-auto">digikey.com</span>
                <span className="text-gray-500">&rarr;</span>
              </a>
              <a
                href={`https://octopart.com/search?q=${encodeURIComponent(externalSearchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-gray-800 px-4 py-3 text-sm text-blue-300 hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium">Octopart (Aggregator)</span>
                <span className="text-gray-500 text-xs ml-auto">octopart.com</span>
                <span className="text-gray-500">&rarr;</span>
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Results open in new tabs. Compare pricing across distributors for best availability.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results (Nexar only) */}
      {searchTab === 'nexar' && filteredResults.length > 0 && (
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

      {searchTab === 'nexar' && results.length === 0 && !loading && !error && !nexarConfigError && (
        <p className="text-xs text-gray-500 text-center py-8">
          Search for components by MPN or description. Requires NEXAR_API_KEY in environment variables.
        </p>
      )}
    </div>
  );
}
