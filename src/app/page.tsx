'use client'
import Footer from '@/components/Footer'
import MiniEgaliseur from '@/components/MiniEgaliseur'
import Navbar from '@/components/Navbar'
import RechercheLive from '@/components/RechercheLive'
import TitreDefilant from '@/components/TitreDefilant'
import { useAudio } from '@/contexts/AudioContext'
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
const IcoCoran = (p: IcoProps) => <Svg {...p} d="M560-564v-68q33-14 67.5-21t72.5-7q26 0 51 4t49 10v64q-24-9-48.5-13.5T700-600q-38 0-73 9.5T560-564Zm0 220v-68q33-14 67.5-21t72.5-7q26 0 51 4t49 10v64q-24-9-48.5-13.5T700-380q-38 0-73 9t-67 27Zm0-110v-68q33-14 67.5-21t72.5-7q26 0 51 4t49 10v64q-24-9-48.5-13.5T700-490q-38 0-73 9.5T560-454ZM260-320q47 0 91.5 10.5T440-278v-394q-41-24-87-36t-93-12q-36 0-71.5 7T120-692v396q35-12 69.5-18t70.5-6Zm260 42q44-21 88.5-31.5T700-320q36 0 70.5 6t69.5 18v-396q-33-14-68.5-21t-71.5-7q-47 0-93 12t-87 36v394Zm-40 118q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q58 0 113.5 15T480-740q51-30 106.5-45T700-800q52 0 102 12t96 36q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59ZM280-494Z" />
const IcoMosqueBat = (p: IcoProps) => <Svg {...p} d="M40-120v-509q-18-11-29-27T0-692.13q0-20.12 20.5-49Q41-770 70-798q29 28 49.5 56.87 20.5 28.88 20.5 49Q140-672 129-656q-11 16-29 27v189h110v-102q0-24 18.5-43t47.5-19q-13-22-19.5-43t-6.5-40.62q0-37.38 17.5-69.88Q285-790 316-810l164-110 164 110q31 20 48.5 52.5t17.5 69.88q0 19.62-6.5 40.62-6.5 21-19.5 43 29 0 47.5 19t18.5 43v102h110v-189q-18-11-29-27t-11-36.13q0-20.12 20.5-49Q861-770 890-798q29 28 49.5 56.87 20.5 28.88 20.5 49Q960-672 949-656q-11 16-29 27.39V-120H530v-160q0-21.25-14.32-35.63Q501.35-330 480.18-330q-21.18 0-35.68 14.37Q430-301.25 430-280v160H40Zm356-482h168q36.21 0 61.11-24.75Q650-651.5 650-687.5q0-22.5-10.5-41.5t-27.29-30.58L480-848l-132.21 88.42Q331-748 320.5-729T310-687.5q0 36 24.89 60.75Q359.79-602 396-602ZM100-180h270v-100q0-45.83 32.12-77.92 32.12-32.08 78-32.08T558-357.92q32 32.09 32 77.92v100h270v-200H690v-162H270v162H100v200Zm380-362Zm0-60Zm0-2Z" />
const IcoMosque = (p: IcoProps) => <Svg {...p} d="m521-500 59-43 58 43-23-68 59-43h-72l-22-69-22 69h-73l59 43-23 68Zm-41 220q83 0 141.5-58T680-480q0-8-.5-16t-2.5-16q-11 47-49 77.5T539-404q-60 0-101-41t-41-101q0-46 26-82.5t68-51.5h-11q-84 0-142 58.5T280-480q0 84 58 142t142 58Zm0 252L346-160H160v-186L28-480l132-134v-186h186l134-132 134 132h186v186l132 134-132 134v186H614L480-28Zm0-112 100-100h140v-140l100-100-100-100v-140H580L480-820 380-720H240v140L140-480l100 100v140h140l100 100Zm0-340Z" />
const IcoChevron = (p: IcoProps) => <Svg {...p} d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
const IcoFleche = (p: IcoProps) => <Svg {...p} d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
const IcoQuote = (p: IcoProps) => <Svg {...p} d="m228-240 92-160q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 23-5.5 42.5T458-480L320-240h-92Zm360 0 92-160q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 23-5.5 42.5T818-480L680-240h-92Z" />

