"use client";

import React from 'react';

// Re-defining type here for clarity, though it could be imported
interface SimulationInput {
  capital: number;
  loan: number;
  propertyPrice: number;
  reformCost: number;
  rentIncome: number;
  expenses: number;
}

interface Props {
  inputs: SimulationInput;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSliderChange: (name: keyof SimulationInput, value: number) => void;
}

const SimulationForm: React.FC<Props> = ({ inputs, onInputChange, onSliderChange }) => {

  const fields: (keyof SimulationInput)[] = [
    'capital', 'loan', 'propertyPrice', 'reformCost', 'rentIncome', 'expenses'
  ];

  const fieldConfig = {
    capital: { label: '資本金', description: '会社の自己資金です。', min: 0, max: 1000, step: 10 },
    loan: { label: '社長貸付', description: '社長からの借入金で、負債として計上されます。', min: 0, max: 5000, step: 100 },
    propertyPrice: { label: '不動産取得価格', description: '購入した不動産の価格で、資産となります。', min: 0, max: 10000, step: 100 },
    reformCost: { label: 'リフォーム費用', description: '資産計上されにくい支出で、自己資本を減少させます。', min: 0, max: 500, step: 10 },
    rentIncome: { label: '月間家賃収入', description: '月々の家賃収入の合計です。', min: 0, max: 100, step: 1 },
    expenses: { label: '月間経費', description: '管理費、固定資産税、修繕費などの合計です。', min: 0, max: 50, step: 1 },
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">シミュレーション条件</h2>
      <div className="space-y-6 flex-grow">
        {fields.map(id => {
          const config = fieldConfig[id];
          const value = inputs[id];
          return (
            <div key={id}>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                  {config.label}
                </label>
                <input
                  type="number"
                  id={id}
                  name={id}
                  value={value}
                  onChange={onInputChange}
                  className="w-28 text-right px-2 py-1 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                  step={config.step}
                />
              </div>
              <input
                type="range"
                min={config.min}
                max={config.max}
                step={config.step}
                value={value}
                onChange={(e) => onSliderChange(id, Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="mt-2 text-xs text-slate-500">{config.description} (単位: 万円)</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimulationForm;
