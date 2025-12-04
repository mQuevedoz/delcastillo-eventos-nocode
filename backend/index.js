// backend/index.js
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { GridFSBucket } from "mongodb";
import http from "http";
import { Server as IOServer } from "socket.io";

import servicesRouter from "./routes/services.routes.js";
import casasRoutes from "./routes/casas.routes.js";
import adminRouter from "./routes/admin.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import imagesRoutes from "./routes/images.routes.js";
import userRoutes from "./routes/userRoutes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import reportRoutes from "./routes/report.routes.js";
import providersRoutes from "./routes/providers.routes.js";
import eventRoutes from "./routes/events.routes.js";
import extrasRoutes from "./routes/extras.routes.js";

import { setIO } from "./lib/realtime.js"; // <-- nuestro puente

const app = express();

// --- CORS: permite al frontend (Vite 5173 por defecto) ---
const ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: ORIGIN, credentials: true }));

// --- Body parser ---
app.use(express.json({ limit: "10mb" }));

app.use("/api/reports", reportRoutes);
// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api", ts: Date.now() });
});







// Fallback Mongo URI (solo dev/local)
const FALLBACK_ATLAS_URI =
  "mongodb+srv://infoweb_db_user:IQUAFbz8e8HR19s5@infoweb.y3gxotr.mongodb.net/infoweb?retryWrites=true&w=majority&appName=infoweb";

const MONGO_URI =
  (process.env.MONGO_URI && process.env.MONGO_URI.trim()) || FALLBACK_ATLAS_URI;

const PORT = process.env.PORT || 5000; 

// ---- GridFS bucket (se crea al conectar) ----
let bucket;
export function getBucket() {
  if (!bucket) throw new Error("GridFS no inicializado");
  return bucket;
}

// ---- Arranque ----
async function start() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGO_URI);
    console.log("Conectado a MongoDB");

    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "images" });

    // ----- CREAMOS SERVER HTTP Y SOCKET.IO -----
    const server = http.createServer(app);

    const io = new IOServer(server, {
      cors: { origin: ORIGIN, credentials: true },
    });

    // guardamos la instancia en nuestro módulo 'realtime'
    setIO(io);

    io.on("connection", (socket) => {
      console.log("Socket.IO: cliente conectado", socket.id);

      socket.on("disconnect", (reason) => {
        console.log("Socket.IO: cliente desconectado", socket.id, reason);
      });
    });

    console.log("Socket.IO inicializado");

    // Rutas API
    app.use("/api/services", servicesRouter);
    app.use("/api/casas", casasRoutes);
    app.use("/api/admin", adminRouter);        // ← login/admin y dashboard
    app.use("/api/activities", activityRoutes);
    app.use("/api/leads", leadRoutes);
    app.use("/api/images", imagesRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/clientes", clientesRoutes);
    app.use("/api/providers", providersRoutes);
    app.use("/api/events",eventRoutes);
    app.use("/api/extras", extrasRoutes);

    // 404
    app.use((req, res) => res.status(404).json({ error: "Not found" }));

    // Handler de errores
    app.use((err, _req, res, _next) => {
      console.error("Unhandled error:", err);
      res.status(500).json({ error: "Internal server error" });
    });

    server.listen(PORT, () => {
      console.log(`API corriendo en http://localhost:${PORT}`);
      console.log(`CORS origin permitido: ${ORIGIN}`);
    });
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err.message);
    process.exit(1);
  }


}

start();
