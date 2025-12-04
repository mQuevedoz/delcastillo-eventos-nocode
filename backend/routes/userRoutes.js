import express from "express";
import User from "../models/Users.js";  

const router = express.Router();

// LISTAR
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // password oculto por select:false
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: "Error listando usuarios" });
  }
});

// CREAR
router.post("/", async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, username, password, rol } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ error: "Email o usuario ya registrados" });

    const user = await User.create({ nombre, apellido, email, telefono, username, password, rol });
    res.status(201).json(user); // password ya no viaja
  } catch (e) {
    res.status(500).json({ error: "Error creando usuario" });
  }
});

// OBTENER por id (sin password)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch {
    res.status(400).json({ error: "ID inválido" });
  }
});

// ACTUALIZAR (sin tocar password aquí)
router.put("/:id", async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, username, rol, activo } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { nombre, apellido, email, telefono, username, rol, activo },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: "Error actualizando usuario" });
  }
});

// CAMBIAR PASSWORD (ruta explícita)
router.patch("/:id/password", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { password },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "Error actualizando contraseña" });
  }
});

// ELIMINAR
router.delete("/:id", async (req, res) => {
  try {
    const del = await User.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Error eliminando usuario" });
  }
});

export default router;
