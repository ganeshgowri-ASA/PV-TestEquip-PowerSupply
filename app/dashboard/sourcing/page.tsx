'use client';

import { useState, useCallback, useMemo } from 'react';
import { formatINR, USD_TO_INR } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Search,
  Loader2,
  ExternalLink,
  ArrowUpDown,
  Filter,
  Download,
} from 'lucide-react';

interface MarketplaceResult {
  marketplace: string;
  mpn: string;
  manufacturer: string;
  description: string;
  unitPrice: number;
  currency: string;
  stock: number;
  moq: number;
  leadDays: number;
  url?: string;
}

type SortKey = 'unitPrice' | 'stock' | 'leadDays' | 'marketplace';

// Demo results simulating multi-marketplace search
const DEMO_RESULTS: MarketplaceResult[] = [
  { marketplace: 'Nexar/Octopart', mpn: 'FF300R12ME4', manufacturer: 'Infineon', description: 'IGBT Module 1200V 300A', unitPrice: 85.20, currency: 'USD', stock: 230, moq: 1, leadDays: 14 },
  { marketplace: 'Mouser', mpn: 'FF300R12ME4', manufacturer: 'Infineon', description: 'IGBT Module 1200V 300A EconoDUAL', unitPrice: 87.50, currency: 'USD', stock: 156, moq: 1, leadDays: 10 },
  { marketplace: 'Digi-Key', mpn: 'FF300R12ME4', manufacturer: 'Infineon', description: 'IGBT Module 1200V 300A', unitPrice: 84.90, currency: 'USD', stock: 89, moq: 1, leadDays: 12 },
  { marketplace: 'Element14', mpn: 'FF300R12ME4', manufacturer: 'Infineon', description: 'IGBT Module 1200V 300A', unitPrice: 92.30, currency: 'USD', stock: 45, moq: 5, leadDays: 21 },
  { marketplace: 'TME', mpn: 'FF300R12ME4', manufacturer: 'Infineon', description: 'IGBT Module 1200V 300A EconoDUAL3', unitPrice: 81.00, currency: 'USD', stock: 320, moq: 1, leadDays: 18 },
  { marketplace: 'Moglix (IN)', mpn: 'FF300R12ME4', manufacturer: 'Infineon', description: 'IGBT Module 1200V 300A', unitPrice: 95.00, currency: 'USD', stock: 12, moq: 1, leadDays: 7 },
  { marketplace: 'Nexar/Octopart', mpn: 'LA 55-P', manufacturer: 'LEM', description: 'Current Transducer 50A', unitPrice: 22.10, currency: 'USD', stock: 540, moq: 1, leadDays: 10 },
  { marketplace: 'Mouser', mpn: 'LA 55-P', manufacturer: 'LEM', description: 'Current Transducer 50A Hall Effect', unitPrice: 23.40, currency: 'USD', stock: 890, moq: 1, leadDays: 7 },
  { marketplace: 'Digi-Key', mpn: 'LA 55-P', manufacturer: 'LEM', description: 'Current Transducer ±50A', unitPrice: 21.80, currency: 'USD', stock: 234, moq: 1, leadDays: 8 },
  { marketplace: 'TME', mpn: 'LA 55-P', manufacturer: 'LEM', description: 'Current Transducer 50A', unitPrice: 20.50, currency: 'USD', stock: 150, moq: 1, leadDays: 15 },
];

const MARKETPLACES = ['All', 'Nexar/Octopart', 'Mouser', 'Digi-Key', 'Element14', 'TME', 'Moglix (IN)'];

