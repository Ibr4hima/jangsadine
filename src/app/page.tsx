'use client'
import Footer from '@/components/Footer'
import MiniEgaliseur from '@/components/MiniEgaliseur'
import Navbar from '@/components/Navbar'
import RechercheLive from '@/components/RechercheLive'
import TitreDefilant from '@/components/TitreDefilant'
import { useAudio } from '@/contexts/AudioContext'
import { QURAN_ICON_URI } from '@/lib/quranIcon'
import * as adhan from 'adhan'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useRef, useState } from 'react'

// ─── palette héros (bleu logo) — identique à l'app ───────────
const BG_TOP = '#3d6ba3'
const BG_MID = '#2d578c'
const BG_BOT = '#234a7a'
const W90 = 'rgba(255,255,255,0.90)'
const W70 = 'rgba(255,255,255,0.70)'
const W55 = 'rgba(255,255,255,0.55)'
const W18 = 'rgba(255,255,255,0.18)'
const W10 = 'rgba(255,255,255,0.10)'
const BLEU = '#2d578c'
const OR = '#d6ad3a'
const NUIT = '#1c3d66'

// Teinte unique des tuiles, cohérente avec le bleu du logo / des héros
const TUILE_G1 = '#3d6ba3'
const TUILE_G2 = '#234a7a'

// ─── icônes Material Symbols (identiques à l'app) ────────────
type IcoProps = { size?: number; color?: string }
const Svg = ({ d, size = 24, color = BLEU }: { d: string } & IcoProps) => (
  <svg width={size} height={size} viewBox="0 -960 960 960"><path d={d} fill={color} /></svg>
)
const IcoHeadphones = (p: IcoProps) => <Svg {...p} d="M360-120H200q-33 0-56.5-23.5T120-200v-280q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480v280q0 33-23.5 56.5T760-120H600v-320h160v-40q0-117-81.5-198.5T480-760q-117 0-198.5 81.5T200-480v40h160v320Z" />
const IcoMosque = (p: IcoProps) => <Svg {...p} d="m521-500 59-43 58 43-23-68 59-43h-72l-22-69-22 69h-73l59 43-23 68Zm-41 220q83 0 141.5-58T680-480q0-8-.5-16t-2.5-16q-11 47-49 77.5T539-404q-60 0-101-41t-41-101q0-46 26-82.5t68-51.5h-11q-84 0-142 58.5T280-480q0 84 58 142t142 58Zm0 252L346-160H160v-186L28-480l132-134v-186h186l134-132 134 132h186v186l132 134-132 134v186H614L480-28Zm0-112 100-100h140v-140l100-100-100-100v-140H580L480-820 380-720H240v140L140-480l100 100v140h140l100 100Zm0-340Z" />
const IcoCompass = (p: IcoProps) => <Svg {...p} d="M516-120 402-402 120-516v-56l720-268-268 720h-56Zm26-148 162-436-436 162 196 78 78 196Zm-78-196Z" />
const IcoPlay = ({ size = 18, color = '#fff' }: IcoProps) => <Svg size={size} color={color} d="M320-200v-560l440 280-440 280Z" />
const IcoChevron = ({ size = 18, color = '#bbb' }: IcoProps) => <Svg size={size} color={color} d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
const IcoMic = (p: IcoProps) => <Svg {...p} d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm-40 280v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Z" />
const IcoMosqueBat = (p: IcoProps) => <Svg {...p} d="M40-120v-509q-18-11-29-27T0-692.13q0-20.12 20.5-49Q41-770 70-798q29 28 49.5 56.87 20.5 28.88 20.5 49Q140-672 129-656q-11 16-29 27v189h110v-102q0-24 18.5-43t47.5-19q-13-22-19.5-43t-6.5-40.62q0-37.38 17.5-69.88Q285-790 316-810l164-110 164 110q31 20 48.5 52.5t17.5 69.88q0 19.62-6.5 40.62-6.5 21-19.5 43 29 0 47.5 19t18.5 43v102h110v-189q-18-11-29-27t-11-36.13q0-20.12 20.5-49Q861-770 890-798q29 28 49.5 56.87 20.5 28.88 20.5 49Q960-672 949-656q-11 16-29 27.39V-120H530v-160q0-21.25-14.32-35.63Q501.35-330 480.18-330q-21.18 0-35.68 14.37Q430-301.25 430-280v160H40Zm356-482h168q36.21 0 61.11-24.75Q650-651.5 650-687.5q0-22.5-10.5-41.5t-27.29-30.58L480-848l-132.21 88.42Q331-748 320.5-729T310-687.5q0 36 24.89 60.75Q359.79-602 396-602ZM100-180h270v-100q0-45.83 32.12-77.92 32.12-32.08 78-32.08T558-357.92q32 32.09 32 77.92v100h270v-200H690v-162H270v162H100v200Zm380-362Zm0-60Zm0-2Z" />
const IcoQuestion = (p: IcoProps) => <Svg {...p} d="M560-360q17 0 29.5-12.5T602-402q0-17-12.5-29.5T560-444q-17 0-29.5 12.5T518-402q0 17 12.5 29.5T560-360Zm-30-128h60q0-29 6-42.5t28-35.5q30-30 40-48.5t10-43.5q0-45-31.5-73.5T560-760q-41 0-71.5 23T446-676l54 22q9-25 24.5-37.5T560-704q24 0 39 13.5t15 36.5q0 14-8 26.5T578-596q-33 29-40.5 45.5T530-488ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" />
const IcoQuote = ({ size = 26, color = OR }: IcoProps) => <Svg size={size} color={color} d="m228-240 92-160q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 23-5.5 42.5T458-480L320-240h-92Zm360 0 92-160q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 23-5.5 42.5T818-480L680-240h-92Z" />
const IcoShare = ({ size = 16, color = BLEU }: IcoProps) => <Svg size={size} color={color} d="M680-80q-50 0-85-35t-35-85q0-6 3-28L282-392q-16 15-37 23.5t-45 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 8.5t37 23.5l281-164q-2-7-2.5-13.5T560-760q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-24 0-45-8.5T598-672L317-508q2 7 2.5 13.5t.5 14.5q0 8-.5 14.5T317-452l281 164q16-15 37-23.5t45-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM200-440q17 0 28.5-11.5T240-480q0-17-11.5-28.5T200-520q-17 0-28.5 11.5T160-480q0 17 11.5 28.5T200-440Zm480-280q17 0 28.5-11.5T720-760q0-17-11.5-28.5T680-800q-17 0-28.5 11.5T640-760q0 17 11.5 28.5T680-720Z" />
// Taille de la calligraphie dans sa tuile : plus grande que les glyphes en
// trait (29) car une calligraphie détaillée devient illisible à 29px.
const CORAN_ICON = 48
const IcoCoran = (_p: IcoProps) => <img src={QURAN_ICON_URI} alt="" style={{ width: CORAN_ICON, height: CORAN_ICON, objectFit: 'contain' }} />

