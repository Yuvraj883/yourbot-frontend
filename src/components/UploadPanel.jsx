import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ingestDocument } from '../lib/api.js'

// 1. Rename the prop to defaultNamespace to distinguish from local state
export default function UploadPanel({ namespace: defaultNamespace, onClose, onUploaded }) {
  // 2. Initialize local state with the prop
  const [namespace, setNamespace] = useState(defaultNamespace || '')
  
  const [file, setFile] = useState(null)
  const [organisation, setOrganisation] = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  // Sync state if the prop changes (optional, useful if parent updates dynamically)
  useEffect(() => {
    if (defaultNamespace) {
      setNamespace(defaultNamespace)
    }
  }, [defaultNamespace])

  // 3. Update validation to check local 'namespace' state
  const canSubmit = useMemo(() => {
    return Boolean((file || website) && organisation && namespace) && !submitting
  }, [file, organisation, website, namespace, submitting])

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      // 4. Send the local 'namespace' state to the API
      await ingestDocument({ file, organisation, website, namespace })
      onUploaded?.()
    } catch (err) {
      setError(err?.message || 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ingest Documents</h2>
          <button className="btn icon" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form className="form" onSubmit={onSubmit}>
          <div className="form-row">
            <label>Document</label>
            <div className="file-input">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx,.md,.html"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="form-row">
            <label>Organisation</label>
            <input
              type="text"
              placeholder="Your Organisation Name"
              value={organisation}
              onChange={(e) => setOrganisation(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Website</label>
            <input
              type="url"
              placeholder="https://your-website.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {/* 5. Make the Namespace input editable */}
          <div className="form-row">
            <label>Namespace</label>
            <input
              type="text"
              placeholder="Enter namespace"
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              // Removed 'disabled' attribute
            />
            <p className="muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Define the namespace (index) for these documents.
            </p>
          </div>

          {!!error && <div className="error">{error}</div>}

          <div className="modal-footer">
            <button className="btn ghost" type="button" onClick={onClose}>Cancel</button>
            <button className="btn primary" type="submit" disabled={!canSubmit}>
              {submitting ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}