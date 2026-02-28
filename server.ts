import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import webpush from "web-push";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// VAPID keys should be generated once and stored in .env
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || "",
  privateKey: process.env.VAPID_PRIVATE_KEY || "",
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    "mailto:example@yourdomain.com",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = 3000;

  app.use(express.json());

  // Store subscriptions, messages and activities (In a real app, use a database)
  const subscriptions: any[] = [];
  const globalMessages: any[] = [];
  const activities: any[] = [];

  // WebSocket handling
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Send existing messages to the new user
    socket.emit("previous_messages", globalMessages.slice(-50));

    socket.on("send_message", (data) => {
      const newMessage = {
        id: Date.now().toString(),
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        content: data.content,
        timestamp: new Date().toISOString()
      };
      globalMessages.push(newMessage);
      if (globalMessages.length > 100) globalMessages.shift();
      
      io.emit("new_message", newMessage);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/vapid-public-key", (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
  });

  app.post("/api/subscribe", (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({});
  });

  app.post("/api/send-notification", (req, res) => {
    const { title, body, icon, data } = req.body;
    const payload = JSON.stringify({ title, body, icon, data });

    const promises = subscriptions.map((sub) =>
      webpush.sendNotification(sub, payload).catch((err) => {
        console.error("Error sending notification:", err);
        if (err.statusCode === 410 || err.statusCode === 404) {
          const index = subscriptions.indexOf(sub);
          if (index > -1) subscriptions.splice(index, 1);
        }
      })
    );

    Promise.all(promises)
      .then(() => res.json({ success: true }))
      .catch((err) => res.status(500).json({ error: err.message }));
  });

  // Activity Feed API
  app.get("/api/activities", (req, res) => {
    res.json(activities.slice(-50).reverse());
  });

  app.post("/api/activities", (req, res) => {
    const activity = {
      id: Date.now().toString(),
      ...req.body,
      likes: [],
      comments: [],
      timestamp: new Date().toISOString()
    };
    activities.push(activity);
    if (activities.length > 200) activities.shift();
    
    // Also broadcast to all connected users via socket
    io.emit("new_activity", activity);
    
    res.status(201).json(activity);
  });

  app.post("/api/activities/:id/like", (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const activity = activities.find(a => a.id === id);
    
    if (activity) {
      if (!activity.likes) activity.likes = [];
      const index = activity.likes.indexOf(userId);
      if (index === -1) {
        activity.likes.push(userId);
      } else {
        activity.likes.splice(index, 1);
      }
      io.emit("activity_updated", activity);
      res.json(activity);
    } else {
      res.status(404).json({ error: "Activity not found" });
    }
  });

  app.post("/api/activities/:id/comment", (req, res) => {
    const { id } = req.params;
    const { userId, userName, content } = req.body;
    const activity = activities.find(a => a.id === id);
    
    if (activity) {
      if (!activity.comments) activity.comments = [];
      const comment = {
        id: Date.now().toString(),
        userId,
        userName,
        content,
        timestamp: new Date().toISOString()
      };
      activity.comments.push(comment);
      io.emit("activity_updated", activity);
      res.json(activity);
    } else {
      res.status(404).json({ error: "Activity not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
