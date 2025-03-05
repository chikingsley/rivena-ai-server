import { Elysia } from 'elysia';
import { WebhookEvent, WebhookReceiver } from 'livekit-server-sdk';

export const createWebhookHandler = (app: Elysia) => {
  const webhookApiKey = process.env.LIVEKIT_API_KEY!;
  const webhookApiSecret = process.env.LIVEKIT_API_SECRET!;
  const receiver = new WebhookReceiver(webhookApiKey, webhookApiSecret);

  console.log('[LiveKitWebhooks] Initialized webhook receiver');

  // Setup webhook endpoint
  app.post('/webhooks/livekit', async ({ body, request, set }) => {
    console.log('[LiveKitWebhooks] Received webhook event');

    try {
      // Get the raw body and Authorization header
      const authorization = request.headers.get('Authorization');

      if (!authorization) {
        console.error('[LiveKitWebhooks] Missing Authorization header');
        set.status = 401;
        return { error: 'Unauthorized' };
      }

      // Parse the webhook event
      const event = await receiver.receive(body as Buffer, authorization);
      console.log(`[LiveKitWebhooks] Event type: ${event.event}`);

      // Handle different event types
      switch (event.event) {
      case 'room_started':
        handleRoomStarted(event);
        break;
      case 'room_finished':
        handleRoomFinished(event);
        break;
      case 'participant_joined':
        handleParticipantJoined(event);
        break;
      case 'participant_left':
        handleParticipantLeft(event);
        break;
      case 'track_published':
        handleTrackPublished(event);
        break;
      case 'track_unpublished':
        handleTrackUnpublished(event);
        break;
        // Add handlers for egress and ingress events as needed
      default:
        console.log(`[LiveKitWebhooks] Unhandled event type: ${event.event}`);
      }

      set.status = 200;
      return { success: true };
    } catch (error) {
      console.error('[LiveKitWebhooks] Error processing webhook:', error);
      set.status = 400;
      return { error: 'Invalid webhook payload' };
    }
  });

  return app;
};

// Event handlers
function handleRoomStarted(event: WebhookEvent) {
  console.log(`[LiveKitWebhooks] Room started: ${event.room.name}`);
  // Add your custom logic here
}

function handleRoomFinished(event: WebhookEvent) {
  console.log(`[LiveKitWebhooks] Room finished: ${event.room.name}`);
  // Add your custom logic here
}

function handleParticipantJoined(event: WebhookEvent) {
  console.log(
    `[LiveKitWebhooks] Participant joined: ${event.participant.identity} in room ${event.room.name}`,
  );
  // Add your custom logic here
}

function handleParticipantLeft(event: WebhookEvent) {
  console.log(
    `[LiveKitWebhooks] Participant left: ${event.participant.identity} from room ${event.room.name}`,
  );
  // Add your custom logic here
}

function handleTrackPublished(event: WebhookEvent) {
  console.log(
    `[LiveKitWebhooks] Track published: ${event.track.sid} by ${event.participant.identity} in room ${event.room.name}`,
  );
  // Add your custom logic here
}

function handleTrackUnpublished(event: WebhookEvent) {
  console.log(
    `[LiveKitWebhooks] Track unpublished: ${event.track.sid} by ${event.participant.identity} in room ${event.room.name}`,
  );
  // Add your custom logic here
}
