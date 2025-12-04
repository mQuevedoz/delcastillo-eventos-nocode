// backend/routes/images.routes.js
import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import sharp from "sharp";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/** Ajustes de derivados (thumb) */
const THUMB_WIDTH = 800;        // ancho objetivo para miniaturas
const THUMB_QUALITY = 85;       // calidad WEBP

// (opcional) cache interna de sharp para acelerar transformaciones repetidas
sharp.cache({ files: 128, items: 512, memory: 128 });

/** Helpers **************************************************************/
function getBucket() {
  const conn = mongoose.connection;
  if (!conn?.db) throw new Error("Mongo no conectado aún");
  return new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });
}

function toObjId(id) {
  try { return new ObjectId(id); } catch { return null; }
}

function notFound(res) {
  return res.status(404).json({ error: "Imagen no encontrada" });
}

/** Establece cabeceras de caché y devuelve el ETag calculado */
function setCacheHeaders(res, file) {
  // 1 año en caché, inmutable (IDs únicos en URLs)
  res.set("Cache-Control", "public, max-age=31536000, immutable");

  // ETag basado en id + length + fecha subida
  const etag = `"${file._id.toString()}-${file.length}-${file.uploadDate?.getTime?.() || 0}"`;
  res.set("ETag", etag);

  if (file.uploadDate) {
    res.set("Last-Modified", file.uploadDate.toUTCString());
  }
  return etag;
}

/** SUBIDA: POST /api/images *********************************************/
router.post("/", upload.array("files"), async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: "No se recibieron archivos" });
    }

    const bucket = getBucket();

    const uploaded = await Promise.all(
      req.files.map(
        (f) =>
          new Promise((resolve, reject) => {
            const up = bucket.openUploadStream(f.originalname, {
              contentType: f.mimetype,
            });
            up.end(f.buffer);
            up.once("finish", () =>
              resolve({
                id: up.id.toString(),
                filename: up.filename,
                length: up.length,
                contentType: up.contentType,
              })
            );
            up.once("error", reject);
          })
      )
    );

    res.json({ uploaded });
  } catch (err) {
    next(err);
  }
});

/** THUMB: GET /api/images/thumb/:id **************************************
 * Miniatura WEBP reescalada (más liviana que el original).
 * Con ETag/Last-Modified -> 304 Not Modified cuando aplique.
 */
router.get("/thumb/:id", async (req, res, next) => {
  try {
    const id = toObjId(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido" });

    const bucket = getBucket();

    // buscamos metadatos para cabeceras de caché
    const [file] = await bucket.find({ _id: id }).toArray();
    if (!file) return notFound(res);

    const etag = setCacheHeaders(res, file);
    if (req.headers["if-none-match"] === etag) return res.sendStatus(304);

    res.set("Content-Type", "image/webp");

    const transformer = sharp()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY });

    const dl = bucket.openDownloadStream(id);
    dl.once("error", (err) => {
      if (err?.message?.includes?.("FileNotFound")) return notFound(res);
      next(err);
    });

    dl.pipe(transformer).pipe(res);
  } catch (err) {
    next(err);
  }
});

/** ORIGINAL: GET /api/images/:id *****************************************
 * Sirve el original guardado en GridFS.
 * Con ETag/Last-Modified -> 304 Not Modified cuando aplique.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const id = toObjId(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido" });

    const bucket = getBucket();

    // metadatos para cabeceras de caché
    const [file] = await bucket.find({ _id: id }).toArray();
    if (!file) return notFound(res);

    const etag = setCacheHeaders(res, file);
    if (req.headers["if-none-match"] === etag) return res.sendStatus(304);

    if (file?.contentType) res.set("Content-Type", file.contentType);

    const dl = bucket.openDownloadStream(id);
    dl.once("error", (err) => {
      if (err?.message?.includes?.("FileNotFound")) return notFound(res);
      next(err);
    });

    dl.pipe(res);
  } catch (err) {
    next(err);
  }
});

export default router;
