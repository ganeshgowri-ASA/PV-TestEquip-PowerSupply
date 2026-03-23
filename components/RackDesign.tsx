'use client';
import { useState } from 'react';

const UNITS = [
  { id: 1, name: 'TC/HF PSU #1', type: 'TC/HF', model: 'Itech IT6512C', specs: '80V/120A/1800W', uHeight: 3 },
  { id: 2, name: 'TC/HF PSU #2', type: 'TC/HF', model: 'Itech IT6512C', specs: '80V/120A/1800W', uHeight: 3 },
  { id: 3, name: 'LETID PSU #1', type: 'LETID', model: 'Keysight E36312A', specs: '60V/2A/30W', uHeight: 2 },
  { id: 4, name: 'LETID PSU #2', type: 'LETID', model: 'Keysight E36312A', specs: '60V/2A/30W', uHeight: 2 },
  { id: 5, name: 'PID HV PSU', type: 'PID', model: 'Glassman EH5R04', specs: '5kV/4mA', uHeight: 3 },
  { id: 6, name: 'DAQ System', type: 'Common', model: 'Keysight DAQ970A', specs: '20-ch multiplexer', uHeight: 2 },
  { id: 7, name: 'PLC Controller', type: 'Common', model: 'Siemens S7-1200', specs: 'CPU 1214C', uHeight: 1 },
  { id: 8, name: 'Modbus Gateway', type: 'Common', model: 'Moxa MGate 5105', specs: 'RS485 to Ethernet', uHeight: 1 },
  { id: 9, name: 'HMI Panel', type: 'Common', model: 'Weintek MT8102iE', specs: '10.1" Touch', uHeight: 4 },
  { id: 10, name: 'Safety Relay Module', type: 'Safety', model: 'Pilz PNOZ s4', specs: 'E-Stop + Interlocks', uHeight: 1 },
];

export default function RackDesign() {
  const [rackCount, setRackCount] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<typeof UNITS[0]|null>(null);
  const [view, setView] = useState<'front'|'rear'>('front');
  const totalU = UNITS.reduce((s,u)=>s+u.uHeight,0);

  const typeColor = (type: string) => {
    switch(type) { case 'TC/HF': return '#3b82f6'; case 'LETID': return '#f59e0b'; case 'PID': return '#ef4444'; case 'Safety': return '#ec4899'; default: return '#6b7280'; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">Design & Drawing</h2><p className="text-gray-400 text-sm">Interactive 19" rack layout - {rackCount} rack(s), 42U, {UNITS.length} units per rack</p></div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><span className="text-sm text-gray-400">Racks:</span>
            {[1,2,3,4,5].map(n=>(<button key={n} onClick={()=>setRackCount(n)} className={`w-8 h-8 rounded text-sm ${rackCount===n?'bg-blue-600':'bg-gray-800 hover:bg-gray-700'}`}>{n}</button>))}
          </div>
          <div className="flex rounded overflow-hidden border border-gray-700">
            <button onClick={()=>setView('front')} className={`px-3 py-1 text-sm ${view==='front'?'bg-blue-600':'bg-gray-800'}`}>Front</button>
            <button onClick={()=>setView('rear')} className={`px-3 py-1 text-sm ${view==='rear'?'bg-blue-600':'bg-gray-800'}`}>Rear</button>
          </div>
        </div>
      </div>
      <div className="grid gap-6" style={{gridTemplateColumns:`repeat(${Math.min(rackCount,3)},1fr)`}}>
        {Array.from({length:rackCount}).map((_,ri)=>(
          <div key={ri} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-center mb-3 text-blue-400">Rack {ri+1} - {view==='front'?'Front':'Rear'} View</h3>
            <svg viewBox="0 0 300 500" className="w-full" style={{maxHeight:'500px'}}>
              <rect x="10" y="5" width="280" height="490" rx="4" fill="#111827" stroke="#374151" strokeWidth="2" />
              <rect x="15" y="10" width="270" height="480" rx="2" fill="#0a0a1a" stroke="#1f2937" strokeWidth="1" />
              {UNITS.map((unit, i) => {
                const prevH = UNITS.slice(0,i).reduce((s,u)=>s+u.uHeight,0);
                const y = 15 + (prevH / totalU) * 470;
                const h = (unit.uHeight / totalU) * 470 - 2;
                return (
                  <g key={unit.id} onClick={()=>setSelectedUnit(unit)} className="cursor-pointer">
                    <rect x="20" y={y} width="260" height={h} rx="2" fill={selectedUnit?.id===unit.id?typeColor(unit.type)+'40':typeColor(unit.type)+'20'} stroke={typeColor(unit.type)} strokeWidth={selectedUnit?.id===unit.id?2:1} />
                    {view === 'front' ? (
                      <>
                        <text x="30" y={y+h/2+1} fill="#e5e7eb" fontSize="9" dominantBaseline="middle">{unit.name}</text>
                        <text x="270" y={y+h/2+1} fill="#9ca3af" fontSize="7" textAnchor="end" dominantBaseline="middle">{unit.uHeight}U</text>
                        {unit.type !== 'Common' && unit.type !== 'Safety' && <><circle cx="250" cy={y+h/2} r="3" fill="#22c55e" /><circle cx="240" cy={y+h/2} r="3" fill="#3b82f6" /></>}
                      </>
                    ) : (
                      <>
                        <text x="30" y={y+h/2+1} fill="#9ca3af" fontSize="8" dominantBaseline="middle">{unit.model}</text>
                        <rect x="230" y={y+4} width="40" height={h-8} rx="1" fill="#1f2937" stroke="#374151" />
                        <text x="250" y={y+h/2+1} fill="#6b7280" fontSize="6" textAnchor="middle" dominantBaseline="middle">CONN</text>
                      </>
                    )}
                  </g>
                );
              })}
              <text x="150" y="498" fill="#4b5563" fontSize="8" textAnchor="middle">19" Standard Rack | 42U | 600x800mm</text>
            </svg>
          </div>
        ))}
      </div>
      {selectedUnit && (
        <div className="bg-gray-900 border border-blue-700 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold" style={{color:typeColor(selectedUnit.type)}}>{selectedUnit.name}</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3 text-sm">
                <div><span className="text-gray-400">Model:</span> <span className="text-white">{selectedUnit.model}</span></div>
                <div><span className="text-gray-400">Specs:</span> <span className="text-white">{selectedUnit.specs}</span></div>
                <div><span className="text-gray-400">Type:</span> <span style={{color:typeColor(selectedUnit.type)}}>{selectedUnit.type}</span></div>
                <div><span className="text-gray-400">Height:</span> <span className="text-white">{selectedUnit.uHeight}U</span></div>
                <div><span className="text-gray-400">Qty per Rack:</span> <span className="text-white">1</span></div>
                <div><span className="text-gray-400">Total ({rackCount} racks):</span> <span className="text-white font-bold">{rackCount}</span></div>
              </div>
            </div>
            <button onClick={()=>setSelectedUnit(null)} className="text-gray-400 hover:text-white text-xl">&times;</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-5 gap-4">
        {[{label:'TC/HF PSU',color:'#3b82f6',count:2*rackCount},{label:'LETID PSU',color:'#f59e0b',count:2*rackCount},{label:'PID HV PSU',color:'#ef4444',count:1*rackCount},{label:'DAQ + PLC',color:'#6b7280',count:3*rackCount},{label:'Safety',color:'#ec4899',count:1*rackCount}].map(c=>(
          <div key={c.label} className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{background:c.color}} />
            <p className="text-xs text-gray-400">{c.label}</p>
            <p className="text-lg font-bold">{c.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
