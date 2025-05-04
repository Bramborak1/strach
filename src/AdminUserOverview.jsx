import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function AdminUserOverview() {
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState('')
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState(null)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutNote, setPayoutNote] = useState('')
  const [payoutMessage, setPayoutMessage] = useState('')

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

  useEffect(() => {
    if (!selected) return

    const loadRecords = async () => {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .eq('user_name', selected)
        .eq('deleted', false)
        .order('created_at', { ascending: false })

      if (!error) {
        setRecords(data)

        let hotovost = 0
        let hodnota = 0
        let vyplaceno = 0
        const activityValues = {
          hra: 600,
          lastminute: 700,
          noshow: 200,
          uklid: (h) => h * 50,
          bonus: 1000,
          jine: 0
        }

        for (const e of data) {
          if (e.payment === 'hotove') hotovost += Number(e.amount || 0)
          if (e.type === 'vyplata') vyplaceno += Number(e.amount || 0)
          if (e.type === 'uklid') hodnota += activityValues.uklid(e.hours || 0)
          else if (e.type !== 'jine') hodnota += activityValues[e.type] || 0
        }

        setSummary({
          hotovost,
          hodnota,
          vyplaceno
        })
      }
    }

    loadRecords()
  }, [selected])

  const handlePayoutSubmit = async (e) => {
    e.preventDefault()
    setPayoutMessage('')

    const amount = Number(payoutAmount)
    if (!amount || amount <= 0) {
      setPayoutMessage('Zadej platnou částku.')
      return
    }

    const { error } = await supabase
      .from('earnings')
      .insert([{
        user_name: selected,
        type: 'vyplata',
        amount,
        note: payoutNote,
        deleted: false
      }])

    if (error) {
      setPayoutMessage('Chyba při ukládání výplaty.')
      return
    }

    setPayoutMessage('Výplata byla uložena.')
    setPayoutAmount('')
    setPayoutNote('')

    // Aktualizuj záznamy po uložení
    const { data, error: reloadError } = await supabase
      .from('earnings')
      .select('*')
      .eq('user_name', selected)
      .eq('deleted', false)
      .order('created_at', { ascending: false })

    if (!reloadError) {
      setRecords(data)
      let hotovost = 0
      let hodnota = 0
      let vyplaceno = 0

      const activityValues = {
        hra: 600,
        lastminute: 700,
        noshow: 200,
        uklid: (h) => h * 50,
        bonus: 1000,
        jine: 0
      }

      for (const e of data) {
        if (e.payment === 'hotove') hotovost += Number(e.amount || 0)
        if (e.type === 'vyplata') vyplaceno += Number(e.amount || 0)
        if (e.type === 'uklid') hodnota += activityValues.uklid(e.hours || 0)
        else if (e.type !== 'jine') hodnota += activityValues[e.type] || 0
      }

      setSummary({
        hotovost,
        hodnota,
        vyplaceno
      })
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full px-2">
      <div className="colorful-form mb-8">
        <h3>Výpis brigádníků</h3>
        <form>
          <label>Vyber brigádníka:</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Vyber brigádníka</option>
            {users.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </form>
        {selected && summary && (
          <div style={{marginTop: '1.5rem'}}>
            <label>Souhrn:</label>
            <div style={{marginBottom: '1rem'}}>
              <div style={{color:'#ffd700'}}>💵 Obdržená hotovost: <b>{summary.hotovost} Kč</b></div>
              <div style={{color:'#ffd700'}}>💼 Hodnota práce: <b>{summary.hodnota} Kč</b></div>
              <div style={{color:'#ffd700'}}>✅ Již vyplaceno: <b>{summary.vyplaceno} Kč</b></div>
              <div style={{color:'#00e676', fontWeight:'bold'}}>Zbývá vyplatit: {summary.hodnota - summary.hotovost - summary.vyplaceno} Kč</div>
              {summary.hodnota - summary.hotovost - summary.vyplaceno > 4000 && (
                <div style={{color:'#ff1744', fontWeight:'bold'}}>🔔 POZOR: Dlužíte brigádníkovi více než 4000 Kč!</div>
              )}
            </div>
            <form onSubmit={handlePayoutSubmit}>
              <label>Zadat výplatu:</label>
              <input
                type="number"
                placeholder="Částka k výplatě"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="mb-2"
              />
              <input
                type="text"
                placeholder="Poznámka (nepovinné)"
                value={payoutNote}
                onChange={(e) => setPayoutNote(e.target.value)}
                className="mb-2"
              />
              <button type="submit" className="btn">Vyplatit</button>
              {payoutMessage && <p className="text-sm mt-1">{payoutMessage}</p>}
            </form>
          </div>
        )}
      </div>
      {selected && (
        <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h4 className="text-xl font-semibold mb-4 text-white">Záznamy</h4>
          <ul>
            {records.map((r) => (
              <li
                key={r.id}
                className={`colorful-record ${
                  r.type === 'vyplata' ? 'payout' :
                  r.type === 'bonus' ? 'bonus' :
                  r.type === 'uklid' ? 'uklid' :
                  r.type === 'noshow' ? 'noshow' :
                  r.type === 'lastminute' ? 'lastminute' :
                  r.type === 'hra' ? 'hra' : ''
                }`}
              >
                <span className="record-date">{new Date(r.created_at).toLocaleString()}</span>
                <span className="record-type">{r.type}</span>
                <span className="record-note">{r.note || 'bez poznámky'}</span>
                <span className="record-amount">{r.amount ?? 'žádná částka'} Kč</span>
                <span className="record-payment">({r.payment || 'bez platby'})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
