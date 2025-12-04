// backend/models/Service.js
import mongoose from "mongoose";

const serviceImageSchema = new mongoose.Schema(
  {
    imageId: { type: mongoose.Schema.Types.ObjectId, ref: "Image", required: true },
    alt: { type: String, default: "" },
    isCover: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Boda", "Corporativo", "Cumpleaños", "Otro"],
      default: "Otro",
    },
    basePrice: { type: Number, default: 0 },           
    description: { type: String, default: "" },
    capacityMin: { type: Number, default: 0 },
    capacityMax: { type: Number, default: 0 },
    images: [serviceImageSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
