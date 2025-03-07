// SPDX-FileCopyrightText: 2024 LiveKit, Inc.
//
// SPDX-License-Identifier: Apache-2.0
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAndConnectAgent } from './agents/agent.js';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');
dotenv.config({ path: envPath });

async function main() {
  // Get LiveKit connection details from environment variables
  const url = process.env.LIVEKIT_URL;
  const token = process.env.LIVEKIT_TOKEN;

  if (!url || !token) {
    console.error('Error: LIVEKIT_URL and LIVEKIT_TOKEN environment variables must be set');
    process.exit(1);
  }

  try {
    console.log('Starting voice agent...');
    const { room, session } = await createAndConnectAgent(url, token);
    
    console.log(`Connected to room: ${room.name}`);
    console.log('Voice agent is running. Press Ctrl+C to exit.');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down voice agent...');
      await session.close();
      await room.disconnect();
      console.log('Disconnected from LiveKit room');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting voice agent:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 