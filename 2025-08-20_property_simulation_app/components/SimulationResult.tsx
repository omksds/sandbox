"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SimulationOutput {
  equity: number;
  debtRatio: number;
  isSolvent: boolean;
  cashFlow: number;
}

interface Props {
  results: SimulationOutput | null;
}

const StatusCard: React.FC<{ isSolvent: boolean }> = ({ isSolvent }) => {
  const bgColor = isSolvent ? 'bg-emerald-500' : 'bg-rose-500';
  const textColor = isSolvent ? 'text-emerald-50' : 'text-rose-50';
  const Icon = isSolvent ? CheckCircleIcon : AlertTriangleIcon;
  const title = isSolvent ? '財務は健全です' : '債務超過リスクあり';
  const description = isSolvent
    ? '自己資本はプラスで、資産が負債を上回っています。'
    : '自己資本がマイナスか、資産が負債を下回っています。';

  return (
    <div className={`p-5 rounded-xl ${bgColor} ${textColor} flex items-center space-x-4 shadow-lg`}>
      <Icon className="h-10 w-10 flex-shrink-0" />
      <div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; description: string }> = ({ label, value, description }) => (
  <div className="bg-slate-100 p-4 rounded-lg">
    <div className="flex justify-between items-baseline">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-2xl font-bold text-slate-900">{value}</span>
    </div>
    <p className="text-xs text-slate-500 mt-1">{description}</p>
  </div>
);

const DebtRatioChart: React.FC<{ debtRatio: number }> = ({ debtRatio }) => {
  const data = [
    { name: 'Debt', value: debtRatio },
    { name: 'Equity', value: 100 - debtRatio },
  ];
  const colors = ['#f43f5e', '#10b981'];

  return (
    <div className="w-full h-48 relative">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={70} startAngle={90} endAngle={450}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-rose-500">{debtRatio.toFixed(1)}%</span>
        <span className="text-sm text-slate-500">負債比率</span>
      </div>
    </div>
  );
};


const SimulationResult: React.FC<Props> = ({ results }) => {
  if (!results) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">シミュレーション結果</h2>
        <p className="text-slate-500">左の条件を調整して、シミュレーションを開始してください。</p>
      </div>
    );
  }

  const { equity, debtRatio, isSolvent, cashFlow } = results;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">シミュレーション結果</h2>
      <div className="flex-grow space-y-6">
        <StatusCard isSolvent={isSolvent} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <MetricCard
              label="自己資本"
              value={`${equity.toLocaleString()} 万円`}
              description="資本金からリフォーム費用を引いた額。"
            />
            <MetricCard
              label="年間キャッシュフロー"
              value={`${cashFlow.toLocaleString()} 万円`}
              description="年間の手取り収入です。"
            />
          </div>
          <div className="bg-slate-100 p-4 rounded-lg flex items-center justify-center">
            <DebtRatioChart debtRatio={debtRatio} />
          </div>
        </div>
      </div>
    </div>
  );
};

// SVG Icon Components
const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export default SimulationResult;
