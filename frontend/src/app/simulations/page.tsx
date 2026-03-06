"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BatteryCharging, Dices, Trophy } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { API_BASE_URL } from '@/lib/api'

export default function MonteCarloPage() {
    const [metadata, setMetadata] = useState<{ cities: string[], venues: string[], teams: string[] }>({ cities: [], venues: [], teams: [] })

    const [formData, setFormData] = useState({
        team1: 'Australia',
        team2: 'India',
        balls: 120,
        simulations: 1000
    })

    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/metadata`)
            .then(res => res.json())
            .then(data => setMetadata(data))
            .catch(console.error)
    }, [])

    const handleSimulate = async () => {
        setLoading(true)
        setResult(null)
        try {
            const response = await fetch(`${API_BASE_URL}/api/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await response.json()
            setResult(data)
        } catch (err) {
            console.error(err)
        }
        setLoading(false)
    }

    // Formatting chart data
    const chartData = []
    if (result && result.sample_progression) {
        const len1 = result.sample_progression.t1.length
        const len2 = result.sample_progression.t2.length
        const maxOvers = Math.max(len1, len2)

        for (let i = 0; i < maxOvers; i++) {
            chartData.push({
                over: i === 0 ? 0 : i * 6,
                [result.team1]: result.sample_progression.t1[i] ?? null,
                [result.team2]: result.sample_progression.t2[i] ?? null
            })
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header>
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-fuchsia-400 to-indigo-500 bg-clip-text text-transparent">Monte Carlo Match Simulator</h2>
                <p className="text-slate-400 mt-2 font-medium">Predicting outcomes by literally playing thousands of algorithmic matches ball-by-ball using probability distributions.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-6">

                    <Card className="bg-[#131b2f] border-slate-800 shadow-xl shadow-fuchsia-900/10">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-white">
                                <Dices className="w-5 h-5 text-fuchsia-400" />
                                <span>Simulation Rules</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team A</label>
                                <select
                                    className="w-full bg-[#1c2438] border border-slate-700/50 rounded-lg p-3 text-white focus:ring-1 focus:ring-fuchsia-500 outline-none"
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
                                    className="w-full bg-[#1c2438] border border-slate-700/50 rounded-lg p-3 text-white focus:ring-1 focus:ring-fuchsia-500 outline-none"
                                    value={formData.team2}
                                    onChange={e => setFormData({ ...formData, team2: e.target.value })}
                                >
                                    {metadata.teams.length === 0 && <option value="India">India</option>}
                                    {metadata.teams.map(t => <option key={`t2-${t}`} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Balls</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#1c2438] border border-slate-700/50 rounded-lg p-3 text-white focus:ring-1 focus:ring-fuchsia-500 transition-all outline-none"
                                        value={formData.balls}
                                        onChange={e => setFormData({ ...formData, balls: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulations</label>
                                    <select
                                        className="w-full bg-[#1c2438] border border-slate-700/50 rounded-lg p-3 text-white focus:ring-1 focus:ring-fuchsia-500 transition-all outline-none"
                                        value={formData.simulations}
                                        onChange={e => setFormData({ ...formData, simulations: parseInt(e.target.value) })}
                                    >
                                        <option value={100}>100 x</option>
                                        <option value={500}>500 x</option>
                                        <option value={1000}>1,000 x</option>
                                        <option value={5000}>5,000 x</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleSimulate}
                                disabled={loading}
                                className="w-full mt-4 group bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:shadow-[0_0_30px_rgba(217,70,239,0.4)] transition-all flex justify-center items-center space-x-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" />
                                ) : (
                                    <>
                                        <BatteryCharging className="w-5 h-5 text-fuchsia-200" />
                                        <span>Run Engine</span>
                                    </>
                                )}
                            </button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-8 space-y-6">
                    {!result ? (
                        <Card className="bg-[#131b2f] border-slate-800 shadow-xl h-full flex flex-col items-center justify-center min-h-[400px]">
                            <Dices className="w-24 h-24 mb-6 opacity-10 text-slate-500" />
                            <p className="text-slate-500 font-medium">Ready to randomize multiple universes...</p>
                        </Card>
                    ) : (
                        <>
                            <Card className="bg-[#131b2f] border-slate-800 shadow-xl animate-in zoom-in-95 duration-500">
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-3 gap-8 text-center items-center">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold text-slate-400 tracking-widest uppercase">{result.team1}</h4>
                                            <div className="text-6xl font-black text-white">{result.t1_win_pct}%</div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="text-xs font-bold text-fuchsia-500 tracking-[0.2em] mb-2 uppercase">After {result.total_simulations.toLocaleString()} matches</div>
                                            <div className="text-sm font-mono text-slate-500">Ties: {result.ties_pct}%</div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold text-slate-400 tracking-widest uppercase">{result.team2}</h4>
                                            <div className="text-6xl font-black text-white">{result.t2_win_pct}%</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-[#131b2f] border-slate-800 shadow-xl animate-in slide-in-from-bottom-6 duration-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center space-x-2">
                                        <Trophy className="w-5 h-5 text-yellow-400" />
                                        <span>Sample Match Progression (Simulated)</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                                <XAxis dataKey="over" stroke="#64748b" label={{ value: 'Balls Bowled', position: 'insideBottomRight', offset: -5, fill: '#64748b' }} />
                                                <YAxis stroke="#64748b" label={{ value: 'Runs', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend />
                                                <Line type="monotone" dataKey={result.team1} stroke="#06b6d4" strokeWidth={4} dot={false} activeDot={{ r: 8 }} />
                                                <Line type="monotone" dataKey={result.team2} stroke="#f43f5e" strokeWidth={4} dot={false} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}
