'use client'
import CarteEpisode from '@/components/CarteEpisode'
import Footer from '@/components/Footer'
import HeroDetail from '@/components/HeroDetail'
import LecteurInline from '@/components/LecteurInline'
import MiniEgaliseur from '@/components/MiniEgaliseur'
import Navbar from '@/components/Navbar'
import { useAudio } from '@/contexts/AudioContext'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const OR = '#d6ad3a'
const W70 = 'rgba(255,255,255,0.70)'

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

type Episode = { id: string; titre: string; numero: number; duree: string; url_audio: string; description?: string | null }

function voisins(episodes: Episode[], index: number, sheikh: string, courseId: string) {
  const map = (e?: Episode) => e ? { id: e.id, titre: e.titre, sheikh, url: e.url_audio, duree: e.duree, href: `/audio/${courseId}` } : undefined
  return { precedente: map(episodes[index - 1]), suivante: map(episodes[index + 1]) }
}

export default function PageCours() {
  const { id } = useParams()
  const [cours, setCours] = useState<Cours | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [descOuverteId, setDescOuverteId] = useState<string | null>(null)
  const { jouer, piste, enLecture } = useAudio()

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

  if (loading) return <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}><Navbar /><div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Chargement…</div></main>
  if (!cours) return <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}><Navbar /><div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Cours introuvable</div></main>

  const nomCat = (cours.categories as { nom: string } | null)?.nom ?? ''
  const urlPdf = (cours.livres as { url_pdf: string | null } | null)?.url_pdf
  const episodeActif = episodes.some(e => e.id === piste?.id)
  const retour = cours.serie_unique || !cours.livre_id ? '/audio' : `/audio/livre/${cours.livre_id}`

  function jouerEpisode(ep: { id: string; titre: string; url_audio: string; duree?: string }) {
    const i = episodes.findIndex(e => e.id === ep.id)
    jouer({ id: ep.id, titre: ep.titre, sheikh: cours!.sheikh, url: ep.url_audio, duree: ep.duree, href: `/audio/${id}`, ...voisins(episodes, i, cours!.sheikh, id as string) })
  }
  function toutEcouter() {
    if (episodes.length === 0) return
    jouerEpisode(episodes[0])
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── Héros ── */}
      <HeroDetail retour={retour}>
        <div style={{ textAlign: 'center' }}>
          {nomCat && (
            <div style={{ display: 'inline-block', background: 'rgba(214,173,58,0.16)', borderRadius: 999, padding: '4px 12px', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.8px', color: OR, textTransform: 'uppercase' }}>{nomCat}</span>
            </div>
          )}
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>{cours.titre}</h1>
          <p style={{ fontSize: 13, color: W70, margin: '6px 0 0' }}>
            {cours.sheikh}{cours.nb_episodes ? ` · ${cours.nb_episodes} épisode${cours.nb_episodes > 1 ? 's' : ''}` : ''}
          </p>
          {cours.description && (
            <p style={{ fontSize: 13, color: W70, lineHeight: 1.6, margin: '10px auto 0', maxWidth: 360 }}>{cours.description}</p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18, justifyContent: 'center' }}>
            <button onClick={toutEcouter} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: episodeActif ? 'rgba(214,173,58,0.28)' : 'rgba(255,255,255,0.10)',
              border: `1px solid ${episodeActif ? 'rgba(214,173,58,0.6)' : 'rgba(255,255,255,0.14)'}`,
              borderRadius: 999, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {episodeActif && enLecture
                ? <MiniEgaliseur color={OR} />
                : <svg width="15" height="15" viewBox="0 -960 960 960"><path d="M320-200v-560l440 280-440 280Z" fill="#fff" /></svg>}
              {episodeActif ? (enLecture ? 'En lecture' : 'Reprendre') : 'Tout écouter'}
            </button>
            {urlPdf && (
              <a href={urlPdf} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 999, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none',
              }}>
                <svg width="16" height="16" viewBox="0 -960 960 960"><path d="M560-574v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-610q-38 0-73 9.5T560-574Zm0 220v-49q33-13.5 67.5-20.25T700-430q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-390q-38 0-73 9t-67 27Zm0-110v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-500q-38 0-73 9.5T560-464ZM248-300q53.57 0 104.28 12.5Q403-275 452-250v-427q-45-30-97.62-46.5Q301.76-740 248-740q-38 0-74.5 9.5T100-707v434q31-14 70.5-20.5T248-300Zm264 50q50-25 98-37.5T712-300q38 0 78.5 6t69.5 16v-429q-34-17-71.82-25-37.82-8-76.18-8-54 0-104.5 16.5T512-677v427Zm-30 90q-51-38-111-58.5T248-239q-36.54 0-71.77 9T106-208q-23.1 11-44.55-3Q40-225 40-251v-463q0-15 7-27.5T68-761q42-20 87.39-29.5 45.4-9.5 92.61-9.5 63 0 122.5 17T482-731q51-35 109.5-52T712-800q46.87 0 91.93 9.5Q849-781 891-761q14 7 21.5 19.5T920-714v463q0 27.89-22.5 42.45Q875-194 853-208q-34-14-69.23-22.5Q748.54-239 712-239q-63 0-121 21t-109 58ZM276-489Z" fill="#fff" /></svg>
                Consulter le livre
              </a>
            )}
          </div>
        </div>
      </HeroDetail>

      {/* ── Contenu ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 24px 80px', flex: 1, width: '100%' }}>
        <LecteurInline episodes={episodes} onJouerEp={jouerEpisode} />

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', color: OR, textTransform: 'uppercase', margin: '0 0 12px' }}>Épisodes</p>
        {episodes.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', fontSize: 14, color: 'var(--texte-muted)' }}>Les épisodes arrivent bientôt</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {episodes.map((ep, index) => (
              <div key={ep.id} className="appear" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
                <CarteEpisode
                  ep={ep}
                  numero={ep.numero ?? index + 1}
                  actif={piste?.id === ep.id}
                  enLecture={enLecture}
                  descOuverte={descOuverteId === ep.id}
                  onPlay={() => jouerEpisode(ep)}
                  onToggleDesc={() => setDescOuverteId(descOuverteId === ep.id ? null : ep.id)}
                />
              </div>
            ))}
          </div>
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
