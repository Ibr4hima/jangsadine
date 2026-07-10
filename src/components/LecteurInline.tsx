'use client'
import FondAurore from './FondAurore'
import MiniEgaliseur from './MiniEgaliseur'
import TitreDefilant from './TitreDefilant'
import { useAudio } from '@/contexts/AudioContext'
import { useCallback, useEffect, useRef, useState } from 'react'

// ─── palette : bleu du logo (identique au lecteur plein écran de l'app) ──
const BG_TOP = '#3d6ba3'
const BG_MID = '#2d578c'
const BG_BOT = '#1c3d66'
const OR = '#d6ad3a'
const W85 = 'rgba(255,255,255,0.85)'
const W60 = 'rgba(255,255,255,0.60)'
const W35 = 'rgba(255,255,255,0.35)'
const W15 = 'rgba(255,255,255,0.15)'
const W08 = 'rgba(255,255,255,0.08)'
const OR_DIM = 'rgba(214,173,58,0.22)'

const VITESSES = [1, 1.15, 1.25, 1.5, 2, 0.75]
const fmtVitesse = (v: number) => String(v).replace('.', ',')

type Ep = { id: string; titre: string; url_audio: string; duree?: string; sheikh?: string }

function fmt(sec: number) {
  if (!sec || isNaN(sec) || sec < 0) return '0:00'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

// ─── icônes (identiques à l'app) ─────────────────────────────
const Ico = ({ d, size = 24, color = '#fff' }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 -960 960 960"><path d={d} fill={color} /></svg>
)
const D_BACK = 'M339.5-108.5q-65.5-28.5-114-77t-77-114Q120-365 120-440h80q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440q0-117-81.5-198.5T480-720h-6l62 62-56 58-160-160 160-160 56 58-62 62h6q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-440q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-80q-75 0-140.5-28.5ZM360-320v-180h-60v-60h120v240h-60Zm140 0q-17 0-28.5-11.5T460-360v-160q0-17 11.5-28.5T500-560h80q17 0 28.5 11.5T620-520v160q0 17-11.5 28.5T580-320h-80Zm20-60h40v-120h-40v120Z'
const D_FWD = 'M360-320v-180h-60v-60h120v240h-60Zm140 0q-17 0-28.5-11.5T460-360v-160q0-17 11.5-28.5T500-560h80q17 0 28.5 11.5T620-520v160q0 17-11.5 28.5T580-320h-80Zm20-60h40v-120h-40v120ZM339.5-108.5q-65.5-28.5-114-77t-77-114Q120-365 120-440t28.5-140.5q28.5-65.5 77-114t114-77Q405-800 480-800h6l-62-62 56-58 160 160-160 160-56-58 62-62h-6q-117 0-198.5 81.5T200-440q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440h80q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-80q-75 0-140.5-28.5Z'
const D_PLAY = 'M320-200v-560l440 280-440 280Z'
const D_PAUSE = 'M555-200v-560h205v560H555Zm-355 0v-560h205v560H200Z'
const D_CHAPTERS = 'M120-80v-60h100v-30h-60v-60h60v-30H120v-60h160q17 0 28.5 11.5T320-280v40q0 17-11.5 28.5T280-200q17 0 28.5 11.5T320-160v40q0 17-11.5 28.5T280-80H120Zm0-280v-110q0-17 11.5-28.5T160-510h100v-30H120v-60h160q17 0 28.5 11.5T320-560v70q0 17-11.5 28.5T280-450h-100v30h140v60H120Zm60-280v-180h-60v-60h120v240h-60Zm180 440v-80h480v80H360Zm0-240v-80h480v80H360Zm0-240v-80h480v80H360Z'
const D_QUEUE = 'M360-200v-80h480v80H360Zm0-240v-80h480v80H360Zm0-240v-80h480v80H360ZM200-160q-33 0-56.5-23.5T120-240q0-33 23.5-56.5T200-320q33 0 56.5 23.5T280-240q0 33-23.5 56.5T200-160Zm0-240q-33 0-56.5-23.5T120-480q0-33 23.5-56.5T200-560q33 0 56.5 23.5T280-480q0 33-23.5 56.5T200-400Zm0-240q-33 0-56.5-23.5T120-720q0-33 23.5-56.5T200-800q33 0 56.5 23.5T280-720q0 33-23.5 56.5T200-640Z'
const D_VOL_UP = 'M560-131v-82q90-26 145-100t55-187q0-113-55-187T560-787v-82q124 28 202 125.5T840-500q0 127-78 224.5T560-131ZM120-360v-240h160l200-280v800L280-360H120Zm440 40v-362q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252Zm-36 126Z'
const D_VOL_MUTE = 'M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-500q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Zm-36-130Z'

// ─── barre de progression scrubbable (adaptation web du Progress de l'app) ──
function Progress({ tempsActuel, dureeTotal, onSeek, marks }: {
  tempsActuel: number; dureeTotal: number; onSeek: (pct: number) => void
  marks: number[]
}) {
  const barRef = useRef<HTMLDivElement>(null)
  const [scrub, setScrub] = useState<number | null>(null)
  const scrubbing = scrub !== null

  const pctDe = useCallback((clientX: number) => {
    const r = barRef.current?.getBoundingClientRect()
    if (!r || r.width === 0) return 0
    return clamp01((clientX - r.left) / r.width)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setScrub(pctDe(e.clientX))
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!scrubbing) return
    setScrub(pctDe(e.clientX))
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (!scrubbing) return
    const p = pctDe(e.clientX)
    setScrub(null)
    onSeek(p * 100)
  }

  const p = scrub ?? (dureeTotal > 0 ? tempsActuel / dureeTotal : 0)

  return (
    <div>
      {/* bulle de temps flottante pendant le scrub */}
      <div style={{ height: 18, position: 'relative' }}>
        <div style={{
          position: 'absolute', bottom: 2, left: `calc(${p * 100}% - 36px)`,
          width: 72, padding: '4px 0', borderRadius: 999,
          background: OR, textAlign: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          opacity: scrubbing ? 1 : 0,
          transform: scrubbing ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.7)',
          transition: 'opacity 0.15s, transform 0.15s',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: BG_BOT, fontVariantNumeric: 'tabular-nums' }}>
            {fmt(p * dureeTotal)}
          </span>
        </div>
      </div>

      <div
        ref={barRef}
        className="lct-barre"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setScrub(null)}
        style={{ height: 32, display: 'flex', alignItems: 'center', cursor: 'pointer', touchAction: 'none', position: 'relative' }}
      >
        <div style={{
          position: 'relative', width: '100%',
          height: scrubbing ? 12 : 5, borderRadius: 8,
          background: W15, overflow: 'hidden',
          transition: 'height 0.15s',
        }}>
          <div style={{
            width: `${p * 100}%`, height: '100%', borderRadius: 8,
            background: scrubbing ? OR : W85,
            transition: scrubbing ? 'none' : 'width 0.4s linear, background 0.2s',
          }} />
          {/* Encoches des chapitres */}
          {marks.map((m, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${m * 100}%`, top: 0, bottom: 0, width: 2.5,
              background: BG_BOT, opacity: 0.85,
            }} />
          ))}
        </div>
        {/* thumb doré */}
        <div className="lct-thumb" style={{
          position: 'absolute', left: `calc(${p * 100}% - 10px)`,
          width: 20, height: 20, borderRadius: 10,
          background: OR, border: '2.5px solid #fff',
          boxShadow: `0 0 8px ${OR}`,
          opacity: scrubbing ? 1 : undefined,
          transform: scrubbing ? 'scale(1)' : undefined,
          pointerEvents: 'none',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: -2, fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: scrubbing ? OR : W60, transition: 'color 0.2s' }}>{fmt(p * dureeTotal)}</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: W60 }}>{fmt(dureeTotal)}</span>
      </div>
    </div>
  )
}

// ─── Lecteur inline — adaptation web du lecteur plein écran de l'app ──
export default function LecteurInline({ episodes, onJouerEp }: {
  episodes: Ep[]
  onJouerEp: (ep: Ep) => void
}) {
  const { piste, enLecture, progression, dureeTotal, toggleLecture, reculer, avancer, seeker, markerActuel, markers } = useAudio()
  const [panel, setPanel] = useState<'none' | 'chapters' | 'queue'>('none')
  const [vitesse, setVitesse] = useState(1)
  const [muet, setMuet] = useState(false)
  const [skipAnim, setSkipAnim] = useState<{ sens: 1 | -1; n: number } | null>(null)

  // Vitesse et sourdine appliquées directement sur l'élément audio
  useEffect(() => {
    try {
      const v = parseFloat(localStorage.getItem('jsd_vitesse') || '1')
      if (VITESSES.includes(v)) setVitesse(v)
    } catch { }
  }, [])
  useEffect(() => {
    const a = document.getElementById('audio-principal') as HTMLAudioElement | null
    if (a) { a.playbackRate = vitesse; a.muted = muet }
  }, [vitesse, muet, piste?.id, enLecture])

  if (!piste || !episodes.some(e => e.id === piste.id)) return null

  const tempsActuel = (progression / 100) * dureeTotal
  const aMarkers = markers.length > 0
  const marksFractions = dureeTotal > 0
    ? markers.map(m => m.temps_secondes / dureeTotal).filter(f => f > 0.005 && f < 0.995)
    : []

  const cyclerVitesse = () => {
    const i = VITESSES.indexOf(vitesse)
    const v = VITESSES[(i + 1) % VITESSES.length]
    setVitesse(v)
    try { localStorage.setItem('jsd_vitesse', String(v)) } catch { }
  }

  const skip = (sens: 1 | -1) => {
    if (sens < 0) reculer(); else avancer()
    setSkipAnim(prev => ({ sens, n: (prev?.n ?? 0) + 1 }))
  }

  const tabs = [
    ...(aMarkers ? [{ id: 'chapters' as const, label: 'Chapitres', d: D_CHAPTERS }] : []),
    { id: 'queue' as const, label: 'Playlist', d: D_QUEUE },
  ]

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 24, marginBottom: 20,
      background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_MID} 50%, ${BG_BOT} 100%)`,
      boxShadow: '0 14px 34px rgba(28,61,102,0.30)',
    }}>
      <FondAurore />

      <div style={{ position: 'relative', padding: '18px 18px 12px' }}>

        {/* ── pochette + titre ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
            {/* halo doré qui respire pendant la lecture */}
            <div className={enLecture ? 'lct-aura lct-aura-active' : 'lct-aura'} style={{
              position: 'absolute', inset: -5, borderRadius: 20, background: OR,
            }} />
            <div style={{
              position: 'relative', width: 64, height: 64, borderRadius: 16,
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(10,27,48,0.45)',
            }}>
              <img src="/logo.png" alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <TitreDefilant texte={piste.titre} style={{ fontSize: 16, fontWeight: 700, color: '#fff' }} />
            {piste.sheikh && (
              <p style={{ fontSize: 12.5, color: W60, margin: '3px 0 0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{piste.sheikh}</p>
            )}
          </div>
        </div>

        {/* ── pastille chapitre en cours ── */}
        {markerActuel && panel === 'none' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: -4 }}>
            <button
              onClick={() => setPanel('chapters')}
              style={{
                maxWidth: '92%', display: 'flex', alignItems: 'center',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 999, padding: '5px 13px', cursor: 'pointer', overflow: 'hidden',
              }}
            >
              <TitreDefilant texte={markerActuel.titre} style={{ fontSize: 12, fontWeight: 600, color: W85, letterSpacing: '0.2px', maxWidth: 300 }} />
            </button>
          </div>
        )}

        {/* ── progression ── */}
        <div style={{ marginTop: 6 }}>
          <Progress
            tempsActuel={tempsActuel}
            dureeTotal={dureeTotal}
            onSeek={seeker}
            marks={marksFractions}
          />
        </div>

        {/* ── contrôles ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          {/* pilule vitesse */}
          <button onClick={cyclerVitesse} className="lct-tap" style={{
            width: 52, display: 'flex', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            <span style={{
              padding: '5px 9px', borderRadius: 999,
              background: vitesse !== 1 ? OR_DIM : W08,
              border: `1px solid ${vitesse !== 1 ? OR : W35}`,
              fontSize: 12, fontWeight: 700,
              color: vitesse !== 1 ? OR : W85,
            }}>
              ×{fmtVitesse(vitesse)}
            </span>
          </button>

          {/* -10 s */}
          <button onClick={() => skip(-1)} className="lct-tap" aria-label="Reculer de 10 secondes" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <span key={skipAnim?.sens === -1 ? skipAnim.n : 'idle-b'} className={skipAnim?.sens === -1 ? 'lct-skip-back' : undefined} style={{ display: 'flex' }}>
              <Ico d={D_BACK} size={34} />
            </span>
          </button>

          {/* play / pause — cercle blanc, halo pulsant, morphing */}
          <button onClick={toggleLecture} className="lct-tap" aria-label={enLecture ? 'Pause' : 'Lecture'} style={{
            position: 'relative', width: 72, height: 72,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div className={enLecture ? 'lct-glow lct-glow-active' : 'lct-glow'} style={{
              position: 'absolute', inset: 0, borderRadius: 36, background: '#fff',
            }} />
            <div style={{
              position: 'relative', width: 64, height: 64, borderRadius: 32,
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 16px rgba(255,255,255,0.25)',
            }}>
              <span style={{ position: 'relative', width: 30, height: 30 }}>
                <span style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  opacity: enLecture ? 0 : 1,
                  transform: enLecture ? 'rotate(90deg) scale(0.65)' : 'rotate(0deg) scale(1)',
                  transition: 'opacity 0.24s, transform 0.24s',
                }}>
                  <Ico d={D_PLAY} size={30} color={BG_MID} />
                </span>
                <span style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  opacity: enLecture ? 1 : 0,
                  transform: enLecture ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.65)',
                  transition: 'opacity 0.24s, transform 0.24s',
                }}>
                  <Ico d={D_PAUSE} size={30} color={BG_MID} />
                </span>
              </span>
            </div>
          </button>

          {/* +10 s */}
          <button onClick={() => skip(1)} className="lct-tap" aria-label="Avancer de 10 secondes" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <span key={skipAnim?.sens === 1 ? skipAnim.n : 'idle-f'} className={skipAnim?.sens === 1 ? 'lct-skip-fwd' : undefined} style={{ display: 'flex' }}>
              <Ico d={D_FWD} size={34} />
            </span>
          </button>

          {/* sourdine */}
          <button onClick={() => setMuet(m => !m)} className="lct-tap" aria-label={muet ? 'Rétablir le son' : 'Couper le son'} style={{
            width: 52, display: 'flex', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            <Ico d={muet ? D_VOL_MUTE : D_VOL_UP} size={22} color={muet ? OR : W60} />
          </button>
        </div>

        {/* ── panneau chapitres (style app) ── */}
        {panel === 'chapters' && (
          <div style={{ marginTop: 10, maxHeight: 320, overflowY: 'auto', borderRadius: 14 }}>
            {markers.map((m, i) => {
              const actif = markerActuel?.id === m.id
              const debutSuivant = i < markers.length - 1 ? markers[i + 1].temps_secondes : dureeTotal
              const dureeChap = Math.max(0, debutSuivant - m.temps_secondes)
              const restant = Math.max(0, dureeChap - (tempsActuel - m.temps_secondes))
              const passe = !actif && tempsActuel > m.temps_secondes
              return (
                <div
                  key={m.id ?? i}
                  onClick={() => dureeTotal > 0 && seeker((m.temps_secondes / dureeTotal) * 100)}
                  className="lct-ligne"
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '11px 12px', cursor: 'pointer',
                    background: actif ? 'rgba(214,173,58,0.09)' : 'transparent',
                    borderLeft: `3px solid ${actif ? OR : 'transparent'}`,
                    borderBottom: i < markers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 15, flexShrink: 0,
                    background: actif ? OR : passe ? W08 : 'rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14,
                  }}>
                    {actif && enLecture
                      ? <MiniEgaliseur color={BG_BOT} />
                      : <span style={{ fontSize: 11, fontWeight: 700, color: actif ? BG_BOT : passe ? W60 : W85, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>}
                  </div>
                  <span style={{
                    flex: 1, minWidth: 0, fontSize: 13.5, lineHeight: 1.4,
                    fontWeight: actif ? 700 : 500,
                    color: actif ? OR : W85,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {m.titre}
                  </span>
                  {dureeTotal > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 500, color: actif ? 'rgba(214,173,58,0.85)' : W60, marginLeft: 10, minWidth: 44, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {actif ? `-${fmt(restant)}` : fmt(dureeChap)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── panneau playlist (style app) ── */}
        {panel === 'queue' && (
          <div style={{ marginTop: 10, maxHeight: 320, overflowY: 'auto', borderRadius: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.8px', color: OR, textTransform: 'uppercase', margin: '4px 12px 8px' }}>
              Playlist · {episodes.length} épisode{episodes.length > 1 ? 's' : ''}
            </p>
            {episodes.map((ep, i) => {
              const actif = ep.id === piste.id
              return (
                <div
                  key={ep.id}
                  onClick={() => actif ? toggleLecture() : onJouerEp(ep)}
                  className="lct-ligne"
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '11px 12px', cursor: 'pointer',
                    background: actif ? 'rgba(214,173,58,0.10)' : 'transparent',
                    borderLeft: `3px solid ${actif ? OR : 'transparent'}`,
                    marginBottom: 1,
                  }}
                >
                  <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 }}>
                    {actif ? (
                      <div style={{ width: 32, height: 32, borderRadius: 16, background: OR, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {enLecture ? <MiniEgaliseur color={BG_MID} /> : <Ico d={D_PLAY} size={14} color={BG_MID} />}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 500, color: W60, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13.5, fontWeight: actif ? 700 : 500,
                      color: actif ? OR : W85, margin: 0,
                      overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    }}>
                      {ep.titre}
                    </p>
                  </div>
                  {ep.duree && (
                    <span style={{ fontSize: 11, color: actif ? 'rgba(214,173,58,0.6)' : W35, marginLeft: 10, fontVariantNumeric: 'tabular-nums' }}>{ep.duree}</span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── onglets — pilule verre (comme l'app) ── */}
        <div style={{ marginTop: 10 }}>
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 999, border: '1px solid rgba(255,255,255,0.07)',
            padding: 4,
          }}>
            {tabs.map(tab => {
              const active = panel === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setPanel(p => p === tab.id ? 'none' : tab.id)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '7px 0', borderRadius: 999, cursor: 'pointer',
                    background: active ? 'rgba(214,173,58,0.12)' : 'transparent',
                    border: 'none', fontFamily: 'inherit',
                  }}
                >
                  <Ico d={tab.d} size={18} color={active ? OR : W60} />
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? OR : W60 }}>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        /* halo doré de la pochette : double battement organique */
        .lct-aura { opacity: 0.05; transition: opacity 0.6s; }
        .lct-aura-active { animation: lctAura 2.6s ease-in-out infinite; }
        @keyframes lctAura {
          0% { opacity: 0.05; transform: scale(1); }
          18% { opacity: 0.16; transform: scale(1.05); }
          44% { opacity: 0.08; transform: scale(1.01); }
          60% { opacity: 0.14; transform: scale(1.04); }
          100% { opacity: 0.05; transform: scale(1); }
        }
        /* halo pulsant du bouton play */
        .lct-glow { opacity: 0; transition: opacity 0.4s; }
        .lct-glow-active { animation: lctGlow 3.6s ease-in-out infinite; }
        @keyframes lctGlow {
          0%, 100% { opacity: 0.06; transform: scale(1.03); }
          50% { opacity: 0.20; transform: scale(1.14); }
        }
        /* rotation des boutons ±10 s */
        .lct-skip-back { animation: lctSkipB 0.45s cubic-bezier(0.22,1,0.36,1); }
        .lct-skip-fwd { animation: lctSkipF 0.45s cubic-bezier(0.22,1,0.36,1); }
        @keyframes lctSkipB { 30% { transform: rotate(-42deg); } 100% { transform: rotate(0deg); } }
        @keyframes lctSkipF { 30% { transform: rotate(42deg); } 100% { transform: rotate(0deg); } }
        /* pressé à ressort */
        .lct-tap { transition: transform 0.15s ease; }
        .lct-tap:active { transform: scale(0.88); }
        /* thumb : visible au survol de la barre */
        .lct-thumb { opacity: 0; transform: scale(0.4); transition: opacity 0.15s, transform 0.15s; }
        .lct-barre:hover .lct-thumb { opacity: 1; transform: scale(1); }
        .lct-ligne { transition: background 0.12s; }
        .lct-ligne:hover { background: rgba(255,255,255,0.04); }
        @media (prefers-reduced-motion: reduce) {
          .lct-aura-active, .lct-glow-active { animation: none; }
        }
      `}</style>
    </div>
  )
}
