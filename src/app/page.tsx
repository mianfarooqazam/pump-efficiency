"use client";

import { useState } from "react";

export default function Home() {
  const [flowRate, setFlowRate] = useState("");
  const [head, setHead] = useState("");
  const [powerInput, setPowerInput] = useState("");
  const [density, setDensity] = useState("1000");
  const [efficiency, setEfficiency] = useState("");
  const [powerOutput, setPowerOutput] = useState("");

  const calculateEfficiency = () => {
    const Q = parseFloat(flowRate);
    const H = parseFloat(head);
    const P_in = parseFloat(powerInput);
    const rho = parseFloat(density);

    if (Q && H && P_in && rho) {
      // Power output = (Q * H * ρ * g) / 1000 (kW)
      const g = 9.81; // gravity
      const P_out = (Q * H * rho * g) / 1000;
      const eff = (P_out / P_in) * 100;
      
      setPowerOutput(P_out.toFixed(2));
      setEfficiency(eff.toFixed(2));
    }
  };

  const resetForm = () => {
    setFlowRate("");
    setHead("");
    setPowerInput("");
    setDensity("1000");
    setEfficiency("");
    setPowerOutput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Pump Efficiency Calculator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Calculate pump efficiency and performance metrics for industrial applications
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Pump Parameters
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Flow Rate (Q) - m³/s
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={flowRate}
                    onChange={(e) => setFlowRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter flow rate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Head (H) - meters
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={head}
                    onChange={(e) => setHead(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter head"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Power Input (P_in) - kW
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={powerInput}
                    onChange={(e) => setPowerInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter power input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fluid Density (ρ) - kg/m³
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter fluid density"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={calculateEfficiency}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Calculate Efficiency
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Results
              </h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Pump Efficiency
                  </h3>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {efficiency ? `${efficiency}%` : "---"}
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-900 dark:text-green-300 mb-2">
                    Power Output
                  </h3>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {powerOutput ? `${powerOutput} kW` : "---"}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-300 mb-3">
                    Formula Used
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><strong>Power Output:</strong> P_out = (Q × H × ρ × g) / 1000</p>
                    <p><strong>Efficiency:</strong> η = (P_out / P_in) × 100%</p>
                    <p className="text-xs mt-2">
                      Where: Q = Flow rate (m³/s), H = Head (m), ρ = Density (kg/m³), g = 9.81 m/s²
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Pump Efficiency Guidelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">Poor Efficiency</h3>
                <p className="text-red-700 dark:text-red-400">&lt; 60%</p>
                <p className="text-red-600 dark:text-red-500 text-xs mt-1">
                  Consider pump replacement or maintenance
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">Fair Efficiency</h3>
                <p className="text-yellow-700 dark:text-yellow-400">60% - 80%</p>
                <p className="text-yellow-600 dark:text-yellow-500 text-xs mt-1">
                  Monitor performance and consider optimization
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="font-medium text-green-900 dark:text-green-300 mb-2">Good Efficiency</h3>
                <p className="text-green-700 dark:text-green-400">&gt; 80%</p>
                <p className="text-green-600 dark:text-green-500 text-xs mt-1">
                  Excellent pump performance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
