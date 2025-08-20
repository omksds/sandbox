"use client";

import React from 'react';

// Re-defining type here for clarity
interface SimulationOutput {
  equity: number;
  debtRatio: number;
  isSolvent: boolean;
  cashFlow: number;
}

interface Props {
  results: SimulationOutput | null;
}

const SimulationResult: React.FC<Props> = ({ results }) => {
  if (!results) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">シミュレーション結果</h2>
        <p className="text-gray-500">数値を入力してシミュレーションを開始してください。</p>
      </div>
    );
  }

  const { equity, debtRatio, isSolvent, cashFlow } = results;

  const resultItems = [
    {
      label: "自己資本",
      value: `${equity.toLocaleString()} 万円`,
      description: "資本金から資産計上されない支出を引いた額。これがマイナスだと実質的な債務超過です。"
    },
    {
      label: "年間キャッシュフロー",
      value: `${cashFlow.toLocaleString()} 万円`,
      description: "年間の手取り収入です。"
    },
    {
      label: "負債比率",
      value: `${debtRatio.toFixed(1)} %`,
      description: "総資産に対する負債の割合。高いほどリスクが増加します。"
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">シミュレーション結果</h2>

      <div className={`p-4 rounded-lg mb-6 ${isSolvent ? 'bg-green-100' : 'bg-red-100'}`}>
        <h3 className={`text-lg font-bold ${isSolvent ? 'text-green-800' : 'text-red-800'}`}>
          財務状況: {isSolvent ? '健全' : '債務超過リスクあり'}
        </h3>
        <p className={`text-sm mt-1 ${isSolvent ? 'text-green-700' : 'text-red-700'}`}>
          {isSolvent
            ? '現時点では自己資本はプラスで、資産が負債を上回っています。'
            : '自己資本がマイナス、または総資産が負債を下回っており、金融機関から債務超過と判断される可能性があります。'}
        </p>
      </div>

      <div className="space-y-4">
        {resultItems.map(item => (
          <div key={item.label} className="p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="text-lg font-semibold text-gray-900">{item.value}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulationResult;
