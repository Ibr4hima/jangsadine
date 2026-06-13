'use client'
import MiniEgaliseur from '@/components/MiniEgaliseur'
import { useAudio } from '@/contexts/AudioContext'
import * as adhan from 'adhan'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import TitreDefilant from './TitreDefilant'

const BLEU = '#2d578c'
const NUIT = '#1c3d66'
const OR = '#d6ad3a'

const liens = [
    { label: 'Cours audio', href: '/audio' },
    { label: 'Conférences', href: '/conferences' },
    { label: 'Khoutbah', href: '/khoutbah' },
    { label: 'Fatwas', href: '/fatwas' },
    { label: 'Prières', href: '/prieres' },
]

type Priere = { nom: string; heure: string }

function nowMin() { const n = new Date(); return n.getHours() * 60 + n.getMinutes() }
function enMinutes(h: string) { const [hh, mm] = h.split(':').map(Number); return hh * 60 + mm }

function tempsRestant(heure: string): string {
    const now = new Date()
    const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
    let cibleSec = enMinutes(heure) * 60
    if (cibleSec <= nowSec) cibleSec += 86400
    const diff = cibleSec - nowSec
    const hh = Math.floor(diff / 3600)
    const mm = Math.floor((diff % 3600) / 60)
    if (hh > 0) return `${hh} h ${mm.toString().padStart(2, '0')} min`
    if (mm > 0) return `${mm} min`
    return `${diff % 60} s`
}

function fmt(date: Date) {
    return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0')
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

// ─── pastille « en lecture » (audio / livre) ─────────────────
function BandeLecture({ titre, href, jouant, onToggle, onFermer }: {
    titre: string; href: string; jouant: boolean; onToggle: () => void; onFermer: () => void
}) {
    return (
        <Link href={href} style={{ textDecoration: 'none', marginLeft: 8 }}>
            <div className="bande-nav" style={{
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                background: `linear-gradient(135deg, ${BLEU}, ${NUIT})`,
                borderRadius: 999, padding: '5px 10px 5px 5px', height: 40,
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 14px rgba(28,61,102,0.28)',
            }}>
                <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle() }}
                    style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: OR, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.22)' }}
                >
                    {jouant
                        ? <MiniEgaliseur color={NUIT} />
                        : <svg width="13" height="13" viewBox="0 -960 960 960"><path d="M320-200v-560l440 280-440 280Z" fill={NUIT} /></svg>}
                </button>
                <div style={{ maxWidth: 150, overflow: 'hidden' }}>
                    <TitreDefilant texte={titre} style={{ fontSize: 13, fontWeight: 600, color: '#fff' }} />
                </div>
                <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); onFermer() }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 13, padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
                >✕</button>
            </div>
        </Link>
    )
}

