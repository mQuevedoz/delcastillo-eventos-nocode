import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    // Campos que necesitas en la tabla:
    // Contratante, Telefono, Categoría (desde Service), Local (Casa), Fecha, Ganancia, Acciones
    contratante: { type: String, required: true }, // = clientName
    telefono:    { type: String, default: "" },    // = clientPhone
    date:        { type: String, required: true }, // "YYYY-MM-DD"
    price:       { type: Number, default: 0 },     // Ganancia

    // Enlaces para obtener Categoría y Local:
    serviceId:   { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    casaId:      { type: mongoose.Schema.Types.ObjectId, ref: "Casa", required: true },

    // Extras útiles (opcional)
    notes:       { type: String, default: "" },
    status: {
      type: String,
      enum: ["programado", "en_proceso", "completado", "cancelado"],
      default: "programado",
      index: true
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);

