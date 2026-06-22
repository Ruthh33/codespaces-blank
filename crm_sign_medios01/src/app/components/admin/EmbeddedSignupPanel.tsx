import React, { useState } from "react";
import { Camera, Play, RotateCcw, FileText } from "lucide-react";
import FBL4BLauncher from "./Fbl4bLauncher";
import type { SessionInfo } from "../../types/SessionInfo";
import type { UserRecord } from "../dashboard/UserRecordManagement";

type OnboardClient = {
  id: string;
  companyName: string;
  wabaId: string;
  phone: string;
  pages: string[];
  status: "pending" | "registered" | "error";
  notes?: string;
};

const mockClients: OnboardClient[] = [
  {
    id: "c1",
    companyName: "ACME S.A.",
    wabaId: "123456789",
    phone: "+5215512345678",
    pages: ["ACME Page"],
    status: "registered",
  },
  {
    id: "c2",
    companyName: "Servicios XYZ",
    wabaId: "987654321",
    phone: "+5215587654321",
    pages: ["XYZ Page", "XYZ Support"],
    status: "pending",
  },
  {
    id: "c3",
    companyName: "MiTienda",
    wabaId: "555555555",
    phone: "+5215524681357",
    pages: [],
    status: "error",
    notes: "Webhook subscription failed: 403",
  },
];

export default function EmbeddedSignupPanel() {
  const [clients, setClients] = useState<OnboardClient[]>(mockClients);
  const [selectedClient, setSelectedClient] = useState<OnboardClient | null>(null);
  const [showLauncher, setShowLauncher] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<unknown | null>(null);
  const [events, setEvents] = useState<Array<any>>([]);
  const [polling, setPolling] = useState(false);

  function retryRegistration(id: string) {
    console.log("retry", id);
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "pending", notes: undefined } : c))
    );
  }

  function openOnboarding(id: string) {
    console.log("open onboarding for", id);
    // Aquí se integraría `Fbl4bLauncher` para iniciar el flujo embebido
    const c = clients.find((x) => x.id === id) || null;
    setSelectedClient(c);
    setShowLauncher(true);
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Embedded Signup — Panel Administrativo</h2>
      <p className="mt-1 text-sm text-slate-600">Lista de clientes onboarded y estado.</p>

      <div className="mt-4 overflow-hidden rounded-md border">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-600">
            <tr>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">WABA</th>
              <th className="px-3 py-2">Teléfono</th>
              <th className="px-3 py-2">Páginas</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-slate-100">
                      <Camera className="m-1" />
                    </div>
                    <div>
                      <div className="font-semibold">{c.companyName}</div>
                      {c.notes && <div className="text-xs text-red-600">{c.notes}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">{c.wabaId}</td>
                <td className="px-3 py-2">{c.phone}</td>
                <td className="px-3 py-2">{c.pages.join(", ") || "(sin páginas)"}</td>
                <td className="px-3 py-2">
                  {c.status === "registered" ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">Registrado</span>
                  ) : c.status === "pending" ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">Pendiente</span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">Error</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openOnboarding(c.id)}
                      className="rounded-md border px-2 py-1 text-xs"
                    >
                      <Play className="inline-block mr-1" />
                      Abrir Onboarding
                    </button>
                    <button
                      onClick={() => retryRegistration(c.id)}
                      className="rounded-md border px-2 py-1 text-xs"
                    >
                      <RotateCcw className="inline-block mr-1" />
                      Reintentar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClient(c);
                        setShowLauncher(false);
                      }}
                      className="rounded-md border px-2 py-1 text-xs"
                    >
                      <FileText className="inline-block mr-1" />
                      Ver Logs
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedClient && showLauncher && (
        <div className="mt-4 rounded-md border bg-white p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Onboarding — {selectedClient.companyName}</h3>
            <button
              className="text-sm text-slate-600"
              onClick={() => {
                setSelectedClient(null);
                setShowLauncher(false);
                setBannerMessage(null);
              }}
            >
              Cerrar
            </button>
          </div>

          <div className="mt-3">
            {bannerMessage && <div className="mb-2 text-sm text-slate-700">{bannerMessage}</div>}
            <FBL4BLauncher
              appId={import.meta.env.VITE_FACEBOOK_APP_ID || ''}
              esConfig={import.meta.env.VITE_ES_CONFIG || '{}'}
              onClickFbl4b={() => false}
              onBannerInfoChange={(s) => setBannerMessage(s)}
              onLastEventDataChange={(d) => setLastEvent(d)}
              onSaveToken={async (code: string, sessionInfo: SessionInfo) => {
                try {
                  setBannerMessage('Enviando token al backend...');
                  const resp = await fetch('/api/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, sessionInfo }),
                  });
                  const json = await resp.json();
                  if (!resp.ok) throw new Error(JSON.stringify(json));
                  if (selectedClient) {
                    setClients((prev) =>
                      prev.map((p) => (p.id === selectedClient.id ? { ...p, status: 'registered' } : p))
                    );
                  }
                  setBannerMessage('Token registrado correctamente');
                } catch (err) {
                  console.error(err);
                  setBannerMessage('Error registrando token');
                } finally {
                  setShowLauncher(false);
                }
              }}
            />
          </div>
        </div>
      )}

      {selectedClient && !showLauncher && (
        <div className="mt-4 rounded-md border bg-white p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Logs — {selectedClient.companyName}</h3>
            <button className="text-sm text-slate-600" onClick={() => setSelectedClient(null)}>
              Cerrar
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-700">(Historial de webhooks y acciones aparecerá aquí)</div>
        </div>
      )}

      <div className="mt-6 rounded-md border bg-white p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Eventos de Webhook</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const r = await fetch('/api/webhooks/events');
                const j = await r.json();
                setEvents(j.events || []);
              }}
              className="rounded-md border px-2 py-1 text-xs"
            >
              Refrescar
            </button>
            <button
              onClick={() => setPolling((p) => !p)}
              className="rounded-md border px-2 py-1 text-xs"
            >
              {polling ? 'Detener polling' : 'Iniciar polling'}
            </button>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-700">
          <div className="max-h-48 overflow-auto">
            {events.length === 0 ? (
              <div className="text-slate-500">No hay eventos recibidos aún.</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="text-slate-600">
                  <tr>
                    <th className="px-2 py-1 text-left">Recibido</th>
                    <th className="px-2 py-1 text-left">Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-2 py-1 align-top">{e.receivedAt}</td>
                      <td className="px-2 py-1">
                        <pre className="whitespace-pre-wrap break-words text-[11px]">{JSON.stringify(e.payload, null, 2)}</pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
