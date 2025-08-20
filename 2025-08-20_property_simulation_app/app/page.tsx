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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSliderChange = (name: keyof SimulationInput, value: number) => {
    setInputs(prev => ({
      ...prev,
      [name]: value
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
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <header className="text-center mb-10 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            不動産投資 債務超過シミュレーター
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            スライダーを動かして、あなたの投資が財務的に健全か、リアルタイムで探りましょう。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12 max-w-7xl mx-auto">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <SimulationForm
              inputs={inputs}
              onInputChange={handleInputChange}
              onSliderChange={handleSliderChange}
            />
          </div>
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <SimulationResult results={results} />
          </div>
        </div>
      </main>
    </div>
  );
}
