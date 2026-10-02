import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import Header from "./components/Header";
import ImportPanel from "./components/ImportPanel";
import DrawPanel from "./components/DrawPanel";
import { HistoryList, RemainingList } from "./components/Lists";
import { pickWinners, randomInt } from "./lib/random";
import type { Round } from "./types";

const DRAW_MS = 6000;
const STORAGE_KEY = "colegio-notarial-raffle-v1";

function celebrateWinners() {
  const duration = 1800;
  const end = Date.now() + duration;
  const interval = window.setInterval(() => {
    const timeLeft = end - Date.now();
    if (timeLeft <= 0) {
      window.clearInterval(interval);
      return;
    }
    confetti({
      particleCount: 45 * (timeLeft / duration),
      spread: 70,
      startVelocity: 35,
      origin: { x: Math.random(), y: 0.6 },
      colors: ["#1d4ed8", "#16a34a", "#f59e0b", "#e11d48"],
      disableForReducedMotion: true,
    });
  }, 180);
}

interface RaffleState {
  original: string[];
  pool: string[];
  rounds: Round[];
  current: string[];
  alreadyWon: string[];
  count: number;
}

const EMPTY_STATE: RaffleState = { original: [], pool: [], rounds: [], current: [], alreadyWon: [], count: 1 };

function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>();
  return names.filter((name) => {
    const key = name.trim().replace(/\s+/g, " ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function readSavedState(): RaffleState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return EMPTY_STATE;
    const saved = value as Partial<RaffleState>;
    if (
      !Array.isArray(saved.original) || !saved.original.every((name) => typeof name === "string") ||
      !Array.isArray(saved.pool) || !saved.pool.every((name) => typeof name === "string") ||
      !Array.isArray(saved.rounds) || !Array.isArray(saved.current) || !saved.current.every((name) => typeof name === "string") ||
      !Array.isArray(saved.alreadyWon) || !saved.alreadyWon.every((name) => typeof name === "string") ||
      typeof saved.count !== "number" || !Number.isFinite(saved.count)
    ) return EMPTY_STATE;

    const original = uniqueNames(saved.original);
    const originalKeys = new Set(original.map((name) => name.toLowerCase()));
    const alreadyWon = uniqueNames(saved.alreadyWon).filter((name) => originalKeys.has(name.toLowerCase()));
    const wonKeys = new Set(alreadyWon.map((name) => name.toLowerCase()));
    const pool = uniqueNames(saved.pool).filter((name) => originalKeys.has(name.toLowerCase()) && !wonKeys.has(name.toLowerCase()));
    const rounds = saved.rounds.filter((round): round is Round =>
      !!round && typeof round === "object" && typeof round.id === "number" && typeof round.time === "string" &&
      Array.isArray(round.winners) && round.winners.every((name) => typeof name === "string"),
    ).map((round) => ({
      ...round,
      winners: uniqueNames(round.winners).filter((name) => originalKeys.has(name.toLowerCase())),
    }));
    const current = uniqueNames(saved.current).filter((name) => wonKeys.has(name.toLowerCase()));
    return { original, pool, rounds, current, alreadyWon, count: Math.max(1, Math.floor(saved.count)) };
  } catch {
    return EMPTY_STATE;
  }
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-brand-line bg-white p-4 shadow-sm">
      <p className="text-3xl font-bold text-brand">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

export default function App() {
  const [raffle, setRaffle] = useState<RaffleState>(readSavedState);
  const [drawing, setDrawing] = useState(false);
  const [ticker, setTicker] = useState("");

  const { original, pool, rounds, current, alreadyWon, count } = raffle;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(raffle));
    } catch {
      // Storage can be unavailable or full; the in-memory raffle remains usable.
    }
  }, [raffle]);

  const load = (names: string[]) => {
    const participants = uniqueNames(names);
    setRaffle({ ...EMPTY_STATE, original: participants, pool: participants });
  };
  const clearWinners = () => {
    if (drawing || current.length === 0 || !window.confirm("Are you sure you want to clear the current winners? They will remain excluded from future draws.")) return;
    setRaffle((state) => ({ ...state, current: [] }));
  };

  const reset = () => {
    if (drawing || !window.confirm("¿Reiniciar el sorteo? Se borrará el historial y se restaurará la lista original.")) return;
    setRaffle({ ...EMPTY_STATE, original, pool: original });
  };

  const newList = () => {
    if (drawing || !window.confirm("¿Cargar otra lista? Se descartará la sesión actual.")) return;
    setRaffle(EMPTY_STATE);
  };

  const draw = () => {
    if (drawing || count < 1 || count > pool.length) return;
    const winners = pickWinners(pool, count); // chosen once, from the current pool only
    const snapshot = pool;
    setDrawing(true); setRaffle((state) => ({ ...state, current: [] }));
    const tick = window.setInterval(() => setTicker(snapshot[randomInt(snapshot.length)]), 70);
    window.setTimeout(() => {
      window.clearInterval(tick);
      const won = new Set(winners);
      const left = snapshot.filter((n) => !won.has(n)); // winners leave the pool for good
      setRaffle((state) => ({
        ...state,
        pool: left,
        rounds: [...state.rounds, { id: state.rounds.length + 1, time: new Date().toLocaleTimeString("es-AR"), winners }],
        current: winners,
        alreadyWon: uniqueNames([...state.alreadyWon, ...winners]),
        count: Math.max(1, Math.min(state.count, left.length)),
      }));
      setDrawing(false);
      celebrateWinners();
    }, DRAW_MS);
  };

  const winnersTotal = alreadyWon.length;

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
            <DrawPanel available={pool.length} count={count} setCount={(value) => setRaffle((state) => ({ ...state, count: value }))} drawing={drawing} ticker={ticker} winners={current} onDraw={draw} onClearWinners={clearWinners} />
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
