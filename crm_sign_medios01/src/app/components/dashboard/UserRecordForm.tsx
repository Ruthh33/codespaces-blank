import { useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import * as Label from "@radix-ui/react-label";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import type { UserRecord } from "./UserRecordManagement";

export type UserRecordFormData = Omit<UserRecord, "id">;

interface UserRecordFormProps {
  initialData?: UserRecord;
  onSubmit: (data: UserRecordFormData) => void;
  onCancel: () => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  position?: string;
  assignedPhone?: string;
  deviceModel?: string;
  serialNumber1?: string;
  serialNumber2?: string;
  entryDate?: string;
  username?: string;
  password?: string;
}

export function UserRecordForm({ initialData, onSubmit, onCancel }: UserRecordFormProps) {
  const isCreateMode = !initialData;

  const [formData, setFormData] = useState<UserRecordFormData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    position: initialData?.position || "",
    assignedPhone: initialData?.assignedPhone || "",
    deviceModel: initialData?.deviceModel || "",
    deviceNumber: initialData?.deviceNumber || "",
    serialNumber1: initialData?.serialNumber1 || "",
    serialNumber2: initialData?.serialNumber2 || "",
    photo: initialData?.photo || "",
    entryDate: initialData?.entryDate || "",
    role: initialData?.role || "Agente",
    username: initialData?.username || "",
    password: initialData?.password || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(initialData?.photo);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio.";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio.";
    }
    if (!formData.serialNumber1.trim()) {
      newErrors.serialNumber1 = "El número de serie 1 es obligatorio.";
    }

    if (isCreateMode && (formData.role === "Administrador" || formData.role === "Supervisor")) {
      if (!formData.username.trim()) {
        newErrors.username = "El nombre de usuario es obligatorio para este rol.";
      }
      if (!formData.password) {
        newErrors.password = "La contraseña es obligatoria para este rol.";
      } else if (formData.password.length < 6) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setFormData((prev) => ({ ...prev, photo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    setPhotoPreview(undefined);
    setFormData((prev) => ({ ...prev, photo: "" }));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="grid gap-5 md:grid-cols-2">
        {/* Photo Upload */}
        <div className="md:col-span-2">
          <Label.Root className="text-sm font-semibold text-black">Foto de Perfil</Label.Root>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
              {photoPreview ? (
                <>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white shadow-lg transition-colors hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <Camera size={32} className="text-slate-400" />
              )}
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50">
              <Upload size={16} />
              Subir Imagen
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* First and Last Name */}
        <div>
          <Label.Root htmlFor="firstName" className="text-sm font-semibold text-black">
            Nombre
          </Label.Root>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, firstName: e.target.value }));
              setErrors((prev) => ({ ...prev, firstName: undefined }));
            }}
            placeholder="María"
            className={[
              "mt-1.5 w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 text-sm text-black placeholder:text-gray-400",
              "outline-none transition-all duration-150 focus:bg-white focus:ring-3",
              errors.firstName
                ? "border-red-400 focus:border-red-500 focus:ring-red-400/15"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/15",
            ].join(" ")}
          />
          {errors.firstName && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <span>•</span> {errors.firstName}
            </p>
          )}
        </div>

        <div>
          <Label.Root htmlFor="lastName" className="text-sm font-semibold text-black">
            Apellido
          </Label.Root>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, lastName: e.target.value }));
              setErrors((prev) => ({ ...prev, lastName: undefined }));
            }}
            placeholder="González"
            className={[
              "mt-1.5 w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 text-sm text-black placeholder:text-gray-400",
              "outline-none transition-all duration-150 focus:bg-white focus:ring-3",
              errors.lastName
                ? "border-red-400 focus:border-red-500 focus:ring-red-400/15"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/15",
            ].join(" ")}
          />
          {errors.lastName && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <span>•</span> {errors.lastName}
            </p>
          )}
        </div>

        {/* Position (now text input) */}
        <div>
          <Label.Root className="text-sm font-semibold text-black">Cargo</Label.Root>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, position: e.target.value }));
              setErrors((prev) => ({ ...prev, position: undefined }));
            }}
            placeholder="Ejecutivo de Ventas"
            className={[
              "mt-1.5 w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 text-sm text-black placeholder:text-gray-400",
              "outline-none transition-all duration-150 focus:bg-white focus:ring-3",
              errors.position
                ? "border-red-400 focus:border-red-500 focus:ring-red-400/15"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/15",
            ].join(" ")}
          />
        </div>

        {/* Role */}
        <div>
          <Label.Root className="text-sm font-semibold text-black">Rol</Label.Root>
          <Select.Root
            value={formData.role}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, role: value as UserRecord["role"] }))
            }
          >
            <Select.Trigger className="mt-1.5 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-all duration-150 focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-500/15">
              <Select.Value />
              <Select.Icon>
                <ChevronDown size={18} />
              </Select.Icon>
            </Select.Trigger>
            <Select.Content
              className="z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
              position="popper"
              side="bottom"
              align="start"
            >
              <Select.Viewport className="p-1">
                {[
                  "Administrador",
                  "Supervisor",
                  "Agente",
                  "Suspendido",
                ].map((option) => (
                  <Select.Item
                    key={option}
                    value={option}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-slate-700 outline-none aria-selected:bg-slate-100 aria-selected:text-slate-900 hover:bg-slate-50"
                  >
                    <Select.ItemText>{option}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Root>
        </div>

        {isCreateMode && (formData.role === "Administrador" || formData.role === "Supervisor") && (
          <>
            <div className="md:col-span-2">
              <Label.Root htmlFor="username" className="text-sm font-semibold text-black">
                Nombre de Usuario
              </Label.Root>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, username: e.target.value }));
                  setErrors((prev) => ({ ...prev, username: undefined }));
                }}
                placeholder="adminnuevo"
                className={[
                  "mt-1.5 w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 text-sm text-black placeholder:text-gray-400",
                  "outline-none transition-all duration-150 focus:bg-white focus:ring-3",
                  errors.username
                    ? "border-red-400 focus:border-red-500 focus:ring-red-400/15"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/15",
                ].join(" ")}
              />
              {errors.username && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <span>•</span> {errors.username}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label.Root htmlFor="password" className="text-sm font-semibold text-black">
                Contraseña
              </Label.Root>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, password: e.target.value }));
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Contraseña segura"
                className={[
                  "mt-1.5 w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 text-sm text-black placeholder:text-gray-400",
                  "outline-none transition-all duration-150 focus:bg-white focus:ring-3",
                  errors.password
                    ? "border-red-400 focus:border-red-500 focus:ring-red-400/15"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/15",
                ].join(" ")}
              />
              {errors.password && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <span>•</span> {errors.password}
                </p>
              )}
            </div>
          </>
        )}

        {/* Entry Date */}
        <div>
          <Label.Root htmlFor="entryDate" className="text-sm font-semibold text-black">
            Fecha de Ingreso
          </Label.Root>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                id="entryDate"
                className={[
                  "mt-1.5 w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 text-left text-sm text-black",
                  "outline-none transition-all duration-150 focus:bg-white focus:ring-3",
                  errors.entryDate
                    ? "border-red-400 focus:border-red-500 focus:ring-red-400/15"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/15",
                ].join(" ")}
              >
                {formData.entryDate
                  ? new Intl.DateTimeFormat("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(formData.entryDate))
                  : "Selecciona una fecha"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="mt-1">
              <Calendar
                mode="single"
                selected={formData.entryDate ? new Date(formData.entryDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    setFormData((prev) => ({
                      ...prev,
                      entryDate: date.toISOString().slice(0, 10),
                    }));
                    setErrors((prev) => ({ ...prev, entryDate: undefined }));
                    setIsCalendarOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.entryDate && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <span>•</span> {errors.entryDate}
            </p>
          )}
        </div>

        {/* Assigned Phone */}
        <div>
          <Label.Root htmlFor="assignedPhone" className="text-sm font-semibold text-black">
            Teléfono
          </Label.Root>
          <input
            id="assignedPhone"
            type="tel"
            value={formData.assignedPhone}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, assignedPhone: e.target.value }));
              setErrors((prev) => ({ ...prev, assignedPhone: undefined }));
            }}
            placeholder="+58 412-1234567"
            className={[
              "mt-1.5 w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 text-sm text-black placeholder:text-gray-400",
              "outline-none transition-all duration-150 focus:bg-white focus:ring-3",
              errors.assignedPhone
                ? "border-red-400 focus:border-red-500 focus:ring-red-400/15"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/15",
            ].join(" ")}
          />
          {errors.assignedPhone && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <span>•</span> {errors.assignedPhone}
            </p>
          )}
        </div>

        {/* Device Model */}
        <div>
          <Label.Root htmlFor="deviceModel" className="text-sm font-semibold text-black">
            Modelo de Dispositivo
          </Label.Root>
          <input
            id="deviceModel"
            type="text"
            value={formData.deviceModel}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, deviceModel: e.target.value }));
              setErrors((prev) => ({ ...prev, deviceModel: undefined }));
            }}
            placeholder="iPhone 14 Pro"
            className={[
              "mt-1.5 w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 text-sm text-black placeholder:text-gray-400",
              "outline-none transition-all duration-150 focus:bg-white focus:ring-3",
              errors.deviceModel
                ? "border-red-400 focus:border-red-500 focus:ring-red-400/15"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/15",
            ].join(" ")}
          />
          {errors.deviceModel && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <span>•</span> {errors.deviceModel}
            </p>
          )}
        </div>


        {/* Número de Serie 1 */}
        <div>
          <Label.Root htmlFor="serialNumber1" className="text-sm font-semibold text-black">
            Número de Serie 1
          </Label.Root>
          <input
            id="serialNumber1"
            type="text"
            value={formData.serialNumber1}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                serialNumber1: e.target.value.toUpperCase(),
              }));
              setErrors((prev) => ({ ...prev, serialNumber1: undefined }));
            }}
            placeholder="F2KXH9MNPQ3L"
            className={[
              "mt-1.5 w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 font-mono text-sm font-semibold text-black placeholder:text-gray-400",
              "outline-none transition-all duration-150 focus:bg-white focus:ring-3",
              errors.serialNumber1
                ? "border-red-400 focus:border-red-500 focus:ring-red-400/15"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/15",
            ].join(" ")}
          />
          {errors.serialNumber1 && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <span>•</span> {errors.serialNumber1}
            </p>
          )}
        </div>

        {/* Número de Serie 2 */}
        <div>
          <Label.Root htmlFor="serialNumber2" className="text-sm font-semibold text-black">
            Número de Serie 2
          </Label.Root>
          <input
            id="serialNumber2"
            type="text"
            value={formData.serialNumber2}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                serialNumber2: e.target.value.toUpperCase(),
              }));
              setErrors((prev) => ({ ...prev, serialNumber2: undefined }));
            }}
            placeholder="F2KXH9MNPQ3L"
            className={[
              "mt-1.5 w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 font-mono text-sm font-semibold text-black placeholder:text-gray-400",
              "outline-none transition-all duration-150 focus:bg-white focus:ring-3",
              errors.serialNumber2
                ? "border-red-400 focus:border-red-500 focus:ring-red-400/15"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/15",
            ].join(" ")}
          />
          {errors.serialNumber2 && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <span>•</span> {errors.serialNumber2}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-[0.985]"
        >
          {initialData ? "Guardar Cambios" : "Crear Ficha"}
        </button>
      </div>
    </form>
  );
}
