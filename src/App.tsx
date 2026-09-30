import { useState } from "react";
import Header from "./components/Header";
import ImportPanel from "./components/ImportPanel";
import DrawPanel from "./components/DrawPanel";
import { HistoryList, RemainingList } from "./components/Lists";
import { pickWinners, randomInt } from "./lib/random";
import type { Round } from "./types";

const DRAW_MS = 2800;

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-brand-line bg-white p-4 shadow-sm">
      <p className="text-3xl font-bold text-brand">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

export default function App() {
  const [original, setOriginal] = useState<string[]>([]); // list as imported
  const [pool, setPool] = useState<string[]>([]);         // still eligible (winners are removed)
  const [rounds, setRounds] = useState<Round[]>([]);      // session history
  const [current, setCurrent] = useState<string[]>([]);   // winners of the latest draw
  const [count, setCount] = useState(1);
  const [drawing, setDrawing] = useState(false);
  const [ticker, setTicker] = useState("");

  const load = (names: string[]) => { setOriginal(names); setPool(names); setRounds([]); setCurrent([]); setCount(1); };

  const reset = () => {
    if (drawing || !window.confirm("¿Reiniciar el sorteo? Se borrará el historial y se restaurará la lista original.")) return;
    load(original);
  };

  const newList = () => {
    if (drawing || !window.confirm("¿Cargar otra lista? Se descartará la sesión actual.")) return;
    setOriginal([]); setPool([]); setRounds([]); setCurrent([]);
  };

  const draw = () => {
    if (drawing || count < 1 || count > pool.length) return;
    const winners = pickWinners(pool, count); // chosen once, from the current pool only
    const snapshot = pool;
    setDrawing(true); setCurrent([]);
    const tick = window.setInterval(() => setTicker(snapshot[randomInt(snapshot.length)]), 70);
    window.setTimeout(() => {
      window.clearInterval(tick);
      const won = new Set(winners);
      const left = snapshot.filter((n) => !won.has(n)); // winners leave the pool for good
      setPool(left);
      setRounds((r) => [...r, { id: r.length + 1, time: new Date().toLocaleTimeString("es-AR"), winners }]);
      setCurrent(winners);
      setCount((c) => Math.max(1, Math.min(c, left.length)));
      setDrawing(false);
    }, DRAW_MS);
  };

  const winnersTotal = original.length - pool.length;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {original.length === 0 ? (
          <ImportPanel onLoad={load} />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="grid flex-1 grid-cols-3 gap-3 sm:max-w-xl">
                <Stat label="Participantes cargados" value={original.length} />
                <Stat label="Restantes" value={pool.length} />
                <Stat label="Ganadores" value={winnersTotal} />
              </div>
              <div className="flex gap-2">
                <button onClick={reset} disabled={drawing} className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-40">Reiniciar sorteo</button>
                <button onClick={newList} disabled={drawing} className="rounded-lg border border-brand px-4 py-2 font-semibold text-brand hover:bg-brand-soft disabled:opacity-40">Cargar otra lista</button>
              </div>
            </div>
            <DrawPanel available={pool.length} count={count} setCount={setCount} drawing={drawing} ticker={ticker} winners={current} onDraw={draw} />
            <div className="grid gap-6 md:grid-cols-2">
              <RemainingList names={pool} />
              <HistoryList rounds={rounds} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
