import { RoomServiceClient } from 'livekit-server-sdk';

// Class to manage Voice Pipeline Agents registry
export class VoiceAgentManager {
  private roomService: RoomServiceClient;
  // Store only room names with their system prompts instead of agent instances
  private agentRegistry: Map<string, { systemPrompt: string; createdAt: Date }> = new Map();

  constructor() {
    // Initialize room service using the same config as LiveKitManagement
    const livekitHost = process.env.LIVEKIT_URL!;
    this.roomService = new RoomServiceClient(
      livekitHost,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
    );
    console.log(`[VoiceAgentManager] Initialized with host: ${livekitHost}`);
  }

  /**
   * Register a room for agent creation
   * The actual agent creation is handled by the agent.ts worker process
   * @param roomName The name of the room to connect the agent to
   * @param systemPrompt The system prompt for the agent's initial context
   */
  async createAndStartAgent(
    roomName: string,
    systemPrompt: string = 'You are a helpful voice assistant created by LiveKit.',
  ) {
    console.log(
      `[VoiceAgentManager] Registering agent for room: ${roomName} with prompt: ${systemPrompt.substring(0, 50)}...`,
    );

    try {
      // The actual agent creation is handled by the LiveKit worker system via agent.ts
      // Here we just register that an agent should be created for this room

      // Store the agent registration in our registry
      this.agentRegistry.set(roomName, {
        systemPrompt,
        createdAt: new Date(),
      });

      console.log(`[VoiceAgentManager] Registered agent for room: ${roomName}`);
      console.log(
        '[VoiceAgentManager] Note: The actual agent is being handled by the LiveKit worker system',
      );

      // For API compatibility, return a simple object
      return { roomName, registered: true };
    } catch (error) {
      console.error('[VoiceAgentManager] Error registering agent:', error);
      throw error;
    }
  }

  /**
   * Check if a room has a registered agent
   * @param roomName Room name to find the agent for
   */
  getAgent(roomName: string) {
    return this.agentRegistry.get(roomName);
  }

  /**
   * List all rooms with registered agents
   */
  listAgents() {
    return Array.from(this.agentRegistry.keys());
  }

  /**
   * Get detailed information about all registered agents
   */
  getAgentDetails() {
    const details: Record<string, any> = {};
    this.agentRegistry.forEach((value, key) => {
      details[key] = {
        systemPrompt: value.systemPrompt,
        createdAt: value.createdAt,
      };
    });
    return details;
  }

  /**
   * Remove an agent registration for a room
   * @param roomName Room name to remove the agent from
   */
  removeAgent(roomName: string) {
    if (this.agentRegistry.has(roomName)) {
      this.agentRegistry.delete(roomName);
      console.log(`[VoiceAgentManager] Removed agent registration for room: ${roomName}`);
      console.log(
        '[VoiceAgentManager] Note: The actual agent may still be running in the LiveKit worker system',
      );
      return true;
    }
    return false;
  }
}

// Export a singleton instance for easy import
export const voiceAgentManager = new VoiceAgentManager();
