// backend/models/Image.js
import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", index: true },
  filename: String,
  contentType: String,
  width: Number,
  height: Number,
  size: Number,     // bytes
  data: Buffer,     // imagen optimizada (full)
  thumb: Buffer,    // miniatura (opcional)
  thumbSize: Number,
  createdAt: { type: Date, default: Date.now },
});

ImageSchema.index({ createdAt: -1 });

export default mongoose.model("Image", ImageSchema);
