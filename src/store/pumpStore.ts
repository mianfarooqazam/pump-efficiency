import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PumpFormData {
  nmotor: string;
  lengthOfPipe: string;
  diaOfPipe: string;
  depthOfWaterTable: string;
  drawDown: string;
  pmotorInputPower: string;
  powerFactor: string;
  q: string;
  pressureGuageValue: string;
  k1: string;
  k2: string;
  k3: string;
  k4: string;
  k5: string;
  k6: string;
}

interface TableRow {
  id: string;
  pmotorInputPower: string;
  q: string;
  pressureGuageValue: string;
}

interface PumpStore {
  formData: PumpFormData;
  tableData: TableRow[];
  updateField: (field: keyof PumpFormData, value: string) => void;
  resetForm: () => void;
  addTableRow: (row: Omit<TableRow, 'id'>) => void;
  updateTableRow: (id: string, row: Omit<TableRow, 'id'>) => void;
  deleteTableRow: (id: string) => void;
  clearTable: () => void;
}

const initialFormData: PumpFormData = {
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
};

export const usePumpStore = create<PumpStore>()(
  persist(
    (set) => ({
      formData: initialFormData,
      tableData: [],
      
      updateField: (field, value) =>
        set((state) => ({
          formData: {
            ...state.formData,
            [field]: value
          }
        })),
      
      resetForm: () =>
        set({
          formData: initialFormData
        }),
      
      addTableRow: (row) =>
        set((state) => ({
          tableData: [
            ...state.tableData,
            { ...row, id: Date.now().toString() }
          ]
        })),
      
      updateTableRow: (id, row) =>
        set((state) => ({
          tableData: state.tableData.map((item) =>
            item.id === id ? { ...row, id } : item
          )
        })),
      
      deleteTableRow: (id) =>
        set((state) => ({
          tableData: state.tableData.filter((row) => row.id !== id)
        })),
      
      clearTable: () =>
        set({
          tableData: []
        })
    }),
    {
      name: 'pump-efficiency-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);

