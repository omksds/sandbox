"use client";

import React, { useState, useEffect } from 'react';
import SimulationForm from '@/components/SimulationForm';
import SimulationResult from '@/components/SimulationResult';

// Define a type for our simulation input data
interface SimulationInput {
  capital: number;
  loan: number;
  propertyPrice: number;
  reformCost: number;
  rentIncome: number;
  expenses: number;
}

// Define a type for our simulation result data
interface SimulationOutput {
  equity: number;
  debtRatio: number;
  isSolvent: boolean;
  cashFlow: number;
}

export default function Home() {
  // State for user inputs
  const [inputs, setInputs] = useState<SimulationInput>({
    capital: 100,      // 資本金 (万円)
    loan: 900,         // 社長貸付 (万円)
    propertyPrice: 1000, // 物件価格 (万円)
    reformCost: 50,      // リフォーム費用 (万円)
    rentIncome: 10,      // 月間家賃収入 (万円)
    expenses: 5,         // 月間経費 (万円)
  });

  // State for calculation results
  const [results, setResults] = useState<SimulationOutput | null>(null);

  // Handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  // Run simulation automatically when inputs change
  useEffect(() => {
    // Calculation logic
    const runSimulation = () => {
      // 自己資本 = 資本金 - 資産計上されない支出（リフォーム費用）
      const equity = inputs.capital - inputs.reformCost;

      // 総資産 = 物件価格
      const totalAssets = inputs.propertyPrice;

      // 総負債 = 社長貸付
      const totalLiabilities = inputs.loan;

      // 債務超過判定 (自己資本がマイナスか、または負債が資産を上回るか)
      const isSolvent = equity > 0 && totalAssets > totalLiabilities;

      // 負債比率
      const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

      // 年間キャッシュフロー
      const cashFlow = (inputs.rentIncome - inputs.expenses) * 12;

      setResults({
        equity,
        debtRatio,
        isSolvent,
        cashFlow,
      });
    };

    runSimulation();
  }, [inputs]);

  return (
    <main className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          不動産投資 債務超過シミュレーター
        </h1>
        <p className="text-gray-600 mt-2">
          資本金、借入、支出を入力して債務超過リスクを可視化します。
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <SimulationForm inputs={inputs} onInputChange={handleInputChange} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <SimulationResult results={results} />
        </div>
      </div>
    </main>
  );
}
