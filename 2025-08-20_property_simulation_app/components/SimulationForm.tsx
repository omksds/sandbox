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
}

const SimulationForm: React.FC<Props> = ({ inputs, onInputChange }) => {

  const fields = [
    { id: 'capital', label: '資本金 (万円)', description: '会社の自己資金です。' },
    { id: 'loan', label: '社長貸付 (万円)', description: '社長からの借入金で、負債として計上されます。' },
    { id: 'propertyPrice', label: '不動産取得価格 (万円)', description: '購入した不動産の価格で、資産となります。' },
    { id: 'reformCost', label: 'リフォーム費用 (万円)', description: '資産計上されにくい支出で、自己資本を減少させます。' },
    { id: 'rentIncome', label: '月間家賃収入 (万円)', description: '月々の家賃収入の合計です。' },
    { id: 'expenses', label: '月間経費 (万円)', description: '管理費、固定資産税、修繕費などの合計です。' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">シミュレーション条件</h2>
      <div className="space-y-6">
        {fields.map(field => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <input
              type="number"
              id={field.id}
              name={field.id}
              value={inputs[field.id as keyof SimulationInput]}
              onChange={onInputChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-2 text-xs text-gray-500">{field.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulationForm;
