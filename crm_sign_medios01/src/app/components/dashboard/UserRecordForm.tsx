import { useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import * as Label from "@radix-ui/react-label";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import type { UserRecord } from "./UserRecordManagement";

interface UserRecordFormProps {
  initialData?: UserRecord;
  onSubmit: (data: Omit<UserRecord, "id">) => void;
  onCancel: () => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  position?: string;
  assignedPhone?: string;
  deviceModel?: string;
  serialNumber?: string;
  serialNumber2?: string;
  username?: string;
  password?: string;
  role?: string;
  entryDate?: string;
}

export function UserRecordForm({ initialData, onSubmit, onCancel }: UserRecordFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    position: initialData?.position || "",
    assignedPhone: initialData?.assignedPhone || "",
    deviceModel: initialData?.deviceModel || "",
    deviceNumber: initialData?.deviceNumber || "",
    serialNumber: initialData?.serialNumber || "",
    serialNumber2: initialData?.serialNumber2 || "",
    username: initialData?.username || "",
    password: initialData?.password || "",
    role: initialData?.role || "Agente",
    photo: initialData?.photo || "",
    entryDate: initialData?.entryDate || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(initialData?.photo);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.username.trim() && !/^[a-zA-Z0-9]+$/.test(formData.username.trim())) {
      newErrors.username = "El nombre de usuario solo puede contener caracteres alfanuméricos";
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

        {/* Name */}
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

        {/* Last Name */}
        <div>
          <Label.Root htmlFor="lastName" className="text-sm font-semibold text-black">
            Apellidos
          </Label.Root>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, lastName: e.target.value }));
              setErrors((prev) => ({ ...prev, lastName: undefined }));
            }}
            placeholder="González Pérez"
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

        {/* Username */}
        <div>
          <Label.Root htmlFor="username" className="text-sm font-semibold text-black">
            Usuario
          </Label.Root>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, username: e.target.value }));
              setErrors((prev) => ({ ...prev, username: undefined }));
            }}
            placeholder="mgonzalez"
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

        {/* Password */}
        <div>
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
            placeholder="Pass@2026"
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

        {/* Role */}
        <div>
          <Label.Root htmlFor="role" className="text-sm font-semibold text-black">
            Rol
          </Label.Root>
          <Select.Root value={formData.role} onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}>
            <Select.Trigger className="mt-1.5 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-black outline-none transition-all duration-150 focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-500/15">
              <Select.Value />
              <Select.Icon>
                <ChevronDown size={16} className="text-gray-400" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-50 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <Select.Viewport>
                  <Select.Item value="Administrador" className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100">
                    <Select.ItemText>Administrador</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="Supervisor" className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100">
                    <Select.ItemText>Supervisor</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="Agente" className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100">
                    <Select.ItemText>Agente</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          {errors.role && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <span>•</span> {errors.role}
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

        {/* Entry Date */}
        <div>
          <Label.Root htmlFor="entryDate" className="text-sm font-semibold text-black">
            Fecha de Ingreso
          </Label.Root>
          <input
            id="entryDate"
            type="date"
            value={formData.entryDate}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, entryDate: e.target.value }));
              setErrors((prev) => ({ ...prev, entryDate: undefined }));
            }}
            className={[
              "mt-1.5 w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 text-sm text-black",
              "outline-none transition-all duration-150 focus:bg-white focus:ring-3",
              errors.entryDate
                ? "border-red-400 focus:border-red-500 focus:ring-red-400/15"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/15",
            ].join(" ")}
          />
          {errors.entryDate && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <span>•</span> {errors.entryDate}
            </p>
          )}
        </div>

        {/* Assigned Phone */}
        <div>
          <Label.Root htmlFor="assignedPhone" className="text-sm font-semibold text-black">
            Teléfono Asignado
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


        {/* Serial Number 1 */}
        <div>
          <Label.Root htmlFor="serialNumber" className="text-sm font-semibold text-black">
            Número de Serie 1
          </Label.Root>
          <input
            id="serialNumber"
            type="text"
            value={formData.serialNumber}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                serialNumber: e.target.value.toUpperCase(),
              }));
              setErrors((prev) => ({ ...prev, serialNumber: undefined }));
            }}
            placeholder="F2KXH9MNPQ3L"
            className={[
              "mt-1.5 w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 font-mono text-sm font-semibold text-black placeholder:text-gray-400",
              "outline-none transition-all duration-150 focus:bg-white focus:ring-3",
              errors.serialNumber
                ? "border-red-400 focus:border-red-500 focus:ring-red-400/15"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/15",
            ].join(" ")}
          />
          {errors.serialNumber && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <span>•</span> {errors.serialNumber}
            </p>
          )}
        </div>

        {/* Serial Number 2 */}
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
            placeholder="SN2-001-AA"
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
