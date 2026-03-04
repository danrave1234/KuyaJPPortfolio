'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'theme'
const MODE_STORAGE_KEY = 'mode'
const MODES = {
  LIGHT: 'light',
  DARK: 'dark',
}

export const THEMES = {
  BIRDLIFE: 'birdlife',
  ASTRO: 'astro',
  LANDSCAPE: 'landscape',
}

export const THEME_CONTENT = {
  birdlife: {
    title: "Avian Wonders",
    desc: "Capturing the elegance and freedom of birds in their natural habitat. From the dense rainforests to the open skies.",
    about: {
      tag: "About The Photographer",
      title: "John Philip Morada",
      bio: "Based in the Philippines, I specialize in capturing the raw, unscripted moments of wildlife. My work is a testament to patience, waiting for the perfect interplay of light and nature's true stories.",
      philosophy: {
        title: "My Philosophy",
        text: "I believe every image should advocate for conservation. By showing the beauty of our wildlife, I hope to inspire protection."
      },
      approach: {
        title: "My Approach",
        text: "Respect for the subject comes first. I use long lenses and careful fieldcraft to document without disturbing natural behavior."
      },
      // New sections for About page
      intro: {
        subtitle: "Behind the Lens",
        text: "I'm a wildlife photographer who loves bird photography, based in Batangas, Luzon (Philippines). I focus on the small details and natural behaviors of different bird species in their own homes, from big eagles to tiny songbirds. Available for assignments across Batangas, Metro Manila, and Southern Luzon.",
        quote: "Years of being out there taught me to be patient, move quietly, and respect the animals' home. Every photo starts way before I press the button by watching the light, learning their habits, and waiting for the perfect moment."
      },
      services: {
        title: "Wildlife & bird photography services in Batangas • Metro Manila • Southern Luzon",
        items: [
          "Birdlife portraits for print and editorial features",
          "Conservation/editorial assignments with ethical field practices",
          "Workshops & guided shoots around Batangas and nearby provinces"
        ]
      },
      what: {
        title: "Birdlife and the quiet drama of the wild",
        desc: "I look for moments that most people miss, like when birds are getting ready to fly, quick looks between them, rain on their feathers, and that quiet time before sunrise. My work is slow and I watch carefully, focusing on how they act and where they live rather than dramatic shots."
      },
      how: {
        title: "Fieldcraft over shortcuts",
        desc: "I scout locations, read light, and learn patterns. Most shoots begin with long sits, mapping wind and approach, and end quietly. I do not use baiting or recorded calls—anything that causes disturbance. The story matters more than the shot."
      },
      why: {
        title: "To advocate for places that can't speak",
        desc: "Photography is how I get people to care. If one photo can make someone stop and feel amazed, then maybe they'll start thinking about protecting and respecting wildlife too."
      }
    },
    experience: {
      tag: "Selected Works",
      title: "Moments in",
      titleHighlight: "Time",
      desc: "Photography is more than just clicking a shutter; it's about anticipation. From the elusive Philippine Eagle to the vibrant sunbirds, each image represents hours of silent observation.",
      stats: {
        years: "10",
        yearsLabel: "Years Active",
        count: "500",
        countLabel: "Species Logged"
      }
    }
  },
  astro: {
    title: "Deep Space",
    desc: "Exploring the cosmos through long-exposure photography. Nebulas, star trails, and the infinite void.",
    about: {
      tag: "The Astrophotographer",
      title: "John Philip Morada",
      bio: "When the sun sets, a different world awakens. I specialize in capturing the ancient light of distant stars, revealing the colorful majesty of the universe that is invisible to the naked eye.",
      philosophy: {
        title: "Cosmic Perspective",
        text: "Capturing the night sky reminds us of our place in the universe. It connects us to the infinite and the ancient history written in the stars."
      },
      approach: {
        title: "Technical Precision",
        text: "Astrophotography requires technical mastery and patience. I use specialized tracking mounts and long exposures to gather light from millions of years ago."
      },
      // New sections for About page
      intro: {
        subtitle: "Stargazer",
        text: "I'm an astrophotographer based in the Philippines, chasing clear skies and dark horizons. I focus on deep sky objects, from distant galaxies to colorful nebulae, often traveling to remote locations to escape light pollution. Available for workshops and night sky sessions.",
        quote: "The night sky teaches humility. Capturing photons that have traveled for millions of years requires technical precision and a deep respect for the cosmos. It's about revealing what is always there, but rarely seen."
      },
      services: {
        title: "Astrophotography services & workshops",
        items: [
          "Deep sky imaging and processing tutorials",
          "Night sky tours and star party hosting",
          "Technical workshops on tracking and stacking"
        ]
      },
      what: {
        title: "The hidden colors of the cosmos",
        desc: "I look for the faint glow of nebulae and the spiral arms of distant galaxies. Using long exposure techniques, I reveal the vibrant colors of hydrogen alpha and oxygen in interstellar clouds that are invisible to the naked eye."
      },
      how: {
        title: "Patience in the dark",
        desc: "I plan shoots around the moon phase and weather. A single image can take hours or even days of exposure time. I use specialized equatorial mounts to counteract the earth's rotation, ensuring every star remains a perfect point of light."
      },
      why: {
        title: "To connect us with the infinite",
        desc: "Astrophotography bridges the gap between science and art. By showing the scale and beauty of the universe, I hope to inspire a sense of wonder and a desire to preserve our dark skies from light pollution."
      }
    },
    experience: {
      tag: "Stellar Journeys",
      title: "Galactic",
      titleHighlight: "Vistas",
      desc: "From the heart of the Milky Way to distant nebulae, each image is a journey through time and space. Capturing the silent, majestic dance of the cosmos requires dedication to the dark skies.",
      stats: {
        years: "5",
        yearsLabel: "Years Active",
        count: "50",
        countLabel: "Deep Sky Objects"
      }
    }
  },
  landscape: {
    title: "Earthly Horizons",
    desc: "The raw beauty of mountains, valleys, and oceans. Chasing light across the most dramatic landscapes on Earth.",
    about: {
      tag: "Landscape Artist",
      title: "John Philip Morada",
      bio: "I seek the dramatic interplay of light and land. From rugged peaks to serene coastlines, my goal is to capture the mood and atmosphere of the Earth's most beautiful places.",
      philosophy: {
        title: "Nature's Canvas",
        text: "The earth is a work of art. My role is simply to frame it, waiting for that fleeting moment when light, weather, and composition align perfectly."
      },
      approach: {
        title: "Chasing Light",
        text: "Great landscape photography is about being there. I trek to remote locations and wait for the golden hour, blue hour, or the storm that brings the drama."
      },
      // New sections for About page
      intro: {
        subtitle: "Explorer",
        text: "I'm a landscape photographer passionate about the Philippines' diverse terrain. From the rice terraces of the north to the rugged coastlines of the south, I strive to document the shifting moods of nature. Available for commercial landscape assignments and print commissions.",
        quote: "Landscape photography is a waiting game. It's about understanding the weather, the light, and the land itself. I wait for that split second when the sun breaks through the clouds and transforms the ordinary into the extraordinary."
      },
      services: {
        title: "Landscape photography & fine art prints",
        items: [
          "Fine art prints for home and office decor",
          "Commercial landscape photography for tourism",
          "On-location landscape photography workshops"
        ]
      },
      what: {
        title: "The drama of light and land",
        desc: "I focus on dynamic landscapes where weather plays a key role. Storm clouds over mountains, waves crashing on rocks, and the soft light of golden hour. I aim to capture the feeling of being there, the wind, the cold, and the silence."
      },
      how: {
        title: "Chasing the elements",
        desc: "I study weather maps and sun positions. I hike to viewpoints before dawn and stay after sunset. Using filters to control light and motion, I create images that balance technical perfection with emotional impact."
      },
      why: {
        title: "To preserve the Earth's beauty",
        desc: "Our landscapes are changing. Through my images, I hope to document the raw beauty of our planet and inspire others to appreciate and protect our natural environment."
      }
    },
    experience: {
      tag: "Earth's Beauty",
      title: "Natural",
      titleHighlight: "Wonders",
      desc: "Exploring the diverse textures of our planet. From the crashing waves to the silent mountains, each photograph invites you to stand in that very spot and breathe in the view.",
      stats: {
        years: "8",
        yearsLabel: "Years Active",
        count: "100",
        countLabel: "Locations Scouted"
      }
    }
  }
}

