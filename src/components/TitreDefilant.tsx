'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  texte: string
  style?: React.CSSProperties
}

export default function TitreDefilant({ texte, style }: Props) {
  const conteneurRef = useRef<HTMLDivElement>(null)
  const texteRef = useRef<HTMLSpanElement>(null)
  const [deborde, setDeborde] = useState(false)

  useEffect(() => {
    const conteneur = conteneurRef.current
    const texteEl = texteRef.current
    if (!conteneur || !texteEl) return
    setDeborde(texteEl.scrollWidth > conteneur.clientWidth)
  }, [texte])

  return (
    <div ref={conteneurRef} style={{ overflow: 'hidden', whiteSpace: 'nowrap', ...style }}>
      <span
        ref={texteRef}
        style={{
          display: 'inline-block',
          animation: deborde ? 'defilement-titre 12s linear infinite' : 'none',
          paddingRight: deborde ? '60px' : '0',
        }}
      >
        {texte}
      </span>
      <style>{`
        @keyframes defilement-titre {
          0%   { transform: translateX(0); }
          30%  { transform: translateX(0); }
          80%  { transform: translateX(-100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )
}