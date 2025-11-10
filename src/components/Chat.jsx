import React, { useEffect, useMemo, useRef, useState } from 'react'
import { askQuestion } from '../lib/api.js'
import TypingDots from './TypingDots.jsx'

export default function Chat({ namespace, onNamespaceChange }) {
  const [messages, setMessages] = useState([
    { id: 'm1', role: 'assistant', content: 'Hi! Ask me anything about your docs.' }
  ])
  const [input, setInput] = useState('')
  const [ns, setNs] = useState(namespace || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    onNamespaceChange?.(ns)
  }, [ns])

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

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
      const answer = await askQuestion({ question, namespace: ns })
      const assistantMessage = { id: String(Date.now() + 1), role: 'assistant', content: answer }
      setMessages((m) => [...m, assistantMessage])
    } catch (err) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-wrap">
      <div className="chat-sidebar">
        <div className="sidebar-card">
          <h3>Namespace</h3>
          <input
            type="text"
            placeholder="your-namespace"
            value={ns}
            onChange={(e) => setNs(e.target.value)}
          />
          <p className="muted">Set the namespace to target a specific corpus.</p>
        </div>
        <div className="sidebar-card tips">
          <h3>Tips</h3>
          <ul>
            <li>Upload PDFs and set a meaningful namespace.</li>
            <li>Ask precise questions for best results.</li>
            <li>You can change namespace anytime.</li>
          </ul>
        </div>
      </div>

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
            placeholder={'Ask something about your documents…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={false}
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

