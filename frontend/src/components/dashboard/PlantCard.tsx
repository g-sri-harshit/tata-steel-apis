"use client";
import { Activity, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface PlantCardProps {
  plant_id: string;
  failure_probability: number;
  safety_score: number;
  energy_efficiency: number;
  production_rate: number;
  downtime_hours: number;
  status: "NORMAL" | "WARNING" | "CRITICAL";
}

const STATUS_MAP = {
  NORMAL:   { dot: "status-dot-green",  color: "text-green-400",  icon: CheckCircle,    bg: "bg-green-500/10",  border: "border-green-500/20" },
  WARNING:  { dot: "status-dot-amber",  color: "text-amber-400",  icon: AlertTriangle,  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  CRITICAL: { dot: "status-dot-red",    color: "text-red-400",    icon: XCircle,        bg: "bg-red-500/10",    border: "border-red-500/20" },
};

function MiniBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-1.5 bg-surface-50 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function PlantCard(props: PlantCardProps) {
  const { plant_id, failure_probability, safety_score, energy_efficiency, production_rate, downtime_hours, status } = props;
  const cfg = STATUS_MAP[status];
  const StatusIcon = cfg.icon;

  const metrics = [
    { label: "Failure Risk",   value: `${(failure_probability * 100).toFixed(1)}%`, barValue: failure_probability * 100, barColor: failure_probability > 0.6 ? "bg-red-500" : failure_probability > 0.4 ? "bg-amber-500" : "bg-green-500" },
    { label: "Safety Score",   value: `${safety_score.toFixed(1)}`,                 barValue: safety_score,              barColor: safety_score > 80 ? "bg-green-500" : safety_score > 60 ? "bg-amber-500" : "bg-red-500" },
    { label: "Energy Eff.",    value: `${energy_efficiency.toFixed(1)}%`,            barValue: energy_efficiency,         barColor: energy_efficiency > 80 ? "bg-green-500" : energy_efficiency > 65 ? "bg-amber-500" : "bg-red-500" },
  ];

  return (
    <div className={`card-glass rounded-xl p-4 border transition-all duration-200 hover:border-opacity-80 ${cfg.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cfg.dot} />
          <span className="font-semibold text-white text-sm">{plant_id}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.color}`}>
          <StatusIcon size={11} />
          {status}
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2.5 mb-3">
        {metrics.map(m => (
          <div key={m.label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">{m.label}</span>
              <span className="text-xs font-mono font-medium text-white">{m.value}</span>
            </div>
            <MiniBar value={m.barValue} color={m.barColor} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-card-border/30">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-steel-400" />
          <span className="text-xs text-muted-foreground">{production_rate.toFixed(0)} t/day</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {downtime_hours > 0 ? (
            <span className="text-amber-400">{downtime_hours}h downtime</span>
          ) : (
            <span className="text-green-400">No downtime</span>
          )}
        </span>
      </div>
    </div>
  );
}
