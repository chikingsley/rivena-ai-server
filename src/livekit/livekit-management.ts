import { RoomServiceClient } from 'livekit-server-sdk';

export class LiveKitManagement {
  private roomService: RoomServiceClient;

  constructor() {
    const livekitHost = process.env.LIVEKIT_URL!;
    this.roomService = new RoomServiceClient(
      livekitHost,
      process.env.VITE_LIVEKIT_API_KEY!,
      process.env.VITE_LIVEKIT_API_SECRET!,
    );
    console.log(`[LiveKitManagement] Initialized with host: ${livekitHost}`);
  }

  async createRoom(
    name: string,
    options: {
      emptyTimeout?: number; // in seconds
      maxParticipants?: number;
    } = {},
  ) {
    console.log(`[LiveKitManagement] Creating room: ${name}`);
    const opts = {
      name,
      emptyTimeout: options.emptyTimeout || 10 * 60, // 10 minutes default
      maxParticipants: options.maxParticipants || 20,
    };

    try {
      const room = await this.roomService.createRoom(opts);
      console.log(`[LiveKitManagement] Room created: ${room.name} (sid: ${room.sid})`);
      return room;
    } catch (error) {
      console.error('[LiveKitManagement] Error creating room:', error);
      throw error;
    }
  }

  async listRooms() {
    console.log('[LiveKitManagement] Listing all rooms');
    try {
      const rooms = await this.roomService.listRooms();
      console.log(`[LiveKitManagement] Found ${rooms.length} rooms`);
      return rooms;
    } catch (error) {
      console.error('[LiveKitManagement] Error listing rooms:', error);
      throw error;
    }
  }

  async deleteRoom(roomName: string) {
    console.log(`[LiveKitManagement] Deleting room: ${roomName}`);
    try {
      await this.roomService.deleteRoom(roomName);
      console.log(`[LiveKitManagement] Room deleted: ${roomName}`);
      return true;
    } catch (error) {
      console.error('[LiveKitManagement] Error deleting room:', error);
      throw error;
    }
  }

  async listParticipants(roomName: string) {
    console.log(`[LiveKitManagement] Listing participants in room: ${roomName}`);
    try {
      const participants = await this.roomService.listParticipants(roomName);
      console.log(
        `[LiveKitManagement] Found ${participants.length} participants in room: ${roomName}`,
      );
      return participants;
    } catch (error) {
      console.error('[LiveKitManagement] Error listing participants:', error);
      throw error;
    }
  }

  async getParticipant(roomName: string, identity: string) {
    console.log(`[LiveKitManagement] Getting participant ${identity} in room: ${roomName}`);
    try {
      const participant = await this.roomService.getParticipant(roomName, identity);
      console.log(`[LiveKitManagement] Found participant ${identity} in room: ${roomName}`);
      return participant;
    } catch (error) {
      console.error('[LiveKitManagement] Error getting participant:', error);
      throw error;
    }
  }

  async updateParticipantPermissions(
    roomName: string,
    identity: string,
    permissions: {
      canPublish?: boolean;
      canSubscribe?: boolean;
      canPublishData?: boolean;
    },
  ) {
    console.log(`[LiveKitManagement] Updating permissions for ${identity} in room: ${roomName}`);
    try {
      await this.roomService.updateParticipant(roomName, identity, undefined, permissions);
      console.log(`[LiveKitManagement] Updated permissions for ${identity} in room: ${roomName}`);
      return true;
    } catch (error) {
      console.error('[LiveKitManagement] Error updating participant permissions:', error);
      throw error;
    }
  }

  async updateParticipantMetadata(
    roomName: string,
    identity: string,
    metadata: Record<string, unknown>,
  ) {
    console.log(`[LiveKitManagement] Updating metadata for ${identity} in room: ${roomName}`);
    try {
      const data = JSON.stringify(metadata);
      await this.roomService.updateParticipant(roomName, identity, data);
      console.log(`[LiveKitManagement] Updated metadata for ${identity} in room: ${roomName}`);
      return true;
    } catch (error) {
      console.error('[LiveKitManagement] Error updating participant metadata:', error);
      throw error;
    }
  }

  async removeParticipant(roomName: string, identity: string) {
    console.log(`[LiveKitManagement] Removing participant ${identity} from room: ${roomName}`);
    try {
      await this.roomService.removeParticipant(roomName, identity);
      console.log(`[LiveKitManagement] Removed participant ${identity} from room: ${roomName}`);
      return true;
    } catch (error) {
      console.error('[LiveKitManagement] Error removing participant:', error);
      throw error;
    }
  }

  async muteParticipantTrack(roomName: string, identity: string, trackSid: string, muted: boolean) {
    console.log(
      `[LiveKitManagement] ${muted ? 'Muting' : 'Unmuting'} track ${trackSid} for ${identity} in room: ${roomName}`,
    );
    try {
      await this.roomService.mutePublishedTrack(roomName, identity, trackSid, muted);
      console.log(
        `[LiveKitManagement] ${muted ? 'Muted' : 'Unmuted'} track ${trackSid} for ${identity} in room: ${roomName}`,
      );
      return true;
    } catch (error) {
      console.error('[LiveKitManagement] Error muting/unmuting track:', error);
      throw error;
    }
  }
}

// Export a singleton instance for easy import
export const livekitManagement = new LiveKitManagement();
