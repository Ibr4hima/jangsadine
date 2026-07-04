'use client'
import Link from 'next/link'
import { ReactNode } from 'react'

// Héros dégradé identique à l'app (HerosDetail) :
// coins inférieurs arrondis + cercles décoratifs.
const BG_TOP = '#3d6ba3'
const BG_MID = '#2d578c'
const BG_BOT = '#234a7a'

export default function HeroDetail({ children, maxWidth = 640, retour }: { children: ReactNode; maxWidth?: number; retour?: string }) {
  return (
    <div style={{ position: 'relative', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_MID} 60%, ${BG_BOT} 100%)` }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(140,180,230,0.12)', top: -140, right: -100 }} />
      <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(214,173,58,0.06)', bottom: -80, left: -70 }} />

      <div style={{ position: 'relative', maxWidth, margin: '0 auto', padding: '16px 24px 22px' }}>
        {retour && (
          <Link href={retour} aria-label="Retour" className="hero-retour" style={{
            position: 'absolute', left: 24, top: 20, zIndex: 3,
            width: 40, height: 40, borderRadius: 13,
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(10,25,50,0.18)', textDecoration: 'none',
          }}>
            <svg width="22" height="22" viewBox="0 -960 960 960"><path d="M561-240 320-481l241-241 43 43-198 198 198 198-43 43Z" fill="#fff" /></svg>
          </Link>
        )}
        {children}
      </div>

      <style>{`
        .hero-retour { transition: background 0.15s, transform 0.15s, box-shadow 0.15s; }
        .hero-retour:hover { background: rgba(255,255,255,0.2); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(10,25,50,0.24); }
      `}</style>
    </div>
  )
}
