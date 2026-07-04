'use client'
import Footer from '@/components/Footer'
import MiniEgaliseur from '@/components/MiniEgaliseur'
import Navbar from '@/components/Navbar'
import RechercheLive from '@/components/RechercheLive'
import TitreDefilant from '@/components/TitreDefilant'
import { useAudio } from '@/contexts/AudioContext'
import { couleurBg, couleurTxt } from '@/lib/categories'
import { supabase } from '@/lib/supabase'
import * as adhan from 'adhan'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useId, useRef, useState } from 'react'

// ─── palette ──────────────────────────────────────────────────
const BLEU = '#2d578c'
const OR = '#d6ad3a'
const OR_CLAIR = '#e8c563'
const BG_TOP = '#3d6ba3'
const BG_MID = '#2d578c'
const BG_BOT = '#1d4070'
const NUIT = '#1c3d66'
const W90 = 'rgba(255,255,255,0.90)'
const W70 = 'rgba(255,255,255,0.70)'
const W55 = 'rgba(255,255,255,0.55)'

// ─── icônes Material Symbols (SVG inline) ────────────────────
type IcoProps = { size?: number; color?: string }
const Svg = ({ d, size = 24, color = BLEU }: { d: string } & IcoProps) => (
  <svg width={size} height={size} viewBox="0 -960 960 960"><path d={d} fill={color} /></svg>
)
const IcoHeadphones = (p: IcoProps) => <Svg {...p} d="M360-120H200q-33 0-56.5-23.5T120-200v-280q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480v280q0 33-23.5 56.5T760-120H600v-320h160v-40q0-117-81.5-198.5T480-760q-117 0-198.5 81.5T200-480v40h160v320Z" />
const IcoMic = (p: IcoProps) => <Svg {...p} d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm-40 280v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Z" />
const IcoMosqueBat = (p: IcoProps) => <Svg {...p} d="M40-120v-509q-18-11-29-27T0-692.13q0-20.12 20.5-49Q41-770 70-798q29 28 49.5 56.87 20.5 28.88 20.5 49Q140-672 129-656q-11 16-29 27v189h110v-102q0-24 18.5-43t47.5-19q-13-22-19.5-43t-6.5-40.62q0-37.38 17.5-69.88Q285-790 316-810l164-110 164 110q31 20 48.5 52.5t17.5 69.88q0 19.62-6.5 40.62-6.5 21-19.5 43 29 0 47.5 19t18.5 43v102h110v-189q-18-11-29-27t-11-36.13q0-20.12 20.5-49Q861-770 890-798q29 28 49.5 56.87 20.5 28.88 20.5 49Q960-672 949-656q-11 16-29 27.39V-120H530v-160q0-21.25-14.32-35.63Q501.35-330 480.18-330q-21.18 0-35.68 14.37Q430-301.25 430-280v160H40Zm356-482h168q36.21 0 61.11-24.75Q650-651.5 650-687.5q0-22.5-10.5-41.5t-27.29-30.58L480-848l-132.21 88.42Q331-748 320.5-729T310-687.5q0 36 24.89 60.75Q359.79-602 396-602ZM100-180h270v-100q0-45.83 32.12-77.92 32.12-32.08 78-32.08T558-357.92q32 32.09 32 77.92v100h270v-200H690v-162H270v162H100v200Zm380-362Zm0-60Zm0-2Z" />
const IcoMosque = (p: IcoProps) => <Svg {...p} d="m521-500 59-43 58 43-23-68 59-43h-72l-22-69-22 69h-73l59 43-23 68Zm-41 220q83 0 141.5-58T680-480q0-8-.5-16t-2.5-16q-11 47-49 77.5T539-404q-60 0-101-41t-41-101q0-46 26-82.5t68-51.5h-11q-84 0-142 58.5T280-480q0 84 58 142t142 58Zm0 252L346-160H160v-186L28-480l132-134v-186h186l134-132 134 132h186v186l132 134-132 134v186H614L480-28Zm0-112 100-100h140v-140l100-100-100-100v-140H580L480-820 380-720H240v140L140-480l100 100v140h140l100 100Zm0-340Z" />
const IcoChevron = (p: IcoProps) => <Svg {...p} d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
const IcoFleche = (p: IcoProps) => <Svg {...p} d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
const IcoNote = (p: IcoProps) => <Svg {...p} d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-460v-380h240v120H560v400q0 66-47 113t-113 47Z" />
const IcoQuote = (p: IcoProps) => <Svg {...p} d="m228-240 92-160q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 23-5.5 42.5T458-480L320-240h-92Zm360 0 92-160q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 23-5.5 42.5T818-480L680-240h-92Z" />

