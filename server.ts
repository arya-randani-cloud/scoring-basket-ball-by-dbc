import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Scoreboard State
  let scoreboardState = {
    home: { name: "DINIS BC", score: 0 },
    away: { name: "AWAY TEAM", score: 0 },
    timer: 600, // 10 minutes in seconds
    timerActive: false,
    quarter: 1,
    shotClock: 24,
    shotClockActive: false,
  };

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    // Send initial state
    socket.emit("update", scoreboardState);

    socket.on("sync", (newState) => {
      scoreboardState = newState;
      socket.broadcast.emit("update", scoreboardState);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
