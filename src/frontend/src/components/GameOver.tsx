import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { ScoreEntry } from "../types/game";

interface GameResult {
  kills: number;
  time: number;
  won: boolean;
}

interface GameOverProps {
  result: GameResult;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export function GameOver({
  result,
  onPlayAgain,
  onBackToLobby,
}: GameOverProps) {
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("battlegrounds_scores") || "[]",
    ) as ScoreEntry[];
    setLeaderboard(saved.slice(0, 5));
  }, []);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}m ${s}s`;
  };

  const accent = result.won ? "#22c55e" : "#C43A2E";
  const accentGlow = result.won ? "rgba(34,197,94,0.5)" : "rgba(196,58,46,0.5)";

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-6"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${accentGlow.replace("0.5", "0.12")} 0%, #121816 60%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
        style={{
          background: "#1A1F1D",
          border: `1px solid ${accent}44`,
          borderRadius: 6,
          boxShadow: `0 0 50px ${accentGlow}, 0 20px 60px rgba(0,0,0,0.7)`,
          overflow: "hidden",
        }}
        data-ocid="gameover.panel"
      >
        {/* Header bar */}
        <div
          style={{
            background: `linear-gradient(90deg, ${accent}22, transparent)`,
            borderBottom: `1px solid ${accent}33`,
            padding: "20px 28px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="font-display"
              style={{
                fontSize: 36,
                color: accent,
                fontWeight: 900,
                letterSpacing: "0.1em",
                textShadow: `0 0 20px ${accentGlow}`,
              }}
            >
              {result.won ? "🏆 VICTORY!" : "💀 ELIMINATED"}
            </div>
            <div
              className="font-heading"
              style={{
                color: "rgba(233,236,235,0.5)",
                fontSize: 13,
                letterSpacing: "0.15em",
                marginTop: 4,
              }}
            >
              {result.won
                ? "ALL ENEMIES ELIMINATED — YOU ARE THE LAST ONE STANDING"
                : "YOUR HP REACHED ZERO — BETTER LUCK NEXT TIME"}
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="p-7">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {[
              { label: "KILLS", value: result.kills, color: "#F2A23A" },
              {
                label: "SURVIVAL",
                value: formatTime(result.time),
                color: "#57B8FF",
              },
              {
                label: "RESULT",
                value: result.won ? "WIN" : "LOSS",
                color: accent,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center py-4 rounded"
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="font-display"
                  style={{ fontSize: 26, color: stat.color, fontWeight: 700 }}
                >
                  {stat.value}
                </div>
                <div
                  className="font-heading"
                  style={{
                    color: "rgba(233,236,235,0.4)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    marginTop: 4,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h3
                className="font-display text-xs mb-3"
                style={{ color: "#F2A23A", letterSpacing: "0.18em" }}
              >
                YOUR TOP GAMES
              </h3>
              <div
                className="rounded p-3 space-y-1"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {leaderboard.map((s, i) => (
                  <div
                    key={s.date}
                    data-ocid={`gameover.item.${i + 1}`}
                    className="flex items-center justify-between py-1.5"
                    style={{
                      borderBottom:
                        i < leaderboard.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="font-display"
                        style={{
                          color: i === 0 ? "#F2A23A" : "rgba(233,236,235,0.35)",
                          fontSize: 12,
                          width: 22,
                        }}
                      >
                        #{i + 1}
                      </span>
                      <span
                        style={{
                          color: s.won ? "#22c55e" : "#C43A2E",
                          fontSize: 11,
                          fontFamily: "Rajdhani, sans-serif",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {s.won ? "WIN" : "LOSS"}
                      </span>
                    </div>
                    <div className="flex items-center gap-5">
                      <span
                        className="font-heading"
                        style={{
                          color: "#F2A23A",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {s.kills}K
                      </span>
                      <span
                        style={{
                          color: "rgba(233,236,235,0.35)",
                          fontSize: 11,
                        }}
                      >
                        {formatTime(s.time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-3"
          >
            <button
              type="button"
              data-ocid="gameover.play_again_button"
              onClick={onPlayAgain}
              className="flex-1 py-3 font-display tracking-widest text-sm rounded"
              style={{
                background: "#F2A23A",
                color: "#0d1410",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(242,162,58,0.4)",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ▶ PLAY AGAIN
            </button>
            <button
              type="button"
              data-ocid="gameover.back_button"
              onClick={onBackToLobby}
              className="flex-1 py-3 font-heading tracking-widest text-sm rounded"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "#E9ECEB",
                border: "1px solid rgba(233,236,235,0.15)",
                cursor: "pointer",
                letterSpacing: "0.12em",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
            >
              ← MAIN MENU
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
