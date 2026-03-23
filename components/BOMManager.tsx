'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SAMPLE_BOM = [
  {
    id: 'b1',
    partNumber: 'PSU-TCTHF-01',
    mpn: 'IRF540N',
    description: 'N-Channel MOSFET 100V 33A — TC/HF H-Bridge',
    qty: 8,
    category: 'Semiconductor',
    subsystem: 'TC/HF',
    primaryVendor: 'Mouser Electronics',
    indianVendor: 'Rhistone Technologies, Mumbai',
    unitPriceInr: 95,
  },
  {
    id: 'b2',
    partNumber: 'PSU-LETID-01',
    mpn: 'LT3080',
    description: 'Linear Regulator 1.1A Adj — LETID Precision',
    qty: 4,
    category: 'Semiconductor',
    subsystem: 'LETID',
    primaryVendor: 'DigiKey',
    indianVendor: 'Evelta Electronics, Bengaluru',
    unitPriceInr: 280,
  },
  {
    id: 'b3',
    partNumber: 'PSU-PID-01',
    mpn: 'HV9150',
    description: 'HV MOSFET Driver 1200V — PID HV Stage',
    qty: 2,
    category: 'Semiconductor',
    subsystem: 'PID',
    primaryVendor: 'Mouser Electronics',
    indianVendor: 'Semikron India, Pune',
    unitPriceInr: 1250,
  },
  {
    id: 'b4',
    partNumber: 'COM-MB-01',
    mpn: 'MAX485',
    description: 'RS-485 Transceiver — Modbus RTU/TCP',
    qty: 6,
    category: 'Communication',
    subsystem: 'Common',
    primaryVendor: 'DigiKey',
    indianVendor: 'Rajguru Electronics, Mumbai',
    unitPriceInr: 35,
  },
];

export default function BOMManager() {
  const [filter, setFilter] = useState('All');
  const subsystems = ['All', 'TC/HF', 'LETID', 'PID', 'Common'];

  const filtered = filter === 'All' ? SAMPLE_BOM : SAMPLE_BOM.filter((b) => b.subsystem === filter);

  const totalInr = filtered.reduce((sum, b) => sum + b.unitPriceInr * b.qty, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">BOM / BOQ Manager</h2>
          <p className="text-gray-400 text-sm">Bill of Materials with Indian vendor alternatives</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Estimated Total</p>
          <p className="text-lg font-semibold text-green-400">
            ₹{totalInr.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Subsystem filter */}
      <div className="flex gap-2 flex-wrap">
        {subsystems.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* BOM Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left p-3">Part No.</th>
                  <th className="text-left p-3">MPN</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-center p-3">Qty</th>
                  <th className="text-left p-3">Subsystem</th>
                  <th className="text-left p-3">Indian Vendor</th>
                  <th className="text-right p-3">Unit (₹)</th>
                  <th className="text-right p-3">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-3 font-mono text-xs text-gray-400">{item.partNumber}</td>
                    <td className="p-3 font-mono text-xs text-blue-300">{item.mpn}</td>
                    <td className="p-3 text-xs text-gray-300">{item.description}</td>
                    <td className="p-3 text-center text-xs">{item.qty}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">{item.subsystem}</Badge>
                    </td>
                    <td className="p-3 text-xs text-gray-400">{item.indianVendor}</td>
                    <td className="p-3 text-right text-xs font-mono">
                      {item.unitPriceInr.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right text-xs font-mono text-green-400">
                      {(item.unitPriceInr * item.qty).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-600 bg-gray-800/30">
                  <td colSpan={7} className="p-3 text-xs text-gray-400 font-medium">
                    Total ({filtered.length} items)
                  </td>
                  <td className="p-3 text-right text-sm font-semibold text-green-400">
                    ₹{totalInr.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" size="sm">Export CSV</Button>
        <Button variant="outline" size="sm">Export Excel</Button>
        <Button variant="outline" size="sm">Export PDF</Button>
      </div>

      <p className="text-xs text-gray-600">
        Full BOM sourcing via Nexar API will be integrated in Session 2.
      </p>
    </div>
  );
}
