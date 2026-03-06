"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Search, Swords, User } from "lucide-react"
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { API_BASE_URL } from '@/lib/api'

export default function VersusPage() {
    const [p1Search, setP1Search] = useState('Rohit Sharma')
    const [p2Search, setP2Search] = useState('Mitchell Starc')

    const [p1Data, setP1Data] = useState<any>(null)
    const [p2Data, setP2Data] = useState<any>(null)
    const [h2hData, setH2hData] = useState<any>(null)

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

    const handleFight = async () => {
        if (!p1Search.trim() || !p2Search.trim()) return
        setLoading(true)
        setErrorMSG('')

        try {
            const [p1Res, p2Res, h2hRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/players/${encodeURIComponent(p1Search)}`),
                fetch(`${API_BASE_URL}/api/players/${encodeURIComponent(p2Search)}`),
                fetch(`${API_BASE_URL}/api/versus/${encodeURIComponent(p1Search)}/${encodeURIComponent(p2Search)}`)
            ])

            const p1Json = await p1Res.json()
            const p2Json = await p2Res.json()
            const h2hJson = await h2hRes.json()

            if (p1Json.error || p2Json.error || h2hJson.error) {
                setErrorMSG(p1Json.error || p2Json.error || h2hJson.error)
            } else {
                setP1Data(p1Json)
                setP2Data(p2Json)
                setH2hData(h2hJson)
            }
        } catch {
            setErrorMSG("Failed to fetch versus data from API.")
        }
        setLoading(false)
    }

    // Combine radars
    let radarData: any[] = []
    if (p1Data && p2Data) {
        const attrs = ['Power', 'Consistency', 'Bowling Threat', 'Pace Play', 'Spin Play']
        radarData = attrs.map(attr => {
            const p1Point = p1Data.radars.find((r: any) => r.attribute === attr)?.A || 0
            const p2Point = p2Data.radars.find((r: any) => r.attribute === attr)?.A || 0
            return {
                attribute: attr,
                [p1Data.name]: p1Point,
                [p2Data.name]: p2Point
            }
        })
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header className="text-center md:text-left">
                <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-rose-400 to-orange-500 bg-clip-text text-transparent">Head-to-Head Clash</h2>
                <p className="text-slate-400 mt-2 font-medium">Direct matchups, historical dismissals, and overlapping stat radars.</p>
            </header>

            <div className="bg-[#131b2f] p-6 rounded-xl border border-slate-700 w-full shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-3.5 w-5 h-5 text-cyan-500" />
                        <input
                            list="vs-players"
                            className="w-full bg-[#0a0f1d] border border-cyan-500/30 outline-none text-white p-3 pl-10 rounded-lg focus:border-cyan-500"
                            placeholder="Search or select Player 1..."
                            value={p1Search}
                            onChange={(e) => setP1Search(e.target.value)}
                        />
                        <datalist id="vs-players">
                            {playersList.map((p, idx) => <option key={idx} value={p} />)}
                        </datalist>
                    </div>
                    <div className="md:col-span-1 text-center font-black text-rose-500 text-2xl italic">VS</div>
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-3.5 w-5 h-5 text-blue-500" />
                        <input
                            list="vs-players"
                            className="w-full bg-[#0a0f1d] border border-blue-500/30 outline-none text-white p-3 pl-10 rounded-lg focus:border-blue-500"
                            placeholder="Search or select Player 2..."
                            value={p2Search}
                            onChange={(e) => setP2Search(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    onClick={handleFight}
                    disabled={loading}
                    className="w-full mt-6 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white p-3 rounded-lg font-bold flex justify-center items-center shadow-[0_0_15px_rgba(225,29,72,0.3)] disabled:opacity-50"
                >
                    {loading ? <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" /> : <><Swords className="w-5 h-5 mr-2" /> ENGAGE BATTLE</>}
                </button>
            </div>

            {errorMSG && <div className="text-rose-400 p-4 border border-rose-900/50 bg-[#1c2438] rounded-xl font-bold text-center">{errorMSG}</div>}

            {h2hData && p1Data && p2Data && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in zoom-in-95 duration-700">
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="bg-[#131b2f] border-slate-800 shadow-xl border-t-4 border-t-cyan-500">
                            <CardHeader className="text-center pb-2">
                                <User className="w-12 h-12 mx-auto text-cyan-400 mb-2" />
                                <CardTitle className="text-xl text-white">{p1Data.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-[#1c2438] p-4 rounded-xl text-center shadow-inner">
                                    <div className="text-xs text-slate-400 font-bold mb-1">CAREER RUNS</div>
                                    <div className="text-2xl font-black text-white">{p1Data.runs}</div>
                                </div>
                                <div className="bg-[#1c2438] p-4 rounded-xl text-center shadow-inner">
                                    <div className="text-xs text-slate-400 font-bold mb-1">CAREER WICKETS</div>
                                    <div className="text-2xl font-black text-cyan-400">{p1Data.wickets}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-gradient-to-br from-slate-800 to-[#131b2f] p-6 rounded-xl border border-slate-700 shadow-2xl relative overflow-hidden text-center">
                            <div className="absolute -right-4 -top-4 opacity-5"><Swords className="w-32 h-32 text-white" /></div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{p1Data.name} vs {p2Data.name}&apos;s Bowling</div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <div className="text-[10px] text-slate-500 font-bold">RUNS</div>
                                    <div className="text-xl font-black text-cyan-400">{h2hData.p1_vs_p2.runs}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 font-bold">BALLS</div>
                                    <div className="text-xl font-black text-white">{h2hData.p1_vs_p2.balls}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 font-bold">OUTS</div>
                                    <div className="text-xl font-black text-rose-500">{h2hData.p1_vs_p2.outs}</div>
                                </div>
                                <div className="col-span-3 text-center mt-2 border-t border-slate-700/50 pt-2">
                                    <span className="text-[10px] text-slate-500 font-bold mr-2">STRIKE RATE</span>
                                    <span className="text-lg font-black text-cyan-400">{h2hData.p1_vs_p2.strikeRate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-[#131b2f] rounded-xl border border-slate-800 shadow-xl flex items-center justify-center min-h-[400px]">
                        <div className="w-full h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="attribute" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                    <Legend />
                                    <Radar name={p1Data.name} dataKey={p1Data.name} stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} />
                                    <Radar name={p2Data.name} dataKey={p2Data.name} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <Card className="bg-[#131b2f] border-slate-800 shadow-xl border-t-4 border-t-blue-500">
                            <CardHeader className="text-center pb-2">
                                <User className="w-12 h-12 mx-auto text-blue-400 mb-2" />
                                <CardTitle className="text-xl text-white">{p2Data.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-[#1c2438] p-4 rounded-xl text-center shadow-inner">
                                    <div className="text-xs text-slate-400 font-bold mb-1">CAREER RUNS</div>
                                    <div className="text-2xl font-black text-white">{p2Data.runs}</div>
                                </div>
                                <div className="bg-[#1c2438] p-4 rounded-xl text-center shadow-inner">
                                    <div className="text-xs text-slate-400 font-bold mb-1">CAREER WICKETS</div>
                                    <div className="text-2xl font-black text-blue-400">{p2Data.wickets}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-gradient-to-bl from-slate-800 to-[#131b2f] p-6 rounded-xl border border-slate-700 shadow-2xl relative overflow-hidden text-center">
                            <div className="absolute -left-4 -top-4 opacity-5"><Swords className="w-32 h-32 text-white" /></div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{p2Data.name} vs {p1Data.name}&apos;s Bowling</div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <div className="text-[10px] text-slate-500 font-bold">RUNS</div>
                                    <div className="text-xl font-black text-blue-400">{h2hData.p2_vs_p1.runs}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 font-bold">BALLS</div>
                                    <div className="text-xl font-black text-white">{h2hData.p2_vs_p1.balls}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 font-bold">OUTS</div>
                                    <div className="text-xl font-black text-rose-500">{h2hData.p2_vs_p1.outs}</div>
                                </div>
                                <div className="col-span-3 text-center mt-2 border-t border-slate-700/50 pt-2">
                                    <span className="text-[10px] text-slate-500 font-bold mr-2">STRIKE RATE</span>
                                    <span className="text-lg font-black text-blue-400">{h2hData.p2_vs_p1.strikeRate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