// ─── motif géométrique islamique (étoiles à 8 branches) ──────
function Motif({ opacite = 0.05 }: { opacite?: number }) {
  const id = useId()
  return (
    <svg aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <defs>
        <pattern id={id} width="96" height="96" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={`rgba(255,255,255,${opacite})`} strokeWidth="1">
            <rect x="28" y="28" width="40" height="40" />
            <rect x="28" y="28" width="40" height="40" transform="rotate(45 48 48)" />
            <circle cx="48" cy="48" r="6" />
            <rect x="-20" y="-20" width="40" height="40" transform="rotate(45 0 0)" />
            <rect x="76" y="-20" width="40" height="40" transform="rotate(45 96 0)" />
            <rect x="-20" y="76" width="40" height="40" transform="rotate(45 0 96)" />
            <rect x="76" y="76" width="40" height="40" transform="rotate(45 96 96)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

// ─── apparition au scroll ─────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(26px)',
      transition: `opacity 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

// ─── en-tête de section ───────────────────────────────────────
function EnTete({ eyebrow, titre, lien }: { eyebrow: string; titre: string; lien?: { label: string; href: string } }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ display: 'block', width: 26, height: 2, borderRadius: 2, background: `linear-gradient(90deg, ${OR}, ${OR_CLAIR})` }} />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.2px', color: OR, textTransform: 'uppercase', margin: 0 }}>{eyebrow}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ fontSize: 'clamp(22px, 3.4vw, 28px)', fontWeight: 700, color: 'var(--texte)', margin: 0, letterSpacing: '-0.4px' }}>{titre}</h2>
        {lien && (
          <Link href={lien.href} className="lien-voir-tout" style={{ fontSize: 13, fontWeight: 600, color: BLEU, display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            {lien.label}
            <span className="lien-fleche" style={{ display: 'inline-flex', transition: 'transform 0.2s' }}><IcoFleche size={15} color={BLEU} /></span>
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── helpers prières ──────────────────────────────────────────
type Priere = { nom: string; heure: string }
function enMinutes(h: string) { const [hh, mm] = h.split(':').map(Number); return hh * 60 + mm }
function fmtH(d: Date) { return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0') }
function tempsRestant(heure: string): string {
  const now = new Date()
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  let cible = enMinutes(heure) * 60
  if (cible <= nowSec) cible += 86400
  const diff = cible - nowSec
  const hh = Math.floor(diff / 3600)
  const mm = Math.floor((diff % 3600) / 60)
  const ss = diff % 60
  if (hh > 0) return `${hh} h ${mm.toString().padStart(2, '0')} min`
  if (mm > 0) return `${mm} min ${ss.toString().padStart(2, '0')} s`
  return `${ss} s`
}
function progressEntre(prev: Priere, next: Priere): number {
  const now = new Date()
  const n = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const a = enMinutes(prev.heure) * 60
  let b = enMinutes(next.heure) * 60
  let x = n
  if (b <= a) b += 86400
  if (x < a) x += 86400
  return Math.max(0, Math.min(1, (x - a) / (b - a)))
}
function getMethode(cc: string): adhan.CalculationParameters {
  const amerique = ['US', 'CA', 'MX', 'BR', 'AR', 'CO', 'CL', 'PE', 'VE']
  const moyenOrient = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'YE', 'IQ', 'SY', 'JO', 'LB', 'PS']
  const asieSud = ['PK', 'IN', 'BD', 'AF', 'LK', 'NP']
  const egypte = ['EG', 'LY', 'SD']
  if (amerique.includes(cc)) return adhan.CalculationMethod.NorthAmerica()
  if (moyenOrient.includes(cc)) return adhan.CalculationMethod.UmmAlQura()
  if (asieSud.includes(cc)) return adhan.CalculationMethod.Karachi()
  if (egypte.includes(cc)) return adhan.CalculationMethod.Egyptian()
  return adhan.CalculationMethod.MuslimWorldLeague()
}
function capitaliser(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

// ─── Héros ────────────────────────────────────────────────────
function Hero() {
  const [prieres, setPrieres] = useState<Priere[]>([])
  const [ville, setVille] = useState<string | null>(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        const geo = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`)
        const gd = await geo.json()
        const cc = gd.countryCode || 'FR'
        if (gd.city || gd.locality) setVille((gd.city || gd.locality).replace(/\s*\(.*\)\s*/g, '').trim())
        const coords = new adhan.Coordinates(latitude, longitude)
        const times = new adhan.PrayerTimes(coords, new Date(), getMethode(cc))
        setPrieres([
          { nom: 'Fajr', heure: fmtH(times.fajr) },
          { nom: 'Dhuhr', heure: fmtH(times.dhuhr) },
          { nom: 'Asr', heure: fmtH(times.asr) },
          { nom: 'Maghrib', heure: fmtH(times.maghrib) },
          { nom: 'Isha', heure: fmtH(times.isha) },
        ])
      } catch { }
    }, () => { })
  }, [])

  const now = new Date()
  const nowM = now.getHours() * 60 + now.getMinutes()
  const idx = prieres.findIndex(p => enMinutes(p.heure) > nowM)
  const prochaine = prieres.length ? (idx === -1 ? prieres[0] : prieres[idx]) : null
  const precedente = prieres.length ? (idx <= 0 ? prieres[4] : prieres[idx - 1]) : null
  const prog = prochaine && precedente ? progressEntre(precedente, prochaine) : 0

  const dateFr = capitaliser(now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
  let dateHijri = ''
  try { dateHijri = new Intl.DateTimeFormat('fr-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(now) } catch { }

  return (
    <div style={{ position: 'relative', borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: 'hidden' }}>
      {/* fond : dégradé + motif + brume */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(168deg, ${BG_TOP} 0%, ${BG_MID} 52%, ${BG_BOT} 100%)` }} />
      <Motif opacite={0.055} />
      <div style={{ position: 'absolute', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(140,180,230,0.20) 0%, transparent 65%)', top: -200, right: -140 }} />
      <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(140,180,230,0.12) 0%, transparent 65%)', bottom: -150, left: -110 }} />

      <div style={{ position: 'relative', maxWidth: 660, margin: '0 auto', padding: '34px 24px 58px' }}>
        {/* date */}
        <div className="hero-in" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 'clamp(21px, 3.6vw, 26px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.4px', margin: 0, lineHeight: 1.2 }}>{dateFr}</p>
          {dateHijri && <p style={{ fontSize: 13, color: W55, margin: '4px 0 0', letterSpacing: '0.3px' }}>{dateHijri}</p>}
        </div>

        {/* carte prière */}
        <Link href="/prieres" className="hero-in carte-priere-hero" style={{
          display: 'block', textDecoration: 'none', position: 'relative',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.13), rgba(255,255,255,0.07))',
          borderRadius: 24, border: '1px solid rgba(255,255,255,0.18)',
          padding: '20px 20px 18px', overflow: 'hidden',
          animationDelay: '90ms',
        }}>
          {/* reflet subtil */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
          {prochaine ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: W55, letterSpacing: '1.6px', textTransform: 'uppercase', margin: 0 }}>
                    Prochaine prière{ville ? ` · ${ville}` : ''}
                  </p>
                  <p style={{ fontSize: 34, fontWeight: 800, color: '#fff', margin: '6px 0 0', letterSpacing: '-0.5px', lineHeight: 1 }}>{prochaine.nom}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{prochaine.heure}</p>
                  <span style={{ display: 'inline-block', background: '#fff', borderRadius: 999, padding: '4px 11px', marginTop: 8, fontSize: 11, fontWeight: 700, color: NUIT, fontVariantNumeric: 'tabular-nums' }}>
                    dans {tempsRestant(prochaine.heure)}
                  </span>
                </div>
              </div>

              <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.16)', marginTop: 18, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, rgba(255,255,255,0.75), #fff)', width: `${prog * 100}%`, transition: 'width 0.6s ease' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, marginTop: 13 }}>
                {prieres.map(p => {
                  const actif = p.nom === prochaine.nom
                  return (
                    <div key={p.nom} style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      padding: '7px 2px', borderRadius: 12,
                      background: actif ? 'rgba(255,255,255,0.14)' : 'transparent',
                    }}>
                      <span style={{ fontSize: 11, fontWeight: actif ? 700 : 500, color: actif ? '#fff' : W55 }}>{p.nom}</span>
                      <span style={{ fontSize: 12.5, fontWeight: actif ? 700 : 400, color: actif ? '#fff' : W70, fontVariantNumeric: 'tabular-nums' }}>{p.heure}</span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: W90, margin: 0 }}>Horaires de prière</p>
              <p style={{ fontSize: 12, color: W55, margin: '4px 0 0' }}>Activez la localisation pour afficher les horaires</p>
            </div>
          )}
        </Link>
      </div>
    </div>
  )
}

// ─── Reprendre l'écoute ───────────────────────────────────────
function CarteReprendre() {
  const router = useRouter()
  const { piste, enLecture, toggleLecture } = useAudio()
  if (!piste) return null
  return (
    <div className="hero-in" style={{ maxWidth: 700, margin: '16px auto 0', padding: '0 24px', width: '100%', animationDelay: '240ms' }}>
      <div
        onClick={() => { if (piste.href) router.push(piste.href) }}
        className="carte-reprendre"
        style={{
          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
          borderRadius: 20, overflow: 'hidden', padding: 16, position: 'relative',
          background: `linear-gradient(135deg, ${BG_MID}, ${NUIT})`,
        }}
      >
        <Motif opacite={0.04} />
        <button
          onClick={e => { e.stopPropagation(); toggleLecture() }}
          aria-label={enLecture ? 'Pause' : 'Lecture'}
          className="btn-or"
          style={{
            width: 52, height: 52, borderRadius: 26, flexShrink: 0, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${OR}, ${OR_CLAIR})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            boxShadow: '0 4px 14px rgba(214,173,58,0.35)',
          }}
        >
          {enLecture
            ? <MiniEgaliseur color={NUIT} />
            : <svg width="20" height="20" viewBox="0 -960 960 960"><path d="M320-200v-560l440 280-440 280Z" fill={NUIT} /></svg>}
        </button>
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '1.4px', textTransform: 'uppercase', margin: '0 0 3px' }}>
            {enLecture ? 'En cours d’écoute' : 'Reprendre l’écoute'}
          </p>
          <TitreDefilant texte={piste.titre} style={{ fontSize: 15, fontWeight: 600, color: '#fff' }} />
          {piste.sheikh && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '2px 0 0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{piste.sheikh}</p>}
        </div>
        <IcoChevron size={20} color="rgba(255,255,255,0.5)" />
      </div>
    </div>
  )
}

// ─── Explorer : les 4 espaces ─────────────────────────────────
const MODULES = [
  { label: 'Cours audio', href: '/audio', Icon: IcoHeadphones },
  { label: 'Conférences', href: '/conferences', Icon: IcoMic },
  { label: 'Khoutbah', href: '/khoutbah', Icon: IcoMosqueBat },
  { label: 'Heures de prières', href: '/prieres', Icon: IcoMosque },
]

function Explorer() {
  return (
    <section style={{ maxWidth: 1040, margin: '0 auto', padding: '52px 24px 0', width: '100%' }}>
      <Reveal>
        <EnTete eyebrow="La plateforme" titre="Tout ce dont tu as besoin" />
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {MODULES.map(({ label, href, Icon }, i) => (
          <Reveal key={href} delay={i * 90}>
            <Link href={href} className="carte-module" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15, height: '100%',
              background: '#fff', borderRadius: 24, padding: '30px 16px 26px', textDecoration: 'none',
              border: '1px solid #edf1f7', position: 'relative', overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(45,87,140,0.06)',
            }}>
              {/* halo décoratif */}
              <div className="module-halo" style={{
                position: 'absolute', width: 150, height: 150, borderRadius: '50%',
                background: `radial-gradient(circle, rgba(61,107,163,0.10) 0%, transparent 65%)`,
                top: -50, right: -40, transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
              }} />
              <div className="module-tile" style={{
                width: 62, height: 62, borderRadius: 20,
                background: `linear-gradient(135deg, ${BG_TOP}, ${BG_BOT})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 18px rgba(45,87,140,0.28)', position: 'relative',
                transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s',
              }}>
                <Icon size={28} color="#fff" />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--texte)', margin: 0, letterSpacing: '-0.2px', textAlign: 'center', lineHeight: 1.3 }}>{label}</h3>
              {/* liseré or au survol */}
              <div className="module-lisere" style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, height: 3,
                background: `linear-gradient(90deg, ${OR}, ${OR_CLAIR})`,
                transform: 'scaleX(0)', transformOrigin: 'center', transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
              }} />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

