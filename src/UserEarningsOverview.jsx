import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import EarningsForm from './EarningsForm'

export default function UserEarningsOverview({ user }) {
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState(null)

  const loadRecords = async () => {
    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .eq('user_name', user.name)
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
        bonus: 1000
      }

      for (const e of data) {
        if (e.payment === 'hotove') {
          hotovost += Number(e.amount || 0)
        }

        if (e.type === 'vyplata') {
          vyplaceno += Number(e.amount || 0)
        } else if (e.type === 'uklid') {
          hodnota += activityValues.uklid(e.hours || 0)
        } else if (e.type === 'jine') {
          hodnota += Number(e.amount || 0)
        } else {
          hodnota += activityValues[e.type] || 0
        }
      }

      setSummary({
        hotovost,
        hodnota,
        vyplaceno,
        rozdil: hotovost + vyplaceno - hodnota
      })
    }
  }

  useEffect(() => {
    loadRecords()
  }, [user])

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 px-8 bg-gray-800 rounded-lg shadow-lg mt-6">
      <h3 className="text-2xl font-bold mb-4 text-white">Tvé záznamy</h3>

      <EarningsForm user={user} onSubmitted={loadRecords} />

      <button
        onClick={loadRecords}
        className="mb-6 px-4 py-2 bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-400 transition"
      >
        🔄 Obnovit záznamy
      </button>

      {summary && (
        <div className="colorful-summary">
          <div className="summary-label">💵 Obdržená hotovost:</div>
          <div className="summary-value">{summary.hotovost} Kč</div>
          <div className="summary-label" style={{ marginTop: '0.7rem' }}>💼 Hodnota práce:</div>
          <div className="summary-value">{summary.hodnota} Kč</div>
          <div className="summary-label" style={{ marginTop: '0.7rem' }}>✅ Již vyplaceno:</div>
          <div className="summary-value">{summary.vyplaceno} Kč</div>

          <div
            className={`summary-diff ${
              summary.rozdil > 0
                ? 'negative'
                : summary.rozdil < 0
                ? 'positive'
                : 'zero'
            }`}
            style={{ marginTop: '1.1rem' }}
          >
            {summary.rozdil > 0
              ? `🧾 Je třeba odevzdat: ${summary.rozdil} Kč`
              : summary.rozdil < 0
              ? `Firma ti dluží: ${Math.abs(summary.rozdil)} Kč`
              : 'Vše vyrovnáno'}
          </div>
        </div>
      )}

      <div className="w-full">
        <h4 className="text-xl font-semibold mb-4 text-white">Historie všech záznamů</h4>
        <ul>
          {records.map((r) => (
            <li
              key={r.id}
              className={`colorful-record ${
                r.type === 'vyplata'
                  ? 'payout'
                  : r.type === 'bonus'
                  ? 'bonus'
                  : r.type === 'uklid'
                  ? 'uklid'
                  : r.type === 'noshow'
                  ? 'noshow'
                  : r.type === 'lastminute'
                  ? 'lastminute'
                  : r.type === 'hra'
                  ? 'hra'
                  : ''
              }`}
            >
              <span className="record-date">{new Date(r.created_at).toLocaleString()}</span>
              <span className="record-type">{r.type}</span>
              <span className="record-note">{r.note || 'bez poznámky'}</span>
              <span
                className={`record-amount ${
                  Number(r.amount) < 0 ? 'text-red-400 font-bold' : ''
                }`}
              >
                {r.amount ?? 'žádná částka'} Kč
              </span>
              <span className="record-payment">({r.payment || 'bez platby'})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
