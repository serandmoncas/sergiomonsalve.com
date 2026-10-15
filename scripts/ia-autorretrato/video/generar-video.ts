/**
 * Video vertical 9:16 de «El camino hacia atrás», cuadro por cuadro con la misma
 * render(escena, t) del post (mecanismo de Claude Motion), más audio sintetizado.
 *
 * Uso: npx tsx scripts/ia-autorretrato/video/generar-video.ts [--idioma es|en] [--fps 30]
 * Requiere ffmpeg en el PATH y el Chromium de Playwright (`npx playwright install chromium`).
 * Salida (privada, ignorada por git): .ia-autorretrato/camino-hacia-atras-9x16-<idioma>.mp4
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { buildSync } from 'esbuild'
import { chromium } from 'playwright'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import en from '@/messages/en.json'
import es from '@/messages/es.json'
import { eventosDeSonido, sintetizarWav, type CuadroSonido } from './audio'

const PAUSA_FINAL = 3 // segundos sobre el último cuadro

const TEXTOS = {
  es: {
    marca: 'AUTORRETRATO CON IA', titulo: 'El camino hacia atrás', raices: 'raíces',
    hoy: 'Lo que uso hoy', sinFecha: 'Lo que no tiene fecha: los fundamentos',
    final: 'Todo esto, para llegar a hoy', aprendidoEn: 'Aprendido en',
    leyenda: '● en GitHub   ○ declarado   ◌ inferido',
    pie: 'Lo que tuve que aprender para llegar a mi stack de hoy',
  },
  en: {
    marca: 'A SELF-PORTRAIT WITH AI', titulo: 'The path backwards', raices: 'roots',
    hoy: 'What I use today', sinFecha: 'Undated: the foundations',
    final: 'All of this, to get to today', aprendidoEn: 'Learned in',
    leyenda: '● on GitHub   ○ self-reported   ◌ inferred',
    pie: 'What I had to learn to get to my stack today',
  },
}

function argumento(nombre: string, porDefecto: string): string {
  const i = process.argv.indexOf(`--${nombre}`)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : porDefecto
}

async function main() {
  const idioma = argumento('idioma', 'es') === 'en' ? 'en' : 'es'
  const fps = Number(argumento('fps', '30'))
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' })
  } catch {
    throw new Error('Falta ffmpeg en el PATH (macOS: brew install ffmpeg).')
  }

  const raiz = process.cwd()
  const dir = path.join(raiz, '.ia-autorretrato', 'video')
  const dirCuadros = path.join(dir, 'cuadros')
  fs.rmSync(dirCuadros, { recursive: true, force: true })
  fs.mkdirSync(dirCuadros, { recursive: true })

  console.log('1/4 Empaquetando la escena…')
  buildSync({
    entryPoints: [path.join(raiz, 'src/lib/ia-autorretrato/caminoEscena.ts')],
    bundle: true, format: 'iife', globalName: 'Escena', outfile: path.join(dir, 'escena.js'), logLevel: 'error',
  })
  const mensajes = (idioma === 'en' ? en : es).autorretrato
  const ui = { lang: idioma, ...TEXTOS[idioma], ramas: mensajes.ramas, fases: mensajes.camino.fases }
  fs.writeFileSync(path.join(dir, 'datos.js'), `window.CAMINO=${JSON.stringify(DATOS.camino)};window.UI=${JSON.stringify(ui)};`)
  fs.copyFileSync(path.join(raiz, 'scripts/ia-autorretrato/video/plantilla.html'), path.join(dir, 'index.html'))

  console.log('2/4 Dibujando cuadros…')
  const navegador = await chromium.launch()
  const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  await pagina.goto('file://' + path.join(dir, 'index.html'))
  const duracion: number = await pagina.evaluate(() => (window as unknown as { DURACION: number }).DURACION)
  const total = Math.round((duracion + PAUSA_FINAL) * fps) + 1
  const cuadros: CuadroSonido[] = []
  for (let i = 0; i < total; i++) {
    const t = Math.min(i / fps, duracion)
    const estado = await pagina.evaluate(tt => {
      const w = window as unknown as { dibujar: (t: number) => void; estado: (t: number) => { anio: number | null; fase: string } }
      w.dibujar(tt)
      return w.estado(tt)
    }, t)
    cuadros.push({ t: i / fps, ...estado })
    await pagina.screenshot({ path: path.join(dirCuadros, `${String(i).padStart(5, '0')}.png`) })
    if (i % (fps * 10) === 0) console.log(`   ${i}/${total}`)
  }
  await navegador.close()

  console.log('3/4 Sintetizando audio…')
  const wav = path.join(dir, 'audio.wav')
  fs.writeFileSync(wav, sintetizarWav(total / fps, eventosDeSonido(cuadros)))

  console.log('4/4 Codificando MP4…')
  const salida = path.join(raiz, '.ia-autorretrato', `camino-hacia-atras-9x16-${idioma}.mp4`)
  execFileSync('ffmpeg', [
    '-loglevel', 'error', '-y', '-framerate', String(fps), '-i', path.join(dirCuadros, '%05d.png'), '-i', wav,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow',
    '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', salida,
  ])
  fs.rmSync(dirCuadros, { recursive: true, force: true })
  console.log(`✓ ${path.relative(raiz, salida)} (${total} cuadros, ${(total / fps).toFixed(1)} s)`)
}

main().catch(e => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