const ThemeContext = createContext({
  theme: null,
  mode: MODES.DARK,
  isLandingOpen: true,
  forceLandingOpen: false,
  mounted: false,
  setTheme: () => {},
  setMode: () => {},
  toggleMode: () => {},
  resetTheme: () => {},
})

function applyDocumentTheme({ theme, mode }) {
  const nextMode = mode === MODES.LIGHT ? MODES.LIGHT : MODES.DARK
  const root = document.documentElement

  // Replace classes deterministically to avoid stale combinations.
  const nextClasses = []
  if (theme && Object.values(THEMES).includes(theme)) nextClasses.push(`theme-${theme}`)
  nextClasses.push(nextMode)
  root.className = nextClasses.join(' ')

  // Keep compatibility with existing selectors that rely on `.dark`.
  if (nextMode === MODES.DARK) {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.remove('dark')
    root.classList.add('light')
  }
}

function scrollViewportToTop() {
  const scrollContainer = document.querySelector('.snap-y.snap-mandatory')

  if (scrollContainer) {
    scrollContainer.scrollTo({
      top: 0,
      behavior: 'auto',
    })
    return
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto',
  })
}

export function ThemeProvider({ children, initialTheme = null }) {
  // Important for hydration stability:
  // - Server render cannot read `localStorage`, so it must use a deterministic default.
  // - Client hydration must start from the same default to avoid attribute mismatches.
  // We then sync the real theme state in an effect.
  const [theme, setThemeState] = useState(initialTheme)
  const [mode, setModeState] = useState(MODES.DARK)
  const [isLandingOpen, setIsLandingOpen] = useState(!initialTheme)
  const [forceLandingOpen, setForceLandingOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      const savedMode = localStorage.getItem(MODE_STORAGE_KEY)
      const initialMode = Object.values(MODES).includes(savedMode) ? savedMode : MODES.DARK
      setModeState(initialMode)
      if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
        setThemeState(savedTheme)
        setIsLandingOpen(false)
        setForceLandingOpen(false)
        // Ensure cookie is synced for next refresh
        document.cookie = `theme=${savedTheme}; path=/; max-age=31536000; SameSite=Lax`
        applyDocumentTheme({ theme: savedTheme, mode: initialMode })
      } else {
        // Only force open if we didn't start with a valid theme from server
        if (!initialTheme) {
            applyDocumentTheme({ theme: null, mode: initialMode })
            setIsLandingOpen(true)
            setForceLandingOpen(false)
        } else {
            // We have initialTheme from server/cookie, but not in localStorage? 
            // Trust server for now, or sync back to localStorage?
            // Let's trust server/cookie and sync to localStorage
             setThemeState(initialTheme)
             setIsLandingOpen(false)
             localStorage.setItem(THEME_STORAGE_KEY, initialTheme)
             applyDocumentTheme({ theme: initialTheme, mode: initialMode })
        }
      }
    } catch {
      applyDocumentTheme({ theme: null, mode: MODES.DARK })
      if (!initialTheme) {
        setIsLandingOpen(true)
      }
      setForceLandingOpen(false)
    }
  }, [])

  const setTheme = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setThemeState(newTheme)
      setIsLandingOpen(false)
      setForceLandingOpen(false)
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`
      applyDocumentTheme({ theme: newTheme, mode })
      scrollViewportToTop()
    }
  }

  const setMode = (newMode) => {
    const nextMode = Object.values(MODES).includes(newMode) ? newMode : MODES.DARK
    setModeState(nextMode)
    try {
      localStorage.setItem(MODE_STORAGE_KEY, nextMode)
    } catch {
      // ignore
    }
    applyDocumentTheme({ theme, mode: nextMode })
  }

  const toggleMode = () => {
    setMode(mode === MODES.DARK ? MODES.LIGHT : MODES.DARK)
  }

  const resetTheme = () => {
    setForceLandingOpen(true)
    setIsLandingOpen(true)
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, isLandingOpen, forceLandingOpen, mounted, setTheme, setMode, toggleMode, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
