import { useEffect, useRef } from 'react'

interface AdSenseProps {
  client: string
  slot: string
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle'
  className?: string
  style?: React.CSSProperties
}

export default function AdSense({ client, slot, format = 'auto', className = '', style }: AdSenseProps) {
  const adRef = useRef<HTMLModElement | null>(null)

  useEffect(() => {
    // Load AdSense script dynamically
    const script = document.createElement('script')
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [client])

  useEffect(() => {
    if (adRef.current && (window as any).adsbygoogle) {
      try {
        (window as any).adsbygoogle.push({})
      } catch (e) {
        console.warn('AdSense push failed:', e)
      }
    }
  }, [])

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', ...style }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
      aria-label="Advertisement"
    />
  )
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}