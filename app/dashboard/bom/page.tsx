'use client';

import { useState, useRef, useMemo } from 'react';
import { formatINR, USD_TO_INR } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Plus,
  Trash2,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  ClipboardList,
} from 'lucide-react';

interface BOMItem {
  id: string;
  partNumber: string;
  description: string;
  manufacturer: string;
  category: string;
  qty: number;
  unitPriceUSD: number;
  vendor: string;
}

const INITIAL_BOM: BOMItem[] = [
  { id: '1', partNumber: 'FF300R12ME4', description: 'IGBT Module 1200V 300A', manufacturer: 'Infineon', category: 'Power Semiconductor', qty: 20, unitPriceUSD: 85.20, vendor: 'Mouser' },
  { id: '2', partNumber: '2ED020I12-F2', description: 'Gate Driver IC Dual', manufacturer: 'Infineon', category: 'IC - Driver', qty: 20, unitPriceUSD: 12.00, vendor: 'Digi-Key' },
  { id: '3', partNumber: 'B43644A9688M', description: 'DC Link Capacitor 680uF 400V', manufacturer: 'TDK-EPCOS', category: 'Capacitor', qty: 40, unitPriceUSD: 18.00, vendor: 'Element14' },
  { id: '4', partNumber: 'LA 55-P', description: 'Current Transducer 50A', manufacturer: 'LEM', category: 'Sensor', qty: 30, unitPriceUSD: 22.00, vendor: 'TME' },
  { id: '5', partNumber: 'TMS320F28379D', description: 'C2000 DSP 200MHz', manufacturer: 'Texas Instruments', category: 'IC - MCU/DSP', qty: 10, unitPriceUSD: 38.00, vendor: 'Mouser' },
  { id: '6', partNumber: 'G2R-1-E DC24', description: 'Power Relay 16A 24VDC', manufacturer: 'Omron', category: 'Relay', qty: 60, unitPriceUSD: 4.50, vendor: 'Moglix' },
  { id: '7', partNumber: '170M5813', description: 'Semiconductor Fuse 300A 1250V', manufacturer: 'Eaton Bussmann', category: 'Fuse', qty: 20, unitPriceUSD: 32.00, vendor: 'Digi-Key' },
  { id: '8', partNumber: 'SK 92/100 SA', description: 'Heatsink Extruded 0.45K/W', manufacturer: 'Fischer', category: 'Thermal', qty: 20, unitPriceUSD: 15.00, vendor: 'Element14' },
  { id: '9', partNumber: 'EE65/32/27-3C95', description: 'Ferrite Core EE65', manufacturer: 'TDK', category: 'Magnetics', qty: 10, unitPriceUSD: 45.00, vendor: 'TME' },
  { id: '10', partNumber: 'B72220S0301K101', description: 'MOV 300V 20mm', manufacturer: 'TDK-EPCOS', category: 'Protection', qty: 40, unitPriceUSD: 3.00, vendor: 'Mouser' },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Power Semiconductor': '#ef4444',
  'IC - Driver': '#f59e0b',
  Capacitor: '#8b5cf6',
  Sensor: '#06b6d4',
  'IC - MCU/DSP': '#3b82f6',
  Relay: '#10b981',
  Fuse: '#f97316',
  Thermal: '#ec4899',
  Magnetics: '#a855f7',
  Protection: '#14b8a6',
};

