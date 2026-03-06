"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BatteryCharging, Trophy } from "lucide-react"
import { API_BASE_URL } from '@/lib/api'

export default function Page() {
  const [metadata, setMetadata] = useState<{ cities: string[], venues: string[], teams: string[] }>({ cities: [], venues: [], teams: [] })

  const [formData, setFormData] = useState({
    city: 'Dubai',
    venue: 'Dubai International Cricket Stadium',
    team1: 'Australia',
    team2: 'India',
    toss_winner: 'India',
    toss_decision: 'field',
    match_type: 'T20'
  })

  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<{
    prediction: string,
    win_probability: Record<string, number>
  } | null>(null)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/metadata`)
      .then(res => res.json())
      .then(data => {
        setMetadata(data)
      })
      .catch(() => setApiError('Unable to connect to API. Please ensure the backend is running.'))
  }, [])

  const handlePredict = async () => {
    setLoading(true)
    setApiError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      setPrediction(data)
    } catch {
      setApiError('Prediction failed. Backend may be unavailable.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">Match Predictor AI</h2>
        <p className="text-slate-400 mt-2 font-medium">Configure match state & pitch attributes to generate machine learning winning probabilities.</p>
      </header>

      {apiError && (
        <div className="text-rose-400 p-4 border border-rose-900/50 bg-[#1c2438] rounded-xl font-bold text-center animate-in fade-in duration-300">{apiError}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">

          <Card className="bg-[#131b2f] border-slate-800 shadow-xl shadow-cyan-900/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>Match Teams</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team A</label>
                <select
                  className="w-full bg-[#1c2438] border border-slate-700/50 rounded-lg p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                  value={formData.team1}
                  onChange={e => setFormData({ ...formData, team1: e.target.value })}
                >
                  {metadata.teams.length === 0 && <option value="Australia">Australia</option>}
                  {metadata.teams.map(t => <option key={`t1-${t}`} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team B</label>
                <select
                  className="w-full bg-[#1c2438] border border-slate-700/50 rounded-lg p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                  value={formData.team2}
                  onChange={e => setFormData({ ...formData, team2: e.target.value })}
                >
                  {metadata.teams.length === 0 && <option value="India">India</option>}
                  {metadata.teams.map(t => <option key={`t2-${t}`} value={t}>{t}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#131b2f] border-slate-800 shadow-xl shadow-cyan-900/10">
            <CardHeader>
              <CardTitle className="text-white">Stadium & Toss</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Format</label>
                  <select
                    className="w-full bg-[#1c2438] border border-slate-700 rounded-lg p-3 text-white outline-none focus:ring-1 focus:ring-cyan-500"
                    value={formData.match_type}
                    onChange={e => setFormData({ ...formData, match_type: e.target.value })}
                  >
                    <option value="T20">T20 / IT20</option>
                    <option value="ODI">ODI</option>
                    <option value="Test">Test</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">City</label>
                  <select
                    className="w-full bg-[#1c2438] border border-slate-700 rounded-lg p-3 text-white outline-none focus:ring-1 focus:ring-cyan-500"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  >
                    {metadata.cities.length === 0 && <option value="Dubai">Dubai</option>}
                    {metadata.cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Venue / Stadium</label>
                  <select
                    className="w-full bg-[#1c2438] border border-slate-700 rounded-lg p-3 text-white outline-none focus:ring-1 focus:ring-cyan-500"
                    value={formData.venue}
                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                  >
                    {metadata.venues.length === 0 && <option value="Dubai International Cricket Stadium">Dubai International Cricket Stadium</option>}
                    {metadata.venues.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4 sm:pl-6 sm:border-l border-slate-800/80">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toss Winner</label>
                  <select
                    className="w-full bg-[#1c2438] border border-slate-700 rounded-lg p-3 text-white outline-none focus:ring-1 focus:ring-cyan-500"
                    value={formData.toss_winner}
                    onChange={e => setFormData({ ...formData, toss_winner: e.target.value })}
                  >
                    <option value={formData.team1}>{formData.team1}</option>
                    <option value={formData.team2}>{formData.team2}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toss Decision</label>
                  <select
                    className="w-full bg-[#1c2438] border border-slate-700 rounded-lg p-3 text-white outline-none focus:ring-1 focus:ring-cyan-500"
                    value={formData.toss_decision}
                    onChange={e => setFormData({ ...formData, toss_decision: e.target.value })}
                  >
                    <option value="bat">Bat First</option>
                    <option value="field">Bowl First</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all flex justify-center items-center space-x-2 disabled:opacity-50 tracking-wide"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" />
            ) : (
              <>
                <BatteryCharging className="w-5 h-5 text-cyan-200" />
                <span>Run Advanced Prediction</span>
              </>
            )}
          </button>

        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-gradient-to-b from-[#131b2f] to-[#0c111e] border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 rounded-full blur-3xl" />

            <CardHeader>
              <CardTitle className="text-center text-slate-300">Live AI Win Probability</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[300px] relative z-10">
              {!prediction ? (
                <div className="text-slate-600 text-center flex flex-col items-center">
                  <Trophy className="w-16 h-16 mb-4 opacity-50" />
                  <p>Awaiting match telemetry...</p>
                </div>
              ) : (
                <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                  {/* Prediction Winner Highlight */}
                  <div className="text-center">
                    <div className="text-xs font-bold text-cyan-500 tracking-[0.2em] mb-2">FAVORITE TO WIN</div>
                    <div className="text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                      {prediction.prediction}
                    </div>
                  </div>

                  {/* Team 1 Probability Meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-white">{formData.team1}</span>
                      <span className="text-cyan-400">{prediction.win_probability[formData.team1] || 0}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all duration-1000 ease-out"
                        style={{ width: `${prediction.win_probability[formData.team1] || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Team 2 Probability Meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-white">{formData.team2}</span>
                      <span className="text-blue-500">{prediction.win_probability[formData.team2] || 0}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                        style={{ width: `${prediction.win_probability[formData.team2] || 0}%` }}
                      />
                    </div>
                  </div>

                </div>
              )}
            </CardContent>
          </Card>

          {prediction && (
            <div className="bg-[#1c2438] rounded-xl p-4 border border-rose-900/30">
              <p className="text-xs text-rose-300/80 leading-relaxed font-mono">
                <span className="font-bold text-rose-400">NOTE:</span> Model trained on {'>'} 10,000 matches. Predictions are based on historical venue advantages and toss outcomes up to 2023.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
