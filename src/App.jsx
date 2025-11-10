import React, { useMemo, useState } from 'react'
import UploadPanel from './components/UploadPanel.jsx'
import Chat from './components/Chat.jsx'
import { AppLogo } from './components/Logo.jsx'

export default function App() {
  const [showUpload, setShowUpload] = useState(false)
  const [namespace, setNamespace] = useState('')

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
        <div className="header-right">
          <button className="btn ghost" onClick={() => setShowUpload(true)}>
            Upload Docs
          </button>
          <a className="btn primary" href="https://your-website.com" target="_blank" rel="noreferrer">
            Your Website
          </a>
        </div>
      </header>

      <main className="app-main">
        <Chat namespace={namespace} onNamespaceChange={setNamespace} />
      </main>

      {showUpload && (
        <UploadPanel
          onClose={() => setShowUpload(false)}
          onUploadedNamespace={(ns) => {
            setNamespace(ns)
            setShowUpload(false)
          }}
        />
      )}
    </div>
  )
}

