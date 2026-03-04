'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollReset() {
    const pathname = usePathname()

    useEffect(() => {
        // 1. Reset standard window scroll
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' // Force instant reset, overriding any browser defaults
        })

        // 2. Clear any session storage scroll positions that might interfere
        // (though we predominantly use window scroll now)
        sessionStorage.removeItem('gallery-scrollY')

        // 3. Handle the ScrollSnapContainer (Home page specific)
        // If we are on Home, or leaving Home, we want to make sure the Snap Container is reset
        const snapContainer = document.querySelector('.snap-y.snap-mandatory')
        if (snapContainer) {
            snapContainer.scrollTop = 0
        }

        // 4. Force body overflow reset just in case some component leaves it hidden
        document.body.style.overflow = 'auto'
        document.documentElement.style.overflow = 'auto'

    }, [pathname])

    return null
}
