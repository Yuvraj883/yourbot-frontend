import React, { useMemo, useRef, useState } from 'react'
import { ingestDocument } from '../lib/api.js'

export default function UploadPanel({ namespace, onClose, onUploaded }) {
  const [file, setFile] = useState(null)
  const [organisation, setOrganisation] = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const canSubmit = useMemo(() => {
    return Boolean((file || website) && organisation && namespace) && !submitting
  }, [file, organisation, website, namespace, submitting])

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
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

          <div className="form-row">
            <label>Namespace</label>
            <input
              type="text"
              placeholder="your-namespace"
              value={namespace || ''}
              disabled
            />
            <p className="muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Namespace is set from the URL path.
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

