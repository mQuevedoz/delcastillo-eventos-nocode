import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    eventDate: { type: String, required: true },
    house: { type: String },
    message: { type: String },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    status: { 
      type: String, 
      enum: ["No atendido", "Atendido", "Contratado", "No contratado"], 
      default: "No atendido" 
    }
  },
  { timestamps: true }
);

const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);

export default Lead;