interface Props {
  available: number; count: number; setCount: (n: number) => void;
  drawing: boolean; ticker: string; winners: string[]; onDraw: () => void;
}
const PRESETS = [1, 3, 5, 10];

export default function DrawPanel({ available, count, setCount, drawing, ticker, winners, onDraw }: Props) {
  const tooMany = count > available;
  return (
    <section className="rounded-xl border border-brand-line bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-brand">Sortear</h2>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-600">Cantidad de ganadores</p>
          <div className="flex flex-wrap items-center gap-2">
            {PRESETS.map((n) => (
              <button key={n} disabled={drawing} onClick={() => setCount(n)} aria-pressed={count === n}
                className={`h-11 w-11 rounded-lg border font-semibold ${count === n ? "border-brand bg-brand text-white" : "border-slate-300 hover:bg-brand-soft"}`}>
                {n}
              </button>
            ))}
            <input type="number" min={1} max={Math.max(available, 1)} value={count} disabled={drawing}
              onChange={(e) => setCount(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
              className="h-11 w-20 rounded-lg border border-slate-300 px-2 text-center" aria-label="Cantidad personalizada" />
          </div>
        </div>
        <button onClick={onDraw} disabled={drawing || tooMany || available === 0}
          className="h-11 rounded-lg bg-brand px-8 font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40">
          {drawing ? "Sorteando…" : "Sortear"}
        </button>
      </div>
      {tooMany && available > 0 && <p className="mt-2 text-sm text-red-700">Solo quedan {available} participantes: elegí {available} o menos.</p>}
      {available === 0 && !drawing && <p className="mt-2 text-sm text-red-700">No quedan participantes. Reiniciá el sorteo para volver a la lista original.</p>}

      <div className="mt-6 min-h-[11rem] rounded-xl bg-brand-soft p-4 sm:p-6" aria-live="polite">
        {drawing ? (
          <div className="flex h-36 flex-col items-center justify-center rounded-xl bg-brand text-center text-white">
            <p className="text-sm opacity-80">Sorteando {count} {count === 1 ? "ganador" : "ganadores"}…</p>
            <p className="mt-2 max-w-full truncate px-4 text-3xl font-bold sm:text-4xl">{ticker}</p>
          </div>
        ) : winners.length > 0 ? (
          <>
            <p className="mb-3 font-semibold text-brand">{winners.length === 1 ? "Ganador" : `${winners.length} ganadores`} de este sorteo</p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {winners.map((w, i) => (
                <li key={w} style={{ animationDelay: `${i * 120}ms` }}
                  className="animate-pop flex items-center gap-3 rounded-xl border-2 border-brand bg-white p-4 shadow">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-white">{i + 1}</span>
                  <span className="break-words text-lg font-bold text-brand-dark">{w}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="flex h-36 items-center justify-center text-center text-slate-500">Elegí la cantidad de ganadores y presioná Sortear.</p>
        )}
      </div>
    </section>
  );
}
