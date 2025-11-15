import React, { useEffect, useMemo, useRef, useState } from 'react'
import { askQuestion } from '../lib/api.js'
import TypingDots from './TypingDots.jsx'

export default function Chat({ namespace }) {
  const [messages, setMessages] = useState([
    { id: 'm1', role: 'assistant', content: 'Hi! Ask me anything about your docs.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)

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
      const answer = await askQuestion({ question, namespace })
      const assistantMessage = { id: String(Date.now() + 1), role: 'assistant', content: answer }
      setMessages((m) => [...m, assistantMessage])
    } catch (err) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`chat-wrap ${namespace ? 'chat-wrap-full' : ''}`}>
      {!namespace && (
        <div className="chat-sidebar">
          <div className="sidebar-card">
            <h3>Namespace</h3>
            <p className="muted">{namespace || 'No namespace in URL'}</p>
            <p className="muted">Using namespace from URL path.</p>
          </div>
          <div className="sidebar-card tips">
            <h3>Tips</h3>
            <ul>
              <li>Upload PDFs to ingest documents.</li>
              <li>Ask precise questions for best results.</li>
              <li>Namespace is set from the URL path.</li>
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
            placeholder={namespace ? 'Ask something about your documents…' : 'No namespace in URL…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
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

