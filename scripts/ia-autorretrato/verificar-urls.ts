/**
 * Comprueba que las URLs de contexto.json siguen vivas antes de publicar.
 * 403 se reporta como aviso (sitios que bloquean bots); 404/410/5xx fallan.
 * Uso: npx tsx scripts/ia-autorretrato/verificar-urls.ts
 */
import CONTEXTO from './contexto.json'

async function estado(url: string): Promise<number> {
  const cabeza = await fetch(url, { method: 'HEAD', redirect: 'follow' }).catch(() => null)
  if (cabeza && cabeza.status < 400) return cabeza.status
  const cuerpo = await fetch(url, { redirect: 'follow' }).catch(() => null)
  return cuerpo?.status ?? 0
}

async function main() {
  let fallo = false
  for (const d of CONTEXTO.datos) {
    const s = await estado(d.url)
    const marca = s >= 200 && s < 400 ? '✓' : s === 403 ? '⚠' : '✗'
    if (marca === '✗') fallo = true
    console.log(`${marca} ${s} ${d.fuente} — ${d.url}`)
  }
  process.exit(fallo ? 1 : 0)
}

main()
