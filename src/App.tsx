import { useState, useEffect } from 'react'
import './App.css'
import Calculator from './components/Calculator'
import { BonusTool, CompareTool, OvertimeTool, PAYETool, PensionTool } from './components/Tools'
import AdSense from './components/AdSense'
import CookieConsent from './components/CookieConsent'

const AD_CLIENT = 'ca-pub-1777391486062589'
const AD_SLOT_TOP = '7672825041'
const AD_SLOT_MIDDLE = '6380638684'
const AD_SLOT_BOTTOM = '5561667028'

type Tab = 'calculator' | 'tools'
type ToolTab = 'compare' | 'overtime' | 'bonus' | 'pension' | 'paye'
type Theme = 'light' | 'dark'

const TOOL_TABS: { value: ToolTab; label: string }[] = [
  { value: 'compare', label: 'Salary comparison' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'pension', label: 'Pension' },
  { value: 'paye', label: 'PAYE calculator' },
]

function App() {
  const [tab, setTab] = useState<Tab>('calculator')
  const [toolTab, setToolTab] = useState<ToolTab>('compare')
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') as Theme | null
      if (stored) return stored
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-flag" aria-hidden="true" />
            <div>
              <h1>mynetpay</h1>
              <p>Irish Salary & Tax Calculator — PAYE · USC · PRSI</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>
            <nav className="main-nav" aria-label="Main navigation" data-active={tab === 'tools' ? 'tools' : 'calculator'}>
              <button
                type="button"
                className={`nav-btn ${tab === 'calculator' ? 'active' : ''}`}
                onClick={() => setTab('calculator')}
              >
                Calculator
              </button>
              <button
                type="button"
                className={`nav-btn ${tab === 'tools' ? 'active' : ''}`}
                onClick={() => setTab('tools')}
              >
                Tools
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="site-main">
        <AdSense client={AD_CLIENT} slot={AD_SLOT_TOP} className="ad-top" />
        {tab === 'calculator' ? (
          <Calculator />
        ) : (
          <section className="tools-section">
            <div className="tool-tabs" role="tablist" aria-label="Tools">
              {TOOL_TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={toolTab === t.value}
                  className={`tool-tab ${toolTab === t.value ? 'active' : ''}`}
                  onClick={() => setToolTab(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {toolTab === 'compare' && <CompareTool />}
            {toolTab === 'overtime' && <OvertimeTool />}
            {toolTab === 'bonus' && <BonusTool />}
            {toolTab === 'pension' && <PensionTool />}
            {toolTab === 'paye' && <PAYETool />}
          </section>
        )}
        <AdSense client={AD_CLIENT} slot={AD_SLOT_MIDDLE} className="ad-middle" />
      </main>

      <footer className="site-footer">
        <AdSense client={AD_CLIENT} slot={AD_SLOT_BOTTOM} className="ad-bottom" />
        <p>
          Estimates for the {new Date().getFullYear()}-earliest available tax year, based on Revenue
          Ireland rates. Not financial advice.
        </p>
      </footer>
      <CookieConsent />
    </div>
  )
}

export default App