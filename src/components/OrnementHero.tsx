'use client'
import { CSSProperties } from 'react'

// Ornement de héros : octogramme (rub-el-hizb ۞) en filigrane — deux carrés
// arrondis superposés à 45°, anneaux concentriques, rayons fins. Tourne de
// façon imperceptible (2,5 min/tour) : le fond respire sans distraire.
export default function OrnementHero({ taille = 230, opacite = 0.09, inverse = false, style }: {
  taille?: number; opacite?: number; inverse?: boolean; style?: CSSProperties
}) {
  const o = `rgba(255,255,255,${opacite})`
  const oFaible = `rgba(255,255,255,${opacite * 0.55})`
  return (
    <svg
      className={inverse ? 'ornement-hero ornement-hero-inverse' : 'ornement-hero'}
      width={taille} height={taille} viewBox="0 0 200 200" aria-hidden
      style={{ position: 'absolute', pointerEvents: 'none', ...style }}
    >
      <g fill="none">
        {/* octogramme : deux carrés arrondis à 45° */}
        <rect x="42" y="42" width="116" height="116" rx="20" stroke={o} strokeWidth="1.1" />
        <rect x="42" y="42" width="116" height="116" rx="20" stroke={o} strokeWidth="1.1" transform="rotate(45 100 100)" />
        {/* anneaux concentriques */}
        <circle cx="100" cy="100" r="38" stroke={oFaible} strokeWidth="0.9" />
        <circle cx="100" cy="100" r="78" stroke={oFaible} strokeWidth="0.7" strokeDasharray="1.5 7" />
        {/* pointes cardinales */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
          <line key={deg}
            x1="100" y1="14" x2="100" y2="24"
            stroke={oFaible} strokeWidth="1" strokeLinecap="round"
            transform={`rotate(${deg} 100 100)`}
          />
        ))}
        {/* cœur */}
        <circle cx="100" cy="100" r="4.5" fill={o} />
      </g>
    </svg>
  )
}
