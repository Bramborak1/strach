import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function EarningsForm({ user, onSubmitted }) {
  const [type, setType] = useState('hra')
  const [hours, setHours] = useState(0)
  const [payment, setPayment] = useState('kartou')
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleTypeChange = (e) => {
    const selected = e.target.value
    setType(selected)

    // resetovat způsob platby, pokud není hra/lastminute
    if (selected !== 'hra' && selected !== 'lastminute') {
      setPayment('')
      setAmount('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsError(false)

    let finalAmount = null

    if (type === 'uklid') {
      finalAmount = hours * 50
    } else if (type === 'jine') {
      finalAmount = customAmount !== '' ? Number(customAmount) : null
    } else if ((type === 'hra' || type === 'lastminute') && payment === 'hotove') {
      finalAmount = amount !== '' ? Number(amount) : null
    } else if (type === 'noshow') {
      finalAmount = 200
    } else {
      finalAmount = 0 // fallback pro hra/lastminute bez hotovosti
    }

    if (finalAmount === null || isNaN(finalAmount)) {
      setMessage('Zadej prosím platnou částku nebo počet hodin.')
      setIsError(true)
      return
    }

    try {
      const { error } = await supabase
        .from('earnings')
        .insert([{
          user_name: user.name,
          type,
          hours: type === 'uklid' ? hours : null,
          payment: (type === 'hra' || type === 'lastminute') ? payment : null,
          amount: finalAmount,
          note: note !== '' ? note : null,
          deleted: false
        }])

      if (error) throw error

      setMessage('✅ Záznam byl úspěšně uložen!')
      setType('hra')
      setHours(0)
      setPayment('kartou')
      setAmount('')
      setCustomAmount('')
      setNote('')
      if (onSubmitted) onSubmitted()
    } catch (error) {
      console.error('Chyba při ukládání:', error)
      setMessage('❌ Chyba při ukládání záznamu.')
      setIsError(true)
    }
  }

  return (
    <div className="colorful-form">
      <h3>Zadat výdělek</h3>
      <form onSubmit={handleSubmit}>
        <label>Typ činnosti:</label>
        <select value={type} onChange={handleTypeChange}>
          <option value="hra">Odehraná hra (600 Kč)</option>
          <option value="lastminute">Last minute hra (700 Kč)</option>
          <option value="noshow">No-show (200 Kč)</option>
          <option value="uklid">Úklid / praní plášťů (50 Kč/hod)</option>
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
            <label>Způsob platby:</label>
            <select value={payment} onChange={(e) => setPayment(e.target.value)}>
              <option value="kartou">Kartou</option>
              <option value="hotove">Hotově</option>
              <option value="voucher">Voucher</option>
              <option value="qr">QR</option>
            </select>

            {payment === 'hotove' && (
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
          </>
        )}

        {type === 'jine' && (
          <>
            <label>Popis úkolu:</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Např. pomoc s akcí"
            />

            <label>Odměna v Kč:</label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Např. 500"
            />
          </>
        )}

        {type !== 'jine' && (
          <>
            <label>Poznámka:</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Např. poznámka k výdělku"
            />
          </>
        )}

        <button type="submit">Uložit</button>

        {message && (
          <p className={`form-message ${isError ? 'error' : 'success'}`}>{message}</p>
        )}
      </form>
    </div>
  )
}
