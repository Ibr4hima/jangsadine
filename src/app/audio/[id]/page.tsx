'use client'

import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

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

export default function PageCours() {
    const { id } = useParams()
    const [cours, setCours] = useState<Cours | null>(null)
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [episodeActif, setEpisodeActif] = useState<Episode | null>(null)
    const [loading, setLoading] = useState(true)
    const [enLecture, setEnLecture] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        async function charger() {
            const { data: coursData } = await supabase
                .from('cours')
                .select('*, categories(nom)')
                .eq('id', id)
                .single()

            const { data: epsData } = await supabase
                .from('episodes')
                .select('*')
                .eq('cours_id', id)
                .order('numero')

            if (coursData) setCours(coursData)
            if (epsData && epsData.length > 0) {
                setEpisodes(epsData)
            }
            setLoading(false)
        }
        charger()
    }, [id])

    function jouerEpisode(ep: Episode) {
        setEpisodeActif(ep)
        setEnLecture(true)
        setTimeout(() => {
            audioRef.current?.play()
        }, 100)
    }

    function toggleLecture() {
        if (!audioRef.current) return
        if (enLecture) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setEnLecture(!enLecture)
    }

    if (loading) return (
        <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Chargement...</div>
        </main>
    )

    if (!cours) return (
        <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Cours introuvable</div>
        </main>
    )

    return (
        <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
            <Navbar />

            {/* Header */}
            <section style={{ background: 'var(--bleu)', padding: '40px 24px 32px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Link href="/audio" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'inline-block', marginBottom: '16px' }}>
                        ← Retour aux cours
                    </Link>
                    <span style={{
                        fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
                        color: 'var(--or)', textTransform: 'uppercase', display: 'block', marginBottom: '8px'
                    }}>
                        {cours.categories?.nom}
                    </span>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '6px', lineHeight: 1.3 }}>
                        {cours.titre}
                    </h1>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: cours.description ? '12px' : '0' }}>
                        {cours.sheikh} · {cours.nb_episodes} épisode{cours.nb_episodes > 1 ? 's' : ''}
                    </p>
                    {cours.description && (
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', maxWidth: '600px', lineHeight: 1.6, fontStyle: 'italic' }}>
                            {cours.description}
                        </p>
                    )}
                </div>
            </section>

            <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>

                {/* Lecteur audio */}
                {episodeActif && (
                    <div style={{
                        background: 'white',
                        border: '1px solid var(--bordure)',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '24px',
                    }}>
                        <p style={{ fontSize: '12px', color: 'var(--or)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            En cours d'écoute
                        </p>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--texte)', marginBottom: '20px' }}>
                            {episodeActif.titre}
                        </h2>

                        <audio
                            ref={audioRef}
                            src={episodeActif.url_audio}
                            onPlay={() => setEnLecture(true)}
                            onPause={() => setEnLecture(false)}
                            style={{ width: '100%', borderRadius: '8px' }}
                            controls
                        />
                    </div>
                )}

                {/* Liste épisodes */}
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--texte)', marginBottom: '14px' }}>
                    Tous les épisodes
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {episodes.map(ep => {
                        const actif = episodeActif?.id === ep.id
                        return (
                            <div
                                key={ep.id}
                                onClick={() => jouerEpisode(ep)}
                                style={{
                                    background: actif ? '#e8f0f8' : 'white',
                                    border: `1px solid ${actif ? 'var(--bleu)' : 'var(--bordure)'}`,
                                    borderRadius: '10px',
                                    padding: '14px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => {
                                    if (!actif) e.currentTarget.style.borderColor = 'var(--bleu)'
                                }}
                                onMouseLeave={e => {
                                    if (!actif) e.currentTarget.style.borderColor = 'var(--bordure)'
                                }}
                            >
                                {/* Bouton play */}
                                <div style={{
                                    width: '36px', height: '36px',
                                    borderRadius: '50%',
                                    background: actif ? 'var(--bleu)' : '#f0f0f0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {actif && enLecture ? (
                                        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                                            <div style={{ width: '3px', height: '12px', background: 'white', borderRadius: '2px' }} />
                                            <div style={{ width: '3px', height: '12px', background: 'white', borderRadius: '2px' }} />
                                        </div>
                                    ) : (
                                        <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: `10px solid ${actif ? 'white' : '#aaa'}`, marginLeft: '2px' }} />
                                    )}
                                </div>

                                {/* Infos */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '14px', fontWeight: actif ? 600 : 500, color: actif ? 'var(--bleu)' : 'var(--texte)' }}>
                                        {ep.titre}
                                    </div>
                                </div>

                                {/* Durée */}
                                <span style={{ fontSize: '12px', color: '#bbb', flexShrink: 0 }}>
                                    {ep.duree}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Footer */}
            <footer style={{
                background: 'var(--footer-bg)',
                padding: '32px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '60px',
            }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>
                    Jàng sa <span style={{ color: 'var(--or)' }}>Diné</span>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    © 2026 — Tous droits réservés
                </div>
            </footer>
        </main>
    )
}