import mongoose from "mongoose";

const ImageRefSchema = new mongoose.Schema({
  url: String,                                   // URL pública o /api/images/:id
  isCover: { type: Boolean, default: false },
}, { _id: true });

const ExtraSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  price:       { type: Number, required: true, min: 0 },
  images:      { type: [ImageRefSchema], default: [] },
}, {
  timestamps: true,
  collection: "Extra"                            
});

ExtraSchema.virtual("coverImage").get(function () {
  return this.images?.find(i => i.isCover) || this.images?.[0] || null;
});

ExtraSchema.index({ name: "text", description: "text" });

export default mongoose.model("Extra", ExtraSchema);
