'use client'
import { useAudio } from '@/contexts/AudioContext'
import * as adhan from 'adhan'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import TitreDefilant from './TitreDefilant'

const liens = [
    { label: 'Cours audio', href: '/audio' },
    { label: 'Conférences', href: '/conferences' },
    { label: 'Khoutbah', href: '/khoutbah' },
    { label: 'Fatwas', href: '/fatwas' },
    { label: 'Prières', href: '/prieres' },
    { label: 'Ebooks', href: '/ebooks' },
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
    const ss = diff % 60
    return hh.toString().padStart(2, '0') + ':' + mm.toString().padStart(2, '0') + ':' + ss.toString().padStart(2, '0')
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

export default function Navbar() {
    const [menuOuvert, setMenuOuvert] = useState(false)
    const { piste, enLecture, toggleLecture, fermer, livreAudio, enLectureLivre, toggleLivre, fermerLivre } = useAudio()
    const [prochaine, setProchaine] = useState<Priere | null>(null)
    const [tick, setTick] = useState(0)
    const pathname = usePathname()
    const surPagePrieres = pathname === '/prieres'

    useEffect(() => {
        if (surPagePrieres) return
        async function charger() {
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
                    const next = prieres.find(p => enMinutes(p.heure) > now) || prieres[0]
                    setProchaine(next)
                } catch { }
            }, () => { })
        }
        charger()
        const iv = setInterval(charger, 60000)
        return () => clearInterval(iv)
    }, [surPagePrieres])

    useEffect(() => {
        const iv = setInterval(() => setTick(t => t + 1), 1000)
        return () => clearInterval(iv)
    }, [])

    return (
        <header style={{ background: 'white', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #eee', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 28px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Image src="/logo.png" alt="Jàng sa Diné" width={44} height={44} />
                    <span style={{ color: 'var(--texte)', fontSize: '17px', fontWeight: 700, letterSpacing: '0.2px' }}>
                        Jàng sa <span style={{ color: 'var(--or)' }}>Diné</span>
                    </span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="nav-desktop">
                    {liens.map((lien) => (
                        <Link key={lien.href} href={lien.href}
                            style={{ color: '#444', fontSize: '14px', fontWeight: 500, padding: '7px 14px', borderRadius: '8px', transition: 'background 0.15s, color 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--fond-creme)'; e.currentTarget.style.color = 'var(--bleu)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#444' }}
                        >
                            {lien.label}
                        </Link>
                    ))}

                    {piste && (
                        <Link href={piste.href || '#'} style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', cursor: 'pointer', alignItems: 'center', gap: '6px', background: 'var(--bleu)', borderRadius: '20px', padding: '6px 14px', height: '30px', transition: 'opacity 0.15s', marginLeft: '8px' }}>
                                <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '12px' }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{
                                            width: '2px',
                                            background: 'var(--or)',
                                            borderRadius: '2px',
                                            height: i === 2 ? '12px' : '7px',
                                            animationName: (enLecture || enLectureLivre) ? 'pulse-bar' : 'none',
                                            animationDuration: '0.3s',
                                            animationTimingFunction: 'ease-in-out',
                                            animationIterationCount: 'infinite',
                                            animationDirection: 'alternate',
                                            animationDelay: `${i * 0.1}s`,
                                        }} />
                                    ))}
                                </div>
                                <div style={{ maxWidth: '130px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    <TitreDefilant texte={piste.titre} style={{ fontSize: '13px', fontWeight: 600, color: 'white' }} />
                                </div>
                                <button onClick={e => { e.preventDefault(); e.stopPropagation(); toggleLecture() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--or)', display: 'flex', alignItems: 'center', padding: 0 }}>
                                    {enLecture ? (
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            <div style={{ width: '2px', height: '10px', background: 'var(--or)', borderRadius: '1px' }} />
                                            <div style={{ width: '2px', height: '10px', background: 'var(--or)', borderRadius: '1px' }} />
                                        </div>
                                    ) : (
                                        <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid var(--or)' }} />
                                    )}
                                </button>
                                <button onClick={e => { e.preventDefault(); e.stopPropagation(); fermer() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '12px', padding: '0 0 0 4px' }}>✕</button>
                            </div>
                        </Link>
                    )}

                    {livreAudio && (
                        <div style={{ display: 'flex', cursor: 'pointer', alignItems: 'center', gap: '6px', background: 'var(--bleu)', borderRadius: '20px', padding: '6px 14px', height: '30px', transition: 'opacity 0.15s', marginLeft: '8px' }}>
                            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '12px' }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} style={{
                                        width: '2px',
                                        background: 'var(--or)',
                                        borderRadius: '2px',
                                        height: i === 2 ? '12px' : '7px',
                                        animationName: (enLecture || enLectureLivre) ? 'pulse-bar' : 'none',
                                        animationDuration: '0.3s',
                                        animationTimingFunction: 'ease-in-out',
                                        animationIterationCount: 'infinite',
                                        animationDirection: 'alternate',
                                        animationDelay: `${i * 0.1}s`,
                                    }} />
                                ))}
                            </div>
                            <div style={{ maxWidth: '130px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                <TitreDefilant texte={'' + livreAudio.titre} style={{ fontSize: '13px', fontWeight: 600, color: 'white' }} />
                            </div>
                            <button onClick={e => { e.preventDefault(); e.stopPropagation(); toggleLivre() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--or)', display: 'flex', alignItems: 'center', padding: 0 }}>
                                {enLectureLivre ? (
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        <div style={{ width: '2px', height: '10px', background: 'var(--or)', borderRadius: '1px' }} />
                                        <div style={{ width: '2px', height: '10px', background: 'var(--or)', borderRadius: '1px' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid var(--or)' }} />
                                )}
                            </button>
                            <button onClick={e => { e.preventDefault(); e.stopPropagation(); fermerLivre() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '12px', padding: '0 0 0 4px' }}>✕</button>
                        </div>
                    )}

                    {prochaine && !surPagePrieres && (
                        <Link href="/prieres" style={{ textDecoration: 'none', marginLeft: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bleu)', borderRadius: '20px', padding: '6px 14px', height: '30px', cursor: 'pointer', transition: 'opacity 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--or)' }} />
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{prochaine.nom}</span>
                                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>{prochaine.heure.substring(0, 5)}</span>
                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>dans {tempsRestant(prochaine.heure)}</span>
                            </div>
                        </Link>
                    )}
                </div>

                <button onClick={() => setMenuOuvert(!menuOuvert)} className="nav-mobile-btn"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', flexDirection: 'column', gap: '5px', padding: '4px' }}
                    aria-label="Menu">
                    <span style={{ width: '22px', height: '2px', background: 'var(--texte)', display: 'block' }} />
                    <span style={{ width: '22px', height: '2px', background: 'var(--texte)', display: 'block' }} />
                    <span style={{ width: '22px', height: '2px', background: 'var(--texte)', display: 'block' }} />
                </button>
            </div>

            {menuOuvert && (
                <div style={{ background: 'white', borderTop: '1px solid #eee', padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {liens.map((lien) => (
                        <Link key={lien.href} href={lien.href} onClick={() => setMenuOuvert(false)}
                            style={{ color: '#444', fontSize: '15px', fontWeight: 500, padding: '10px 12px', borderRadius: '8px' }}>
                            {lien.label}
                        </Link>
                    ))}
                    {prochaine && !surPagePrieres && (
                        <Link href="/prieres" onClick={() => setMenuOuvert(false)} style={{ textDecoration: 'none', marginTop: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bleu)', borderRadius: '10px', padding: '10px 14px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--or)' }} />
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{prochaine.nom}</span>
                                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>{prochaine.heure.substring(0, 5)}</span>
                                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginLeft: 'auto' }}>dans {tempsRestant(prochaine.heure)}</span>
                            </div>
                        </Link>
                    )}
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
        @keyframes defilement {
            0% { transform: translateX(0) }
            100% { transform: translateX(-100%) }
        }
      `}</style>
        </header>
    )
}