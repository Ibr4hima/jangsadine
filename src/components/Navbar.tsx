'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const liens = [
    { label: 'Cours audio', href: '/audio' },
    { label: 'Conférences', href: '/conferences' },
    { label: 'Khoutbah', href: '/khoutbah' },
    { label: 'Prières', href: '/prieres' },
    { label: 'Ebooks', href: '/ebooks' },
]

export default function Navbar() {
    const [menuOuvert, setMenuOuvert] = useState(false)

    return (
        <header style={{
            background: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderBottom: '1px solid #eee',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 28px',
                height: '68px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>

                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Image
                        src="/logo.png"
                        alt="Jàng sa Diné"
                        width={44}
                        height={44}
                    />
                    <span style={{
                        color: 'var(--texte)',
                        fontSize: '17px',
                        fontWeight: 700,
                        letterSpacing: '0.2px',
                    }}>
                        Jàng sa <span style={{ color: 'var(--or)' }}>Diné</span>
                    </span>
                </Link>

                {/* Liens desktop */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="nav-desktop">
                    {liens.map((lien) => (
                        <Link
                            key={lien.href}
                            href={lien.href}
                            style={{
                                color: '#444',
                                fontSize: '14px',
                                fontWeight: 500,
                                padding: '7px 14px',
                                borderRadius: '8px',
                                transition: 'background 0.15s, color 0.15s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--fond-creme)'
                                e.currentTarget.style.color = 'var(--bleu)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = '#444'
                            }}
                        >
                            {lien.label}
                        </Link>
                    ))}
                </nav>

                {/* Bouton menu mobile */}
                <button
                    onClick={() => setMenuOuvert(!menuOuvert)}
                    className="nav-mobile-btn"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'none',
                        flexDirection: 'column',
                        gap: '5px',
                        padding: '4px',
                    }}
                    aria-label="Menu"
                >
                    <span style={{ width: '22px', height: '2px', background: 'var(--texte)', display: 'block' }} />
                    <span style={{ width: '22px', height: '2px', background: 'var(--texte)', display: 'block' }} />
                    <span style={{ width: '22px', height: '2px', background: 'var(--texte)', display: 'block' }} />
                </button>
            </div>

            {/* Menu mobile */}
            {menuOuvert && (
                <div style={{
                    background: 'white',
                    borderTop: '1px solid #eee',
                    padding: '12px 24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }}>
                    {liens.map((lien) => (
                        <Link
                            key={lien.href}
                            href={lien.href}
                            onClick={() => setMenuOuvert(false)}
                            style={{
                                color: '#444',
                                fontSize: '15px',
                                fontWeight: 500,
                                padding: '10px 12px',
                                borderRadius: '8px',
                            }}
                        >
                            {lien.label}
                        </Link>
                    ))}
                    <Link href="/audio" onClick={() => setMenuOuvert(false)} style={{
                        marginTop: '8px',
                        background: 'var(--bleu)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 500,
                        padding: '11px 16px',
                        borderRadius: '8px',
                        textAlign: 'center',
                    }}>
                        Commencer
                    </Link>
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>
        </header>
    )
}