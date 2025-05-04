import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function DebtStatus({ user }) {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  const activityValues = {
    hra: 600,
    lastminute: 700,
    noshow: 200,
    uklid: (hours) => hours * 50,
    bonus: 1000,
    jine: 0 // "Jiné" mají odměnu zadávanou ručně = už zahrnuta v amount
  }

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .eq('user_name', user.name)

      if (error) {
        setError('Chyba při načítání záznamů.')
        return
      }

      let hotovost = 0
      let hodnotaPrace = 0

      for (const entry of data) {
        if (entry.payment === 'hotove') {
          hotovost += Number(entry.amount) || 0
        }

        if (entry.type === 'uklid') {
          hodnotaPrace += activityValues.uklid(entry.hours || 0)
        } else if (entry.type === 'jine') {
          // Hodnota práce z amount (již zadána), nepočítáme ji zde
        } else {
          hodnotaPrace += activityValues[entry.type] || 0
        }
      }

      setSummary({
        hotovost,
        hodnotaPrace,
        rozdil: hotovost - hodnotaPrace
      })
    }

    load()
  }, [user.id])

  if (error) return <p className="text-red-500 text-center">Chyba: {error}</p>
  if (!summary) return <p className="text-white text-center">Načítám data...</p>

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 px-8 bg-gray-800 rounded-lg shadow-lg">
      <div className="colorful-summary">
        <div className="summary-label" style={{fontSize: '1.2rem', marginBottom: '0.7rem'}}>💰 Přehled peněz</div>
        <div className="summary-label">Obdržená hotovost:</div>
        <div className="summary-value">{summary.hotovost} Kč</div>
        <div className="summary-label" style={{marginTop: '0.7rem'}}>Celková hodnota práce:</div>
        <div className="summary-value">{summary.hodnotaPrace} Kč</div>
        <div className={`summary-diff ${summary.rozdil > 0 ? 'positive' : summary.rozdil < 0 ? 'negative' : 'zero'}`}
             style={{marginTop: '1.1rem'}}>
          {summary.rozdil > 0
            ? `Je potřeba odevzdat firmě: ${summary.rozdil} Kč`
            : summary.rozdil < 0
            ? `Firma ti dluží: ${Math.abs(summary.rozdil)} Kč`
            : 'Vše vyrovnáno'}
        </div>
      </div>
    </div>
  )
}
