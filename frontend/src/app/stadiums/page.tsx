"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Search, MapPin, Target, Activity } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import { API_BASE_URL } from '@/lib/api'

export default function StadiumsPage() {
    const [metadata, setMetadata] = useState<{ cities: string[], venues: string[], teams: string[] }>({ cities: [], venues: [], teams: [] })

    const [venue, setVenue] = useState('Dubai International Cricket Stadium')

    const [stadiumData, setStadiumData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [errorMSG, setErrorMSG] = useState('')

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/metadata`)
            .then(res => res.json())
            .then(data => setMetadata(data))
            .catch(console.error)
    }, [])

    const handleAnalyze = async (selected: string = venue) => {
        if (!selected) return
        setLoading(true)
        setErrorMSG('')

        try {
            const response = await fetch(`${API_BASE_URL}/api/stadiums/${encodeURIComponent(selected)}`)
            const data = await response.json()

            if (data.error) {
                setErrorMSG(data.error)
            } else {
                setStadiumData(data)
            }
        } catch (e) {
            console.error(e)
            setErrorMSG("Failed to fetch stadium analytics from API.")
        }
        setLoading(false)
    }

    // Initial fetch when venues metadata loads (optional behavior)
    useEffect(() => {
        if (metadata.venues.length > 0 && !stadiumData && !loading) {
            handleAnalyze(venue)
        }
    }, [metadata.venues])

    const pieColors = ['#06b6d4', '#8b5cf6']
    let pieData: any[] = []
    if (stadiumData) {
        pieData = [
            { name: 'Pace Wickets', value: stadiumData.pace_pct },
            { name: 'Spin Wickets', value: stadiumData.spin_pct }
        ]
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header className="text-center md:text-left">
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Venue & Pitch Intelligence</h2>
                <p className="text-slate-400 mt-2 font-medium">Analyze pitch degradation, average scores, and bowling style effectiveness.</p>
            </header>

            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 bg-[#131b2f] p-4 rounded-xl border border-slate-700 w-full shadow-2xl">
                <div className="w-full relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-emerald-500" />
                    <select
                        className="w-full bg-[#0a0f1d] border border-emerald-500/30 outline-none text-white p-3 pl-10 rounded-lg focus:border-emerald-500 appearance-none"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                    >
                        {metadata.venues.length === 0 && <option value="Dubai International Cricket Stadium">Dubai International Cricket Stadium</option>}
                        {metadata.venues.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                <button
                    onClick={() => handleAnalyze(venue)}
                    disabled={loading}
                    className="w-full md:w-auto px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-3 rounded-lg font-bold flex justify-center items-center shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 whitespace-nowrap"
                >
                    {loading ? <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" /> : <><Search className="w-5 h-5 mr-2" /> Inspect Pitch</>}
                </button>
            </div>

            {errorMSG && <div className="text-rose-400 p-4 border border-rose-900/50 bg-[#1c2438] rounded-xl font-bold text-center">{errorMSG}</div>}

            {stadiumData && (
                <div className="space-y-6 animate-in zoom-in-95 duration-700">
                    {/* AI PITCH REPORT BOX */}
                    <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 p-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500">
                            <Activity className="w-24 h-24" />
                        </div>
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-sm">AI Pitch Analysis</h3>
                        </div>
                        <p className="text-lg text-slate-300 font-medium leading-relaxed relative z-10 w-full max-w-4xl">
                            {stadiumData.ai_pitch_report}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="bg-[#131b2f] border-slate-800 shadow-xl border-t-4 border-t-emerald-500 h-full">
                                <CardHeader className="text-center pb-2">
                                    <MapPin className="w-12 h-12 mx-auto text-emerald-400 mb-2" />
                                    <CardTitle className="text-xl text-white">{stadiumData.venue}</CardTitle>
                                    <div className="text-xs text-slate-500 mt-2">DATABASE SAMPLE: {stadiumData.total_matches > 0 ? `${stadiumData.total_matches} MATCHES` : 'SIMULATED MEDIANS'}</div>
                                </CardHeader>
                                <CardContent className="space-y-4 mt-6">
                                    <div className="bg-[#1c2438] p-4 rounded-xl text-center shadow-inner border border-emerald-900/30">
                                        <div className="text-xs text-emerald-500/80 font-bold mb-1 tracking-widest">AVG 1ST INNINGS SCORE</div>
                                        <div className="text-4xl font-black text-white">{stadiumData.avg_1st_innings}</div>
                                    </div>
                                    <div className="bg-[#1c2438] p-4 rounded-xl text-center shadow-inner border border-emerald-900/30">
                                        <div className="text-xs text-emerald-500/80 font-bold mb-1 tracking-widest">TOSS WINNER VICTORY %</div>
                                        <div className="text-3xl font-black text-emerald-400">{stadiumData.toss_win_pct}%</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-[#131b2f] border-slate-800 shadow-xl h-full">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-white flex items-center space-x-2">
                                        <Target className="w-5 h-5 text-teal-400" />
                                        <span>Bowling Effectiveness (Pace vs Spin)</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col md:flex-row items-center justify-center p-6 space-y-6 md:space-y-0 md:space-x-12">
                                    <div className="w-[300px] h-[300px] shrink-0 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    innerRadius={80}
                                                    outerRadius={120}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                                            <span className="text-3xl font-black text-white">{stadiumData.pace_pct > stadiumData.spin_pct ? "PACE" : "SPIN"}</span>
                                            <span className="text-xs text-slate-500 font-bold tracking-widest">DOMINANT</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex-1 w-full max-w-sm">
                                        <div className="bg-[#1c2438] p-4 rounded-xl shadow-inner border-l-4 border-l-[#06b6d4]">
                                            <div className="text-xs text-slate-400 font-bold mb-1">PACE WICKETS</div>
                                            <div className="text-2xl font-black text-white">{stadiumData.pace_pct}%</div>
                                            <p className="text-xs text-slate-500 mt-2">Fast bowlers derive movement off the seam at this ground.</p>
                                        </div>
                                        <div className="bg-[#1c2438] p-4 rounded-xl shadow-inner border-l-4 border-l-[#8b5cf6]">
                                            <div className="text-xs text-slate-400 font-bold mb-1">SPIN WICKETS</div>
                                            <div className="text-2xl font-black text-white">{stadiumData.spin_pct}%</div>
                                            <p className="text-xs text-slate-500 mt-2">Turn heavily influences the middle overs on this deteriorating deck.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
