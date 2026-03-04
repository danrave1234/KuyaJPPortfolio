'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ScrollContext = createContext({
    scrollY: 0,
    setScrollY: () => { },
})

export function ScrollProvider({ children }) {
    const [scrollY, setScrollYState] = useState(0)

    const setScrollY = useCallback((y) => {
        setScrollYState(y)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            // On regular pages (without ScrollSnapContainer), use window.scrollY
            // On Home page (with ScrollSnapContainer), window.scrollY is usually 0
            // but the container will manually call setScrollY.
            if (window.scrollY > 0) {
                setScrollYState(window.scrollY)
            }
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll, { passive: true })
            return () => window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <ScrollContext.Provider value={{ scrollY, setScrollY }}>
            {children}
        </ScrollContext.Provider>
    )
}

export const useScroll = () => useContext(ScrollContext)
