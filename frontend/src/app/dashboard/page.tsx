"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PlantCard } from "@/components/dashboard/PlantCard";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { AIAnalysisCard } from "@/components/dashboard/AIAnalysisCard";
import { SensorLineChart, EnergyAreaChart, PlantHealthRadar } from "@/components/charts/Charts";
import { dashboardAPI, maintenanceAPI, liveAPI } from "@/lib/api";
import { DashboardKPIs, Alert } from "@/types";
import {
  ShieldAlert, Zap, Factory, Wrench, AlertTriangle,
  Activity, TrendingDown, Cloud, Gauge, Radio, ChevronUp, ChevronDown,
} from "lucide-react";

const DEMO_ALERT_TYPES = [
  { id: "CRITICAL_FAILURE",  label: "⚙️ Equipment Failure",    plant: "Plant-A" },
  { id: "GAS_LEAK",          label: "☣️ Gas Leak",              plant: "Plant-B" },
  { id: "ENERGY_SURGE",      label: "⚡ Energy Surge",          plant: "Plant-C" },
  { id: "PRODUCTION_HALT",   label: "🏭 Production Halt",       plant: "Plant-D" },
];

function LiveBanner({ events }: { events: any[] }) {
  const critical = events.filter(e => e.severity === "CRITICAL" || e.severity === "HIGH");
  if (critical.length === 0) return null;
  const latest = critical[0];
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 animate-pulse-slow">
      <div className="w-2 h-2 rounded-full bg-red-400 animate-ping flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-red-400 uppercase tracking-wide mr-2">{latest.severity}</span>
        <span className="text-xs text-gray-300 truncate">{latest.message}</span>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0 font-mono">LIVE</span>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return null;
  const pos = delta > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ml-1 ${pos ? "text-green-400" : "text-red-400"}`}>
      {pos ? <ChevronUp size={10} /> : <ChevronDown size={10} />}{Math.abs(delta).toFixed(1)}
    </span>
  );
}

export default function DashboardPage() {
  const [kpis, setKpis]              = useState<DashboardKPIs | null>(null);
  const [timeseries, setTimeseries]  = useState<any>({ plant_series: [], energy_series: [] });
  const [aiAnalysis, setAiAnalysis]  = useState<any>(null);
  const [loading, setLoading]        = useState(true);
  const [aiLoading, setAiLoading]    = useState(false);
  const [refreshing, setRefreshing]  = useState(false);
  const [liveEvents, setLiveEvents]  = useState<any[]>([]);
  const [kpiDeltas, setKpiDeltas]    = useState<Record<string, any>>({});
  const [demoLoading, setDemoLoading]= useState(false);
  const [demoMsg, setDemoMsg]        = useState("");
  const liveTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [kpiRes, tsRes] = await Promise.all([
        dashboardAPI.getKPIs(),
        dashboardAPI.getTimeseries(),
      ]);
      setKpis(kpiRes.data);
      setTimeseries(tsRes.data);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchAI = useCallback(async () => {
    setAiLoading(true);
    try {
      const res = await maintenanceAPI.analyze("ALL");
      setAiAnalysis(res.data);
    } catch (e) {
      console.error("AI analysis error:", e);
    } finally {
      setAiLoading(false);
    }
  }, []);

  const fetchLive = useCallback(async () => {
    try {
      const res = await liveAPI.getDashboard();
      setLiveEvents(res.data.events || []);
      setKpiDeltas(res.data.kpi_deltas || {});
    } catch { /* live feed non-critical */ }
  }, []);

  useEffect(() => {
    fetchData();
    fetchAI();
    fetchLive();
    // Poll live data every 10 seconds
    liveTimer.current = setInterval(fetchLive, 10000);
    return () => { if (liveTimer.current) clearInterval(liveTimer.current); };
  }, [fetchData, fetchAI, fetchLive]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); fetchLive(); };

  const handleDemoAlert = async (alertType: string, plant: string) => {
    setDemoLoading(true);
    setDemoMsg("");
    try {
      const res = await liveAPI.injectAlert(plant, alertType);
      setDemoMsg(`🚨 ${res.data.event?.severity} alert injected into ${plant}`);
      setTimeout(() => fetchLive(), 500);
      setTimeout(() => setDemoMsg(""), 6000);
    } catch {
      setDemoMsg("Failed to inject alert — is backend running?");
    } finally {
      setDemoLoading(false);
    }
  };

  const s = kpis?.summary;
  const radarData = s ? [
    { metric: "Safety",      value: kpiDeltas.safety_score?.value  ?? s.safety_score },
    { metric: "Energy",      value: kpiDeltas.energy_score?.value  ?? s.energy_score },
    { metric: "Production",  value: kpiDeltas.production_kpi?.value ?? s.production_kpi },
    { metric: "Maintenance", value: Math.round((1 - s.downtime_prediction_pct / 100) * 100) },
    { metric: "Reliability", value: Math.round(100 - s.active_alerts * 2) },
  ] : [];

  // Merge static alerts with live events for the alert feed
  const staticAlerts: Alert[] = kpis?.recent_alerts || [];
  const liveAlerts: Alert[]   = liveEvents.map((e, i) => ({
    id:        e.id || `live-${i}`,
    plant:     e.plant || "Unknown",
    unit:      e.unit  || "Unknown",
    type:      e.incident_type || e.type || "Live Alert",
    severity:  e.severity as any,
    risk_score: e.value || 0.75,
    timestamp: e.timestamp,
    resolved:  false,
  }));
  const allAlerts = [...liveAlerts, ...staticAlerts].slice(0, 8);

  return (
    <AppShell>
      <Header
        title="Executive Dashboard"
        subtitle="Real-time plant intelligence overview"
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <div className="p-6 space-y-5 animate-fade-in">

        {/* Live event banner */}
        {liveEvents.length > 0 && <LiveBanner events={liveEvents} />}

        {/* 🔴 Demo Alert Panel */}
        <div className="card-glass rounded-xl p-4 border border-steel-600/30">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Radio size={14} className="text-red-400 animate-pulse" />
              <span className="text-xs font-semibold text-white uppercase tracking-wide">Live Demo</span>
              <span className="text-xs text-muted-foreground">— Inject a scenario:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {DEMO_ALERT_TYPES.map(a => (
                <button
                  key={a.id}
                  onClick={() => handleDemoAlert(a.id, a.plant)}
                  disabled={demoLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20
                             text-red-300 hover:bg-red-500/20 hover:border-red-500/40 transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {a.label}
                </button>
              ))}
            </div>
            {demoMsg && (
              <span className="text-xs text-amber-400 font-medium animate-fade-in">{demoMsg}</span>
            )}
          </div>
        </div>

        {/* KPI Row */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-card rounded-xl animate-pulse" />)}
          </div>
        ) : s && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Downtime Risk"
              value={(kpiDeltas.downtime_risk?.value ?? s.downtime_prediction_pct).toFixed(1)}
              unit="%"
              icon={TrendingDown}
              iconColor="text-red-400"
              status={s.downtime_prediction_pct > 50 ? "critical" : s.downtime_prediction_pct > 30 ? "warning" : "good"}
              subValue={kpiDeltas.downtime_risk ? `${kpiDeltas.downtime_risk.delta > 0 ? "+" : ""}${kpiDeltas.downtime_risk.delta.toFixed(1)}% vs baseline` : "Predicted probability"}
            />
            <MetricCard
              title="Safety Score"
              value={(kpiDeltas.safety_score?.value ?? s.safety_score).toFixed(0)}
              unit="/100"
              icon={ShieldAlert}
              iconColor="text-amber-400"
              status={s.safety_score > 80 ? "good" : s.safety_score > 60 ? "warning" : "critical"}
              subValue={kpiDeltas.safety_score ? `${kpiDeltas.safety_score.delta > 0 ? "+" : ""}${kpiDeltas.safety_score.delta.toFixed(1)} live` : `${s.active_alerts} active alerts`}
            />
            <MetricCard
              title="Energy Score"
              value={(kpiDeltas.energy_score?.value ?? s.energy_score).toFixed(0)}
              unit="/100"
              icon={Zap}
              iconColor="text-green-400"
              status={s.energy_score > 80 ? "good" : s.energy_score > 65 ? "warning" : "critical"}
              subValue={kpiDeltas.energy_score ? `${kpiDeltas.energy_score.delta > 0 ? "+" : ""}${kpiDeltas.energy_score.delta.toFixed(1)} live` : `Savings available`}
            />
            <MetricCard
              title="Production KPI"
              value={(kpiDeltas.production_kpi?.value ?? s.production_kpi).toFixed(1)}
              unit="%"
              icon={Factory}
              iconColor="text-steel-400"
              status={s.production_kpi > 90 ? "good" : s.production_kpi > 75 ? "warning" : "critical"}
              subValue={kpiDeltas.production_kpi ? `${kpiDeltas.production_kpi.delta > 0 ? "+" : ""}${kpiDeltas.production_kpi.delta.toFixed(1)}% vs baseline` : "vs 2,500 t/day target"}
            />
            <MetricCard
              title="Active Alerts"
              value={s.active_alerts + liveAlerts.length}
              icon={AlertTriangle}
              iconColor="text-red-400"
              status={s.active_alerts === 0 && liveAlerts.length === 0 ? "good" : "critical"}
              subValue={liveAlerts.length > 0 ? `+${liveAlerts.length} live` : `${s.critical_incidents} critical`}
            />
            <MetricCard
              title="Overdue Maintenance"
              value={s.overdue_maintenance}
              icon={Wrench}
              iconColor="text-amber-400"
              status={s.overdue_maintenance === 0 ? "good" : s.overdue_maintenance < 5 ? "warning" : "critical"}
              subValue="Tasks requiring attention"
            />
            <MetricCard
              title="CO₂ Emissions"
              value={(s.total_co2_tonnes / 1000).toFixed(1)}
              unit="kt"
              icon={Cloud}
              iconColor="text-gray-400"
              status="neutral"
              subValue="Current period"
            />
            <MetricCard
              title="Plant Health"
              value={Math.round((s.safety_score + s.energy_score) / 2)}
              unit="/100"
              icon={Activity}
              iconColor="text-steel-400"
              status="neutral"
              subValue="Composite score"
            />
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: charts */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card-glass rounded-xl p-5 border border-card-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white">Sensor Timeseries</h3>
                  <p className="text-xs text-muted-foreground">Failure probability & vibration — all plants</p>
                </div>
                <Gauge size={15} className="text-muted-foreground" />
              </div>
              {timeseries.plant_series.length > 0 ? (
                <SensorLineChart data={timeseries.plant_series} height={220} />
              ) : (
                <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
              )}
            </div>

            <div className="card-glass rounded-xl p-5 border border-card-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white">Energy Consumption</h3>
                  <p className="text-xs text-muted-foreground">Total kWh & efficiency ratio</p>
                </div>
                <Zap size={15} className="text-muted-foreground" />
              </div>
              {timeseries.energy_series.length > 0 ? (
                <EnergyAreaChart data={timeseries.energy_series} height={220} />
              ) : (
                <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
              )}
            </div>
          </div>

          {/* Right: alerts + radar */}
          <div className="space-y-5">
            <div className="card-glass rounded-xl p-5 border border-card-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white">Active Alerts</h3>
                  <p className="text-xs text-muted-foreground">
                    {liveAlerts.length > 0
                      ? <span className="text-red-400 font-medium">{liveAlerts.length} live · </span>
                      : null}
                    Sorted by risk score
                  </p>
                </div>
                <span className="badge-critical">{allAlerts.length}</span>
              </div>
              <AlertFeed alerts={allAlerts} />
            </div>

            <div className="card-glass rounded-xl p-5 border border-card-border">
              <h3 className="font-semibold text-white mb-1">Plant Health Radar</h3>
              <p className="text-xs text-muted-foreground mb-3">Multi-domain composite scores</p>
              <PlantHealthRadar data={radarData} height={220} />
            </div>
          </div>
        </div>

        {/* Plant cards */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Plant Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis?.plant_summaries.map(p => <PlantCard key={p.plant_id} {...p} />) || (
              [...Array(4)].map((_, i) => <div key={i} className="h-48 bg-card rounded-xl animate-pulse" />)
            )}
          </div>
        </div>

        {/* AI Analysis */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">AI Analysis</h2>
          {(aiLoading || aiAnalysis) && (
            <AIAnalysisCard
              agent={aiAnalysis?.agent || "MAINTENANCE"}
              response={aiAnalysis?.response || ""}
              confidence={aiAnalysis?.confidence || 0}
              reasoning={aiAnalysis?.reasoning || ""}
              impact={aiAnalysis?.impact || ""}
              loading={aiLoading}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}

