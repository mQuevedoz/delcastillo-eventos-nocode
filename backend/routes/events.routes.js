import express from "express";
import Event from "../models/Event.js";
import { emitEvent } from "../lib/realtime.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const doc = await Event.create(req.body);
    const populated = await Event.findById(doc._id).populate([
      { path: "serviceId", select: "name category" },
      { path: "casaId", select: "nombre direccion activa" },
    ]);
    emitEvent("event-created", populated);
    res.status(201).json(populated);
  } catch (e) {
    res.status(400).json({ error: "No se pudo crear el evento", details: e?.message });
  }
});

// LIST con filtros mínimos
// /api/events?q=foo&from=2025-10-01&to=2025-10-31&status=programado
router.get("/", async (req, res) => {
  try {
    const { q, from, to, status, serviceId, casaId } = req.query;
    const match = {};
    if (status) match.status = status;
    if (serviceId) match.serviceId = serviceId;
    if (casaId) match.casaId = casaId;
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = from;
      if (to)   match.date.$lte = to;
    }
    if (q?.trim()) {
      const r = new RegExp(q.trim(), "i");
      match.$or = [{ contratante: r }, { telefono: r }, { notes: r }];
    }

    const docs = await Event.find(match)
      .sort({ date: 1 })
      .populate([
        { path: "serviceId", select: "name category" },
        { path: "casaId", select: "nombre direccion activa" },
      ]);

    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: "Error al listar eventos" });
  }
});

// GET ONE
router.get("/:id", async (req, res) => {
  try {
    const doc = await Event.findById(req.params.id).populate([
      { path: "serviceId", select: "name category" },
      { path: "casaId", select: "nombre direccion activa" },
    ]);
    if (!doc) return res.status(404).json({ error: "Evento no encontrado" });
    res.json(doc);
  } catch {
    res.status(400).json({ error: "Solicitud inválida" });
  }
});

// UPDATE
router.patch("/:id", async (req, res) => {
  try {
    await Event.updateOne({ _id: req.params.id }, req.body);
    const doc = await Event.findById(req.params.id).populate([
      { path: "serviceId", select: "name category" },
      { path: "casaId", select: "nombre direccion activa" },
    ]);
    if (!doc) return res.status(404).json({ error: "Evento no encontrado" });
    emitEvent("event-updated", doc);
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: "No se pudo actualizar el evento" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const del = await Event.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ error: "Evento no encontrado" });
    emitEvent("event-deleted", { _id: del._id });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "No se pudo eliminar el evento" });
  }
});

export default router;

