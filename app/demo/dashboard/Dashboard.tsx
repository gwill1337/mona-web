"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceDot, Legend,
} from "recharts";
import {
    Activity, AlertTriangle,
    Clock, Cpu, MemoryStick, RefreshCw,
    Server,
} from "lucide-react";
import { formatTime, getDeviceColor, getUrlDevices, setUrlDevices, toBucket, parseTs } from "@/utils/demo/helpers";
import { DeviceSelector } from "@/components/demo/DeviceSelector";
import { PeriodSelector } from "@/components/demo/PeriodSelector";
import { StatCard } from "@/components/demo/StatCard";
import { ChartTooltip } from "@/utils/demo/toolTip";
import { ModelPanel } from "@/components/demo/ModelPanel";
import { AnomalyFeed } from "@/components/demo/AnomalyFeed";
import { DashboardData, Device, MetricPoint } from "@/types/demo/DemoTypes";
import { apiFetch } from "@/utils/demo/api";
import { useSearchParams } from "next/navigation";

const fmtTick = (ts: number, hours: number) => {
    const d = new Date(ts);
    return hours === 0 || hours > 24
        ? d.toLocaleString(undefined, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
        : d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

export function Dashboard() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [hours, setHours] = useState(1);
    const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);
    const [demoConfig, setDemoConfig] = useState<{ seed: string; anchor: number } | null>(null);

    const searchParams = useSearchParams();
    const deviceParam = searchParams.get("device");

    const initializedRef = useRef(false);

    const deviceColorMap: Record<string, string> = {};
    devices.forEach((d, i) => {
        deviceColorMap[d.name] = getDeviceColor(i);
    });

    useEffect(() => {
        if (!initializedRef.current || devices.length === 0) return;

        const fromUrl = getUrlDevices().filter((n) => devices.some((d) => d.name === n));

        if (deviceParam === "") {
            setSelectedDevices([]);
        } else if (fromUrl.length > 0) {
            setSelectedDevices(fromUrl);
        } else {
            setSelectedDevices(devices.map((d) => d.name));
        }
    }, [deviceParam, devices]);

    useEffect(() => {
        const seedKey = "mona-demo-seed";
        const anchorKey = "mona-demo-anchor";

        let seed = localStorage.getItem(seedKey);

        if (!seed) {
            seed = crypto.randomUUID();
            localStorage.setItem(seedKey, seed);
        }

        let anchor = Number(localStorage.getItem(anchorKey));

        if (!anchor || !Number.isFinite(anchor)) {
            anchor = Math.floor(Date.now() / (5 * 60_000)) * (5 * 60_000);
            localStorage.setItem(anchorKey, String(anchor));
        }

        setDemoConfig({ seed, anchor });
    }, []);

    const handleSetSelected = useCallback((next: string[]) => {
        setSelectedDevices(next);

        if (next.length === devices.length && devices.length > 0) {
            setUrlDevices([]);
        } else if (next.length === 0) {
            const url = new URL(window.location.href);
            url.searchParams.set("device", "");
            window.history.replaceState({}, "", url.toString());
        } else {
            setUrlDevices(next);
        }
    }, [devices]);

    const fetchDevices = useCallback(async () => {
        try {
            const list: Device[] = await apiFetch("/devices");
            setDevices(list);

            if (!initializedRef.current) {
                initializedRef.current = true;
                const fromUrl = getUrlDevices();
                const valid = fromUrl.filter((n) => list.some((d) => d.name === n));
                const hasParam = window.location.search.includes("device=");

                if (hasParam && fromUrl.length === 0) {
                    setSelectedDevices([]);
                } else if (valid.length > 0) {
                    setSelectedDevices(valid);
                    setUrlDevices(valid);
                } else {
                    const all = list.map((d) => d.name);
                    setSelectedDevices(all);
                    setUrlDevices([]);
                }
            } else {
                setSelectedDevices((prev) => {
                    const kept = prev.filter((n) => list.some((d) => d.name === n));
                    return kept.length > 0 ? kept : list.map((d) => d.name);
                });
            }
        } catch { }
    }, []);

    const fetchDashboard = useCallback(async () => {
        if (!demoConfig) return;

        try {
            const params = new URLSearchParams();
            params.set("seed", demoConfig.seed);
            params.set("anchor", String(demoConfig.anchor));

            if (customRange) {
                params.set("start", customRange.start);
                params.set("end", customRange.end);
            } else {
                params.set("hours", String(hours));
            }

            const d = await apiFetch<DashboardData>(`/dashboard?${params.toString()}`);
            setData(d);
        } catch { }
    }, [hours, customRange, demoConfig]);

    const fetchAll = useCallback(async () => {
        if (!demoConfig) return;

        await fetchDashboard();
        setLastFetched((prev) => prev ?? new Date());
        setLoading(false);
    }, [fetchDashboard, demoConfig]);

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    useEffect(() => {
        if (!demoConfig) return;

        setLoading(true);
        fetchAll();
    }, [fetchAll, demoConfig]);

    const filteredMetrics = (data?.metrics ?? []).filter((m) =>
        selectedDevices.includes(m.device)
    );

    const timelineMap = new Map<number, Record<string, number>>();
    filteredMetrics.forEach((m) => {
        const ts = toBucket(m.timestamp);
        const row = timelineMap.get(ts) ?? { ts };
        row[`${m.device}__cpu`] = m.cpu;
        row[`${m.device}__ram`] = m.ram;
        timelineMap.set(ts, row);
    });

    const chartData = [...timelineMap.values()].sort((a, b) => a.ts - b.ts);

    const filteredAnomalies = (data?.anomalies ?? []).filter((a) =>
        selectedDevices.includes(a.device)
    );

    const latestPerDevice: Record<string, MetricPoint> = {};
    filteredMetrics.forEach((m) => {
        if (
            !latestPerDevice[m.device] ||
            parseTs(m.timestamp) > parseTs(latestPerDevice[m.device].timestamp)
        ) {
            latestPerDevice[m.device] = m;
        }
    });

    const avgCpu = Object.values(latestPerDevice).length > 0
        ? Object.values(latestPerDevice).reduce((s, m) => s + m.cpu, 0) / Object.values(latestPerDevice).length
        : null;

    const avgRam = Object.values(latestPerDevice).length > 0
        ? Object.values(latestPerDevice).reduce((s, m) => s + m.ram, 0) / Object.values(latestPerDevice).length
        : null;

    const periodLabel = hours === 0 ? "all time" : hours < 24 ? `${hours}h` : `${hours / 24}d`;

    const renderAnomalyDots = (field: "cpu" | "ram") =>
        filteredAnomalies.map((a) => (
            <ReferenceDot
                key={`${a.id}-${field}`}
                x={toBucket(a.timestamp)}
                y={field === "cpu" ? a.cpu : a.ram}
                r={5}
                fill="#f87171"
                stroke="#450a0a"
                strokeWidth={1.5}
            />
        ));

    const xAxisProps = {
        dataKey: "ts",
        type: "number" as const,
        scale: "time" as const,
        domain: ["dataMin", "dataMax"] as [string, string],
        tickFormatter: (ts: number) => fmtTick(ts, hours),
        tick: { fontSize: 10, fill: "#475569" },
        tickLine: false,
        axisLine: false,
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col md:flex-row relative">
            <main className="flex-1 px-6 py-8 w-full">
                <div className="max-w-7xl mx-auto mt-5">
                    <header className="flex flex-wrap items-center gap-3 mb-8">
                        <div className="flex items-center gap-2 mr-2">
                            <Activity size={17} color="white" />
                            <h1 className="text-base font-bold tracking-tight text-white">Monitoring</h1>
                        </div>

                        <DeviceSelector
                            devices={devices}
                            selected={selectedDevices}
                            onChange={handleSetSelected}
                            deviceColorMap={deviceColorMap}
                        />

                        <PeriodSelector
                            value={hours}
                            customRange={customRange}
                            onChange={(newHours, newCustom) => {
                                setHours(newHours);
                                setCustomRange(newCustom || null);
                            }}
                        />

                        <div className="flex-1" />

                        {lastFetched && (
                            <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
                                <Clock size={12} />
                                {lastFetched.toLocaleTimeString()}
                            </span>
                        )}

                        <button
                            onClick={() => {
                                fetchDevices();
                                fetchAll();
                            }}
                            className="p-2 rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </header>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        <StatCard
                            label="Avg CPU"
                            value={avgCpu != null ? `${avgCpu.toFixed(1)}%` : "—"}
                            icon={<Cpu size={15} />}
                            accent={avgCpu != null && avgCpu > 80 ? "text-red-400" : avgCpu != null && avgCpu > 60 ? "text-amber-400" : "text-white"}
                        />
                        <StatCard
                            label="Avg RAM"
                            value={avgRam != null ? `${avgRam.toFixed(1)}%` : "—"}
                            icon={<MemoryStick size={15} />}
                            accent={avgRam != null && avgRam > 85 ? "text-red-400" : avgRam != null && avgRam > 70 ? "text-amber-400" : "text-white"}
                        />
                        <StatCard
                            label="Anomalies"
                            value={filteredAnomalies.length}
                            sub={`in ${periodLabel}`}
                            icon={<AlertTriangle size={15} />}
                            accent={filteredAnomalies.length > 0 ? "text-amber-400" : "text-white"}
                        />
                        <StatCard
                            label="Devices"
                            value={`${selectedDevices.length} / ${devices.length}`}
                            sub="selected / total"
                            icon={<Server size={15} />}
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_330px] gap-5">
                        <div className="space-y-5">
                            <div className="rounded-2xl border border-slate-700/40 bg-gray-400/5 p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Cpu size={14} className="text-cyan-400" />
                                    <h2 className="text-sm font-semibold text-white">CPU usage</h2>
                                    {filteredAnomalies.length > 0 && (
                                        <span className="ml-2 flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                                            {filteredAnomalies.length} anomalies marked
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-500 ml-auto">%</span>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center h-52">
                                        <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                    </div>
                                ) : selectedDevices.length === 0 ? (
                                    <div className="flex items-center justify-center h-52 text-slate-500 text-sm font-medium">Select device</div>
                                ) : chartData.length === 0 ? (
                                    <div className="flex items-center justify-center h-52 text-slate-600 text-sm">No data</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={230}>
                                        <LineChart data={chartData} syncId="sync-charts" margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" />
                                            <XAxis {...xAxisProps} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#475569" }} tickLine={false} axisLine={false} />
                                            <Tooltip content={<ChartTooltip anomalies={filteredAnomalies} />} />
                                            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} formatter={(v) => String(v).replace("__cpu", "")} />
                                            {selectedDevices.map((dev) => (
                                                <Line
                                                    key={`${dev}__cpu`}
                                                    type="monotone"
                                                    dataKey={`${dev}__cpu`}
                                                    name={`${dev}__cpu`}
                                                    stroke={deviceColorMap[dev]}
                                                    strokeWidth={1.5}
                                                    dot={false}
                                                    activeDot={{ r: 3 }}
                                                    connectNulls
                                                />
                                            ))}
                                            {renderAnomalyDots("cpu")}
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-700/40 bg-gray-400/5 p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <MemoryStick size={14} className="text-violet-400" />
                                    <h2 className="text-sm font-semibold text-white">RAM usage</h2>
                                    <span className="text-xs text-slate-500 ml-auto">%</span>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center h-52">
                                        <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                                    </div>
                                ) : selectedDevices.length === 0 ? (
                                    <div className="flex items-center justify-center h-52 text-slate-500 text-sm font-medium">Select device</div>
                                ) : chartData.length === 0 ? (
                                    <div className="flex items-center justify-center h-52 text-slate-600 text-sm">No data</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={230}>
                                        <LineChart data={chartData} syncId="sync-charts" margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" />
                                            <XAxis {...xAxisProps} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#475569" }} tickLine={false} axisLine={false} />
                                            <Tooltip content={<ChartTooltip anomalies={filteredAnomalies} />} />
                                            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} formatter={(v) => String(v).replace("__ram", "")} />
                                            {selectedDevices.map((dev) => (
                                                <Line
                                                    key={`${dev}__ram`}
                                                    type="monotone"
                                                    dataKey={`${dev}__ram`}
                                                    name={`${dev}__ram`}
                                                    stroke={deviceColorMap[dev]}
                                                    strokeWidth={1.5}
                                                    dot={false}
                                                    activeDot={{ r: 3 }}
                                                    connectNulls
                                                />
                                            ))}
                                            {renderAnomalyDots("ram")}
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {Object.keys(latestPerDevice).length > 1 && (
                                <div className="rounded-2xl border border-slate-700/40 bg-gray-400/5 p-5">
                                    <h2 className="text-sm font-semibold text-white mb-4">Latest per device</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {Object.entries(latestPerDevice).map(([name, m]) => {
                                            const color = deviceColorMap[name];

                                            return (
                                                <div key={name} className="rounded-xl border bg-slate-900/60 p-3" style={{ borderColor: `${color}28` }}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                                                        <span className="text-xs font-mono font-semibold" style={{ color }}>{name}</span>
                                                        <span className="text-[10px] text-slate-500 ml-auto font-mono">{formatTime(m.timestamp)}</span>
                                                    </div>

                                                    {(["cpu", "ram"] as const).map((field) => (
                                                        <div key={field} className="mb-1 last:mb-0">
                                                            <div className="flex justify-between mb-0.5">
                                                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{field}</span>
                                                                <span className="text-[10px] font-mono font-bold" style={{ color }}>{m[field].toFixed(1)}%</span>
                                                            </div>
                                                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full transition-all"
                                                                    style={{
                                                                        width: `${m[field]}%`,
                                                                        background: m[field] > (field === "cpu" ? 80 : 85)
                                                                            ? "#f87171"
                                                                            : m[field] > (field === "cpu" ? 60 : 70)
                                                                                ? "#fb923c"
                                                                                : color,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 xl:self-start xl:sticky xl:top-6">
                            <ModelPanel onTrained={fetchAll} />

                            <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle size={14} className="text-amber-400" />
                                    <h2 className="text-sm font-semibold text-white">Anomaly log</h2>
                                    {filteredAnomalies.length > 0 && (
                                        <span className="ml-auto bg-amber-500/15 text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {filteredAnomalies.length}
                                        </span>
                                    )}
                                </div>
                                <AnomalyFeed anomalies={filteredAnomalies} deviceColorMap={deviceColorMap} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}