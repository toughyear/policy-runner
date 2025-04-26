import { create } from "zustand";
import { Agent } from "../types";

export type SimulationStage =
  | "config" // Initial configuration stage
  | "agent-generation" // Generating agents
  | "policy-input" // Policy introduction stage
  | "conversation" // Conversation between agents stage
  | "voting" // Final voting stage
  | "results"; // Results display stage

interface Policy {
  text: string;
}

interface SimulationStore {
  stage: SimulationStage;
  agents: Agent[];
  policy: Policy | null;
  conversationPairs: [string, string][]; // Pairs of agent IDs that have conversed
  conversationResults: {
    [key: string]: {
      agent1Id: string;
      agent2Id: string;
      messages: {
        agentId: string;
        text: string;
      }[];
    };
  };

  // Stage management
  setStage: (stage: SimulationStage) => void;

  // Agent management
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;

  // Policy management
  setPolicy: (policy: Policy) => void;

  // Memory management
  addMemoryToAgent: (agentId: string, memory: string) => void;
  broadcastMemory: (memory: string) => void;

  // Conversation management
  addConversationPair: (agent1Id: string, agent2Id: string) => void;
  setConversationResult: (
    pairId: string,
    result: {
      agent1Id: string;
      agent2Id: string;
      messages: {
        agentId: string;
        text: string;
      }[];
    }
  ) => void;

  // Voting management
  setAgentVote: (agentId: string, vote: boolean) => void;
  getVoteResults: () => { yes: number; no: number; total: number };

  // Reset
  resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  stage: "config",
  agents: [],
  policy: null,
  conversationPairs: [],
  conversationResults: {},

  setStage: (stage) => set({ stage }),

  setAgents: (agents) => set({ agents }),

  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),

  setPolicy: (policy) => set({ policy }),

  addMemoryToAgent: (agentId, memory) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId
          ? { ...agent, memories: [...agent.memories, memory] }
          : agent
      ),
    })),

  broadcastMemory: (memory) =>
    set((state) => ({
      agents: state.agents.map((agent) => ({
        ...agent,
        memories: [...agent.memories, memory],
      })),
    })),

  addConversationPair: (agent1Id, agent2Id) =>
    set((state) => ({
      conversationPairs: [...state.conversationPairs, [agent1Id, agent2Id]],
    })),

  setConversationResult: (pairId, result) =>
    set((state) => ({
      conversationResults: {
        ...state.conversationResults,
        [pairId]: result,
      },
    })),

  setAgentVote: (agentId, vote) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId ? { ...agent, vote } : agent
      ),
    })),

  getVoteResults: () => {
    const agents = get().agents;
    const votes = agents.map((agent) => agent.vote);
    const yes = votes.filter((vote) => vote === true).length;
    const no = votes.filter((vote) => vote === false).length;

    return {
      yes,
      no,
      total: agents.length,
    };
  },

  resetSimulation: () =>
    set({
      stage: "config",
      agents: [],
      policy: null,
      conversationPairs: [],
      conversationResults: {},
    }),
}));
