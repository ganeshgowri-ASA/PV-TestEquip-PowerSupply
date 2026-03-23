'use client';

import { useState, useMemo } from 'react';
import { formatINR, formatNumber, USD_TO_INR } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import {
  IndianRupee,
  Package,
  Clock,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Truck,
  BarChart3,
} from 'lucide-react';

// Demo data - in production this comes from BOM/API
const DEMO_BOM = [
  { part: 'IGBT Module FF300R12ME4', vendor: 'Infineon', qty: 20, unitUSD: 85, leadDays: 14, stock: 230, minStock: 50 },
  { part: 'Gate Driver 2ED020I12-F2', vendor: 'Infineon', qty: 20, unitUSD: 12, leadDays: 7, stock: 500, minStock: 100 },
  { part: 'DC Link Cap B43644A9', vendor: 'TDK-EPCOS', qty: 40, unitUSD: 18, leadDays: 21, stock: 120, minStock: 80 },
  { part: 'Current Sensor LA 55-P', vendor: 'LEM', qty: 30, unitUSD: 22, leadDays: 10, stock: 45, minStock: 60 },
  { part: 'DSP TMS320F28379D', vendor: 'TI', qty: 10, unitUSD: 38, leadDays: 28, stock: 15, minStock: 20 },
  { part: 'Relay G2R-1-E DC24', vendor: 'Omron', qty: 60, unitUSD: 4.5, leadDays: 5, stock: 800, minStock: 100 },
  { part: 'Fuse 170M5813', vendor: 'Eaton Bussmann', qty: 20, unitUSD: 32, leadDays: 18, stock: 90, minStock: 40 },
  { part: 'Heatsink SK 92/100 SA', vendor: 'Fischer', qty: 20, unitUSD: 15, leadDays: 12, stock: 60, minStock: 30 },
  { part: 'Transformer EE65/32/27', vendor: 'TDK', qty: 10, unitUSD: 45, leadDays: 35, stock: 8, minStock: 15 },
  { part: 'MOV B72220S0301K101', vendor: 'TDK-EPCOS', qty: 40, unitUSD: 3, leadDays: 7, stock: 1200, minStock: 100 },
  { part: 'HV Resistor MOX-2-12', vendor: 'Ohmite', qty: 30, unitUSD: 8, leadDays: 14, stock: 200, minStock: 60 },
  { part: 'Connector Phoenix MSTB', vendor: 'Phoenix Contact', qty: 50, unitUSD: 2.8, leadDays: 6, stock: 950, minStock: 100 },
];

const PRICE_TREND = [
  { month: 'Oct', igbt: 82, cap: 17, sensor: 21 },
  { month: 'Nov', igbt: 84, cap: 17.5, sensor: 21.5 },
  { month: 'Dec', igbt: 83, cap: 18, sensor: 22 },
  { month: 'Jan', igbt: 85, cap: 18.2, sensor: 22 },
  { month: 'Feb', igbt: 86, cap: 18.5, sensor: 22.5 },
  { month: 'Mar', igbt: 85, cap: 18, sensor: 22 },
];

const PIE_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