// ─── fond « aurore » : trois nappes bleues qui dérivent ──────
// Réplique du FondAurore de l'app (17 s / 23 s / 29 s, aller-retour) :
// le fond vit sans distraire.
function Aurore() {
  return (
    <>
      <div className="aurore aurore-1" style={{ width: 380, height: 380, background: 'rgb(120,165,220)', top: -160, right: -120 }} />
      <div className="aurore aurore-2" style={{ width: 300, height: 300, background: 'rgb(90,140,200)', bottom: -120, left: -90 }} />
      <div className="aurore aurore-3" style={{ width: 340, height: 340, background: 'rgb(30,64,106)', bottom: -170, right: -80 }} />
    </>
  )
}

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
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ display: 'block', width: 26, height: 2, borderRadius: 2, background: `linear-gradient(90deg, ${OR}, ${OR_CLAIR})` }} />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.2px', color: OR, textTransform: 'uppercase', margin: 0 }}>{eyebrow}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ fontSize: 'clamp(18px, 2.6vw, 22px)', fontWeight: 700, color: 'var(--texte)', margin: 0, letterSpacing: '-0.4px' }}>{titre}</h2>
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
      {/* fond : dégradé + aurore animée */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(168deg, ${BG_TOP} 0%, ${BG_MID} 52%, ${BG_BOT} 100%)` }} />
      <Aurore />

      <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '20px 24px 42px' }}>
        {/* date */}
        <div className="hero-in" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px', margin: 0, lineHeight: 1.25 }}>{dateFr}</p>
          {dateHijri && <p style={{ fontSize: 11.5, color: W55, margin: '3px 0 0', letterSpacing: '0.3px' }}>{dateHijri}</p>}
        </div>

        {/* carte prière */}
        <Link href="/prieres" className="hero-in carte-priere-hero" style={{
          display: 'block', textDecoration: 'none', position: 'relative',
          background: 'rgba(255,255,255,0.10)',
          borderRadius: 18, border: '1px solid rgba(255,255,255,0.18)',
          padding: 14, overflow: 'hidden',
          animationDelay: '90ms',
        }}>
          {/* reflet subtil */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.30), transparent)' }} />
          {prochaine ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: W55, letterSpacing: '1.2px', textTransform: 'uppercase', margin: 0 }}>
                    Prochaine prière{ville ? `  ·  ${ville}` : ''}
                  </p>
                  <p style={{ fontSize: 27, fontWeight: 700, color: '#fff', margin: '4px 0 0', lineHeight: 1.1 }}>{prochaine.nom}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 23, fontWeight: 700, color: '#fff', margin: 0, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{prochaine.heure}</p>
                  <span style={{ display: 'inline-block', background: OR, borderRadius: 999, padding: '3px 9px', marginTop: 6, fontSize: 10.5, fontWeight: 600, color: NUIT, fontVariantNumeric: 'tabular-nums' }}>
                    dans {tempsRestant(prochaine.heure)}
                  </span>
                </div>
              </div>

              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)', marginTop: 14, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: OR, width: `${prog * 100}%`, transition: 'width 0.6s ease' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, marginTop: 12 }}>
                {prieres.map(p => {
                  const actif = p.nom === prochaine.nom
                  return (
                    <div key={p.nom} style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                      padding: '6px 2px', borderRadius: 12,
                      background: actif ? 'rgba(214,173,58,0.16)' : 'transparent',
                    }}>
                      <span style={{ fontSize: 10.5, fontWeight: actif ? 700 : 500, color: actif ? OR : W55 }}>{p.nom}</span>
                      <span style={{ fontSize: 11.5, fontWeight: actif ? 700 : 400, color: actif ? OR : W70, fontVariantNumeric: 'tabular-nums' }}>{p.heure}</span>
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
          borderRadius: 16, overflow: 'hidden', padding: 12, position: 'relative',
          background: `linear-gradient(135deg, ${BG_MID}, ${NUIT})`,
        }}
      >
        <Motif opacite={0.04} />
        <button
          onClick={e => { e.stopPropagation(); toggleLecture() }}
          aria-label={enLecture ? 'Pause' : 'Lecture'}
          className="btn-or"
          style={{
            width: 44, height: 44, borderRadius: 22, flexShrink: 0, border: 'none', cursor: 'pointer',
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
          <TitreDefilant texte={piste.titre} style={{ fontSize: 14, fontWeight: 600, color: '#fff' }} />
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
  { label: 'Heures de prières', href: '/prieres', Icon: IcoMosque },
  { label: 'Khoutbah', href: '/khoutbah', Icon: IcoMosqueBat },
  { label: 'Coran', href: '/coran', Icon: IcoCoran },
]

function Explorer() {
  return (
    <section style={{ maxWidth: 1040, margin: '0 auto', padding: '36px 24px 0', width: '100%' }}>
      <Reveal>
        <EnTete eyebrow="La plateforme" titre="Tout ce dont tu as besoin" />
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {MODULES.map(({ label, href, Icon }, i) => (
          <Reveal key={href} delay={i * 90}>
            <Link href={href} className="carte-module" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 13, height: '100%',
              background: '#fff', borderRadius: 22, padding: '20px 12px 18px', textDecoration: 'none',
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
                width: 50, height: 50, borderRadius: 16,
                background: `linear-gradient(135deg, ${BG_TOP}, ${BG_BOT})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 18px rgba(45,87,140,0.28)', position: 'relative',
                transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s',
              }}>
                <Icon size={24} color="#fff" />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--texte)', margin: 0, letterSpacing: '-0.2px', textAlign: 'center', lineHeight: 1.3 }}>{label}</h3>
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
    <section style={{ maxWidth: 1040, margin: '0 auto', padding: '38px 24px 0', width: '100%' }}>
      <Reveal>
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 28,
          background: `linear-gradient(150deg, ${NUIT} 0%, #16294a 100%)`,
          padding: 'clamp(20px, 3.5vw, 30px)',
        }}>
          <Motif opacite={0.05} />
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(214,173,58,0.13) 0%, transparent 65%)', top: -120, right: -80 }} />
          <div style={{ position: 'relative', maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <IcoQuote size={30} color={OR} />
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.4px', color: OR, textTransform: 'uppercase', margin: '0 0 16px' }}>Hadith du jour</p>
            <p style={{ fontSize: 'clamp(15px, 2.4vw, 17px)', color: W90, lineHeight: 1.75, margin: 0, fontWeight: 500 }}>
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
      <div className="hero-in" style={{ maxWidth: 700, margin: '-24px auto 0', padding: '0 24px', position: 'relative', zIndex: 20, width: '100%', animationDelay: '170ms' }}>
        <RechercheLive />
      </div>

      <CarteReprendre />
      <Explorer />
      <HadithDuJour />

      <div style={{ height: 64 }} />
      <Footer />

      <style>{`
        /* entrées du héros au chargement */
        .hero-in { animation: heroIn 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes heroIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

        /* fond aurore : trois nappes qui dérivent lentement */
        .aurore { position: absolute; border-radius: 50%; filter: blur(18px); pointer-events: none; will-change: transform, opacity; }
        .aurore-1 { animation: aurore1 17s ease-in-out infinite alternate; }
        .aurore-2 { animation: aurore2 23s ease-in-out infinite alternate; }
        .aurore-3 { animation: aurore3 29s ease-in-out infinite alternate; }
        @keyframes aurore1 { from { opacity: 0.18; transform: none; } to { opacity: 0.30; transform: translate(55px, 38px) scale(1.12); } }
        @keyframes aurore2 { from { opacity: 0.14; transform: none; } to { opacity: 0.26; transform: translate(-48px, -30px) scale(1.10); } }
        @keyframes aurore3 { from { opacity: 0.30; transform: none; } to { opacity: 0.46; transform: translateX(34px) scale(1.08); } }

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

        .lien-voir-tout:hover .lien-fleche { transform: translateX(3px); }

        @media (prefers-reduced-motion: reduce) {
          .hero-in { animation: none; }
          .aurore-1, .aurore-2, .aurore-3 { animation: none; }
        }
      `}</style>
    </main>
  )
}
