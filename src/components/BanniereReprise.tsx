'use client'
import { useAudio } from '@/contexts/AudioContext'
import { useEffect, useState } from 'react'

export default function BanniereReprise() {
  const { jouer } = useAudio()
  const [piste, setPiste] = useState<any>(null)
  const [position, setPosition] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const p = localStorage.getItem('derniere_piste')
    const pos = localStorage.getItem('derniere_position')
    if (p) {
      setPiste(JSON.parse(p))
      setPosition(Number(pos) || 0)
      setVisible(true)
    }
  }, [])

  function reprendre() {
    if (!piste) return
    jouer(piste)
    // Attendre que l'audio charge puis seek
    setTimeout(() => {
      const audio = document.querySelector('audio') as HTMLAudioElement
      if (audio) audio.currentTime = position
    }, 1000)
    fermer()
  }

  function fermer() {
    setVisible(false)
    localStorage.removeItem('derniere_piste')
    localStorage.removeItem('derniere_position')
  }

  if (!visible || !piste) return null

  function formaterTemps(s: number) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    if (h > 0) return h + ':' + m.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0')
    return m + ':' + sec.toString().padStart(2, '0')
  }

  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
      background: '#1a1a2e', borderRadius: '16px', padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: '14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)', zIndex: 150,
      maxWidth: '90vw', width: '480px', border: '1px solid rgba(217,172,42,0.3)'
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '11px', color: 'var(--or)', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Reprendre l'écoute</p>
        <p style={{ fontSize: '13px', color: 'white', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{piste.titre}</p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{piste.sheikh} · {formaterTemps(position)}</p>
      </div>
      <button onClick={reprendre} style={{ background: 'var(--bleu)', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>
        ▶ Continuer
      </button>
      <button onClick={fermer} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '18px', padding: '0', flexShrink: 0 }}>
        ✕
      </button>
    </div>
  )
}