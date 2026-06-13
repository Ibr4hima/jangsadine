'use client'
import Footer from '@/components/Footer'
import HeroDetail from '@/components/HeroDetail'
import MiniEgaliseur from '@/components/MiniEgaliseur'
import Navbar from '@/components/Navbar'
import TitreDefilant from '@/components/TitreDefilant'
import { useAudio } from '@/contexts/AudioContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const OR = '#d6ad3a'
const BLEU = '#2d578c'
const W70 = 'rgba(255,255,255,0.70)'

type Livre = { id: string; titre: string; titre_arabe?: string | null; url_pdf: string | null; url_audio: string | null; description: string | null; type: string; sheikh: string | null; categories: { nom: string } }
type Cours = { id: string; titre: string; sheikh: string; nb_episodes: number; description: string | null }
type Chapitre = { id: string; titre: string; numero: number; url_pdf: string | null }

export default function PageLivre() {
  const { id } = useParams()
  const [livre, setLivre] = useState<Livre | null>(null)
  const [versions, setVersions] = useState<Cours[]>([])
  const [chapitres, setChapitres] = useState<Chapitre[]>([])
  const [loading, setLoading] = useState(true)
  const { jouerLivre, toggleLivre, enLectureLivre, livreAudio, piste, enLecture } = useAudio()

  useEffect(() => {
    async function charger() {
      const { data: livreData } = await supabase.from('livres').select('*, categories(nom)').eq('id', id).single()
      if (livreData) {
        setLivre(livreData)
        if (livreData.type === 'chapitres') {
          const { data } = await supabase.from('chapitres_livre').select('id, titre, numero, url_pdf').eq('livre_id', id).order('numero')
          if (data) setChapitres(data)
        } else {
          const { data } = await supabase.from('cours').select('id, titre, sheikh, nb_episodes, description').eq('livre_id', id).order('created_at')
          if (data) setVersions(data)
        }
      }
      setLoading(false)
    }
    charger()
  }, [id])

  if (loading) return <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}><Navbar /><div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Chargement…</div></main>
  if (!livre) return <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}><Navbar /><div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Livre introuvable</div></main>

  const categorie = (livre.categories as { nom: string } | null)?.nom ?? ''
  const livreEnLecture = enLectureLivre && livreAudio?.url === livre.url_audio
  const livreActif = livreAudio?.url === livre.url_audio
  const sousTitre = livre.type === 'chapitres'
    ? `${livre.sheikh ? livre.sheikh + ' · ' : ''}${chapitres.length} chapitre${chapitres.length > 1 ? 's' : ''}`
    : (livre.sheikh || '')

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── Héros ── */}
      <HeroDetail>
        <Link href="/audio" style={{ color: W70, fontSize: 13, display: 'inline-block', marginBottom: 14 }}>← Retour aux cours</Link>
        <div style={{ textAlign: 'center' }}>
          {categorie && (
            <div style={{ display: 'inline-block', background: 'rgba(214,173,58,0.16)', borderRadius: 999, padding: '4px 12px', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.8px', color: OR, textTransform: 'uppercase' }}>{categorie}</span>
            </div>
          )}
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>{livre.titre}</h1>
          {livre.titre_arabe && (
            <p style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", direction: 'rtl', fontSize: 15, color: W70, margin: '6px 0 0' }}>{livre.titre_arabe}</p>
          )}
          {sousTitre && <p style={{ fontSize: 13, color: W70, margin: '6px 0 0' }}>{sousTitre}</p>}
          {livre.description && <p style={{ fontSize: 13, color: W70, lineHeight: 1.6, margin: '10px auto 0', maxWidth: 360 }}>{livre.description}</p>}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18, justifyContent: 'center' }}>
            {livre.url_pdf && (
              <a href={livre.url_pdf} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 999, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none',
              }}>
                <svg width="16" height="16" viewBox="0 -960 960 960"><path d="M560-574v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-610q-38 0-73 9.5T560-574Zm0 220v-49q33-13.5 67.5-20.25T700-430q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-390q-38 0-73 9t-67 27Zm0-110v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-500q-38 0-73 9.5T560-464ZM248-300q53.57 0 104.28 12.5Q403-275 452-250v-427q-45-30-97.62-46.5Q301.76-740 248-740q-38 0-74.5 9.5T100-707v434q31-14 70.5-20.5T248-300Zm264 50q50-25 98-37.5T712-300q38 0 78.5 6t69.5 16v-429q-34-17-71.82-25-37.82-8-76.18-8-54 0-104.5 16.5T512-677v427Zm-30 90q-51-38-111-58.5T248-239q-36.54 0-71.77 9T106-208q-23.1 11-44.55-3Q40-225 40-251v-463q0-15 7-27.5T68-761q42-20 87.39-29.5 45.4-9.5 92.61-9.5 63 0 122.5 17T482-731q51-35 109.5-52T712-800q46.87 0 91.93 9.5Q849-781 891-761q14 7 21.5 19.5T920-714v463q0 27.89-22.5 42.45Q875-194 853-208q-34-14-69.23-22.5Q748.54-239 712-239q-63 0-121 21t-109 58ZM276-489Z" fill="#fff" /></svg>
                Consulter le livre
              </a>
            )}
            {livre.url_audio && (
              <button
                onClick={() => { if (!livre.url_audio) return; if (livreActif) toggleLivre(); else jouerLivre(livre.url_audio, livre.titre, livre.id) }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: livreActif ? 'rgba(214,173,58,0.28)' : 'rgba(255,255,255,0.10)',
                  border: `1px solid ${livreActif ? 'rgba(214,173,58,0.6)' : 'rgba(255,255,255,0.14)'}`,
                  borderRadius: 999, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                {livreEnLecture
                  ? <MiniEgaliseur color={OR} />
                  : <svg width="16" height="16" viewBox="0 -960 960 960"><path d="M360-120H200q-33 0-56.5-23.5T120-200v-280q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480v280q0 33-23.5 56.5T760-120H600v-320h160v-40q0-117-81.5-198.5T480-760q-117 0-198.5 81.5T200-480v40h160v320Z" fill="#fff" /></svg>}
                {livreActif ? (enLectureLivre ? 'En lecture' : 'Reprendre') : 'Écouter le livre'}
              </button>
            )}
          </div>
        </div>
      </HeroDetail>

      {/* ── Contenu ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 24px 80px', flex: 1, width: '100%' }}>
        {livre.type === 'chapitres' ? (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', color: OR, textTransform: 'uppercase', margin: '0 0 4px' }}>Table des matières</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--texte)', margin: '0 0 16px' }}>{chapitres.length} chapitre{chapitres.length > 1 ? 's' : ''}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {chapitres.map((chap, i) => (
                <Link key={chap.id} href={`/audio/livre/${id}/chapitre/${chap.id}`} className="carte-piste appear"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 18, padding: 12,
                    boxShadow: '0 4px 10px rgba(58,74,92,0.06)', textDecoration: 'none', animationDelay: `${Math.min(i, 8) * 45}ms`,
                  }}>
                  <div style={{ width: 38, height: 38, borderRadius: 19, background: '#e8f0f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: BLEU, fontVariantNumeric: 'tabular-nums' }}>{chap.numero}</span>
                  </div>
                  <TitreDefilant texte={chap.titre} style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--texte)' }} />
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', color: OR, textTransform: 'uppercase', margin: '0 0 4px' }}>Versions disponibles</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--texte)', margin: '0 0 16px' }}>{versions.length} version{versions.length > 1 ? 's' : ''} de ce cours</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {versions.map((v, i) => {
                const versionActive = piste?.href === `/audio/${v.id}`
                return (
                  <Link key={v.id} href={`/audio/${v.id}`} className="carte-piste appear"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 18, padding: 12,
                      border: versionActive ? `1.5px solid ${BLEU}` : '1.5px solid transparent',
                      boxShadow: '0 4px 10px rgba(58,74,92,0.06)', textDecoration: 'none', animationDelay: `${Math.min(i, 8) * 45}ms`,
                    }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 22, flexShrink: 0,
                      background: versionActive ? BLEU : '#e8f0f8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: versionActive ? '0 3px 6px rgba(45,87,140,0.30)' : 'none',
                    }}>
                      {versionActive && enLecture
                        ? <MiniEgaliseur />
                        : <svg width="20" height="20" viewBox="0 -960 960 960"><path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-460v-380h240v120H560v400q0 66-47 113t-113 47Z" fill={versionActive ? '#fff' : BLEU} /></svg>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <TitreDefilant texte={v.sheikh} style={{ fontSize: 15, fontWeight: 600, color: versionActive ? BLEU : 'var(--texte)' }} />
                      <p style={{ fontSize: 12, color: 'var(--texte-muted)', margin: '3px 0 0' }}>{v.nb_episodes} épisode{v.nb_episodes > 1 ? 's' : ''}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>

      <Footer />

      <style>{`
        .carte-piste { transition: box-shadow 0.15s, transform 0.1s; }
        .carte-piste:hover { box-shadow: 0 6px 18px rgba(58,74,92,0.10); transform: translateY(-1px); }
        .appear { animation: appearUp 0.35s ease both; }
        @keyframes appearUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  )
}
