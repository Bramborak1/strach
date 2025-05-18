import React, { useState } from 'react'
import LoginNamePin from './LoginNamePin'
import EarningsForm from './EarningsForm'
import ChangePin from './ChangePin'
import AdminResetPin from './AdminResetPin'
import DebtStatus from './DebtStatus'
import AdminUserOverview from './AdminUserOverview'
import UserEarningsOverview from './UserEarningsOverview'

function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('earnings')

  const handleLogout = () => {
    setUser(null)
    setActiveTab('earnings')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-md">
          <LoginNamePin onLogin={setUser} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-red-700 p-4 shadow">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 relative">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">Strašáci</h1>
          </div>
          <div className="flex-1 min-w-0 flex justify-end">
            <div className="login-box">
              <span>Přihlášený:</span>
              <strong>{user.name}</strong>
              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                Odhlásit
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="navbar">
        <button
          onClick={() => setActiveTab('earnings')}
          className={`navbar-btn${activeTab === 'earnings' ? ' active' : ''}`}
        >
          Zadat výdělek
        </button>
        <button
          onClick={() => setActiveTab('debt')}
          className={`navbar-btn${activeTab === 'debt' ? ' active' : ''}`}
        >
          Změna PINu
        </button>
        {user.name === 'Milan' && (
          <>
            <button
              onClick={() => setActiveTab('adminReset')}
              className={`navbar-btn${activeTab === 'adminReset' ? ' active' : ''}`}
            >
              Admin: Reset PIN
            </button>
            <button
              onClick={() => setActiveTab('adminOverview')}
              className={`navbar-btn${activeTab === 'adminOverview' ? ' active' : ''}`}
            >
              Admin: Výpis brigádníků
            </button>
          </>
        )}
      </nav>

      {/* Obsah */}
      <main className="flex-grow flex items-center justify-center px-4 py-6">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-4xl">
          {activeTab === 'earnings' && (
            <>
              <EarningsForm user={user} />
              <UserEarningsOverview user={user} />
            </>
          )}
          {activeTab === 'debt' && <DebtStatus user={user} />}
          {activeTab === 'pin' && <ChangePin user={user} />}
          {activeTab === 'adminReset' && user.name === 'Milan' && <AdminResetPin />}
          {activeTab === 'adminOverview' && user.name === 'Milan' && <AdminUserOverview />}
        </div>
      </main>
    </div>
  )
}

export default App
