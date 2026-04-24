'use client'
import Navbar from '@/components/Navbar'
import TitreDefilant from '@/components/TitreDefilant'
import { useAudio } from '@/contexts/AudioContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Chapitre = {
    id: string
    titre: string
    numero: number
    url_pdf: string | null
    livre: { id: string; titre: string; categories: { nom: string } }
}

type Episode = {
    id: string
    titre: string
    numero: number
    duree: string
    url_audio: string
    description?: string | null
}

function formaterTemps(s: number) {
    if (!s || isNaN(s)) return '0:00'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    if (h > 0) return h + ':' + m.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0')
    return m + ':' + sec.toString().padStart(2, '0')
}

function pisteVoisins(episodes: Episode[], index: number, chapitreId: string, livreId: string) {
    return {
        precedente: episodes[index - 1] ? {
            id: episodes[index - 1].id,
            titre: episodes[index - 1].titre,
            sheikh: '',
            url: episodes[index - 1].url_audio,
            duree: episodes[index - 1].duree,
            href: `/audio/livre/${livreId}/chapitre/${chapitreId}`
        } : undefined,
        suivante: episodes[index + 1] ? {
            id: episodes[index + 1].id,
            titre: episodes[index + 1].titre,
            sheikh: '',
            url: episodes[index + 1].url_audio,
            duree: episodes[index + 1].duree,
            href: `/audio/livre/${livreId}/chapitre/${chapitreId}`
        } : undefined
    }
}