export default function Navbar() {
    const [menuOuvert, setMenuOuvert] = useState(false)
    const { piste, enLecture, toggleLecture, fermer, livreAudio, enLectureLivre, toggleLivre, fermerLivre } = useAudio()
    const [prochaine, setProchaine] = useState<Priere | null>(null)
    const [, setTick] = useState(0)
    const pathname = usePathname()
    const surPagePrieres = pathname === '/prieres'
    // L'accueil affiche déjà les horaires dans son héros → on masque la bande prière
    const masquerBandePriere = surPagePrieres || pathname === '/'

    useEffect(() => {
        if (masquerBandePriere) return
        function charger() {
            if (!navigator.geolocation) return
            navigator.geolocation.getCurrentPosition(async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords
                    const geo = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`)
                    const gd = await geo.json()
                    const countryCode = gd.countryCode || ''
                    const coords = new adhan.Coordinates(latitude, longitude)
                    const methode = getMethode(countryCode)
                    const prayerTimes = new adhan.PrayerTimes(coords, new Date(), methode)
                    const prieres = [
                        { nom: 'Fajr', heure: fmt(prayerTimes.fajr) },
                        { nom: 'Dhuhr', heure: fmt(prayerTimes.dhuhr) },
                        { nom: 'Asr', heure: fmt(prayerTimes.asr) },
                        { nom: 'Maghrib', heure: fmt(prayerTimes.maghrib) },
                        { nom: 'Isha', heure: fmt(prayerTimes.isha) },
                    ]
                    const now = nowMin()
                    const next = prieres.find(p => enMinutes(p.heure) > now) || (() => {
                        const demain = new Date()
                        demain.setDate(demain.getDate() + 1)
                        const ptD = new adhan.PrayerTimes(coords, demain, methode)
                        return { nom: 'Fajr', heure: fmt(ptD.fajr) }
                    })()
                    setProchaine(next)
                } catch { }
            }, () => { })
        }
        charger()
        const iv = setInterval(charger, 60000)
        return () => clearInterval(iv)
    }, [masquerBandePriere])

    useEffect(() => {
        const iv = setInterval(() => setTick(t => t + 1), 1000)
        return () => clearInterval(iv)
    }, [])

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            borderBottom: '1px solid #eef1f5',
            boxShadow: '0 4px 24px rgba(28,61,102,0.05)',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Image src="/logo.png" alt="Jàng sa Diné" width={44} height={44} />
                    <span style={{ color: 'var(--texte)', fontSize: 17, fontWeight: 700, letterSpacing: '0.2px' }}>
                        Jàng sa <span style={{ color: OR }}>Diné</span>
                    </span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="nav-desktop">
                    {liens.map((lien) => {
                        const actif = pathname === lien.href
                        return (
                            <Link key={lien.href} href={lien.href}
                                style={{ color: actif ? BLEU : '#48515e', fontSize: 14, fontWeight: actif ? 600 : 500, padding: '8px 14px', borderRadius: 10, background: actif ? '#eef3f9' : 'transparent', transition: 'background 0.15s, color 0.15s' }}
                                onMouseEnter={e => { if (!actif) { e.currentTarget.style.background = '#eef3f9'; e.currentTarget.style.color = BLEU } }}
                                onMouseLeave={e => { if (!actif) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#48515e' } }}
                            >
                                {lien.label}
                            </Link>
                        )
                    })}

                    {piste && (
                        <BandeLecture titre={piste.titre} href={piste.href || '#'} jouant={enLecture} onToggle={toggleLecture} onFermer={fermer} />
                    )}

                    {livreAudio && (
                        <BandeLecture titre={'' + livreAudio.titre} href={`/audio/livre/${livreAudio.livreId}`} jouant={enLectureLivre} onToggle={toggleLivre} onFermer={fermerLivre} />
                    )}

                    {prochaine && !masquerBandePriere && (
                        <Link href="/prieres" style={{ textDecoration: 'none', marginLeft: 8 }}>
                            <div className="bande-nav" style={{
                                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                                background: `linear-gradient(135deg, ${BLEU}, ${NUIT})`,
                                borderRadius: 999, padding: '0 16px', height: 40,
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 4px 14px rgba(28,61,102,0.22)',
                            }}>
                                <span style={{ width: 7, height: 7, borderRadius: 4, background: OR, boxShadow: `0 0 8px ${OR}`, flexShrink: 0 }} />
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{prochaine.nom}</span>
                                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', fontVariantNumeric: 'tabular-nums' }}>{prochaine.heure.substring(0, 5)}</span>
                                <span style={{ fontSize: 11, fontWeight: 600, color: OR, fontVariantNumeric: 'tabular-nums' }}>dans {tempsRestant(prochaine.heure)}</span>
                            </div>
                        </Link>
                    )}
                </div>

                <button onClick={() => setMenuOuvert(!menuOuvert)} className="nav-mobile-btn"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', flexDirection: 'column', gap: 5, padding: 4 }}
                    aria-label="Menu">
                    <span style={{ width: 22, height: 2, background: 'var(--texte)', display: 'block', borderRadius: 2 }} />
                    <span style={{ width: 22, height: 2, background: 'var(--texte)', display: 'block', borderRadius: 2 }} />
                    <span style={{ width: 22, height: 2, background: 'var(--texte)', display: 'block', borderRadius: 2 }} />
                </button>
            </div>

            {menuOuvert && (
                <div style={{ background: 'white', borderTop: '1px solid #eef1f5', padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {liens.map((lien) => {
                        const actif = pathname === lien.href
                        return (
                            <Link key={lien.href} href={lien.href} onClick={() => setMenuOuvert(false)}
                                style={{ color: actif ? BLEU : '#48515e', fontSize: 15, fontWeight: actif ? 600 : 500, padding: '11px 12px', borderRadius: 10, background: actif ? '#eef3f9' : 'transparent' }}>
                                {lien.label}
                            </Link>
                        )
                    })}
                    {prochaine && !masquerBandePriere && (
                        <Link href="/prieres" onClick={() => setMenuOuvert(false)} style={{ textDecoration: 'none', marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg, ${BLEU}, ${NUIT})`, borderRadius: 12, padding: '12px 16px' }}>
                                <span style={{ width: 7, height: 7, borderRadius: 4, background: OR, boxShadow: `0 0 8px ${OR}` }} />
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{prochaine.nom}</span>
                                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)' }}>{prochaine.heure.substring(0, 5)}</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: OR, marginLeft: 'auto' }}>dans {tempsRestant(prochaine.heure)}</span>
                            </div>
                        </Link>
                    )}
                </div>
            )}

            <style>{`
                @media (max-width: 880px) {
                    .nav-desktop { display: none !important; }
                    .nav-mobile-btn { display: flex !important; }
                }
                .bande-nav { transition: transform 0.15s, box-shadow 0.15s; }
                .bande-nav:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(28,61,102,0.30); }
            `}</style>
        </header>
    )
}
