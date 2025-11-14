import { API_BASE } from './config.js'

export async function ingestDocument({
  file,
  organisation,
  website,
  namespace,
}) {
  if (!namespace || !String(namespace).trim()) {
    throw new Error('Namespace is required. Please provide a namespace.')
  }
  const form = new FormData()
  if (file) {
    form.append('file', file)
  }
  form.append('organisation', organisation)
  form.append('website', website)
  form.append('namespace', namespace)

  console.log('[config] API_BASE =', API_BASE)
  console.log('[ingest] POST', `${API_BASE}/ingest`, {
    organisation,
    website,
    namespace,
    file: file?.name,
  })
  let res
  try {
    res = await fetch(`${API_BASE}/ingest`, {
      method: 'POST',
      body: form,
    })
  } catch (e) {
    console.error('[ingest] network error', e)
    throw new Error(
      'Network error calling /ingest. Is the backend running and CORS enabled?'
    )
  }
  if (!res.ok) {
    const text = await readAsText(res)
    throw new Error(text || `Upload failed (${res.status})`)
  }
  return true
}

export async function askQuestion({ question, namespace }) {
  if (!namespace || !String(namespace).trim()) {
    throw new Error('Namespace is required. Please set a namespace.')
  }
  const payload = { question, namespace }
  console.log('[config] API_BASE =', API_BASE)
  console.log('[ask] POST', `${API_BASE}/ask`, payload)
  let res
  try {
    res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.error('[ask] network error', e)
    throw new Error(
      'Network error calling /ask. Is the backend running and CORS enabled?'
    )
  }
  if (!res.ok) {
    const text = await readAsText(res)
    throw new Error(text || `Ask failed (${res.status})`)
  }
  const parsed = await parseResponse(res)
  if (typeof parsed === 'string') return parsed || 'No answer received.'
  if (parsed && typeof parsed === 'object') {
    if (typeof parsed.answer === 'string') return parsed.answer
    if (typeof parsed.response === 'string') return parsed.response
  }
  return 'No answer received.'
}

async function readAsText(res) {
  try {
    const clone = res.clone()
    return await clone.text()
  } catch {
    return ''
  }
}

async function parseResponse(res) {
  // Try JSON first, but without consuming the original stream for fallback
  try {
    const jsonClone = res.clone()
    const data = await jsonClone.json()
    return data
  } catch {
    // Not JSON, try as text
    try {
      const text = await res.text()
      return text
    } catch {
      return ''
    }
  }
}
