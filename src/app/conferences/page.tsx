'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import LecteurSticky from '@/components/LecteurSticky'
import { supabase } from '@/lib/supabase'
type Conference = { id: string; titre: string; sheikh: string; duree: string; url_audio: string }
export default function Conferences() {
  const [conferences, setConferences] = useState<Conference[]>([])
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)
  const [actif, setActif] = useState<Conference | null>(null)
  useEffect(() => {
    async function charger() {
      const { data } = await supabase.from('conferences').select('*').order('created_at', { ascending: false })
      if (data) setConferences(data)
      setLoading(false)
    }
    charger()
  }, [])
  const filtres = conferences.filter(c =>
    c.titre.toLowerCase().includes(recherche.toLowerCase()) ||
    c.sheikh.toLowerCase().includes(recherche.toLowerCase())
  )
  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)', paddingBottom: actif ? '100px' : '0' }}>
      <Navbar />
      <section style={{ background: 'var(--bleu)', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '8px' }}>Bibliotheque</p>
        <h1 style={{ fontSize: '40px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>Conférences</h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 24px' }}>Conférences islamiques en français</p>
        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
          <input
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            placeholder="Rechercher par titre ou sheikh..."
            style={{ width: '100%', padding: '12px 20px 12px 44px', borderRadius: '50px', border: 'none', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', boxSizing: 'border-box' }}
          />
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', opacity: 0.6 }}>🔍</span>
        </div>
      </section>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>Chargement...</div>
        ) : filtres.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎤</div>
            <p style={{ fontSize: '16px', color: '#aaa' }}>{recherche ? `Aucune conférence trouvee pour "${recherche}"` : 'Les conférences arrivent bientot'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtres.map(c => (
              <div key={c.id} onClick={() => setActif(c)} style={{ background: actif?.id === c.id ? '#e8f0f8' : 'white', border: `1px solid ${actif?.id === c.id ? 'var(--bleu)' : 'var(--bordure)'}`, borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (actif?.id !== c.id) e.currentTarget.style.borderColor = 'var(--bleu)' }}
                onMouseLeave={e => { if (actif?.id !== c.id) e.currentTarget.style.borderColor = 'var(--bordure)' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: actif?.id === c.id ? 'var(--bleu)' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: `10px solid ${actif?.id === c.id ? 'white' : '#aaa'}`, marginLeft: '2px' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: actif?.id === c.id ? 'var(--bleu)' : 'var(--texte)', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.titre}</p>
                  <p style={{ fontSize: '12px', color: '#999' }}>{c.sheikh}</p>
                </div>
                {c.duree && <span style={{ fontSize: '12px', color: '#bbb', flexShrink: 0 }}>{c.duree}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      <footer style={{ background: 'var(--footer-bg)', padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '40px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Jàng sa <span style={{ color: 'var(--or)' }}>Diné</span></div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{new Date().getFullYear()} — Tous droits réservés</div>
      </footer>
      {actif && <LecteurSticky titre={actif.titre} sheikh={actif.sheikh} url={actif.url_audio} onFermer={() => setActif(null)} />}
    </main>
  )
}
