'use client'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { useAudio } from '@/contexts/AudioContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

type Fatwa = { id: string; question: string; sheikh: string; categorie: string; url_audio: string; duree: string }

function formaterTemps(s: number) {
  if (!s || isNaN(s)) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return h + ':' + m.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0')
  return m + ':' + sec.toString().padStart(2, '0')
}

export default function Fatwas() {
  const [fatwas, setFatwas] = useState<Fatwa[]>([])
  const [categories, setCategories] = useState<{ nom: string; couleur: string; epingle: boolean }[]>([])
  const [sheikhs, setSheikhs] = useState<string[]>([])
  const [categorieActive, setCategorieActive] = useState('toutes')
  const [sheikhActif, setSheikhActif] = useState('tous')
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)
  const [sheikhsActifs, setSheikhsActifs] = useState<string[]>([])
  const [dropdownOuvert, setDropdownOuvert] = useState(false)
  const { jouer, piste, enLecture, progression, dureeTotal, toggleLecture, reculer, avancer, seeker } = useAudio()

  useEffect(() => {
    async function charger() {
      const { data: fatwasData } = await supabase.from('fatwas').select('*').order('categorie').order('created_at')
      const { data: catsData } = await supabase.from('fatwas_categories').select('nom, couleur, epingle').order('nom')
      const { data: sheikhsData } = await supabase.from('fatwas_sheikhs').select('nom').order('nom')
      if (fatwasData) setFatwas(fatwasData)
      if (catsData) {
        const triees = [...catsData].sort((a, b) => {
          if (a.epingle && !b.epingle) return -1
          if (!a.epingle && b.epingle) return 1
          return 0
        })
        setCategories(triees)
      } if (sheikhsData) setSheikhs(sheikhsData.map(s => s.nom))
      setLoading(false)
    }
    charger()
  }, [])

  useEffect(() => {
    function fermerDropdown(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown]')) setDropdownOuvert(false)
    }
    document.addEventListener('click', fermerDropdown)
    return () => document.removeEventListener('click', fermerDropdown)
  }, [])

  const tempsActuel = (progression / 100) * dureeTotal

  const filtres = fatwas.filter(f => {
    const matchCat = categorieActive === 'toutes' || f.categorie === categorieActive
    const matchSheikh = sheikhsActifs.length === 0 || sheikhsActifs.includes(f.sheikh)
    const matchRecherche = recherche === '' || f.question.toLowerCase().includes(recherche.toLowerCase()) || f.sheikh.toLowerCase().includes(recherche.toLowerCase())
    return matchCat && matchSheikh && matchRecherche
  })

  // Grouper par catégorie
  const groupes: Record<string, Fatwa[]> = {}
  filtres.forEach(f => {
    if (!groupes[f.categorie]) groupes[f.categorie] = []
    groupes[f.categorie].push(f)
  })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section style={{ background: 'var(--bleu)', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '8px' }}>Bibliothèque</p>
        <h1 style={{ fontSize: '40px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>Fatwas</h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 24px' }}>Questions & réponses par les savants sunnites</p>
        <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
          <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher une fatwa..." style={{ width: '100%', padding: '12px 20px 12px 44px', borderRadius: '50px', border: 'none', fontSize: '16px', fontFamily: 'inherit', outline: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', boxSizing: 'border-box' }} />
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', opacity: 0.6 }}>🔍</span>
        </div>
      </section>

      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px', flex: 1, width: '100%' }}>

        {/* Filtres */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '32px' }}>

          {/* Bouton sheikh dropdown */}
          <div data-dropdown="" style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={() => setDropdownOuvert(!dropdownOuvert)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: sheikhsActifs.length > 0 ? 'none' : '1px solid var(--bordure)', background: sheikhsActifs.length > 0 ? 'var(--or)' : 'white', color: sheikhsActifs.length > 0 ? 'white' : '#666', fontFamily: 'inherit' }}>
              <img src="/icons/list.svg" width="18" height="18" />
              {sheikhsActifs.length > 0 && (
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', color: 'var(--or)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sheikhsActifs.length}
                </span>
              )}
            </button>
            {dropdownOuvert && (
              <div style={{ position: 'absolute', top: '110%', left: 0, background: 'white', border: '1px solid var(--bordure)', borderRadius: '14px', padding: '8px', zIndex: 50, minWidth: '220px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                {sheikhs.map(s => (
                  <div key={s} onClick={() => setSheikhsActifs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', background: sheikhsActifs.includes(s) ? '#faf3dc' : 'transparent' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '2px solid ' + (sheikhsActifs.includes(s) ? 'var(--or)' : '#ccc'), background: sheikhsActifs.includes(s) ? 'var(--or)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {sheikhsActifs.includes(s) && <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--texte)', fontWeight: sheikhsActifs.includes(s) ? 600 : 400, whiteSpace: 'nowrap' }}>{s}</span>                  </div>
                ))}
                {sheikhsActifs.length > 0 && (
                  <button onClick={() => setSheikhsActifs([])} style={{ width: '100%', marginTop: '6px', padding: '6px', borderRadius: '8px', border: 'none', background: '#f0f0f0', color: '#888', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Effacer la sélection
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bouton Toutes */}
          <button onClick={() => setCategorieActive('toutes')} style={{ padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: categorieActive === 'toutes' ? 'none' : '1px solid var(--bordure)', background: categorieActive === 'toutes' ? 'var(--bleu)' : 'white', color: categorieActive === 'toutes' ? 'white' : '#666', fontFamily: 'inherit' }}>
            Toutes
          </button>

          {/* Catégories */}
          {categories.map(cat => (
            <button key={cat.nom} onClick={() => setCategorieActive(cat.nom)} style={{ padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: 'none', background: categorieActive === cat.nom ? cat.couleur + '22' : 'white', color: categorieActive === cat.nom ? cat.couleur : '#666', fontFamily: 'inherit', boxShadow: categorieActive === cat.nom ? 'none' : '0 0 0 1px var(--bordure)' }}>
              {cat.nom}
            </button>
          ))}

        </div>

        {/* Lecteur en cours */}
        {piste && fatwas.some(f => f.id === piste.id) && (
          <div style={{ background: 'white', border: '1px solid var(--bordure)', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
            <p style={{ fontSize: '11px', color: 'var(--or)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>En cours d'écoute</p>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--texte)', marginBottom: '4px' }}>{piste.titre}</h2>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>{piste.sheikh}</p>
            <div onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); seeker(((e.clientX - rect.left) / rect.width) * 100) }} style={{ height: '4px', background: '#eee', borderRadius: '2px', cursor: 'pointer', marginBottom: '6px' }}>
              <div style={{ width: progression + '%', height: '100%', background: 'var(--bleu)', borderRadius: '2px', transition: 'width 0.1s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginBottom: '14px' }}>
              <span>{formaterTemps(tempsActuel)}</span>
              <span>{formaterTemps(dureeTotal)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => {
                const idx = fatwas.findIndex(f => f.id === piste?.id)
                if (idx > 0) jouer({ id: fatwas[idx - 1].id, titre: fatwas[idx - 1].question, sheikh: fatwas[idx - 1].sheikh, url: fatwas[idx - 1].url_audio, duree: fatwas[idx - 1].duree, href: '/fatwas' })
              }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: fatwas.findIndex(f => f.id === piste?.id) > 0 ? 1 : 0.3 }}>
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
                const idx = fatwas.findIndex(f => f.id === piste?.id)
                if (idx < fatwas.length - 1) jouer({ id: fatwas[idx + 1].id, titre: fatwas[idx + 1].question, sheikh: fatwas[idx + 1].sheikh, url: fatwas[idx + 1].url_audio, duree: fatwas[idx + 1].duree, href: '/fatwas' })
              }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: fatwas.findIndex(f => f.id === piste?.id) < fatwas.length - 1 ? 1 : 0.3 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2v6z" /></svg>
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>Chargement...</div>
        ) : filtres.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontSize: '16px', color: '#aaa' }}>Aucune fatwa trouvée</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {Object.entries(groupes).sort(([a], [b]) => {
              const catA = categories.find(c => c.nom === a)
              const catB = categories.find(c => c.nom === b)
              if (catA?.epingle && !catB?.epingle) return -1
              if (!catA?.epingle && catB?.epingle) return 1
              return 0
            }).map(([categorie, items]) => (<div key={categorie}>
              {/* En-tête catégorie */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ height: '1px', background: 'var(--bordure)', flex: 1 }} />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 14px', borderRadius: '20px', background: (categories.find(c => c.nom === categorie)?.couleur || '#f0f0f0') + '22', color: categories.find(c => c.nom === categorie)?.couleur || '#666', border: '1px solid ' + ((categories.find(c => c.nom === categorie)?.couleur || '#ccc') + '44') }}>
                  {categorie}
                </span>
                <div style={{ height: '1px', background: 'var(--bordure)', flex: 1 }} />
              </div>

              {/* Fatwas de cette catégorie */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map(f => {
                  const actif = piste?.id === f.id
                  return (
                    <div key={f.id} style={{ background: actif ? '#e8f0f8' : 'white', border: `1px solid ${actif ? 'var(--bleu)' : 'var(--bordure)'}`, borderRadius: '14px', padding: '18px 20px', cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => { if (!actif) e.currentTarget.style.borderColor = 'var(--bleu)' }}
                      onMouseLeave={e => { if (!actif) e.currentTarget.style.borderColor = 'var(--bordure)' }}
                      onClick={() => jouer({ id: f.id, titre: f.question, sheikh: f.sheikh, url: f.url_audio, duree: f.duree, href: '/fatwas' })}
                    >
                      {/* Question */}
                      <p style={{ fontSize: '15px', fontWeight: 600, color: actif ? 'var(--bleu)' : 'var(--texte)', lineHeight: 1.5, marginBottom: '12px' }}>
                        {f.question}
                      </p>
                      {/* Bas de carte */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: actif ? 'var(--bleu)' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {actif && enLecture
                            ? <div style={{ display: 'flex', gap: '2px' }}><div style={{ width: '2px', height: '10px', background: 'white', borderRadius: '1px' }} /><div style={{ width: '2px', height: '10px', background: 'white', borderRadius: '1px' }} /></div>
                            : <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid ' + (actif ? 'white' : '#aaa'), marginLeft: '2px' }} />}
                        </div>
                        <span style={{ fontSize: '13px', color: actif ? 'var(--bleu)' : '#888', fontWeight: 500 }}>{f.sheikh}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}