'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/Toast';

interface BOMItem {
  id: string;
  partNumber: string;
  mpn: string;
  description: string;
  qty: number;
  category: string;
  subsystem: string;
  primaryVendor: string;
  indianVendor: string;
  unitPriceInr: number;
  mouserPrice?: number;
  digikeyPrice?: number;
  element14Price?: number;
}

const FULL_BOM: BOMItem[] = [
  // TC/HF Power Supplies
  { id: 'b1', partNumber: 'PSU-TCHF-01', mpn: 'IT6512C', description: 'Itech IT6500C Bidirectional PSU 60V/30A', qty: 5, category: 'Power Supply', subsystem: 'TC/HF', primaryVendor: 'Itech Direct', indianVendor: 'Scientech, Mumbai', unitPriceInr: 285000 },
  // LETID Power Supplies
  { id: 'b2', partNumber: 'PSU-LETID-01', mpn: 'E36312A', description: 'Keysight E36312A Triple Output 60V/2A', qty: 2, category: 'Power Supply', subsystem: 'LETID', primaryVendor: 'Keysight Direct', indianVendor: 'Scientech, Mumbai', unitPriceInr: 145000 },
  // PID Power Supply
  { id: 'b3', partNumber: 'PSU-PID-01', mpn: 'EH40P01', description: 'Glassman EH Series 4kV HV Supply', qty: 1, category: 'Power Supply', subsystem: 'PID', primaryVendor: 'XP Power', indianVendor: 'Agilent India', unitPriceInr: 420000 },
  // Contactors
  { id: 'b4', partNumber: 'CT-01', mpn: '3RT2026-1BB40', description: 'Siemens 3RT2 Contactor 25A 24VDC', qty: 10, category: 'Switching', subsystem: 'Common', primaryVendor: 'Siemens', indianVendor: 'Siemens India Pvt Ltd', unitPriceInr: 2800 },
  // MCBs
  { id: 'b5', partNumber: 'MCB-01', mpn: '5SY4132-7', description: 'Siemens MCB 32A C-Curve 1P', qty: 15, category: 'Protection', subsystem: 'Common', primaryVendor: 'Siemens', indianVendor: 'Siemens India Pvt Ltd', unitPriceInr: 450 },
  // Fuses
  { id: 'b6', partNumber: 'FU-01', mpn: '0216030.MXP', description: 'Littelfuse 30A Fast-Blow Fuse', qty: 20, category: 'Protection', subsystem: 'Common', primaryVendor: 'Mouser', indianVendor: 'Rajguru Electronics', unitPriceInr: 85 },
  // Terminal Blocks
  { id: 'b7', partNumber: 'TB-01', mpn: '1928370000', description: 'Weidmuller WDU 4 Terminal Block', qty: 100, category: 'Interconnect', subsystem: 'Common', primaryVendor: 'Mouser', indianVendor: 'Electrocomponents India', unitPriceInr: 45 },
  // DIN Rails
  { id: 'b8', partNumber: 'DR-01', mpn: 'TS35-15', description: 'DIN Rail TS35 1m Galvanized Steel', qty: 10, category: 'Mechanical', subsystem: 'Common', primaryVendor: 'Phoenix Contact', indianVendor: 'Electrocomponents India', unitPriceInr: 180 },
  // Modbus Converters
  { id: 'b9', partNumber: 'MB-01', mpn: 'USR-TCP232-410S', description: 'USR RS485 to Ethernet Converter', qty: 5, category: 'Communication', subsystem: 'Common', primaryVendor: 'USR IOT', indianVendor: 'Robu.in', unitPriceInr: 3500 },
  // PT100 Sensors
  { id: 'b10', partNumber: 'TS-01', mpn: 'PT100-A-3W', description: 'PT100 RTD Class A 3-Wire', qty: 20, category: 'Sensor', subsystem: 'Common', primaryVendor: 'Omega', indianVendor: 'Tempsens, Jaipur', unitPriceInr: 850 },
  // PT1000 Sensors
  { id: 'b11', partNumber: 'TS-02', mpn: 'PT1000-B-4W', description: 'PT1000 RTD Class B 4-Wire', qty: 10, category: 'Sensor', subsystem: 'LETID', primaryVendor: 'Omega', indianVendor: 'Tempsens, Jaipur', unitPriceInr: 1200 },
  // Humidity Sensors
  { id: 'b12', partNumber: 'HS-01', mpn: 'SHT45', description: 'Sensirion SHT45 Humidity Sensor', qty: 5, category: 'Sensor', subsystem: 'Common', primaryVendor: 'DigiKey', indianVendor: 'Evelta Electronics', unitPriceInr: 950 },
  // DAQ
  { id: 'b13', partNumber: 'DAQ-01', mpn: 'DAQ970A', description: 'Keysight DAQ970A Data Logger', qty: 1, category: 'Data Acquisition', subsystem: 'Common', primaryVendor: 'Keysight', indianVendor: 'Scientech, Mumbai', unitPriceInr: 185000 },
  // Aluminium Extrusion
  { id: 'b14', partNumber: 'EX-01', mpn: '3842990720', description: 'Bosch Rexroth 45x45 Profile 2m', qty: 20, category: 'Mechanical', subsystem: 'Common', primaryVendor: 'Bosch Rexroth', indianVendor: 'Bosch Rexroth India', unitPriceInr: 1800 },
  // Heat Sinks
  { id: 'b15', partNumber: 'HS-02', mpn: 'SK104-50.8', description: 'Fischer SK104 Heat Sink 50mm', qty: 20, category: 'Thermal', subsystem: 'TC/HF', primaryVendor: 'DigiKey', indianVendor: 'SP Robotics, Chennai', unitPriceInr: 320 },
  // Cooling Fans
  { id: 'b16', partNumber: 'FN-01', mpn: '4414F', description: 'ebm-papst 4414F Axial Fan 24VDC', qty: 10, category: 'Thermal', subsystem: 'Common', primaryVendor: 'Mouser', indianVendor: 'ebm-papst India', unitPriceInr: 1650 },
  // HMI Touchscreen
  { id: 'b17', partNumber: 'HMI-01', mpn: 'MT8102iE', description: 'Weintek MT8102iE 10" HMI Panel', qty: 1, category: 'Interface', subsystem: 'Common', primaryVendor: 'Weintek', indianVendor: 'Weintek India', unitPriceInr: 28000 },
  // PLC
  { id: 'b18', partNumber: 'PLC-01', mpn: '6ES7214-1AG40', description: 'Siemens S7-1200 CPU 1214C DC/DC', qty: 1, category: 'Controller', subsystem: 'Common', primaryVendor: 'Siemens', indianVendor: 'Siemens India Pvt Ltd', unitPriceInr: 32000 },
  // Cables - Power
  { id: 'b19', partNumber: 'CB-01', mpn: 'H07V-K-10', description: 'Power Cable 10 AWG 600V 100m', qty: 5, category: 'Cable', subsystem: 'Common', primaryVendor: 'Lapp Group', indianVendor: 'Polycab India', unitPriceInr: 4500 },
  // Cables - Signal
  { id: 'b20', partNumber: 'CB-02', mpn: 'LIYCY-4x0.5', description: 'Shielded Signal Cable 4x0.5mm 100m', qty: 3, category: 'Cable', subsystem: 'Common', primaryVendor: 'Lapp Group', indianVendor: 'Havells India', unitPriceInr: 3200 },
  // Connectors MC4
  { id: 'b21', partNumber: 'CN-01', mpn: 'MC4-30A', description: 'MC4 Connector Pair 30A Rated', qty: 40, category: 'Connector', subsystem: 'TC/HF', primaryVendor: 'Multi-Contact', indianVendor: 'Loom Solar', unitPriceInr: 120 },
  // Safety Relays
  { id: 'b22', partNumber: 'SR-01', mpn: 'PNOZ-S4', description: 'Pilz PNOZ s4 Safety Relay 24VDC', qty: 3, category: 'Safety', subsystem: 'Common', primaryVendor: 'Pilz', indianVendor: 'Pilz India', unitPriceInr: 12500 },
  // Emergency Stop
  { id: 'b23', partNumber: 'ES-01', mpn: 'ZB4BS844', description: 'Schneider XB4 E-Stop Mushroom', qty: 3, category: 'Safety', subsystem: 'Common', primaryVendor: 'Schneider', indianVendor: 'Schneider Electric India', unitPriceInr: 1200 },
  // Enclosure
  { id: 'b24', partNumber: 'ENC-01', mpn: 'AE1380.500', description: 'Rittal AE 800x1200x300 Enclosure', qty: 1, category: 'Enclosure', subsystem: 'Common', primaryVendor: 'Rittal', indianVendor: 'Rittal India', unitPriceInr: 18500 },
  // RS-485 Transceiver IC
  { id: 'b25', partNumber: 'IC-01', mpn: 'MAX485ESA', description: 'MAX485 RS-485 Transceiver IC', qty: 10, category: 'IC', subsystem: 'Common', primaryVendor: 'DigiKey', indianVendor: 'Rajguru Electronics', unitPriceInr: 55 },
  // MOSFET
  { id: 'b26', partNumber: 'IC-02', mpn: 'IRF540N', description: 'N-Channel MOSFET 100V 33A', qty: 8, category: 'Semiconductor', subsystem: 'TC/HF', primaryVendor: 'Mouser', indianVendor: 'Rhistone Technologies', unitPriceInr: 95 },
  // Current Sense Resistor
  { id: 'b27', partNumber: 'R-01', mpn: 'CSRN2512FK10L0', description: 'Current Sense 10mOhm 1% 2512', qty: 20, category: 'Passive', subsystem: 'Common', primaryVendor: 'DigiKey', indianVendor: 'Evelta Electronics', unitPriceInr: 25 },
  // HV Capacitor (PID)
  { id: 'b28', partNumber: 'C-01', mpn: '2220Y5000', description: 'HV Ceramic Cap 100pF 5kV', qty: 10, category: 'Passive', subsystem: 'PID', primaryVendor: 'Mouser', indianVendor: 'Semikart', unitPriceInr: 180 },
  // Surge Protector
  { id: 'b29', partNumber: 'SP-01', mpn: 'VAL-MS 230', description: 'Phoenix Contact Surge Protector', qty: 3, category: 'Protection', subsystem: 'Common', primaryVendor: 'Phoenix Contact', indianVendor: 'Phoenix Contact India', unitPriceInr: 4200 },
  // 19" Rack Cabinet
  { id: 'b30', partNumber: 'RACK-01', mpn: 'SR42UB', description: '42U 19" Server Rack 600x1000mm', qty: 1, category: 'Enclosure', subsystem: 'Common', primaryVendor: 'APC/Schneider', indianVendor: 'NetRack Enclosures', unitPriceInr: 35000 },
  // Rack PDU
  { id: 'b31', partNumber: 'PDU-01', mpn: 'AP7921B', description: 'APC Switched Rack PDU 16A', qty: 2, category: 'Power', subsystem: 'Common', primaryVendor: 'APC', indianVendor: 'Schneider Electric India', unitPriceInr: 15000 },
  // Linear Regulator (LETID)
  { id: 'b32', partNumber: 'IC-03', mpn: 'LT3080', description: 'Linear Regulator 1.1A Adj', qty: 4, category: 'Semiconductor', subsystem: 'LETID', primaryVendor: 'DigiKey', indianVendor: 'Evelta Electronics', unitPriceInr: 280 },
];

