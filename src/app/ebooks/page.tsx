'use client'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
type Ebook = { id: string; titre: string; description: string; categorie: string; url_pdf: string; nb_pages: number; image_couverture: string | null }
const couleurBg: Record<string, string> = { Aqeedah: '#e8f0f8', Fiqh: '#faf3dc' }
const couleurTxt: Record<string, string> = { Aqeedah: '#28558b', Fiqh: '#b8911f' }
export default function Ebooks() {
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function charger() {
      const { data } = await supabase.from('ebooks').select('*').order('created_at', { ascending: false })
      if (data) setEbooks(data)
      setLoading(false)
    }
    charger()
  }, [])
  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
      <Navbar />
      <section style={{ background: 'var(--bleu)', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '8px' }}>Bibliotheque</p>
        <h1 style={{ fontSize: '40px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>Ebooks</h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto' }}>Consultez, téléchargez et partagez gratuitement !</p>
      </section>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>Chargement...</div>
        ) : ebooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📚</div>
            <p style={{ fontSize: '16px', color: '#aaa' }}>Les ebooks arrivent bientot</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '28px' }}>
            {ebooks.map((eb) => (
              <a key={eb.id} href={eb.url_pdf} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', aspectRatio: '4/3', background: '#fff', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', position: 'relative', width: '100%', border: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.16)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)' }}
                >
                  {eb.image_couverture ? (
                    <img src={eb.image_couverture} alt={eb.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f6f1', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '32px' }}>📄</div>
                      <p style={{ fontSize: '11px', color: '#bbb', textAlign: 'center', padding: '0 8px' }}>{eb.titre}</p>
                    </div>
                  )}                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px', background: couleurBg[eb.categorie] || '#f0f0f0', color: couleurTxt[eb.categorie] || '#666', display: 'inline-block', marginBottom: '5px' }}>{eb.categorie}</span>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--texte)', lineHeight: 1.4, textAlign: 'center' }}>{eb.titre}</p>
                  {eb.nb_pages && <p style={{ fontSize: '11px', color: '#bbb', marginTop: '2px' }}>{eb.nb_pages} pages</p>}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
      <footer style={{ background: 'var(--footer-bg)', padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '60px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Jàng sa <span style={{ color: 'var(--or)' }}>Diné</span></div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{new Date().getFullYear()} — Tous droits réservés</div>
      </footer>
    </main>
  )
}