// ─── fond « aurore » : réplique EXACTE du FondAurore compact ──
// Trois nappes bleues qui dérivent très lentement (17 s / 23 s / 29 s,
// aller-retour). Transforms + opacité uniquement.
function FondAurore() {
  return (
    <>
      <div className="aurore aurore-1" style={{ width: 380, height: 380, background: 'rgb(120,165,220)', top: -160, right: -120 }} />
      <div className="aurore aurore-2" style={{ width: 300, height: 300, background: 'rgb(90,140,200)', bottom: -120, left: -90 }} />
      <div className="aurore aurore-3" style={{ width: 340, height: 340, background: 'rgb(30,64,106)', bottom: -170, right: -80 }} />
    </>
  )
}

// ─── apparition (équivalent FadeInDown) ───────────────────────
function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(20px)',
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

// ─── helpers prières (identiques à l'app) ─────────────────────
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

// ─── hadith du jour (identiques à l'app) ──────────────────────
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

// ─── héros : date + carte prière (réplique exacte) ────────────
function Hero() {
  const [prieres, setPrieres] = useState<Priere[]>([])
  const [ville, setVille] = useState<string | null>(null)
  const [, setTickTexte] = useState(0)
  const [prog, setProg] = useState(0)

  useEffect(() => {
    // Le texte du compte à rebours se rafraîchit chaque minute
    const ivTexte = setInterval(() => setTickTexte(t => t + 1), 60 * 1000)
    return () => clearInterval(ivTexte)
  }, [])

  useEffect(() => {
    const calculer = (latitude: number, longitude: number, countryCode: string) => {
      const coords = new adhan.Coordinates(latitude, longitude)
      const times = new adhan.PrayerTimes(coords, new Date(), getMethode(countryCode))
      setPrieres([
        { nom: 'Fajr', heure: fmtH(times.fajr) },
        { nom: 'Dhuhr', heure: fmtH(times.dhuhr) },
        { nom: 'Asr', heure: fmtH(times.asr) },
        { nom: 'Maghrib', heure: fmtH(times.maghrib) },
        { nom: 'Isha', heure: fmtH(times.isha) },
      ])
    }

    // Affichage instantané depuis le cache, GPS frais ensuite
    try {
      const posRaw = localStorage.getItem('jsd_derniere_pos')
      const geoRaw = localStorage.getItem('jsd_prieres_geo')
      if (posRaw) {
        const p = JSON.parse(posRaw)
        let countryCode = 'FR'
        if (geoRaw) {
          const g = JSON.parse(geoRaw)
          if (g?.ville) setVille(String(g.ville).split(',')[0].trim())
          if (g?.countryCode) countryCode = g.countryCode
        }
        if (typeof p?.lat === 'number' && typeof p?.lng === 'number') calculer(p.lat, p.lng, countryCode)
      }
    } catch { }

    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        const geo = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`)
        const gd = await geo.json()
        const cc = gd.countryCode || 'FR'
        const nomVille = (gd.city || gd.locality || '').replace(/\s*\(.*\)\s*/g, '').trim()
        if (nomVille) setVille(nomVille)
        calculer(latitude, longitude, cc)
        try {
          localStorage.setItem('jsd_derniere_pos', JSON.stringify({ lat: latitude, lng: longitude }))
          localStorage.setItem('jsd_prieres_geo', JSON.stringify({ ville: nomVille, countryCode: cc }))
        } catch { }
      } catch { }
    }, () => { })
  }, [])

  const now = new Date()
  const nowM = now.getHours() * 60 + now.getMinutes()
  const idx = prieres.findIndex(p => enMinutes(p.heure) > nowM)
  const prochaine = prieres.length ? (idx === -1 ? prieres[0] : prieres[idx]) : null
  const precedente = prieres.length ? (idx <= 0 ? prieres[4] : prieres[idx - 1]) : null

  useEffect(() => {
    if (prochaine && precedente) setProg(progressEntre(precedente, prochaine))
  }, [prochaine, precedente])

  const dateFr = capitaliser(now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
  let dateHijri = ''
  try { dateHijri = new Intl.DateTimeFormat('fr-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(now) } catch { }

  return (
    <div style={{ position: 'relative', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' }}>
      {/* dégradé exact de l'app : [0, 0.55, 1] */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_MID} 55%, ${BG_BOT} 100%)` }} />
      {/* fond « aurore » : nappes bleues en dérive lente */}
      <FondAurore />

      {/* paddingTop insets+8 · H 24 · bottom 24+26 */}
      <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '10px 24px 50px' }}>

        {/* date */}
        <div className="hero-in" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px', margin: 0 }}>{dateFr}</p>
          {dateHijri && <p style={{ fontSize: 12, color: W55, margin: '3px 0 0', letterSpacing: '0.3px' }}>{dateHijri}</p>}
        </div>

        {/* carte prière */}
        <Link href="/prieres" className="hero-in carte-priere" style={{
          display: 'block', textDecoration: 'none',
          background: W10,
          borderRadius: 20, border: `1px solid ${W18}`,
          padding: 16,
          animationDelay: '80ms',
        }}>
          {prochaine ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 500, color: W55, letterSpacing: '1.2px', textTransform: 'uppercase', margin: 0 }}>
                    Prochaine prière{ville ? `  ·  ${ville}` : ''}
                  </p>
                  <p style={{ fontSize: 30, fontWeight: 700, color: '#fff', margin: '4px 0 0', lineHeight: 1.15 }}>{prochaine.nom}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0, fontVariantNumeric: 'tabular-nums', lineHeight: 1.15 }}>{prochaine.heure}</p>
                  <span style={{ display: 'inline-block', background: OR, borderRadius: 999, padding: '4px 10px', marginTop: 6, fontSize: 11, fontWeight: 600, color: NUIT, fontVariantNumeric: 'tabular-nums' }}>
                    dans {tempsRestant(prochaine.heure)}
                  </span>
                </div>
              </div>

              {/* progression entre les deux prières */}
              <div style={{ height: 5, borderRadius: 3, background: W18, marginTop: 16, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: OR, width: `${prog * 100}%`, transition: 'width 0.6s ease' }} />
              </div>

              {/* les 5 horaires — la prochaine est mise en avant dans une pastille */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                {prieres.map(p => {
                  const actif = p.nom === prochaine.nom
                  return (
                    <div key={p.nom} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 56,
                      padding: '7px 0', borderRadius: 14,
                      background: actif ? 'rgba(214,173,58,0.16)' : 'transparent',
                    }}>
                      <span style={{ fontSize: 11, fontWeight: actif ? 700 : 500, color: actif ? OR : W55 }}>{p.nom}</span>
                      <span style={{ fontSize: 12, fontWeight: actif ? 700 : 400, color: actif ? OR : W70, fontVariantNumeric: 'tabular-nums' }}>{p.heure}</span>
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

// ─── reprendre l'écoute (réplique exacte) ─────────────────────
function CarteReprendre() {
  const router = useRouter()
  const { piste, enLecture, toggleLecture } = useAudio()
  if (!piste) return null
  return (
    <div className="hero-in" style={{ maxWidth: 688, margin: '16px auto 0', padding: '0 24px', width: '100%', animationDelay: '80ms' }}>
      <div
        onClick={() => { if (piste.href) router.push(piste.href) }}
        className="carte-reprendre"
        style={{
          display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          borderRadius: 20, overflow: 'hidden', padding: 16,
          background: `linear-gradient(135deg, ${BLEU}, ${NUIT})`,
        }}
      >
        <button
          onClick={e => { e.stopPropagation(); toggleLecture() }}
          aria-label={enLecture ? 'Pause' : 'Lecture'}
          className="btn-or"
          style={{
            width: 52, height: 52, borderRadius: 26, flexShrink: 0, border: 'none', cursor: 'pointer',
            background: OR,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 6px rgba(0,0,0,0.25)',
          }}
        >
          {enLecture ? <MiniEgaliseur color={NUIT} /> : <IcoPlay size={20} color={NUIT} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.55)', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 3px' }}>
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

// ─── accès rapide (réplique exacte : 2×2 + raccourcis pills) ──
const SECTIONS = [
  { label: 'Cours audio', icon: IcoHeadphones, href: '/audio' },
  { label: 'Heures de prières', icon: IcoMosque, href: '/prieres' },
  { label: 'Coran', icon: IcoCoran, href: '/coran' },
  { label: 'Qibla', icon: IcoCompass, href: '/qibla' },
]

const RACCOURCIS = [
  { label: 'Conférences', icon: IcoMic, href: '/conferences' },
  { label: 'Khoutbah', icon: IcoMosqueBat, href: '/khoutbah' },
  { label: 'Fatwas', icon: IcoQuestion, href: '/fatwas' },
]

function AccesRapide() {
  return (
    <div style={{ maxWidth: 688, margin: '0 auto', padding: '24px 24px 0', width: '100%' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--texte)', margin: '0 0 12px' }}>Accès rapide</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {SECTIONS.map((s, i) => {
          const Icon = s.icon
          return (
            <Reveal key={s.label} delay={140 + i * 70}>
              <Link href={s.href} className="carte-acces" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: '#fff', borderRadius: 26,
                padding: '24px 12px',
                position: 'relative', overflow: 'hidden', textDecoration: 'none',
                boxShadow: '0 10px 22px rgba(42,59,82,0.10)',
              }}>
                {/* halos décoratifs teintés */}
                <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, background: TUILE_G1, opacity: 0.06, top: -46, right: -34 }} />
                <div style={{ position: 'absolute', width: 70, height: 70, borderRadius: 35, background: TUILE_G2, opacity: 0.04, bottom: -24, left: -16 }} />

                {/* tuile icône en dégradé + halo coloré */}
                <div style={{
                  width: 60, height: 60, borderRadius: 20, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                  background: `linear-gradient(135deg, ${TUILE_G1}, ${TUILE_G2})`,
                  boxShadow: `0 7px 12px rgba(35,74,122,0.34)`,
                }}>
                  <Icon size={29} color="#fff" />
                </div>

                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--texte)', textAlign: 'center' }}>{s.label}</span>
              </Link>
            </Reveal>
          )
        })}
      </div>

      {/* raccourcis secondaires */}
      <Reveal delay={420}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 0', flexWrap: 'wrap' }}>
          {RACCOURCIS.map(r => {
            const Icon = r.icon
            return (
              <Link key={r.label} href={r.href} className="pill-raccourci" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: '#fff',
                border: '1px solid var(--bordure)',
                borderRadius: 999,
                padding: '9px 12px', textDecoration: 'none',
              }}>
                <Icon size={16} color={BLEU} />
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--texte)' }}>{r.label}</span>
              </Link>
            )
          })}
        </div>
      </Reveal>
    </div>
  )
}

