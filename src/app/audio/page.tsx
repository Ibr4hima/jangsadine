'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Categorie = { id: string; nom: string; slug: string; ordre: number }
type Livre = { id: string; titre: string; categorie_id: string; nb_cours?: number }

const couleurBg: Record<string,string> = {
  Aqeedah: '#e8f0f8', Fiqh: '#faf3dc', Hadith: '#eaf4ee',
  Seerah: '#fdf0eb', 'Bons comportements': '#f2eefa', 'Sciences du Coran': '#e8f6f5',
}
const couleurTxt: Record<string,string> = {
  Aqeedah: '#28558b', Fiqh: '#b8911f', Hadith: '#2d7a4f',
  Seerah: '#c05c2e', 'Bons comportements': '#6b3db5', 'Sciences du Coran': '#1a8a7a',
}

export default function Audio() {
  const [categories, setCategories] = useState<Categorie[]>([])
  const [livres, setLivres] = useState<Livre[]>([])
  const [livresAvecNb, setLivresAvecNb] = useState<Record<string, number>>({})
  const [categorieActive, setCategorieActive] = useState<string>('toutes')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function charger() {
      const { data: cats } = await supabase.from('categories').select('*').order('ordre')
      const { data: livresList } = await supabase.from('livres').select('*').order('created_at')
      const { data: coursList } = await supabase.from('cours').select('livre_id').not('livre_id', 'is', null)
      if (cats) setCategories(cats)
      if (livresList) setLivres(livresList)
      if (coursList) {
        const nb: Record<string, number> = {}
        coursList.forEach(c => { if (c.livre_id) nb[c.livre_id] = (nb[c.livre_id] || 0) + 1 })
        setLivresAvecNb(nb)
      }
      setLoading(false)
    }
    charger()
  }, [])

  const livresFiltres = categorieActive === 'toutes'
    ? livres
    : livres.filter(l => {
        const cat = categories.find(c => c.id === l.categorie_id)
        return cat?.slug === categorieActive
      })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
      <Navbar />
      <section style={{ background: 'var(--bleu)', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '8px' }}>Bibliotheque</p>
        <h1 style={{ fontSize: '40px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>Cours audio</h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto' }}>Des cours dispensés par des etudiants en sciences islamiques</p>
      </section>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px', justifyContent: 'center' }}>
          <button onClick={() => setCategorieActive('toutes')} style={{ padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: categorieActive === 'toutes' ? 'none' : '1px solid var(--bordure)', background: categorieActive === 'toutes' ? 'var(--bleu)' : 'white', color: categorieActive === 'toutes' ? 'white' : '#666', transition: 'all 0.15s', fontFamily: 'inherit' }}>
            Toutes
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
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎧</div>
            <p style={{ fontSize: '16px', color: '#aaa' }}>Les cours arrivent bientot</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {livresFiltres.map(l => {
              const cat = categories.find(c => c.id === l.categorie_id)
              const nbVersions = livresAvecNb[l.id] || 0
              return (
                <Link key={l.id} href={`/audio/livre/${l.id}`} style={{ background: 'white', border: '1px solid var(--bordure)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px', textDecoration: 'none', transition: 'border-color 0.15s, transform 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--bleu)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bordure)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '10px', background: couleurBg[cat?.nom || ''] || '#f0f0f0', color: couleurTxt[cat?.nom || ''] || '#666', display: 'inline-block', alignSelf: 'flex-start' }}>
                    {cat?.nom}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--texte)', lineHeight: 1.4, flex: 1 }}>{l.titre}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#bbb' }}>
                      {nbVersions > 0 ? `${nbVersions} version${nbVersions > 1 ? 's' : ''} disponible${nbVersions > 1 ? 's' : ''}` : 'Bientot disponible'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--texte)', fontWeight: 500 }}>Voir →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
      <footer style={{ background: 'var(--footer-bg)', padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '60px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Jàng sa <span style={{ color: 'var(--or)' }}>Diné</span></div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>© 2026 — Tous droits réservés</div>
      </footer>
    </main>
  )
}
