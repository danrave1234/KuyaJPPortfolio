import { useEffect, useRef } from 'react';

export default function ParallaxBackground() {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !imageRef.current) return;
      
      const scrolled = window.scrollY;
      const rate = scrolled * 0.5;
      
      // Only apply if the element is visible
      if (scrolled < window.innerHeight) {
        imageRef.current.style.transform = `translateY(${rate}px) scale(1.1)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <img
        ref={imageRef}
        src="/Hero.jpg"
        alt="Hero Background"
        className="w-full h-full object-cover object-center scale-110 will-change-transform"
        style={{ transition: 'transform 0.1s cubic-bezier(0,0,0.2,1)' }} // Smooth out the scroll feeling slightly
      />
    </div>
  );
}




