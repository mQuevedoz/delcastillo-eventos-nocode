// backend/routes/casas.routes.js
import { Router } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import Casa from '../models/Casa.js';
import Activity from '../models/Activity.js';
import User from '../models/Users.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/* -------- Helpers GridFS -------- */
function bucket() {
  const conn = mongoose.connection;
  if (!conn?.db) throw new Error('Mongo no conectado');
  return new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
}
const imgUrl   = (id) => `/api/images/${id}`;
const thumbUrl = (id) => `/api/images/thumb/${id}`;

/* -------- Helper: slug único -------- */
function slugify(s = '') {
  return s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'casa';
}
async function makeUniqueSlug(base) {
  let slug = base;
  let i = 2;
  // mientras exista un doc con el slug, prueba con -2, -3, ...
  while (await Casa.exists({ slug })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

/* ========== CRUD BÁSICO ========== */
// LISTAR
router.get('/', async (req, res) => {
  const q = req.query.q?.trim();
  const filtro = { ...(q ? { nombre: new RegExp(q, 'i') } : {}) };
  const data = await Casa.find(filtro).sort({ createdAt: -1 });
  res.json(data);
});

// DETALLE POR SLUG
router.get('/slug/:slug', async (req, res) => {
  const item = await Casa.findOne({ slug: req.params.slug });
  if (!item) return res.status(404).json({ message: 'Casa no encontrada' });
  res.json(item);
});

// CREAR (con slug único)
router.post('/', async (req, res) => {
  try {
    const body = req.body;

    const base = slugify(body.slug || body.nombre);
    body.slug = await makeUniqueSlug(base);

    const created = await Casa.create(body);
    // Registrar actividad
    let userName = req.user?.nombre || "admin";
    if (!userName && body.userId) {
      const user = await User.findById(body.userId);
      userName = user ? user.nombre : "admin";
    }
    await Activity.create({
      type: "create",
      entity: "casa",
      entityId: created._id,
      entityName: created.nombre,
      user: userName,
    });
    res.status(201).json(created);
  } catch (err) {
    // si algo raro pasa, devuélvelo legible
    const msg = err?.message || 'Error creando casa';
    const code = err?.code === 11000 ? 409 : 400; // duplicado → 409
    res.status(code).json({ message: msg });
  }
});

// ACTUALIZAR (si cambia nombre y no envían slug, recalcula uno único)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };

    if (body.nombre && !body.slug) {
      const base = slugify(body.nombre);
      body.slug = await makeUniqueSlug(base);
    }

    const updated = await Casa.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Casa no encontrada' });

    // Registrar actividad
    let userName = req.user?.nombre || "admin";
    if (!userName && body.userId) {
      const user = await User.findById(body.userId);
      userName = user ? user.nombre : "admin";
    }
    await Activity.create({
      type: "update",
      entity: "casa",
      entityId: updated._id,
      entityName: updated.nombre,
      user: userName,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err?.message || 'Error actualizando casa' });
  }
});

// CAMBIAR ESTADO
router.patch('/:id/estado', async (req, res) => {
  try {
    const updated = await Casa.findByIdAndUpdate(
      req.params.id,
      { activa: !!req.body.activa },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Casa no encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err?.message || 'Error cambiando estado' });
  }
});

// ELIMINAR (opcional borrar GridFS)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Casa.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Casa no encontrada' });

    // Registrar actividad
    let userName = req.user?.nombre || "admin";
    if (!userName && req.body.userId) {
      const user = await User.findById(req.body.userId);
      userName = user ? user.nombre : "admin";
    }
    await Activity.create({
      type: "delete",
      entity: "casa",
      entityId: deleted._id,
      entityName: deleted.nombre,
      user: userName,
    });
    res.json({ message: 'Casa eliminada definitivamente' });

    const b = bucket();
    await Promise.all(
      (deleted.imagenes || [])
        .filter(im => im.publicId)
        .map(async im => { try { await b.delete(new ObjectId(im.publicId)); } catch {} })
    );

    res.json({ message: 'Casa eliminada' });
  } catch (err) {
    res.status(400).json({ message: err?.message || 'Error eliminando casa' });
  }
});

/* ========== GESTIÓN DE IMÁGENES ========== */
// SUBIR imágenes y vincular a la casa
router.post('/:id/images', upload.array('files'), async (req, res) => {
  try {
    const casa = await Casa.findById(req.params.id);
    if (!casa) return res.status(404).json({ message: 'Casa no encontrada' });
    if (!req.files?.length) return res.status(400).json({ message: 'No hay archivos' });

    const b = bucket();
    const uploaded = [];

    for (const f of req.files) {
      const up = b.openUploadStream(f.originalname, { contentType: f.mimetype });
      await new Promise((resolve, reject) => {
        up.end(f.buffer);
        up.once('finish', resolve);
        up.once('error', reject);
      });

      const id = up.id.toString();
      const im = {
        url:   imgUrl(id),
        thumb: thumbUrl(id),
        publicId: id,
        isCover: false,
      };
      uploaded.push(im);
      casa.imagenes.push(im);
    }

    if (!casa.imagenes.some(im => im.isCover) && casa.imagenes.length > 0) {
      casa.imagenes[0].isCover = true;
    }

    const saved = await casa.save();
    res.json({ uploaded, casa: saved });

  } catch (err) {
    res.status(500).json({ message: 'Error subiendo imágenes', details: err?.message });
  }
});

// ELIMINAR una imagen
router.delete('/:id/images/:imageId', async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const casa = await Casa.findById(id);
    if (!casa) return res.status(404).json({ message: 'Casa no encontrada' });

    const idx = casa.imagenes.findIndex(im => im._id?.toString() === imageId || im.publicId === imageId);
    if (idx === -1) return res.status(404).json({ message: 'Imagen no encontrada en la casa' });

    const [removed] = casa.imagenes.splice(idx, 1);
    await casa.save();

    if (removed?.publicId) {
      try { await bucket().delete(new ObjectId(removed.publicId)); } catch {}
    }

    res.json({ ok: true, casa });
  } catch (err) {
    res.status(500).json({ message: 'Error eliminando imagen', details: err?.message });
  }
});

// MARCAR portada
router.patch('/:id/cover', async (req, res) => {
  try {
    const casa = await Casa.findById(req.params.id);
    if (!casa) return res.status(404).json({ message: 'Casa no encontrada' });

    const { imageId } = req.body;
    let found = false;
    casa.imagenes.forEach(im => {
      const match = im._id?.toString() === imageId || im.publicId === imageId;
      if (match) found = true;
      im.isCover = match;
    });
    if (!found) return res.status(404).json({ message: 'Imagen no pertenece a esta casa' });

    const saved = await casa.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Error marcando portada', details: err?.message });
  }
});

export default router;
