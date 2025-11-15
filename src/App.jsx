import React, { useMemo, useState, useEffect } from 'react'
import UploadPanel from './components/UploadPanel.jsx'
import Chat from './components/Chat.jsx'
import { AppLogo } from './components/Logo.jsx'

export default function App() {
  const [showUpload, setShowUpload] = useState(false)
  const [namespace, setNamespace] = useState('')

  useEffect(() => {
    // Extract namespace from URL path (e.g., /sahil-kapoor -> sahil-kapoor)
    const updateNamespace = () => {
      const path = window.location.pathname
      const ns = path.startsWith('/') ? path.slice(1) : path
      setNamespace(ns || '')
    }
    
    // Initial extraction
    updateNamespace()
    
    // Listen for browser navigation (back/forward buttons)
    window.addEventListener('popstate', updateNamespace)
    
    return () => {
      window.removeEventListener('popstate', updateNamespace)
    }
  }, [])

  const headerTitle = useMemo(() => {
    return namespace ? `YourBot · ${namespace}` : 'YourBot'
  }, [namespace])

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-left">
          <AppLogo />
          <h1>{headerTitle}</h1>
        </div>
        {!namespace && (
          <div className="header-right">
            <button className="btn ghost" onClick={() => setShowUpload(true)}>
              Upload Docs
            </button>
            <a className="btn primary" href="https://your-website.com" target="_blank" rel="noreferrer">
              Your Website
            </a>
          </div>
        )}
      </header>

      <main className="app-main">
        <Chat namespace={namespace} />
      </main>

      {showUpload && (
        <UploadPanel
          namespace={namespace}
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false)
          }}
        />
      )}
    </div>
  )
}

