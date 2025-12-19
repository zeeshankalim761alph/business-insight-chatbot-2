import React from 'react';
import { BusinessContext, Industry } from '../types';
import { Settings, TrendingUp, TrendingDown, Minus, DollarSign, Users, Briefcase, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardSidebarProps {
  context: BusinessContext;
  onUpdateContext: (newContext: BusinessContext) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ context, onUpdateContext, isOpen, toggleSidebar }) => {
  const handleChange = (field: keyof BusinessContext, value: string | number) => {
    onUpdateContext({ ...context, [field]: value });
  };

  const profit = context.monthlyRevenue - context.monthlyExpenses;
  const isProfitable = profit >= 0;

  const data = [
    { name: 'Expenses', value: Number(context.monthlyExpenses) },
    { name: 'Profit', value: Math.max(0, profit) },
  ];
  const COLORS = ['#ef4444', '#22c55e'];

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-30 w-80 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}
    >
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          Business Profile
        </h2>
        <button onClick={toggleSidebar} className="md:hidden text-slate-500">
           ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Quick Stats Visualization */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Financial Health</h3>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <span className={`text-xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
              {isProfitable ? '+' : '-'}${Math.abs(profit).toLocaleString()}
            </span>
            <p className="text-xs text-slate-500">Net Profit (Monthly)</p>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Industry</label>
            <select
              value={context.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {Object.values(Industry).map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Revenue ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="number"
                  value={context.monthlyRevenue}
                  onChange={(e) => handleChange('monthlyRevenue', Number(e.target.value))}
                  className="w-full pl-7 p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Expenses ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="number"
                  value={context.monthlyExpenses}
                  onChange={(e) => handleChange('monthlyExpenses', Number(e.target.value))}
                  className="w-full pl-7 p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Active Customers</label>
            <div className="relative">
              <Users className="absolute left-2 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="number"
                value={context.customerCount}
                onChange={(e) => handleChange('customerCount', Number(e.target.value))}
                className="w-full pl-7 p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Current Trend</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(['up', 'stable', 'down'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleChange('trend', t)}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all ${
                    context.trend === t 
                      ? 'bg-white shadow text-indigo-600' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t === 'up' && <TrendingUp className="w-4 h-4" />}
                  {t === 'stable' && <Minus className="w-4 h-4" />}
                  {t === 'down' && <TrendingDown className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Primary Goal</label>
            <div className="relative">
              <Target className="absolute left-2 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Expand to new markets"
                value={context.goals}
                onChange={(e) => handleChange('goals', e.target.value)}
                className="w-full pl-7 p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

        </div>
      </div>
      
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-500 text-center">
          Update these figures to get contextual advice from the chatbot.
        </p>
      </div>
    </div>
  );
};

export default DashboardSidebar;