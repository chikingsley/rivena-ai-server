# Rivena AI Voice Assistant

A voice assistant application built with Elysia (server) and React + Vite (client). This project enables real-time voice interactions using LiveKit for audio streaming and WebRTC capabilities.

## Project Structure

```
src/
  server/     # Elysia server code
  client/     # React client code
    api/      # Eden client + API types
    components/
    pages/
    styles/
  shared/     # Shared types/utilities
```

## Prerequisites

- Node.js 18+ or 20+
- LiveKit server credentials (API Key and Secret)
- A modern web browser with WebRTC support

## Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/rivena-ai-server.git
cd rivena-ai-server
```

2. Create a `.env` file in the root directory:

```env
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=your_livekit_url
```

3. Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
# Start the Elysia server
npm run dev:server

# In a separate terminal, start the React client
npm run dev:client
```

The server will run on `http://localhost:3000` and the client on `http://localhost:5173`.

## Testing Endpoints

### Voice Assistant Endpoints

1. Room Creation:

```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "test-room"}'
```

2. Participant Management:

```bash
curl -X PATCH http://localhost:3000/api/participants/permissions \
  -H "Content-Type: application/json" \
  -d '{"roomName": "test-room", "identity": "user1", "canPublish": true}'
```

3. Agent Attachment:

```bash
curl -X POST http://localhost:3000/api/attach \
  -H "Content-Type: application/json" \
  -d '{"roomName": "test-room", "systemPrompt": "You are a helpful assistant"}'
```

## Production Build

Build both server and client for production:

```bash
# Build the client
npm run build:client

# Build the server
npm run build:server

# Start production server
npm run start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [LiveKit](https://livekit.io/) for WebRTC infrastructure
- [Elysia](https://elysiajs.com/) for the backend server
- [Vite](https://vitejs.dev/) for the frontend build tool
- [React](https://reactjs.org/) for the UI framework
