import { AccessToken } from 'livekit-server-sdk';

export const createToken = async (
    // Identifier to be used for participant.
    // It's available as LocalParticipant.identity with livekit-client SDK
    participantName: string = 'quickstart-username',
    // If this room doesn't exist, it'll be automatically created when the first
    // participant joins
    roomName: string = 'quickstart-room',
    // Token to expire after 10 minutes
    ttl: string = '10m',
) => {

    console.log(`[LiveKit] Creating token for participant: ${participantName} in room: ${roomName} (ttl: ${ttl})`);

    try {
        const at = new AccessToken(
            process.env.LIVEKIT_API_KEY!,
            process.env.LIVEKIT_API_SECRET!,
            {
                identity: participantName,
                ttl,
            }
        );

        at.addGrant({
            roomJoin: true,
            room: roomName
        });

        const token = await at.toJwt();
        console.log(`[LiveKit] Token successfully created for ${participantName} (token length: ${token.length} chars)`);
        return token;
    } catch (error) {
        console.error(`[LiveKit] Error creating token:`, error);
        throw error;
    }
};