// ─── hadith du jour (réplique exacte : carte blanche + partage) ─
function HadithDuJour() {
  const [hadith, setHadith] = useState<typeof HADITHS[number] | null>(null)
  useEffect(() => {
    const jour = Math.floor(Date.now() / 86400000)
    setHadith(HADITHS[jour % HADITHS.length])
  }, [])
  if (!hadith) return <div style={{ height: 120 }} />

  const partager = () => {
    const message = `« ${hadith.texte} »\n— Rapporté par ${hadith.source}`
    if (navigator.share) navigator.share({ text: message }).catch(() => { })
    else navigator.clipboard?.writeText(message).catch(() => { })
  }

  return (
    <div style={{ maxWidth: 688, margin: '0 auto', padding: '0 24px', width: '100%' }}>
      <Reveal delay={100}>
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: 16,
          overflow: 'hidden',
          boxShadow: '0 8px 18px rgba(58,74,92,0.06)',
        }}>
          {/* en-tête : label + bouton partager */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 15,
              background: 'rgba(39,76,122,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: 8, flexShrink: 0,
            }}>
              <IcoQuote size={16} color={BLEU} />
            </div>
            <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: BLEU, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              Hadith du jour
            </span>
            <button onClick={partager} aria-label="Partager" className="btn-partage" style={{
              width: 32, height: 32, borderRadius: 16, flexShrink: 0,
              background: 'rgba(39,76,122,0.08)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IcoShare size={14} color={BLEU} />
            </button>
          </div>

          <p style={{ fontSize: 15, color: 'var(--texte)', lineHeight: '26px', margin: 0 }}>
            « {hadith.texte} »
          </p>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--texte-muted)', margin: '8px 0 0' }}>
            — Rapporté par {hadith.source}
          </p>
        </div>
      </Reveal>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────
export default function Accueil() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Hero />

      {/* recherche — chevauche le bas du héros */}
      <div className="hero-in" style={{ maxWidth: 688, margin: '-26px auto 0', padding: '0 24px', position: 'relative', zIndex: 20, width: '100%' }}>
        <RechercheLive />
      </div>

      <CarteReprendre />
      <AccesRapide />
      <HadithDuJour />

      <div style={{ height: 32 }} />
      <Footer />

      <style>{`
        /* entrées au chargement (équivalent FadeInDown) */
        .hero-in { animation: heroIn 0.5s ease both; }
        @keyframes heroIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* fond aurore — valeurs EXACTES du FondAurore compact de l'app */
        .aurore { position: absolute; border-radius: 50%; pointer-events: none; will-change: transform, opacity; }
        .aurore-1 { animation: aurore1 17s ease-in-out infinite alternate; }
        .aurore-2 { animation: aurore2 23s ease-in-out infinite alternate; }
        .aurore-3 { animation: aurore3 29s ease-in-out infinite alternate; }
        @keyframes aurore1 { from { opacity: 0.09; transform: none; } to { opacity: 0.16; transform: translate(55px, 38px) scale(1.12); } }
        @keyframes aurore2 { from { opacity: 0.07; transform: none; } to { opacity: 0.14; transform: translate(-48px, -30px) scale(1.10); } }
        @keyframes aurore3 { from { opacity: 0.22; transform: none; } to { opacity: 0.36; transform: translateX(34px) scale(1.08); } }

        /* équivalents PressableScale */
        .carte-priere { transition: transform 0.15s ease; }
        .carte-priere:active { transform: scale(0.96); }
        .carte-reprendre { transition: transform 0.15s ease; }
        .carte-reprendre:active { transform: scale(0.98); }
        .btn-or { transition: transform 0.15s ease; }
        .btn-or:active { transform: scale(0.9); }
        .carte-acces { transition: transform 0.15s ease, box-shadow 0.2s; }
        .carte-acces:hover { box-shadow: 0 14px 30px rgba(42,59,82,0.14); }
        .carte-acces:active { transform: scale(0.96); }
        .pill-raccourci { transition: transform 0.15s ease, border-color 0.15s; }
        .pill-raccourci:hover { border-color: #2d578c; }
        .pill-raccourci:active { transform: scale(0.95); }
        .btn-partage { transition: transform 0.15s ease; }
        .btn-partage:active { transform: scale(0.9); }

        @media (prefers-reduced-motion: reduce) {
          .hero-in { animation: none; }
          .aurore-1, .aurore-2, .aurore-3 { animation: none; }
        }
      `}</style>
    </main>
  )
}
