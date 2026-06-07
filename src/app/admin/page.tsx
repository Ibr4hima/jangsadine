'use client'
import EditeurTexte from '@/components/EditeurTexte';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
type Categorie = { id: string; nom: string; slug: string }
type CoursItem = { id: string; titre: string; sheikh: string }
type Marker = { titre: string; temps: string }


export default function Admin() {
    const [categories, setCategories] = useState<Categorie[]>([])
    const [onglet, setOnglet] = useState<'livre' | 'cours' | 'episode' | 'ebook' | 'khoutbah' | 'conference' | 'fatwa' | 'chapitre' | 'episode_chapitre' | 'modifier'>('livre')
    const [livresList, setLivresList] = useState<{ id: string; titre: string }[]>([])
    const [coursList, setCoursList] = useState<CoursItem[]>([])
    const [livreId, setLivreId] = useState('')
    const [lTitre, setLTitre] = useState('')
    const [lType, setLType] = useState('standard')
    const [lTitreArabe, setLTitreArabe] = useState('')
    const [lCategorie, setLCategorie] = useState('')
    const [lFichier, setLFichier] = useState<File | null>(null)
    const [coursSerieUnique, setCoursSerieUnique] = useState(false)
    const [titre, setTitre] = useState('')
    const [sheikh, setSheikh] = useState('')
    const [categorieId, setCategorieId] = useState('')
    const [description, setDescription] = useState('')
    const [coursLivreId, setCoursLivreId] = useState('')
    const [coursId, setCoursId] = useState('')
    const [epTitre, setEpTitre] = useState('')
    const [epNumero, setEpNumero] = useState('')
    const [epDuree, setEpDuree] = useState('')
    const [fichiers, setFichiers] = useState<File[]>([])
    const [markers, setMarkers] = useState<Marker[]>([])
    const [markerTitre, setMarkerTitre] = useState('')
    const [markerTemps, setMarkerTemps] = useState('')
    const [ebTitre, setEbTitre] = useState('')
    const [ebDescription, setEbDescription] = useState('')
    const [ebCategorie, setEbCategorie] = useState('')
    const [lAudio, setLAudio] = useState<File | null>(null)
    const [lSheikh, setLSheikh] = useState('')
    const [epDescription, setEpDescription] = useState('')
    const [ebPages, setEbPages] = useState('')
    const [ebFichier, setEbFichier] = useState<File | null>(null)
    const [ebCover, setEbCover] = useState<File | null>(null)
    const [khTitre, setKhTitre] = useState('')
    const [khSheikh, setKhSheikh] = useState('')
    const [khDuree, setKhDuree] = useState('')
    const [khSerie, setKhSerie] = useState('')
    const [khNumeroSerie, setKhNumeroSerie] = useState('')
    const [khFichier, setKhFichier] = useState<File | null>(null)
    const [confTitre, setConfTitre] = useState('')
    const [confSheikh, setConfSheikh] = useState('')
    const [confDuree, setConfDuree] = useState('')
    const [confFichier, setConfFichier] = useState<File | null>(null)
    const [fatwaCats, setFatwaCats] = useState<{ id: string; nom: string }[]>([])
    const [fatwaSheikhs, setFatwaSheikhs] = useState<{ id: string; nom: string }[]>([])
    const [fatwaQuestion, setFatwaQuestion] = useState('')
    const [fatwaSheikh, setFatwaSheikh] = useState('')
    const [modifLivreAudioId, setModifLivreAudioId] = useState('')
    const [modifLivreAudioFichier, setModifLivreAudioFichier] = useState<File | null>(null)
    const [fatwaCat, setFatwaCat] = useState('')
    const [chapLivreId, setChapLivreId] = useState('')
    const [chapTitre, setChapTitre] = useState('')
    const [chapNumero, setChapNumero] = useState('')
    const [chapUrlPdf, setChapUrlPdf] = useState('')
    const [chapFichierPdf, setChapFichierPdf] = useState<File | null>(null)
    const [chapitresList, setChapitresList] = useState<{ id: string; titre: string; livre_id: string }[]>([])
    const [epChapId, setEpChapId] = useState('')
    const [epChapTitre, setEpChapTitre] = useState('')
    const [epChapNumero, setEpChapNumero] = useState('')
    const [epChapDuree, setEpChapDuree] = useState('')
    const [epChapDescription, setEpChapDescription] = useState('')
    const [epChapFichiers, setEpChapFichiers] = useState<File[]>([])
    const [fatwaNouveauCat, setFatwaNouveauCat] = useState('')
    const [fatwaNouveauSheikh, setFatwaNouveauSheikh] = useState('')
    const [fatwaNouveauCouleur, setFatwaNouveauCouleur] = useState('#b7410e')
    const [fatwaFichier, setFatwaFichier] = useState<File | null>(null)
    const [modifLivreId, setModifLivreId] = useState('')
    const [modifLivrePdf, setModifLivrePdf] = useState<File | null>(null)
    const [modifCoursId, setModifCoursId] = useState('')
    const [modifCoursLivreId, setModifCoursLivreId] = useState('')
    const [ebookCats, setEbookCats] = useState<{ id: string; nom: string; couleur: string }[]>([])
    const [ebookCat, setEbookCat] = useState('')
    const [ebookNouveauCat, setEbookNouveauCat] = useState('')
    const [ebookNouveauCouleur, setEbookNouveauCouleur] = useState('#b7410e')
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        async function charger() {
            const { data: cats } = await supabase.from('categories').select('*').order('ordre')
            const { data: cours } = await supabase.from('cours').select('id,titre,sheikh').order('titre')
            const { data: livres } = await supabase.from('livres').select('id,titre').order('titre')
            const { data: fCats } = await supabase.from('fatwas_categories').select('*').order('nom')
            const { data: fSheikhs } = await supabase.from('fatwas_sheikhs').select('*').order('nom')
            const { data: chaps } = await supabase.from('chapitres_livre').select('id, titre, livre_id').order('numero')
            const { data: ebCats } = await supabase.from('ebooks_categories').select('*').order('nom')
            if (ebCats) setEbookCats(ebCats)
            if (chaps) setChapitresList(chaps)
            if (cats) setCategories(cats)
            if (cours) setCoursList(cours)
            if (livres) setLivresList(livres)
            if (fCats) setFatwaCats(fCats)
            if (fSheikhs) setFatwaSheikhs(fSheikhs)
        }
        charger()
    }, [])

    async function uploadFichier(fichier: File, dossier: string) {
        const nomNettoye = fichier.name
            .replace(/\s/g, '-')
            .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u').replace(/[ç]/g, 'c')
            .replace(/[^a-zA-Z0-9.\-_]/g, '')
        const nomFichier = `${dossier}/${Date.now()}-${nomNettoye}`
        const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: nomFichier, type: fichier.type }) })
        const { url } = await res.json()
        await fetch(url, { method: 'PUT', body: fichier, headers: { 'Content-Type': fichier.type } })
        return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${nomFichier}`
    }

    function getDuree(file: File): Promise<string> {
        return new Promise(resolve => {
            const audio = new Audio()
            const url = URL.createObjectURL(file)
            const fmt = (d: number) => {
                const t = Math.round(d)
                const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60
                return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`
            }
            audio.addEventListener('loadedmetadata', () => {
                if (!isNaN(audio.duration) && audio.duration !== Infinity && audio.duration > 0) {
                    URL.revokeObjectURL(url); resolve(fmt(audio.duration))
                } else {
                    // VBR MP3 : seeked est plus rapide et fiable que timeupdate
                    audio.addEventListener('seeked', () => {
                        URL.revokeObjectURL(url)
                        resolve(!isNaN(audio.duration) && audio.duration > 0 ? fmt(audio.duration) : '')
                    }, { once: true })
                    audio.currentTime = 1e101
                }
            })
            audio.addEventListener('error', () => { URL.revokeObjectURL(url); resolve('') })
            audio.src = url
        })
    }

    function tempsEnSecondes(temps: string): number {
        const parts = temps.split(':').map(Number)
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
        if (parts.length === 2) return parts[0] * 60 + parts[1]
        return parts[0]
    }

    function ajouterMarker() {
        if (!markerTitre || !markerTemps) return
        setMarkers(prev => [...prev, { titre: markerTitre, temps: markerTemps }])
        setMarkerTitre('')
        setMarkerTemps('')
    }

    async function ajouterLivre(e: React.FormEvent) {
        e.preventDefault(); setMessage(''); setUploading(true)
        try {
            let urlPdf = null
            if (lFichier) urlPdf = await uploadFichier(lFichier, 'livres')
            const { error } = await supabase.from('livres').insert({ titre: lTitre, categorie_id: lCategorie, url_pdf: urlPdf, titre_arabe: lTitreArabe || null, type: lType, sheikh: lSheikh || null, url_audio: lAudio ? await uploadFichier(lAudio, 'livres_audio') : null })
            if (error) throw error
            setMessage('Livre ajouté avec succès !')
            setLTitre(''); setLCategorie(''); setLTitreArabe(''); setLFichier(null); setLType('standard'); setLSheikh(''); setLAudio(null)
            const input = document.getElementById('livre-pdf') as HTMLInputElement
            if (input) input.value = ''
            const { data } = await supabase.from('livres').select('id,titre').order('titre')
            if (data) setLivresList(data)
        } catch (err) { setMessage('Erreur'); console.error(err) }
        setUploading(false)
    }

    async function ajouterCours(e: React.FormEvent) {
        e.preventDefault(); setMessage('')
        const { error } = await supabase.from('cours').insert({ titre: titre || undefined, sheikh, categorie_id: categorieId, nb_episodes: 0, description: description || null, livre_id: coursLivreId || null, serie_unique: coursSerieUnique })
        if (error) { setMessage('Erreur : ' + error.message) } else {
            setMessage('Cours ajouté avec succès !')
            setTitre(''); setSheikh(''); setCategorieId(''); setDescription(''); setCoursLivreId(''); setCoursSerieUnique(false)
            const { data } = await supabase.from('cours').select('id,titre,sheikh').order('titre')
            if (data) setCoursList(data)
        }
    }

    async function ajouterEpisode(e: React.FormEvent) {
        e.preventDefault()
        if (fichiers.length === 0) return setMessage('Selectionne au moins un fichier audio')
        setUploading(true); setMessage('')
        try {
            const numeroDepart = parseInt(epNumero)
            const isMultiple = fichiers.length > 1
            const BATCH = 3

            // 1. Durées en parallèle
            if (isMultiple) setMessage(`Calcul des durées (${fichiers.length} fichiers)...`)
            const durees = await Promise.all(fichiers.map(f => isMultiple ? getDuree(f) : Promise.resolve(epDuree)))

            // 2. Signed URLs par lots de 3 (évite le throttling de la serverless function)
            setMessage('Préparation des uploads...')
            const uploadData: { url: string; nomFichier: string; f: File; numero: number; duree: string }[] = []
            for (let i = 0; i < fichiers.length; i += BATCH) {
                const batch = await Promise.all(fichiers.slice(i, i + BATCH).map(async (f, j) => {
                    const numero = numeroDepart + i + j
                    const nomFichier = `${coursId}/${numero}-${f.name.replace(/\s/g, '-')}`
                    const data = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: nomFichier, type: f.type || 'audio/mpeg' }) }).then(r => r.json())
                    if (!data.url) throw new Error(`Impossible d'obtenir l'URL signée pour "${f.name}"`)
                    return { url: data.url, nomFichier, f, numero, duree: durees[i + j] }
                }))
                uploadData.push(...batch)
            }

            // 3. Uploads R2 en parallèle par lots de 3
            let uploaded = 0
            for (let i = 0; i < uploadData.length; i += BATCH) {
                await Promise.all(uploadData.slice(i, i + BATCH).map(async ({ url, f }) => {
                    const res = await fetch(url, { method: 'PUT', body: f, headers: { 'Content-Type': f.type || 'audio/mpeg' } })
                    if (!res.ok) throw new Error(`Erreur upload "${f.name}" : ${res.status}`)
                }))
                uploaded += Math.min(BATCH, uploadData.length - i)
                setMessage(`Upload ${uploaded}/${fichiers.length}...`)
            }

            // 4. Bulk insert Supabase
            setMessage('Enregistrement...')
            const inserts = uploadData.map(({ nomFichier, numero, duree }, i) => ({
                cours_id: coursId,
                titre: isMultiple ? (epTitre ? `${epTitre} — ${numero}` : fichiers[i].name.replace(/\.[^/.]+$/, '')) : epTitre,
                numero,
                description: epDescription || null,
                duree,
                url_audio: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${nomFichier}`
            }))
            const { data: insertedEps, error } = await supabase.from('episodes').insert(inserts).select()
            if (error) throw error

            // Markers (épisode unique uniquement)
            if (!isMultiple && markers.length > 0 && insertedEps?.[0]) {
                await Promise.all(markers.map(m => supabase.from('episode_markers').insert({
                    episode_id: insertedEps[0].id, titre: m.titre, temps_secondes: tempsEnSecondes(m.temps)
                })))
            }

            const { data: eps } = await supabase.from('episodes').select('id').eq('cours_id', coursId)
            await supabase.from('cours').update({ nb_episodes: eps?.length || 0 }).eq('id', coursId)
            setMessage('Episodes ajoutés avec succès !')
            setEpTitre(''); setEpNumero(''); setEpDuree(''); setEpDescription(''); setFichiers([]); setMarkers([])
            const input = document.getElementById('fichier-input') as HTMLInputElement
            if (input) input.value = ''
        } catch (err) { setMessage('Erreur upload'); console.error(err) }
        setUploading(false)
    }

    async function ajouterEbook(e: React.FormEvent) {
        e.preventDefault()
        if (!ebFichier) return setMessage('Selectionne un fichier PDF')
        setUploading(true); setMessage('')
        try {
            const urlPdf = await uploadFichier(ebFichier, 'ebooks')
            let urlCover = null
            if (ebCover) urlCover = await uploadFichier(ebCover, 'covers')

            let catFinale = ebookCat
            if (ebookNouveauCat) {
                // Vérifier si la catégorie existe déjà
                const exists = ebookCats.some(c => c.nom.toLowerCase() === ebookNouveauCat.toLowerCase())
                if (exists) {
                    setMessage('Cette catégorie existe déjà !')
                    setUploading(false)
                    return
                }
                await supabase.from('ebooks_categories').insert({ nom: ebookNouveauCat, couleur: ebookNouveauCouleur })
                catFinale = ebookNouveauCat
                const { data } = await supabase.from('ebooks_categories').select('*').order('nom')
                if (data) setEbookCats(data)
            }

            const { error } = await supabase.from('ebooks').insert({ titre: ebTitre, description: ebDescription, categorie: catFinale, url_pdf: urlPdf, nb_pages: ebPages ? parseInt(ebPages) : null, image_couverture: urlCover })
            if (error) throw error
            setMessage('Ebook ajouté avec succès !')
            setEbTitre(''); setEbDescription(''); setEbCategorie(''); setEbPages(''); setEbFichier(null); setEbCover(null); setEbookCat(''); setEbookNouveauCat(''); setEbookNouveauCouleur('#b7410e')
            const pdfInput = document.getElementById('pdf-input') as HTMLInputElement
            const coverInput = document.getElementById('cover-input') as HTMLInputElement
            if (pdfInput) pdfInput.value = ''
            if (coverInput) coverInput.value = ''
        } catch (err) { setMessage('Erreur upload'); console.error(err) }
        setUploading(false)
    }

    async function ajouterKhoutbah(e: React.FormEvent) {
        e.preventDefault()
        if (!khFichier) return setMessage('Selectionne un fichier audio')
        setUploading(true); setMessage('')
        try {
            const urlAudio = await uploadFichier(khFichier, 'khoutbahs')
            const duree = khDuree || await getDuree(khFichier)
            const { error } = await supabase.from('khoutbahs').insert({ titre: khTitre, sheikh: khSheikh, duree, url_audio: urlAudio, serie: khSerie || null, numero_serie: khNumeroSerie ? parseInt(khNumeroSerie) : null })
            if (error) throw error
            setMessage('Khoutbah ajoutée avec succès !')
            setKhTitre(''); setKhSheikh(''); setKhDuree(''); setKhSerie(''); setKhNumeroSerie(''); setKhFichier(null)
            const input = document.getElementById('kh-input') as HTMLInputElement
            if (input) input.value = ''
        } catch (err) { setMessage('Erreur upload'); console.error(err) }
        setUploading(false)
    }

    async function ajouterConference(e: React.FormEvent) {
        e.preventDefault()
        if (!confFichier) return setMessage('Selectionne un fichier audio')
        setUploading(true); setMessage('')
        try {
            const urlAudio = await uploadFichier(confFichier, 'conferences')
            const duree = confDuree || await getDuree(confFichier)
            const { error } = await supabase.from('conferences').insert({ titre: confTitre, sheikh: confSheikh, duree, url_audio: urlAudio })
            if (error) throw error
            setMessage('Conference ajoutée avec succès !')
            setConfTitre(''); setConfSheikh(''); setConfDuree(''); setConfFichier(null)
            const input = document.getElementById('conf-input') as HTMLInputElement
            if (input) input.value = ''
        } catch (err) { setMessage('Erreur upload'); console.error(err) }
        setUploading(false)
    }

    async function ajouterFatwa(e: React.FormEvent) {
        e.preventDefault()
        if (!fatwaFichier) return setMessage('Selectionne un fichier audio')
        setUploading(true); setMessage('')
        try {
            const urlAudio = await uploadFichier(fatwaFichier, 'fatwas')
            const duree = await getDuree(fatwaFichier)
            let catFinale = fatwaCat
            if (fatwaNouveauCat) {
                const exists = fatwaCats.some(c => c.nom.toLowerCase() === fatwaNouveauCat.toLowerCase())
                if (exists) {
                    setMessage('Cette catégorie existe déjà !')
                    setUploading(false)
                    return
                }
                await supabase.from('fatwas_categories').insert({ nom: fatwaNouveauCat, couleur: fatwaNouveauCouleur })
                catFinale = fatwaNouveauCat
                const { data } = await supabase.from('fatwas_categories').select('*').order('nom')
                if (data) setFatwaCats(data)
            }
            let sheikhFinal = fatwaSheikh
            if (fatwaNouveauSheikh) {
                await supabase.from('fatwas_sheikhs').insert({ nom: fatwaNouveauSheikh })
                sheikhFinal = fatwaNouveauSheikh
                const { data } = await supabase.from('fatwas_sheikhs').select('*').order('nom')
                if (data) setFatwaSheikhs(data)
            }
            const { error } = await supabase.from('fatwas').insert({ question: fatwaQuestion, sheikh: sheikhFinal, categorie: catFinale, url_audio: urlAudio, duree })
            if (error) throw error
            setMessage('Fatwa ajoutée avec succès !')
            setFatwaQuestion(''); setFatwaSheikh(''); setFatwaCat(''); setFatwaNouveauCat(''); setFatwaNouveauSheikh(''); setFatwaNouveauCouleur('#b7410e'); setFatwaFichier(null)
            const input = document.getElementById('fatwa-input') as HTMLInputElement
            if (input) input.value = ''
        } catch (err) { setMessage('Erreur upload'); console.error(err) }
        setUploading(false)
    }

    async function ajouterChapitre(e: React.FormEvent) {
        e.preventDefault()
        setUploading(true); setMessage('')
        try {
            let urlPdf = null
            if (chapFichierPdf) urlPdf = await uploadFichier(chapFichierPdf, 'chapitres')
            const { error } = await supabase.from('chapitres_livre').insert({
                livre_id: chapLivreId,
                titre: chapTitre,
                numero: parseInt(chapNumero),
                url_pdf: urlPdf
            })
            if (error) throw error
            setMessage('Chapitre ajouté avec succès !')
            setChapTitre(''); setChapNumero(''); setChapFichierPdf(null)
            const { data } = await supabase.from('chapitres_livre').select('id, titre, livre_id').order('numero')
            if (data) setChapitresList(data)
            const input = document.getElementById('chap-pdf') as HTMLInputElement
            if (input) input.value = ''
        } catch { setMessage('Erreur') }
        setUploading(false)
    }

    async function ajouterEpisodeChapitre(e: React.FormEvent) {
        e.preventDefault()
        if (epChapFichiers.length === 0) return setMessage('Selectionne au moins un fichier')
        setUploading(true); setMessage('')
        try {
            for (let i = 0; i < epChapFichiers.length; i++) {
                const f = epChapFichiers[i]
                const numero = parseInt(epChapNumero) + i
                const urlAudio = await uploadFichier(f, 'episodes_chapitre')
                const duree = epChapFichiers.length > 1 ? await getDuree(f) : epChapDuree
                const titreEp = epChapFichiers.length > 1 ? (epChapTitre ? epChapTitre + ' — ' + numero : f.name.replace(/\.[^/.]+$/, '')) : epChapTitre
                const { error } = await supabase.from('episodes_chapitre').insert({
                    chapitre_id: epChapId,
                    titre: titreEp,
                    numero,
                    duree,
                    url_audio: urlAudio,
                    description: epChapDescription || null
                })
                if (error) throw error
                setMessage('Upload ' + (i + 1) + '/' + epChapFichiers.length + '...')
            }
            setMessage('Episodes ajoutés !')
            setEpChapTitre(''); setEpChapNumero(''); setEpChapDuree(''); setEpChapDescription(''); setEpChapFichiers([])
            const input = document.getElementById('ep-chap-input') as HTMLInputElement
            if (input) input.value = ''
        } catch { setMessage('Erreur upload') }
        setUploading(false)
    }

    async function remplacerPdfLivre(e: React.FormEvent) {
        e.preventDefault()
        if (!modifLivrePdf) return setMessage('Selectionne un fichier PDF')
        setUploading(true); setMessage('')
        try {
            const urlPdf = await uploadFichier(modifLivrePdf, 'livres')
            const { error } = await supabase.from('livres').update({ url_pdf: urlPdf }).eq('id', modifLivreId)
            if (error) throw error
            setMessage('PDF mis à jour avec succès !')
            setModifLivreId(''); setModifLivrePdf(null)
            const input = document.getElementById('modif-pdf') as HTMLInputElement
            if (input) input.value = ''
        } catch { setMessage('Erreur') }
        setUploading(false)
    }

    async function remplacerLivreCours(e: React.FormEvent) {
        e.preventDefault()
        setMessage('')
        const { error } = await supabase.from('cours').update({ livre_id: modifCoursLivreId || null }).eq('id', modifCoursId)
        if (error) { setMessage('Erreur : ' + error.message) } else {
            setMessage('Livre du cours mis à jour !')
            setModifCoursId(''); setModifCoursLivreId('')
        }
    }

    async function ajouterAudioLivre(e: React.FormEvent) {
        e.preventDefault()
        if (!modifLivreAudioFichier) return setMessage('Selectionne un fichier audio')
        setUploading(true); setMessage('')
        try {
            const urlAudio = await uploadFichier(modifLivreAudioFichier, 'livres_audio')
            const { error } = await supabase.from('livres').update({ url_audio: urlAudio }).eq('id', modifLivreAudioId)
            if (error) throw error
            setMessage('Audio du livre ajouté avec succès !')
            setModifLivreAudioId(''); setModifLivreAudioFichier(null)
            const input = document.getElementById('modif-audio-livre') as HTMLInputElement
            if (input) input.value = ''
        } catch { setMessage('Erreur') }
        setUploading(false)
    }

    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '14px' }
    const labelStyle = { fontSize: '13px', fontWeight: 600 as const, color: '#444', display: 'block' as const, marginBottom: '5px' }
    const onglets = [
        { id: 'livre', label: 'Livre' },
        { id: 'cours', label: 'Cours' },
        { id: 'episode', label: 'Episode' },
        { id: 'ebook', label: 'Ebook' },
        { id: 'khoutbah', label: 'Khoutbah' },
        { id: 'conference', label: 'Conference' },
        { id: 'fatwa', label: 'Fatwa' },
        { id: 'chapitre', label: 'Chapitre' },
        { id: 'episode_chapitre', label: 'Ep. Chapitre' },
        { id: 'modifier', label: 'Modifier' },
    ]

    return (
        <main style={{ minHeight: '100vh', background: '#f8f6f1', padding: '40px 24px' }}>
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>Administration</h1>
                    <p style={{ fontSize: '14px', color: '#888' }}>Jàng sa Diné — Gestion du contenu</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
                    {onglets.map(o => (
                        <button key={o.id} onClick={() => { setOnglet(o.id as typeof onglet); setMessage('') }} style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: 'none', background: onglet === o.id ? '#28558b' : 'white', color: onglet === o.id ? 'white' : '#666', fontFamily: 'inherit' }}>
                            {o.label}
                        </button>
                    ))}
                </div>
                {message && (
                    <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', background: message.includes('Erreur') ? '#fff0f0' : '#f0fff4', color: message.includes('Erreur') ? '#c00' : '#1a7a3a', fontSize: '14px', fontWeight: 500 }}>
                        {message}
                    </div>
                )}

                {onglet === 'livre' && (
                    <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e8e4da' }}>
                        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>Nouveau livre</h2>
                        <p style={{ fontSize: '13px', color: '#999', marginBottom: '22px' }}>Crée le livre, puis lie-lui un cours</p>
                        <form onSubmit={ajouterLivre}>
                            <label style={labelStyle}>Titre du livre</label>
                            <input style={inputStyle} value={lTitre} onChange={e => setLTitre(e.target.value)} placeholder="ex: Les trois principes fondamentaux" required />
                            <label style={labelStyle}>Sheikh (optionnel)</label>
                            <input style={inputStyle} value={lSheikh} onChange={e => setLSheikh(e.target.value)} placeholder="ex: Imam Hassan Sarr" />
                            <label style={labelStyle}>Titre en arabe (optionnel)</label>
                            <input style={inputStyle} value={lTitreArabe} onChange={e => setLTitreArabe(e.target.value)} placeholder="ex: الأصول الثلاثة" dir="rtl" />
                            <label style={labelStyle}>Categorie</label>
                            <select style={{ ...inputStyle, background: 'white' }} value={lCategorie} onChange={e => setLCategorie(e.target.value)} required>
                                <option value="">Selectionner</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nom}</option>)}
                            </select>
                            <label style={labelStyle}>Type de livre</label>
                            <select style={{ ...inputStyle, background: 'white' }} value={lType} onChange={e => setLType(e.target.value)}>
                                <option value="standard">Standard (versions par sheikh)</option>
                                <option value="chapitres">Chapitres (Sahih al-Bukhary...)</option>
                            </select>
                            <label style={labelStyle}>PDF du livre (optionnel)</label>
                            <input id="livre-pdf" style={{ ...inputStyle, padding: '8px' }} type="file" accept=".pdf" onChange={e => setLFichier(e.target.files?.[0] || null)} />
                            <label style={labelStyle}>Audio du livre (optionnel)</label>
                            <input id="livre-audio" style={{ ...inputStyle, padding: '8px' }} type="file" accept="audio/*" onChange={e => setLAudio(e.target.files?.[0] || null)} />
                            <button type="submit" disabled={uploading} style={{ width: '100%', padding: '12px', background: uploading ? '#aaa' : '#28558b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                {uploading ? 'Upload en cours...' : 'Ajouter le livre'}
                            </button>
                        </form>
                    </div>
                )}

                {onglet === 'cours' && (
                    <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e8e4da' }}>
                        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>Nouveau cours</h2>
                        <p style={{ fontSize: '13px', color: '#999', marginBottom: '22px' }}>Un cours = un sheikh qui traite un livre</p>
                        <form onSubmit={ajouterCours}>
                            <label style={labelStyle}>Livre associé</label>
                            <select style={{ ...inputStyle, background: 'white' }} value={coursLivreId} onChange={e => setCoursLivreId(e.target.value)} required>
                                <option value="">Selectionner un livre</option>
                                {livresList.map(l => <option key={l.id} value={l.id}>{l.titre}</option>)}
                            </select>
                            <label style={labelStyle}>Titre du cours (optionnel)</label>
                            <input style={inputStyle} value={titre} onChange={e => setTitre(e.target.value)} placeholder="Laisser vide = titre du livre" />
                            <label style={labelStyle}>Sheikh</label>
                            <input style={inputStyle} value={sheikh} onChange={e => setSheikh(e.target.value)} placeholder="ex: Dr. Sidy Yahya Ndiaye" required />
                            <label style={labelStyle}>Categorie</label>
                            <select style={{ ...inputStyle, background: 'white' }} value={categorieId} onChange={e => setCategorieId(e.target.value)} required>
                                <option value="">Selectionner</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nom}</option>)}
                            </select>
                            <label style={labelStyle}>Description (optionnel)</label>
                            <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' } as any} value={description} onChange={e => setDescription(e.target.value)} placeholder="ex: Ce cours traite des fondements de la croyance..." />
                            <label style={labelStyle}>Type de cours</label>
                            <select style={{ ...inputStyle, background: 'white' }} value={coursSerieUnique ? 'true' : 'false'} onChange={e => setCoursSerieUnique(e.target.value === 'true')}>                                <option value="false">Standard (plusieurs versions possibles)</option>
                                <option value="true">Série unique (une seule version)</option>
                            </select>
                            <button type="submit" style={{ width: '100%', padding: '12px', background: '#28558b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                Ajouter le cours
                            </button>
                        </form>
                    </div>
                )}

                {onglet === 'episode' && (
                    <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e8e4da' }}>
                        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>Nouvel episode</h2>
                        <p style={{ fontSize: '13px', color: '#999', marginBottom: '22px' }}>La durée est détectée automatiquement. Upload multiple possible.</p>
                        <form onSubmit={ajouterEpisode}>
                            <label style={labelStyle}>Cours</label>
                            <select style={{ ...inputStyle, background: 'white' }} value={coursId} onChange={e => setCoursId(e.target.value)} required>
                                <option value="">Selectionner un cours</option>
                                {coursList.map(c => <option key={c.id} value={c.id}>{c.titre} — {c.sheikh}</option>)}
                            </select>
                            <label style={labelStyle}>Titre de base</label>
                            <input style={inputStyle} value={epTitre} onChange={e => setEpTitre(e.target.value)} placeholder="ex: Les trois principes (numerote auto si multiple)" />
                            <label style={labelStyle}>Description (optionnel)</label>
                            <EditeurTexte value={epDescription} onChange={setEpDescription} placeholder="ex: Ce cours traite du Hadith Sahih, Hasan et Daif..." />
                            <label style={labelStyle}>Numero de depart</label>
                            <input style={inputStyle} type="number" value={epNumero} onChange={e => setEpNumero(e.target.value)} placeholder="1" required />
                            {fichiers.length === 1 && (
                                <>
                                    <label style={labelStyle}>Duree (detectee automatiquement)</label>
                                    <input style={inputStyle} value={epDuree} onChange={e => setEpDuree(e.target.value)} placeholder="Detection auto..." />
                                </>
                            )}
                            <label style={labelStyle}>Fichiers audio (selection multiple possible)</label>
                            <input id="fichier-input" style={{ ...inputStyle, padding: '8px' }} type="file" accept="audio/*" multiple onChange={async e => {
                                const files = Array.from(e.target.files || [])
                                setFichiers(files)
                                if (files.length === 1) {
                                    const duree = await getDuree(files[0])
                                    setEpDuree(duree)
                                }
                            }} required />
                            {fichiers.length > 1 && (
                                <div style={{ background: '#f0f8ff', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#28558b' }}>
                                    {fichiers.length} fichiers sélectionnés — durée détectée automatiquement pour chacun
                                </div>
                            )}

                            {/* Section markers — uniquement pour épisode unique */}
                            {fichiers.length <= 1 && (
                                <div style={{ marginBottom: '14px' }}>
                                    <div style={{ height: '1px', background: '#eee', margin: '8px 0 20px' }} />
                                    <label style={{ ...labelStyle, marginBottom: '12px' }}>Chapitres / Markers (optionnel)</label>

                                    {/* Liste des markers ajoutés */}
                                    {markers.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                                            {markers.map((m, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#f8f6f1', borderRadius: '8px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#28558b', flexShrink: 0 }}>{m.temps}</span>
                                                    <span style={{ fontSize: '13px', color: '#444', flex: 1 }}>{m.titre}</span>
                                                    <button type="button" onClick={() => setMarkers(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#e00', cursor: 'pointer', fontSize: '18px', padding: '0', flexShrink: 0 }}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Ajouter un marker */}
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                        <input
                                            style={{ ...inputStyle, marginBottom: 0, width: '110px', flexShrink: 0 }}
                                            value={markerTemps}
                                            onChange={e => setMarkerTemps(e.target.value)}
                                            placeholder="00:05:31"
                                        />
                                        <input
                                            style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                                            value={markerTitre}
                                            onChange={e => setMarkerTitre(e.target.value)}
                                            placeholder="Titre du chapitre..."
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); ajouterMarker() } }}
                                        />
                                        <button type="button" onClick={ajouterMarker} style={{ padding: '10px 14px', background: '#e8f0f8', color: '#28558b', border: 'none', borderRadius: '8px', fontSize: '20px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>+</button>
                                    </div>
                                    <p style={{ fontSize: '11px', color: '#bbb', marginTop: '6px' }}>Format : MM:SS ou HH:MM:SS — Appuie sur Entrée ou + pour ajouter</p>
                                </div>
                            )}

                            <button type="submit" disabled={uploading} style={{ width: '100%', padding: '12px', background: uploading ? '#aaa' : '#28558b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                {uploading ? message || 'Upload en cours...' : fichiers.length > 1 ? 'Uploader ' + fichiers.length + ' episodes' : 'Ajouter'}
                            </button>
                        </form>
                    </div>
                )}

                {onglet === 'ebook' && (
                    <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e8e4da' }}>
                        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '22px' }}>Nouvel ebook</h2>
                        <form onSubmit={ajouterEbook}>
                            <label style={labelStyle}>Titre</label>
                            <input style={inputStyle} value={ebTitre} onChange={e => setEbTitre(e.target.value)} placeholder="ex: Les regles du jeune" required />
                            <label style={labelStyle}>Description (optionnel)</label>
                            <input style={inputStyle} value={ebDescription} onChange={e => setEbDescription(e.target.value)} placeholder="Courte description" />
                            <label style={labelStyle}>Catégorie</label>
                            {ebookCats.length > 0 && (
                                <select style={{ ...inputStyle, background: 'white' }} value={ebookCat} onChange={e => setEbookCat(e.target.value)}>
                                    <option value="">Choisir une catégorie existante...</option>
                                    {ebookCats.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
                                </select>
                            )}
                            <input style={inputStyle} value={ebookNouveauCat} onChange={e => setEbookNouveauCat(e.target.value)} placeholder="Ou créer une nouvelle catégorie..." />
                            {ebookNouveauCat && (
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={labelStyle}>Couleur de la catégorie</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {['#b7410e', '#B78F7A', '#A8C3BC', '#d3d3ff', '#bbb791', '#e491a6', '#096c6c', '#ffd3ac', '#00674f', '#E5AA70', '#e35336', '#c68346', '#CCFFCC', '#EED9C4', '#FFA800', '#7B9EA6', '#C4A882', '#8FAF8F', '#D4A5C9', '#A67B5B', '#6B8E9F', '#C9956C', '#7FA99B', '#D4B896', '#9B7FA6', '#5C8374', '#C17B5C', '#8BA5A5', '#D4C5A9', '#A89070']
                                            .filter(c => !ebookCats.map(cat => cat.couleur).includes(c))
                                            .map(c => (
                                                <div key={c} onClick={() => setEbookNouveauCouleur(c)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, cursor: 'pointer', border: ebookNouveauCouleur === c ? '3px solid #1a1a2e' : '3px solid transparent', transition: 'all 0.15s' }} />
                                            ))}
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#aaa', marginTop: '6px' }}>Couleur sélectionnée : <span style={{ fontWeight: 600, color: ebookNouveauCouleur }}>{ebookNouveauCouleur}</span></p>
                                </div>
                            )}
                            <label style={labelStyle}>Nombre de pages (optionnel)</label>
                            <input style={inputStyle} type="number" value={ebPages} onChange={e => setEbPages(e.target.value)} placeholder="ex: 24" />
                            <label style={labelStyle}>Fichier PDF</label>
                            <input id="pdf-input" style={{ ...inputStyle, padding: '8px' }} type="file" accept=".pdf" onChange={e => setEbFichier(e.target.files?.[0] || null)} required />
                            <label style={labelStyle}>Image de couverture</label>
                            <input id="cover-input" style={{ ...inputStyle, padding: '8px' }} type="file" accept="image/*" onChange={e => setEbCover(e.target.files?.[0] || null)} required />
                            <button type="submit" disabled={uploading} style={{ width: '100%', padding: '12px', background: uploading ? '#aaa' : '#28558b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                {uploading ? 'Upload en cours...' : 'Ajouter'}
                            </button>
                        </form>
                    </div>
                )}

                {onglet === 'khoutbah' && (
                    <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e8e4da' }}>
                        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>Nouvelle khoutbah</h2>
                        <p style={{ fontSize: '13px', color: '#999', marginBottom: '22px' }}>La durée est détectée automatiquement si non renseignée.</p>
                        <form onSubmit={ajouterKhoutbah}>
                            <label style={labelStyle}>Titre</label>
                            <input style={inputStyle} value={khTitre} onChange={e => setKhTitre(e.target.value)} placeholder="ex: La crainte d'Allah" required />
                            <label style={labelStyle}>Sheikh</label>
                            <input style={inputStyle} value={khSheikh} onChange={e => setKhSheikh(e.target.value)} placeholder="ex: Dr. Sidy Yahya Ndiaye" required />
                            <label style={labelStyle}>Duree (optionnel — detectee automatiquement)</label>
                            <input style={inputStyle} value={khDuree} onChange={e => setKhDuree(e.target.value)} placeholder="ex: 32:10" />
                            <label style={labelStyle}>Nom de la serie (optionnel)</label>
                            <input style={inputStyle} value={khSerie} onChange={e => setKhSerie(e.target.value)} placeholder="ex: Les piliers de la foi" />
                            <label style={labelStyle}>Numero dans la serie (optionnel)</label>
                            <input style={inputStyle} type="number" value={khNumeroSerie} onChange={e => setKhNumeroSerie(e.target.value)} placeholder="ex: 1" />
                            <label style={labelStyle}>Fichier audio</label>
                            <input id="kh-input" style={{ ...inputStyle, padding: '8px' }} type="file" accept="audio/*" onChange={e => setKhFichier(e.target.files?.[0] || null)} required />
                            <button type="submit" disabled={uploading} style={{ width: '100%', padding: '12px', background: uploading ? '#aaa' : '#28558b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                {uploading ? 'Upload en cours...' : 'Ajouter'}
                            </button>
                        </form>
                    </div>
                )}

                {onglet === 'conference' && (
                    <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e8e4da' }}>
                        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>Nouvelle conference</h2>
                        <p style={{ fontSize: '13px', color: '#999', marginBottom: '22px' }}>La durée est détectée automatiquement si non renseignée.</p>
                        <form onSubmit={ajouterConference}>
                            <label style={labelStyle}>Titre</label>
                            <input style={inputStyle} value={confTitre} onChange={e => setConfTitre(e.target.value)} placeholder="ex: Les piliers de l'Islam" required />
                            <label style={labelStyle}>Sheikh</label>
                            <input style={inputStyle} value={confSheikh} onChange={e => setConfSheikh(e.target.value)} placeholder="ex: Dr. Ahmad Khalil Lo" required />
                            <label style={labelStyle}>Duree (optionnel — detectee automatiquement)</label>
                            <input style={inputStyle} value={confDuree} onChange={e => setConfDuree(e.target.value)} placeholder="ex: 1:12:30" />
                            <label style={labelStyle}>Fichier audio</label>
                            <input id="conf-input" style={{ ...inputStyle, padding: '8px' }} type="file" accept="audio/*" onChange={e => setConfFichier(e.target.files?.[0] || null)} required />
                            <button type="submit" disabled={uploading} style={{ width: '100%', padding: '12px', background: uploading ? '#aaa' : '#28558b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                {uploading ? 'Upload en cours...' : 'Ajouter'}
                            </button>
                        </form>
                    </div>
                )}

                {onglet === 'fatwa' && (
                    <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e8e4da' }}>
                        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>Nouvelle Fatwa</h2>
                        <p style={{ fontSize: '13px', color: '#999', marginBottom: '22px' }}>La durée est détectée automatiquement.</p>
                        <form onSubmit={ajouterFatwa}>
                            <label style={labelStyle}>Question</label>
                            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={fatwaQuestion} onChange={e => setFatwaQuestion(e.target.value)} placeholder="ex: Comment réparer sa prière si l'imam nous a devancé ?" required />
                            <label style={labelStyle}>Sheikh</label>
                            {fatwaSheikhs.length > 0 && (
                                <select style={{ ...inputStyle, background: 'white' }} value={fatwaSheikh} onChange={e => setFatwaSheikh(e.target.value)}>
                                    <option value="">Choisir un sheikh existant...</option>
                                    {fatwaSheikhs.map(s => <option key={s.id} value={s.nom}>{s.nom}</option>)}
                                </select>
                            )}
                            <input style={inputStyle} value={fatwaNouveauSheikh} onChange={e => setFatwaNouveauSheikh(e.target.value)} placeholder="Ou ajouter un nouveau sheikh..." />
                            <label style={labelStyle}>Catégorie</label>
                            {fatwaCats.length > 0 && (
                                <select style={{ ...inputStyle, background: 'white' }} value={fatwaCat} onChange={e => setFatwaCat(e.target.value)}>
                                    <option value="">Choisir une catégorie existante...</option>
                                    {fatwaCats.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
                                </select>
                            )}
                            <input style={inputStyle} value={fatwaNouveauCat} onChange={e => setFatwaNouveauCat(e.target.value)} placeholder="Ou créer une nouvelle catégorie..." />
                            {fatwaNouveauCat && (
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={labelStyle}>Couleur de la catégorie</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {['#b7410e', '#B78F7A', '#A8C3BC', '#d3d3ff', '#bbb791', '#e491a6', '#096c6c', '#ffd3ac', '#00674f', '#E5AA70', '#e35336', '#c68346', '#CCFFCC', '#EED9C4', '#FFA800', '#7B9EA6', '#C4A882', '#8FAF8F', '#D4A5C9', '#A67B5B', '#6B8E9F', '#C9956C', '#7FA99B', '#D4B896', '#9B7FA6', '#5C8374', '#C17B5C', '#8BA5A5', '#D4C5A9', '#A89070']
                                            .filter(c => !fatwaCats.map(cat => (cat as any).couleur).includes(c))
                                            .map(c => (
                                                <div key={c} onClick={() => setFatwaNouveauCouleur(c)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, cursor: 'pointer', border: fatwaNouveauCouleur === c ? '3px solid #1a1a2e' : '3px solid transparent', transition: 'all 0.15s' }} />
                                            ))}
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#aaa', marginTop: '6px' }}>Couleur sélectionnée : <span style={{ fontWeight: 600, color: fatwaNouveauCouleur }}>{fatwaNouveauCouleur}</span></p>
                                </div>
                            )}
                            <label style={labelStyle}>Fichier audio</label>
                            <input id="fatwa-input" style={{ ...inputStyle, padding: '8px' }} type="file" accept="audio/*" onChange={e => setFatwaFichier(e.target.files?.[0] || null)} required />
                            <button type="submit" disabled={uploading} style={{ width: '100%', padding: '12px', background: uploading ? '#aaa' : '#28558b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                {uploading ? 'Upload en cours...' : 'Ajouter la fatwa'}
                            </button>
                        </form>
                    </div>
                )}

                {onglet === 'chapitre' && (
                    <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e8e4da' }}>
                        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>Nouveau chapitre</h2>
                        <p style={{ fontSize: '13px', color: '#999', marginBottom: '22px' }}>Ajoute un chapitre à un livre de type "Chapitres"</p>
                        <form onSubmit={ajouterChapitre}>
                            <label style={labelStyle}>Livre</label>
                            <select style={{ ...inputStyle, background: 'white' }} value={chapLivreId} onChange={e => setChapLivreId(e.target.value)} required>
                                <option value="">Sélectionner un livre...</option>
                                {livresList.map(l => <option key={l.id} value={l.id}>{l.titre}</option>)}
                            </select>
                            <label style={labelStyle}>Numéro du chapitre</label>
                            <input style={inputStyle} type="number" value={chapNumero} onChange={e => setChapNumero(e.target.value)} placeholder="1" required />
                            <label style={labelStyle}>Titre du chapitre</label>
                            <input style={inputStyle} value={chapTitre} onChange={e => setChapTitre(e.target.value)} placeholder="ex: Le livre de la purification" required />
                            <label style={labelStyle}>PDF du chapitre (optionnel)</label>
                            <input id="chap-pdf" style={{ ...inputStyle, padding: '8px' }} type="file" accept=".pdf" onChange={e => setChapFichierPdf(e.target.files?.[0] || null)} />
                            <button type="submit" disabled={uploading} style={{ width: '100%', padding: '12px', background: uploading ? '#aaa' : '#28558b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                {uploading ? 'En cours...' : 'Ajouter le chapitre'}
                            </button>
                        </form>
                    </div>
                )}

                {onglet === 'episode_chapitre' && (
                    <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e8e4da' }}>
                        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>Nouvel épisode de chapitre</h2>
                        <p style={{ fontSize: '13px', color: '#999', marginBottom: '22px' }}>La durée est détectée automatiquement. Upload multiple possible.</p>
                        <form onSubmit={ajouterEpisodeChapitre}>
                            <label style={labelStyle}>Chapitre</label>
                            <select style={{ ...inputStyle, background: 'white' }} value={epChapId} onChange={e => setEpChapId(e.target.value)} required>
                                <option value="">Sélectionner un chapitre...</option>
                                {chapitresList.map(c => <option key={c.id} value={c.id}>{c.titre}</option>)}
                            </select>
                            <label style={labelStyle}>Titre de base</label>
                            <input style={inputStyle} value={epChapTitre} onChange={e => setEpChapTitre(e.target.value)} placeholder="ex: Hadith 1" />
                            <label style={labelStyle}>Numéro de départ</label>
                            <input style={inputStyle} type="number" value={epChapNumero} onChange={e => setEpChapNumero(e.target.value)} placeholder="1" required />
                            <label style={labelStyle}>Description (optionnel)</label>
                            <EditeurTexte value={epChapDescription} onChange={setEpChapDescription} />
                            {epChapFichiers.length === 1 && (
                                <>
                                    <label style={labelStyle}>Durée (détectée automatiquement)</label>
                                    <input style={inputStyle} value={epChapDuree} onChange={e => setEpChapDuree(e.target.value)} placeholder="Détection auto..." />
                                </>
                            )}
                            <label style={labelStyle}>Fichiers audio</label>
                            <input id="ep-chap-input" style={{ ...inputStyle, padding: '8px' }} type="file" accept="audio/*" multiple onChange={async e => {
                                const files = Array.from(e.target.files || [])
                                setEpChapFichiers(files)
                                if (files.length === 1) {
                                    const duree = await getDuree(files[0])
                                    setEpChapDuree(duree)
                                }
                            }} required />
                            {epChapFichiers.length > 1 && (
                                <div style={{ background: '#f0f8ff', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#28558b' }}>
                                    {epChapFichiers.length} fichiers sélectionnés
                                </div>
                            )}
                            <button type="submit" disabled={uploading} style={{ width: '100%', padding: '12px', background: uploading ? '#aaa' : '#28558b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                {uploading ? message || 'Upload en cours...' : epChapFichiers.length > 1 ? 'Uploader ' + epChapFichiers.length + ' épisodes' : 'Ajouter'}
                            </button>
                        </form>
                    </div>
                )}

                {onglet === 'modifier' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Remplacer le PDF d'un livre */}
                        <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e8e4da' }}>
                            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>Remplacer le PDF d'un livre</h2>
                            <p style={{ fontSize: '13px', color: '#999', marginBottom: '22px' }}>Remplace le PDF existant par une nouvelle version ou ajoute-en un si absent.</p>
                            <form onSubmit={remplacerPdfLivre}>
                                <label style={labelStyle}>Livre</label>
                                <select style={{ ...inputStyle, background: 'white' }} value={modifLivreId} onChange={e => setModifLivreId(e.target.value)} required>
                                    <option value="">Sélectionner un livre...</option>
                                    {livresList.map(l => <option key={l.id} value={l.id}>{l.titre}</option>)}
                                </select>
                                <label style={labelStyle}>Nouveau PDF</label>
                                <input id="modif-pdf" style={{ ...inputStyle, padding: '8px' }} type="file" accept=".pdf" onChange={e => setModifLivrePdf(e.target.files?.[0] || null)} required />
                                <button type="submit" disabled={uploading} style={{ width: '100%', padding: '12px', background: uploading ? '#aaa' : '#28558b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                    {uploading ? 'Upload en cours...' : 'Mettre à jour le PDF'}
                                </button>
                            </form>
                        </div>

                        {/* Changer le livre associé à un cours */}
                        <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e8e4da' }}>
                            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>Changer le livre d'un cours</h2>
                            <p style={{ fontSize: '13px', color: '#999', marginBottom: '22px' }}>Associe un cours à un autre livre ou retire le livre associé.</p>
                            <form onSubmit={remplacerLivreCours}>
                                <label style={labelStyle}>Cours</label>
                                <select style={{ ...inputStyle, background: 'white' }} value={modifCoursId} onChange={e => setModifCoursId(e.target.value)} required>
                                    <option value="">Sélectionner un cours...</option>
                                    {coursList.map(c => <option key={c.id} value={c.id}>{c.titre} — {c.sheikh}</option>)}
                                </select>
                                <label style={labelStyle}>Nouveau livre associé</label>
                                <select style={{ ...inputStyle, background: 'white' }} value={modifCoursLivreId} onChange={e => setModifCoursLivreId(e.target.value)}>
                                    <option value="">Aucun livre</option>
                                    {livresList.map(l => <option key={l.id} value={l.id}>{l.titre}</option>)}
                                </select>
                                <button type="submit" style={{ width: '100%', padding: '12px', background: '#28558b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    Mettre à jour
                                </button>
                            </form>
                        </div>

                        {/* Ajouter un audio à un livre */}
                        <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e8e4da' }}>
                            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>Ajouter un audio à un livre</h2>
                            <p style={{ fontSize: '13px', color: '#999', marginBottom: '22px' }}>Upload un audiobook pour un livre existant.</p>
                            <form onSubmit={ajouterAudioLivre}>
                                <label style={labelStyle}>Livre</label>
                                <select style={{ ...inputStyle, background: 'white' }} value={modifLivreAudioId} onChange={e => setModifLivreAudioId(e.target.value)} required>
                                    <option value="">Sélectionner un livre...</option>
                                    {livresList.map(l => <option key={l.id} value={l.id}>{l.titre}</option>)}
                                </select>
                                <label style={labelStyle}>Fichier audio</label>
                                <input id="modif-audio-livre" style={{ ...inputStyle, padding: '8px' }} type="file" accept="audio/*" onChange={e => setModifLivreAudioFichier(e.target.files?.[0] || null)} required />
                                <button type="submit" disabled={uploading} style={{ width: '100%', padding: '12px', background: uploading ? '#aaa' : '#28558b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                    {uploading ? 'Upload en cours...' : 'Ajouter l\'audio'}
                                </button>
                            </form>
                        </div>

                    </div>
                )}

            </div>
        </main>
    )
}