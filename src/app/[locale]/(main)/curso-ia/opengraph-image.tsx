import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Empieza con IA sin pagar nada — curso gratuito en vivo'

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#0f0f0f',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px'
      }}
    >
      <div style={{ color: '#00ff88', fontFamily: 'monospace', fontSize: 26, marginBottom: 24 }}>
        {'//'} Curso gratuito · en vivo
      </div>
      <div style={{ color: '#ffffff', fontFamily: 'sans-serif', fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginBottom: 32 }}>
        Empieza con IA sin pagar nada
      </div>
      <div style={{ color: '#cccccc', fontFamily: 'sans-serif', fontSize: 34, marginBottom: 40 }}>
        9, 10, 14 y 15 dic · 7:00 p. m. · Cupo de 20
      </div>
      <div style={{ color: '#00ff88', fontFamily: 'monospace', fontSize: 24 }}>sergiomonsalve.com/curso-ia</div>
    </div>,
    { ...size }
  )
}
