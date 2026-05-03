'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function ScrollRestore() {
    const pathname = usePathname()
    const prevPath = useRef<string>('')

    useEffect(() => {
        // Sauvegarder position de l'ancienne page
        if (prevPath.current && prevPath.current !== pathname) {
            sessionStorage.setItem('scroll:' + prevPath.current, String(window.scrollY))
        }
        prevPath.current = pathname

        // Restaurer position de la nouvelle page
        const saved = sessionStorage.getItem('scroll:' + pathname)
        if (saved && parseInt(saved) > 0) {
            const target = parseInt(saved)
            // Essayer plusieurs fois car le contenu peut prendre du temps à charger
            const attempts = [100, 300, 600, 1000]
            attempts.forEach(delay => {
                setTimeout(() => {
                    if (Math.abs(window.scrollY - target) > 50) {
                        window.scrollTo({ top: target, behavior: 'instant' })
                    }
                }, delay)
            })
        }
    }, [pathname])

    return null
}