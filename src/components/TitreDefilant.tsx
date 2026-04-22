'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  texte: string
  style?: React.CSSProperties
}

export default function TitreDefilant({ texte, style }: Props) {
  const conteneurRef = useRef<HTMLDivElement>(null)
  const texteRef = useRef<HTMLSpanElement>(null)
  const [translation, setTranslation] = useState(0)

  useEffect(() => {
    const conteneur = conteneurRef.current
    const texteEl = texteRef.current
    if (!conteneur || !texteEl) return
    const depasse = texteEl.scrollWidth - conteneur.clientWidth
    setTranslation(depasse > 0 ? depasse : 0)
  }, [texte])

  return (
    <div ref={conteneurRef} style={{ overflow: 'hidden', whiteSpace: 'nowrap', ...style }}>
      <span
        ref={texteRef}
        style={{
          display: 'inline-block',
          animation: translation > 0 ? 'defilement-titre 10s ease-in-out infinite' : 'none',
          ['--tx' as any]: `-${translation}px`,
        }}
      >
        {texte}
      </span>
      <style>{`
        @keyframes defilement-titre {
          0%   { transform: translateX(0); }
          20%  { transform: translateX(0); }
          50%  { transform: translateX(var(--tx)); }
          70%  { transform: translateX(var(--tx)); }
          95%  { transform: translateX(0); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}