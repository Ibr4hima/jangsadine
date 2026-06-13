'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  texte: string
  style?: React.CSSProperties
}

// Réplique de TextTicker (app) : boucle continue sans rebond,
// espace de répétition (repeatSpacer) et délai initial (marqueeDelay).
const SPACER = 60        // px entre les deux copies
const SPEED = 40         // px/s — allure modérée (≈ scrollSpeed 18 de l'app)
const DELAI = 2.5        // s avant le démarrage (marqueeDelay)

export default function TitreDefilant({ texte, style }: Props) {
  const conteneurRef = useRef<HTMLDivElement>(null)
  const mesureRef = useRef<HTMLSpanElement>(null)
  const [largeur, setLargeur] = useState(0)
  const [depasse, setDepasse] = useState(false)

  useEffect(() => {
    const c = conteneurRef.current
    const m = mesureRef.current
    if (!c || !m) return
    const w = m.scrollWidth
    setLargeur(w)
    setDepasse(w > c.clientWidth + 1)
  }, [texte])

  const distance = largeur + SPACER
  const duree = distance / SPEED

  return (
    <div ref={conteneurRef} style={{ overflow: 'hidden', whiteSpace: 'nowrap', ...style }}>
      {/* mesure invisible (toujours présente pour recalculer si le texte change) */}
      <span ref={mesureRef} style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
        {texte}
      </span>

      {depasse ? (
        <div
          style={{
            display: 'inline-flex',
            willChange: 'transform',
            animation: `tick-defilement ${duree}s linear ${DELAI}s infinite`,
            ['--shift' as keyof React.CSSProperties as string]: `-${distance}px`,
          }}
        >
          <span>{texte}</span>
          <span style={{ paddingLeft: SPACER }}>{texte}</span>
        </div>
      ) : (
        <span style={{ display: 'inline-block' }}>{texte}</span>
      )}
    </div>
  )
}
