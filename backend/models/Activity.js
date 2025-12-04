// backend/models/Activity.js
import mongoose from "mongoose";


const activitySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["create", "update", "delete"], required: true }, // tipo de acción
    entity: { type: String, enum: ["service", "casa"], required: true }, // entidad
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true }, // id de la entidad
    entityName: { type: String, required: true }, // nombre de la entidad
    user: { type: String, required: true }, // usuario admin que hizo el cambio
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
