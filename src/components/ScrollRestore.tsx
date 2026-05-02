'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function ScrollRestore() {
    const pathname = usePathname()
    const prevPath = useRef<string>('')

    useEffect(() => {
        if (prevPath.current && prevPath.current !== pathname) {
            sessionStorage.setItem('scroll:' + prevPath.current, String(window.scrollY))
        }
        prevPath.current = pathname
    }, [pathname])

    return null
}