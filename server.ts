import express from "express";
import { createServer as createViteServer } from "vite";
import webpush from "web-push";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// VAPID keys should be generated once and stored in .env
// You can generate them using: npx web-push generate-vapid-keys
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
  const PORT = 3000;

  app.use(express.json());

  // Store subscriptions (In a real app, use a database)
  const subscriptions: any[] = [];

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
        // Remove failed subscriptions
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
