import { WebSocketServer } from "ws";

const PORT = Number(process.env.TMI_FEED_SOCKET_PORT ?? 8080);
let latestFeed = {};

const server = new WebSocketServer({ port: PORT });

server.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "feed:update", payload: latestFeed }));

  socket.on("message", (message) => {
    try {
      const decoded = JSON.parse(String(message));
      const payload =
        decoded && typeof decoded === "object" && "type" in decoded
          ? decoded.type === "feed:update"
            ? decoded.payload
            : null
          : decoded;

      if (!payload || typeof payload !== "object") {
        return;
      }

      latestFeed = { ...latestFeed, ...payload };
      const outbound = JSON.stringify({ type: "feed:update", payload: latestFeed });

      for (const client of server.clients) {
        if (client.readyState === 1) {
          client.send(outbound);
        }
      }
    } catch {
      // Ignore malformed messages to keep the bus resilient.
    }
  });
});

console.log(`[tmi-feed] websocket feed server listening on ws://localhost:${PORT}`);
