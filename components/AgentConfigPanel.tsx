import React from "react";
import { useAgentConfigStore } from "../store/agent-config-store";

const AgentConfigPanel: React.FC = () => {
  const {
    config,
    updateAngerConfig,
    updateGullibilityConfig,
    updateReligionDistribution,
    resetToDefaults,
  } = useAgentConfigStore();

  return (
    <div className='bg-gray-100 p-4 rounded-lg shadow'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>Agent Configuration</h2>
        <button
          onClick={resetToDefaults}
          className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
        >
          Reset to Defaults
        </button>
      </div>

      <div className='space-y-6'>
        {/* Anger Configuration */}
        <div>
          <h3 className='font-medium mb-2'>Anger Distribution</h3>
          <div className='space-y-3'>
            <div>
              <label className='block text-sm mb-1'>
                Mean: {config.angerConfig.mean.toFixed(2)}
              </label>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                value={config.angerConfig.mean}
                onChange={(e) =>
                  updateAngerConfig("mean", parseFloat(e.target.value))
                }
                className='w-full'
              />
            </div>
            <div>
              <label className='block text-sm mb-1'>
                Standard Deviation: {config.angerConfig.stdDev.toFixed(2)}
              </label>
              <input
                type='range'
                min='0.01'
                max='0.5'
                step='0.01'
                value={config.angerConfig.stdDev}
                onChange={(e) =>
                  updateAngerConfig("stdDev", parseFloat(e.target.value))
                }
                className='w-full'
              />
            </div>
            <div>
              <label className='block text-sm mb-1'>
                Peak Factor: {config.angerConfig.peakFactor.toFixed(2)}
              </label>
              <input
                type='range'
                min='0.5'
                max='5'
                step='0.1'
                value={config.angerConfig.peakFactor}
                onChange={(e) =>
                  updateAngerConfig("peakFactor", parseFloat(e.target.value))
                }
                className='w-full'
              />
              <div className='text-xs text-gray-500 mt-1'>
                Higher = more centered around mean
              </div>
            </div>
          </div>
        </div>

        {/* Gullibility Configuration */}
        <div>
          <h3 className='font-medium mb-2'>Gullibility Distribution</h3>
          <div className='space-y-3'>
            <div>
              <label className='block text-sm mb-1'>
                High Gullibility %:{" "}
                {(config.gullibilityConfig.highThreshold * 100).toFixed(0)}%
              </label>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                value={config.gullibilityConfig.highThreshold}
                onChange={(e) =>
                  updateGullibilityConfig(
                    "highThreshold",
                    parseFloat(e.target.value)
                  )
                }
                className='w-full'
              />
            </div>
            <div>
              <label className='block text-sm mb-1'>
                High Gullibility Min:{" "}
                {config.gullibilityConfig.highMin.toFixed(2)}
              </label>
              <input
                type='range'
                min='0.3'
                max='0.9'
                step='0.01'
                value={config.gullibilityConfig.highMin}
                onChange={(e) =>
                  updateGullibilityConfig("highMin", parseFloat(e.target.value))
                }
                className='w-full'
              />
            </div>
          </div>
        </div>

        {/* Religion Distribution */}
        <div>
          <h3 className='font-medium mb-2'>Religion Distribution</h3>
          <div className='space-y-3'>
            <div>
              <label className='block text-sm mb-1'>
                Hindu: {(config.religionDistribution.hindu * 100).toFixed(0)}%
              </label>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                value={config.religionDistribution.hindu}
                onChange={(e) =>
                  updateReligionDistribution(
                    "hindu",
                    parseFloat(e.target.value)
                  )
                }
                className='w-full'
              />
            </div>
            <div>
              <label className='block text-sm mb-1'>
                Muslim: {(config.religionDistribution.muslim * 100).toFixed(0)}%
              </label>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                value={config.religionDistribution.muslim}
                onChange={(e) =>
                  updateReligionDistribution(
                    "muslim",
                    parseFloat(e.target.value)
                  )
                }
                className='w-full'
              />
            </div>
            <div className='text-xs text-gray-500 mt-1'>
              Note: Make sure probabilities sum to approximately 1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentConfigPanel;
