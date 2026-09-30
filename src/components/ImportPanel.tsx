import { useMemo, useState } from "react";
import { csvToLines, parseParticipants } from "../lib/participants";

export default function ImportPanel({ onLoad }: { onLoad: (names: string[]) => void }) {
  const [text, setText] = useState("");
  const r = useMemo(() => parseParticipants(text), [text]);

  const onFile = async (file?: File) => {
    if (!file) return;
    const content = await file.text();
    setText(/\.csv$/i.test(file.name) ? csvToLines(content) : content);
  };

  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-brand-line bg-white p-5 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-brand">Cargar participantes</h2>
      <p className="mt-1 text-slate-600">Pegá un nombre por línea o subí un archivo CSV (se usa la primera columna). Los datos no salen de este navegador.</p>
      <textarea
        value={text} onChange={(e) => setText(e.target.value)} rows={10}
        placeholder={"María Fernández\nJuan Pérez\nLucía Gómez"}
        className="mt-4 w-full rounded-lg border border-slate-300 p-3 text-base"
        aria-label="Lista de participantes"
      />
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <span className="font-semibold text-brand">{r.names.length} válidos</span>
        {r.duplicates > 0 && <span className="text-amber-700">{r.duplicates} duplicados omitidos</span>}
        {r.empty > 0 && text.trim() !== "" && <span className="text-slate-500">{r.empty} líneas vacías omitidas</span>}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button disabled={r.names.length === 0} onClick={() => onLoad(r.names)}
          className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40">
          Cargar {r.names.length > 0 ? `${r.names.length} participantes` : "lista"}
        </button>
        <label className="cursor-pointer rounded-lg border border-brand px-6 py-3 font-semibold text-brand hover:bg-brand-soft">
          Subir archivo CSV o TXT
          <input type="file" accept=".csv,.txt,text/csv,text/plain" className="sr-only"
            onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
      </div>
    </section>
  );
}
