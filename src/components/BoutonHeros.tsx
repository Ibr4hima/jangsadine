'use client'
import { ReactNode } from 'react'

// Pastille du héros (BoutonHeros de l'app) : verre / or quand actif.
export default function BoutonHeros({ icone, label, onClick, href, actif }: {
  icone: ReactNode
  label: string
  onClick?: () => void
  href?: string
  actif?: boolean
}) {
  const style: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: actif ? 'rgba(214,173,58,0.28)' : 'rgba(255,255,255,0.10)',
    border: `1px solid ${actif ? 'rgba(214,173,58,0.6)' : 'rgba(255,255,255,0.14)'}`,
    borderRadius: 999, padding: '10px 16px',
    fontSize: 13, fontWeight: 600, color: '#fff',
    cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none',
  }
  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" style={style}>{icone}<span>{label}</span></a>
  }
  return <button onClick={onClick} style={style}>{icone}<span>{label}</span></button>
}
