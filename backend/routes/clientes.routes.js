import express from "express";
import Cliente from "../models/Cliente.js";
import ExcelJS from "exceljs";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // const { dia, mes, busqueda } = req.query;
       const { dia, mes, año, busqueda } = req.query;

    // Construcción dinámica del filtro
    const filtro = {};
if (mes || año || dia) {
  const currentYear = año ? parseInt(año) : new Date().getFullYear();
  const mesInicio = mes ? parseInt(mes) - 1 : 0;
  const diaInicio = dia ? parseInt(dia) : 1;

  const inicio = new Date(currentYear, mesInicio, diaInicio, 0, 0, 0);
  let fin;

  if (dia && mes && año) {
    fin = new Date(currentYear, mesInicio, diaInicio + 1, 0, 0, 0);
  } else if (mes && año) {
    fin = new Date(currentYear, mesInicio + 1, 1, 0, 0, 0);
  } else if (año && !mes) {
    fin = new Date(currentYear + 1, 0, 1, 0, 0, 0);
  } else {
    fin = new Date(currentYear, mesInicio, diaInicio + 1, 0, 0, 0);
  }

  filtro.createdAt = { $gte: inicio, $lt: fin };
}

    // if (dia || mes) {
    //   const now = new Date();
    //   const año = now.getFullYear();

    //   const diaInicio = dia ? parseInt(dia) : 1;
    //   const mesInicio = mes ? parseInt(mes) - 1 : 0;

    //   const inicio = new Date(año, mesInicio, diaInicio, 0, 0, 0);
    //   let fin;

    //   if (dia && mes) {
    //     fin = new Date(año, mesInicio, diaInicio + 1, 0, 0, 0);
    //   } else if (mes && !dia) {
    //     fin = new Date(año, mesInicio + 1, 1, 0, 0, 0);
    //   } else {
    //     fin = new Date(año, mesInicio, diaInicio + 1, 0, 0, 0);
    //   }

    //   filtro.createdAt = { $gte: inicio, $lt: fin };
    // }

    if (busqueda) {
      filtro.$or = [
        { nombre: { $regex: busqueda, $options: "i" } },
        { email: { $regex: busqueda, $options: "i" } },
        { telefono: { $regex: busqueda, $options: "i" } },
      ];
    }

    const clientes = await Cliente.find(filtro).sort({ createdAt: -1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: "Error al listar clientes" });
  }
});

// ✅ Crear cliente
router.post("/", async (req, res) => {
  try {
    const nuevo = new Cliente(req.body);
    await nuevo.save();
    res.json(nuevo);
  } catch (err) {
    console.error("Error creando cliente:", err);
    res.status(400).json({ error: "Error creando cliente" });
  }
});

// ✅ Actualizar cliente
router.put("/:id", async (req, res) => {
  try {
    const actualizado = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!actualizado) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(actualizado);
  } catch (err) {
    console.error("Error actualizando cliente:", err);
    res.status(400).json({ error: "Error actualizando cliente" });
  }
});

// ✅ Eliminar cliente
router.delete("/:id", async (req, res) => {
  try {
    const eliminado = await Cliente.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json({ ok: true });
  } catch (err) {
    console.error("Error eliminando cliente:", err);
    res.status(500).json({ error: "Error eliminando cliente" });
  }
});

// ✅ Generar reporte Excel por rango de fechas
router.get("/reporte", async (req, res) => {
  try {
const { dia, mes, año } = req.query;

if (!mes || !año) {
  return res.status(400).json({ error: "Debes seleccionar al menos mes y año" });
}

const currentYear = parseInt(año);
const mesInicio = parseInt(mes) - 1;
const diaInicio = dia ? parseInt(dia) : 1;

const inicio = new Date(currentYear, mesInicio, diaInicio, 0, 0, 0);
let fin;

if (dia) {
  fin = new Date(currentYear, mesInicio, diaInicio + 1, 0, 0, 0);
} else {
  fin = new Date(currentYear, mesInicio + 1, 1, 0, 0, 0);
}

const clientes = await Cliente.find({
  createdAt: { $gte: inicio, $lt: fin },
}).sort({ createdAt: -1 });


    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet("Clientes Registrados");

    hoja.columns = [
      { header: "Nombre", key: "nombre", width: 25 },
      { header: "Dirección", key: "direccion", width: 30 },
      { header: "Teléfono", key: "telefono", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Fecha Registro", key: "fecha", width: 20 },
    ];

    clientes.forEach((c) =>
      hoja.addRow({
        nombre: c.nombre,
        direccion: c.direccion,
        telefono: c.telefono,
        email: c.email,
        fecha: new Date(c.createdAt).toLocaleDateString(),
      })
    );

    hoja.getRow(1).font = { bold: true, color: { argb: "FF5A2D0C" } };
    hoja.getRow(1).alignment = { horizontal: "center" };

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="reporte_clientes.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error generando reporte:", err);
    res.status(500).json({ error: "Error generando reporte" });
  }
});

export default router;
