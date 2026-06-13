'use client'
import { ReactNode } from 'react'

// Héros dégradé identique à l'app (HerosDetail) :
// coins inférieurs arrondis + cercles décoratifs.
const BG_TOP = '#3d6ba3'
const BG_MID = '#2d578c'
const BG_BOT = '#234a7a'

export default function HeroDetail({ children, maxWidth = 640 }: { children: ReactNode; maxWidth?: number }) {
  return (
    <div style={{ position: 'relative', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_MID} 60%, ${BG_BOT} 100%)` }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(140,180,230,0.12)', top: -140, right: -100 }} />
      <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(214,173,58,0.06)', bottom: -80, left: -70 }} />
      <div style={{ position: 'relative', maxWidth, margin: '0 auto', padding: '20px 24px 28px' }}>
        {children}
      </div>
    </div>
  )
}
