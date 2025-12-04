import express from "express";
import Extra from "../models/Extra.js";

const router = express.Router();

/* LISTAR (búsqueda parcial por nombre/descripcion) */
router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();

    // Si hay texto, dividimos en palabras y exigimos que TODAS coincidan en name o description
    // usando regex insensible a may/min (parcial).
    const filter = q
      ? {
          $and: q.split(/\s+/).map((word) => {
            const safe = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escapa regex
            const rgx = new RegExp(safe, "i");
            return { $or: [{ name: rgx }, { description: rgx }] };
          }),
        }
      : {};

    const data = await Extra.find(filter).sort({ createdAt: -1 }).lean();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/* OBTENER */
router.get("/:id", async (req, res, next) => {
  try {
    const doc = await Extra.findById(req.params.id);
    if (!doc) return res.sendStatus(404);
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

/* CREAR */
router.post("/", async (req, res, next) => {
  try {
    const doc = await Extra.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
});

/* ACTUALIZAR */
router.put("/:id", async (req, res, next) => {
  try {
    const doc = await Extra.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.sendStatus(404);
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

/* ELIMINAR */
router.delete("/:id", async (req, res, next) => {
  try {
    await Extra.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

/* AGREGAR IMAGEN (post-upload) — body: { url, isCover? } */
router.post("/:id/images", async (req, res, next) => {
  try {
    const { url, isCover } = req.body;
    const doc = await Extra.findById(req.params.id);
    if (!doc) return res.sendStatus(404);

    if (isCover) doc.images.forEach((i) => (i.isCover = false));
    doc.images.push({ url, isCover: !!isCover });

    await doc.save();
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
});

/* ELIMINAR IMAGEN */
router.delete("/:id/images/:imageId", async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    const doc = await Extra.findById(id);
    if (!doc) return res.sendStatus(404);
    doc.images = doc.images.filter((img) => img._id.toString() !== imageId);
    await doc.save();
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

/* MARCAR PORTADA */
router.patch("/:id/cover/:imageId", async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    const doc = await Extra.findById(id);
    if (!doc) return res.sendStatus(404);
    doc.images.forEach(
      (img) => (img.isCover = img._id.toString() === imageId)
    );
    await doc.save();
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

export default router;
