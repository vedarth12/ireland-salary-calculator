import { useEffect, useState } from 'react'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setTimeout(() => setShow(true), 2000)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShow(false)
    if ((window as any).adsbygoogle) {
      try { (window as any).adsbygoogle.push({}) } catch {}
    }
  }

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-content">
        <p>
          We use cookies to personalize content and ads, to provide social media features and to analyze our traffic.
          We also share information about your use of our site with our advertising partners (Google AdSense).
        </p>
        <div className="cookie-actions">
          <button className="cookie-btn accept" onClick={accept}>Accept all</button>
          <button className="cookie-btn decline" onClick={decline}>Decline</button>
        </div>
        <p className="cookie-note">
          <a href="/privacy.html" target="_blank" rel="noopener">Privacy Policy</a> ·{' '}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">Ad Choices</a>
        </p>
      </div>
    </div>
  )
}