import express from "express";
import Service from "../models/Service.js";
import Activity from "../models/Activity.js";
import User from "../models/Users.js";

const router = express.Router();

// LISTAR
router.get("/", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const filter = q
      ? { name: { $regex: q, $options: "i" } }
      : {};
    const items = await Service.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// OBTENER UNO
router.get("/:id", async (req, res) => {
  try {
    const item = await Service.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CREAR
router.post("/", async (req, res) => {
  try {
    const doc = await Service.create(req.body);
    // Registrar actividad
    let userName = req.user?.nombre || "admin";
    if (!userName && req.body.userId) {
      const user = await User.findById(req.body.userId);
      userName = user ? user.nombre : "admin";
    }
    await Activity.create({
      type: "create",
      entity: "service",
      entityId: doc._id,
      entityName: doc.name,
      user: userName,
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ACTUALIZAR
router.put("/:id", async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    // Registrar actividad
    let userName = req.user?.nombre || "admin";
    if (!userName && req.body.userId) {
      const user = await User.findById(req.body.userId);
      userName = user ? user.nombre : "admin";
    }
    await Activity.create({
      type: "update",
      entity: "service",
      entityId: updated._id,
      entityName: updated.name,
      user: userName,
    });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ELIMINAR
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "No encontrado" });
    // Registrar actividad
    let userName = req.user?.nombre || "admin";
    if (!userName && req.body.userId) {
      const user = await User.findById(req.body.userId);
      userName = user ? user.nombre : "admin";
    }
    await Activity.create({
      type: "delete",
      entity: "service",
      entityId: deleted._id,
      entityName: deleted.name,
      user: userName,
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
