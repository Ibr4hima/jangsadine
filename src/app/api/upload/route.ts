import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'

const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
})

// Types autorisés uniquement
const TYPES_AUTORISES = [
    'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/ogg', 'audio/wav',
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp',
]

// Dossiers autorisés uniquement
const DOSSIERS_AUTORISES = [
    'episodes', 'khoutbahs', 'conferences', 'fatwas', 'livres',
    'ebooks', 'covers', 'chapitres', 'episodes_chapitre'
]

const MOT_DE_PASSE_ADMIN = process.env.ADMIN_SECRET

export async function POST(req: NextRequest) {
    try {
        // Vérification du mot de passe admin
        const authHeader = req.headers.get('x-admin-secret')
        if (!authHeader || authHeader !== MOT_DE_PASSE_ADMIN) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const { nom, type } = await req.json()

        // Validation du type
        if (!TYPES_AUTORISES.includes(type)) {
            return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 })
        }

        // Validation du dossier
        const dossier = nom.split('/')[0]
        if (!DOSSIERS_AUTORISES.includes(dossier)) {
            return NextResponse.json({ error: 'Dossier non autorisé' }, { status: 400 })
        }

        // Validation du nom (pas de path traversal)
        if (nom.includes('..') || nom.includes('//')) {
            return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 })
        }

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: nom,
            ContentType: type,
            ContentLengthRange: [1, 500 * 1024 * 1024], // Max 500MB
        } as any)

        const url = await getSignedUrl(s3, command, { expiresIn: 300 }) // 5 min au lieu de 1h

        return NextResponse.json({ url, key: nom })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Erreur upload' }, { status: 500 })
    }
}