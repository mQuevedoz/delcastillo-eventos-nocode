import mongoose from "mongoose";

const ProviderSchema = new mongoose.Schema({
  // Proveedor = contacto principal
  name:   { type: String, required: true, trim: true }, // proveedor/contacto
  ruc:    { type: String, trim: true },                 // opcional
  role:   { 
    type: String, 
    enum: ["Toldero","Cocinero","Barman","Mozo","Sonido","Luz","Decoración","Transporte","Otros"],
    required: true, 
    trim: true 
  },
  phone:  { type: String, required: true, trim: true },
  email:  { type: String, trim: true, lowercase: true }
}, { timestamps: true });

export default mongoose.model("Provider", ProviderSchema);

