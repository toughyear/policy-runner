# Technical Plan: Agent-Based Policy Simulation

## System Architecture

### Core Components

1. **Agent System**

   - Agent Manager
   - Memory System
   - Conversation Engine
   - Voting System

2. **UI System**
   - Agent Visualization
   - Policy Display
   - Conversation Interface
   - Voting Results Display

## Data Models

### Agent Model

```typescript
interface Agent {
  id: string;
  name: string;
  faceImage: string;
  background: string;
  traits: AgentTraits;
  memories: string[]; // Simple strings representing memories
  vote?: boolean;
}

interface AgentTraits {
  religion: string; // "Hindu", "Muslim", "Christian", "Sikh", "Jain", "Zoroastrian", "Buddhist", "Atheist", "Other"
  anger: number; // 0-1 scale, normal distribution
  persuasiveness: number; // 0-1 scale, long-tail distribution
  gullibility: number; // 0-1 scale, 80% high gullibility
  income: number; // 0-1 scale, long-tail distribution
}
```

### Policy Model

```typescript
interface Policy {
  id: string;
  title: string;
  description: string;
  details: string;
  impact: {
    economic: number;
    social: number;
    religious: number;
  };
}
```

## Core Functions

### Agent Management

```typescript
class AgentManager {
  createAgents(count: number): Agent[]; // Creates agents based on distribution patterns
  getAgentById(id: string): Agent;
  getAllAgents(): Agent[];
}
```

### Memory System

```typescript
class MemorySystem {
  addMemory(agentId: string, memory: string): void; // Adds a simple string memory
  getMemories(agentId: string): string[];
  broadcastMemory(memory: string, targetAgents: string[]): void; // Broadcasts a memory to multiple agents
}
```

### Conversation Engine

```typescript
class ConversationEngine {
  selectConversationPair(): [Agent, Agent]; // Finds agents who haven't had conversations
  generateConversation(agent1: Agent, agent2: Agent): void; // Runs 3 back-and-forth exchanges
  generateReply(agent: Agent, message: string): string; // Queries LLM for response based on personality
}
```

### Voting System

```typescript
class VotingSystem {
  collectVotes(agents: Agent[]): VoteResult;
  calculateVote(agent: Agent): boolean; // Uses LLM to determine vote
  displayResults(voteResult: VoteResult): void;
}

interface VoteResult {
  yes: number;
  no: number;
  total: number;
}
```

## Simulation Flow

1. **Initialization**

   - Create agent population based on distribution patterns
   - Generate backgrounds via LLM
   - Initialize traits according to specified distributions

2. **Policy Introduction**

   - Introduce policy as a memory string to all agents
   - e.g., "Indian government has declared emergency"

3. **Conversation Phase**

   - Select random conversation pairs (prioritizing agents who haven't conversed)
   - Generate 3 back-and-forth exchanges using LLM
   - Add conversation content as memories to both agents
   - e.g., "Mr. Foo said India needs to do this"

4. **Propaganda Broadcast**

   - Identify persuasive agents
   - Broadcast their messages to all other agents as memories

5. **Voting Phase**
   - Collect votes by querying LLM based on each agent's memories and traits
   - Display results
   - Show impact analysis

## Technical Requirements

### Frontend

- React/TypeScript
- zustand for state management (store for agents, memories, policies, etc. and functions as well)
- use ai-sdk for llm queries
- Visualization components for agents and voting results

## Implementation Considerations

- Each agent's memory is a chronological list of simple strings
- Conversations are stored as memories (e.g., "Alice told you that the policy will hurt the economy")
- LLM queries used for:
  1. Generating agent personas based on trait distributions
  2. Creating conversation responses based on agent personality and memory
  3. Determining voting behavior based on memories and traits
