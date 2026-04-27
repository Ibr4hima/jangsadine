'use client'
import { useEffect, useState } from 'react'

export default function ScrollTop() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        function onScroll() {
            setVisible(window.scrollY > window.innerHeight / 4)
        }
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <button
            className={`scroll-top-btn ${visible ? 'visible' : ''}`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Remonter en haut"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
            </svg>
        </button>
    )
}