// Piping Network Constants
export const PIPING_CONSTANTS = {
  K1: 0.6,    // 90° elbow
  K2: 0.15,   // gate valve (open)
  K3: 4,      // foot valve
  K4: 2,      // swing check valve
  K5: 0.5,    // Entrance (sharp)
  K6: 1,      // exit
} as const;

// Labels for display
export const PIPING_LABELS = {
  K1: "K1 (90° elbow)",
  K2: "K2 (gate valve)(open)",
  K3: "K3 (foot valve)",
  K4: "K4 (swing check valve)",
  K5: "K5 Entrance (sharp)",
  K6: "K6 (exit)",
} as const;
