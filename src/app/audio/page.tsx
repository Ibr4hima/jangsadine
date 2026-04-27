'use client'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function normaliser(texte: string): string {
    return texte
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[ḍḏṭṯṣṡẓḥḫġ]/g, (c) => ({ ḍ: 'd', ḏ: 'd', ṭ: 't', ṯ: 't', ṣ: 's', ṡ: 's', ẓ: 'z', ḥ: 'h', ḫ: 'h', ġ: 'g' }[c] || c))
        .replace(/[āīūôê]/g, (c) => ({ ā: 'a', ī: 'i', ū: 'u', ô: 'o', ê: 'e' }[c] || c))
}

type Categorie = { id: string; nom: string; slug: string; ordre: number }
type Livre = { id: string; titre: string; categorie_id: string; titre_arabe?: string; nb_cours?: number }

const couleurBg: Record<string, string> = {
    Aqeedah: '#e8f0f8',
    Fiqh: '#faf3dc',
    Hadith: '#eaf4ee',
    'Tafsir & Sciences du Coran': '#fde8f0',
    Seerah: '#fdf0eb',
    'Éthique & Bons comportements': '#f2eefa',
    'Séries de cours': '#e8f8e8',
}

const couleurTxt: Record<string, string> = {
    Aqeedah: '#28558b',
    Fiqh: '#b8911f',
    Hadith: '#2d7a4f',
    'Tafsir & Sciences du Coran': '#a02060',
    Seerah: '#c05c2e',
    'Éthique & Bons comportements': '#6b3db5',
    'Séries de cours': '#1a7a1a',
}

export default function Audio() {
    const [categories, setCategories] = useState<Categorie[]>([])
    const [livres, setLivres] = useState<Livre[]>([])
    const [livresAvecNb, setLivresAvecNb] = useState<Record<string, number>>({})
    const [coursData, setCoursData] = useState<{ livre_id: string; sheikh: string }[]>([])
    const [categorieActive, setCategorieActive] = useState<string>('toutes')
    const [loading, setLoading] = useState(true)
    const [recherche, setRecherche] = useState('')
    const [coursSerieUniqueMap, setCoursSerieUniqueMap] = useState<Record<string, string>>({})

    useEffect(() => {
        async function charger() {
            const { data: cats } = await supabase.from('categories').select('*').order('ordre')
            const { data: livresList } = await supabase.from('livres').select('*').order('created_at')
            const { data: coursList } = await supabase.from('cours').select('livre_id, sheikh, serie_unique').not('livre_id', 'is', null)
            if (cats) setCategories(cats)
            if (livresList) setLivres(livresList)
            if (coursList) {
                const nb: Record<string, number> = {}
                coursList.forEach(c => { if (c.livre_id) nb[c.livre_id] = (nb[c.livre_id] || 0) + 1 })
                setLivresAvecNb(nb)
            }
            if (coursList) setCoursData(coursList as any)
            const serieMap: Record<string, string> = {}
            const { data: coursAvecId } = await supabase.from('cours').select('id, livre_id, serie_unique').eq('serie_unique', true)
            if (coursAvecId) coursAvecId.forEach(c => { if (c.livre_id) serieMap[c.livre_id] = c.id })
            setCoursSerieUniqueMap(serieMap)
            setLoading(false)
        }
        charger()
    }, [])

    const livresFiltres = livres.filter(l => {
        const cat = categories.find(c => c.id === l.categorie_id)
        const matchCategorie = categorieActive === 'toutes' || cat?.slug === categorieActive
        const matchRecherche = recherche === '' ||
            normaliser(l.titre).includes(normaliser(recherche)) ||
            (l.titre_arabe ? l.titre_arabe.includes(recherche) : false)
        return matchCategorie && matchRecherche
    })

    return (
        <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
            <Navbar />
            <section style={{ background: 'var(--bleu)', padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '8px' }}>Bibliotheque</p>
                <h1 style={{ fontSize: '40px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>Cours audio</h1>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto' }}>Tous les cours sont dispensés par des savants sénégalais en suivant le Coran et la Sunnah selon la compréhension des pieux prédecesseurs.</p>
                <div style={{ maxWidth: '500px', margin: '24px auto 0', position: 'relative' }}>
                    <input
                        value={recherche}
                        onChange={e => setRecherche(e.target.value)}
                        placeholder="Rechercher un cours audio..."
                        style={{
                            width: '100%',
                            padding: '12px 20px 12px 44px',
                            borderRadius: '50px',
                            border: 'none',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            outline: 'none',
                            background: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            boxSizing: 'border-box',
                        }}
                    />
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', opacity: 0.6 }}>🔍</span>
                </div>
            </section>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px', justifyContent: 'center' }}>
                    <button onClick={() => setCategorieActive('toutes')} style={{ padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: categorieActive === 'toutes' ? 'none' : '1px solid var(--bordure)', background: categorieActive === 'toutes' ? 'var(--bleu)' : 'white', color: categorieActive === 'toutes' ? 'white' : '#666', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                        Tous
                    </button>
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => setCategorieActive(cat.slug)}
                            style={{ padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: categorieActive === cat.slug ? 'none' : '1px solid var(--bordure)', background: categorieActive === cat.slug ? couleurBg[cat.nom] || 'var(--bleu)' : 'white', color: categorieActive === cat.slug ? couleurTxt[cat.nom] || 'var(--bleu)' : '#666', transition: 'all 0.15s', fontFamily: 'inherit' }}
                            onMouseEnter={e => { if (categorieActive !== cat.slug) { e.currentTarget.style.background = couleurBg[cat.nom] || '#f0f0f0'; e.currentTarget.style.color = couleurTxt[cat.nom] || '#333'; e.currentTarget.style.border = 'none' } }}
                            onMouseLeave={e => { if (categorieActive !== cat.slug) { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#666'; e.currentTarget.style.border = '1px solid var(--bordure)' } }}
                        >
                            {cat.nom}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa', fontSize: '15px' }}>Chargement...</div>
                ) : livresFiltres.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
                        <p style={{ fontSize: '16px', color: '#aaa' }}>Aucun résultat trouvé</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {livresFiltres.map(l => {
                            const cat = categories.find(c => c.id === l.categorie_id)
                            const nbVersions = livresAvecNb[l.id] || 0
                            return (
                                <Link key={l.id} href={coursSerieUniqueMap[l.id] ? `/audio/${coursSerieUniqueMap[l.id]}` : `/audio/livre/${l.id}`} style={{ background: 'white', border: '1px solid var(--bordure)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px', textDecoration: 'none', transition: 'border-color 0.15s, transform 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--bleu)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bordure)'; e.currentTarget.style.transform = 'translateY(0)' }}
                                >
                                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '10px', background: couleurBg[cat?.nom || ''] || '#f0f0f0', color: couleurTxt[cat?.nom || ''] || '#666', display: 'inline-block', alignSelf: 'flex-start' }}>
                                        {cat?.nom}
                                    </span>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--texte)', lineHeight: 1.4, flex: 1 }}>{l.titre}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        {l.titre_arabe ? (
                                            <span style={{
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                padding: '3px 10px',
                                                borderRadius: '10px',
                                                background: '#f0f0f0',
                                                color: '#888',
                                                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                                                direction: 'rtl',
                                                display: 'inline-block',
                                            }}>
                                                {l.titre_arabe}
                                            </span>
                                        ) : (
                                            <span />
                                        )}
                                        <span style={{ fontSize: '13px', color: 'var(--texte)', fontWeight: 500 }}>Voir →</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
            <Footer />

        </main>
    )
}
