'use client';
import { useState, useCallback } from 'react';
import NexarSearch from './NexarSearch';
import PowerSupplyControl from './PowerSupplyControl';
import RecipeManager from './RecipeManager';
import BOMManager from './BOMManager';
import KPIDashboard from './KPIDashboard';
import SkillExport from './SkillExport';

const TABS = [
  { id: 'kpi', label: 'KPI Dashboard', icon: '📊' },
  { id: 'ps-control', label: 'Power Supply Control', icon: '⚡' },
  { id: 'recipe', label: 'Recipe Manager', icon: '🧪' },
  { id: 'nexar', label: 'Component Sourcing', icon: '🔍' },
  { id: 'bom', label: 'BOM / BOQ', icon: '📋' },
  { id: 'skill', label: 'Skill Export', icon: '🛠️' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('kpi');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 border-b border-blue-700 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PV TestEquip Power Supply Dashboard</h1>
            <p className="text-blue-300 text-sm mt-1">TC / HF / LETID / PID — IEC 61215:2021 | IEC 62804 | HJT Bifacial</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-400">Ganesh ASA · Gujarat, IN</p>
            <p className="text-xs text-blue-400">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
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

      {/* Content */}
      <main className="max-w-screen-2xl mx-auto p-6">
        {activeTab === 'kpi' && <KPIDashboard />}
        {activeTab === 'ps-control' && <PowerSupplyControl />}
        {activeTab === 'recipe' && <RecipeManager />}
        {activeTab === 'nexar' && <NexarSearch />}
        {activeTab === 'bom' && <BOMManager />}
        {activeTab === 'skill' && <SkillExport />}
      </main>
    </div>
  );
}