export default function PageChapitre() {
    const { id, chapitreId } = useParams()
    const [chapitre, setChapitre] = useState<Chapitre | null>(null)
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [loading, setLoading] = useState(true)
    const [descOuverteId, setDescOuverteId] = useState<string | null>(null)
    const { jouer, piste, enLecture, progression, dureeTotal, toggleLecture, reculer, avancer, seeker, markerActuel, markers } = useAudio()

    useEffect(() => {
        async function charger() {
            const { data: chapData } = await supabase
                .from('chapitres_livre')
                .select('*, livre:livre_id(id, titre, categories(nom))')
                .eq('id', chapitreId)
                .single()
            const { data: epsData } = await supabase
                .from('episodes_chapitre')
                .select('id, titre, numero, duree, url_audio, description')
                .eq('chapitre_id', chapitreId)
                .order('numero')
            if (chapData) setChapitre(chapData)
            if (epsData) setEpisodes(epsData)
            setLoading(false)
        }
        charger()
    }, [chapitreId])

    const idx = episodes.findIndex(e => e.id === piste?.id)
    const precedent = idx > 0 ? episodes[idx - 1] : null
    const suivant = idx < episodes.length - 1 ? episodes[idx + 1] : null
    const tempsActuel = (progression / 100) * dureeTotal
    const categorie = (chapitre?.livre?.categories as any)?.nom || ''

    const couleurBg: Record<string, string> = {
        Aqeedah: '#e8f0f8', Fiqh: '#faf3dc', Hadith: '#eaf4ee', Tafsir: '#fde8f0',
        Seerah: '#fdf0eb', 'Bons comportements': '#f2eefa', 'Sciences du Coran': '#e8f6f5',
    }
    const couleurTxt: Record<string, string> = {
        Aqeedah: '#28558b', Fiqh: '#b8911f', Hadith: '#2d7a4f', Tafsir: '#a02060',
        Seerah: '#c05c2e', 'Bons comportements': '#6b3db5', 'Sciences du Coran': '#1a8a7a',
    }

    if (loading) return <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}><Navbar /><div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Chargement...</div></main>
    if (!chapitre) return <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}><Navbar /><div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Chapitre introuvable</div></main>

    return (
        <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
            <Navbar />

            <section style={{ background: 'var(--bleu)', padding: '40px 24px 36px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Link href={`/audio/livre/${id}`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'inline-block', marginBottom: '16px' }}>
                        ← {(chapitre.livre as any)?.titre}
                    </Link>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                        Chapitre {chapitre.numero}
                    </span>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '16px', lineHeight: 1.3 }}>
                        {chapitre.titre}
                    </h1>
                    {chapitre.url_pdf && (
                        <a href={chapitre.url_pdf} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)' }}>
                            📖 Consulter ce chapitre
                        </a>
                    )}
                </div>
            </section>

            <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>

                {/* Lecteur en cours */}
                {piste && episodes.some(e => e.id === piste.id) && (
                    <div style={{ background: 'white', border: '1px solid var(--bordure)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--or)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>En cours d'écoute</p>
                        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--texte)', marginBottom: '8px' }}>{piste.titre}</h2>

                        {markerActuel && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e8f0f8', borderRadius: '20px', padding: '4px 12px', marginBottom: '12px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--bleu)', flexShrink: 0 }} />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--bleu)' }}>{markerActuel.titre}</span>
                            </div>
                        )}

                        <div style={{ position: 'relative', marginBottom: '6px' }}>
                            <div onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); seeker(((e.clientX - rect.left) / rect.width) * 100) }}
                                style={{ height: '4px', background: '#eee', borderRadius: '2px', cursor: 'pointer', position: 'relative' }}>
                                <div style={{ width: progression + '%', height: '100%', background: 'var(--bleu)', borderRadius: '2px', transition: 'width 0.1s' }} />
                                {markers.length > 0 && dureeTotal > 0 && markers.map((m, i) => (
                                    <div key={i} onClick={e => { e.stopPropagation(); seeker((m.temps_secondes / dureeTotal) * 100) }}
                                        style={{ position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', left: (m.temps_secondes / dureeTotal * 100) + '%', width: '10px', height: '10px', borderRadius: '50%', background: markerActuel?.id === m.id ? 'var(--or)' : 'white', border: '2px solid ' + (markerActuel?.id === m.id ? 'var(--or)' : 'var(--bleu)'), cursor: 'pointer', zIndex: 2, transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginBottom: '14px' }}>
                            <span>{formaterTemps(tempsActuel)}</span>
                            <span>{formaterTemps(dureeTotal)}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                            <button onClick={() => { if (!precedent) return; const i = episodes.findIndex(e => e.id === precedent.id); jouer({ id: precedent.id, titre: precedent.titre, sheikh: '', url: precedent.url_audio, duree: precedent.duree, href: `/audio/livre/${id}/chapitre/${chapitreId}`, ...pisteVoisins(episodes, i, chapitreId as string, id as string) }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: precedent ? 1 : 0.3 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
                            </button>
                            <button onClick={reculer} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <img src="/icons/replay_10.svg" width="26" height="26" />
                            </button>
                            <button onClick={toggleLecture} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bleu)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {enLecture ? <div style={{ display: 'flex', gap: '4px' }}><div style={{ width: '3px', height: '16px', background: 'white', borderRadius: '2px' }} /><div style={{ width: '3px', height: '16px', background: 'white', borderRadius: '2px' }} /></div> : <div style={{ width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '16px solid white', marginLeft: '3px' }} />}
                            </button>
                            <button onClick={avancer} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <img src="/icons/forward_10.svg" width="26" height="26" />
                            </button>
                            <button onClick={() => { if (!suivant) return; const i = episodes.findIndex(e => e.id === suivant.id); jouer({ id: suivant.id, titre: suivant.titre, sheikh: '', url: suivant.url_audio, duree: suivant.duree, href: `/audio/livre/${id}/chapitre/${chapitreId}`, ...pisteVoisins(episodes, i, chapitreId as string, id as string) }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: suivant ? 1 : 0.3 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2v6z" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--texte)', marginBottom: '14px' }}>
                    {episodes.length} épisode{episodes.length > 1 ? 's' : ''}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {episodes.map((ep, index) => {
                        const actif = piste?.id === ep.id
                        const i = episodes.findIndex(e => e.id === ep.id)
                        const descOuverte = descOuverteId === ep.id
                        return (
                            <div key={ep.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#bbb', width: '20px', textAlign: 'right', flexShrink: 0, paddingTop: '14px' }}>
                                    {index + 1}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div onClick={() => jouer({ id: ep.id, titre: ep.titre, sheikh: '', url: ep.url_audio, duree: ep.duree, href: `/audio/livre/${id}/chapitre/${chapitreId}`, ...pisteVoisins(episodes, i, chapitreId as string, id as string) })}
                                        style={{ overflow: 'hidden', background: actif ? '#e8f0f8' : 'white', border: `1px solid ${actif ? 'var(--bleu)' : 'var(--bordure)'}`, borderRadius: descOuverte ? '10px 10px 0 0' : '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'all 0.15s' }}
                                        onMouseEnter={e => { if (!actif) e.currentTarget.style.borderColor = 'var(--bleu)' }}
                                        onMouseLeave={e => { if (!actif) e.currentTarget.style.borderColor = descOuverte ? 'var(--bleu)' : 'var(--bordure)' }}
                                    >
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: actif ? 'var(--bleu)' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {actif && enLecture
                                                ? <div style={{ display: 'flex', gap: '2px' }}><div style={{ width: '3px', height: '12px', background: 'white', borderRadius: '2px' }} /><div style={{ width: '3px', height: '12px', background: 'white', borderRadius: '2px' }} /></div>
                                                : <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid ' + (actif ? 'white' : '#aaa'), marginLeft: '2px' }} />}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <TitreDefilant texte={ep.titre} style={{ fontSize: '14px', fontWeight: actif ? 600 : 500, color: actif ? 'var(--bleu)' : 'var(--texte)' }} />
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#bbb', flexShrink: 0 }}>{ep.duree}</span>
                                        {ep.description && (
                                            <button onClick={e => { e.stopPropagation(); setDescOuverteId(descOuverte ? null : ep.id) }}
                                                style={{ background: descOuverte ? 'var(--bleu)' : '#f0f0f0', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill={descOuverte ? 'white' : '#888'}>
                                                    <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    {ep.description && descOuverte && (
                                        <div style={{ background: '#f8f6f1', border: '1px solid var(--bleu)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 16px' }}>
                                            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7, margin: 0 }}>{ep.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}