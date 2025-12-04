// backend/models/Casa.js
import { Schema, model } from 'mongoose';

const imagenSchema = new Schema({
  url:      { type: String, required: true },      // /api/images/:id
  thumb:    { type: String },                      // /api/images/thumb/:id (opcional)
  publicId: { type: String, default: null },       // id de GridFS en texto (opcional)
  isCover:  { type: Boolean, default: false },     // portada?
}, { _id: true });

const casaSchema = new Schema({
  nombre:        { type: String, required: true, trim: true },
  direccion:     { type: String, required: true, trim: true },
  areaM2:        { type: Number, required: true, min: 1 },
  capacidad:     { type: Number, required: true, min: 1 },
  horaFinEvento: { type: String, required: true, trim: true },
  detalles:      { type: String, trim: true },
  precioDesde:   { type: Number, min: 0 },
  imagenes:      { type: [imagenSchema], default: [] },
  activa:        { type: Boolean, default: true },
  slug:          { type: String, unique: true, index: true }
}, { timestamps: true });

export default model('Casa', casaSchema);
