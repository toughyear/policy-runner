import { create } from "zustand";

export interface AgentDistributionConfig {
  // Religion distribution (percentages)
  religionDistribution: {
    hindu: number;
    muslim: number;
    christian: number;
    sikh: number;
    jain: number;
    buddhist: number;
    zoroastrian: number;
    atheist: number;
    other: number;
  };

  // Normal distribution parameters
  angerConfig: {
    mean: number;
    stdDev: number;
    peakFactor: number;
  };

  // Long-tail distribution parameters
  persuasivenessConfig: {
    alpha: number; // Shape parameter (lower = longer tail)
    scale: number; // Scaling factor
  };

  // Long-tail distribution parameters
  incomeConfig: {
    alpha: number; // Shape parameter (lower = longer tail)
    scale: number; // Scaling factor
  };

  // Gullibility distribution
  gullibilityConfig: {
    highThreshold: number; // Percentage of high gullibility (0-1)
    highMin: number; // Minimum value for high gullibility
    lowMax: number; // Maximum value for low gullibility
  };
}

interface AgentConfigStore {
  config: AgentDistributionConfig;
  updateReligionDistribution: (
    religion: keyof AgentDistributionConfig["religionDistribution"],
    value: number
  ) => void;
  updateAngerConfig: (
    key: keyof AgentDistributionConfig["angerConfig"],
    value: number
  ) => void;
  updatePersuasivenessConfig: (
    key: keyof AgentDistributionConfig["persuasivenessConfig"],
    value: number
  ) => void;
  updateIncomeConfig: (
    key: keyof AgentDistributionConfig["incomeConfig"],
    value: number
  ) => void;
  updateGullibilityConfig: (
    key: keyof AgentDistributionConfig["gullibilityConfig"],
    value: number
  ) => void;
  resetToDefaults: () => void;
}

// Default configuration values
const DEFAULT_CONFIG: AgentDistributionConfig = {
  religionDistribution: {
    hindu: 0.8,
    muslim: 0.1,
    christian: 0.04,
    sikh: 0.02,
    jain: 0.01,
    buddhist: 0.01,
    zoroastrian: 0.01,
    atheist: 0.005,
    other: 0.005,
  },
  angerConfig: {
    mean: 0.5,
    stdDev: 0.2,
    peakFactor: 2,
  },
  persuasivenessConfig: {
    alpha: 1.5,
    scale: 10,
  },
  incomeConfig: {
    alpha: 1.5,
    scale: 10,
  },
  gullibilityConfig: {
    highThreshold: 0.8,
    highMin: 0.6,
    lowMax: 0.6,
  },
};

export const useAgentConfigStore = create<AgentConfigStore>((set) => ({
  config: DEFAULT_CONFIG,

  updateReligionDistribution: (religion, value) =>
    set((state) => ({
      config: {
        ...state.config,
        religionDistribution: {
          ...state.config.religionDistribution,
          [religion]: value,
        },
      },
    })),

  updateAngerConfig: (key, value) =>
    set((state) => ({
      config: {
        ...state.config,
        angerConfig: {
          ...state.config.angerConfig,
          [key]: value,
        },
      },
    })),

  updatePersuasivenessConfig: (key, value) =>
    set((state) => ({
      config: {
        ...state.config,
        persuasivenessConfig: {
          ...state.config.persuasivenessConfig,
          [key]: value,
        },
      },
    })),

  updateIncomeConfig: (key, value) =>
    set((state) => ({
      config: {
        ...state.config,
        incomeConfig: {
          ...state.config.incomeConfig,
          [key]: value,
        },
      },
    })),

  updateGullibilityConfig: (key, value) =>
    set((state) => ({
      config: {
        ...state.config,
        gullibilityConfig: {
          ...state.config.gullibilityConfig,
          [key]: value,
        },
      },
    })),

  resetToDefaults: () => set({ config: DEFAULT_CONFIG }),
}));
