"use client";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number;
  trendLabel?: string;
  subValue?: string;
  status?: "good" | "warning" | "critical" | "neutral";
  large?: boolean;
}

const STATUS_CONFIGS = {
  good:     { bg: "from-green-500/10 to-green-500/5",   border: "border-green-500/20",  badge: "bg-green-500/10 text-green-400" },
  warning:  { bg: "from-amber-500/10 to-amber-500/5",   border: "border-amber-500/20",  badge: "bg-amber-500/10 text-amber-400" },
  critical: { bg: "from-red-500/10 to-red-500/5",       border: "border-red-500/20",    badge: "bg-red-500/10 text-red-400" },
  neutral:  { bg: "from-steel-600/10 to-steel-600/5",   border: "border-steel-600/20",  badge: "bg-steel-600/10 text-steel-400" },
};

export function MetricCard({
  title, value, unit, icon: Icon, iconColor = "text-steel-400",
  trend, trendLabel, subValue, status = "neutral", large = false,
}: MetricCardProps) {
  const cfg = STATUS_CONFIGS[status];
  const isPositiveTrend = trend !== undefined && trend > 0;
  const isNeutralTrend  = trend === 0;

  return (
    <div className={`metric-card bg-gradient-to-br ${cfg.bg} border ${cfg.border} rounded-xl ${large ? "p-6" : "p-4"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${cfg.badge}`}>
          <Icon size={large ? 20 : 16} className={iconColor} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            isNeutralTrend ? "text-gray-400 bg-gray-500/10" :
            isPositiveTrend ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
          }`}>
            {isNeutralTrend ? <Minus size={10} /> : isPositiveTrend ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className={`font-bold text-white ${large ? "text-4xl mb-1" : "text-2xl mb-0.5"}`}>
        {value}
        {unit && <span className={`font-normal ml-1 ${large ? "text-xl text-gray-400" : "text-lg text-gray-400"}`}>{unit}</span>}
      </div>

      {/* Title */}
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</div>

      {/* Sub value or trend label */}
      {(subValue || trendLabel) && (
        <div className="mt-2 text-xs text-muted-foreground">
          {subValue && <span>{subValue}</span>}
          {trendLabel && <span className="ml-1 text-gray-500">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
