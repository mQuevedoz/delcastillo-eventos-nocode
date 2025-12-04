// backend/routes/report.routes.js
import express from 'express';
import puppeteer from 'puppeteer';
import XLSX from 'xlsx';
import mongoose from 'mongoose';
import Lead from '../models/Lead.js'; // Ajusta la ruta según tu estructura

const router = express.Router();

// Función para obtener todos los datos del dashboard desde MongoDB
async function fetchReportData() {
  // 1. Resumen (igual que en /api/admin/summary)
  const totalServices = await mongoose.connection.db.collection('services').countDocuments();
  const activeServices = await mongoose.connection.db.collection('services').countDocuments({ active: true });
  const totalActivities = await mongoose.connection.db.collection('activities').countDocuments();
    const leads = await Lead.find().populate('serviceId', 'name').lean();
  // 2. Actividades recientes (últimas 100, o todas si no son muchas)
  const activities = await mongoose.connection.db.collection('activities')
    .find()
    .sort({ date: -1 })
    .limit(100)
    .toArray();

  return {
    summary: {
      totalServices,
      activeServices,
      totalActivities
    },
    leads,
    activities
  };
}

// Generar PDF con Puppeteer
async function generatePDF(data) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // HTML del reporte (igual que en la vista previa, pero sin botones)
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reporte del Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .card { display: inline-block; margin: 10px; padding: 15px; background: #f5f5f5; border-radius: 8px; min-width: 150px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        h1, h2 { color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Reporte del Dashboard - Administración</h1>
        <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
      </div>

      <h2>Resumen Ejecutivo</h2>
      <div class="card">Servicios Totales: ${data.summary.totalServices}</div>
      <div class="card">Activos: ${data.summary.activeServices}</div>
      <div class="card">Actividades: ${data.summary.totalActivities}</div>
      <div class="card">Consultas: ${data.leads.length}</div>

      <h2>Actividades Recientes</h2>
      <table>
        <thead>
          <tr><th>Acción</th><th>Entidad</th><th>Nombre</th><th>Usuario</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          ${data.activities.map(act => `
            <tr>
              <td>${act.type === 'create' ? 'Creado' : act.type === 'update' ? 'Editado' : 'Eliminado'}</td>
              <td>${act.entity === 'service' ? 'Servicio' : act.entity === 'casa' ? 'Casa' : act.entity}</td>
              <td>${act.entityName || ''}</td>
              <td>${act.user || ''}</td>
              <td>${new Date(act.date).toLocaleString('es-PE')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Últimas Solicitudes de Información</h2>
      <table>
        <thead>
          <tr><th>Nombre</th><th>Email</th><th>Servicio</th><th>Fecha Evento</th><th>Fecha Solicitud</th></tr>
        </thead>
        <tbody>
          ${data.leads.map(lead => `
            <tr>
              <td>${lead.name || ''}</td>
              <td>${lead.email || ''}</td>
              <td>${lead.serviceId?.name || '—'}</td>
              <td>${lead.eventDate || ''}</td>
              <td>${new Date(lead.createdAt).toLocaleString('es-PE')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return pdf;
}

// Generar Excel con SheetJS
function generateExcel(data) {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Resumen
  const summarySheet = XLSX.utils.aoa_to_sheet([
    ['Métrica', 'Valor'],
    ['Servicios Totales', data.summary.totalServices],
    ['Activos', data.summary.activeServices],
    ['Actividades', data.summary.totalActivities],
    ['Consultas', data.leads.length]
  ]);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumen');

  // Hoja 2: Actividades
  const activitiesData = data.activities.map(act => ({
    Acción: act.type === 'create' ? 'Creado' : act.type === 'update' ? 'Editado' : 'Eliminado',
    Entidad: act.entity === 'service' ? 'Servicio' : act.entity === 'casa' ? 'Casa' : act.entity,
    Nombre: act.entityName || '',
    Usuario: act.user || '',
    Fecha: new Date(act.date).toLocaleString('es-PE')
  }));
  const activitiesSheet = XLSX.utils.json_to_sheet(activitiesData);
  XLSX.utils.book_append_sheet(wb, activitiesSheet, 'Actividades');

  // Hoja 3: Leads
  const leadsData = data.leads.map(lead => ({
    Nombre: lead.name || '',
    Email: lead.email || '',
    Servicio: lead.serviceId?.name || '—',
    'Fecha Evento': lead.eventDate || '',
    'Fecha Solicitud': new Date(lead.createdAt).toLocaleString('es-PE')
  }));
  const leadsSheet = XLSX.utils.json_to_sheet(leadsData);
  XLSX.utils.book_append_sheet(wb, leadsSheet, 'Solicitudes');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

// Ruta principal
router.post('/generate', async (req, res) => {
  try {
    const { type } = req.query;

    if (!type || !['pdf', 'excel'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de reporte inválido. Usa "pdf" o "excel".' });
    }

    const data = await fetchReportData();

    if (type === 'pdf') {
      const pdfBuffer = await generatePDF(data);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-dashboard.pdf');
      return res.send(pdfBuffer);
    } else if (type === 'excel') {
      const excelBuffer = generateExcel(data);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-dashboard.xlsx');
      return res.send(excelBuffer);
    }
  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ error: 'Error interno al generar el reporte' });
  }
});

export default router;