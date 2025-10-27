"use client";

import { useState } from "react";
import { PIPING_CONSTANTS } from "@/utils/constants";

export default function Home() {
  const [formData, setFormData] = useState({
    nmotor: "0.85",
    lengthOfPipe: "",
    diaOfPipe: "",
    depthOfWaterTable: "",
    drawDown: "",
    pmotorInputPower: "",
    powerFactor: "",
    q: "",
    pressureGuageValue: "",
    k1: "",
    k2: "",
    k3: "",
    k4: "",
    k5: "",
    k6: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data:", formData);
    // Add your form submission logic here
  };

  const resetForm = () => {
    setFormData({
      nmotor: "0.85",
      lengthOfPipe: "",
      diaOfPipe: "",
      depthOfWaterTable: "",
      drawDown: "",
      pmotorInputPower: "",
      powerFactor: "",
      q: "",
      pressureGuageValue: "",
      k1: "",
      k2: "",
      k3: "",
      k4: "",
      k5: "",
      k6: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pump Efficiency Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Enter pump system parameters
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Form */}
          <div className="flex-1 rounded-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ƞmotor Input at the top */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ƞmotor (Motor Efficiency)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.nmotor}
                onChange={(e) => handleInputChange("nmotor", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter motor efficiency"
              />
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Length of pipe (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lengthOfPipe}
                  onChange={(e) => handleInputChange("lengthOfPipe", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter length"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dia of pipe (m)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.diaOfPipe}
                  onChange={(e) => handleInputChange("diaOfPipe", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter diameter"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Depth of water table (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.depthOfWaterTable}
                  onChange={(e) => handleInputChange("depthOfWaterTable", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter depth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Draw down (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.drawDown}
                  onChange={(e) => handleInputChange("drawDown", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter draw down"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pmotor Input power (Kw)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.pmotorInputPower}
                  onChange={(e) => handleInputChange("pmotorInputPower", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter power"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Power Factor (Pf)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.powerFactor}
                  onChange={(e) => handleInputChange("powerFactor", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter power factor"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Q (m³/hour)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.q}
                  onChange={(e) => handleInputChange("q", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter flow rate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pressure Guage Value (Ppsi)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.pressureGuageValue}
                  onChange={(e) => handleInputChange("pressureGuageValue", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter pressure"
                />
              </div>
            </div>

            {/* Piping Network Section */}
            <div className="pt-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Piping Network
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    K1 (90° elbow)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.k1}
                    onChange={(e) => handleInputChange("k1", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter K1"
                  />
                  {formData.k1 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Net: {(PIPING_CONSTANTS.K1 * parseFloat(formData.k1)).toFixed(2)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    K2 (gate valve)(open)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.k2}
                    onChange={(e) => handleInputChange("k2", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter K2"
                  />
                  {formData.k2 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Net: {(PIPING_CONSTANTS.K2 * parseFloat(formData.k2)).toFixed(2)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    K3 (foot valve)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.k3}
                    onChange={(e) => handleInputChange("k3", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter K3"
                  />
                  {formData.k3 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Net: {(PIPING_CONSTANTS.K3 * parseFloat(formData.k3)).toFixed(2)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    K4 (swing check valve)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.k4}
                    onChange={(e) => handleInputChange("k4", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter K4"
                  />
                  {formData.k4 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Net: {(PIPING_CONSTANTS.K4 * parseFloat(formData.k4)).toFixed(2)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    K5 Entrance (sharp)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.k5}
                    onChange={(e) => handleInputChange("k5", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter K5"
                  />
                  {formData.k5 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Net: {(PIPING_CONSTANTS.K5 * parseFloat(formData.k5)).toFixed(2)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    K6 (exit)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.k6}
                    onChange={(e) => handleInputChange("k6", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter K6"
                  />
                  {formData.k6 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Net: {(PIPING_CONSTANTS.K6 * parseFloat(formData.k6)).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset
              </button>
            </div>
          </form>
          </div>

          {/* Vertical Line */}
          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <div className="h-96 w-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
          </div>

          {/* Right Side - Results */}
          <div className="flex-1 rounded-lg p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Results
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
