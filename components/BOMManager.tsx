'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

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
}

const FULL_BOM: BOMItem[] = [
  // TC/HF Power Stage
  { id: 'b01', partNumber: 'PSU-TCHF-Q1', mpn: 'C3M0065090D', description: 'SiC MOSFET 900V 36A TO-247 — H-Bridge', qty: 20, category: 'Semiconductor', subsystem: 'TC/HF', primaryVendor: 'Mouser', indianVendor: 'Rhistone Technologies, Mumbai', unitPriceInr: 850 },
  { id: 'b02', partNumber: 'PSU-TCHF-D1', mpn: 'C4D10120D', description: 'SiC Schottky Diode 1200V 10A — Clamp', qty: 20, category: 'Semiconductor', subsystem: 'TC/HF', primaryVendor: 'DigiKey', indianVendor: 'Evelta Electronics, Bengaluru', unitPriceInr: 420 },
  { id: 'b03', partNumber: 'PSU-TCHF-GD1', mpn: 'UCC21520', description: 'Isolated Gate Driver Dual-Ch 5.7A — SiC Drive', qty: 10, category: 'Semiconductor', subsystem: 'TC/HF', primaryVendor: 'Mouser', indianVendor: 'Texas Instruments India', unitPriceInr: 310 },
  { id: 'b04', partNumber: 'PSU-TCHF-L1', mpn: 'SER2918H-103KL', description: 'Inductor 10µH 30A Shielded — Buck/Boost', qty: 10, category: 'Passive', subsystem: 'TC/HF', primaryVendor: 'DigiKey', indianVendor: 'Coilcraft India, Chennai', unitPriceInr: 580 },
  { id: 'b05', partNumber: 'PSU-TCHF-C1', mpn: 'EEU-FC1V222', description: 'Electrolytic Cap 2200µF 35V — DC Link', qty: 20, category: 'Passive', subsystem: 'TC/HF', primaryVendor: 'Mouser', indianVendor: 'Sunrom Electronics, Ahmedabad', unitPriceInr: 95 },
  { id: 'b06', partNumber: 'PSU-TCHF-C2', mpn: 'C3225X7R1H106K', description: 'MLCC 10µF 50V X7R 1210 — Decoupling', qty: 40, category: 'Passive', subsystem: 'TC/HF', primaryVendor: 'DigiKey', indianVendor: 'Rajguru Electronics, Mumbai', unitPriceInr: 18 },
  { id: 'b07', partNumber: 'PSU-TCHF-R1', mpn: 'CSNL2512FT10L0', description: 'Current Sense Resistor 10mΩ 2W 2512 — Kelvin', qty: 10, category: 'Passive', subsystem: 'TC/HF', primaryVendor: 'Mouser', indianVendor: 'Vishay India', unitPriceInr: 45 },
  { id: 'b08', partNumber: 'PSU-TCHF-CT1', mpn: 'ACS712ELCTR-30A', description: 'Hall Effect Current Sensor 30A — Feedback', qty: 10, category: 'Sensor', subsystem: 'TC/HF', primaryVendor: 'DigiKey', indianVendor: 'Robocraze, Bengaluru', unitPriceInr: 160 },

  // LETID Precision Stage
  { id: 'b09', partNumber: 'PSU-LETID-U1', mpn: 'LT3080EST', description: 'LDO Regulator 1.1A Adjustable — Precision', qty: 10, category: 'Semiconductor', subsystem: 'LETID', primaryVendor: 'DigiKey', indianVendor: 'Evelta Electronics, Bengaluru', unitPriceInr: 280 },
  { id: 'b10', partNumber: 'PSU-LETID-U2', mpn: 'REF5060AIDGK', description: 'Voltage Reference 6.0V 0.05% — Precision', qty: 5, category: 'Semiconductor', subsystem: 'LETID', primaryVendor: 'Mouser', indianVendor: 'Texas Instruments India', unitPriceInr: 350 },
  { id: 'b11', partNumber: 'PSU-LETID-U3', mpn: 'INA226AIDGSR', description: 'Current/Power Monitor I2C 16-bit — Kelvin', qty: 10, category: 'Semiconductor', subsystem: 'LETID', primaryVendor: 'DigiKey', indianVendor: 'Evelta Electronics, Bengaluru', unitPriceInr: 220 },
  { id: 'b12', partNumber: 'PSU-LETID-R1', mpn: 'Y14870R01000B9R', description: 'Precision Resistor 0.01Ω 0.1% — Sense', qty: 10, category: 'Passive', subsystem: 'LETID', primaryVendor: 'Mouser', indianVendor: 'Vishay India', unitPriceInr: 85 },
  { id: 'b13', partNumber: 'PSU-LETID-C1', mpn: 'GRM32ER71E106KA12', description: 'MLCC 10µF 25V X7R 1206 — Filter', qty: 20, category: 'Passive', subsystem: 'LETID', primaryVendor: 'DigiKey', indianVendor: 'Rajguru Electronics, Mumbai', unitPriceInr: 12 },

  // PID High Voltage Stage
  { id: 'b14', partNumber: 'PSU-PID-U1', mpn: 'HV9150DBZ', description: 'HV MOSFET Driver 1200V — Flyback Drive', qty: 4, category: 'Semiconductor', subsystem: 'PID', primaryVendor: 'Mouser', indianVendor: 'Semikron India, Pune', unitPriceInr: 1250 },
  { id: 'b15', partNumber: 'PSU-PID-Q1', mpn: 'IXFH6N120P', description: 'MOSFET 1200V 6A TO-247 — HV Switch', qty: 4, category: 'Semiconductor', subsystem: 'PID', primaryVendor: 'DigiKey', indianVendor: 'Rhistone Technologies, Mumbai', unitPriceInr: 680 },
  { id: 'b16', partNumber: 'PSU-PID-T1', mpn: 'Custom-4kV-Xfmr', description: 'HV Transformer 4kV Isolation — Flyback', qty: 2, category: 'Passive', subsystem: 'PID', primaryVendor: 'Custom Wind', indianVendor: 'Mangal Transformers, Vadodara', unitPriceInr: 4500 },
  { id: 'b17', partNumber: 'PSU-PID-D1', mpn: 'UF4007', description: 'Ultra-Fast Diode 1000V 1A — HV Rectifier', qty: 20, category: 'Semiconductor', subsystem: 'PID', primaryVendor: 'Mouser', indianVendor: 'Sunrom Electronics, Ahmedabad', unitPriceInr: 8 },
  { id: 'b18', partNumber: 'PSU-PID-C1', mpn: '944U601K122MAMS', description: 'Film Cap 6kV 1.2nF — HV Filter', qty: 8, category: 'Passive', subsystem: 'PID', primaryVendor: 'DigiKey', indianVendor: 'Moglix (B2B)', unitPriceInr: 380 },
  { id: 'b19', partNumber: 'PSU-PID-R1', mpn: 'MOX1206-1G-2%', description: 'HV Resistor 1GΩ — Bleeder/Divider', qty: 4, category: 'Passive', subsystem: 'PID', primaryVendor: 'Mouser', indianVendor: 'SP Robotics, Chennai', unitPriceInr: 210 },
  { id: 'b20', partNumber: 'PSU-PID-U2', mpn: 'AD8495ARMZ', description: 'Thermocouple Amplifier K-type — Temp Monitor', qty: 4, category: 'Semiconductor', subsystem: 'PID', primaryVendor: 'DigiKey', indianVendor: 'Evelta Electronics, Bengaluru', unitPriceInr: 450 },
  { id: 'b21', partNumber: 'PSU-PID-RL1', mpn: 'G5NB-1A-E-DC12', description: 'Relay SPST 12V 5A — HV Polarity Switch', qty: 8, category: 'Electromech', subsystem: 'PID', primaryVendor: 'Mouser', indianVendor: 'Moglix (B2B)', unitPriceInr: 65 },

  // Controller & Communication
  { id: 'b22', partNumber: 'CTL-MCU-01', mpn: 'STM32H743VIT6', description: 'MCU ARM Cortex-M7 480MHz — Main Controller', qty: 1, category: 'Semiconductor', subsystem: 'Common', primaryVendor: 'Mouser', indianVendor: 'STMicroelectronics India', unitPriceInr: 1800 },
  { id: 'b23', partNumber: 'CTL-ADC-01', mpn: 'ADS8688IDBT', description: 'ADC 16-bit 8-ch SAR — Voltage/Current Acq', qty: 2, category: 'Semiconductor', subsystem: 'Common', primaryVendor: 'DigiKey', indianVendor: 'Texas Instruments India', unitPriceInr: 920 },
  { id: 'b24', partNumber: 'CTL-DAC-01', mpn: 'DAC8568ICPW', description: 'DAC 16-bit 8-ch — Setpoint Output', qty: 2, category: 'Semiconductor', subsystem: 'Common', primaryVendor: 'Mouser', indianVendor: 'Texas Instruments India', unitPriceInr: 750 },
  { id: 'b25', partNumber: 'COM-MB-01', mpn: 'MAX485ESA+T', description: 'RS-485 Transceiver — Modbus RTU', qty: 6, category: 'Communication', subsystem: 'Common', primaryVendor: 'DigiKey', indianVendor: 'Rajguru Electronics, Mumbai', unitPriceInr: 35 },
  { id: 'b26', partNumber: 'COM-ETH-01', mpn: 'W5500', description: 'Ethernet Controller SPI — Modbus TCP', qty: 2, category: 'Communication', subsystem: 'Common', primaryVendor: 'Mouser', indianVendor: 'Robocraze, Bengaluru', unitPriceInr: 320 },
  { id: 'b27', partNumber: 'COM-ISO-01', mpn: 'ISO7741DBQR', description: 'Digital Isolator 4-ch — Bus Isolation', qty: 4, category: 'Semiconductor', subsystem: 'Common', primaryVendor: 'DigiKey', indianVendor: 'Texas Instruments India', unitPriceInr: 190 },

  // Safety & Protection
  { id: 'b28', partNumber: 'SAF-RLY-01', mpn: 'G6B-2214P-US-DC24', description: 'Safety Relay 24V — E-Stop/Interlock', qty: 4, category: 'Electromech', subsystem: 'Common', primaryVendor: 'Mouser', indianVendor: 'Omron India', unitPriceInr: 340 },
  { id: 'b29', partNumber: 'SAF-FUSE-01', mpn: '0216010.MXP', description: 'Fuse 10A 250V Slow-Blow — Channel Protect', qty: 12, category: 'Electromech', subsystem: 'Common', primaryVendor: 'DigiKey', indianVendor: 'Sunrom Electronics, Ahmedabad', unitPriceInr: 28 },
  { id: 'b30', partNumber: 'SAF-TVS-01', mpn: 'SMBJ60CA', description: 'TVS Diode 60V Bidirectional — Surge Protect', qty: 20, category: 'Semiconductor', subsystem: 'Common', primaryVendor: 'Mouser', indianVendor: 'Rajguru Electronics, Mumbai', unitPriceInr: 22 },

  // Power & Thermal
  { id: 'b31', partNumber: 'THM-HS-01', mpn: 'ATS-52300K-C1-R0', description: 'Heatsink 300mm Extruded — MOSFET Cooling', qty: 5, category: 'Thermal', subsystem: 'TC/HF', primaryVendor: 'DigiKey', indianVendor: 'Moglix (B2B)', unitPriceInr: 520 },
  { id: 'b32', partNumber: 'THM-FAN-01', mpn: 'AFB1212SH', description: 'Fan 120mm 12V 3200RPM — Forced Air', qty: 8, category: 'Thermal', subsystem: 'Common', primaryVendor: 'Mouser', indianVendor: 'SP Robotics, Chennai', unitPriceInr: 380 },
  { id: 'b33', partNumber: 'PWR-CONN-01', mpn: 'SAURO-395', description: 'Terminal Block 3-pos 30A — Power Bus', qty: 20, category: 'Connector', subsystem: 'Common', primaryVendor: 'Mouser', indianVendor: 'Moglix (B2B)', unitPriceInr: 45 },
  { id: 'b34', partNumber: 'PWR-CONN-02', mpn: 'Molex-39-30-1040', description: 'Mini-Fit Jr 4-pin — Kelvin Sense', qty: 20, category: 'Connector', subsystem: 'Common', primaryVendor: 'DigiKey', indianVendor: 'Rajguru Electronics, Mumbai', unitPriceInr: 55 },
  { id: 'b35', partNumber: 'PCB-MAIN-01', mpn: 'Custom-6Layer', description: 'Main Controller PCB 6-Layer FR4 — 160×100mm', qty: 2, category: 'PCB', subsystem: 'Common', primaryVendor: 'JLCPCB', indianVendor: 'PCB Power, Gujarat', unitPriceInr: 1200 },
  { id: 'b36', partNumber: 'PCB-PSU-01', mpn: 'Custom-4Layer', description: 'Power Stage PCB 4-Layer — 200×120mm', qty: 10, category: 'PCB', subsystem: 'TC/HF', primaryVendor: 'JLCPCB', indianVendor: 'PCB Power, Gujarat', unitPriceInr: 800 },
];