export default function BOMPage() {
  const [items, setItems] = useState<BOMItem[]>(INITIAL_BOM);
  const [editId, setEditId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const totals = useMemo(() => {
    const totalUSD = items.reduce((s, i) => s + i.qty * i.unitPriceUSD, 0);
    const totalINR = totalUSD * USD_TO_INR;
    const totalParts = items.reduce((s, i) => s + i.qty, 0);
    return { totalUSD, totalINR, totalParts };
  }, [items]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => {
      map[i.category] = (map[i.category] || 0) + i.qty * i.unitPriceUSD * USD_TO_INR;
    });
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        fill: CATEGORY_COLORS[name] || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  const addItem = () => {
    const id = Date.now().toString();
    setItems([
      ...items,
      {
        id,
        partNumber: '',
        description: '',
        manufacturer: '',
        category: '',
        qty: 1,
        unitPriceUSD: 0,
        vendor: '',
      },
    ]);
    setEditId(id);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    if (editId === id) setEditId(null);
  };

  const updateItem = (id: string, field: keyof BOMItem, value: string | number) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      const newItems: BOMItem[] = [];
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/"/g, '').trim());
        if (cols.length >= 6) {
          newItems.push({
            id: Date.now().toString() + i,
            partNumber: cols[0] || '',
            description: cols[1] || '',
            manufacturer: cols[2] || '',
            category: cols[3] || '',
            qty: parseInt(cols[4]) || 1,
            unitPriceUSD: parseFloat(cols[5]) || 0,
            vendor: cols[6] || '',
          });
        }
      }
      if (newItems.length > 0) setItems([...items, ...newItems]);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportCSV = () => {
    const header = 'Part Number,Description,Manufacturer,Category,Qty,Unit Price USD,Vendor,Total USD,Total INR\n';
    const rows = items
      .map(
        (i) =>
          `${i.partNumber},"${i.description}",${i.manufacturer},${i.category},${i.qty},${i.unitPriceUSD},${i.vendor},${(i.qty * i.unitPriceUSD).toFixed(2)},${Math.round(i.qty * i.unitPriceUSD * USD_TO_INR)}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bom-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const data = items.map((i) => ({
      'Part Number': i.partNumber,
      Description: i.description,
      Manufacturer: i.manufacturer,
      Category: i.category,
      Qty: i.qty,
      'Unit Price (USD)': i.unitPriceUSD,
      Vendor: i.vendor,
      'Total (USD)': +(i.qty * i.unitPriceUSD).toFixed(2),
      'Total (INR)': Math.round(i.qty * i.unitPriceUSD * USD_TO_INR),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BOM');
    XLSX.writeFile(wb, `bom-export-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('PV TestEquip Power Supply — Bill of Materials', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} | Total: ${formatINR(totals.totalINR)}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Part Number', 'Description', 'Manufacturer', 'Qty', 'Unit (USD)', 'Total (USD)', 'Total (INR)']],
      body: items.map((i) => [
        i.partNumber,
        i.description,
        i.manufacturer,
        i.qty,
        `$${i.unitPriceUSD.toFixed(2)}`,
        `$${(i.qty * i.unitPriceUSD).toFixed(2)}`,
        formatINR(i.qty * i.unitPriceUSD * USD_TO_INR),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] },
      styles: { fontSize: 8 },
      foot: [['', '', 'TOTAL', totals.totalParts.toString(), '', `$${totals.totalUSD.toFixed(2)}`, formatINR(totals.totalINR)]],
      footStyles: { fillColor: [17, 24, 39], fontStyle: 'bold' },
    });

    doc.save(`bom-export-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total BOM Cost</p>
          <p className="text-2xl font-bold mt-1">{formatINR(totals.totalINR)}</p>
          <p className="text-xs text-gray-500">${totals.totalUSD.toFixed(2)} USD</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Line Items</p>
          <p className="text-2xl font-bold mt-1">{items.length}</p>
          <p className="text-xs text-gray-500">unique parts</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Quantity</p>
          <p className="text-2xl font-bold mt-1">{totals.totalParts}</p>
          <p className="text-xs text-gray-500">components</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Categories</p>
          <p className="text-2xl font-bold mt-1">{new Set(items.map((i) => i.category)).size}</p>
          <p className="text-xs text-gray-500">part categories</p>
        </div>
      </div>

      {/* Cost Breakdown Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-blue-400" />
          Cost Breakdown by Category (INR)
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryBreakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={10} angle={-20} textAnchor="end" height={60} />
            <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              formatter={(value: number) => formatINR(value)}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {categoryBreakdown.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={addItem}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Part
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors"
        >
          <Upload className="h-4 w-4" /> Import CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv" onChange={importCSV} className="hidden" />

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="h-4 w-4" /> CSV
          </button>
          <button
            onClick={exportExcel}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </button>
          <button
            onClick={exportPDF}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <FileText className="h-4 w-4" /> PDF
          </button>
        </div>
      </div>

      {/* BOM Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/50 text-gray-400">
                <th className="text-left py-3 px-4 w-8">#</th>
                <th className="text-left py-3 px-4">Part Number</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Manufacturer</th>
                <th className="text-left py-3 px-4 hidden lg:table-cell">Category</th>
                <th className="text-right py-3 px-4 w-20">Qty</th>
                <th className="text-right py-3 px-4 w-28">Unit (USD)</th>
                <th className="text-right py-3 px-4 w-32">Total (INR)</th>
                <th className="text-left py-3 px-4 hidden lg:table-cell">Vendor</th>
                <th className="text-center py-3 px-4 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  className="border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-2 px-4 text-gray-600">{idx + 1}</td>
                  <td className="py-2 px-4">
                    {editId === item.id ? (
                      <input
                        value={item.partNumber}
                        onChange={(e) => updateItem(item.id, 'partNumber', e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs w-full"
                      />
                    ) : (
                      <span
                        className="font-mono text-xs text-white cursor-pointer"
                        onClick={() => setEditId(item.id)}
                      >
                        {item.partNumber || '—'}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editId === item.id ? (
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs w-full"
                      />
                    ) : (
                      <span
                        className="text-xs text-gray-300 cursor-pointer"
                        onClick={() => setEditId(item.id)}
                      >
                        {item.description || '—'}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 hidden md:table-cell">
                    {editId === item.id ? (
                      <input
                        value={item.manufacturer}
                        onChange={(e) => updateItem(item.id, 'manufacturer', e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs w-full"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">{item.manufacturer}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 hidden lg:table-cell">
                    {editId === item.id ? (
                      <input
                        value={item.category}
                        onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs w-full"
                      />
                    ) : (
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[item.category] || '#6b7280'}20`,
                          color: CATEGORY_COLORS[item.category] || '#6b7280',
                        }}
                      >
                        {item.category}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {editId === item.id ? (
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs w-16 text-right"
                      />
                    ) : (
                      <span className="text-gray-300">{item.qty}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {editId === item.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPriceUSD}
                        onChange={(e) =>
                          updateItem(item.id, 'unitPriceUSD', parseFloat(e.target.value) || 0)
                        }
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs w-20 text-right"
                      />
                    ) : (
                      <span className="text-gray-300">${item.unitPriceUSD.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-right font-medium text-white">
                    {formatINR(item.qty * item.unitPriceUSD * USD_TO_INR)}
                  </td>
                  <td className="py-2 px-4 hidden lg:table-cell">
                    {editId === item.id ? (
                      <input
                        value={item.vendor}
                        onChange={(e) => updateItem(item.id, 'vendor', e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs w-full"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">{item.vendor}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-700 bg-gray-800/30">
                <td colSpan={5} className="py-3 px-4 text-right font-medium text-gray-400">
                  TOTAL
                </td>
                <td className="py-3 px-4 text-right font-medium">{totals.totalParts}</td>
                <td className="py-3 px-4 text-right font-medium">
                  ${totals.totalUSD.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-blue-400 text-base">
                  {formatINR(totals.totalINR)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
