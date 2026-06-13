'use client'
import MiniEgaliseur from './MiniEgaliseur'
import TitreDefilant from './TitreDefilant'
import { useAudio } from '@/contexts/AudioContext'
import { useState } from 'react'

const BLEU = '#2d578c'
const OR = '#d6ad3a'
const BG_BOT = '#1c3d66'

type Ep = { id: string; titre: string; url_audio: string; duree?: string }

function fmt(sec: number) {
  if (!sec || isNaN(sec)) return '0:00'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Lecteur inline — restylé au design de l'app (chapitres / markers compris).
export default function LecteurInline({ episodes, onJouerEp }: {
  episodes: Ep[]
  onJouerEp: (ep: Ep) => void
}) {
  const { piste, enLecture, progression, dureeTotal, toggleLecture, reculer, avancer, seeker, markerActuel, markers } = useAudio()
  const [chapitresOuverts, setChapitresOuverts] = useState(true)

  if (!piste || !episodes.some(e => e.id === piste.id)) return null

  const idx = episodes.findIndex(e => e.id === piste.id)
  const precedent = idx > 0 ? episodes[idx - 1] : null
  const suivant = idx < episodes.length - 1 ? episodes[idx + 1] : null
  const tempsActuel = (progression / 100) * dureeTotal
  const aMarkers = markers.length > 0

  return (
    <div style={{
      background: '#fff', borderRadius: 18, padding: 18, marginBottom: 20,
      boxShadow: '0 6px 20px rgba(58,74,92,0.08)',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', color: OR, textTransform: 'uppercase', margin: 0 }}>
        En cours d&apos;écoute
      </p>
      <TitreDefilant texte={piste.titre} style={{ fontSize: 14, fontWeight: 600, color: 'var(--texte)', marginTop: 4 }} />

      {/* pastille chapitre en cours (centrée, comme l'app) */}
      {markerActuel && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <div style={{
            maxWidth: '90%', display: 'flex', alignItems: 'center', gap: 6,
            background: '#eef3f9', border: '1px solid #dde7f1',
            borderRadius: 999, padding: '5px 13px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: OR, flexShrink: 0 }} />
            <TitreDefilant texte={markerActuel.titre} style={{ fontSize: 12, fontWeight: 600, color: BLEU, maxWidth: 280 }} />
          </div>
        </div>
      )}

      {/* barre de progression + ticks chapitres */}
      <div style={{ marginTop: 14, marginBottom: 6 }}>
        <div
          onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seeker(((e.clientX - r.left) / r.width) * 100) }}
          style={{ position: 'relative', height: 5, background: '#e6eaf0', borderRadius: 3, cursor: 'pointer' }}
        >
          <div style={{ width: progression + '%', height: '100%', background: BLEU, borderRadius: 3, transition: 'width 0.15s' }} />
          {aMarkers && dureeTotal > 0 && markers.map((m, i) => {
            const f = m.temps_secondes / dureeTotal
            if (f <= 0.005 || f >= 0.995) return null
            return (
              <div
                key={i}
                onClick={e => { e.stopPropagation(); seeker(f * 100) }}
                style={{
                  position: 'absolute', top: -1, bottom: -1, left: `${f * 100}%`,
                  width: 2.5, marginLeft: -1.25, borderRadius: 1,
                  background: markerActuel?.id === m.id ? OR : '#aebccd',
                  cursor: 'pointer', zIndex: 2,
                }}
              />
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aab4c0', marginBottom: 14, fontVariantNumeric: 'tabular-nums' }}>
        <span>{fmt(tempsActuel)}</span>
        <span>{dureeTotal > 0 ? fmt(dureeTotal) : (piste.duree || '...')}</span>
      </div>

      {/* contrôles */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <button onClick={() => precedent && onJouerEp(precedent)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: precedent ? 1 : 0.3, display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
        </button>
        <button onClick={reculer} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <img src="/icons/replay_10.svg" width="26" height="26" alt="" />
        </button>
        <button onClick={toggleLecture} style={{ width: 46, height: 46, borderRadius: 23, background: BLEU, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 8px rgba(45,87,140,0.35)' }}>
          {enLecture
            ? <div style={{ display: 'flex', gap: 4 }}><div style={{ width: 3.5, height: 16, background: '#fff', borderRadius: 2 }} /><div style={{ width: 3.5, height: 16, background: '#fff', borderRadius: 2 }} /></div>
            : <svg width="20" height="20" viewBox="0 -960 960 960"><path d="M320-200v-560l440 280-440 280Z" fill="#fff" /></svg>}
        </button>
        <button onClick={avancer} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <img src="/icons/forward_10.svg" width="26" height="26" alt="" />
        </button>
        <button onClick={() => suivant && onJouerEp(suivant)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: suivant ? 1 : 0.3, display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2v6z" /></svg>
        </button>
        {aMarkers && (
          <button onClick={() => setChapitresOuverts(o => !o)} style={{ background: chapitresOuverts ? '#e8f0f8' : 'none', border: 'none', cursor: 'pointer', color: chapitresOuverts ? BLEU : '#aab4c0', display: 'flex', padding: 6, borderRadius: 8 }}>
            <svg height="22" viewBox="0 -960 960 960" width="22" fill="currentColor"><path d="M360-240h440v-80H360v80Zm0-200h440v-80H360v80Zm0-200h440v-80H360v80ZM200-240q-17 0-28.5-11.5T160-280q0-17 11.5-28.5T200-320q17 0 28.5 11.5T240-280q0 17-11.5 28.5T200-240Zm0-200q-17 0-28.5-11.5T160-480q0-17 11.5-28.5T200-520q17 0 28.5 11.5T240-480q0 17-11.5 28.5T200-440Zm0-200q-17 0-28.5-11.5T160-680q0-17 11.5-28.5T200-720q17 0 28.5 11.5T240-680q0 17-11.5 28.5T200-640Z" /></svg>
          </button>
        )}
      </div>

      {/* liste des chapitres (style app : badge numéroté, durée / compte à rebours) */}
      {aMarkers && chapitresOuverts && (
        <div style={{ borderTop: '1px solid #eef1f6', marginTop: 16, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {markers.map((m, i) => {
            const actif = markerActuel?.id === m.id
            const debutSuivant = i < markers.length - 1 ? markers[i + 1].temps_secondes : dureeTotal
            const dureeChap = Math.max(0, debutSuivant - m.temps_secondes)
            const restant = Math.max(0, dureeChap - (tempsActuel - m.temps_secondes))
            return (
              <div
                key={m.id ?? i}
                onClick={() => dureeTotal > 0 && seeker((m.temps_secondes / dureeTotal) * 100)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '8px 8px', borderRadius: 12, cursor: 'pointer',
                  background: actif ? '#f5f9fe' : 'transparent',
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 15, flexShrink: 0,
                  background: actif ? OR : '#edf2f8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {actif && enLecture
                    ? <MiniEgaliseur color={BG_BOT} />
                    : <span style={{ fontSize: 11, fontWeight: 700, color: actif ? BG_BOT : '#7a869a', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <TitreDefilant texte={m.titre} style={{ fontSize: 13, fontWeight: actif ? 700 : 500, color: actif ? BLEU : 'var(--texte)' }} />
                </div>
                {dureeTotal > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: actif ? OR : '#aab4c0', fontVariantNumeric: 'tabular-nums' }}>
                    {actif ? `-${fmt(restant)}` : fmt(dureeChap)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
