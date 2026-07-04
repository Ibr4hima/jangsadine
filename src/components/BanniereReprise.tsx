'use client'
import { useAudio } from '@/contexts/AudioContext'
import { useEffect, useState } from 'react'
import TitreDefilant from './TitreDefilant'

export default function BanniereReprise() {
  const { jouer } = useAudio()
  const [piste, setPiste] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const p = localStorage.getItem('derniere_piste')
    if (p) {
      setPiste(JSON.parse(p))
      setVisible(true)
    }
  }, [])

  function reprendre() {
    if (!piste) return
    jouer(piste)
    fermer()
  }

  function fermer() {
    setVisible(false)
    localStorage.removeItem('derniere_piste')
  }

  if (!visible || !piste) return null

  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--bleu)', borderRadius: '16px', padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: '14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)', zIndex: 150,
      maxWidth: '90vw', width: '480px', border: '1px solid rgba(214,173,58,0.3)'
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '11px', color: 'var(--or)', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Reprendre l'écoute</p>
        <TitreDefilant texte={piste.titre} style={{ fontSize: '13px', color: 'white', fontWeight: 600 }} />
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{piste.sheikh}</p>
      </div>
      <button onClick={reprendre} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z" />
        </svg>
        Continuer
      </button>
      <button onClick={fermer} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '18px', padding: '0', flexShrink: 0 }}>
        ✕
      </button>
    </div>
  )
}