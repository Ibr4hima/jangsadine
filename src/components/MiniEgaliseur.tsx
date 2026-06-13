'use client'

// MiniÉgaliseur — réplique exacte de l'app (components/AudioUI.tsx)
// 5 barres, chacune avec sa séquence d'ondulation à 6 étapes.
// Les keyframes eqbar0..4 sont définies dans globals.css.

const DUREES = [1.7, 1.56, 1.59, 1.62, 1.65] // secondes (total des 6 étapes)

export default function MiniEgaliseur({ color = 'white' }: { color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 16 }}>
      {DUREES.map((d, i) => (
        <div
          key={i}
          style={{
            width: 2.5,
            borderRadius: 1.25,
            background: color,
            height: 2.5,
            animation: `eqbar${i} ${d}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}
