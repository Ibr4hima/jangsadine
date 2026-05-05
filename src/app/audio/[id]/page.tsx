'use client'
import Navbar from '@/components/Navbar'
import TitreDefilant from '@/components/TitreDefilant'
import { useAudio } from '@/contexts/AudioContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Cours = {
    id: string
    titre: string
    sheikh: string
    nb_episodes: number
    description: string | null
    livre_id: string | null
    serie_unique: boolean
    categories: { nom: string }
    livres: { url_pdf: string | null } | null
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

function pisteVoisins(episodes: Episode[], index: number, sheikh: string, courseId: string) {
    return {
        precedente: episodes[index - 1] ? {
            id: episodes[index - 1].id,
            titre: episodes[index - 1].titre,
            sheikh,
            url: episodes[index - 1].url_audio,
            duree: episodes[index - 1].duree,
            href: `/audio/${courseId}`
        } : undefined,
        suivante: episodes[index + 1] ? {
            id: episodes[index + 1].id,
            titre: episodes[index + 1].titre,
            sheikh,
            url: episodes[index + 1].url_audio,
            duree: episodes[index + 1].duree,
            href: `/audio/${courseId}`
        } : undefined
    }
}

export default function PageCours() {
    const { id } = useParams()
    const [cours, setCours] = useState<Cours | null>(null)
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [loading, setLoading] = useState(true)
    const [chapitresOuverts, setChapitresOuverts] = useState(true)
    const [descOuverteId, setDescOuverteId] = useState<string | null>(null)
    const { jouer, piste, enLecture, progression, dureeTotal, toggleLecture, reculer, avancer, seeker, markerActuel, markers } = useAudio()

    useEffect(() => {
        async function charger() {
            const { data: coursData } = await supabase.from('cours').select('*, categories(nom), livres(url_pdf)').eq('id', id).single()
            const { data: epsData } = await supabase.from('episodes').select('id, titre, numero, duree, url_audio, description').eq('cours_id', id).order('numero')
            if (coursData) setCours(coursData)
            if (epsData) setEpisodes(epsData)
            setLoading(false)
        }
        charger()
    }, [id])

    const idx = episodes.findIndex(e => e.id === piste?.id)
    const precedent = idx > 0 ? episodes[idx - 1] : null
    const suivant = idx < episodes.length - 1 ? episodes[idx + 1] : null
    const tempsActuel = (progression / 100) * dureeTotal

    if (loading) return <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}><Navbar /><div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Chargement...</div></main>
    if (!cours) return <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}><Navbar /><div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Cours introuvable</div></main>

    return (
        <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
            <Navbar />
            <section style={{ background: 'var(--bleu)', padding: '40px 24px 36px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Link href={cours.serie_unique || !cours.livre_id ? '/audio' : `/audio/livre/${cours.livre_id}`}
                        style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'inline-block', marginBottom: '16px' }}>
                        ← {cours.serie_unique || !cours.livre_id ? 'Retour aux cours' : 'Page précédente'}
                    </Link>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>{(cours.categories as any)?.nom}</span>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '6px', lineHeight: 1.3 }}>{cours.titre}</h1>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: cours.description ? '10px' : '0' }}>{cours.sheikh} · {cours.nb_episodes} épisode{cours.nb_episodes > 1 ? 's' : ''}</p>
                    {cours.description && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: '600px', fontStyle: 'italic' }}>{cours.description}</p>}
                    {(cours.livres as any)?.url_pdf && (
                        <a href={(cours.livres as any).url_pdf} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', marginTop: '10px' }}>
                            📖 Consulter le livre
                        </a>
                    )}
                </div>
            </section>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
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
                                        style={{
                                            position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                                            left: (m.temps_secondes / dureeTotal * 100) + '%',
                                            width: '2px', height: '10px', borderRadius: '1px',
                                            background: markerActuel?.id === m.id ? 'var(--or)' : 'rgba(255,255,255,0.9)',
                                            cursor: 'pointer', zIndex: 2, transition: 'all 0.2s',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginBottom: '14px' }}>
                            <span>{formaterTemps(tempsActuel)}</span>
                            <span>{dureeTotal > 0 ? formaterTemps(dureeTotal) : (piste?.duree || '...')}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: markers.length > 0 ? '16px' : '0' }}>
                            <button onClick={() => { if (!precedent) return; const i = episodes.findIndex(e => e.id === precedent.id); jouer({ id: precedent.id, titre: precedent.titre, sheikh: cours.sheikh, url: precedent.url_audio, duree: precedent.duree, href: `/audio/${id}`, ...pisteVoisins(episodes, i, cours.sheikh, id as string) }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: precedent ? 1 : 0.3 }}>
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
                            <button onClick={() => { if (!suivant) return; const i = episodes.findIndex(e => e.id === suivant.id); jouer({ id: suivant.id, titre: suivant.titre, sheikh: cours.sheikh, url: suivant.url_audio, duree: suivant.duree, href: `/audio/${id}`, ...pisteVoisins(episodes, i, cours.sheikh, id as string) }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: suivant ? 1 : 0.3 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2v6z" /></svg>
                            </button>
                            {markers.length > 0 && (
                                <button onClick={() => setChapitresOuverts(o => !o)} style={{ background: chapitresOuverts ? '#e8f0f8' : 'none', border: 'none', cursor: 'pointer', color: chapitresOuverts ? 'var(--bleu)' : '#aaa', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '8px', transition: 'all 0.15s' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 -960 960 960" width="22" fill="currentColor">
                                        <path d="M360-240h440v-80H360v80Zm0-200h440v-80H360v80Zm0-200h440v-80H360v80ZM200-240q-17 0-28.5-11.5T160-280q0-17 11.5-28.5T200-320q17 0 28.5 11.5T240-280q0 17-11.5 28.5T200-240Zm0-200q-17 0-28.5-11.5T160-480q0-17 11.5-28.5T200-520q17 0 28.5 11.5T240-480q0 17-11.5 28.5T200-440Zm0-200q-17 0-28.5-11.5T160-680q0-17 11.5-28.5T200-720q17 0 28.5 11.5T240-680q0 17-11.5 28.5T200-640Z" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {markers.length > 0 && chapitresOuverts && (
                            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {markers.map((m, i) => {
                                    const actif = markerActuel?.id === m.id
                                    const h = Math.floor(m.temps_secondes / 3600)
                                    const min = Math.floor((m.temps_secondes % 3600) / 60)
                                    const sec = m.temps_secondes % 60
                                    const label = h > 0 ? h + ':' + min.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0') : min + ':' + sec.toString().padStart(2, '0')
                                    return (
                                        <div key={i} onClick={() => seeker((m.temps_secondes / dureeTotal) * 100)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', background: actif ? '#e8f0f8' : 'transparent', transition: 'background 0.15s' }}
                                            onMouseEnter={e => { if (!actif) e.currentTarget.style.background = '#f8f6f1' }}
                                            onMouseLeave={e => { if (!actif) e.currentTarget.style.background = 'transparent' }}
                                        >
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: actif ? 'var(--or)' : '#bbb', minWidth: '38px', flexShrink: 0 }}>{label}</span>
                                            <span style={{ fontSize: '13px', fontWeight: actif ? 700 : 400, color: actif ? 'var(--bleu)' : 'var(--texte)' }}>{m.titre}</span>
                                            {actif && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--bleu)', flexShrink: 0 }} />}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--texte)', marginBottom: '14px' }}>Tous les épisodes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {episodes.map((ep, index) => {
                        const actif = piste?.id === ep.id
                        const i = episodes.findIndex(e => e.id === ep.id)
                        const descOuverte = descOuverteId === ep.id
                        return (
                            <div key={ep.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#bbb', width: '20px', textAlign: 'right', flexShrink: 0, height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    {index + 1}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div onClick={() => jouer({ id: ep.id, titre: ep.titre, sheikh: cours.sheikh, url: ep.url_audio, duree: ep.duree, href: `/audio/${id}`, ...pisteVoisins(episodes, i, cours.sheikh, id as string) })}
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
                                        {/* Bouton info */}
                                        {ep.description && (
                                            <button onClick={e => { e.stopPropagation(); setDescOuverteId(descOuverte ? null : ep.id) }}
                                                style={{ background: descOuverte ? 'var(--bleu)' : '#f0f0f0', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill={descOuverte ? 'white' : '#888'}>
                                                    <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    {/* Panneau description */}
                                    {ep.description && descOuverte && (
                                        <div style={{ background: '#f8f6f1', border: `1px solid var(--bleu)`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 16px' }}>
                                            <div className="ep-description" style={{ fontSize: '13px', color: '#555', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: ep.description || '' }} />                                        </div>
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