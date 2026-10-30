// Silueta genérica de ave mientras la ilustración de la especie no está aprobada
export default function SiluetaPendiente({ nombre, texto }: { nombre: string; texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full h-full bg-surface text-text-muted">
      <svg viewBox="0 0 64 48" className="w-1/2 max-w-24 fill-current opacity-40" role="img" aria-label={nombre}>
        <path d="M8 30c6-1 11-5 14-10 3-6 9-10 16-10 5 0 9 3 10 7l8 2-8 3c0 9-7 16-17 17l4 7h-4l-4-7c-7-1-13-4-19-9z" />
      </svg>
      {texto && <span className="font-mono text-[10px] uppercase tracking-widest">{texto}</span>}
    </div>
  )
}
