# LiveKit Voice Agent with Deepgram

This project implements a voice agent using LiveKit for real-time audio streaming and Deepgram for speech-to-text transcription. The agent listens to audio from participants in a LiveKit room, transcribes it using Deepgram, and generates responses using OpenAI.

## Features

- Real-time audio transcription using Deepgram
- Natural language responses using OpenAI
- Integration with LiveKit for real-time audio streaming
- Automatic participant detection and session management

## Prerequisites

- Node.js 18+ or Bun
- LiveKit account and server
- Deepgram API key
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Create a `.env.local` file in the project root with the following variables:
   ```
   DEEPGRAM_API_KEY=your_deepgram_api_key
   OPENAI_API_KEY=your_openai_api_key
   LIVEKIT_URL=your_livekit_server_url
   LIVEKIT_TOKEN=your_livekit_token
   ```

## Running the Agent

Build the project:
```bash
bun run build
```

Start the agent:
```bash
bun run start
```

The agent will connect to the specified LiveKit room and start listening for participants. When a participant joins, the agent will automatically start a session with them.

## Development

Start the development server with hot reloading:
```bash
bun run dev
```

## How It Works

1. The agent connects to a LiveKit room using the provided URL and token
2. When a participant joins, the agent subscribes to their audio track
3. The audio is streamed to Deepgram for real-time transcription
4. When speech is detected and transcribed, the agent sends the text to OpenAI
5. The response from OpenAI is sent back to the participant as a data message

## Customization

You can customize the agent's behavior by modifying the following:

- System prompt in `src/agents/agent.ts` to change the agent's personality
- OpenAI model and parameters in the `generateResponse` method
- Deepgram transcription options in the `startDeepgramTranscription` method

## Troubleshooting

If you encounter issues:

1. Check that your API keys are correct
2. Ensure your LiveKit token has the necessary permissions
3. Check the console logs for detailed error messages

## License

Apache-2.0
