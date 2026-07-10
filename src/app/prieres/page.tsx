'use client'
import FondAurore from '@/components/FondAurore'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import * as adhan from 'adhan'
import {
  CloudMoon,
  CloudSun,
  Hourglass,
  MapPin,
  Moon,
  MoonStar,
  Sun,
  Sunrise,
  Sunset,
} from 'lucide-react'
import { ComponentType, useEffect, useState } from 'react'

type PriereInfo = { nom: string; heure: string; cle: string }

// ─── palette (identique à l'app) ──────────────────────────────
const BLEU = '#2d578c'
const OR = '#d6ad3a'
const BG_TOP = '#3d6ba3'
const BG_MID = '#2d578c'
const BG_BOT = '#234a7a'
const NUIT_TOP = '#1c3d66'
const NUIT_BOT = '#13294a'
const W90 = 'rgba(255,255,255,0.90)'
const W70 = 'rgba(255,255,255,0.70)'
const W55 = 'rgba(255,255,255,0.55)'
const W18 = 'rgba(255,255,255,0.18)'
const W10 = 'rgba(255,255,255,0.10)'

// ─── helpers temps ────────────────────────────────────────────
function enMinutes(h: string) { const [hh, mm] = h.split(':').map(Number); return hh * 60 + mm }
function nowMin() { const n = new Date(); return n.getHours() * 60 + n.getMinutes() }
function fmt(date: Date) {
  return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0')
}
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
// Fraction écoulée entre la prière précédente et la prochaine
function progressEntre(prevHeure: string, nextHeure: string): number {
  const now = new Date()
  const n = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const a = enMinutes(prevHeure) * 60
  let b = enMinutes(nextHeure) * 60
  let x = n
  if (b <= a) b += 86400
  if (x < a) x += 86400
  return Math.max(0, Math.min(1, (x - a) / (b - a)))
}
function calculerMoitieNuit(maghrib: string, fajr: string): string {
  const maghribMin = enMinutes(maghrib)
  let fajrMin = enMinutes(fajr)
  if (fajrMin < maghribMin) fajrMin += 1440
  const milieu = maghribMin + Math.floor((fajrMin - maghribMin) / 2)
  return (Math.floor(milieu / 60) % 24).toString().padStart(2, '0') + ':' + (milieu % 60).toString().padStart(2, '0')
}
function calculerDernierTiers(maghrib: string, fajr: string): string {
  const maghribMin = enMinutes(maghrib)
  let fajrMin = enMinutes(fajr)
  if (fajrMin < maghribMin) fajrMin += 1440
  const debut = maghribMin + Math.floor(((fajrMin - maghribMin) * 2) / 3)
  return (Math.floor(debut / 60) % 24).toString().padStart(2, '0') + ':' + (debut % 60).toString().padStart(2, '0')
}

function getMethode(countryCode: string): adhan.CalculationParameters {
  const amerique = ['US', 'CA', 'MX', 'BR', 'AR', 'CO', 'CL', 'PE', 'VE']
  const moyen_orient = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'YE', 'IQ', 'SY', 'JO', 'LB', 'PS']
  const asie_sud = ['PK', 'IN', 'BD', 'AF', 'LK', 'NP']
  const egypte = ['EG', 'LY', 'SD']
  if (amerique.includes(countryCode)) return adhan.CalculationMethod.NorthAmerica()
  if (moyen_orient.includes(countryCode)) return adhan.CalculationMethod.UmmAlQura()
  if (asie_sud.includes(countryCode)) return adhan.CalculationMethod.Karachi()
  if (egypte.includes(countryCode)) return adhan.CalculationMethod.Egyptian()
  return adhan.CalculationMethod.MuslimWorldLeague()
}
function getNomMethode(countryCode: string): string {
  const amerique = ['US', 'CA', 'MX']
  const moyen_orient = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'YE', 'IQ', 'SY', 'JO', 'LB', 'PS']
  const asie_sud = ['PK', 'IN', 'BD', 'AF', 'LK', 'NP']
  const egypte = ['EG', 'LY', 'SD']
  if (amerique.includes(countryCode)) return 'ISNA'
  if (moyen_orient.includes(countryCode)) return 'Umm al-Qura'
  if (asie_sud.includes(countryCode)) return 'Karachi'
  if (egypte.includes(countryCode)) return 'Egyptian'
  return 'Muslim World League'
}

