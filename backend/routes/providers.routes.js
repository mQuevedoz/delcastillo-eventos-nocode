import { Router } from "express";
import Provider from "../models/Provider.js";

const router = Router();

// LISTAR con búsqueda opcional (?q=)
router.get("/", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const filter = q ? { 
      $or: [
        { name:  { $regex: q, $options: "i" } },
        { ruc:   { $regex: q, $options: "i" } },
        { role:  { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    } : {};
    const items = await Provider.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// OBTENER
router.get("/:id", async (req, res) => {
  try {
    const it = await Provider.findById(req.params.id);
    if (!it) return res.status(404).json({ error: "No encontrado" });
    res.json(it);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// CREAR
router.post("/", async (req, res) => {
  try {
    const created = await Provider.create(req.body);
    res.status(201).json(created);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ACTUALIZAR
router.put("/:id", async (req, res) => {
  try {
    const updated = await Provider.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    res.json(updated);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ELIMINAR
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Provider.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "No encontrado" });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;



