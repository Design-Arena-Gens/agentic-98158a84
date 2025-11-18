"use client";

import { useState } from 'react';

type FetchResult = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data?: unknown;
  text?: string;
  error?: string;
  durationMs: number;
};

export default function Page() {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('');
  const [result, setResult] = useState<FetchResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runAgent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, method, headers: safeParse(headers), body }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ ok: false, status: 0, statusText: 'Network Error', headers: {}, error: String(err), durationMs: 0 });
    } finally {
      setLoading(false);
    }
  }

  function safeParse(input: string) {
    try {
      const parsed = JSON.parse(input || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {} as Record<string, string>;
    }
  }

  return (
    <main className="container">
      <h1>Agentic Fetcher</h1>
      <p className="subtitle">Fetch data from any URL with a simple agent.</p>

      <form onSubmit={runAgent} className="card">
        <label>
          URL
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://api.example.com" />
        </label>

        <div className="row">
          <label>
            Method
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>

          <label>
            Headers (JSON)
            <input type="text" value={headers} onChange={(e) => setHeaders(e.target.value)} placeholder='{"Accept":"application/json"}' />
          </label>
        </div>

        {['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && (
          <label>
            Body
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Raw request body" rows={5} />
          </label>
        )}

        <button type="submit" disabled={loading}>{loading ? 'Fetching?' : 'Run Agent'}</button>
      </form>

      {result && (
        <section className="card">
          <h2>Result</h2>
          <div className="meta">
            <span className={result.ok ? 'ok' : 'err'}>{result.ok ? 'Success' : 'Error'}</span>
            <span>{result.status} {result.statusText}</span>
            <span>{result.durationMs} ms</span>
          </div>
          <details open>
            <summary>Headers</summary>
            <pre>{JSON.stringify(result.headers, null, 2)}</pre>
          </details>
          <details open>
            <summary>Body</summary>
            <pre>{result.data ? JSON.stringify(result.data, null, 2) : (result.text || result.error)}</pre>
          </details>
        </section>
      )}

      <footer>
        <button className="preset" onClick={() => setUrl('https://jsonplaceholder.typicode.com/todos/1')}>Use JSONPlaceholder</button>
        <button className="preset" onClick={() => setUrl('https://api.github.com/repos/vercel/next.js')}>Use GitHub API</button>
        <button className="preset" onClick={() => setUrl('https://pokeapi.co/api/v2/pokemon/1')}>Use Pok?API</button>
      </footer>
    </main>
  );
}
