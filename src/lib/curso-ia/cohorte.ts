// Configuración de la cohorte del curso gratuito de IA de diciembre.
// Es la única fuente de las fechas, el cupo, el cierre y el WhatsApp público.

export type SessionTopic = 's1' | 's2' | 's3' | 's4'

export const COHORTE = {
  slug: 'ia-diciembre-2026',
  capacity: 20,
  // 9 dic 2026 a las 19:00 en Colombia (UTC−5) = medianoche UTC del 10 dic.
  closesAt: new Date('2026-12-10T00:00:00Z'),
  sessions: [
    { date: '2026-12-09', topicKey: 's1' },
    { date: '2026-12-10', topicKey: 's2' },
    { date: '2026-12-14', topicKey: 's3' },
    { date: '2026-12-15', topicKey: 's4' }
  ] as { date: string; topicKey: SessionTopic }[],
  startTime: '19:00',
  endTime: '20:30',
  // ID del video de invitación en YouTube. null mientras no exista: la página oculta la sección.
  youtubeId: null as string | null,
  whatsapp: {
    display: '+57 323 910 5762',
    url: 'https://wa.me/573239105762'
  }
} as const

export function isClosed(now: Date): boolean {
  return now.getTime() >= COHORTE.closesAt.getTime()
}
