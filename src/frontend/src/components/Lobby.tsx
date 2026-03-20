import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { ScoreEntry } from "../types/game";

const LIVE_MATCHES = [
  { id: "BR-4821", players: 87, zone: "Phase 2", status: "LIVE" },
  { id: "BR-4822", players: 64, zone: "Phase 1", status: "LIVE" },
  { id: "BR-4819", players: 12, zone: "Phase 3", status: "ENDING" },
  { id: "BR-4820", players: 93, zone: "Phase 1", status: "LIVE" },
];

const UPDATES = [
  {
    date: "Mar 20",
    title: "New Weapon: M79 Grenade Launcher Added",
    tag: "UPDATE",
  },
  {
    date: "Mar 18",
    title: "Safe Zone Timing & Damage Rebalanced",
    tag: "PATCH",
  },
  { date: "Mar 15", title: "Season 3 Battle Pass Now Live", tag: "EVENT" },
  { date: "Mar 12", title: "Anti-Cheat System v2.0 Deployed", tag: "SECURITY" },
];

const TAG_COLORS: Record<string, string> = {
  UPDATE: "#F2A23A",
  PATCH: "#57B8FF",
  EVENT: "#a855f7",
  SECURITY: "#22c55e",
  ENDING: "#C43A2E",
  LIVE: "#22c55e",
};

const NAV_LINK_STYLE = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};

interface LobbyProps {
  onPlay: () => void;
}

