import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLead } from "../api/services.js";

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  eventDate: z.string().min(10, "Fecha requerida"),
  house: z.string().optional(),
  message: z.string().optional(),
});

export default function LeadForm({ service }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    const payload = {
      ...values,
      serviceId: service._id,
    };
    await createLead(payload);
    alert("Solicitud enviada. Te contactaremos pronto.");
    reset();
  }

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)}>
      <h3>Solicita tu cotización</h3>
      <div className="row">
        <label>Servicio</label>
        <input value={service.name} disabled />
      </div>
      <div className="row">
        <label>Nombre*</label>
        <input {...register("name")} />
        {errors.name && <span className="err">{errors.name.message}</span>}
      </div>
      <div className="row">
        <label>Email*</label>
        <input {...register("email")} />
        {errors.email && <span className="err">{errors.email.message}</span>}
      </div>
      <div className="row">
        <label>Teléfono</label>
        <input {...register("phone")} />
      </div>
      <div className="row">
        <label>Fecha del evento*</label>
        <input type="date" {...register("eventDate")} />
        {errors.eventDate && <span className="err">{errors.eventDate.message}</span>}
      </div>
      <div className="row">
        <label>Casa / local (opcional)</label>
        <input {...register("house")} placeholder="Ej: Casa Miraflores" />
      </div>
      <div className="row">
        <label>Mensaje</label>
        <textarea rows="3" {...register("message")} />
      </div>
      <button className="btn" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar solicitud"}
      </button>
    </form>
  );
}