// ─── icônes par prière ────────────────────────────────────────
type IconeProps = { size?: number; color?: string; strokeWidth?: number }
const ICONES: Record<string, ComponentType<IconeProps>> = {
  Fajr: CloudMoon,
  Sunrise: Sunrise,
  Dhuhr: Sun,
  Asr: CloudSun,
  Maghrib: Sunset,
  Isha: Moon,
  MoitieNuit: Hourglass,
  Tahajjud: MoonStar,
}

// ─── icône mains jointes (Material Symbols folded_hands) ─────
function IcoDuaa({ size = 20, color = OR }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 -960 960 960">
      <path fill={color} d="M620-320v-109l-45-81q-7 5-11 13t-4 17v229L663-80h-93l-90-148v-252q0-31 15-57t41-43l-56-99q-20-38-17.5-80.5T495-832l68-68 276 324 41 496h-80l-39-464-203-238-6 6q-10 10-11.5 23t4.5 25l155 278v130h-80Zm-360 0v-130l155-278q6-12 4.5-25T408-776l-6-6-203 238-39 464H80l41-496 276-324 68 68q30 30 32.5 72.5T480-679l-56 99q26 17 41 43t15 57v252L390-80h-93l103-171v-229q0-9-4-17t-11-13l-45 81v109h-80Z" />
    </svg>
  )
}

// ─── anneau de progression ────────────────────────────────────
const RAYON = 88
const CIRCONF = 2 * Math.PI * RAYON
const TAILLE_SVG = 210

