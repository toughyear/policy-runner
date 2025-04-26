import { useAgentConfigStore } from "../store/agent-config-store";
import { AgentTraits } from "../types";

/**
 * Generates random traits for an agent based on specified distributions
 * Uses the current configuration from the Zustand store
 */
export function generateRandomAgentTraits(): AgentTraits {
  const config = useAgentConfigStore.getState().config;

  return {
    religion: generateReligion(config.religionDistribution),
    anger: generateNormalDistribution(
      config.angerConfig.mean,
      config.angerConfig.stdDev,
      config.angerConfig.peakFactor
    ),
    persuasiveness: generateLongTailDistribution(
      config.persuasivenessConfig.alpha,
      config.persuasivenessConfig.scale
    ),
    gullibility: generateGullibility(
      config.gullibilityConfig.highThreshold,
      config.gullibilityConfig.highMin,
      config.gullibilityConfig.lowMax
    ),
    income: generateLongTailDistribution(
      config.incomeConfig.alpha,
      config.incomeConfig.scale
    ),
  };
}

/**
 * Generates religion based on configured distribution percentages
 */
function generateReligion(distribution: Record<string, number>): string {
  const random = Math.random();
  let cumulativeProbability = 0;

  // Convert distribution to cumulative probability
  const religions = Object.keys(distribution) as Array<
    keyof typeof distribution
  >;

  for (const religion of religions) {
    cumulativeProbability += distribution[religion];
    if (random < cumulativeProbability) {
      // Capitalize first letter
      return religion.charAt(0).toUpperCase() + religion.slice(1);
    }
  }

  // Fallback (should not happen if probabilities sum to 1)
  return "Other";
}

/**
 * Generates a value from a normal distribution with given mean and standard deviation
 * The value is clamped between 0 and 1
 * The peakFactor controls how peaked the distribution is (higher = more centered)
 */
function generateNormalDistribution(
  mean: number,
  stdDev: number,
  peakFactor: number
): number {
  // Box-Muller transform to generate normally distributed random number
  let u1 = 0,
    u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

  // Apply peak factor to make distribution more or less peaked
  const value = mean + stdDev * z0 * (1 / peakFactor);

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, value));
}

/**
 * Generates a long-tail distribution value between 0 and 1
 * Uses power law distribution (Pareto-like) where most values are low
 * but a few are very high
 */
function generateLongTailDistribution(alpha: number, scale: number): number {
  const u = Math.random();

  // Apply inverse CDF of power law
  const value = Math.pow(1 - u, -1 / alpha) - 1;

  // Normalize to [0,1] range
  return Math.min(1, value / scale);
}

/**
 * Generates gullibility based on configured thresholds
 */
function generateGullibility(
  highThreshold: number,
  highMin: number,
  lowMax: number
): number {
  const random = Math.random();

  if (random < highThreshold) {
    // High gullibility range
    return highMin + Math.random() * (1 - highMin);
  } else {
    // Low gullibility range
    return Math.random() * lowMax;
  }
}
