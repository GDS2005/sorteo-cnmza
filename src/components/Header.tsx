export default function Header() {
  return (
    <header className="bg-brand text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        <img src="/logo-mark.png" alt="" className="h-14 w-auto sm:h-16" />
        <img src="/logo-text.png" alt="Colegio Notarial de Mendoza" className="h-9 w-auto sm:h-11" />
        <p className="ml-auto hidden text-lg font-semibold sm:block">Sorteo</p>
      </div>
    </header>
  );
}
