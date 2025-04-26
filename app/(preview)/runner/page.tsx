/* eslint-disable @next/next/no-img-element */
"use client";

import AgentConfigPanel from "@/components/AgentConfigPanel";
import { useEffect, useRef, useState } from "react";
import { useAgentConfigStore } from "../../../store";
import {
  SimulationStage,
  useSimulationStore,
} from "../../../store/simulation-store";
import { Agent } from "../../../types";
import { generateRandomAgentTraits } from "../../../utils/agent-traits";

interface AgentAvatarProps {
  agent:
    | Agent
    | {
        id: string;
        name?: string;
        traits?: any;
        vote?: boolean;
        memories?: string[];
        voteReason?: string;
      };
  seed?: string;
  isMoving: boolean;
  onClick: () => void;
}

function AgentAvatar({ agent, seed, isMoving, onClick }: AgentAvatarProps) {
  const [position, setPosition] = useState({
    x: Math.random() * 90,
    y: Math.random() * 90,
  });
  const [showDetails, setShowDetails] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const directionRef = useRef({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
  });
  const directionTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize or change direction periodically
  useEffect(() => {
    if (!isMoving) return;

    // Change direction every 3-8 seconds
    const changeDirection = () => {
      directionRef.current = {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
      };

      // Normalize to avoid very slow movement
      const magnitude = Math.sqrt(
        directionRef.current.x * directionRef.current.x +
          directionRef.current.y * directionRef.current.y
      );
      if (magnitude < 0.5) {
        directionRef.current.x *= 1.5;
        directionRef.current.y *= 1.5;
      }

      // Schedule next direction change
      directionTimerRef.current = setTimeout(
        changeDirection,
        3000 + Math.random() * 5000
      );
    };

    // Initialize direction
    changeDirection();

    return () => {
      if (directionTimerRef.current) {
        clearTimeout(directionTimerRef.current);
      }
    };
  }, [isMoving]);

  // Movement in the current direction
  useEffect(() => {
    if (isMoving) {
      intervalRef.current = setInterval(() => {
        setPosition((prev) => {
          // Move in current direction
          const speed = 0.5; // speed factor
          const newX = prev.x + directionRef.current.x * speed;
          const newY = prev.y + directionRef.current.y * speed;

          // Validate and bounce off edges
          let nextX = newX;
          let nextY = newY;

          // Set boundaries considering avatar size (12px = ~1.5%)
          const minBound = 0;
          const maxBoundX = 93; // 95 - ~2% for avatar width
          const maxBoundY = 93; // 95 - ~2% for avatar height

          // Bounce off edges with boundary enforcement
          if (newX < minBound || newX > maxBoundX) {
            directionRef.current.x *= -1; // Reverse direction
            nextX = newX < minBound ? minBound : maxBoundX; // Place exactly at boundary
          }

          if (newY < minBound || newY > maxBoundY) {
            directionRef.current.y *= -1; // Reverse direction
            nextY = newY < minBound ? minBound : maxBoundY; // Place exactly at boundary
          }

          return {
            x: Math.max(minBound, Math.min(maxBoundX, nextX)),
            y: Math.max(minBound, Math.min(maxBoundY, nextY)),
          };
        });
      }, 50); // smoother movement with shorter interval
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMoving]);

  return (
    <div
      ref={avatarRef}
      className={`absolute transition-all duration-300 cursor-pointer`}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
      onClick={onClick}
    >
      <img
        src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${
          seed || agent?.name || Math.random()
        }`}
        alt={agent?.name || "Agent avatar"}
        className='w-12 h-12 rounded-full border-2 border-white shadow-md'
      />

      {showDetails && agent && (
        <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white p-2 rounded shadow-lg z-10 max-h-72 overflow-y-auto'>
          <h4 className='font-bold text-sm'>{agent.name}</h4>
          <div className='text-xs space-y-1 mb-2'>
            <p>Religion: {agent.traits?.religion}</p>
            <p>
              Income:{" "}
              {agent.traits?.income
                ? Math.round(agent.traits.income * 100)
                : "N/A"}
              /100
            </p>
            {agent.vote !== undefined && (
              <div className='mt-1'>
                <p
                  className={`font-medium ${
                    agent.vote ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {agent.vote ? "Supports" : "Opposes"} policy
                </p>
                {agent.voteReason && (
                  <p className='text-xs mt-1 text-gray-700 max-h-24 overflow-y-auto'>
                    <span className='font-medium'>Why:</span> {agent.voteReason}
                  </p>
                )}
              </div>
            )}
          </div>

          {agent.memories && agent.memories.length > 0 && (
            <div className='mt-2 pt-2 border-t border-gray-200'>
              <p className='font-medium text-xs mb-1'>Recent Memories:</p>
              <div className='text-xs space-y-1 max-h-40 overflow-y-auto'>
                {agent.memories.slice(-5).map((memory: string, idx: number) => (
                  <p key={idx} className='text-gray-600'>
                    {memory}
                  </p>
                ))}
                {agent.memories.length > 5 && (
                  <p className='text-gray-400 italic text-xs'>
                    + {agent.memories.length - 5} more...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface AgentAvatarsContainerProps {
  agents: Agent[];
  agentCount: number;
  stage: SimulationStage;
}

function AgentAvatarsContainer({
  agents,
  agentCount,
  stage,
}: AgentAvatarsContainerProps) {
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Generate placeholder agents for config stage
  const placeholderAgents = Array(agentCount)
    .fill(0)
    .map((_, i) => ({
      id: `placeholder-${i}`,
      name: `Agent ${i + 1}`,
    }));
  const displayAgents = agents.length > 0 ? agents : placeholderAgents;

  return (
    <div className='mt-8 bg-gray-100 rounded-lg p-4 relative h-[300px] overflow-hidden border border-gray-200'>
      <div className='absolute top-2 left-2 z-10 flex space-x-2'>
        <button
          className={`px-3 py-1 text-xs rounded-full ${
            isPaused ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? "Resume" : "Pause"} Animation
        </button>
        {stage !== "config" && (
          <div className='px-3 py-1 text-xs bg-blue-100 rounded-full'>
            {agents.length} Agents
          </div>
        )}
      </div>

      {displayAgents.map((agent) => (
        <AgentAvatar
          key={agent.id}
          agent={agent}
          seed={agent.name || agent.id}
          isMoving={!isPaused && hoveredAgentId !== agent.id}
          onClick={() =>
            setHoveredAgentId(agent.id === hoveredAgentId ? null : agent.id)
          }
        />
      ))}

      {stage === "config" && (
        <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-10'>
          <p className='text-lg font-medium text-gray-600'>
            Configure and generate {agentCount} agents
          </p>
        </div>
      )}
    </div>
  );
}

function ConversationLogViewer() {
  const { conversationLogs } = useSimulationStore();
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [conversationLogs]);

  return (
    <div className='mt-4 border rounded-lg bg-gray-50 p-4'>
      <h3 className='text-lg font-medium mb-2'>Conversation Logs</h3>
      <div
        ref={logContainerRef}
        className='bg-white border rounded h-80 overflow-y-auto p-3 font-mono text-sm'
      >
        {conversationLogs.length === 0 ? (
          <div className='text-gray-500 text-center py-4'>
            Conversations will appear here once generated...
          </div>
        ) : (
          conversationLogs.map((log, index) => (
            <div
              key={index}
              className={`py-1 ${
                log.startsWith("---") ? "font-bold mt-2 text-blue-600" : ""
              }`}
            >
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

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

      // Clear existing conversation logs
      useSimulationStore.setState({ conversationLogs: [] });

      // Process pairs sequentially to see logs in order
      for (const [agent1Id, agent2Id] of pairs) {
        const agent1 = agents.find((a: Agent) => a.id === agent1Id)!;
        const agent2 = agents.find((a: Agent) => a.id === agent2Id)!;

        // Add header for this conversation pair
        const logHeader = `--- Conversation between ${agent1.name} and ${agent2.name} ---`;
        useSimulationStore.getState().addConversationLog(logHeader);

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

        // Add each message to the logs as it comes in
        for (const message of data.conversation.messages) {
          useSimulationStore.getState().addConversationLog(message);
        }

        // Store conversation in state
        setConversationResult(`${agent1Id}-${agent2Id}`, data.conversation);

        // Add all conversation messages to both agents' memories
        for (const message of data.conversation.messages) {
          // Add memory to both agents involved in the conversation
          useSimulationStore.getState().addMemoryToAgent(agent1Id, message);
          useSimulationStore.getState().addMemoryToAgent(agent2Id, message);
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
        console.log("Vote data for", agent.name, data); // Log the response to check structure

        return {
          agentId: agent.id,
          vote: data.vote,
          reason: data.reasoning || "No reason provided",
        };
      });

      // Wait for all vote calculations to complete
      const voteResults = await Promise.all(votePromises);

      // Update all agent votes at once
      voteResults.forEach(({ agentId, vote, reason }) => {
        useSimulationStore.getState().setAgentVote(agentId, vote, reason);
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

            {/* Show conversation logs in this stage */}
            <ConversationLogViewer />
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
                  <div key={agent.id} className='flex flex-col border-b pb-4'>
                    <div className='flex items-center space-x-4'>
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
                    {agent.voteReason && (
                      <div className='mt-2 ml-16 text-sm italic text-gray-600 max-h-20 overflow-y-auto pr-2'>
                        <span className='font-medium'>Reason:</span>{" "}
                        {agent.voteReason}
                      </div>
                    )}
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

      {/* Agent Avatars Visualization */}
      <AgentAvatarsContainer
        agents={agents}
        agentCount={agentCount}
        stage={stage}
      />
    </div>
  );
}