export default function DashboardPage() {
  const stats = useMemo(() => {
    const totalCostUSD = DEMO_BOM.reduce((s, p) => s + p.qty * p.unitUSD, 0);
    const totalCostINR = totalCostUSD * USD_TO_INR;
    const vendors = new Set(DEMO_BOM.map((p) => p.vendor)).size;
    const avgLead = Math.round(DEMO_BOM.reduce((s, p) => s + p.leadDays, 0) / DEMO_BOM.length);
    const atRisk = DEMO_BOM.filter((p) => p.stock < p.minStock);
    const healthyPct = Math.round(((DEMO_BOM.length - atRisk.length) / DEMO_BOM.length) * 100);
    return { totalCostUSD, totalCostINR, vendors, avgLead, atRisk, healthyPct };
  }, []);

  const vendorSpend = useMemo(() => {
    const map: Record<string, number> = {};
    DEMO_BOM.forEach((p) => {
      map[p.vendor] = (map[p.vendor] || 0) + p.qty * p.unitUSD * USD_TO_INR;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const stockData = useMemo(
    () =>
      DEMO_BOM.map((p) => ({
        name: p.part.split(' ')[0],
        stock: p.stock,
        minStock: p.minStock,
        fill: p.stock < p.minStock ? '#ef4444' : '#3b82f6',
      })),
    []
  );

  const gaugeData = [{ name: 'Health', value: stats.healthyPct, fill: '#10b981' }];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Total BOM Cost"
          value={formatINR(stats.totalCostINR)}
          sub={`$${formatNumber(stats.totalCostUSD)} USD`}
          color="blue"
        />
        <KPICard
          icon={<Truck className="h-5 w-5" />}
          label="Vendors"
          value={stats.vendors.toString()}
          sub="unique suppliers"
          color="cyan"
        />
        <KPICard
          icon={<Clock className="h-5 w-5" />}
          label="Avg Lead Time"
          value={`${stats.avgLead} days`}
          sub="across all parts"
          color="purple"
        />
        <KPICard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Stock Health"
          value={`${stats.healthyPct}%`}
          sub={`${DEMO_BOM.length - stats.atRisk.length}/${DEMO_BOM.length} parts OK`}
          color="green"
        />
        <KPICard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="At Risk"
          value={stats.atRisk.length.toString()}
          sub="below min stock"
          color="red"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Price Trend */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            Price Trend (USD) — Key Components
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={PRICE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Line type="monotone" dataKey="igbt" stroke="#3b82f6" name="IGBT" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cap" stroke="#8b5cf6" name="DC Cap" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="sensor" stroke="#06b6d4" name="Sensor" strokeWidth={2} dot={{ r: 3 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Health Gauge */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            Stock Health Gauge
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              startAngle={180}
              endAngle={0}
              data={gaugeData}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                background={{ fill: '#1f2937' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-3xl font-bold text-green-400 -mt-8">{stats.healthyPct}%</p>
          <p className="text-xs text-gray-500 mt-1">Components in healthy stock</p>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stock Levels */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            Stock vs Minimum — Per Component
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stockData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis type="number" stroke="#6b7280" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              />
              <Bar dataKey="stock" name="Current Stock" radius={[0, 4, 4, 0]}>
                {stockData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
              <Bar dataKey="minStock" name="Min Required" fill="#374151" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vendor Spend Pie */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-purple-400" />
            Vendor Spend Distribution (INR)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={vendorSpend}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#4b5563' }}
                fontSize={11}
              >
                {vendorSpend.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                formatter={(value: number) => formatINR(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* At-Risk Table */}
      {stats.atRisk.length > 0 && (
        <div className="bg-gray-900 border border-red-900/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Components At Risk — Below Minimum Stock
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-2 pr-4">Part</th>
                  <th className="text-left py-2 pr-4">Vendor</th>
                  <th className="text-right py-2 pr-4">Stock</th>
                  <th className="text-right py-2 pr-4">Min Required</th>
                  <th className="text-right py-2 pr-4">Deficit</th>
                  <th className="text-right py-2">Lead Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.atRisk.map((p) => (
                  <tr key={p.part} className="border-b border-gray-800/50 text-gray-300">
                    <td className="py-2 pr-4 font-mono text-xs">{p.part}</td>
                    <td className="py-2 pr-4">{p.vendor}</td>
                    <td className="py-2 pr-4 text-right text-red-400 font-medium">{p.stock}</td>
                    <td className="py-2 pr-4 text-right">{p.minStock}</td>
                    <td className="py-2 pr-4 text-right text-red-400">{p.minStock - p.stock}</td>
                    <td className="py-2 text-right">{p.leadDays}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: 'blue' | 'cyan' | 'purple' | 'green' | 'red';
}) {
  const colors = {
    blue: 'border-blue-800/50 bg-blue-950/30 text-blue-400',
    cyan: 'border-cyan-800/50 bg-cyan-950/30 text-cyan-400',
    purple: 'border-purple-800/50 bg-purple-950/30 text-purple-400',
    green: 'border-green-800/50 bg-green-950/30 text-green-400',
    red: 'border-red-800/50 bg-red-950/30 text-red-400',
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2 opacity-70">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs opacity-60 mt-1">{sub}</p>
    </div>
  );
}
