import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function LoginNamePin({ onLogin }) {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', name)
      .eq('pin', pin)
      .single()

    if (error || !data) {
      setError('Neplatné jméno nebo PIN')
    } else {
      onLogin(data)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">Přihlášení</h2>

        <input
          type="text"
          placeholder="Jméno"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Přihlásit
        </button>

        {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}
      </div>
    </div>
  )
}
