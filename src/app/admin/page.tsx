'use client'
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
type Categorie = { id: string; nom: string; slug: string }
type CoursItem = { id: string; titre: string; sheikh: string }
export default function Admin() {
    const [categories, setCategories] = useState<Categorie[]>([])
    const [onglet, setOnglet] = useState<'livre' | 'cours' | 'episode' | 'ebook' | 'khoutbah' | 'conference' | 'fatwa'>('livre')
    const [livresList, setLivresList] = useState<{ id: string; titre: string }[]>([])
    const [coursList, setCoursList] = useState<CoursItem[]>([])
    const [livreId, setLivreId] = useState('')
    const [lTitre, setLTitre] = useState('')
    const [lTitreArabe, setLTitreArabe] = useState('')
    const [lCategorie, setLCategorie] = useState('')
    const [lFichier, setLFichier] = useState<File | null>(null)
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
    const [ebTitre, setEbTitre] = useState('')
    const [ebDescription, setEbDescription] = useState('')
    const [ebCategorie, setEbCategorie] = useState('')
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
    const [fatwaCat, setFatwaCat] = useState('')
    const [fatwaNouveauCat, setFatwaNouveauCat] = useState('')
    const [fatwaNouveauSheikh, setFatwaNouveauSheikh] = useState('')
    const [fatwaNouveauCouleur, setFatwaNouveauCouleur] = useState('#b7410e')
    const [fatwaFichier, setFatwaFichier] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState('')
    useEffect(() => {
        async function charger() {
            const { data: cats } = await supabase.from('categories').select('*').order('ordre')
            const { data: cours } = await supabase.from('cours').select('id,titre,sheikh').order('titre')
            const { data: livres } = await supabase.from('livres').select('id,titre').order('titre')
            const { data: fCats } = await supabase.from('fatwas_categories').select('*').order('nom')
            const { data: fSheikhs } = await supabase.from('fatwas_sheikhs').select('*').order('nom')
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
            const audio = new Audio(URL.createObjectURL(file))
            audio.addEventListener('loadedmetadata', () => {
                const h = Math.floor(audio.duration / 3600)
                const m = Math.floor((audio.duration % 3600) / 60)
                const s = Math.floor(audio.duration % 60)
                resolve(h > 0 ? h + ':' + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0') : m + ':' + s.toString().padStart(2, '0'))
            })
            audio.addEventListener('error', () => resolve(''))
        })
    }
    async function ajouterLivre(e: React.FormEvent) {
        e.preventDefault(); setMessage(''); setUploading(true)
        try {
            let urlPdf = null
            if (lFichier) urlPdf = await uploadFichier(lFichier, 'livres')
            const { error } = await supabase.from('livres').insert({ titre: lTitre, categorie_id: lCategorie, url_pdf: urlPdf, titre_arabe: lTitreArabe || null })
            if (error) throw error
            setMessage('Livre ajouté avec succès !')
            setLTitre(''); setLCategorie(''); setLTitreArabe(''); setLFichier(null)
            const input = document.getElementById('livre-pdf') as HTMLInputElement
            if (input) input.value = ''
            const { data } = await supabase.from('livres').select('id,titre').order('titre')
            if (data) setLivresList(data)
        } catch (err) { setMessage('Erreur'); console.error(err) }
        setUploading(false)
    }
    async function ajouterCours(e: React.FormEvent) {
        e.preventDefault(); setMessage('')
        const { error } = await supabase.from('cours').insert({ titre: titre || undefined, sheikh, categorie_id: categorieId, nb_episodes: 0, description: description || null, livre_id: coursLivreId || null })
        if (error) { setMessage('Erreur : ' + error.message) } else {
            setMessage('Cours ajouté avec succès !')
            setTitre(''); setSheikh(''); setCategorieId(''); setDescription(''); setCoursLivreId('')
            const { data } = await supabase.from('cours').select('id,titre,sheikh').order('titre')
            if (data) setCoursList(data)
        }
    }
    async function ajouterEpisode(e: React.FormEvent) {
        e.preventDefault()
        if (fichiers.length === 0) return setMessage('Selectionne au moins un fichier audio')
        setUploading(true); setMessage('')
        try {
            for (let i = 0; i < fichiers.length; i++) {
                const f = fichiers[i]
                const numero = parseInt(epNumero) + i
                const nomFichier = `${coursId}/${numero}-${f.name.replace(/\s/g, '-')}`
                const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: nomFichier, type: f.type }) })
                const { url } = await res.json()
                await fetch(url, { method: 'PUT', body: f, headers: { 'Content-Type': f.type } })
                const urlAudio = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${nomFichier}`
                const duree = fichiers.length > 1 ? await getDuree(f) : epDuree
                const titreEp = fichiers.length > 1 ? (epTitre ? epTitre + ' — ' + numero : f.name.replace(/\.[^/.]+$/, '')) : epTitre
                const { error } = await supabase.from('episodes').insert({ cours_id: coursId, titre: titreEp, numero, duree, url_audio: urlAudio })
                if (error) throw error
                setMessage('Upload ' + (i + 1) + '/' + fichiers.length + '...')
            }
            const { data: eps } = await supabase.from('episodes').select('id').eq('cours_id', coursId)
            await supabase.from('cours').update({ nb_episodes: eps?.length || 0 }).eq('id', coursId)
            setMessage('Episodes ajoutés avec succès !')
            setEpTitre(''); setEpNumero(''); setEpDuree(''); setFichiers([])
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
            const { error } = await supabase.from('ebooks').insert({ titre: ebTitre, description: ebDescription, categorie: ebCategorie, url_pdf: urlPdf, nb_pages: ebPages ? parseInt(ebPages) : null, image_couverture: urlCover })
            if (error) throw error
            setMessage('Ebook ajouté avec succès !')
            setEbTitre(''); setEbDescription(''); setEbCategorie(''); setEbPages(''); setEbFichier(null); setEbCover(null)
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

            // Créer catégorie si nouvelle
            let catFinale = fatwaCat
            if (fatwaNouveauCat) {
                await supabase.from('fatwas_categories').insert({ nom: fatwaNouveauCat, couleur: fatwaNouveauCouleur })
                catFinale = fatwaNouveauCat
                const { data } = await supabase.from('fatwas_categories').select('*').order('nom')
                if (data) setFatwaCats(data)
            }

            // Créer sheikh si nouveau
            let sheikhFinal = fatwaSheikh
            if (fatwaNouveauSheikh) {
                await supabase.from('fatwas_sheikhs').insert({ nom: fatwaNouveauSheikh })
                sheikhFinal = fatwaNouveauSheikh
                const { data } = await supabase.from('fatwas_sheikhs').select('*').order('nom')
                if (data) setFatwaSheikhs(data)
            }

            const { error } = await supabase.from('fatwas').insert({
                question: fatwaQuestion,
                sheikh: sheikhFinal,
                categorie: catFinale,
                url_audio: urlAudio,
                duree
            })
            if (error) throw error
            setMessage('Fatwa ajoutée avec succès !')
            setFatwaQuestion(''); setFatwaSheikh(''); setFatwaCat(''); setFatwaNouveauCat(''); setFatwaNouveauSheikh(''); setFatwaNouveauCouleur('#b7410e'); setFatwaFichier(null)
            const input = document.getElementById('fatwa-input') as HTMLInputElement
            if (input) input.value = ''
        } catch (err) { setMessage('Erreur upload'); console.error(err) }
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
                            <label style={labelStyle}>Titre en arabe (optionnel)</label>
                            <input style={inputStyle} value={lTitreArabe} onChange={e => setLTitreArabe(e.target.value)} placeholder="ex: الأصول الثلاثة" dir="rtl" />
                            <label style={labelStyle}>Categorie</label>
                            <select style={{ ...inputStyle, background: 'white' }} value={lCategorie} onChange={e => setLCategorie(e.target.value)} required>
                                <option value="">Selectionner</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nom}</option>)}
                            </select>
                            <label style={labelStyle}>PDF du livre (optionnel)</label>
                            <input id="livre-pdf" style={{ ...inputStyle, padding: '8px' }} type="file" accept=".pdf" onChange={e => setLFichier(e.target.files?.[0] || null)} />
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
                            <label style={labelStyle}>Categorie</label>
                            <select style={{ ...inputStyle, background: 'white' }} value={ebCategorie} onChange={e => setEbCategorie(e.target.value)} required>
                                <option value="">Selectionner</option>
                                <option value="Aqeedah">Aqeedah</option>
                                <option value="Fiqh">Fiqh</option>
                            </select>
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
            </div>
        </main>
    )
}
