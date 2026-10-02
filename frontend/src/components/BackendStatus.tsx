"use client";

import { useEffect, useState } from "react";
import { checkBackendHealth } from "@/services/healthService";

type ConnectionState = "checking" | "online" | "offline";

const INDICATORS: Record<ConnectionState, { dot: string; label: string }> = {
  checking: { dot: "bg-slate-300 animate-pulse", label: "Checking backend..." },
  online: { dot: "bg-emerald-500", label: "Backend connected" },
  offline: { dot: "bg-red-500", label: "Backend unreachable" },
};

export default function BackendStatus() {
  const [state, setState] = useState<ConnectionState>("checking");

  useEffect(() => {
    checkBackendHealth()
      .then(() => setState("online"))
      .catch((error) => {
        console.error("Backend health check failed", error);
        setState("offline");
      });
  }, []);

  const { dot, label } = INDICATORS[state];
  return (
    <p
      role="status"
      className="flex items-center justify-center gap-2 text-xs text-slate-400"
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </p>
  );
}
