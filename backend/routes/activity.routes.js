// backend/routes/activity.routes.js
import express from "express";
import Activity from "../models/Activity.js"; // Modelo de actividades

const router = express.Router();

// 🕒 GET /api/activities
router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ date: -1 })   // 👉 ordena por fecha descendente (más recientes primero)
      .limit(5);            // 👉 solo devuelve las 5 últimas actividades
    res.json(activities);   // 👉 respuesta en JSON
  } catch (err) {
    console.error("Error cargando actividades:", err.message);
    res.status(500).json({ error: "Error cargando actividades" });
  }
});

export default router;
