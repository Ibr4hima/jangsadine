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

export async function POST(req: NextRequest) {
    try {
        const { nom, type } = await req.json()

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: nom,
            ContentType: type,
        })

        const url = await getSignedUrl(s3, command, { expiresIn: 3600 })

        return NextResponse.json({ url, key: nom })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Erreur upload' }, { status: 500 })
    }
}