export default function BOMManager() {
  const { toast } = useToast();
  const [filter, setFilter] = useState('All');
  const [rackCount, setRackCount] = useState(1);
  const [bomItems, setBomItems] = useState<BOMItem[]>(FULL_BOM);
  const [checkingPrice, setCheckingPrice] = useState<string | null>(null);
  const subsystems = ['All', 'TC/HF', 'LETID', 'PID', 'Common'];

  const filtered = filter === 'All' ? bomItems : bomItems.filter((b) => b.subsystem === filter);
  const totalInr = filtered.reduce((sum, b) => sum + b.unitPriceInr * b.qty * rackCount, 0);

  const handleNexarCheck = useCallback(async (item: BOMItem) => {
    setCheckingPrice(item.id);
    try {
      const res = await fetch('/api/nexar/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: item.mpn, type: 'mpn', limit: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const newPrice = result.lowestPriceINR;
        if (newPrice) {
          setBomItems(prev => prev.map(b => b.id === item.id ? { ...b, mouserPrice: newPrice } : b));
          toast('success', `${item.mpn}: Nexar price \u20B9${newPrice.toLocaleString('en-IN')}`);
        } else {
          toast('info', `${item.mpn}: No pricing data found`);
        }
      } else {
        toast('warning', `${item.mpn}: Part not found on Nexar`);
      }
    } catch (err) {
      toast('error', `Failed to check price: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCheckingPrice(null);
    }
  }, [toast]);

  const exportCSV = () => {
    const headers = ['Part No.', 'MPN', 'Description', 'Qty', 'Subsystem', 'Primary Vendor', 'Indian Vendor', 'Unit Price (INR)', 'Total (INR)'];
    const rows = filtered.map(item => [
      item.partNumber, item.mpn, item.description, item.qty * rackCount,
      item.subsystem, item.primaryVendor, item.indianVendor,
      item.unitPriceInr, item.unitPriceInr * item.qty * rackCount,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pv-bom.csv'; a.click();
    URL.revokeObjectURL(url);
    toast('success', 'BOM exported as CSV');
  };

  const exportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const data = filtered.map(item => ({
        'Part No.': item.partNumber,
        'MPN': item.mpn,
        'Description': item.description,
        'Qty': item.qty * rackCount,
        'Subsystem': item.subsystem,
        'Primary Vendor': item.primaryVendor,
        'Indian Vendor': item.indianVendor,
        'Unit Price (INR)': item.unitPriceInr,
        'Total (INR)': item.unitPriceInr * item.qty * rackCount,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'BOM');
      XLSX.writeFile(wb, 'pv-bom.xlsx');
      toast('success', 'BOM exported as Excel');
    } catch {
      toast('error', 'Failed to export Excel');
    }
  };

  const exportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF('landscape');
      doc.setFontSize(16);
      doc.text('PV TestEquip - Bill of Materials', 14, 20);
      doc.setFontSize(10);
      doc.text(`Antaryami Solar Analytics | ${new Date().toLocaleDateString('en-IN')} | Rack Count: ${rackCount}`, 14, 28);

      autoTable(doc, {
        startY: 35,
        head: [['Part No.', 'MPN', 'Description', 'Qty', 'Subsystem', 'Vendor', 'Unit (INR)', 'Total (INR)']],
        body: filtered.map(item => [
          item.partNumber, item.mpn, item.description, item.qty * rackCount,
          item.subsystem, item.indianVendor,
          item.unitPriceInr.toLocaleString('en-IN'),
          (item.unitPriceInr * item.qty * rackCount).toLocaleString('en-IN'),
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [30, 64, 120] },
      });

      doc.save('pv-bom.pdf');
      toast('success', 'BOM exported as PDF');
    } catch {
      toast('error', 'Failed to export PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">BOM / BOQ Manager</h2>
          <p className="text-gray-400 text-sm">{bomItems.length} items | Indian vendor alternatives | Nexar price check</p>
        </div>
        <div className="text-right space-y-1">
          <div className="flex items-center gap-2 justify-end">
            <label className="text-xs text-gray-500">Racks:</label>
            <select value={rackCount} onChange={(e) => setRackCount(Number(e.target.value))}
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white">
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <p className="text-xs text-gray-500">Estimated Total</p>
          <p className="text-lg font-semibold text-green-400">{'\u20B9'}{totalInr.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Subsystem filter */}
      <div className="flex gap-2 flex-wrap">
        {subsystems.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >{s}</button>
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
                  <th className="text-right p-3">Unit ({'\u20B9'})</th>
                  <th className="text-right p-3">Total ({'\u20B9'})</th>
                  <th className="text-center p-3">Nexar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-3 font-mono text-xs text-gray-400">{item.partNumber}</td>
                    <td className="p-3 font-mono text-xs text-blue-300">{item.mpn}</td>
                    <td className="p-3 text-xs text-gray-300">{item.description}</td>
                    <td className="p-3 text-center text-xs">{item.qty * rackCount}</td>
                    <td className="p-3"><Badge variant="outline" className="text-xs">{item.subsystem}</Badge></td>
                    <td className="p-3 text-xs text-gray-400">{item.indianVendor}</td>
                    <td className="p-3 text-right text-xs font-mono">{item.unitPriceInr.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right text-xs font-mono text-green-400">{(item.unitPriceInr * item.qty * rackCount).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-center">
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs"
                        onClick={() => handleNexarCheck(item)}
                        disabled={checkingPrice === item.id}
                      >
                        {checkingPrice === item.id ? '...' : 'Check'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-600 bg-gray-800/30">
                  <td colSpan={7} className="p-3 text-xs text-gray-400 font-medium">Total ({filtered.length} items x {rackCount} rack{rackCount > 1 ? 's' : ''})</td>
                  <td className="p-3 text-right text-sm font-semibold text-green-400">{'\u20B9'}{totalInr.toLocaleString('en-IN')}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
        <Button variant="outline" size="sm" onClick={exportExcel}>Export Excel</Button>
        <Button variant="outline" size="sm" onClick={exportPDF}>Export PDF</Button>
      </div>
    </div>
  );
}
