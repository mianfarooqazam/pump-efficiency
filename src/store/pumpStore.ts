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

interface PumpStore {
  formData: PumpFormData;
  updateField: (field: keyof PumpFormData, value: string) => void;
  resetForm: () => void;
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
        })
    }),
    {
      name: 'pump-efficiency-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);

