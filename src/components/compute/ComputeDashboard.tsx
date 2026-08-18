import React, { useState, useEffect } from "react";
import {
  Cpu,
  Zap,
  Activity,
  Server,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Lock,
} from "lucide-react";

interface ComputeDashboardProps {
  credits: number;
  onTopUpCredits: (amount: number) => void;
}

export const ComputeDashboard: React.FC<ComputeDashboardProps> = ({
  credits,
  onTopUpCredits,
}) => {
  const [accountData, setAccountData] = useState<{
    balance: number;
    frozen_balance: number;
  }>({
    balance: credits,
    frozen_balance: 0,
  });

  const [logs, setLogs] = useState<any[]>([]);

  const fetchCreditAccount = async () => {
    try {
      const res = await fetch("/api/v1/credits/account");
      if (res.ok) {
        const data = await res.json();
        if (data.user_credit) {
          setAccountData({
            balance: data.user_credit.balance,
            frozen_balance: data.user_credit.frozen_balance,
          });
        }
        if (data.logs) {
          setLogs(data.logs);
        }
      }
    } catch (e) {
      console.error("Failed to load credit account:", e);
    }
  };

  useEffect(() => {
    fetchCreditAccount();
  }, [credits]);

  const handleTopUp = async (amount: number) => {
    try {
      const res = await fetch("/api/v1/credits/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        const data = await res.json();
        onTopUpCredits(amount);
        fetchCreditAccount();
        alert(`已成功充值加购 ${amount} Credits 算力包！`);
      }
    } catch (e) {
      onTopUpCredits(amount);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Compute Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#16161A] border border-white/10 p-5 rounded-2xl space-y-2 shadow-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>当前账户算力余额</span>
            <Zap className="w-4 h-4 fill-orange-400 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400 font-mono flex items-baseline gap-2">
            <span>{accountData.balance.toLocaleString()}</span>
            <span className="text-xs font-normal text-slate-400">Credits</span>
            {accountData.frozen_balance > 0 && (
              <span className="text-xs text-amber-400 flex items-center gap-1 font-sans">
                <Lock className="w-3 h-3" /> (冻结 {accountData.frozen_balance})
              </span>
            )}
          </div>
          <button
            onClick={() => handleTopUp(5000)}
            className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-medium text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            + 算力加购包 (Top-up 5,000 Credits)
          </button>
        </div>

        <div className="bg-[#16161A] border border-white/10 p-5 rounded-2xl space-y-2 shadow-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>GPU 调度队列状态</span>
            <Activity className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
            High Priority 秒级队列 (实时)
          </div>
          <div className="text-[11px] text-slate-400">平均响应延时: 0.8s (API 直连)</div>
        </div>

        <div className="bg-[#16161A] border border-white/10 p-5 rounded-2xl space-y-2 shadow-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>支持原生模型矩阵</span>
            <Server className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xs font-semibold text-slate-200">
            Seedance 2.5 / 2.0 / CosyVoice / Gemini 3.6
          </div>
          <div className="text-[11px] text-green-400">免本地环境 · 原生多模态音画同生</div>
        </div>
      </div>

      {/* Pricing Rates Table */}
      <div className="bg-[#16161A] border border-white/10 p-5 rounded-2xl space-y-3 shadow-xl">
        <h3 className="font-semibold text-sm text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-orange-400" />
          Seedance 原生模型计费标准
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#0C0C0F] p-3.5 rounded-xl border border-white/10">
            <div className="text-slate-400">三通道剧本结构化拆解</div>
            <div className="font-semibold text-orange-400 mt-1">1 Credit / 次</div>
          </div>

          <div className="bg-[#0C0C0F] p-3.5 rounded-xl border border-white/10">
            <div className="text-slate-400">Seedance 2.5 音画同生镜头</div>
            <div className="font-semibold text-orange-400 mt-1">5 Credits / 镜头</div>
          </div>

          <div className="bg-[#0C0C0F] p-3.5 rounded-xl border border-white/10">
            <div className="text-slate-400">专属音色 Seed 克隆绑定</div>
            <div className="font-semibold text-orange-400 mt-1">1 Credit / 角色</div>
          </div>

          <div className="bg-[#0C0C0F] p-3.5 rounded-xl border border-white/10">
            <div className="text-slate-400">全集音视频一键合成</div>
            <div className="font-semibold text-orange-400 mt-1">10 Credits / 整集</div>
          </div>
        </div>
      </div>

      {/* Consumption Logs */}
      <div className="bg-[#16161A] border border-white/10 p-5 rounded-2xl space-y-3 shadow-xl">
        <h3 className="font-semibold text-sm text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-400" />
          算力变动明细流水 (Credit Logs)
        </h3>

        <div className="space-y-2 text-xs">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-[#0C0C0F] p-3 rounded-xl border border-white/10 flex items-center justify-between text-slate-300"
            >
              <div className="space-y-0.5">
                <div className="font-semibold text-white flex items-center gap-2">
                  {log.description}
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded border font-mono ${
                      log.action_type === "recharge" || log.action_type === "refund"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : log.action_type === "freeze"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    }`}
                  >
                    {log.action_type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  流水 ID: {log.id}
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`font-semibold font-mono ${
                    log.amount > 0 ? "text-green-400" : "text-rose-400"
                  }`}
                >
                  {log.amount > 0 ? `+${log.amount}` : log.amount} Credits
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(log.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
