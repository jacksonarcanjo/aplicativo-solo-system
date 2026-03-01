import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import webpush from "web-push";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import twilio from "twilio";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug Environment Variables on Startup
console.log("--- VERIFICAÇÃO DE AMBIENTE ---");
console.log("TWILIO_ACCOUNT_SID definido:", !!process.env.TWILIO_ACCOUNT_SID);
console.log("TWILIO_AUTH_TOKEN definido:", !!process.env.TWILIO_AUTH_TOKEN);
console.log("TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER || "Não definido");
console.log("VITE_GEMINI_API_KEY (Visão do Servidor):", process.env.VITE_GEMINI_API_KEY ? "Definido" : "Não definido");
console.log("-------------------------------");

// Twilio Client
let twilioClient: twilio.Twilio | null = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

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

  app.post("/api/send-whatsapp", async (req, res) => {
    const { to, body } = req.body;
    
    if (!to || !body) {
      return res.status(400).json({ error: "Missing 'to' or 'body'" });
    }

    try {
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        // Format FROM number
        let rawFrom = process.env.TWILIO_PHONE_NUMBER || "";
        // Remove "whatsapp:" prefix if present to clean the number part first
        rawFrom = rawFrom.replace("whatsapp:", "");
        // Remove non-digits/non-plus
        let cleanFrom = rawFrom.replace(/[^\d+]/g, '');
        // Ensure it starts with +
        if (!cleanFrom.startsWith('+')) {
          cleanFrom = `+${cleanFrom}`;
        }
        const fromNumber = `whatsapp:${cleanFrom}`;
          
        // Format TO number
        // 1. Remove all non-digits/non-plus
        let cleanTo = to.replace(/[^\d+]/g, '');
        // 2. Ensure it starts with +
        if (!cleanTo.startsWith('+')) {
          cleanTo = `+${cleanTo}`;
        }
        // 3. Prepend whatsapp:
        const finalTo = `whatsapp:${cleanTo}`;

        console.log(`[Twilio] Sending from ${fromNumber} to ${finalTo}`);

        const message = await twilioClient.messages.create({
          body: body,
          from: fromNumber,
          to: finalTo
        });
        
        console.log(`[Twilio] Success! SID: ${message.sid}`);
        return res.json({ success: true, sid: message.sid, simulated: false });
      } else {
        console.log(`[SIMULATION] WhatsApp to ${to}: ${body}`);
        console.log("To enable real sending, configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER in .env");
        return res.json({ 
          success: true, 
          simulated: true, 
          message: "Message logged to server console (Twilio not configured)" 
        });
      }
    } catch (error: any) {
      console.error("Error sending WhatsApp:", error);
      if (error.code === 63007) {
        return res.status(500).json({ 
          error: "Twilio Error 63007: O número de origem (From) não é válido para WhatsApp. Verifique a variável TWILIO_PHONE_NUMBER. Deve ser o número do Sandbox (ex: +14155238886) ou seu número aprovado." 
        });
      }
      return res.status(500).json({ error: error.message || "Failed to send message" });
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
