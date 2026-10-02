import { useEffect, useState } from "react";
import type { Round } from "../types";

export function RemainingList({ names }: { names: string[] }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  useEffect(() => {
    if (!copied) return;
    const timeoutId = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const copyRemaining = async () => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(names.join("\n"));
      setCopied(true);
    } catch {
      setCopied(false);
      setCopyError("No se pudieron copiar los participantes. Revisá los permisos del portapapeles del navegador.");
    }
  };

  return (
    <section className="rounded-xl border border-brand-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-brand">Participantes restantes <span className="font-normal text-slate-500">({names.length})</span></h2>
        <button onClick={copyRemaining} className="rounded-lg border border-brand px-4 py-2 font-semibold text-brand hover:bg-brand-soft">
          {copied ? "¡Copiado!" : "Copiar participantes restantes"}
        </button>
      </div>
      {copyError && <p role="alert" className="mt-2 text-sm text-red-700">{copyError}</p>}
      {names.length === 0 ? <p className="mt-3 text-slate-500">No quedan participantes.</p> : (
        <ol className="mt-3 max-h-80 list-decimal space-y-1 overflow-y-auto pl-10 pr-2 text-slate-700 marker:font-semibold marker:text-brand">
          {names.map((n) => <li key={n}>{n}</li>)}
        </ol>
      )}
    </section>
  );
}

export function HistoryList({ rounds }: { rounds: Round[] }) {
  const total = rounds.reduce((s, r) => s + r.winners.length, 0);
  return (
    <section className="rounded-xl border border-brand-line bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-brand">Historial de ganadores <span className="font-normal text-slate-500">({total})</span></h2>
      {rounds.length === 0 ? <p className="mt-3 text-slate-500">Todavía no se realizó ningún sorteo.</p> : (
        <ul className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-2">
          {[...rounds].reverse().map((r) => (
            <li key={r.id} className="rounded-lg bg-brand-soft p-3">
              <p className="text-sm font-semibold text-brand">Sorteo {r.id} · {r.time}</p>
              <p className="mt-1 text-slate-800">{r.winners.join(", ")}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
