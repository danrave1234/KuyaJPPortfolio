import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SEO = ({ 
  title = "Kuya JP Photography - Wildlife & Nature Photography Portfolio",
  description = "Professional wildlife and nature photography by John Philip Morada. Capturing the beauty of Philippine wildlife, birds, and nature through patient observation and storytelling.",
  keywords = "wildlife photography, nature photography, bird photography, Philippine wildlife, John Philip Morada, Kuya JP",
  image = "https://jpmorada.photography/Hero.jpg",
  type = "website"
}) => {
  const location = useLocation()
  const url = `https://jpmorada.photography${location.pathname}`

  useEffect(() => {
    // Update document title
    document.title = title

    // Update or create meta tags
    const updateMetaTag = (property, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attribute}="${property}"]`)
      
      if (element) {
        element.setAttribute('content', content)
      } else {
        element = document.createElement('meta')
        element.setAttribute(attribute, property)
        element.setAttribute('content', content)
        document.head.appendChild(element)
      }
    }

    // Update meta tags
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)
    
    // Open Graph
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:url', url, true)
    updateMetaTag('og:image', image, true)
    updateMetaTag('og:type', type, true)
    
    // Twitter
    updateMetaTag('twitter:title', title, true)
    updateMetaTag('twitter:description', description, true)
    updateMetaTag('twitter:url', url, true)
    updateMetaTag('twitter:image', image, true)

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]')
    if (canonicalLink) {
      canonicalLink.setAttribute('href', url)
    } else {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      canonicalLink.setAttribute('href', url)
      document.head.appendChild(canonicalLink)
    }
  }, [title, description, keywords, image, type, url])

  return null
}

export default SEO

