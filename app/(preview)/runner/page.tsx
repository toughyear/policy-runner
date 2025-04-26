"use client";

import AgentConfigPanel from "@/components/AgentConfigPanel";
import { useEffect, useState } from "react";
import { useAgentConfigStore } from "../../../store";
import {
  SimulationStage,
  useSimulationStore,
} from "../../../store/simulation-store";
import { Agent } from "../../../types";
import { generateRandomAgentTraits } from "../../../utils/agent-traits";

export default function RunnerPage() {
  const { config } = useAgentConfigStore();
  const {
    stage,
    setStage,
    agents,
    setAgents,
    policy,
    setPolicy,
    broadcastMemory,
    conversationPairs,
    addConversationPair,
    setConversationResult,
    getVoteResults,
    resetSimulation,
  } = useSimulationStore();

  const [agentCount, setAgentCount] = useState(10);
  const [policyText, setPolicyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset state on unmount
  useEffect(() => {
    return () => {
      resetSimulation();
    };
  }, [resetSimulation]);

  const generateAgents = async () => {
    if (agentCount < 4) {
      setError(
        "Please generate at least 4 agents for meaningful conversations"
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Generate agents with random traits
      const agentGenerationPromises = Array(agentCount)
        .fill(0)
        .map(async (_, i) => {
          const traits = generateRandomAgentTraits();

          // Generate background for each agent using API
          const response = await fetch("/api/create-agent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              traits,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to create agent ${i + 1}`);
          }

          const data = await response.json();

          return {
            ...data.agent,
            id: `agent-${i}`,
            faceImage: "",
            traits,
          };
        });

      // Wait for all agent generation requests to complete
      const newAgents = await Promise.all(agentGenerationPromises);

      setAgents(newAgents);
      setStage("policy-input");
    } catch (err) {
      console.error("Error generating agents:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate agents"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePolicySubmit = () => {
    if (!policyText.trim()) {
      setError("Please enter a policy");
      return;
    }

    setPolicy({ text: policyText });
    broadcastMemory(`The government announced a new policy: "${policyText}"`);
    setStage("conversation");
  };

  const runConversations = async () => {
    if (agents.length < 2) {
      setError("Not enough agents to have conversations");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create pairs of agents who will converse
      const agentIds = agents.map((a: Agent) => a.id);
      const pairs: [string, string][] = [];

      // Pair up agents (simple algorithm, could be improved)
      for (let i = 0; i < agentIds.length - 1; i += 2) {
        pairs.push([agentIds[i], agentIds[i + 1]]);
      }

      // If odd number of agents, add one more conversation
      if (agentIds.length % 2 !== 0) {
        pairs.push([agentIds[0], agentIds[agentIds.length - 1]]);
      }

      // Store pairs in state
      pairs.forEach(([agent1Id, agent2Id]) => {
        addConversationPair(agent1Id, agent2Id);
      });

      // Generate conversations for each pair in parallel
      const conversationPromises = pairs.map(async ([agent1Id, agent2Id]) => {
        const agent1 = agents.find((a: Agent) => a.id === agent1Id)!;
        const agent2 = agents.find((a: Agent) => a.id === agent2Id)!;

        // Generate conversation using API
        const response = await fetch("/api/generate-conversation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent1,
            agent2,
            policy: policy?.text || "",
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to generate conversation between ${agent1.name} and ${agent2.name}`
          );
        }

        const data = await response.json();

        return {
          pairId: `${agent1Id}-${agent2Id}`,
          agent1Id,
          agent2Id,
          conversation: data.conversation,
        };
      });

      // Wait for all conversation generation to complete
      const conversationResults = await Promise.all(conversationPromises);

      // Process all conversations
      for (const result of conversationResults) {
        // Store conversation in state
        setConversationResult(result.pairId, result.conversation);

        // Add memories to both agents
        for (const message of result.conversation.messages) {
          const speakerId = message.agentId;
          const speaker = agents.find((a: Agent) => a.id === speakerId);

          if (speaker) {
            broadcastMemory(`${speaker.name} said: "${message.text}"`);
          } else {
            console.warn(
              `Agent with ID ${speakerId} not found, skipping memory broadcast`
            );
          }
        }
      }

      setStage("voting");
    } catch (err) {
      console.error("Error during conversations:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate conversations"
      );
    } finally {
      setLoading(false);
    }
  };

  const collectVotes = async () => {
    setLoading(true);
    setError("");

    try {
      // Collect votes from each agent in parallel
      const votePromises = agents.map(async (agent) => {
        // Use API to determine vote
        const response = await fetch("/api/calculate-vote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent,
            policy: policy?.text || "",
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to calculate vote for ${agent.name}`);
        }

        const data = await response.json();

        return {
          agentId: agent.id,
          vote: data.vote,
        };
      });

      // Wait for all vote calculations to complete
      const voteResults = await Promise.all(votePromises);

      // Update all agent votes at once
      voteResults.forEach(({ agentId, vote }) => {
        useSimulationStore.getState().setAgentVote(agentId, vote);
      });

      setStage("results");
    } catch (err) {
      console.error("Error collecting votes:", err);
      setError(err instanceof Error ? err.message : "Failed to generate votes");
    } finally {
      setLoading(false);
    }
  };

  const renderStageContent = () => {
    switch (stage) {
      case "config":
        return (
          <div className='space-y-6'>
            <h2 className='text-2xl font-semibold'>Configure Simulation</h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Number of Agents
                </label>
                <input
                  type='number'
                  min={4}
                  max={50}
                  value={agentCount}
                  onChange={(e) =>
                    setAgentCount(parseInt(e.target.value) || 10)
                  }
                  className='w-full px-4 py-2 border rounded-lg'
                />
              </div>
              <AgentConfigPanel />
              <button
                onClick={generateAgents}
                disabled={loading}
                className='w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400'
              >
                {loading ? "Generating Agents..." : "Generate Agents"}
              </button>
            </div>
          </div>
        );

      case "policy-input":
        return (
          <div className='space-y-6'>
            <h2 className='text-2xl font-semibold'>Introduce Policy</h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Enter Policy Text
                </label>
                <textarea
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  placeholder='e.g., The Indian government has declared emergency...'
                  className='w-full px-4 py-2 border rounded-lg min-h-[120px]'
                />
              </div>
              <button
                onClick={handlePolicySubmit}
                disabled={!policyText.trim() || loading}
                className='w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400'
              >
                Broadcast Policy to Agents
              </button>
            </div>
          </div>
        );

      case "conversation":
        return (
          <div className='space-y-6'>
            <h2 className='text-2xl font-semibold'>Run Conversations</h2>
            <div className='space-y-4'>
              <p className='text-gray-700'>
                In this stage, agents will converse with each other about the
                policy, influencing each other&apos;s opinions.
              </p>
              <button
                onClick={runConversations}
                disabled={loading}
                className='w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400'
              >
                {loading ? "Running Conversations..." : "Run Conversations"}
              </button>
            </div>
          </div>
        );

      case "voting":
        return (
          <div className='space-y-6'>
            <h2 className='text-2xl font-semibold'>Collect Votes</h2>
            <div className='space-y-4'>
              <p className='text-gray-700'>
                Agents will now vote on whether they support or oppose the
                policy based on their traits and conversations.
              </p>
              <button
                onClick={collectVotes}
                disabled={loading}
                className='w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400'
              >
                {loading ? "Collecting Votes..." : "Collect Votes"}
              </button>
            </div>
          </div>
        );

      case "results":
        const results = getVoteResults();
        return (
          <div className='space-y-6'>
            <h2 className='text-2xl font-semibold'>Voting Results</h2>

            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-xl font-medium mb-4'>
                Final Vote on Policy:
              </h3>
              <p className='text-gray-700 mb-6 italic'>
                &quot;{policy?.text}&quot;
              </p>

              <div className='grid grid-cols-2 gap-4 mb-6'>
                <div className='bg-green-100 p-4 rounded-lg text-center'>
                  <div className='text-3xl font-bold text-green-700'>
                    {results.yes}
                  </div>
                  <div className='text-sm text-green-600'>Support</div>
                  <div className='text-lg font-medium mt-1'>
                    {Math.round((results.yes / results.total) * 100)}%
                  </div>
                </div>

                <div className='bg-red-100 p-4 rounded-lg text-center'>
                  <div className='text-3xl font-bold text-red-700'>
                    {results.no}
                  </div>
                  <div className='text-sm text-red-600'>Oppose</div>
                  <div className='text-lg font-medium mt-1'>
                    {Math.round((results.no / results.total) * 100)}%
                  </div>
                </div>
              </div>

              <button
                onClick={() => resetSimulation()}
                className='w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors'
              >
                Start New Simulation
              </button>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-xl font-medium mb-4'>Agent Breakdown</h3>
              <div className='space-y-4'>
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className='flex items-center space-x-4 border-b pb-4'
                  >
                    <div className='flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center'>
                      {agent.name.charAt(0)}
                    </div>
                    <div className='flex-grow'>
                      <h4 className='font-medium'>{agent.name}</h4>
                      <p className='text-sm text-gray-500'>
                        {agent.traits.religion}, Income:{" "}
                        {Math.round(agent.traits.income * 100)}/100
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full ${
                        agent.vote
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {agent.vote ? "Support" : "Oppose"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unknown stage</div>;
    }
  };

  const renderProgressBar = () => {
    const stages: SimulationStage[] = [
      "config",
      "policy-input",
      "conversation",
      "voting",
      "results",
    ];
    const currentIndex = stages.indexOf(stage);

    return (
      <div className='mb-8'>
        <div className='flex justify-between mb-2'>
          {stages.map((s, i) => (
            <div
              key={s}
              className={`text-xs font-medium ${
                i <= currentIndex ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {s === "config"
                ? "Setup"
                : s === "policy-input"
                ? "Policy"
                : s === "conversation"
                ? "Conversations"
                : s === "voting"
                ? "Voting"
                : "Results"}
            </div>
          ))}
        </div>
        <div className='h-2 bg-gray-200 rounded-full'>
          <div
            className='h-2 bg-blue-600 rounded-full'
            style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className='container mx-auto py-8 px-4 max-w-3xl'>
      <h1 className='text-3xl font-bold mb-6'>Policy Simulation Runner</h1>

      {renderProgressBar()}

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
          {error}
        </div>
      )}

      <div className='bg-white rounded-lg shadow-lg p-6'>
        {renderStageContent()}
      </div>
    </div>
  );
}
