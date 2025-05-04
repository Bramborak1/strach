import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function ChangePin({ user }) {
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsError(false)

    if (newPin !== confirmPin) {
      setMessage('Nové PINy se neshodují')
      setIsError(true)
      return
    }

    if (newPin.length < 4) {
      setMessage('PIN musí mít alespoň 4 číslice')
      setIsError(true)
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('pin')
        .eq('name', user.name)
        .eq('pin', oldPin)
        .single()

      if (error || !data) {
        setMessage('Starý PIN není správný')
        setIsError(true)
        return
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ pin: newPin })
        .eq('name', user.name)

      if (updateError) throw updateError

      setMessage('PIN byl úspěšně změněn')
      setOldPin('')
      setNewPin('')
      setConfirmPin('')
    } catch (error) {
      console.error('Chyba při změně PINu:', error)
      setMessage('Chyba při změně PINu')
      setIsError(true)
    }
  }

  return (
    <div className="colorful-form">
      <h3>Změna PINu</h3>
      <form onSubmit={handleSubmit}>
        <label>Starý PIN:</label>
        <input
          type="password"
          value={oldPin}
          onChange={(e) => setOldPin(e.target.value)}
        />
        <label>Nový PIN:</label>
        <input
          type="password"
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
        />
        <label>Potvrď nový PIN:</label>
        <input
          type="password"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
        />
        <button type="submit">Změnit PIN</button>
        {message && (
          <p className={`form-message ${isError ? 'error' : 'success'}`}>{message}</p>
        )}
      </form>
    </div>
  )
}