export default function SourcingPage() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'mpn' | 'general'>('mpn');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MarketplaceResult[]>(DEMO_RESULTS);
  const [sortKey, setSortKey] = useState<SortKey>('unitPrice');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterMarketplace, setFilterMarketplace] = useState('All');

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Call Nexar API
      const nexarRes = await fetch('/api/nexar/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type: searchType, limit: 10 }),
      });
      const nexarData = await nexarRes.json();

      // Call multi-marketplace API
      const marketRes = await fetch('/api/marketplace/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 10 }),
      });
      const marketData = await marketRes.json();

      // Merge results
      const merged: MarketplaceResult[] = [];

      // Map Nexar results
      if (nexarData.results) {
        nexarData.results.forEach((r: any) => {
          const part = r.part;
          const bestPrice = part.medianPrice1000?.price || 0;
          const totalStock = part.sellers?.reduce(
            (s: number, sel: any) =>
              s + sel.offers.reduce((os: number, o: any) => os + (o.inventoryLevel || 0), 0),
            0
          ) || 0;
          merged.push({
            marketplace: 'Nexar/Octopart',
            mpn: part.mpn,
            manufacturer: part.manufacturer?.name || 'Unknown',
            description: part.name || '',
            unitPrice: bestPrice,
            currency: 'USD',
            stock: totalStock,
            moq: 1,
            leadDays: 14,
          });
        });
      }

      // Map marketplace results
      if (marketData.results) {
        merged.push(...marketData.results);
      }

      setResults(merged.length > 0 ? merged : DEMO_RESULTS);
    } catch {
      // Fallback to demo data on error
      setResults(DEMO_RESULTS);
    } finally {
      setLoading(false);
    }
  }, [query, searchType]);

  const filtered = results
    .filter((r) => filterMarketplace === 'All' || r.marketplace === filterMarketplace)
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // Price comparison chart data
  const priceCompare = useMemo(() => {
    const uniqueMPNs = [...new Set(filtered.map((r) => r.mpn))];
    return uniqueMPNs.map((mpn) => {
      const row: any = { mpn };
      filtered
        .filter((r) => r.mpn === mpn)
        .forEach((r) => {
          row[r.marketplace] = r.unitPrice;
        });
      return row;
    });
  }, [filtered]);

  const marketplaceColors: Record<string, string> = {
    'Nexar/Octopart': '#3b82f6',
    Mouser: '#f59e0b',
    'Digi-Key': '#ef4444',
    Element14: '#8b5cf6',
    TME: '#06b6d4',
    'Moglix (IN)': '#10b981',
  };

  const exportCSV = () => {
    const header = 'Marketplace,MPN,Manufacturer,Description,Unit Price (USD),INR Price,Stock,MOQ,Lead Days\n';
    const rows = filtered
      .map(
        (r) =>
          `${r.marketplace},${r.mpn},${r.manufacturer},"${r.description}",${r.unitPrice},${Math.round(r.unitPrice * USD_TO_INR)},${r.stock},${r.moq},${r.leadDays}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sourcing-${query || 'all'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Multi-Marketplace Component Search</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by MPN, keyword, or part description..."
              className="w-full bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'mpn' | 'general')}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="mpn">MPN Search</option>
            <option value="general">Keyword Search</option>
          </select>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-6 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search All
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <span>Searching:</span>
          {['Nexar', 'Mouser', 'Digi-Key', 'Element14', 'TME', 'Moglix'].map((m) => (
            <span key={m} className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Filter + Export */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterMarketplace}
            onChange={(e) => setFilterMarketplace(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white"
          >
            {MARKETPLACES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <span className="text-sm text-gray-500">{filtered.length} results</span>
        <button
          onClick={exportCSV}
          className="ml-auto bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Price Comparison Chart */}
      {priceCompare.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Price Comparison Across Vendors (USD)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priceCompare}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="mpn" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {Object.entries(marketplaceColors).map(([name, color]) => (
                <Bar key={name} dataKey={name} fill={color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/50 text-gray-400">
                <th
                  className="text-left py-3 px-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort('marketplace')}
                >
                  <span className="flex items-center gap-1">
                    Marketplace <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="text-left py-3 px-4">MPN</th>
                <th className="text-left py-3 px-4">Manufacturer</th>
                <th className="text-left py-3 px-4 hidden lg:table-cell">Description</th>
                <th
                  className="text-right py-3 px-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort('unitPrice')}
                >
                  <span className="flex items-center justify-end gap-1">
                    Price (USD) <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="text-right py-3 px-4">INR</th>
                <th
                  className="text-right py-3 px-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort('stock')}
                >
                  <span className="flex items-center justify-end gap-1">
                    Stock <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="text-right py-3 px-4">MOQ</th>
                <th
                  className="text-right py-3 px-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort('leadDays')}
                >
                  <span className="flex items-center justify-end gap-1">
                    Lead <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const isLowest =
                  r.unitPrice ===
                  Math.min(
                    ...filtered.filter((x) => x.mpn === r.mpn).map((x) => x.unitPrice)
                  );
                return (
                  <tr
                    key={i}
                    className="border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-2.5 px-4">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${marketplaceColors[r.marketplace] || '#6b7280'}20`,
                          color: marketplaceColors[r.marketplace] || '#6b7280',
                        }}
                      >
                        {r.marketplace}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-white">{r.mpn}</td>
                    <td className="py-2.5 px-4 text-gray-300">{r.manufacturer}</td>
                    <td className="py-2.5 px-4 text-gray-500 hidden lg:table-cell text-xs">
                      {r.description}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-medium ${isLowest ? 'text-green-400' : 'text-gray-300'}`}
                    >
                      ${r.unitPrice.toFixed(2)}
                      {isLowest && (
                        <span className="ml-1 text-[10px] bg-green-900/50 text-green-400 px-1 rounded">
                          BEST
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-400">
                      {formatINR(r.unitPrice * USD_TO_INR)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right ${r.stock < 50 ? 'text-red-400' : 'text-gray-300'}`}
                    >
                      {r.stock.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-400">{r.moq}</td>
                    <td className="py-2.5 px-4 text-right text-gray-400">{r.leadDays}d</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
