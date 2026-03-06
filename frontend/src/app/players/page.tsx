"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import { Activity, Search, User } from "lucide-react"
import { API_BASE_URL } from '@/lib/api'

export default function PlayersPage() {
    const [search, setSearch] = useState('')
    const [playerData, setPlayerData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [errorMSG, setErrorMSG] = useState('')
    const [playersList, setPlayersList] = useState<string[]>([])

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/players_list`)
            .then(res => res.json())
            .then(data => {
                if (data.players) setPlayersList(data.players)
            })
            .catch(() => setErrorMSG('Unable to connect to API. Please ensure the backend is running.'))
    }, [])

    const fetchRealStats = async (name: string) => {
        if (!name.trim()) return;
        setLoading(true)
        setErrorMSG('')
        setPlayerData(null)

        try {
            const response = await fetch(`${API_BASE_URL}/api/players/${encodeURIComponent(name)}`)
            const data = await response.json()

            if (data.error) {
                setErrorMSG(data.error)
            } else {
                setPlayerData(data)
            }
        } catch {
            setErrorMSG('Failed to fetch data from API')
        }

        setLoading(false)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header>
                <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">Player Analysis</h2>
                <p className="text-slate-400 mt-2 font-medium">Deep dive into real database ball-by-ball performance metrics and historical form.</p>
            </header>

            <div className="flex items-center space-x-4 bg-[#131b2f] p-2 rounded-xl border border-slate-700 w-full max-w-xl">
                <Search className="w-5 h-5 text-slate-400 ml-2" />
                <input
                    type="text"
                    list="players-datalist"
                    placeholder="Search or select player..."
                    className="bg-transparent border-none outline-none text-white w-full"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchRealStats(search)}
                />
                <datalist id="players-datalist">
                    {playersList.map((p, idx) => <option key={idx} value={p} />)}
                </datalist>
                <button
                    onClick={() => fetchRealStats(search)}
                    disabled={loading}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center"
                >
                    {loading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mx-2" />
                    ) : "Analyze"}
                </button>
            </div>

            <div className="flex flex-wrap gap-3 pb-4">
                {['Virat Kohli', 'Rohit Sharma', 'MS Dhoni', 'AB de Villiers', 'Chris Gayle', 'Jasprit Bumrah'].map(p => (
                    <button
                        key={p}
                        onClick={() => { setSearch(p); fetchRealStats(p); }}
                        className="whitespace-nowrap bg-slate-800/50 border border-slate-700/50 hover:bg-cyan-500/20 hover:border-cyan-500 hover:text-cyan-400 text-sm text-slate-300 px-4 py-2 rounded-full transition-all"
                    >
                        {p}
                    </button>
                ))}
            </div>

            {errorMSG && <div className="text-rose-400 p-4 border border-rose-900/50 bg-[#1c2438] rounded-xl font-bold">{errorMSG}</div>}

            {playerData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-[#131b2f] border-slate-800 shadow-xl">
                            <CardHeader className="text-center pb-2">
                                <User className="w-16 h-16 mx-auto text-cyan-400 mb-2" />
                                <CardTitle className="text-2xl text-white">{playerData.name}</CardTitle>
                                <p className="text-cyan-500/80 font-mono text-sm leading-tight mt-1">Live Database Match</p>
                            </CardHeader>
                            <CardContent className="space-y-4 mt-4">
                                {/* Batting block */}
                                <div className="bg-[#1c2438] p-4 rounded-xl border border-slate-700/50 shadow-inner">
                                    <div className="text-xs text-slate-400 font-bold mb-3 uppercase tracking-widest border-b border-slate-700/50 pb-2">Batting Metrics</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-[10px] text-slate-500 font-bold mb-1">RUNS</div>
                                            <div className="text-xl font-black text-white">{playerData.runs}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] text-slate-500 font-bold mb-1">STRIKE RATE</div>
                                            <div className="text-xl font-black text-rose-400">{playerData.strikeRate}</div>
                                        </div>
                                        <div className="text-center col-span-2">
                                            <div className="text-[10px] text-slate-500 font-bold mb-1">AVERAGE</div>
                                            <div className="text-lg font-black text-cyan-400">{playerData.average}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bowling block */}
                                <div className="bg-[#1c2438] p-4 rounded-xl border border-slate-700/50 shadow-inner">
                                    <div className="text-xs text-slate-400 font-bold mb-3 uppercase tracking-widest border-b border-slate-700/50 pb-2">Bowling Metrics</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-[10px] text-slate-500 font-bold mb-1">WICKETS</div>
                                            <div className="text-xl font-black text-white">{playerData.wickets !== undefined ? playerData.wickets : 0}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] text-slate-500 font-bold mb-1">ECONOMY</div>
                                            <div className="text-xl font-black text-rose-400">{playerData.economy !== undefined ? playerData.economy : 0}</div>
                                        </div>
                                        <div className="text-center col-span-2">
                                            <div className="text-[10px] text-slate-500 font-bold mb-1">AVERAGE</div>
                                            <div className="text-lg font-black text-cyan-400">{playerData.bowlingAvg !== undefined ? playerData.bowlingAvg : 0}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#131b2f] border-slate-800 shadow-xl hidden lg:block">
                            <CardContent className="pt-6">
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={playerData.radars}>
                                            <PolarGrid stroke="#334155" />
                                            <PolarAngleAxis dataKey="attribute" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                            <Radar name="Attributes" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-[#131b2f] border-slate-800 shadow-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center text-white">
                                    <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                                    Recent Form (Last 5 Formats)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {playerData.formHistory && playerData.formHistory.length > 0 ? (
                                    <div className="h-[300px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={playerData.formHistory}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                                <XAxis dataKey="match" stroke="#64748b" tick={{ fontSize: 12 }} />
                                                <YAxis yAxisId="left" stroke="#06b6d4" />
                                                <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend />
                                                <Line yAxisId="left" type="monotone" dataKey="runs" name="Runs Scored" stroke="#06b6d4" strokeWidth={3} dot={{ r: 6, fill: '#06b6d4' }} />
                                                <Line yAxisId="right" type="monotone" dataKey="sr" name="Strike Rate" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center text-slate-500">
                                        Not enough match data for form history.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>
            )}

        </div>
    )
}
