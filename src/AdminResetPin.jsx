import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function AdminResetPin() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [newPin, setNewPin] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .order('name')

      if (!error) {
        setUsers(data.map(u => u.name))
      }
    }

    loadUsers()
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsError(false)

    if (!selectedUser || !newPin) {
      setMessage('Vyber uživatele a zadej nový PIN')
      setIsError(true)
      return
    }

    if (newPin.length < 4) {
      setMessage('PIN musí mít alespoň 4 číslice')
      setIsError(true)
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ pin: newPin })
        .eq('name', selectedUser)

      if (error) throw error

      setMessage(`PIN pro ${selectedUser} byl úspěšně změněn`)
      setSelectedUser('')
      setNewPin('')
    } catch (error) {
      console.error('Chyba při resetování PINu:', error)
      setMessage('Chyba při resetování PINu')
      setIsError(true)
    }
  }

  return (
    <div className="colorful-form">
      <h3>Reset PINu</h3>
      <form onSubmit={handleReset}>
        <label>Vyber uživatele:</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Vyber uživatele</option>
          {users.map(user => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
        <label>Nový PIN:</label>
        <input
          type="password"
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
        />
        <button type="submit">Resetovat PIN</button>
        {message && (
          <p className={`form-message ${isError ? 'error' : 'success'}`}>{message}</p>
        )}
      </form>
    </div>
  )
}
