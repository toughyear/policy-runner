export interface Agent {
  id: string;
  name: string;
  faceImage: string;
  background: string;
  traits: AgentTraits;
  memories: string[]; // Simple strings representing memories
  vote?: boolean;
  voteReason?: string;
}

export interface AgentTraits {
  religion: string; // "Hindu", "Muslim", "Christian", "Sikh", "Jain", "Zoroastrian", "Buddhist", "Atheist", "Other"
  anger: number; // 0-1 scale, normal distribution
  persuasiveness: number; // 0-1 scale, long-tail distribution
  gullibility: number; // 0-1 scale, 80% high gullibility
  income: number; // 0-1 scale, long-tail distribution
}

export interface VoteResult {
  yes: number;
  no: number;
  total: number;
}
