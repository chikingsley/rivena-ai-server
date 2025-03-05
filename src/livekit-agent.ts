import {
  llm,
  pipeline,
} from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';
import * as livekitPlugin from '@livekit/agents-plugin-livekit';
import { RoomServiceClient } from 'livekit-server-sdk';

// Class to manage Voice Pipeline Agents
export class VoiceAgentManager {
  private roomService: RoomServiceClient;
  private activeAgents: Map<string, pipeline.VoicePipelineAgent> = new Map();
  
  constructor() {
    // Initialize room service using the same config as LiveKitManagement
    const livekitHost = process.env.LIVEKIT_HOST!;
    this.roomService = new RoomServiceClient(
      livekitHost, 
      process.env.LIVEKIT_API_KEY!, 
      process.env.LIVEKIT_API_SECRET!
    );
    console.log(`[VoiceAgentManager] Initialized with host: ${livekitHost}`);
  }
  
  /**
   * Create and start a voice agent for a specific room
   * @param roomName The name of the room to connect the agent to
   * @param systemPrompt The system prompt for the agent's initial context
   */
  async createAndStartAgent(roomName: string, systemPrompt: string = '<your prompt>') {
    console.log(`[VoiceAgentManager] Creating agent for room: ${roomName} with prompt: ${systemPrompt.substring(0, 50)}...`);
    
    // Create an initial context with the system prompt
    const initialContext = new llm.ChatContext().append({
      role: llm.ChatRole.SYSTEM,
      text: systemPrompt
    });
    
    try {
      // Create the agent with all necessary components
      const agent = new pipeline.VoicePipelineAgent(
        await silero.VAD.load(),
        new deepgram.STT({ model: 'nova-2-general' }),
        new openai.LLM(),
        new openai.TTS(),
        {
          chatCtx: initialContext,
          allowInterruptions: true,
          interruptSpeechDuration: 500,
          interruptMinWords: 0,
          minEndpointingDelay: 500,
        },
      );

      // For development mode, we'll log that we created the agent, but 
      // note that we can't fully initialize it without the LiveKit worker system
      console.log(`[VoiceAgentManager] Agent created for room: ${roomName}`);
      
      // Store the agent reference
      this.activeAgents.set(roomName, agent);
      
      // In a real implementation, we would use livekitPlugin to connect to the room
      // This would require setting up the agent worker system properly
      // For now, we return the agent for testing purposes
      return agent;
    } catch (error) {
      console.error(`[VoiceAgentManager] Error creating agent:`, error);
      throw error;
    }
  }
  
  /**
   * Get an agent by room name
   * @param roomName Room name to find the agent for
   */
  getAgent(roomName: string) {
    return this.activeAgents.get(roomName);
  }
  
  /**
   * List all active agents
   */
  listAgents() {
    return Array.from(this.activeAgents.keys());
  }
  
  /**
   * Remove an agent from a room
   * @param roomName Room name to remove the agent from
   */
  removeAgent(roomName: string) {
    const agent = this.activeAgents.get(roomName);
    if (agent) {
      // In a real implementation, we would disconnect the agent from the room
      this.activeAgents.delete(roomName);
      console.log(`[VoiceAgentManager] Removed agent from room: ${roomName}`);
      return true;
    }
    return false;
  }
}

// Export a singleton instance for easy import
export const voiceAgentManager = new VoiceAgentManager();