// ─── Bibliothèque : Dourous ───────────────────────────────────
type CoursApercu = { id: string; titre: string; sheikh: string; nb_episodes: number; categories: { nom: string } | null }
type Cat = { nom: string; slug: string }

function Dourous() {
  const router = useRouter()
  const [categories, setCategories] = useState<Cat[]>([])
  const [cours, setCours] = useState<CoursApercu[]>([])

  useEffect(() => {
    supabase.from('categories').select('nom, slug').order('ordre').then(({ data }) => { if (data) setCategories(data) })
    supabase.from('cours').select('id, titre, sheikh, nb_episodes, categories(nom)').order('created_at', { ascending: false }).limit(4)
      .then(({ data }) => { if (data) setCours(data as unknown as CoursApercu[]) })
  }, [])

  const ouvrirCategorie = (slug: string) => {
    sessionStorage.setItem('categorie:/audio', slug)
    router.push('/audio')
  }

  return (
    <section style={{ maxWidth: 1040, margin: '0 auto', padding: '52px 24px 0', width: '100%' }}>
      <Reveal>
        <EnTete eyebrow="Bibliothèque" titre="Derniers dourous" lien={{ label: 'Tout voir', href: '/audio' }} />
      </Reveal>

      {/* chips catégories */}
      {categories.length > 0 && (
        <Reveal delay={60}>
          <div className="chips-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 18 }}>
            {categories.map(c => (
              <button key={c.slug} onClick={() => ouvrirCategorie(c.slug)} className="chip-cat" style={{
                flexShrink: 0, padding: '7px 15px', borderRadius: 999, cursor: 'pointer',
                background: couleurBg[c.nom] || '#fff',
                border: `1px solid ${couleurBg[c.nom] ? 'transparent' : '#e2e7ee'}`,
                color: couleurTxt[c.nom] || '#5b6675',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                {c.nom}
              </button>
            ))}
          </div>
        </Reveal>
      )}

      {/* derniers cours */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cours.map((c, i) => {
          const nomCat = c.categories?.nom ?? ''
          const bg = couleurBg[nomCat] || '#e8f0f8'
          const accent = couleurTxt[nomCat] || BLEU
          return (
            <Reveal key={c.id} delay={i * 70}>
              <Link href={`/audio/${c.id}`} className="carte-cours" style={{
                display: 'flex', alignItems: 'center', gap: 15,
                background: '#fff', borderRadius: 20, padding: '14px 18px 14px 14px',
                boxShadow: '0 4px 12px rgba(58,74,92,0.06)', textDecoration: 'none',
                border: '1px solid transparent', position: 'relative', overflow: 'hidden',
              }}>
                {/* filet coloré catégorie */}
                <div style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 3.5, borderRadius: '0 4px 4px 0', background: accent, opacity: 0.85 }} />
                <div className="cours-pastille" style={{
                  width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1)',
                }}>
                  <IcoNote size={22} color={accent} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <TitreDefilant texte={c.titre} style={{ fontSize: 15, fontWeight: 600, color: 'var(--texte)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4, flexWrap: 'wrap' }}>
                    {nomCat && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: bg, color: accent }}>{nomCat}</span>}
                    <span style={{ fontSize: 12, color: 'var(--texte-muted)' }}>{c.sheikh}{c.nb_episodes ? ` · ${c.nb_episodes} épisode${c.nb_episodes > 1 ? 's' : ''}` : ''}</span>
                  </div>
                </div>
                <span className="cours-fleche" style={{ display: 'inline-flex', flexShrink: 0, opacity: 0.35, transition: 'opacity 0.2s, transform 0.25s cubic-bezier(0.22,1,0.36,1)' }}>
                  <IcoChevron size={19} color={BLEU} />
                </span>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

// ─── Hadith du jour ───────────────────────────────────────────
const HADITHS = [
  { texte: 'Les actions ne valent que par les intentions, et chacun n’a pour lui que ce qu’il a eu réellement l’intention de faire.', source: 'Boukhari & Mouslim' },
  { texte: 'Le meilleur d’entre vous est celui qui apprend le Coran et l’enseigne.', source: 'Boukhari' },
  { texte: 'Quiconque emprunte un chemin à la recherche d’une science, Allah lui facilite un chemin vers le Paradis.', source: 'Mouslim' },
  { texte: 'La pudeur est une branche de la foi.', source: 'Boukhari & Mouslim' },
  { texte: 'Allah ne regarde ni vos corps ni vos visages, mais Il regarde vos cœurs.', source: 'Mouslim' },
  { texte: 'Le musulman est celui dont les musulmans sont à l’abri de sa langue et de sa main.', source: 'Boukhari & Mouslim' },
  { texte: 'Aucun de vous ne sera véritablement croyant tant qu’il n’aimera pas pour son frère ce qu’il aime pour lui-même.', source: 'Boukhari & Mouslim' },
  { texte: 'Celui qui croit en Allah et au Jour dernier, qu’il dise du bien ou qu’il se taise.', source: 'Boukhari & Mouslim' },
  { texte: 'La religion, c’est la sincérité.', source: 'Mouslim' },
  { texte: 'Facilitez et ne rendez pas les choses difficiles, annoncez la bonne nouvelle et ne faites pas fuir les gens.', source: 'Boukhari & Mouslim' },
]

function HadithDuJour() {
  const [hadith, setHadith] = useState<typeof HADITHS[number] | null>(null)
  useEffect(() => {
    const jour = Math.floor(Date.now() / 86400000)
    setHadith(HADITHS[jour % HADITHS.length])
  }, [])
  if (!hadith) return <div style={{ height: 120 }} />
  return (
    <section style={{ maxWidth: 1040, margin: '0 auto', padding: '56px 24px 0', width: '100%' }}>
      <Reveal>
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 28,
          background: `linear-gradient(150deg, ${NUIT} 0%, #16294a 100%)`,
          padding: 'clamp(28px, 5vw, 44px)',
        }}>
          <Motif opacite={0.05} />
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(214,173,58,0.13) 0%, transparent 65%)', top: -120, right: -80 }} />
          <div style={{ position: 'relative', maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <IcoQuote size={30} color={OR} />
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.4px', color: OR, textTransform: 'uppercase', margin: '0 0 16px' }}>Hadith du jour</p>
            <p style={{ fontSize: 'clamp(16px, 2.6vw, 19px)', color: W90, lineHeight: 1.75, margin: 0, fontWeight: 500 }}>
              « {hadith.texte} »
            </p>
            <p style={{ fontSize: 13, color: W55, margin: '16px 0 0', fontWeight: 500 }}>— Rapporté par {hadith.source}</p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

// ─── page ─────────────────────────────────────────────────────
export default function Accueil() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Hero />

      {/* recherche — chevauche le bas du héros */}
      <div className="hero-in" style={{ maxWidth: 700, margin: '-27px auto 0', padding: '0 24px', position: 'relative', zIndex: 20, width: '100%', animationDelay: '170ms' }}>
        <RechercheLive />
      </div>

      <CarteReprendre />
      <Explorer />
      <Dourous />
      <HadithDuJour />

      <div style={{ height: 64 }} />
      <Footer />

      <style>{`
        /* entrées du héros au chargement */
        .hero-in { animation: heroIn 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes heroIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

        .chips-scroll::-webkit-scrollbar { display: none; }
        .chips-scroll { scrollbar-width: none; }
        .chip-cat { transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s; }
        .chip-cat:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(58,74,92,0.12); }

        .carte-priere-hero { transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), background 0.25s, border-color 0.25s; }
        .carte-priere-hero:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.30); }

        .carte-reprendre { transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s; }
        .carte-reprendre:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(28,61,102,0.30); }
        .btn-or { transition: transform 0.15s; }
        .btn-or:hover { transform: scale(1.06); }
        .btn-or:active { transform: scale(0.94); }

        .carte-module { transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s, border-color 0.25s; }
        .carte-module:hover { transform: translateY(-5px); box-shadow: 0 22px 48px rgba(45,87,140,0.14); border-color: #e2eaf4; }
        .carte-module:hover .module-lisere { transform: scaleX(1); }
        .carte-module:hover .module-halo { transform: scale(1.35); }
        .carte-module:hover .module-tile { transform: scale(1.08) rotate(-3deg); box-shadow: 0 12px 24px rgba(45,87,140,0.36); }

        .lien-voir-tout:hover .lien-fleche { transform: translateX(3px); }

        .carte-cours { transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s, border-color 0.2s; }
        .carte-cours:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(58,74,92,0.11); border-color: #e6ecf3; }
        .carte-cours:hover .cours-fleche { opacity: 1; transform: translateX(3px); }
        .carte-cours:hover .cours-pastille { transform: scale(1.07); }

        @media (prefers-reduced-motion: reduce) {
          .hero-in { animation: none; }
        }
      `}</style>
    </main>
  )
}
