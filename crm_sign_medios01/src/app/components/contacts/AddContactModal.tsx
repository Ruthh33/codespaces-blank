import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import type { Contact } from "../../types";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

interface AddContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddContact: (contact: Omit<Contact, "id" | "createdAt">) => void;
}

export function AddContactModal({ open, onOpenChange, onAddContact }: AddContactModalProps) {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phoneNumber: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "El apellido debe tener al menos 2 caracteres";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "El número de teléfono es obligatorio";
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Ingresa un número de teléfono válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onAddContact({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        agentAssigned: undefined,
      });
      setFormData({ firstName: "", lastName: "", phoneNumber: "" });
      setErrors({});
      setIsSubmitting(false);
      onOpenChange(false);
    }, 800);
  };

  const handleCancel = () => {
    setFormData({ firstName: "", lastName: "", phoneNumber: "" });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-6">
            <Dialog.Title className="text-xl font-bold text-slate-800">Agregar Nuevo Contacto</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-slate-500">
              Completa los campos para registrar un nuevo contacto en el directorio.
            </Dialog.Description>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value });
                  if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                }}
                placeholder="Ej: María"
                className={[
                  "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all",
                  errors.firstName
                    ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                    : "border-slate-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-200",
                ].join(" ")}
              />
              {errors.firstName && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={12} /> {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value });
                  if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                }}
                placeholder="Ej: González"
                className={[
                  "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all",
                  errors.lastName
                    ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                    : "border-slate-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-200",
                ].join(" ")}
              />
              {errors.lastName && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={12} /> {errors.lastName}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Número de Teléfono *</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => {
                  setFormData({ ...formData, phoneNumber: e.target.value });
                  if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined });
                }}
                placeholder="Ej: +58 412-555-0101"
                className={[
                  "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all",
                  errors.phoneNumber
                    ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                    : "border-slate-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-200",
                ].join(" ")}
              />
              {errors.phoneNumber && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={12} /> {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