export function Lobby({ onPlay }: LobbyProps) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("battlegrounds_scores") || "[]",
    ) as ScoreEntry[];
    setScores(saved.slice(0, 5));
  }, []);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(26,31,29,0.9) 0%, #121816 70%)",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: "rgba(26,31,29,0.97)",
          borderBottom: "1px solid rgba(242,162,58,0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">💀</span>
            <span
              className="font-display text-lg tracking-widest text-primary"
              style={{ textShadow: "0 0 12px rgba(242,162,58,0.5)" }}
            >
              BATTLEGROUNDS ONLINE
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {["MAPS", "COMMUNITY", "SHOP", "RANKINGS"].map((link) => (
              <button
                key={link}
                type="button"
                data-ocid="nav.link"
                className="text-foreground/80 hover:text-primary text-sm font-heading tracking-widest transition-colors duration-150"
                style={NAV_LINK_STYLE}
              >
                {link}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="lobby.play_button"
              onClick={onPlay}
              className="px-5 py-2 text-sm font-display tracking-widest rounded"
              style={{
                background: "#F2A23A",
                color: "#0d1410",
                fontWeight: 700,
                boxShadow: "0 0 16px rgba(242,162,58,0.5)",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              PLAY NOW
            </button>
            <button
              type="button"
              data-ocid="lobby.login_button"
              className="px-4 py-2 text-sm font-heading tracking-widest rounded"
              style={{
                background: "transparent",
                color: "#E9ECEB",
                border: "1px solid rgba(233,236,235,0.25)",
                cursor: "pointer",
                letterSpacing: "0.08em",
              }}
            >
              LOGIN / REGISTER
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <main>
        <section
          className="relative flex flex-col items-center justify-center text-center"
          style={{
            minHeight: "520px",
            background:
              "linear-gradient(180deg, rgba(18,24,22,0) 0%, #121816 100%), " +
              "repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(242,162,58,0.04) 59px, rgba(242,162,58,0.04) 60px), " +
              "repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(242,162,58,0.04) 59px, rgba(242,162,58,0.04) 60px)",
            padding: "80px 24px",
          }}
        >
          {/* Season badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 px-4 py-1 rounded-full"
            style={{
              background: "rgba(242,162,58,0.12)",
              border: "1px solid rgba(242,162,58,0.35)",
              color: "#F2A23A",
              fontSize: 11,
              letterSpacing: "0.2em",
              fontFamily: "Rajdhani, sans-serif",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#F2A23A",
                display: "inline-block",
              }}
            />
            SEASON 3 — OPERATION IRONSTORM
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#E9ECEB",
              textShadow: "0 4px 30px rgba(0,0,0,0.7)",
              marginBottom: 8,
            }}
          >
            LAST ONE
            <br />
            <span
              style={{
                color: "#F2A23A",
                textShadow: "0 0 30px rgba(242,162,58,0.6)",
              }}
            >
              STANDING
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-heading"
            style={{
              color: "rgba(233,236,235,0.6)",
              fontSize: 18,
              letterSpacing: "0.08em",
              maxWidth: 500,
              margin: "0 auto 36px",
              lineHeight: 1.5,
            }}
          >
            100 players. 1 safe zone. Eliminate all enemies or be eliminated.
            The battleground awaits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="flex gap-4 flex-wrap justify-center"
          >
            <button
              type="button"
              data-ocid="lobby.play_button"
              onClick={onPlay}
              className="font-display tracking-widest rounded px-10 py-4 text-base"
              style={{
                background: "#F2A23A",
                color: "#0d1410",
                fontWeight: 700,
                boxShadow:
                  "0 0 30px rgba(242,162,58,0.55), 0 4px 20px rgba(0,0,0,0.5)",
                border: "none",
                cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.04)";
                e.currentTarget.style.boxShadow =
                  "0 0 40px rgba(242,162,58,0.75), 0 4px 20px rgba(0,0,0,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(242,162,58,0.55), 0 4px 20px rgba(0,0,0,0.5)";
              }}
            >
              ▶   PLAY NOW
            </button>
            <button
              type="button"
              className="font-heading tracking-widest rounded px-8 py-4 text-base"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "#E9ECEB",
                border: "1px solid rgba(233,236,235,0.2)",
                cursor: "pointer",
                letterSpacing: "0.12em",
              }}
            >
              HOW TO PLAY
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-14 flex gap-10 justify-center flex-wrap"
          >
            {[
              { label: "ONLINE NOW", value: "8,421" },
              { label: "MATCHES TODAY", value: "24,819" },
              { label: "TOP KILLS", value: "18" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="font-display"
                  style={{ fontSize: 28, color: "#F2A23A", fontWeight: 700 }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    color: "rgba(233,236,235,0.45)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    fontFamily: "Rajdhani, sans-serif",
                    marginTop: 2,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── Info band ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LIVE MATCHES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded p-5"
            style={{
              background: "#1A1F1D",
              border: "1px solid rgba(242,162,58,0.15)",
            }}
          >
            <h2
              className="font-display text-sm mb-4"
              style={{ color: "#F2A23A", letterSpacing: "0.15em" }}
            >
              ◈ LIVE MATCHES
            </h2>
            <div className="space-y-2">
              {LIVE_MATCHES.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div>
                    <div
                      className="font-heading"
                      style={{
                        color: "#E9ECEB",
                        fontSize: 13,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {m.id}
                    </div>
                    <div
                      style={{ color: "rgba(233,236,235,0.4)", fontSize: 11 }}
                    >
                      {m.zone} · {m.players} players
                    </div>
                  </div>
                  <span
                    className="text-xs font-heading tracking-widest px-2 py-0.5 rounded"
                    style={{
                      background: `${TAG_COLORS[m.status] ?? "#888"}22`,
                      color: TAG_COLORS[m.status] ?? "#888",
                      border: `1px solid ${TAG_COLORS[m.status] ?? "#888"}44`,
                    }}
                  >
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* LATEST UPDATES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="rounded p-5"
            style={{
              background: "#1A1F1D",
              border: "1px solid rgba(87,184,255,0.15)",
            }}
          >
            <h2
              className="font-display text-sm mb-4"
              style={{ color: "#57B8FF", letterSpacing: "0.15em" }}
            >
              ◈ LATEST UPDATES
            </h2>
            <div className="space-y-2">
              {UPDATES.map((u) => (
                <div
                  key={u.title}
                  className="py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs font-heading tracking-wider px-1.5 py-0.5 rounded"
                      style={{
                        background: `${TAG_COLORS[u.tag] ?? "#888"}22`,
                        color: TAG_COLORS[u.tag] ?? "#888",
                        fontSize: 9,
                      }}
                    >
                      {u.tag}
                    </span>
                    <span
                      style={{ color: "rgba(233,236,235,0.35)", fontSize: 10 }}
                    >
                      {u.date}
                    </span>
                  </div>
                  <div
                    className="font-heading"
                    style={{ color: "#E9ECEB", fontSize: 13, lineHeight: 1.3 }}
                  >
                    {u.title}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* GLOBAL RANKINGS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="rounded p-5"
            style={{
              background: "#1A1F1D",
              border: "1px solid rgba(196,58,46,0.2)",
            }}
          >
            <h2
              className="font-display text-sm mb-4"
              style={{ color: "#C43A2E", letterSpacing: "0.15em" }}
            >
              ◈ YOUR RANKINGS
            </h2>
            {scores.length === 0 ? (
              <div
                data-ocid="rankings.empty_state"
                className="flex flex-col items-center justify-center py-8"
                style={{ color: "rgba(233,236,235,0.3)", fontSize: 12 }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
                <div
                  className="font-heading tracking-widest"
                  style={{ letterSpacing: "0.12em" }}
                >
                  NO GAMES PLAYED YET
                </div>
                <div style={{ marginTop: 4, fontSize: 11 }}>
                  Play a match to see your stats
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {scores.map((score, i) => (
                  <div
                    key={score.date}
                    data-ocid={`rankings.item.${i + 1}`}
                    className="flex items-center justify-between py-2"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="font-display"
                        style={{
                          color:
                            i === 0
                              ? "#F2A23A"
                              : i === 1
                                ? "#9ca3af"
                                : i === 2
                                  ? "#92400e"
                                  : "rgba(233,236,235,0.4)",
                          fontSize: 14,
                          width: 20,
                        }}
                      >
                        #{i + 1}
                      </span>
                      <div>
                        <div
                          style={{
                            color: score.won ? "#22c55e" : "#C43A2E",
                            fontSize: 11,
                            fontFamily: "Rajdhani",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {score.won ? "✓ VICTORY" : "✗ ELIMINATED"}
                        </div>
                        <div
                          style={{
                            color: "rgba(233,236,235,0.4)",
                            fontSize: 10,
                          }}
                        >
                          {new Date(score.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="font-heading"
                        style={{
                          color: "#F2A23A",
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        {score.kills} KILLS
                      </div>
                      <div
                        style={{ color: "rgba(233,236,235,0.4)", fontSize: 10 }}
                      >
                        {formatTime(score.time)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        {/* ── Feature grid ──────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 pb-16 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              icon: "🗺️",
              title: "DYNAMIC MAPS",
              desc: "Procedurally scattered obstacles, trees, and buildings every match",
            },
            {
              icon: "⚔️",
              title: "10-BOT COMBAT",
              desc: "AI opponents hunt you down with adaptive chase and flanking tactics",
            },
            {
              icon: "🌀",
              title: "SHRINKING ZONE",
              desc: "3-phase safe zone forces players into deadly close-quarters combat",
            },
            {
              icon: "💊",
              title: "LOOT DROPS",
              desc: "Scattered ammo crates and med kits keep every run unpredictable",
            },
            {
              icon: "🎯",
              title: "PRECISION AIM",
              desc: "Mouse-aim system with real-time bullet physics and collisions",
            },
            {
              icon: "🏆",
              title: "LEADERBOARD",
              desc: "Your kill counts and survival times saved locally across sessions",
            },
          ].map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded p-4"
              style={{
                background: "rgba(26,31,29,0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 8 }}>{f.icon}</div>
              <div
                className="font-display text-xs mb-1"
                style={{ color: "#F2A23A", letterSpacing: "0.12em" }}
              >
                {f.title}
              </div>
              <div
                style={{
                  color: "rgba(233,236,235,0.5)",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                {f.desc}
              </div>
            </motion.div>
          ))}
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer
        className="w-full py-8 px-6"
        style={{
          background: "#0e1210",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💀</span>
            <span
              className="font-display text-sm tracking-widest"
              style={{ color: "rgba(233,236,235,0.5)" }}
            >
              BATTLEGROUNDS ONLINE
            </span>
          </div>
          <div
            className="font-heading"
            style={{
              color: "rgba(233,236,235,0.3)",
              fontSize: 12,
              letterSpacing: "0.08em",
            }}
          >
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#F2A23A", textDecoration: "none" }}
            >
              caffeine.ai
            </a>
          </div>
          <div className="flex gap-5">
            {["MAPS", "COMMUNITY", "SHOP", "RANKINGS"].map((link) => (
              <button
                key={link}
                type="button"
                data-ocid="nav.link"
                className="font-heading tracking-widest"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(233,236,235,0.35)",
                  fontSize: 11,
                  padding: 0,
                  transition: "color 0.15s",
                }}
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
