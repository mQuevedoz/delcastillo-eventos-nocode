import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    direccion: { type: String },
    email: { type: String, required: true },
    telefono: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Cliente", clienteSchema);
