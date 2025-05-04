import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      onLogin(data.user)
    }
  }

  return (
    <div style={{ color: 'white' }}>
      <h2>Přihlášení</h2>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Heslo"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <button onClick={handleLogin}>Přihlásit</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
