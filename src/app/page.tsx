'use client'
import Footer from '@/components/Footer'
import MiniEgaliseur from '@/components/MiniEgaliseur'
import Navbar from '@/components/Navbar'
import RechercheLive from '@/components/RechercheLive'
import TitreDefilant from '@/components/TitreDefilant'
import { useAudio } from '@/contexts/AudioContext'
import { supabase } from '@/lib/supabase'
import * as adhan from 'adhan'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// ─── palette identique à l'app ───────────────────────────────
const BLEU = '#2d578c'
const OR = '#d6ad3a'
const BG_TOP = '#3d6ba3'
const BG_MID = '#2d578c'
const BG_BOT = '#234a7a'
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

// ─── Héros (date + carte prière) ──────────────────────────────
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
    <div style={{ position: 'relative', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_MID} 55%, ${BG_BOT} 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% -20%, rgba(255,255,255,0.12), transparent 55%)' }} />
      <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'rgba(140,180,230,0.14)', top: -160, right: -120 }} />
      <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'rgba(214,173,58,0.09)', bottom: -120, left: -90 }} />

      <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '26px 24px 52px' }}>
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', margin: 0 }}>{dateFr}</p>
          {dateHijri && <p style={{ fontSize: 12.5, color: 'rgba(214,173,58,0.85)', margin: '3px 0 0', letterSpacing: '0.2px' }}>{dateHijri}</p>}
        </div>

        <Link href="/prieres" className="carte-priere-hero" style={{
          display: 'block', textDecoration: 'none',
          background: 'rgba(255,255,255,0.09)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          borderRadius: 24, border: '1px solid rgba(255,255,255,0.16)',
          padding: 20,
          boxShadow: '0 16px 40px rgba(10,25,50,0.28), inset 0 1px 0 rgba(255,255,255,0.18)',
        }}>
          {prochaine ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: OR, boxShadow: `0 0 8px ${OR}`, flexShrink: 0 }} />
                    <p style={{ fontSize: 11, fontWeight: 600, color: W70, letterSpacing: '1.4px', textTransform: 'uppercase', margin: 0 }}>
                      Prochaine prière{ville ? ` · ${ville}` : ''}
                    </p>
                  </div>
                  <p style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '8px 0 0', letterSpacing: '-0.5px', lineHeight: 1 }}>{prochaine.nom}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 30, fontWeight: 700, color: '#fff', margin: 0, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{prochaine.heure}</p>
                  <span style={{ display: 'inline-block', background: OR, borderRadius: 999, padding: '4px 11px', marginTop: 10, fontSize: 11, fontWeight: 700, color: NUIT, fontVariantNumeric: 'tabular-nums', boxShadow: '0 4px 14px rgba(214,173,58,0.45)' }}>
                    dans {tempsRestant(prochaine.heure)}
                  </span>
                </div>
              </div>

              <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.16)', marginTop: 18, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${OR}, #f0cd6e)`, width: `${prog * 100}%`, transition: 'width 0.6s ease', boxShadow: '0 0 12px rgba(214,173,58,0.6)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, marginTop: 14 }}>
                {prieres.map(p => {
                  const actif = p.nom === prochaine.nom
                  return (
                    <div key={p.nom} style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      padding: '7px 2px', borderRadius: 12,
                      background: actif ? 'rgba(214,173,58,0.16)' : 'transparent',
                      border: `1px solid ${actif ? 'rgba(214,173,58,0.35)' : 'transparent'}`,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: actif ? 700 : 500, color: actif ? OR : W55 }}>{p.nom}</span>
                      <span style={{ fontSize: 12.5, fontWeight: actif ? 700 : 500, color: actif ? '#fff' : W70, fontVariantNumeric: 'tabular-nums' }}>{p.heure}</span>
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

// ─── Reprendre l'écoute (visible si une piste est active) ─────
function CarteReprendre() {
  const router = useRouter()
  const { piste, enLecture, toggleLecture } = useAudio()
  if (!piste) return null
  return (
    <div className="appear" style={{ maxWidth: 680, margin: '16px auto 0', padding: '0 24px', width: '100%' }}>
      <div
        onClick={() => { if (piste.href) router.push(piste.href) }}
        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderRadius: 20, overflow: 'hidden', padding: 16, background: `linear-gradient(135deg, ${BG_MID}, ${NUIT})` }}
      >
        <button
          onClick={e => { e.stopPropagation(); toggleLecture() }}
          style={{ width: 52, height: 52, borderRadius: 26, flexShrink: 0, border: 'none', cursor: 'pointer', background: OR, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 6px rgba(0,0,0,0.25)' }}
        >
          {enLecture
            ? <MiniEgaliseur color={NUIT} />
            : <svg width="20" height="20" viewBox="0 -960 960 960"><path d="M320-200v-560l440 280-440 280Z" fill={NUIT} /></svg>}
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

// ─── La plateforme : 4 modules ────────────────────────────────
const MODULES = [
  { label: 'Cours audio', href: '/audio', Icon: IcoHeadphones },
  { label: 'Conférences', href: '/conferences', Icon: IcoMic },
  { label: 'Khoutbah', href: '/khoutbah', Icon: IcoMosqueBat },
  { label: 'Heures de prières', href: '/prieres', Icon: IcoMosque },
]

function Plateforme() {
  return (
    <section style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 24px 0', width: '100%' }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.8px', color: OR, textTransform: 'uppercase', margin: '0 0 6px' }}>La plateforme</p>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--texte)', margin: '0 0 20px' }}>Tout ce dont tu as besoin</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {MODULES.map(({ label, href, Icon }, i) => (
          <Link key={href} href={href} className="carte-module appear" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            background: '#fff', borderRadius: 24, padding: '34px 16px', textDecoration: 'none',
            border: '1px solid #edf1f7',
            boxShadow: '0 10px 30px rgba(45,87,140,0.06)', animationDelay: `${i * 70}ms`,
          }}>
            <div className="module-tile" style={{
              width: 66, height: 66, borderRadius: 22,
              background: 'linear-gradient(135deg, #eaf2fc 0%, #d2e3f7 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(45,87,140,0.16)',
            }}>
              <Icon size={31} color={BLEU} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--texte)', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
          </Link>
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
    supabase.from('cours').select('id, titre, sheikh, nb_episodes, categories(nom)').order('created_at', { ascending: false }).limit(3)
      .then(({ data }) => { if (data) setCours(data as unknown as CoursApercu[]) })
  }, [])

  const ouvrirCategorie = (slug: string) => {
    sessionStorage.setItem('categorie:/audio', slug)
    router.push('/audio')
  }

  return (
    <section style={{ maxWidth: 1040, margin: '0 auto', padding: '48px 24px 0', width: '100%' }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.8px', color: OR, textTransform: 'uppercase', margin: '0 0 6px' }}>Bibliothèque</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--texte)', margin: 0 }}>Dourous</h2>
        <Link href="/audio" style={{ fontSize: 13, fontWeight: 600, color: BLEU }}>Voir tout →</Link>
      </div>

      {/* chips catégories */}
      {categories.length > 0 && (
        <div className="chips-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
          {categories.map(c => (
            <button key={c.slug} onClick={() => ouvrirCategorie(c.slug)} className="chip-neutre" style={{
              flexShrink: 0, padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
              background: '#fff', border: '1px solid #e2e7ee', color: '#5b6675',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              {c.nom}
            </button>
          ))}
        </div>
      )}

      {/* derniers cours */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cours.map((c, i) => {
          const nomCat = c.categories?.nom ?? ''
          return (
            <Link key={c.id} href={`/audio/${c.id}`} className="carte-piste appear" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: '#fff', borderRadius: 18, padding: 12,
              boxShadow: '0 4px 10px rgba(58,74,92,0.06)', textDecoration: 'none',
              animationDelay: `${i * 60}ms`,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: '#e8f0f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 -960 960 960"><path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-460v-380h240v120H560v400q0 66-47 113t-113 47Z" fill={BLEU} /></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <TitreDefilant texte={c.titre} style={{ fontSize: 15, fontWeight: 600, color: 'var(--texte)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  {nomCat && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#eef1f5', color: '#6b7686' }}>{nomCat}</span>}
                  <span style={{ fontSize: 12, color: 'var(--texte-muted)' }}>{c.sheikh}{c.nb_episodes ? ` · ${c.nb_episodes} épisode${c.nb_episodes > 1 ? 's' : ''}` : ''}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
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
      <div className="appear" style={{ maxWidth: 680, margin: '-26px auto 0', padding: '0 24px', position: 'relative', zIndex: 20, width: '100%' }}>
        <RechercheLive />
      </div>

      <CarteReprendre />
      <Plateforme />
      <Dourous />

      <div style={{ height: 56 }} />
      <Footer />

      <style>{`
        .chips-scroll::-webkit-scrollbar { display: none; }
        .chips-scroll { scrollbar-width: none; }
        .chip-neutre { transition: border-color 0.15s, color 0.15s, background 0.15s; }
        .chip-neutre:hover { border-color: #2d578c; color: #2d578c; background: #f5f9fe; }
        .carte-priere-hero { transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; }
        .carte-priere-hero:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.28); box-shadow: 0 22px 50px rgba(10,25,50,0.34), inset 0 1px 0 rgba(255,255,255,0.22); }
        .appear { animation: appearUp 0.5s ease both; }
        @keyframes appearUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .carte-module { transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s; }
        .carte-module:hover { transform: translateY(-4px); box-shadow: 0 20px 44px rgba(45,87,140,0.15); }
        .module-tile { transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s; }
        .carte-module:hover .module-tile { transform: scale(1.06); box-shadow: 0 12px 22px rgba(45,87,140,0.22); }
        .carte-piste { transition: box-shadow 0.15s, transform 0.1s; }
        .carte-piste:hover { box-shadow: 0 6px 18px rgba(58,74,92,0.10); transform: translateY(-1px); }
      `}</style>
    </main>
  )
}
