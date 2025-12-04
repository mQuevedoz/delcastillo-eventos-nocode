// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    telefono: { type: String, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false }, // select:false = no sale por defecto
    rol: { type: String, default: "admin" }, // por ahora admin; luego podemos ampliar
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash antes de guardar si cambió el password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Para findOneAndUpdate con password nuevo
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update?.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
    this.setUpdate(update);
  }
  next();
});

// Ocultar password si alguien hace toJSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Comparar password (para login)
userSchema.methods.comparePassword = async function (plain) {
  // Ojo: este método solo sirve si el doc fue cargado con password (select:+password)
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", userSchema);

