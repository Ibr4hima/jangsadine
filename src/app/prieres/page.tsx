'use client'
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import * as adhan from 'adhan';
import { useEffect, useState } from 'react';

type PriereInfo = { nom: string; heure: string; cle: string }

function calculerDernierTiers(maghrib: string, fajr: string): string {
  const [hI, mI] = maghrib.split(':').map(Number)
  const [hF, mF] = fajr.split(':').map(Number)
  let ishaMin = hI * 60 + mI
  let fajrMin = hF * 60 + mF
  if (fajrMin < ishaMin) fajrMin += 1440
  const debut = ishaMin + Math.floor(((fajrMin - ishaMin) * 2) / 3)
  const h = Math.floor(debut / 60) % 24
  const m = debut % 60
  return h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0')
}

function calculerMoitieNuit(maghrib: string, fajr: string): string {
  const [hM, mM] = maghrib.split(':').map(Number)
  const [hF, mF] = fajr.split(':').map(Number)
  let maghribMin = hM * 60 + mM
  let fajrMin = hF * 60 + mF
  if (fajrMin < maghribMin) fajrMin += 1440
  const milieu = maghribMin + Math.floor((fajrMin - maghribMin) / 2)
  const h = Math.floor(milieu / 60) % 24
  const m = milieu % 60
  return h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0')
}

function enMinutes(h: string) { const [hh, mm] = h.split(':').map(Number); return hh * 60 + mm }
function nowMin() { const n = new Date(); return n.getHours() * 60 + n.getMinutes() }
function format24(h: string) { return h.substring(0, 5) }

function tempsRestant(heure: string): string {
  const now = new Date()
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  let cibleSec = enMinutes(heure) * 60
  if (cibleSec <= nowSec) cibleSec += 86400
  const diff = cibleSec - nowSec
  const hh = Math.floor(diff / 3600)
  const mm = Math.floor((diff % 3600) / 60)
  const ss = diff % 60
  return hh.toString().padStart(2, '0') + ':' + mm.toString().padStart(2, '0') + ':' + ss.toString().padStart(2, '0')
}

function progression(heure: string): number {
  const now = nowMin()
  let cible = enMinutes(heure)
  if (cible <= now) cible += 1440
  const restant = cible - now
  return Math.max(0, Math.min(100, ((360 - restant) / 360) * 100))
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
  // Par défaut : MWL — couvre Afrique, Europe, reste du monde
  return adhan.CalculationMethod.MuslimWorldLeague()
}

function fmt(date: Date) {
  return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0')
}

