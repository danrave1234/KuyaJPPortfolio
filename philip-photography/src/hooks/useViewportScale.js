'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * A "Smart" hook that calculates a layout scale factor to ensure elements fit within the viewport height.
 * It's particularly useful for "h-screen" sections that might overflow on shorter screens.
 * 
 * @param {number} baseHeight - The height (in pixels) your design was originally intended for (e.g., 900px for a standard desktop).
 * @param {number} minScale - The minimum scale allowed (to prevent it getting too small).
 * @returns {Object} { scale, viewportHeight, isFitNeeded }
 */
export function useViewportScale(baseHeight = 850, minScale = 0.7) {
    const [state, setState] = useState({
        scale: 1,
        vw: 0,
        vh: 0,
        isFitNeeded: false
    })

    const updateScale = useCallback(() => {
        if (typeof window === 'undefined') return

        const vh = window.innerHeight
        const vw = window.innerWidth

        // STRATEGY: 
        // 1. Never scale on mobile/tablet (width < 1024px). Users expect to scroll vertically.
        // 2. Only scale down if the height is smaller than our baseHeight.
        // 3. Prevent excessive scaling (minScale).

        if (vw < 1024) {
            setState({ scale: 1, vw, vh, isFitNeeded: false })
            document.documentElement.style.setProperty('--viewport-scale', '1')
            return
        }

        const heightScale = vh < baseHeight ? Math.max(minScale, vh / baseHeight) : 1

        setState({
            scale: heightScale,
            vw,
            vh,
            isFitNeeded: vh < baseHeight
        })

        document.documentElement.style.setProperty('--viewport-scale', heightScale.toString())
    }, [baseHeight, minScale])

    useEffect(() => {
        updateScale()
        window.addEventListener('resize', updateScale)
        return () => window.removeEventListener('resize', updateScale)
    }, [updateScale])

    return state
}
