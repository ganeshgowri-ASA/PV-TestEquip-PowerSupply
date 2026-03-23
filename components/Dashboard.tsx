'use client';
import { useState } from 'react';
import NexarSearch from './NexarSearch';
import PowerSupplyControl from './PowerSupplyControl';
import RecipeManager from './RecipeManager';
import BOMManager from './BOMManager';
import KPIDashboard from './KPIDashboard';
import SkillExport from './SkillExport';
import Simulator from './Simulator';
import RackDesign from './RackDesign';

const TABS = [
  { id: 'kpi', label: 'KPI Dashboard', icon: '\ud83d\udcca' },
  { id: 'ps-control', label: 'Power Supply Control', icon: '\u26a1' },
  { id: 'recipe', label: 'Recipe Manager', icon: '\ud83e\uddea' },
  { id: 'simulator', label: 'Simulator', icon: '\u25b6\ufe0f' },
  { id: 'design', label: 'Design & Drawing', icon: '\ud83d\udcd0' },
  { id: 'nexar', label: 'Component Sourcing', icon: '\ud83d\udd0d' },
  { id: 'bom', label: 'BOM / BOQ', icon: '\ud83d\udccb' },
  { id: 'skill', label: 'Skill Export', icon: '\ud83d\udee0\ufe0f' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('kpi');
  const [toasts, setToasts] = useState<{id:number;msg:string;type:string}[]>([]);
  const addToast = (msg:string, type='success') => {
    const id = Date.now();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3000);
  };
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 border-b border-blue-700 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PV TestEquip Power Supply Dashboard</h1>
            <p className="text-blue-300 text-sm mt-1">TC / HF / LETID / PID \u2014 IEC 61215:2021 | IEC 62804 | HJT Bifacial</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-400">Ganesh ASA \u00b7 Gujarat, IN</p>
            <p className="text-xs text-blue-400">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </header>
      <nav className="bg-gray-900 border-b border-gray-700 px-6">
        <div className="max-w-screen-2xl mx-auto flex overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
      <main className="max-w-screen-2xl mx-auto p-6">
        {activeTab === 'kpi' && <KPIDashboard />}
        {activeTab === 'ps-control' && <PowerSupplyControl addToast={addToast} />}
        {activeTab === 'recipe' && <RecipeManager addToast={addToast} />}
        {activeTab === 'simulator' && <Simulator addToast={addToast} />}
        {activeTab === 'design' && <RackDesign />}
        {activeTab === 'nexar' && <NexarSearch addToast={addToast} />}
        {activeTab === 'bom' && <BOMManager addToast={addToast} />}
        {activeTab === 'skill' && <SkillExport />}
      </main>
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map(t=>(
          <div key={t.id} className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-pulse ${
            t.type==='success'?'bg-green-600':'bg-red-600'
          }`}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}