export default function Prieres() {
  const [horaires, setHoraires] = useState<PriereInfo[]>([])
  const [ville, setVille] = useState('')
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')
  const [tick, setTick] = useState(0)
  const [dateHijri, setDateHijri] = useState('')
  const [methodeNom, setMethodeNom] = useState('')
  const [fajrDemain, setFajrDemain] = useState('')

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) { setErreur('Geolocalisation non supportee'); setLoading(false); return }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords

        // Géolocalisation inverse
        const geo = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`)
        const gd = await geo.json()
        const nomQuartier = (gd.neighbourhood || gd.locality || '').replace(/\s*\(.*\)\s*/g, '').trim()
        const nomVille = (gd.city || gd.principalSubdivision || '').replace(/\s*\(.*\)\s*/g, '').trim()
        const nomPays = (gd.countryName || '').replace(/\s*\(.*\)\s*/g, '').trim()
        const countryCode = gd.countryCode || ''
        const parties = [nomQuartier, nomVille, nomPays].filter(Boolean)
        setVille(parties.join(', '))

        // Date hijri via Aladhan
        const d = new Date()
        const ds = d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear()
        const resHijri = await fetch('https://api.aladhan.com/v1/timings/' + ds + '?latitude=' + latitude + '&longitude=' + longitude + '&method=3')
        const dataHijri = await resHijri.json()
        const hijri = dataHijri.data.date.hijri
        setDateHijri(hijri.day + ' ' + hijri.month.en + ' ' + hijri.year + ' H')

        // Calcul des heures avec Adhan-js
        const coords = new adhan.Coordinates(latitude, longitude)
        const methode = getMethode(countryCode)
        const prayerTimes = new adhan.PrayerTimes(coords, d, methode)

        // Nom de la méthode pour affichage
        const nomMethodes: Record<string, string> = {
          'US': 'ISNA', 'CA': 'ISNA', 'SA': 'Umm al-Qura', 'AE': 'Umm al-Qura',
          'PK': 'Karachi', 'IN': 'Karachi', 'EG': 'Egyptian',
        }
        setMethodeNom(nomMethodes[countryCode] || 'Muslim World League')

        const fajrFmt = fmt(prayerTimes.fajr)
        const maghribFmt = fmt(prayerTimes.maghrib)

        const demain = new Date(d)
        demain.setDate(demain.getDate() + 1)
        const prayerTimesDemain = new adhan.PrayerTimes(coords, demain, methode)
        const fajrDemainFmt = fmt(prayerTimesDemain.fajr)
        setFajrDemain(fajrDemainFmt)

        setHoraires([
          { nom: 'Fajr', heure: enMinutes(fmt(prayerTimes.isha)) < nowMin() ? fajrDemainFmt : fajrFmt, cle: 'Fajr' },
          { nom: 'Lever du soleil', heure: fmt(prayerTimes.sunrise), cle: 'Sunrise' },
          { nom: 'Dhuhr', heure: fmt(prayerTimes.dhuhr), cle: 'Dhuhr' },
          { nom: 'Asr', heure: fmt(prayerTimes.asr), cle: 'Asr' },
          { nom: 'Maghrib', heure: maghribFmt, cle: 'Maghrib' },
          { nom: 'Isha', heure: fmt(prayerTimes.isha), cle: 'Isha' },
          { nom: 'Moitié de la nuit', heure: calculerMoitieNuit(maghribFmt, fajrDemainFmt), cle: 'MoitieNuit' },
          { nom: 'Dernier tiers de la nuit', heure: calculerDernierTiers(maghribFmt, fajrDemainFmt), cle: 'Tahajjud' },
        ])
        setLoading(false)
      } catch (e) { console.error(e); setErreur('Impossible de recuperer les horaires'); setLoading(false) }
    }, () => { setErreur('Position refusée — veuillez autoriser la geolocalisation'); setLoading(false) })
  }, [])

  const now = nowMin()
  const prieresPrincipales = horaires.filter(p => p.cle !== 'Sunrise' && p.cle !== 'Tahajjud')
  const prochaine = prieresPrincipales.find(p => enMinutes(p.heure) > now) || { nom: 'Fajr', heure: fajrDemain, cle: 'Fajr' }
  const prog = prochaine ? progression(prochaine.heure) : 0
  const rayon = 80
  const circonf = 2 * Math.PI * rayon
  const dashOffset = circonf - (prog / 100) * circonf

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
      <Navbar />
      <section style={{ background: 'var(--bleu)', padding: '32px 24px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '6px' }}>Horaires</p>
        <h1 style={{ fontSize: '36px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Heures de prières</h1>
        {ville && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '8px' }}>{ville}</p>}
        {dateHijri && (
          <div style={{ display: 'inline-block', background: 'rgba(217,172,42,0.15)', border: '1px solid rgba(217,172,42,0.4)', borderRadius: '20px', padding: '6px 18px', marginTop: '4px' }}>
            <p style={{ fontSize: '14px', color: '#d9ac2a', fontWeight: 500 }}>{dateHijri}</p>
          </div>
        )}
      </section>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🕌</div>
            <p>Récupération de votre position...</p>
          </div>
        ) : erreur ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
            <p style={{ color: '#c00', fontSize: '15px' }}>{erreur}</p>
          </div>
        ) : (
          <>
            {prochaine && (
              <div style={{ background: 'white', borderRadius: '20px', border: '2px solid var(--or)', padding: '32px 24px', textAlign: 'center', marginBottom: '24px', boxShadow: '0 4px 24px rgba(217,172,42,0.12)' }}>
                <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 20px' }}>
                  <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="100" cy="100" r={rayon} fill="none" stroke="#f0f0f0" strokeWidth="10" />
                    <circle cx="100" cy="100" r={rayon} fill="none" stroke="#d9ac2a" strokeWidth="10" strokeLinecap="round" strokeDasharray={circonf} strokeDashoffset={dashOffset} style={{ transition: 'stroke-dashoffset 1s ease' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Prochaine Prière</p>
                    <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--bleu)', marginBottom: '2px' }}>{prochaine.nom}</p>
                    <p style={{ fontSize: '26px', fontWeight: 700, color: 'var(--or)' }}>{format24(prochaine.heure)}</p>
                  </div>
                </div>
                <div style={{ display: 'inline-block', background: 'var(--fond-creme)', borderRadius: '20px', padding: '6px 18px', border: '1px solid var(--bordure)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--bleu)', fontWeight: 500 }}>dans {tempsRestant(prochaine.heure)}</p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {horaires.map(p => {
                const estProchaine = prochaine?.cle === p.cle
                const estPassee = enMinutes(p.heure) < now && !estProchaine
                const estTahajjud = p.cle === 'Tahajjud' || p.cle === 'MoitieNuit'
                return (
                  <div key={p.cle} style={{
                    background: estProchaine ? 'var(--bleu)' : 'white',
                    border: estTahajjud ? '1px dashed #d9ac2a' : estProchaine ? 'none' : '1px solid var(--bordure)',
                    borderRadius: '12px',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: estPassee && !estTahajjud ? 0.45 : 1,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: estProchaine ? '#d9ac2a' : estTahajjud ? '#d9ac2a' : '#ccc', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: estProchaine ? 700 : 500, color: estProchaine ? 'white' : (estPassee && !estTahajjud) ? '#aaa' : 'var(--texte)' }}>{p.nom}</p>
                        {p.cle === 'Tahajjud' && <p style={{ fontSize: '10px', color: '#b8911f', marginTop: '1px' }}>Tahajjud — Prière de la nuit</p>}
                        {p.cle === 'MoitieNuit' && <p style={{ fontSize: '10px', color: '#b8911f', marginTop: '1px' }}>Fin de l'heure du Isha</p>}
                      </div>
                    </div>
                    <p style={{ fontSize: '17px', fontWeight: 700, color: estProchaine ? '#d9ac2a' : (estPassee && !estTahajjud) ? '#ccc' : estTahajjud ? '#b8911f' : 'var(--bleu)', fontVariantNumeric: 'tabular-nums' }}>{format24(p.heure)}</p>
                  </div>
                )
              })}
            </div>
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#ccc', marginTop: '20px' }}>Horaires selon votre position • {methodeNom}</p>
          </>
        )}
      </div>

      <Footer />
    </main>
  )
}