export default function BOMManager() {
  const { addToast } = useToast();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const subsystems = ['All', 'TC/HF', 'LETID', 'PID', 'Common'];

  const filtered = FULL_BOM
    .filter((b) => filter === 'All' || b.subsystem === filter)
    .filter((b) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return b.mpn.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.partNumber.toLowerCase().includes(q);
    });

  const totalInr = filtered.reduce((sum, b) => sum + b.unitPriceInr * b.qty, 0);
  const grandTotal = FULL_BOM.reduce((sum, b) => sum + b.unitPriceInr * b.qty, 0);

  const exportCSV = useCallback(() => {
    const header = 'Part Number,MPN,Description,Qty,Category,Subsystem,Primary Vendor,Indian Vendor,Unit Price (INR),Total (INR)';
    const rows = FULL_BOM.map((b) =>
      `"${b.partNumber}","${b.mpn}","${b.description}",${b.qty},"${b.category}","${b.subsystem}","${b.primaryVendor}","${b.indianVendor}",${b.unitPriceInr},${b.unitPriceInr * b.qty}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PV-TestEquip-BOM.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'CSV Exported', description: `${FULL_BOM.length} items exported`, variant: 'success' });
  }, [addToast]);

  const exportExcel = useCallback(async () => {
    try {
      const XLSX = await import('xlsx');
      const data = FULL_BOM.map((b) => ({
        'Part Number': b.partNumber,
        'MPN': b.mpn,
        'Description': b.description,
        'Qty': b.qty,
        'Category': b.category,
        'Subsystem': b.subsystem,
        'Primary Vendor': b.primaryVendor,
        'Indian Vendor': b.indianVendor,
        'Unit Price (INR)': b.unitPriceInr,
        'Total (INR)': b.unitPriceInr * b.qty,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'BOM');

      // Add summary row
      const summaryData = [
        { Subsystem: 'TC/HF', Items: FULL_BOM.filter((b) => b.subsystem === 'TC/HF').length, Total: FULL_BOM.filter((b) => b.subsystem === 'TC/HF').reduce((s, b) => s + b.unitPriceInr * b.qty, 0) },
        { Subsystem: 'LETID', Items: FULL_BOM.filter((b) => b.subsystem === 'LETID').length, Total: FULL_BOM.filter((b) => b.subsystem === 'LETID').reduce((s, b) => s + b.unitPriceInr * b.qty, 0) },
        { Subsystem: 'PID', Items: FULL_BOM.filter((b) => b.subsystem === 'PID').length, Total: FULL_BOM.filter((b) => b.subsystem === 'PID').reduce((s, b) => s + b.unitPriceInr * b.qty, 0) },
        { Subsystem: 'Common', Items: FULL_BOM.filter((b) => b.subsystem === 'Common').length, Total: FULL_BOM.filter((b) => b.subsystem === 'Common').reduce((s, b) => s + b.unitPriceInr * b.qty, 0) },
        { Subsystem: 'GRAND TOTAL', Items: FULL_BOM.length, Total: grandTotal },
      ];
      const ws2 = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

      XLSX.writeFile(wb, 'PV-TestEquip-BOM.xlsx');
      addToast({ title: 'Excel Exported', description: `${FULL_BOM.length} items with summary`, variant: 'success' });
    } catch {
      addToast({ title: 'Export Failed', description: 'Could not generate Excel file', variant: 'destructive' });
    }
  }, [addToast, grandTotal]);

  const exportPDF = useCallback(async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF('landscape', 'mm', 'a4');

      doc.setFontSize(16);
      doc.text('PV TestEquip Power Supply — Bill of Materials', 14, 15);
      doc.setFontSize(9);
      doc.text('Antaryami Solar Analytics | IEC 61215:2021 | IEC TS 62804-1:2025', 14, 22);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} | ${FULL_BOM.length} items | Grand Total: INR ${grandTotal.toLocaleString('en-IN')}`, 14, 27);

      autoTable(doc, {
        startY: 32,
        head: [['#', 'Part No.', 'MPN', 'Description', 'Qty', 'Subsystem', 'Indian Vendor', 'Unit (INR)', 'Total (INR)']],
        body: FULL_BOM.map((b, i) => [
          i + 1, b.partNumber, b.mpn, b.description, b.qty, b.subsystem, b.indianVendor,
          b.unitPriceInr.toLocaleString('en-IN'), (b.unitPriceInr * b.qty).toLocaleString('en-IN'),
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [30, 64, 175] },
        foot: [['', '', '', '', '', '', 'GRAND TOTAL', '', `INR ${grandTotal.toLocaleString('en-IN')}`]],
        footStyles: { fillColor: [16, 185, 129], fontStyle: 'bold' },
      });

      doc.save('PV-TestEquip-BOM.pdf');
      addToast({ title: 'PDF Exported', description: `${FULL_BOM.length} items`, variant: 'success' });
    } catch {
      addToast({ title: 'Export Failed', description: 'Could not generate PDF', variant: 'destructive' });
    }
  }, [addToast, grandTotal]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">BOM / BOQ Manager</h2>
          <p className="text-gray-400 text-sm">{FULL_BOM.length} components with Indian vendor alternatives</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Grand Total ({FULL_BOM.length} items)</p>
          <p className="text-lg font-semibold text-green-400">
            INR {grandTotal.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Search & filter */}
      <div className="flex gap-3 flex-wrap items-center">
        <Input
          placeholder="Search MPN, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
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
            {s} ({s === 'All' ? FULL_BOM.length : FULL_BOM.filter((b) => b.subsystem === s).length})
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
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Part No.</th>
                  <th className="text-left p-3">MPN</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-center p-3">Qty</th>
                  <th className="text-left p-3">Subsystem</th>
                  <th className="text-left p-3">Indian Vendor</th>
                  <th className="text-right p-3">Unit (INR)</th>
                  <th className="text-right p-3">Total (INR)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-3 text-xs text-gray-600">{idx + 1}</td>
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
                  <td colSpan={8} className="p-3 text-xs text-gray-400 font-medium">
                    Subtotal ({filtered.length} items)
                  </td>
                  <td className="p-3 text-right text-sm font-semibold text-green-400">
                    INR {totalInr.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Subsystem summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['TC/HF', 'LETID', 'PID', 'Common'].map((sub) => {
          const items = FULL_BOM.filter((b) => b.subsystem === sub);
          const total = items.reduce((s, b) => s + b.unitPriceInr * b.qty, 0);
          return (
            <Card key={sub}>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-500 uppercase">{sub}</p>
                <p className="text-lg font-semibold text-green-400">INR {total.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500">{items.length} items, {items.reduce((s, b) => s + b.qty, 0)} pcs</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
        <Button variant="outline" size="sm" onClick={exportExcel}>Export Excel</Button>
        <Button variant="outline" size="sm" onClick={exportPDF}>Export PDF</Button>
      </div>
    </div>
  );
}
