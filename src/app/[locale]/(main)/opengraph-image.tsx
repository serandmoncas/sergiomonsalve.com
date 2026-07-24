import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

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
        padding: '80px',
      }}
    >
      <div style={{ color: '#555555', fontFamily: 'monospace', fontSize: 20, marginBottom: 24 }}>
        // AI Software Engineer
      </div>
      <div style={{ color: '#ffffff', fontFamily: 'sans-serif', fontSize: 80, fontWeight: 800, lineHeight: 1.05, marginBottom: 32 }}>
        Sergio{'\n'}Monsalve
      </div>
      <div style={{ color: '#00ff88', fontFamily: 'monospace', fontSize: 22 }}>
        sergiomonsalve.com
      </div>
    </div>,
    { ...size }
  )
}
