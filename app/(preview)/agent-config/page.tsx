"use client";

import { useState } from "react";
import { AgentConfigPanel } from "../../../components";
import { Agent, AgentTraits } from "../../../types";
import { generateRandomAgentTraits } from "../../../utils/agent-traits";

export default function AgentConfigTestPage() {
  const [generatedTraits, setGeneratedTraits] = useState<AgentTraits[]>([]);
  const [generatedAgents, setGeneratedAgents] = useState<{
    [key: number]: Agent;
  }>({});
  const [loadingAgents, setLoadingAgents] = useState<{
    [key: number]: boolean;
  }>({});

  const handleGenerateTraits = () => {
    const newTraits = Array(10)
      .fill(0)
      .map(() => generateRandomAgentTraits());
    setGeneratedTraits(newTraits);
    setGeneratedAgents({});
  };

  const handleGenerateAgent = async (traits: AgentTraits, index: number) => {
    setLoadingAgents((prev) => ({ ...prev, [index]: true }));

    try {
      const response = await fetch("/api/create-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to generate agent");
      }

      const data = await response.json();
      setGeneratedAgents((prev) => ({
        ...prev,
        [index]: {
          ...data.agent,
          id: `agent-${index}`,
          faceImage: "",
          traits,
        },
      }));
    } catch (error) {
      console.error("Error generating agent:", error);
    } finally {
      setLoadingAgents((prev) => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div className='container mx-auto py-8 px-4'>
      <h1 className='text-3xl font-bold mb-8'>Agent Trait Generator Test</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div>
          <AgentConfigPanel />

          <div className='mt-6'>
            <button
              onClick={handleGenerateTraits}
              className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              Generate 10 Random Agents
            </button>
          </div>
        </div>

        <div>
          <h2 className='text-xl font-bold mb-4'>Generated Traits</h2>

          {generatedTraits.length === 0 ? (
            <div className='bg-gray-100 p-4 rounded text-gray-600'>
              Configure parameters and click &quot;Generate&quot; to see results
            </div>
          ) : (
            <div className='space-y-4'>
              {generatedTraits.map((traits, index) => (
                <div
                  key={index}
                  className='bg-white border rounded-lg p-4 shadow-sm'
                >
                  <h3 className='font-medium mb-2'>Agent #{index + 1}</h3>
                  <ul className='space-y-1 text-sm'>
                    <li>
                      <span className='font-medium'>Religion:</span>{" "}
                      {traits.religion}
                    </li>
                    <li>
                      <span className='font-medium'>Anger:</span>{" "}
                      {traits.anger.toFixed(3)}
                    </li>
                    <li>
                      <span className='font-medium'>Persuasiveness:</span>{" "}
                      {traits.persuasiveness.toFixed(3)}
                    </li>
                    <li>
                      <span className='font-medium'>Gullibility:</span>{" "}
                      {traits.gullibility.toFixed(3)}
                    </li>
                    <li>
                      <span className='font-medium'>Income:</span>{" "}
                      {traits.income.toFixed(3)}
                    </li>
                  </ul>

                  <div className='mt-4'>
                    <button
                      onClick={() => handleGenerateAgent(traits, index)}
                      disabled={
                        loadingAgents[index] ||
                        generatedAgents[index] !== undefined
                      }
                      className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
                    >
                      {loadingAgents[index]
                        ? "Generating..."
                        : generatedAgents[index]
                        ? "Generated"
                        : "Generate Details"}
                    </button>
                  </div>

                  {generatedAgents[index] && (
                    <div className='mt-4 border-t pt-4'>
                      <h4 className='font-medium mb-2'>Generated Profile</h4>
                      <div className='space-y-2'>
                        <p>
                          <span className='font-medium'>Name:</span>{" "}
                          {generatedAgents[index].name}
                        </p>
                        <div>
                          <p className='font-medium'>Background:</p>
                          <p className='text-sm text-gray-700'>
                            {generatedAgents[index].background}
                          </p>
                        </div>
                        <div>
                          <p className='font-medium'>Memories:</p>
                          <ul className='list-disc pl-5 text-sm text-gray-700'>
                            {generatedAgents[index].memories.map(
                              (memory, memIndex) => (
                                <li key={memIndex}>{memory}</li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
