import { NextApiRequest, NextApiResponse } from "next";
import { generateRandomAlphanumeric } from "@/lib/util";

import { AccessToken } from "livekit-server-sdk";
import type { AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { TokenResult } from "../../lib/types";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

const createToken = (userInfo: AccessTokenOptions, grant: VideoGrant) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.addGrant(grant);
  return at.toJwt();
};

export default async function handleToken(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Log environment variables status (not the actual values for security)
    console.log(`[Token API] LIVEKIT_API_KEY present: ${!!apiKey}`);
    console.log(`[Token API] LIVEKIT_API_SECRET present: ${!!apiSecret}`);
    
    if (!apiKey || !apiSecret) {
      console.error('[Token API] Missing LiveKit credentials in environment variables');
      res.statusMessage = "Environment variables aren't set up correctly";
      res.status(500).end();
      return;
    }

    // Generate room name and identity
    const roomName = `room-${generateRandomAlphanumeric(4)}-${generateRandomAlphanumeric(4)}`;
    const identity = `identity-${generateRandomAlphanumeric(4)}`;
    console.log(`[Token API] Generated room: ${roomName} and identity: ${identity}`);

    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    };

    const token = await createToken({ identity }, grant);
    console.log(`[Token API] Successfully generated token of length: ${token.length}`);
    
    const result: TokenResult = {
      identity,
      accessToken: token,
      room: roomName, // Include room name in the response for convenience
    };

    res.status(200).json(result);
  } catch (e) {
    console.error('[Token API] Error generating token:', e);
    res.statusMessage = (e as Error).message;
    res.status(500).end();
  }
}