import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { createToken } from "./livekit-token";
import { livekitManagement } from "./livekit-management";
import { createWebhookHandler } from "./livekit-webhooks";
import { voiceAgentManager } from "./livekit-agent";

// Create the main app
const app = new Elysia()
  .use(swagger())
  .get("/", ({ path }) => path)
  .post("/hello", "Do you miss me");

// LiveKit token routes
app.group("/livekit", (app) => 
  app
    .get("/token", async ({ set }) => {
      console.log(`[Route] GET /livekit/token - Default token request`);
      set.headers['Content-Type'] = 'text/plain';
      return await createToken();
    })
    .get("/token/:room/:identity", async ({ params, set }) => {
      const { room, identity } = params;
      console.log(`[Route] GET /livekit/token/${room}/${identity} - Custom token request`);
      set.headers['Content-Type'] = 'text/plain';
      return await createToken(identity, room);
    })
);

// Room management routes
app.group("/api/rooms", (app) => 
  app
    .get("/", async () => {
      console.log(`[Route] GET /api/rooms - List all rooms`);
      return await livekitManagement.listRooms();
    })
    .post("/", async ({ body }) => {
      const { name, emptyTimeout, maxParticipants } = body as any;
      console.log(`[Route] POST /api/rooms - Create room: ${name}`);
      return await livekitManagement.createRoom(name, { emptyTimeout, maxParticipants });
    })
    .delete("/:roomName", async ({ params }) => {
      const { roomName } = params;
      console.log(`[Route] DELETE /api/rooms/${roomName}`);
      return await livekitManagement.deleteRoom(roomName);
    })
    .get("/:roomName/participants", async ({ params }) => {
      const { roomName } = params;
      console.log(`[Route] GET /api/rooms/${roomName}/participants`);
      return await livekitManagement.listParticipants(roomName);
    })
);

// Participant management routes
app.group("/api/rooms/:roomName/participants/:identity", (app) => 
  app
    .get("/", async ({ params }) => {
      const { roomName, identity } = params;
      console.log(`[Route] GET /api/rooms/${roomName}/participants/${identity}`);
      return await livekitManagement.getParticipant(roomName, identity);
    })
    .patch("/permissions", async ({ params, body }) => {
      const { roomName, identity } = params;
      const permissions = body as any;
      console.log(`[Route] PATCH /api/rooms/${roomName}/participants/${identity}/permissions`);
      return await livekitManagement.updateParticipantPermissions(roomName, identity, permissions);
    })
    .patch("/metadata", async ({ params, body }) => {
      const { roomName, identity } = params;
      const metadata = body as any;
      console.log(`[Route] PATCH /api/rooms/${roomName}/participants/${identity}/metadata`);
      return await livekitManagement.updateParticipantMetadata(roomName, identity, metadata);
    })
    .delete("/", async ({ params }) => {
      const { roomName, identity } = params;
      console.log(`[Route] DELETE /api/rooms/${roomName}/participants/${identity}`);
      return await livekitManagement.removeParticipant(roomName, identity);
    })
    .patch("/tracks/:trackSid", async ({ params, body }) => {
      const { roomName, identity, trackSid } = params;
      const { muted } = body as any;
      console.log(`[Route] PATCH /api/rooms/${roomName}/participants/${identity}/tracks/${trackSid}`);
      return await livekitManagement.muteParticipantTrack(roomName, identity, trackSid, muted);
    })
);

// Agent routes
app.group("/api/agents", (app) => 
  app
    .post("/create", async ({ body }) => {
      const { roomName, systemPrompt } = body as any;
      console.log(`[Route] POST /api/agents/create - Room: ${roomName}`);
      
      const agent = await voiceAgentManager.createAndStartAgent(roomName, systemPrompt);
      return { success: true, message: "Agent created successfully", roomName };
    })
    .post("/attach", async ({ body }) => {
      const { roomName, systemPrompt } = body as any;
      console.log(`[Route] POST /api/agents/attach - Room: ${roomName}`);
      
      await voiceAgentManager.createAndStartAgent(roomName, systemPrompt);
      return { success: true, message: `Agent attached to room ${roomName}` };
    })
    .get("/list", () => {
      console.log(`[Route] GET /api/agents/list`);
      const agents = voiceAgentManager.listAgents();
      return { success: true, agents };
    })
    .get("/:roomName", ({ params }) => {
      const { roomName } = params;
      console.log(`[Route] GET /api/agents/${roomName}`);
      const agent = voiceAgentManager.getAgent(roomName);
      return { 
        success: true, 
        exists: !!agent,
        roomName 
      };
    })
    .delete("/:roomName", ({ params }) => {
      const { roomName } = params;
      console.log(`[Route] DELETE /api/agents/${roomName}`);
      const removed = voiceAgentManager.removeAgent(roomName);
      return { 
        success: true, 
        removed, 
        roomName 
      };
    })
);

// Add a convenience endpoint for the Expo app
app.post("/api/initialize-room", async ({ body }) => {
  const { roomName = `room-${Date.now()}`, identity = `user-${Date.now()}`, systemPrompt } = body as any;
  console.log(`[Route] POST /api/initialize-room - Room: ${roomName}, User: ${identity}`);
  
  try {
    // 1. Create the room if it doesn't exist
    const room = await livekitManagement.createRoom(roomName);
    
    // 2. Create an agent for the room
    await voiceAgentManager.createAndStartAgent(roomName, systemPrompt);
    
    // 3. Generate a token for the user
    const token = await createToken(identity, roomName);
    
    // Return all the information needed for the client
    return { 
      success: true, 
      room: {
        name: roomName,
        sid: room.sid
      },
      identity,
      token,
      message: `Room initialized with agent`
    };
  } catch (error) {
    console.error(`[Route] Error initializing room:`, error);
    return { 
      success: false, 
      error: `Failed to initialize room: ${error}` 
    };
  }
});

// Add webhook handler
createWebhookHandler(app);

// Start the server
app.listen(3000, () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
});