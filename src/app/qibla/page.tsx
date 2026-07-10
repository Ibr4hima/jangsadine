'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

// ─── palette bleu logo — la même que le héros ─────────────────
const BG_TOP = '#3d6ba3'
const BG_MID = '#2d578c'
const BG_BOT = '#1c3d66'
const OR = '#d6ad3a'
const W90 = 'rgba(255,255,255,0.90)'
const W60 = 'rgba(255,255,255,0.60)'
const W40 = 'rgba(255,255,255,0.40)'
const W30 = 'rgba(255,255,255,0.30)'
const W14 = 'rgba(255,255,255,0.14)'
const W07 = 'rgba(255,255,255,0.07)'

const KAABA_LAT = 21.4225
const KAABA_LNG = 39.8262

// ─── maths ───────────────────────────────────────────────────
function qiblaFrom(lat: number, lng: number): number {
  const dLng = (KAABA_LNG - lng) * Math.PI / 180
  const p1 = lat * Math.PI / 180
  const p2 = KAABA_LAT * Math.PI / 180
  const y = Math.sin(dLng) * Math.cos(p2)
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dLng)
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360
}

function distanceTo(lat: number, lng: number): number {
  const R = 6371
  const dLat = (KAABA_LAT - lat) * Math.PI / 180
  const dLng = (KAABA_LNG - lng) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat * Math.PI / 180) * Math.cos(KAABA_LAT * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function norm(a: number) { return ((a % 360) + 360) % 360 }

const CARDINAUX = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']

// ─── fond aurore (même langage que l'accueil) ────────────────
function Aurore() {
  return (
    <>
      <div className="aurore aurore-1" style={{ width: 420, height: 420, background: 'rgb(120,165,220)', top: -180, left: -140 }} />
      <div className="aurore aurore-2" style={{ width: 340, height: 340, background: 'rgb(90,140,200)', top: 260, right: -150 }} />
      <div className="aurore aurore-3" style={{ width: 360, height: 360, background: 'rgb(30,64,106)', bottom: -160, left: -100 }} />
    </>
  )
}

// ─── cadran : graduations + labels tangentiels ───────────────
function DialSvg({ size }: { size: number }) {
  const cx = size / 2, cy = size / 2
  const R = size / 2 - 6

  const ticks = []
  for (let i = 0; i < 72; i++) {
    const deg = i * 5
    const rad = (deg - 90) * Math.PI / 180
    const major = deg % 90 === 0
    const med = !major && deg % 30 === 0
    const len = major ? 20 : med ? 13 : 7
    ticks.push(
      <line key={i}
        x1={cx + (R - len) * Math.cos(rad)} y1={cy + (R - len) * Math.sin(rad)}
        x2={cx + R * Math.cos(rad)} y2={cy + R * Math.sin(rad)}
        stroke={major ? W90 : med ? W60 : W30}
        strokeWidth={major ? 2.5 : 1.5}
        strokeLinecap="round"
      />
    )
  }

  const LBL_R = R - 36
  const DEG_R = R - 60

  return (
    <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
      {ticks}
      {CARDINAUX.map((l, i) => {
        const deg = i * 45
        const principal = deg % 90 === 0
        return (
          <text key={l}
            x={cx} y={cy - LBL_R + (principal ? 6 : 4)}
            transform={`rotate(${deg} ${cx} ${cy})`}
            textAnchor="middle"
            fill={l === 'N' ? OR : principal ? W90 : W40}
            fontSize={principal ? 17 : 10}
            fontWeight={principal ? 'bold' : 'normal'}
            fontFamily="inherit"
          >{l}</text>
        )
      })}
      {[30, 60, 120, 150, 210, 240, 300, 330].map(deg => (
        <text key={deg}
          x={cx} y={cy - DEG_R + 3}
          transform={`rotate(${deg} ${cx} ${cy})`}
          textAnchor="middle"
          fill={W30} fontSize={9} fontFamily="inherit"
        >{deg}</text>
      ))}
    </svg>
  )
}

// ─── aiguille : flèche dorée effilée avec pointe barbelée ────
function NeedleSvg({ size, aligne }: { size: number; aligne: boolean }) {
  const cx = size / 2, cy = size / 2
  const tipY = cy - size * 0.355
  const tailY = cy + size * 0.20

  return (
    <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="goldNeedle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={aligne ? '#ffffff' : '#f0d488'} />
          <stop offset="1" stopColor={aligne ? '#f0d488' : '#c8992b'} />
        </linearGradient>
      </defs>
      <path
        d={`M ${cx} ${tipY}
            L ${cx + 13} ${tipY + 34}
            L ${cx + 4.5} ${tipY + 27}
            L ${cx + 4.5} ${cy}
            L ${cx - 4.5} ${cy}
            L ${cx - 4.5} ${tipY + 27}
            L ${cx - 13} ${tipY + 34}
            Z`}
        fill="url(#goldNeedle)"
      />
      <line x1={cx} y1={cy} x2={cx} y2={tailY - 8} stroke={W40} strokeWidth={3} strokeLinecap="round" />
      <circle cx={cx} cy={tailY} r={5.5} fill="none" stroke={W40} strokeWidth={3} />
    </svg>
  )
}

// ─── icônes rotation ─────────────────────────────────────────
const IcoRotateDroite = ({ size = 18, color = '#fff' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 -960 960 960"><path d="M522-80v-82q34-5 66.5-18t61.5-34l56 58q-42 32-88 51.5T522-80Zm-80 0Q304-98 213-199.5T122-438q0-75 28.5-140.5t77-114q48.5-48.5 114-77T482-798h6l-62-62 56-58 160 160-160 160-56-56 64-64h-8q-117 0-198.5 81.5T202-438q0 104 68 182.5T442-162v82Zm322-134-58-56q21-29 34-61.5t18-66.5h82q-6 51-25.5 97T764-214Zm76-264h-82q-5-34-18-66.5T706-606l58-56q32 42 51.5 88t24.5 96Z" fill={color} /></svg>
)
const IcoRotateGauche = ({ size = 18, color = '#fff' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 -960 960 960"><path d="M440-80q-50-5-96-24.5T256-156l56-58q29 21 61.5 34t66.5 18v82Zm80 0v-82q104-15 172-93.5T760-440q0-117-81.5-198.5T480-720h-8l64 64-56 56-160-160 160-160 56 58-62 62h6q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-440q0 137-91 238.5T520-80ZM198-214q-32-42-51.5-88T122-398h82q5 34 18 66.5t34 61.5l-58 56Zm-76-264q6-51 25-97.5t51-88.5l58 56q-21 29-34 61.5T204-478h-82Z" fill={color} /></svg>
)

export default function QiblaPage() {
  const [dial, setDial] = useState(320)
  const [perm, setPerm] = useState<'idle' | 'granted' | 'denied'>('idle')
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null)
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [boussole, setBoussole] = useState(0)
  // capteur : 'attente' (pas encore de données), 'actif', 'absent' (desktop),
  // 'a-autoriser' (iOS : requiert un geste utilisateur)
  const [capteur, setCapteur] = useState<'attente' | 'actif' | 'absent' | 'a-autoriser'>('attente')

  const prevDial = useRef(0)
  const prevNeedle = useRef(0)
  const [dialRot, setDialRot] = useState(0)
  const [needleRot, setNeedleRot] = useState(0)

  // taille du cadran : contrainte par la largeur et la hauteur (écran fixe sans scroll)
  useEffect(() => {
    const maj = () => setDial(Math.min(340, Math.floor(window.innerWidth * 0.82), Math.floor(window.innerHeight * 0.42)))
    maj()
    window.addEventListener('resize', maj)
    return () => window.removeEventListener('resize', maj)
  }, [])

  // Plein écran comme une app : tentative au premier geste (Android le
  // permet ; iOS Safari l'ignore silencieusement), sortie en quittant.
  useEffect(() => {
    const plein = () => {
      document.documentElement.requestFullscreen?.({ navigationUI: 'hide' } as FullscreenOptions).catch(() => { })
    }
    window.addEventListener('pointerdown', plein, { once: true })
    return () => {
      window.removeEventListener('pointerdown', plein)
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => { })
    }
  }, [])

  // GPS
  useEffect(() => {
    if (!navigator.geolocation) { setPerm('denied'); return }
    navigator.geolocation.getCurrentPosition(p => {
      const { latitude: lat, longitude: lng } = p.coords
      setPos({ lat, lng })
      setQiblaAngle(qiblaFrom(lat, lng))
      setDistance(distanceTo(lat, lng))
      setPerm('granted')
    }, () => setPerm('denied'))
  }, [])

  // Boussole (DeviceOrientation)
  useEffect(() => {
    type OrientEvt = DeviceOrientationEvent & { webkitCompassHeading?: number; absolute?: boolean }
    let recu = false
    const onOrient = (e: OrientEvt) => {
      let cap: number | null = null
      if (typeof e.webkitCompassHeading === 'number') cap = e.webkitCompassHeading
      else if (e.absolute && e.alpha != null) cap = 360 - e.alpha
      if (cap != null && !isNaN(cap)) {
        recu = true
        setCapteur('actif')
        setBoussole(norm(cap))
      }
    }

    const DOE = typeof DeviceOrientationEvent !== 'undefined'
      ? DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
      : null

    if (DOE?.requestPermission) {
      // iOS : il faut un geste utilisateur pour autoriser
      setCapteur('a-autoriser')
      return
    }

    window.addEventListener('deviceorientationabsolute', onOrient as EventListener)
    window.addEventListener('deviceorientation', onOrient as EventListener)
    const t = setTimeout(() => { if (!recu) setCapteur('absent') }, 3000)
    return () => {
      window.removeEventListener('deviceorientationabsolute', onOrient as EventListener)
      window.removeEventListener('deviceorientation', onOrient as EventListener)
      clearTimeout(t)
    }
  }, [])

  // iOS : activation de la boussole sur clic
  const activerBoussole = async () => {
    type OrientEvt = DeviceOrientationEvent & { webkitCompassHeading?: number; absolute?: boolean }
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    try {
      const rep = await DOE.requestPermission?.()
      if (rep !== 'granted') { setCapteur('absent'); return }
      let recu = false
      const onOrient = (e: OrientEvt) => {
        let cap: number | null = null
        if (typeof e.webkitCompassHeading === 'number') cap = e.webkitCompassHeading
        else if (e.absolute && e.alpha != null) cap = 360 - e.alpha
        if (cap != null && !isNaN(cap)) {
          recu = true
          setCapteur('actif')
          setBoussole(norm(cap))
        }
      }
      window.addEventListener('deviceorientation', onOrient as EventListener)
      setTimeout(() => { if (!recu) setCapteur('absent') }, 3000)
    } catch {
      setCapteur('absent')
    }
  }

  // Rotation du cadran (chemin le plus court, comme l'app)
  useEffect(() => {
    let delta = boussole - prevDial.current
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    prevDial.current += delta
    setDialRot(-prevDial.current)
  }, [boussole])

  // Rotation de l'aiguille Qibla
  useEffect(() => {
    if (qiblaAngle === null) return
    const target = norm(qiblaAngle - boussole)
    let delta = target - prevNeedle.current
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    prevNeedle.current += delta
    setNeedleRot(prevNeedle.current)
  }, [boussole, qiblaAngle])

  const capteurActif = capteur === 'actif'
  const target = qiblaAngle !== null ? norm(qiblaAngle - boussole) : 0
  const aligne = capteurActif && (target < 4 || target > 356)

  // Vibration quand on fait face à la Qibla (Android ; iOS ne supporte pas vibrate)
  const derniereVibration = useRef(0)
  useEffect(() => {
    if (!aligne) return
    const now = Date.now()
    if (now - derniereVibration.current > 2200) {
      derniereVibration.current = now
      try { navigator.vibrate?.([60, 40, 60]) } catch { }
    }
  }, [aligne])
  const ecart = (() => { let d = target; if (d > 180) d -= 360; return d })()
  const cardinalActuel = CARDINAUX[Math.round(boussole / 45) % 8]
  const DIAL_R = dial / 2

  return (
    <main style={{
      position: 'fixed', inset: 0, zIndex: 500,
      height: '100dvh', overflow: 'hidden',
      background: `linear-gradient(168deg, ${BG_TOP} 0%, ${BG_MID} 50%, ${BG_BOT} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 20px calc(env(safe-area-inset-bottom, 0px) + 16px)',
    }}>
      <Aurore />

      {/* ── En-tête : retour + badge + titre ── */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 480, display: 'flex', alignItems: 'flex-start' }}>
        <Link href="/" aria-label="Retour" style={{
          width: 38, height: 38, borderRadius: 19, flexShrink: 0,
          background: W07, border: `1px solid ${W30}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 -960 960 960"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" fill="#fff" /></svg>
        </Link>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(214,173,58,0.16)', borderRadius: 999, padding: '3px 11px', marginBottom: 4 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '1.8px', color: OR, textTransform: 'uppercase' }}>
              Direction de La Mecque
            </span>
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: '#fff', margin: 0 }}>Qibla</h1>
        </div>
        <div style={{ width: 38, flexShrink: 0 }} />
      </div>

        {perm === 'denied' ? (
          /* ── Localisation refusée ── */
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: 300 }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: W07, border: `1px solid ${W30}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width={32} height={32} viewBox="0 -960 960 960"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Z" fill={W90} /></svg>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: W90, margin: '0 0 8px' }}>Localisation requise</p>
            <p style={{ fontSize: 14, color: W60, lineHeight: 1.6, margin: 0 }}>
              Autorise la localisation dans ton navigateur pour trouver la direction de la Qibla.
            </p>
          </div>
        ) : !pos || qiblaAngle === null ? (
          /* ── Chargement ── */
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div className="qibla-spinner" style={{ width: 36, height: 36, borderRadius: 18, border: `3px solid ${W14}`, borderTopColor: OR, marginBottom: 16 }} />
            <p style={{ fontSize: 18, fontWeight: 700, color: W90, margin: '0 0 4px' }}>Calcul en cours…</p>
            <p style={{ fontSize: 14, color: W60, margin: 0 }}>Détection de ta position</p>
          </div>
        ) : (
          <>
            {/* ── Cap actuel ── */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 40, fontWeight: 700, color: aligne ? OR : W90, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                {capteurActif ? `${Math.round(boussole)}°` : `${Math.round(qiblaAngle)}°`}
              </span>
              <span style={{ fontSize: 17, fontWeight: 700, color: aligne ? OR : W60 }}>
                {capteurActif ? cardinalActuel : CARDINAUX[Math.round(qiblaAngle / 45) % 8]}
              </span>
            </div>

            {/* ── Boussole ── */}
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
              <div className={aligne ? 'qibla-pulse' : undefined} style={{ width: dial, height: dial, position: 'relative' }}>

                {/* Halo doré quand aligné */}
                <div style={{
                  position: 'absolute', inset: -12, borderRadius: '50%',
                  border: `2px solid ${OR}`, boxShadow: `0 0 22px rgba(214,173,58,0.8)`,
                  opacity: aligne ? 1 : 0, transition: 'opacity 0.35s',
                }} />

                {/* Anneau extérieur */}
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.5px solid ${aligne ? OR : W30}`, transition: 'border-color 0.3s' }} />

                {/* Disque intérieur (verre dépoli) */}
                <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', background: W07, border: `1px solid ${W14}` }} />

                {/* Cadran rotatif */}
                <div style={{ position: 'absolute', inset: 0, transform: `rotate(${dialRot}deg)`, transition: 'transform 0.12s ease-out' }}>
                  <DialSvg size={dial} />
                </div>

                {/* Repère fixe en haut */}
                <div style={{ position: 'absolute', top: -4, left: DIAL_R - 8, width: 16, height: 18 }}>
                  <svg width={16} height={18} viewBox="0 0 16 18">
                    <path d="M 8 18 L 0 0 L 8 5 L 16 0 Z" fill={aligne ? OR : '#fff'} />
                  </svg>
                </div>

                {/* Aiguille Qibla */}
                <div style={{ position: 'absolute', inset: 0, transform: `rotate(${needleRot}deg)`, transition: 'transform 0.12s ease-out' }}>
                  <NeedleSvg size={dial} aligne={aligne} />
                </div>

                {/* Centre Kaaba */}
                <div style={{
                  position: 'absolute', top: DIAL_R - 26, left: DIAL_R - 26,
                  width: 52, height: 52, borderRadius: 26,
                  background: aligne ? OR : '#16263e',
                  border: `2px solid ${aligne ? 'rgba(255,255,255,0.55)' : W30}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: aligne ? `0 4px 14px rgba(214,173,58,0.5)` : '0 4px 10px rgba(0,0,0,0.4)',
                  transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
                }}>
                  <span style={{ fontSize: 23 }}>🕋</span>
                </div>
              </div>
            </div>

            {/* ── Guidage ── */}
            <div style={{ position: 'relative', minHeight: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              {capteur === 'a-autoriser' ? (
                <button onClick={activerBoussole} style={{
                  background: OR, border: 'none', borderRadius: 999,
                  padding: '12px 26px', fontSize: 14, fontWeight: 700, color: BG_BOT,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 6px 18px rgba(214,173,58,0.4)',
                }}>
                  Activer la boussole
                </button>
              ) : capteur === 'absent' ? (
                <div style={{ background: W07, borderRadius: 999, padding: '10px 22px', border: `1px solid ${W30}` }}>
                  <span style={{ fontSize: 13, color: W60 }}>
                    Boussole indisponible — la Qibla est à <b style={{ color: W90 }}>{Math.round(qiblaAngle)}°</b> depuis le Nord
                  </span>
                </div>
              ) : aligne ? (
                <div style={{ background: 'rgba(214,173,58,0.14)', borderRadius: 999, padding: '10px 24px', border: `1.5px solid ${OR}` }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: OR }}>✓  Vous faites face à la Qibla</span>
                </div>
              ) : capteurActif ? (
                <div style={{ background: W07, borderRadius: 999, padding: '10px 22px', border: `1px solid ${W30}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {ecart > 0 ? <IcoRotateDroite size={18} color={W90} /> : <IcoRotateGauche size={18} color={W90} />}
                  <span style={{ fontSize: 14, color: W60 }}>
                    Tournez {ecart > 0 ? 'à droite' : 'à gauche'} de{' '}
                    <b style={{ color: W90, fontVariantNumeric: 'tabular-nums' }}>{Math.abs(Math.round(ecart))}°</b>
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 13, color: W40 }}>Recherche de la boussole…</span>
              )}
            </div>

            {/* ── Barre d'infos ── */}
            <div style={{ position: 'relative', display: 'flex', width: '100%', maxWidth: 420, background: W07, borderRadius: 16, border: `1px solid ${W14}`, overflow: 'hidden' }}>
              {([
                { label: 'Qibla', value: `${Math.round(qiblaAngle)}°` },
                { label: 'Distance', value: `${distance!.toLocaleString('fr-FR')} km` },
                { label: 'Position', value: `${pos.lat.toFixed(2)}°, ${pos.lng.toFixed(2)}°` },
              ] as const).map((item, i, arr) => (
                <div key={item.label} style={{ flex: 1, textAlign: 'center', padding: '14px 4px', borderRight: i < arr.length - 1 ? `1px solid ${W14}` : 'none' }}>
                  <p style={{ fontSize: i === 2 ? 12 : 14, fontWeight: 700, color: W90, margin: '0 0 3px', fontVariantNumeric: 'tabular-nums' }}>{item.value}</p>
                  <p style={{ fontSize: 11, color: W60, margin: 0 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </>
        )}

      <style>{`
        .qibla-spinner { animation: qiblaSpin 0.9s linear infinite; }
        @keyframes qiblaSpin { to { transform: rotate(360deg); } }
        .qibla-pulse { animation: qiblaPulse 1.4s ease-in-out infinite alternate; }
        @keyframes qiblaPulse { from { transform: scale(1); } to { transform: scale(1.018); } }
        @media (prefers-reduced-motion: reduce) {
          .qibla-pulse { animation: none; }
        }
      `}</style>
    </main>
  )
}
