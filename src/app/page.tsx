"use client";

import { useState, useEffect, useCallback } from "react";
import { PIPING_CONSTANTS } from "@/utils/constants";
import { usePumpStore } from "@/store/pumpStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Home() {
  "use no memo";
  const { formData, updateField, tableData, addTableRow, updateTableRow, deleteTableRow } = usePumpStore();
  const [isMounted, setIsMounted] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState({
    pmotorInputPower: "",
    q: "",
    pressureGuageValue: ""
  });
  
  // Temporary state for adding new rows
  const [newRow, setNewRow] = useState({
    pmotorInputPower: "",
    q: "",
    pressureGuageValue: ""
  });
  
  // Fix hydration mismatch by only rendering after client-side hydration
  // This is a known pattern for client-only features with persisted state
  useEffect(() => {
    // This intentional setState in useEffect is required for hydration fixes
    // eslint-disable-next-line
    setIsMounted(true);
  }, []);

  // Shared compute used by both form and table rows to guarantee identical logic
  const computePumpCalculations = (
    system: {
      lengthOfPipe: number;
      diaOfPipe: number;
      depthOfWaterTable: number;
      drawDown: number;
      nmotor: number;
      k1: number; k2: number; k3: number; k4: number; k5: number; k6: number;
    },
    readings: {
      pmotorInputPower: number;
      qM3Hour: number;
      pressureGuageValue: number;
    }
  ) => {
    const g = 9.81;
    const pi = 3.1416;

    const { lengthOfPipe, diaOfPipe, depthOfWaterTable, drawDown, nmotor, k1, k2, k3, k4, k5, k6 } = system;
    const { pmotorInputPower, qM3Hour, pressureGuageValue } = readings;

    const kTotal = (PIPING_CONSTANTS.K1 * (k1 || 0)) +
                   (PIPING_CONSTANTS.K2 * (k2 || 0)) +
                   (PIPING_CONSTANTS.K3 * (k3 || 0)) +
                   (PIPING_CONSTANTS.K4 * (k4 || 0)) +
                   (PIPING_CONSTANTS.K5 * (k5 || 0)) +
                   (PIPING_CONSTANTS.K6 * (k6 || 0));

    const qM3Sec = (qM3Hour || 0) / 3600;
    const v = diaOfPipe > 0 ? (4 * qM3Sec) / (pi * diaOfPipe * diaOfPipe) : 0;
    const re = 1e6 * v * diaOfPipe;

    let f = 0;
    if (re < 2000) {
      f = re > 0 ? 64 / re : 0;
    } else {
      f = 0.3164 * Math.pow(re, -0.25);
    }

    const hf = diaOfPipe > 0 ? (f * (lengthOfPipe / diaOfPipe) * (v * v) / (2 * g)) : 0;
    const hminor = (kTotal * (v * v)) / (2 * g);
    const pressureHead = 0.7032 * (pressureGuageValue || 0);
    const totalHead = depthOfWaterTable + drawDown + hf + hminor + pressureHead;

    const hydraulicPower = (1000 * g * qM3Sec * totalHead) / 1000; // kW
    const overallEfficiency = pmotorInputPower > 0 ? (hydraulicPower / pmotorInputPower) * 100 : 0;
    const pumpEfficiency = nmotor > 0 ? overallEfficiency / nmotor : 0;
    const shaftPower = pumpEfficiency > 0 ? hydraulicPower / (pumpEfficiency / 100) : 0;

    return { qM3Sec, v, re, f, hf, hminor, pressureHead, totalHead, hydraulicPower, overallEfficiency, pumpEfficiency, shaftPower };
  };

  // Calculation function
  const calculateResults = () => {
    // Parse input values
    const lengthOfPipe = parseFloat(formData.lengthOfPipe) || 0;
    const diaOfPipe = parseFloat(formData.diaOfPipe) || 0;
    const depthOfWaterTable = parseFloat(formData.depthOfWaterTable) || 0;
    const drawDown = parseFloat(formData.drawDown) || 0;
    const pmotorInputPower = parseFloat(formData.pmotorInputPower) || 0;
    const qM3Hour = parseFloat(formData.q) || 0;
    const pressureGuageValue = parseFloat(formData.pressureGuageValue) || 0;
    const nmotor = parseFloat(formData.nmotor) || 0.85;
    
    // Piping network values
    const k1Value = parseFloat(formData.k1) || 0;
    const k2Value = parseFloat(formData.k2) || 0;
    const k3Value = parseFloat(formData.k3) || 0;
    const k4Value = parseFloat(formData.k4) || 0;
    const k5Value = parseFloat(formData.k5) || 0;
    const k6Value = parseFloat(formData.k6) || 0;
    
    const numeric = computePumpCalculations(
      {
        lengthOfPipe,
        diaOfPipe,
        depthOfWaterTable,
        drawDown,
        nmotor,
        k1: k1Value,
        k2: k2Value,
        k3: k3Value,
        k4: k4Value,
        k5: k5Value,
        k6: k6Value,
      },
      {
        pmotorInputPower,
        qM3Hour,
        pressureGuageValue,
      }
    );
    
    return {
      pumpEfficiency: numeric.pumpEfficiency.toFixed(2),
      overallEfficiency: numeric.overallEfficiency.toFixed(2),
      minorLosses: numeric.hminor.toFixed(6),
      // Additional values for debugging if needed
      hf: numeric.hf.toFixed(4),
      v: numeric.v.toFixed(3),
      re: numeric.re.toFixed(0),
      f: numeric.f.toFixed(6),
      hydraulicPower: numeric.hydraulicPower.toFixed(2),
      totalHead: numeric.totalHead.toFixed(2),
    };
  };

  const results = calculateResults();
  
  // Calculate H(m) and all intermediate values for table row
  // Table inputs: pmotorInputPower, Q, pressureGuageValue (pump readings at different intervals)
  // Form inputs: system parameters (length, diameter, depth, power factor, motor efficiency, K values)
  // IMPORTANT: v, Re, f, hf, hminor are calculated from FORM's Q only (not table's Q)
  const calculateHForRow = useCallback((pmotorInputPower: string, qM3Hour: string, pressureGuageValue: string) => {
    const lengthOfPipe = parseFloat(formData.lengthOfPipe) || 0;
    const diaOfPipe = parseFloat(formData.diaOfPipe) || 0;
    const depthOfWaterTable = parseFloat(formData.depthOfWaterTable) || 0;
    const drawDown = parseFloat(formData.drawDown) || 0;
    const nmotor = parseFloat(formData.nmotor) || 0.85;

    const k1Value = parseFloat(formData.k1) || 0;
    const k2Value = parseFloat(formData.k2) || 0;
    const k3Value = parseFloat(formData.k3) || 0;
    const k4Value = parseFloat(formData.k4) || 0;
    const k5Value = parseFloat(formData.k5) || 0;
    const k6Value = parseFloat(formData.k6) || 0;

    // Use FORM's Q for calculating v, Re, f, hf, hminor (these don't change per table row)
    const formQM3Hour = parseFloat(formData.q) || 0;
    
    const numericFromForm = computePumpCalculations(
      {
        lengthOfPipe,
        diaOfPipe,
        depthOfWaterTable,
        drawDown,
        nmotor,
        k1: k1Value,
        k2: k2Value,
        k3: k3Value,
        k4: k4Value,
        k5: k5Value,
        k6: k6Value,
      },
      {
        pmotorInputPower: parseFloat(formData.pmotorInputPower) || 0,
        qM3Hour: formQM3Hour,
        pressureGuageValue: parseFloat(formData.pressureGuageValue) || 0,
      }
    );
    
    // Now calculate H and efficiencies using table's specific values
    const tableQM3Hour = parseFloat(qM3Hour) || 0;
    const tableQM3Sec = tableQM3Hour / 3600;
    const tablePressure = parseFloat(pressureGuageValue) || 0;
    const tablePMotor = parseFloat(pmotorInputPower) || 0;
    
    // Use form's hf and hminor, but table's pressure
    const pressureHead = 0.7032 * tablePressure;
    const totalHead = depthOfWaterTable + drawDown + numericFromForm.hf + numericFromForm.hminor + pressureHead;
    
    // Efficiency calculations use table's Q and P motor
    const hydraulicPower = (1000 * 9.81 * tableQM3Sec * totalHead) / 1000;
    const overallEfficiency = tablePMotor > 0 ? (hydraulicPower / tablePMotor) * 100 : 0;
    const pumpEfficiency = nmotor > 0 ? overallEfficiency / nmotor : 0;
    const shaftPower = pumpEfficiency > 0 ? hydraulicPower / (pumpEfficiency / 100) : 0;

    return {
      qM3Sec: tableQM3Sec.toFixed(2),
      H: totalHead.toFixed(2),
      v: numericFromForm.v.toFixed(2),
      re: numericFromForm.re.toFixed(0),
      flowType: numericFromForm.re < 2000 ? 'Laminar' : 'Turbulent',
      f: numericFromForm.f.toFixed(2),
      hf: numericFromForm.hf.toFixed(2),
      hminor: numericFromForm.hminor.toFixed(2),
      pressureHead: pressureHead.toFixed(2),
      hydraulicPower: hydraulicPower.toFixed(2),
      shaftPower: shaftPower.toFixed(2),
      pumpEfficiency: pumpEfficiency.toFixed(2),
      overallEfficiency: overallEfficiency.toFixed(2)
    };
  }, [formData.lengthOfPipe, formData.diaOfPipe, formData.depthOfWaterTable, formData.drawDown, formData.nmotor, formData.k1, formData.k2, formData.k3, formData.k4, formData.k5, formData.k6, formData.q, formData.pmotorInputPower, formData.pressureGuageValue]);
  
  
  // Prepare chart data for H(m) vs Q(m³/sec)
  // Include both form data point and table data points
  const allChartData = [];
  
  // Add form data point if Q is filled
  if (formData.q && formData.pmotorInputPower && formData.pressureGuageValue) {
    const formCalc = calculateHForRow(formData.pmotorInputPower, formData.q, formData.pressureGuageValue);
    const formQLMin = parseFloat(formData.q) * 16.67;
    allChartData.push({
      name: `Q: ${formData.q}`,
      H: parseFloat(formCalc.H),
      Q_lmin: formQLMin,
      Q_m3sec: parseFloat(formCalc.qM3Sec),
      Q_m3hour: parseFloat(formData.q),
      v: parseFloat(formCalc.v),
      re: parseFloat(formCalc.re),
      flowType: formCalc.flowType,
      f: parseFloat(formCalc.f),
      hf: parseFloat(formCalc.hf),
      hminor: parseFloat(formCalc.hminor),
      hydraulicPower: parseFloat(formCalc.hydraulicPower),
      shaftPower: parseFloat(formCalc.shaftPower),
      pumpEfficiency: parseFloat(formCalc.pumpEfficiency),
      overallEfficiency: parseFloat(formCalc.overallEfficiency),
      isFormData: true
    });
  }
  
  // Add table data points
  tableData.forEach(row => {
    const calc = calculateHForRow(row.pmotorInputPower, row.q, row.pressureGuageValue);
    const qLMin = parseFloat(row.q) * 16.67;
    allChartData.push({
      name: `Q: ${row.q}`,
      H: parseFloat(calc.H),
      Q_lmin: qLMin,
      Q_m3sec: parseFloat(calc.qM3Sec),
      Q_m3hour: parseFloat(row.q),
      v: parseFloat(calc.v),
      re: parseFloat(calc.re),
      flowType: calc.flowType,
      f: parseFloat(calc.f),
      hf: parseFloat(calc.hf),
      hminor: parseFloat(calc.hminor),
      hydraulicPower: parseFloat(calc.hydraulicPower),
      shaftPower: parseFloat(calc.shaftPower),
      pumpEfficiency: parseFloat(calc.pumpEfficiency),
      overallEfficiency: parseFloat(calc.overallEfficiency),
      isFormData: false
    });
  });
  
  const chartData = allChartData.sort((a, b) => b.Q_lmin - a.Q_lmin); // Sort by Q_lmin in descending order
  
  const handleAddRow = () => {
    if (newRow.pmotorInputPower && newRow.q && newRow.pressureGuageValue) {
      // Calculate all values for console output
      const g = 9.81;
      const pi = 3.1416;
      
      const lengthOfPipe = parseFloat(formData.lengthOfPipe) || 0;
      const diaOfPipe = parseFloat(formData.diaOfPipe) || 0;
      const depthOfWaterTable = parseFloat(formData.depthOfWaterTable) || 0;
      const drawDown = parseFloat(formData.drawDown) || 0;
      const pmotorInputPower = parseFloat(newRow.pmotorInputPower) || 0;
      const qM3Hour = parseFloat(newRow.q) || 0;
      const pressureGuageValue = parseFloat(newRow.pressureGuageValue) || 0;
      const nmotor = parseFloat(formData.nmotor) || 0.85;
      
      const k1Value = parseFloat(formData.k1) || 0;
      const k2Value = parseFloat(formData.k2) || 0;
      const k3Value = parseFloat(formData.k3) || 0;
      const k4Value = parseFloat(formData.k4) || 0;
      const k5Value = parseFloat(formData.k5) || 0;
      const k6Value = parseFloat(formData.k6) || 0;
      
      const kTotal = (PIPING_CONSTANTS.K1 * k1Value) + 
                     (PIPING_CONSTANTS.K2 * k2Value) + 
                     (PIPING_CONSTANTS.K3 * k3Value) + 
                     (PIPING_CONSTANTS.K4 * k4Value) + 
                     (PIPING_CONSTANTS.K5 * k5Value) + 
                     (PIPING_CONSTANTS.K6 * k6Value);
      
      const qM3Sec = qM3Hour / 3600;
      const qLMin = qM3Hour * 16.67;
      const v = diaOfPipe > 0 ? (4 * qM3Sec) / (pi * diaOfPipe * diaOfPipe) : 0;
      const re = 1e6 * v * diaOfPipe;
      
      let f = 0;
      let flowType = '';
      if (re < 2000) {
        f = re > 0 ? 64 / re : 0;
        flowType = 'Laminar';
      } else {
        f = 0.3164 * Math.pow(re, -0.25);
        flowType = 'Turbulent';
      }
      
      const hf = diaOfPipe > 0 ? (f * (lengthOfPipe / diaOfPipe) * (v * v) / (2 * g)) : 0;
      const hminor = (kTotal * (v * v)) / (2 * g);
      const pressureHead = 0.7032 * pressureGuageValue;
      const totalHead = depthOfWaterTable + drawDown + hf + hminor + pressureHead;
      const hydraulicPower = (1000 * g * qM3Sec * totalHead) / 1000;
      const overallEfficiency = pmotorInputPower > 0 ? (hydraulicPower / pmotorInputPower) * 100 : 0;
      const pumpEfficiency = nmotor > 0 ? overallEfficiency / nmotor : 0;
      const shaftPower = pumpEfficiency > 0 ? (hydraulicPower / (pumpEfficiency / 100)) : 0;
      
      // Console output in tabular form
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('              PUMP EFFICIENCY CALCULATIONS');
      console.log('═══════════════════════════════════════════════════════════\n');
      
      console.table({
        'Input Parameters': {
          'Length of pipe (m)': lengthOfPipe,
          'Dia of pipe (m)': diaOfPipe,
          'Depth of water table (m)': depthOfWaterTable,
          'Draw down (m)': drawDown,
          'P motor Input power (kW)': pmotorInputPower,
          'Q (m³/hour)': qM3Hour,
          'Pressure Gauge (psi)': pressureGuageValue,
          'ƞ motor': nmotor
        }
      });
      
      console.table({
        'Flow Parameters': {
          'Q (m³/sec)': qM3Sec.toFixed(6),
          'Q (l/min)': qLMin.toFixed(2),
          'Velocity v (m/sec)': v.toFixed(3),
          'Reynolds Number (Re)': re.toFixed(0),
          'Flow Type': flowType,
          'Friction Factor (f)': f.toFixed(6)
        }
      });
      
      console.table({
        'Piping Network (K values)': {
          'K1 (90° elbow)': `${k1Value} × ${PIPING_CONSTANTS.K1} = ${(PIPING_CONSTANTS.K1 * k1Value).toFixed(2)}`,
          'K2 (gate valve)': `${k2Value} × ${PIPING_CONSTANTS.K2} = ${(PIPING_CONSTANTS.K2 * k2Value).toFixed(2)}`,
          'K3 (foot valve)': `${k3Value} × ${PIPING_CONSTANTS.K3} = ${(PIPING_CONSTANTS.K3 * k3Value).toFixed(2)}`,
          'K4 (swing check)': `${k4Value} × ${PIPING_CONSTANTS.K4} = ${(PIPING_CONSTANTS.K4 * k4Value).toFixed(2)}`,
          'K5 (entrance)': `${k5Value} × ${PIPING_CONSTANTS.K5} = ${(PIPING_CONSTANTS.K5 * k5Value).toFixed(2)}`,
          'K6 (exit)': `${k6Value} × ${PIPING_CONSTANTS.K6} = ${(PIPING_CONSTANTS.K6 * k6Value).toFixed(2)}`,
          'K Total': kTotal.toFixed(4)
        }
      });
      
      console.table({
        'Head Losses': {
          'Friction loss hf (m)': hf.toFixed(6),
          'Minor losses hminor (m)': hminor.toFixed(6),
          'Pressure/Delivery head (m)': pressureHead.toFixed(4),
          'Static head (m)': (depthOfWaterTable + drawDown).toFixed(2),
          'Total Head H (m)': totalHead.toFixed(4)
        }
      });
      
      console.table({
        'Power & Efficiency': {
          'Hydraulic Power (kW)': hydraulicPower.toFixed(4),
          'Shaft Power (kW)': shaftPower.toFixed(4),
          'Pump Efficiency (%)': pumpEfficiency.toFixed(2),
          'Overall Efficiency (%)': overallEfficiency.toFixed(2)
        }
      });
      
      console.log('═══════════════════════════════════════════════════════════\n');
      
      addTableRow(newRow);
      setNewRow({
        pmotorInputPower: "",
        q: "",
        pressureGuageValue: ""
      });
    }
  };

  const handleEditRow = (row: { id: string; pmotorInputPower: string; q: string; pressureGuageValue: string }) => {
    setEditingRowId(row.id);
    setEditingValues({
      pmotorInputPower: row.pmotorInputPower,
      q: row.q,
      pressureGuageValue: row.pressureGuageValue
    });
  };

  const handleSaveRow = () => {
    if (editingRowId && editingValues.pmotorInputPower && editingValues.q && editingValues.pressureGuageValue) {
      updateTableRow(editingRowId, editingValues);
      setEditingRowId(null);
      setEditingValues({
        pmotorInputPower: "",
        q: "",
        pressureGuageValue: ""
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingValues({
      pmotorInputPower: "",
      q: "",
      pressureGuageValue: ""
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
          <form className="space-y-6">
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
                onChange={(e) => updateField("nmotor", e.target.value)}
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
                    onChange={(e) => updateField("lengthOfPipe", e.target.value)}
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
                    onChange={(e) => updateField("diaOfPipe", e.target.value)}
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
                  onChange={(e) => updateField("depthOfWaterTable", e.target.value)}
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
                  onChange={(e) => updateField("drawDown", e.target.value)}
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
                  onChange={(e) => updateField("pmotorInputPower", e.target.value)}
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
                  onChange={(e) => updateField("powerFactor", e.target.value)}
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
                  onChange={(e) => updateField("q", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter flow rate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pressure Gauge Value (psi)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.pressureGuageValue}
                  onChange={(e) => updateField("pressureGuageValue", e.target.value)}
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
                    onChange={(e) => updateField("k1", e.target.value)}
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
                    onChange={(e) => updateField("k2", e.target.value)}
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
                    onChange={(e) => updateField("k3", e.target.value)}
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
                    onChange={(e) => updateField("k4", e.target.value)}
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
                    onChange={(e) => updateField("k5", e.target.value)}
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
                    onChange={(e) => updateField("k6", e.target.value)}
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
          </form>
            </div>

          {/* Vertical Line */}
          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <div className="h-96 w-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
          </div>

          {/* Right Side - Results */}
          <div className="flex-1 rounded-lg p-6 md:p-8">
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-900 dark:text-green-300 mb-2">
                    Pump Efficiency
                  </h3>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {results.pumpEfficiency}%
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-900 dark:text-green-300 mb-2">
                  Overall Efficiency
                  </h3>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {results.overallEfficiency}%
                  </div>
                </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-900 dark:text-green-300 mb-2">
                  Minor Losses 
                  </h3>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {results.minorLosses} m
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Table and Chart Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Recorded On-Site Measurements
            </h2>
          
          {/* Add Row Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  P motor Input power (kW)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newRow.pmotorInputPower}
                  onChange={(e) => setNewRow({...newRow, pmotorInputPower: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter power"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Q (m³/hour)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newRow.q}
                  onChange={(e) => setNewRow({...newRow, q: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter flow rate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pressure Gauge Value (psi)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newRow.pressureGuageValue}
                  onChange={(e) => setNewRow({...newRow, pressureGuageValue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter pressure"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddRow}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Data Table - Simplified */}
          {isMounted && tableData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 overflow-x-auto">
              
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-300">Sr No</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-300">P motor (kW)</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-300">Q (m³/hour)</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-300">Pressure (psi)</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-300">H (m)</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-300">Pump Eff. (%)</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-300">Overall Eff. (%)</th>
                    <th className="px-4 py-3 text-gray-700 dark:text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => {
                    const isEditing = editingRowId === row.id;
                    const calc = calculateHForRow(
                      isEditing ? editingValues.pmotorInputPower : row.pmotorInputPower,
                      isEditing ? editingValues.q : row.q,
                      isEditing ? editingValues.pressureGuageValue : row.pressureGuageValue
                    );
                    
                    return (
                      <tr key={row.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        {/* Sr No */}
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{index + 1}</td>
                        
                        {/* P motor - Editable */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              value={editingValues.pmotorInputPower}
                              onChange={(e) => setEditingValues({...editingValues, pmotorInputPower: e.target.value})}
                              className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white text-sm"
                            />
                          ) : (
                            <span className="text-gray-900 dark:text-white">{row.pmotorInputPower}</span>
                          )}
                        </td>
                        
                        {/* Q - Editable */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              value={editingValues.q}
                              onChange={(e) => setEditingValues({...editingValues, q: e.target.value})}
                              className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white text-sm"
                            />
                          ) : (
                            <span className="text-gray-900 dark:text-white">{row.q}</span>
                          )}
                        </td>
                        
                        {/* Pressure - Editable */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              value={editingValues.pressureGuageValue}
                              onChange={(e) => setEditingValues({...editingValues, pressureGuageValue: e.target.value})}
                              className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white text-sm"
                            />
                          ) : (
                            <span className="text-gray-900 dark:text-white">{row.pressureGuageValue}</span>
                          )}
                        </td>
                        
                        {/* Calculated fields - Read only */}
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{calc.H}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{calc.pumpEfficiency}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{calc.overallEfficiency}</td>
                        
                        {/* Action buttons */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveRow}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 font-medium text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditRow(row)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteTableRow(row.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Chart: H(m) vs Q(l/min) */}
          {isMounted && chartData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Pump Curve
              </h3>
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="Q_lmin" 
                    label={{ value: 'Q (l/min)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    dataKey="H"
                    label={{ value: 'H (m)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded shadow-lg">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Q: {data.Q_m3hour.toFixed(2)} m³/hour
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Q (l/min): {data.Q_lmin.toFixed(2)}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">H: {data.H.toFixed(2)} m</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Pump Eff: {data.pumpEfficiency.toFixed(2)}%</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Overall Eff: {data.overallEfficiency.toFixed(2)}%</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="H" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      const isFormData = payload.isFormData;
                      return (
                        <circle
                          key={`dot-${payload.Q_m3hour}`}
                          cx={cx}
                          cy={cy}
                          r={isFormData ? 7 : 5}
                          fill={isFormData ? "#ef4444" : "#16a34a"}
                          stroke={isFormData ? "#dc2626" : "#15803d"}
                          strokeWidth={2}
                        />
                      );
                    }}
                    activeDot={{ r: 10 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
