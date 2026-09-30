import type { Round } from "../types";

export function RemainingList({ names }: { names: string[] }) {
  return (
    <section className="rounded-xl border border-brand-line bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-brand">Participantes restantes <span className="font-normal text-slate-500">({names.length})</span></h2>
      {names.length === 0 ? <p className="mt-3 text-slate-500">No quedan participantes.</p> : (
        <ol className="mt-3 max-h-80 list-decimal space-y-1 overflow-y-auto pl-6 pr-2 text-slate-700 marker:text-slate-400">
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
