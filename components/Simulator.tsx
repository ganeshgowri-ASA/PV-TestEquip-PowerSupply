'use client';
import { useState, useEffect, useRef } from 'react';

const RECIPES = [
  { id: 'tc200', name: 'TC 200 Cycles', type: 'TC', standard: 'IEC 61215:2021', duration: 200, tempMin: -40, tempMax: 85, rampRate: 3, dwellTime: 10 },
  { id: 'hf10', name: 'HF 10 Cycles', type: 'HF', standard: 'IEC 61215:2021', duration: 10, tempMin: -40, tempMax: 85, humidity: 85, rampRate: 3, dwellTime: 20 },
  { id: 'letid', name: 'LETID Sensitivity', type: 'LETID', standard: 'PVEL Protocol', duration: 162, irradiance: 1000, cellTemp: 75, currentFraction: 0.5 },
  { id: 'pid', name: 'PID Stress IEC 62804', type: 'PID', standard: 'IEC TS 62804-1:2025', duration: 96, voltage: -1000, humidity: 85, temperature: 85 },
];

export default function Simulator({ addToast }: { addToast?: (m:string,t?:string)=>void }) {
  const [selectedRecipe, setSelectedRecipe] = useState(RECIPES[0]);
  const [channels, setChannels] = useState<number[]>([1,2,3]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deployed, setDeployed] = useState(false);
  const [simData, setSimData] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const toggleChannel = (ch: number) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c=>c!==ch) : [...prev, ch].sort());
  };

  const generateProfile = () => {
    const points: number[] = [];
    const r = selectedRecipe;
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      if (r.type === 'TC') {
        const cycle = (t * 4) % 1;
        points.push(cycle < 0.25 ? r.tempMin + (r.tempMax - r.tempMin) * (cycle / 0.25) : cycle < 0.5 ? r.tempMax : cycle < 0.75 ? r.tempMax - (r.tempMax - r.tempMin) * ((cycle - 0.5) / 0.25) : r.tempMin);
      } else if (r.type === 'HF') {
        const cycle = (t * 2) % 1;
        points.push(cycle < 0.3 ? r.tempMin + (r.tempMax - r.tempMin) * (cycle / 0.3) : cycle < 0.7 ? r.tempMax : r.tempMax - (r.tempMax - r.tempMin) * ((cycle - 0.7) / 0.3));
      } else if (r.type === 'LETID') {
        points.push(r.currentFraction! * (1 + 0.05 * Math.sin(t * 20)));
      } else {
        points.push(r.voltage! * (1 + 0.02 * Math.random()));
      }
    }
    return points;
  };

  useEffect(() => {
    const data = generateProfile();
    setSimData(data);
  }, [selectedRecipe]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || simData.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(0, (h/5)*i); ctx.lineTo(w, (h/5)*i); ctx.stroke(); }
    for (let i = 0; i <= 10; i++) { ctx.beginPath(); ctx.moveTo((w/10)*i, 0); ctx.lineTo((w/10)*i, h); ctx.stroke(); }
    const min = Math.min(...simData), max = Math.max(...simData);
    const range = max - min || 1;
    ctx.strokeStyle = selectedRecipe.type === 'TC' ? '#3b82f6' : selectedRecipe.type === 'HF' ? '#8b5cf6' : selectedRecipe.type === 'LETID' ? '#f59e0b' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const drawTo = running ? Math.floor(progress) : 100;
    for (let i = 0; i <= drawTo; i++) {
      const x = (i / 100) * w;
      const y = h - ((simData[i] - min) / range) * (h - 40) - 20;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    if (running && progress < 100) {
      const px = (progress / 100) * w;
      ctx.fillStyle = '#22c55e';
      ctx.beginPath(); ctx.arc(px, h - ((simData[Math.floor(progress)] - min) / range) * (h - 40) - 20, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText(selectedRecipe.type === 'LETID' ? 'Current (Isc fraction)' : selectedRecipe.type === 'PID' ? 'Voltage (V)' : 'Temperature (C)', 10, 15);
    ctx.fillText(`Min: ${min.toFixed(1)}  Max: ${max.toFixed(1)}`, 10, h - 5);
  }, [simData, progress, running]);

  const startSim = () => {
    setRunning(true); setProgress(0); setDeployed(false);
    addToast?.('Simulation started', 'success');
    intervalRef.current = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(intervalRef.current!); setRunning(false); addToast?.('Simulation complete!', 'success'); return 100; } return p + 0.5; });
    }, 50);
  };

  const stopSim = () => { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); addToast?.('Simulation stopped', 'error'); };

  const deployToHardware = () => { setDeployed(true); addToast?.(`Recipe deployed to channels [${channels.join(',')}]`, 'success'); };

  const estDuration = selectedRecipe.type === 'TC' ? `${selectedRecipe.duration * 2}h` : selectedRecipe.type === 'HF' ? `${selectedRecipe.duration * 24}h` : `${selectedRecipe.duration}h`;
  const estEnergy = selectedRecipe.type === 'TC' ? '12.5 kWh/cycle' : selectedRecipe.type === 'PID' ? '0.8 kWh' : '3.2 kWh';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">Test Program Simulator</h2><p className="text-gray-400 text-sm">Select recipe, preview profile, simulate before deploying to hardware</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-blue-400">Recipe Selection</h3>
          <div className="space-y-2">
            {RECIPES.map(r => (
              <button key={r.id} onClick={() => { setSelectedRecipe(r); setProgress(0); setRunning(false); }} className={`w-full text-left p-3 rounded-lg border transition ${selectedRecipe.id === r.id ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 hover:border-gray-500'}`}>
                <div className="flex justify-between items-center"><span className="font-medium text-sm">{r.name}</span><span className={`text-xs px-2 py-0.5 rounded ${r.type==='TC'?'bg-blue-800 text-blue-300':r.type==='HF'?'bg-purple-800 text-purple-300':r.type==='LETID'?'bg-yellow-800 text-yellow-300':'bg-red-800 text-red-300'}`}>{r.type}</span></div>
                <p className="text-xs text-gray-500 mt-1">{r.standard}</p>
              </button>
            ))}
          </div>
          <div><h4 className="text-sm font-medium text-gray-300 mb-2">Target Channels</h4>
            <div className="grid grid-cols-5 gap-1">
              {[1,2,3,4,5,6,7,8,9,10].map(ch => (
                <button key={ch} onClick={() => toggleChannel(ch)} className={`p-1.5 text-xs rounded ${channels.includes(ch)?'bg-green-700 text-white':'bg-gray-800 text-gray-400'}`}>CH{ch}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">{selectedRecipe.name} Profile</h3>
              <div className="flex gap-2">
                {!running ? <button onClick={startSim} className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm font-medium">Run Simulation</button> : <button onClick={stopSim} className="px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-medium">Stop</button>}
              </div>
            </div>
            <canvas ref={canvasRef} width={700} height={250} className="w-full rounded bg-gray-950" />
            {running && <div className="mt-3"><div className="flex justify-between text-xs text-gray-400 mb-1"><span>Progress</span><span>{progress.toFixed(1)}%</span></div><div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full transition-all" style={{width:`${progress}%`}} /></div></div>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center"><p className="text-xs text-gray-400">Est. Duration</p><p className="text-lg font-bold text-blue-400">{estDuration}</p></div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center"><p className="text-xs text-gray-400">Est. Energy</p><p className="text-lg font-bold text-yellow-400">{estEnergy}</p></div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center"><p className="text-xs text-gray-400">Channels</p><p className="text-lg font-bold text-green-400">{channels.length} / 10</p></div>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Deploy to Hardware</h3>
            <div className="flex items-center gap-4">
              <button onClick={deployToHardware} disabled={running || channels.length===0} className={`px-6 py-2 rounded-lg font-medium ${running||channels.length===0?'bg-gray-700 text-gray-500 cursor-not-allowed':'bg-orange-600 hover:bg-orange-700 text-white'}`}>Deploy Recipe to PSU</button>
              {deployed && <div className="flex items-center gap-2 text-green-400"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg><span className="text-sm">Deployed to CH [{channels.join(',')}]</span></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
