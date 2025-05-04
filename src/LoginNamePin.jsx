import React, { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minut

export default function LoginNamePin({ onLogin }) {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const inactivityTimeout = useRef();

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', name.trim())
      .eq('pin', pin)
      .single()

    if (error || !data) {
      setError('Špatné jméno nebo PIN')
    } else {
      onLogin(data)
    }
  }

  useEffect(() => {
    const session = supabase.auth.getSession();
    if (session) {
      setUser(session.user);
    }
  }, []);

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(inactivityTimeout.current);
      inactivityTimeout.current = setTimeout(() => {
        // Odhlásit uživatele
        setUser(null);
        supabase.auth.signOut();
      }, INACTIVITY_LIMIT);
    };

    // Sledovat různé typy aktivity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    // Spustit timer při načtení
    resetTimer();

    return () => {
      clearTimeout(inactivityTimeout.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form className="colorful-form" onSubmit={handleLogin}>
        <h2 style={{textAlign: 'center', color: '#ff4d4f', marginBottom: '1.2rem'}}>Přihlášení</h2>
        <label>Jméno:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Zadej své jméno"
        />
        <label>PIN:</label>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Zadej PIN"
        />
        <button type="submit">Přihlásit</button>
        {error && <p className="form-message error" style={{marginTop: '0.7rem'}}>{error}</p>}
      </form>
    </div>
  )
}
