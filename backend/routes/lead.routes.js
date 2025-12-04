// backend/routes/lead.routes.js
import express from "express";
import Lead from "../models/Lead.js";
import { emitEvent } from "../lib/realtime.js"; // nuestro emisor

const router = express.Router();

//  Crear lead (ahora emite eventos enriquecidos y agregaciones)
router.post("/", async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();

    // --- Poblamos serviceId con el nombre para que el frontend muestre el nombre del servicio ---
    await lead.populate({ path: "serviceId", select: "name" });

    // Emitir nuevo lead (con serviceId poblado)
    emitEvent("new-lead", lead);
    console.log("📢 Evento 'new-lead' emitido:", lead._id);

    // --- Recalcular queries-by-month (mismo pipeline que en admin.routes.js) ---
    const queriesByMonth = await Lead.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", count: 1, _id: 0 } },
    ]);

    emitEvent("queries-by-month-updated", queriesByMonth);
    console.log("📢 Evento 'queries-by-month-updated' emitido");

    // --- Recalcular leads-by-service (para gráficos por servicio) ---
    const leadsByService = await Lead.aggregate([
      { $group: { _id: "$serviceId", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "services",
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
    ]);

    emitEvent("leads-by-service-updated", leadsByService);
    console.log("📢 Evento 'leads-by-service-updated' emitido");

    return res.status(201).json(lead);
  } catch (err) {
    console.error("Error creando lead:", err);
    return res.status(500).json({ error: "Error al registrar solicitud", details: err });
  }
});

//  Obtener todos los leads (para admin) — mantenemos populate por si frontend hace fetch
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().populate("serviceId", "name category");
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener solicitudes" });
  }
});

//  Actualizar estado de una solicitud
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar que el estado sea válido
    const validStatuses = ["No atendido", "Atendido", "Contratado", "No contratado"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("serviceId", "name category");

    if (!lead) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    res.json(lead);
  } catch (err) {
    console.error("Error actualizando estado:", err);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

//  Eliminar una solicitud
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const lead = await Lead.findByIdAndDelete(id);
    
    if (!lead) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    res.json({ message: "Solicitud eliminada correctamente" });
  } catch (err) {
    console.error("Error eliminando solicitud:", err);
    res.status(500).json({ error: "Error al eliminar solicitud" });
  }
});

export default router;
