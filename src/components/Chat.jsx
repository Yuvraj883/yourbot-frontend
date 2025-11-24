import React, { useEffect, useMemo, useRef, useState } from 'react'
import { askQuestion } from '../lib/api.js'
import TypingDots from './TypingDots.jsx'

// 1. Rename the prop to 'defaultNamespace' so we can use 'namespace' for our local state
export default function Chat({ namespace: defaultNamespace }) {
  
  // 2. Initialize state with the prop, defaulting to an empty string
  const [namespace, setNamespace] = useState(defaultNamespace || '')
  
  const [messages, setMessages] = useState([
    { id: 'm1', role: 'assistant', content: 'Hi! Ask me anything about your docs.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)

  // Sync if the parent prop changes (e.g. URL change)
  useEffect(() => {
    if (defaultNamespace) {
      setNamespace(defaultNamespace)
    }
  }, [defaultNamespace])

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  const canSend = useMemo(() => input.trim().length > 0 && !loading && namespace && namespace.trim().length > 0, [input, loading, namespace])

  async function onSend(e) {
    e.preventDefault()
    if (!canSend) return
    const question = input.trim()
    setError('')
    setInput('')
    const userMessage = { id: String(Date.now()), role: 'user', content: question }
    setMessages((m) => [...m, userMessage])
    setLoading(true)
    try {
      // 3. Pass the local 'namespace' state to the API
      const answer = await askQuestion({ question, namespace })
      const assistantMessage = { id: String(Date.now() + 1), role: 'assistant', content: answer }
      setMessages((m) => [...m, assistantMessage])
    } catch (err) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // 4. Logic Check: Only hide sidebar/expand chat if the PROP was provided. 
  // If we use the local state here, the sidebar would vanish as soon as you type.
  const isManagedMode = !!defaultNamespace;

  return (
    <div className={`chat-wrap ${isManagedMode ? 'chat-wrap-full' : ''}`}>
      {!isManagedMode && (
        <div className="chat-sidebar">
          <div className="sidebar-card">
            <h3>Namespace</h3>
            {/* 5. Input field for Namespace */}
            <input 
              className="sidebar-input"
              placeholder="Enter namespace..."
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '8px' }}
            />
            <p className="muted" style={{ marginTop: '8px', fontSize: '0.85rem' }}>
              Enter the namespace ID for your documents manually.
            </p>
          </div>
          <div className="sidebar-card tips">
            <h3>Tips</h3>
            <ul>
              <li>Upload PDFs to ingest documents.</li>
              <li>Ask precise questions for best results.</li>
              <li>Namespace matches your vector store index.</li>
            </ul>
          </div>
        </div>
      )}

      <div className="chat-main">
        <div className="messages" ref={listRef}>
          {messages.map((m) => (
            <Message key={m.id} role={m.role} content={m.content} />
          ))}
          {loading && <TypingDots />}
        </div>

        {!!error && <div className="banner error">{error}</div>}

        <form className="composer" onSubmit={onSend}>
          <input
            className="composer-input"
            // Update placeholder based on local state availability
            placeholder={namespace ? 'Ask something about your documents…' : 'Please enter a namespace first…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            // Disable if local state is empty
            disabled={!namespace}
          />
          <button className="btn primary" type="submit" disabled={!canSend}>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

function Message({ role, content }) {
  return (
    <div className={`message ${role}`}>
      <div className="avatar">{role === 'assistant' ? '🤖' : '🧑'}</div>
      <div className="bubble">
        {content}
      </div>
    </div>
  )
}