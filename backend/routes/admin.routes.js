// backend/routes/admin.routes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Service from "../models/Service.js";
import Activity from "../models/Activity.js";
import Lead from "../models/Lead.js";
import User from "../models/Users.js"; 
import Event from "../models/Event.js";

const router = express.Router();


router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};

    if (!identifier || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    // Busca por email o username e incluye password (select:false en el schema)
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");

    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const payload = { uid: user._id, rol: user.rol || "admin" };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "dev-secret", {
      expiresIn: "8h",
    });

    // No devolvemos password
    res.json({
      token,
      user: {
        _id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        username: user.username,
        rol: user.rol || "admin",
      },
    });
  } catch (err) {
    console.error("admin/login error:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

/* =========================
   DASHBOARD¿
========================= */

// Resumen (KPIs principales)
// GET /api/admin/summary
router.get("/summary", async (_req, res) => {
  try {
    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ active: true });
    const totalActivities = await Activity.countDocuments();

    // si tienes otro modelo para pedidos de info lo pones aquí
    const totalQueries = await Lead.countDocuments();

    res.json({
      totalServices,
      activeServices,
      totalActivities,
      totalQueries,
    });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener resumen", details: err });
  }
});

// Estadísticas de servicios por categoría
// GET /api/admin/services-stats
router.get("/services-stats", async (_req, res) => {
  try {
    const stats = await Service.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } },
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener estadísticas", details: err });
  }
});

// Actividades recientes
// GET /api/admin/recent-activities
router.get("/recent-activities", async (_req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener actividades recientes", details: err });
  }
});

// Tendencia de consultas por mes
// GET /api/admin/queries-by-month
router.get("/queries-by-month", async (_req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", count: 1, _id: 0 } },
    ];
    const data = await Lead.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    console.error("queries-by-month error:", err);
    res.status(500).json({ error: "Error al obtener queries by month", details: err });
  }
});

// Leads por servicio
// GET /api/admin/leads-by-service
router.get("/leads-by-service", async (_req, res) => {
  try {
    const pipeline = [
      { $group: { _id: "$serviceId", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "services", // nombre de la colección en Mongo
          localField: "_id",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          serviceId: "$_id",
          serviceName: { $ifNull: ["$service.name", "Sin servicio"] },
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ];
    const data = await Lead.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    console.error("leads-by-service error:", err);
    res.status(500).json({ error: "Error al obtener leads by service", details: err });
  }
});

export default router;
