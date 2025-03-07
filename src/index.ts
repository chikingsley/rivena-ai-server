import { cors } from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";

// Create the main app
const app = new Elysia()
  .use(swagger())
  .use(
    cors({
      origin: "*", // For development. In production, specify your app's URL
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .get("/", ({ path }) => path)
  .post("/hello", "Do you miss me");

// Server-side Elysia middleware
app.post("/api/openai-ws-auth", async ({ body, set }) => {
  console.log("Received auth request with body:", body);

  try {
    const { model } = body as any;

    // Add validation
    if (!model) {
      set.status = 400;
      return { error: "Model is required" };
    }

    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OpenAI API key is missing");
      set.status = 500;
      return { error: "API configuration error" };
    }

    // OpenAI requires a specific format for the WebSocket URL
    const baseUrl = "wss://api.openai.com/v1/realtime";
    const wsUrl = `${baseUrl}?model=${encodeURIComponent(model)}`;

    console.log("Returning auth data with URL:", wsUrl);
    return {
      url: wsUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "realtime=v1",
      },
      protocol: "realtime",
    };
  } catch (error) {
    console.error("Error processing auth request:", error);
    set.status = 500;
    return { error: "Internal server error" };
  }
});

// Start the server
app.listen(3000, () => {
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
});
