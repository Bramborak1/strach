import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function EarningsForm({ user }) {
  const [type, setType] = useState('hra')
  const [hours, setHours] = useState(0)
  const [payment, setPayment] = useState('kartou')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsError(false)

    try {
      const { error } = await supabase
        .from('earnings')
        .insert([
          {
            user_name: user.name,
            type,
            hours: type === 'uklid' ? hours : null,
            payment: type === 'hra' || type === 'lastminute' ? payment : null,
            amount: amount !== '' ? amount : null,
            note: note !== '' ? note : null,
            deleted: false
          }
        ])

      if (error) throw error

      setMessage('Záznam byl úspěšně uložen!')
      setType('hra')
      setHours(0)
      setPayment('kartou')
      setAmount('')
      setNote('')
    } catch (error) {
      console.error('Chyba při ukládání:', error)
      setMessage('Chyba při ukládání záznamu.')
      setIsError(true)
    }
  }

  return (
    <div className="colorful-form">
      <h3>Zadat výdělek</h3>

      <form onSubmit={handleSubmit}>
        <label>Typ činnosti:</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="hra">Odehraná hra (600 Kč)</option>
          <option value="lastminute">Last minute hra (700 Kč)</option>
          <option value="noshow">No-show (200 Kč)</option>
          <option value="uklid">Úklid / praní plášťů (50 Kč/hod)</option>
          <option value="bonus">Bonus po 10 hrách (1000 Kč)</option>
          <option value="jine">Jiné (jednorázová odměna)</option>
        </select>

        {type === 'uklid' && (
          <>
            <label>Počet hodin:</label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
          </>
        )}

        {(type === 'hra' || type === 'lastminute') && (
          <>
            <label>Platba:</label>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option value="kartou">Kartou</option>
              <option value="hotove">Hotově</option>
              <option value="qr">QR</option>
            </select>
          </>
        )}

        {(type === 'hra' || type === 'lastminute') && payment === 'hotove' && (
          <>
            <label>Částka přijatá v hotovosti:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Např. 1990"
            />
          </>
        )}

        {type === 'jine' && (
          <>
            <label>Popis úkolu a domluvené odměny:</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Např. pomoc s akcí – 500 Kč"
            />
          </>
        )}

        <label>Poznámka:</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Např. poznámka k výdělku"
        />

        <button type="submit">Uložit</button>

        {message && (
          <p className={`form-message ${isError ? 'error' : 'success'}`}>{message}</p>
        )}
      </form>
    </div>
  )
}
