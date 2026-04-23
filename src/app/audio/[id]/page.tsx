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
    categories: { nom: string }
}

type Episode = {
    id: string
    titre: string
    numero: number
    duree: string
    url_audio: string
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
    const { jouer, piste, enLecture, progression, dureeTotal, toggleLecture, reculer, avancer, seeker, markerActuel, markers } = useAudio()

    useEffect(() => {
        async function charger() {
            const { data: coursData } = await supabase.from('cours').select('*, categories(nom)').eq('id', id).single()
            const { data: epsData } = await supabase.from('episodes').select('*').eq('cours_id', id).order('numero')
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
                    <Link href="/audio" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'inline-block', marginBottom: '16px' }}>← Retour aux cours</Link>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>{(cours.categories as any)?.nom}</span>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '6px', lineHeight: 1.3 }}>{cours.titre}</h1>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: cours.description ? '10px' : '0' }}>{cours.sheikh} · {cours.nb_episodes} épisode{cours.nb_episodes > 1 ? 's' : ''}</p>
                    {cours.description && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: '600px', fontStyle: 'italic' }}>{cours.description}</p>}
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
                        <div onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); seeker(((e.clientX - rect.left) / rect.width) * 100) }} style={{ height: '4px', background: '#eee', borderRadius: '2px', cursor: 'pointer', marginBottom: '6px' }}>
                            <div style={{ width: progression + '%', height: '100%', background: 'var(--bleu)', borderRadius: '2px', transition: 'width 0.1s' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginBottom: '14px' }}>
                            <span>{formaterTemps(tempsActuel)}</span>
                            <span>{formaterTemps(dureeTotal)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '14px' }}>
                            <button onClick={() => {
                                if (!precedent) return
                                const i = episodes.findIndex(e => e.id === precedent.id)
                                jouer({ id: precedent.id, titre: precedent.titre, sheikh: cours.sheikh, url: precedent.url_audio, duree: precedent.duree, href: `/audio/${id}`, ...pisteVoisins(episodes, i, cours.sheikh, id as string) })
                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: precedent ? 1 : 0.3 }}>
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
                            <button onClick={() => {
                                if (!suivant) return
                                const i = episodes.findIndex(e => e.id === suivant.id)
                                jouer({ id: suivant.id, titre: suivant.titre, sheikh: cours.sheikh, url: suivant.url_audio, duree: suivant.duree, href: `/audio/${id}`, ...pisteVoisins(episodes, i, cours.sheikh, id as string) })
                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: suivant ? 1 : 0.3 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2v6z" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--texte)', marginBottom: '14px' }}>Tous les épisodes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {episodes.map((ep, index) => {
                        const actif = piste?.id === ep.id
                        const i = episodes.findIndex(e => e.id === ep.id)
                        return (
                            <div key={ep.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#bbb', width: '20px', textAlign: 'right', flexShrink: 0 }}>
                                    {index + 1}
                                </span>

                                <div onClick={() => {
                                    jouer({
                                        id: ep.id, titre: ep.titre, sheikh: cours.sheikh, url: ep.url_audio, duree: ep.duree, href: `/audio/${id}`,
                                        ...pisteVoisins(episodes, i, cours.sheikh, id as string)
                                    })
                                }}
                                    style={{ flex: 1, minWidth: 0, overflow: 'hidden', background: actif ? '#e8f0f8' : 'white', border: `1px solid ${actif ? 'var(--bleu)' : 'var(--bordure)'}`, borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { if (!actif) e.currentTarget.style.borderColor = 'var(--bleu)' }}
                                    onMouseLeave={e => { if (!actif) e.currentTarget.style.borderColor = 'var(--bordure)' }}
                                >
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: actif ? 'var(--bleu)' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {actif && enLecture
                                            ? <div style={{ display: 'flex', gap: '2px' }}><div style={{ width: '3px', height: '12px', background: 'white', borderRadius: '2px' }} /><div style={{ width: '3px', height: '12px', background: 'white', borderRadius: '2px' }} /></div>
                                            : <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid ' + (actif ? 'white' : '#aaa'), marginLeft: '2px' }} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <TitreDefilant
                                            texte={ep.titre}
                                            style={{ fontSize: '14px', fontWeight: actif ? 600 : 500, color: actif ? 'var(--bleu)' : 'var(--texte)' }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#bbb', flexShrink: 0 }}>{ep.duree}</span>
                                </div>

                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}