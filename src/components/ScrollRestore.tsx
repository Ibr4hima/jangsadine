'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ScrollRestore() {
    const pathname = usePathname()

    useEffect(() => {
        // Restaurer la position sauvegardée
        const saved = sessionStorage.getItem('scroll:' + pathname)
        if (saved) {
            setTimeout(() => {
                window.scrollTo({ top: parseInt(saved), behavior: 'instant' })
            }, 100)
        }
    }, [pathname])

    useEffect(() => {
        // Sauvegarder la position avant de quitter
        function sauvegarder() {
            sessionStorage.setItem('scroll:' + pathname, String(window.scrollY))
        }
        window.addEventListener('beforeunload', sauvegarder)
        return () => {
            sauvegarder()
            window.removeEventListener('beforeunload', sauvegarder)
        }
    }, [pathname])

    return null
}