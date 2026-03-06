"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Radio, Activity, Circle, Target } from "lucide-react"
import { WS_BASE_URL } from '@/lib/api'

export default function LiveMatch() {
    const [messages, setMessages] = useState<any[]>([])
    const [liveScore, setLiveScore] = useState("0/0")
    const [liveOvers, setLiveOvers] = useState("0.0")
    const [probA, setProbA] = useState(50.0)
    const [probB, setProbB] = useState(50.0)
    const [status, setStatus] = useState("Connecting...")

    const ws = useRef<WebSocket | null>(null)
    const retryCount = useRef(0)
    const maxRetries = 5

    const connectWebSocket = useCallback(() => {
        ws.current = new WebSocket(`${WS_BASE_URL}/ws/live`)

        ws.current.onopen = () => {
            setStatus("Connected - Awaiting Match Data")
            retryCount.current = 0
        }

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.match_over) {
                setStatus("Innings Completed.")
                return
            }

            setStatus("LIVE")
            setLiveScore(data.score)
            setLiveOvers(data.overs)
            setProbA(data.live_win_prob_team_a)
            setProbB(data.live_win_prob_team_b)

            setMessages(prev => [data, ...prev].slice(0, 8))
        }

        ws.current.onerror = (err) => {
            console.error(err)
            setStatus("Connection Error")
        }

        ws.current.onclose = () => {
            if (retryCount.current < maxRetries) {
                retryCount.current += 1
                setStatus(`Reconnecting... (${retryCount.current}/${maxRetries})`)
                setTimeout(connectWebSocket, 2000 * retryCount.current)
            } else {
                setStatus("Disconnected - Refresh to retry")
            }
        }
    }, [])

    useEffect(() => {
        connectWebSocket()
        return () => {
            retryCount.current = maxRetries
            ws.current?.close()
        }
    }, [connectWebSocket])

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                    <h2 className="text-4xl font-extrabold flex items-center">
                        <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Live ML Feed</span>
                        <div className={`ml-4 px-3 py-1 text-xs font-bold rounded-full flex items-center space-x-2 ${status === 'LIVE' ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                            {status === 'LIVE' && <Circle className="w-2 h-2 fill-current" />}
                            <span>{status}</span>
                        </div>
                    </h2>
                    <p className="text-slate-400 mt-2 font-medium">Real-time WebSocket connection computing ball-by-ball probability drifts.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Probability & Score */}
                <div className="space-y-6">
                    <Card className="bg-[#131b2f] border-slate-800 shadow-xl overflow-hidden relative border-t-4 border-t-red-500">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-32 h-32" /></div>
                        <CardContent className="pt-6 relative z-10 text-center">
                            <div className="text-sm font-bold text-slate-500 tracking-widest mb-2">TARGET: 180 (T20)</div>
                            <div className="text-6xl font-black text-white">{liveScore}</div>
                            <div className="text-xl font-bold text-slate-400 mt-2">Overs: {liveOvers}</div>

                            <div className="mt-8 space-y-4">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-cyan-400">Team A Win Prob.</span>
                                    <span className="text-yellow-400">Team B Win Prob.</span>
                                </div>
                                <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden flex shadow-inner">
                                    <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full flex items-center px-2 text-[10px] font-bold text-white transition-all duration-700 ease-in-out" style={{ width: `${probA}%` }}>
                                        {probA}%
                                    </div>
                                    <div className="bg-gradient-to-r from-amber-400 to-yellow-600 h-full flex items-center justify-end px-2 text-[10px] font-bold text-black transition-all duration-700 ease-in-out" style={{ width: `${probB}%` }}>
                                        {probB}%
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Ball by Ball Feed */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                        <Radio className="w-5 h-5 text-red-500" />
                        <span>Live Telemetry Stream</span>
                    </h3>
                    <div className="space-y-3">
                        {messages.length === 0 ? (
                            <div className="text-center p-8 text-slate-500 font-mono text-sm border border-slate-800 border-dashed rounded-xl">
                                Establishing socket connection to match server...
                            </div>
                        ) : (
                            messages.map((m, idx) => (
                                <div key={idx} className={`bg-[#1c2438] p-4 rounded-xl border border-slate-700/50 flex items-center space-x-4 transition-all duration-500 ${idx === 0 ? 'bg-slate-800 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'opacity-70'}`}>
                                    <div className="w-12 h-12 shrink-0 rounded-full bg-[#0f172a] shadow-inner flex items-center justify-center font-black border border-slate-700 text-lg">
                                        {m.event === 'W' ? <span className="text-red-500">W</span> :
                                            m.event === 6 ? <span className="text-emerald-400">6</span> :
                                                m.event === 4 ? <span className="text-yellow-500">4</span> :
                                                    <span className="text-slate-300">{m.event}</span>}
                                    </div>
                                    <div>
                                        <div className="text-xs text-cyan-500 font-mono mb-0.5">Over {m.overs} • Score: {m.score}</div>
                                        <div className={`font-medium ${idx === 0 ? 'text-white' : 'text-slate-400'}`}>{m.description}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}