export default function Prieres() {
  const [horaires, setHoraires] = useState<PriereInfo[]>([])
  const [ville, setVille] = useState('')
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')
  const [, setTick] = useState(0)
  const [methodeNom, setMethodeNom] = useState('')
  const [fajrDemain, setFajrDemain] = useState('')

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      queueMicrotask(() => { setErreur('Géolocalisation non supportée'); setLoading(false) })
      return
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords

        // Géolocalisation inverse
        const geo = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`)
        const gd = await geo.json()
        const nomVille = (gd.city || gd.locality || gd.principalSubdivision || '').replace(/\s*\(.*\)\s*/g, '').trim()
        const nomPays = (gd.countryName || '').replace(/\s*\(.*\)\s*/g, '').trim()
        const countryCode = gd.countryCode || 'FR'
        setVille(nomVille && nomPays ? `${nomVille}, ${nomPays}` : nomVille || nomPays)
        setMethodeNom(getNomMethode(countryCode))

        const coords = new adhan.Coordinates(latitude, longitude)
        const methode = getMethode(countryCode)
        const d = new Date()
        const times = new adhan.PrayerTimes(coords, d, methode)

        const fajrFmt = fmt(times.fajr)
        const maghribFmt = fmt(times.maghrib)
        const ishaFmt = fmt(times.isha)

        const demain = new Date(d)
        demain.setDate(demain.getDate() + 1)
        const timesDemain = new adhan.PrayerTimes(coords, demain, methode)
        const fajrDemainFmt = fmt(timesDemain.fajr)
        setFajrDemain(fajrDemainFmt)

        const fajrAffiche = enMinutes(ishaFmt) < nowMin() ? fajrDemainFmt : fajrFmt

        setHoraires([
          { nom: 'Fajr', heure: fajrAffiche, cle: 'Fajr' },
          { nom: 'Lever du soleil', heure: fmt(times.sunrise), cle: 'Sunrise' },
          { nom: 'Dhuhr', heure: fmt(times.dhuhr), cle: 'Dhuhr' },
          { nom: 'Asr', heure: fmt(times.asr), cle: 'Asr' },
          { nom: 'Maghrib', heure: maghribFmt, cle: 'Maghrib' },
          { nom: 'Isha', heure: ishaFmt, cle: 'Isha' },
          { nom: 'Moitié de la nuit', heure: calculerMoitieNuit(maghribFmt, fajrDemainFmt), cle: 'MoitieNuit' },
          { nom: 'Dernier tiers de la nuit', heure: calculerDernierTiers(maghribFmt, fajrDemainFmt), cle: 'Tahajjud' },
        ])
        setLoading(false)
      } catch (e) { console.error(e); setErreur('Impossible de récupérer les horaires'); setLoading(false) }
    }, () => { setErreur('Position refusée — veuillez autoriser la géolocalisation'); setLoading(false) })
  }, [])

  const now = nowMin()
  const principales = horaires.filter(p => !['Sunrise', 'MoitieNuit', 'Tahajjud'].includes(p.cle))
  const idx = principales.findIndex(p => enMinutes(p.heure) > now)
  const prochaine = principales.length
    ? (idx === -1 ? { nom: 'Fajr', heure: fajrDemain, cle: 'Fajr' } : principales[idx])
    : null
  const precedente = principales.length
    ? (idx <= 0 ? principales[principales.length - 1] : principales[idx - 1])
    : null

  const prog = prochaine && precedente ? progressEntre(precedente.heure, prochaine.heure) : 0
  const dashOffset = CIRCONF - prog * CIRCONF

  const IconeProchaine = prochaine ? (ICONES[prochaine.cle] ?? Sun) : Sun

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
      <Navbar />

      {/* ── Héros ── */}
      <div style={{ position: 'relative', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_MID} 55%, ${BG_BOT} 100%)` }} />
        <FondAurore />

        <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto', padding: '28px 24px 32px' }}>
          {/* badge titre (style Médiathèque) */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(214,173,58,0.16)', borderRadius: 999, padding: '5px 13px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.8px', color: OR, textTransform: 'uppercase', lineHeight: 1 }}>Heures de prières</span>
            </div>
          </div>

          {/* ville */}
          {ville && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: W10, borderRadius: 999, padding: '5px 12px',
                border: `1px solid ${W18}`,
              }}>
                <MapPin size={12} color={W55} strokeWidth={2} />
                <span style={{ fontSize: 12, color: W70 }}>{ville}</span>
              </div>
            </div>
          )}

          {/* anneau prochaine prière */}
          {!loading && !erreur && prochaine && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: TAILLE_SVG, height: TAILLE_SVG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* disque de verre */}
                <div style={{
                  position: 'absolute',
                  width: RAYON * 2 - 18, height: RAYON * 2 - 18,
                  borderRadius: '50%',
                  background: W10,
                  border: `1px solid ${W18}`,
                }} />
                <svg width={TAILLE_SVG} height={TAILLE_SVG} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                  <circle cx={TAILLE_SVG / 2} cy={TAILLE_SVG / 2} r={RAYON} fill="none" stroke={W18} strokeWidth={9} />
                  <circle
                    cx={TAILLE_SVG / 2} cy={TAILLE_SVG / 2} r={RAYON}
                    fill="none" stroke={OR} strokeWidth={9}
                    strokeLinecap="round"
                    strokeDasharray={CIRCONF}
                    strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <IconeProchaine size={26} color={OR} strokeWidth={2} />
                  <p style={{ fontSize: 11, fontWeight: 500, color: W55, letterSpacing: '1.4px', textTransform: 'uppercase', marginTop: 4 }}>
                    Prochaine prière
                  </p>
                  <p style={{ fontSize: 30, fontWeight: 700, color: '#fff' }}>{prochaine.nom}</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: OR, fontVariantNumeric: 'tabular-nums' }}>{prochaine.heure}</p>
                </div>
              </div>

              {/* compte à rebours */}
              <div style={{
                background: OR, borderRadius: 999,
                padding: '7px 16px', marginTop: 12,
                boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
              }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: NUIT_TOP, fontVariantNumeric: 'tabular-nums' }}>
                  dans {tempsRestant(prochaine.heure)}
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 12 }}>
              <div className="spinner-prieres" />
              <p style={{ fontSize: 14, color: W70 }}>Détection de ta position…</p>
            </div>
          )}
          {!!erreur && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: W90 }}>{erreur}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Liste des horaires ── */}
      {!loading && !erreur && (
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 24px 60px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', color: OR, textTransform: 'uppercase', marginBottom: 4 }}>
            Aujourd&apos;hui
          </p>

          {horaires.map((p, i) => {
            const estIndicateur = p.cle === 'MoitieNuit' || p.cle === 'Tahajjud'
            const estProchaine = prochaine?.cle === p.cle && prochaine?.heure === p.heure
            const estPassee = !estIndicateur && enMinutes(p.heure) < now && !estProchaine
            const Icone = ICONES[p.cle] ?? Sun

            if (estIndicateur) {
              return (
                <div key={p.cle} className="pri-card" style={{
                  borderRadius: 16, overflow: 'hidden',
                  background: `linear-gradient(135deg, ${NUIT_TOP}, ${NUIT_BOT})`,
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  animationDelay: `${0.06 * i}s`,
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 13, background: 'rgba(214,173,58,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {p.cle === 'Tahajjud'
                      ? <IcoDuaa size={22} color={OR} />
                      : <Icone size={20} color={OR} strokeWidth={2} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{p.nom}</p>
                    <p style={{ fontSize: 11, color: OR, marginTop: 2 }}>
                      {p.cle === 'Tahajjud' ? 'Tahajjud — prière de la nuit' : "Fin de l'heure du Isha"}
                    </p>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: OR, fontVariantNumeric: 'tabular-nums' }}>{p.heure}</p>
                </div>
              )
            }

            return (
              <div key={p.cle} className="pri-card" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: estProchaine ? BLEU : '#fff',
                borderRadius: 16, padding: '14px 16px',
                boxShadow: estProchaine ? '0 4px 12px rgba(45,87,140,0.22)' : '0 4px 12px rgba(58,74,92,0.06)',
                animationDelay: `${0.06 * i}s`,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 13,
                  background: estProchaine ? 'rgba(255,255,255,0.15)' : estPassee ? '#f1f0ee' : '#dce8f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icone size={20} color={estProchaine ? OR : estPassee ? '#b5b2ac' : BLEU} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 15,
                    fontWeight: estProchaine ? 700 : 500,
                    color: estProchaine ? '#fff' : estPassee ? '#b5b2ac' : 'var(--texte)',
                  }}>
                    {p.nom}
                  </p>
                  {estProchaine && (
                    <p style={{ fontSize: 11, fontWeight: 500, color: OR, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                      dans {tempsRestant(p.heure)}
                    </p>
                  )}
                </div>
                <p style={{
                  fontSize: 16, fontWeight: 700,
                  color: estProchaine ? OR : estPassee ? '#c9c6c0' : BLEU,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {p.heure}
                </p>
              </div>
            )
          })}

          {methodeNom && (
            <p style={{ textAlign: 'center', fontSize: 11, color: '#b9b6b0', marginTop: 12 }}>
              Horaires selon ta position • {methodeNom}
            </p>
          )}
        </div>
      )}

      <Footer />

      <style>{`
        .pri-card { animation: priFadeUp 0.4s ease both; }
        @keyframes priFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .spinner-prieres {
          width: 38px; height: 38px; border-radius: 50%;
          border: 3px solid ${W18}; border-top-color: ${OR};
          animation: priSpin 0.8s linear infinite;
        }
        @keyframes priSpin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}
