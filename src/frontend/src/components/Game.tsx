import { useEffect, useRef, useState } from "react";
import { initGameState } from "../hooks/useGame";
import type { BotState, GameState } from "../types/game";

// ─── Constants ───────────────────────────────────────────────────────────────
const CW = 800;
const CH = 600;
const WS = 1500;
const PR = 15;
const BR = 12;
const BLT_R = 4;
const PLAYER_SPD = 180;
const BOT_SPD = 100;
const BULLET_SPD = 400;
const BULLET_LIFE = 0.8;
const BOT_DAMAGE = 25;
const PLAYER_DAMAGE = 20;
const ZONE_DMG = 2;

// ─── Pure helpers ─────────────────────────────────────────────────────────────
function dist2(ax: number, ay: number, bx: number, by: number) {
  return (ax - bx) ** 2 + (ay - by) ** 2;
}

function ccCollide(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
) {
  return dist2(ax, ay, bx, by) < (ar + br) ** 2;
}

function crCollide(
  cx: number,
  cy: number,
  cr: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
) {
  const nx = Math.max(rx, Math.min(cx, rx + rw));
  const ny = Math.max(ry, Math.min(cy, ry + rh));
  return dist2(cx, cy, nx, ny) < cr * cr;
}

function ptInRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

// ─── Movement with collision ──────────────────────────────────────────────────
function moveEntity(
  s: GameState,
  ox: number,
  oy: number,
  radius: number,
  vx: number,
  vy: number,
): [number, number] {
  let nx = ox + vx;
  let ny = oy + vy;
  nx = Math.max(radius, Math.min(WS - radius, nx));
  ny = Math.max(radius, Math.min(WS - radius, ny));

  for (const tree of s.trees) {
    if (ccCollide(nx, oy, radius, tree.pos.x, tree.pos.y, tree.radius)) nx = ox;
    if (ccCollide(nx, ny, radius, tree.pos.x, tree.pos.y, tree.radius)) ny = oy;
  }
  for (const b of s.buildings) {
    if (crCollide(nx, oy, radius, b.x, b.y, b.w, b.h)) nx = ox;
    if (crCollide(nx, ny, radius, b.x, b.y, b.w, b.h)) ny = oy;
  }
  return [nx, ny];
}

// ─── Shoot ───────────────────────────────────────────────────────────────────
function handleShoot(s: GameState) {
  if (s.player.ammo <= 0) return;
  const dx = s.mouseWorld.x - s.player.pos.x;
  const dy = s.mouseWorld.y - s.player.pos.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  s.bullets.push({
    id: s.nextBulletId++,
    pos: { x: s.player.pos.x, y: s.player.pos.y },
    vel: { x: (dx / len) * BULLET_SPD, y: (dy / len) * BULLET_SPD },
    lifetime: BULLET_LIFE,
    fromPlayer: true,
  });
  s.player.ammo = Math.max(0, s.player.ammo - 1);
}

// ─── Bot AI ──────────────────────────────────────────────────────────────────
function updateBot(s: GameState, bot: BotState, dt: number) {
  const pdx = s.player.pos.x - bot.pos.x;
  const pdy = s.player.pos.y - bot.pos.y;
  const pd = Math.sqrt(pdx * pdx + pdy * pdy);

  let vx = 0;
  let vy = 0;

  if (pd < 300) {
    if (pd > 0.001) {
      vx = (pdx / pd) * BOT_SPD * dt;
      vy = (pdy / pd) * BOT_SPD * dt;
      bot.angle = Math.atan2(pdy, pdx);
    }
    bot.shootTimer -= dt;
    if (bot.shootTimer <= 0) {
      bot.shootTimer = 1.5;
      if (pd > 0.001) {
        s.bullets.push({
          id: s.nextBulletId++,
          pos: { x: bot.pos.x, y: bot.pos.y },
          vel: {
            x: (pdx / pd) * BULLET_SPD,
            y: (pdy / pd) * BULLET_SPD,
          },
          lifetime: BULLET_LIFE,
          fromPlayer: false,
        });
      }
    }
  } else {
    bot.wanderTimer -= dt;
    if (bot.wanderTimer <= 0) {
      bot.wanderTimer = 2 + Math.random() * 2;
      const angle = Math.random() * Math.PI * 2;
      bot.wanderDir = { x: Math.cos(angle), y: Math.sin(angle) };
    }
    vx = bot.wanderDir.x * BOT_SPD * 0.5 * dt;
    vy = bot.wanderDir.y * BOT_SPD * 0.5 * dt;
    bot.angle = Math.atan2(bot.wanderDir.y, bot.wanderDir.x);
  }

  const [nx, ny] = moveEntity(s, bot.pos.x, bot.pos.y, BR, vx, vy);
  bot.pos.x = nx;
  bot.pos.y = ny;
}

// ─── Main update ─────────────────────────────────────────────────────────────
function update(s: GameState, dt: number) {
  if (s.gameOver) return;
  s.survivalTime += dt;

  // Player movement
  let vx = 0;
  let vy = 0;
  if (s.keys.has("w") || s.keys.has("arrowup")) vy -= 1;
  if (s.keys.has("s") || s.keys.has("arrowdown")) vy += 1;
  if (s.keys.has("a") || s.keys.has("arrowleft")) vx -= 1;
  if (s.keys.has("d") || s.keys.has("arrowright")) vx += 1;
  if (vx !== 0 || vy !== 0) {
    const vlen = Math.sqrt(vx * vx + vy * vy);
    vx = (vx / vlen) * PLAYER_SPD * dt;
    vy = (vy / vlen) * PLAYER_SPD * dt;
  }
  const [nx, ny] = moveEntity(s, s.player.pos.x, s.player.pos.y, PR, vx, vy);
  s.player.pos.x = nx;
  s.player.pos.y = ny;

  // Player aim
  const dx = s.mouseWorld.x - s.player.pos.x;
  const dy = s.mouseWorld.y - s.player.pos.y;
  s.player.angle = Math.atan2(dy, dx);

  // Camera
  s.camera.x = Math.max(0, Math.min(WS - CW, s.player.pos.x - CW / 2));
  s.camera.y = Math.max(0, Math.min(WS - CH, s.player.pos.y - CH / 2));

  // Safe zone shrink
  const sz = s.safeZone;
  sz.shrinkTimer -= dt;
  if (sz.shrinkTimer <= 0 && sz.phase < 3) {
    sz.phase++;
    const targets = [600, 350, 150];
    const durations = [25, 20, 15];
    if (sz.phase < targets.length) {
      sz.targetRadius = targets[sz.phase];
      sz.shrinkTimer = durations[sz.phase];
    } else {
      sz.shrinkTimer = 9999;
    }
  }
  if (sz.radius > sz.targetRadius) {
    sz.radius = Math.max(sz.targetRadius, sz.radius - 28 * dt);
  }

  // Zone damage
  const pDist = Math.sqrt(dist2(s.player.pos.x, s.player.pos.y, sz.cx, sz.cy));
  if (pDist > sz.radius) {
    s.player.hp -= ZONE_DMG * dt;
    s.outOfZoneTime = Math.min(5, s.outOfZoneTime + dt);
  } else {
    s.outOfZoneTime = Math.max(0, s.outOfZoneTime - dt * 2);
  }

  // Bots
  for (const bot of s.bots) {
    if (bot.alive) updateBot(s, bot, dt);
  }

  // Bullets
  s.bullets = s.bullets.filter((bullet) => {
    bullet.lifetime -= dt;
    if (bullet.lifetime <= 0) return false;
    bullet.pos.x += bullet.vel.x * dt;
    bullet.pos.y += bullet.vel.y * dt;
    if (
      bullet.pos.x < 0 ||
      bullet.pos.x > WS ||
      bullet.pos.y < 0 ||
      bullet.pos.y > WS
    )
      return false;
    for (const tree of s.trees) {
      if (
        ccCollide(
          bullet.pos.x,
          bullet.pos.y,
          BLT_R,
          tree.pos.x,
          tree.pos.y,
          tree.radius,
        )
      )
        return false;
    }
    for (const b of s.buildings) {
      if (ptInRect(bullet.pos.x, bullet.pos.y, b.x, b.y, b.w, b.h))
        return false;
    }
    if (bullet.fromPlayer) {
      for (const bot of s.bots) {
        if (!bot.alive) continue;
        if (
          ccCollide(bullet.pos.x, bullet.pos.y, BLT_R, bot.pos.x, bot.pos.y, BR)
        ) {
          bot.hp -= BOT_DAMAGE;
          if (bot.hp <= 0) {
            bot.alive = false;
            s.killCount++;
          }
          return false;
        }
      }
    } else {
      if (
        ccCollide(
          bullet.pos.x,
          bullet.pos.y,
          BLT_R,
          s.player.pos.x,
          s.player.pos.y,
          PR,
        )
      ) {
        s.player.hp -= PLAYER_DAMAGE;
        return false;
      }
    }
    return true;
  });

  // Loot pickup
  for (const loot of s.loots) {
    if (loot.picked) continue;
    if (
      dist2(s.player.pos.x, s.player.pos.y, loot.pos.x, loot.pos.y) <
      (PR + 14) ** 2
    ) {
      loot.picked = true;
      if (loot.type === "ammo") {
        s.player.reserveAmmo = Math.min(120, s.player.reserveAmmo + 30);
      } else {
        s.player.hp = Math.min(100, s.player.hp + 25);
      }
    }
  }

  // Auto reload
  if (s.player.ammo === 0 && s.player.reserveAmmo > 0) {
    const reload = Math.min(30, s.player.reserveAmmo);
    s.player.ammo = reload;
    s.player.reserveAmmo -= reload;
  }

  // Win / Lose
  const aliveBots = s.bots.filter((b) => b.alive).length;
  if (s.player.hp <= 0) {
    s.player.hp = 0;
    s.gameOver = true;
    s.won = false;
  } else if (aliveBots === 0) {
    s.gameOver = true;
    s.won = true;
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render(
  mainCanvas: HTMLCanvasElement,
  minimapCanvas: HTMLCanvasElement | null,
  s: GameState,
) {
  const ctx = mainCanvas.getContext("2d");
  if (!ctx) return;
  const cam = s.camera;

  // Grass background
  ctx.fillStyle = "#2d6e1a";
  ctx.fillRect(0, 0, CW, CH);

  // Grid
  ctx.strokeStyle = "rgba(0,0,0,0.10)";
  ctx.lineWidth = 1;
  const gs = 60;
  const offX = cam.x % gs;
  const offY = cam.y % gs;
  for (let x = -offX; x <= CW; x += gs) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CH);
    ctx.stroke();
  }
  for (let y = -offY; y <= CH; y += gs) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CW, y);
    ctx.stroke();
  }

  // Safe zone: red tint outside
  const sz = s.safeZone;
  const szX = sz.cx - cam.x;
  const szY = sz.cy - cam.y;
  ctx.save();
  ctx.fillStyle = "rgba(196, 58, 46, 0.22)";
  ctx.fillRect(0, 0, CW, CH);
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(szX, szY, sz.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Safe zone ring
  ctx.save();
  ctx.shadowColor = "#57B8FF";
  ctx.shadowBlur = 14;
  ctx.strokeStyle = "#57B8FF";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(szX, szY, sz.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Buildings
  for (const b of s.buildings) {
    const bx = b.x - cam.x;
    const by = b.y - cam.y;
    ctx.fillStyle = "#3d4442";
    ctx.fillRect(bx, by, b.w, b.h);
    ctx.strokeStyle = "#272c2a";
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, b.w, b.h);
    // Windows
    ctx.fillStyle = "rgba(87, 184, 255, 0.22)";
    if (b.w >= 40 && b.h >= 40) {
      ctx.fillRect(bx + 10, by + 10, 18, 16);
      if (b.w >= 60) ctx.fillRect(bx + b.w - 28, by + 10, 18, 16);
    }
    // Roof accent
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(bx, by, b.w, 4);
  }

  // Trees
  for (const tree of s.trees) {
    const tx = tree.pos.x - cam.x;
    const ty = tree.pos.y - cam.y;
    ctx.fillStyle = "#5a3010";
    ctx.beginPath();
    ctx.arc(tx, ty, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1d5c0f";
    ctx.beginPath();
    ctx.arc(tx, ty, tree.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#144009";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.arc(tx - 6, ty - 6, tree.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Loot drops
  for (const loot of s.loots) {
    if (loot.picked) continue;
    const lx = loot.pos.x - cam.x;
    const ly = loot.pos.y - cam.y;
    const isAmmo = loot.type === "ammo";
    ctx.save();
    ctx.shadowColor = isAmmo ? "#F2A23A" : "#e84444";
    ctx.shadowBlur = 12;
    ctx.fillStyle = isAmmo ? "#F2A23A" : "#e84444";
    ctx.fillRect(lx - 9, ly - 9, 18, 18);
    ctx.restore();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isAmmo ? "A" : "+", lx, ly);
  }

  // Bullets
  for (const bullet of s.bullets) {
    const bx = bullet.pos.x - cam.x;
    const by = bullet.pos.y - cam.y;
    ctx.save();
    ctx.shadowColor = bullet.fromPlayer ? "#ffffff" : "#F2A23A";
    ctx.shadowBlur = 8;
    ctx.fillStyle = bullet.fromPlayer ? "#ffffff" : "#F2A23A";
    ctx.beginPath();
    ctx.arc(bx, by, BLT_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Bots
  for (const bot of s.bots) {
    if (!bot.alive) continue;
    const bx = bot.pos.x - cam.x;
    const by = bot.pos.y - cam.y;
    // Body
    ctx.fillStyle = "#C43A2E";
    ctx.strokeStyle = "#ff7766";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, BR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Direction
    ctx.strokeStyle = "#ffaaaa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(
      bx + Math.cos(bot.angle) * (BR + 7),
      by + Math.sin(bot.angle) * (BR + 7),
    );
    ctx.stroke();
    // Name tag
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.fillRect(bx - 24, by - 32, 48, 12);
    ctx.fillStyle = "#ffffff";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(bot.name, bx, by - 26);
    // HP bar bg
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(bx - 20, by - 20, 40, 5);
    // HP bar fill
    const hpPct = Math.max(0, bot.hp / 80);
    ctx.fillStyle = `hsl(${hpPct * 120}, 80%, 50%)`;
    ctx.fillRect(bx - 20, by - 20, 40 * hpPct, 5);
  }

  // Player
  const px = s.player.pos.x - cam.x;
  const py = s.player.pos.y - cam.y;
  ctx.save();
  ctx.shadowColor = "#22c55e";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#22c55e";
  ctx.strokeStyle = "#86efac";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(px, py, PR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  // Aim line
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(
    px + Math.cos(s.player.angle) * (PR + 10),
    py + Math.sin(s.player.angle) * (PR + 10),
  );
  ctx.stroke();
  // Label
  ctx.fillStyle = "#86efac";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("YOU", px, py - 26);

  // Game over overlay
  if (s.gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, 0, CW, CH);
    ctx.save();
    ctx.font = "bold 52px Orbitron, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = s.won ? "#22c55e" : "#C43A2E";
    ctx.shadowBlur = 30;
    ctx.fillStyle = s.won ? "#22c55e" : "#C43A2E";
    ctx.fillText(s.won ? "VICTORY!" : "ELIMINATED", CW / 2, CH / 2);
    ctx.restore();
  }

  // ── Minimap ──────────────────────────────────────────────────────────────
  if (minimapCanvas) {
    const mctx = minimapCanvas.getContext("2d");
    if (mctx) {
      const scale = 150 / WS;
      mctx.fillStyle = "#0c1e07";
      mctx.fillRect(0, 0, 150, 150);

      // Zone ring
      mctx.strokeStyle = "rgba(87, 184, 255, 0.8)";
      mctx.lineWidth = 1;
      mctx.beginPath();
      mctx.arc(sz.cx * scale, sz.cy * scale, sz.radius * scale, 0, Math.PI * 2);
      mctx.stroke();

      // Buildings
      mctx.fillStyle = "#505855";
      for (const b of s.buildings) {
        mctx.fillRect(b.x * scale, b.y * scale, b.w * scale, b.h * scale);
      }

      // Trees
      mctx.fillStyle = "#1d5c0f";
      for (const tree of s.trees) {
        mctx.beginPath();
        mctx.arc(
          tree.pos.x * scale,
          tree.pos.y * scale,
          tree.radius * scale,
          0,
          Math.PI * 2,
        );
        mctx.fill();
      }

      // Loots
      for (const loot of s.loots) {
        if (loot.picked) continue;
        mctx.fillStyle = loot.type === "ammo" ? "#F2A23A" : "#e84444";
        mctx.fillRect(loot.pos.x * scale - 2, loot.pos.y * scale - 2, 4, 4);
      }

      // Bots
      for (const bot of s.bots) {
        if (!bot.alive) continue;
        mctx.fillStyle = "#C43A2E";
        mctx.fillRect(bot.pos.x * scale - 2.5, bot.pos.y * scale - 2.5, 5, 5);
      }

      // Player
      mctx.save();
      mctx.shadowColor = "#22c55e";
      mctx.shadowBlur = 4;
      mctx.fillStyle = "#22c55e";
      mctx.beginPath();
      mctx.arc(
        s.player.pos.x * scale,
        s.player.pos.y * scale,
        4,
        0,
        Math.PI * 2,
      );
      mctx.fill();
      mctx.restore();

      // Camera viewport rect
      mctx.strokeStyle = "rgba(255,255,255,0.25)";
      mctx.lineWidth = 1;
      mctx.strokeRect(cam.x * scale, cam.y * scale, CW * scale, CH * scale);
    }
  }
}

// ─── HUD overlay ─────────────────────────────────────────────────────────────
interface HUDData {
  hp: number;
  ammo: number;
  reserveAmmo: number;
  kills: number;
  alive: number;
  zoneTimer: number;
  boost: number;
}

function HUDOverlay({ hud }: { hud: HUDData }) {
  const hpColor = hud.hp > 50 ? "#22c55e" : hud.hp > 25 ? "#F2A23A" : "#C43A2E";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        fontFamily: '"Rajdhani", sans-serif',
      }}
    >
      {/* Top-right: alive + kills + zone timer */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          textAlign: "right",
        }}
      >
        <div
          style={{
            color: "#E9ECEB",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {hud.alive}/10 ALIVE
        </div>
        <div
          style={{
            color: "#F2A23A",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {hud.kills} KILLS
        </div>
        <div
          style={{
            color: "#57B8FF",
            fontSize: 11,
            marginTop: 4,
            letterSpacing: "0.1em",
          }}
        >
          ZONE: {hud.zoneTimer}s
        </div>
      </div>

      {/* Bottom-left: HP + boost */}
      <div style={{ position: "absolute", bottom: 50, left: 10 }}>
        <div style={{ marginBottom: 6 }}>
          <div
            style={{
              color: "#E9ECEB",
              fontSize: 11,
              letterSpacing: "0.1em",
              marginBottom: 3,
            }}
          >
            HP {hud.hp}/100
          </div>
          <div
            style={{
              width: 150,
              height: 8,
              background: "rgba(0,0,0,0.5)",
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div
              style={{
                width: `${hud.hp}%`,
                height: "100%",
                background: hpColor,
                borderRadius: 2,
                transition: "width 0.15s",
              }}
            />
          </div>
        </div>
        <div>
          <div
            style={{
              color: "#57B8FF",
              fontSize: 11,
              letterSpacing: "0.1em",
              marginBottom: 3,
            }}
          >
            BOOST {hud.boost}%
          </div>
          <div
            style={{
              width: 150,
              height: 6,
              background: "rgba(0,0,0,0.5)",
              borderRadius: 2,
              border: "1px solid rgba(87,184,255,0.3)",
            }}
          >
            <div
              style={{
                width: `${hud.boost}%`,
                height: "100%",
                background: "#57B8FF",
                borderRadius: 2,
                transition: "width 0.15s",
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom-right: weapon + ammo */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          right: 10,
          textAlign: "right",
        }}
      >
        <div
          style={{
            color: "#E9ECEB",
            fontSize: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          AR-15
        </div>
        <div
          style={{
            color: "#F2A23A",
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: '"Orbitron", sans-serif',
          }}
        >
          {hud.ammo}
        </div>
        <div style={{ color: "#888", fontSize: 14 }}>/{hud.reserveAmmo}</div>
      </div>

      {/* Compass strip */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.55)",
          padding: "3px 14px",
          borderRadius: 3,
          color: "#E9ECEB",
          fontSize: 11,
          letterSpacing: "0.18em",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        N &nbsp; NE &nbsp; E &nbsp; SE &nbsp; S
      </div>

      {/* Controls hint */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.35)",
          fontSize: 10,
          letterSpacing: "0.1em",
        }}
      >
        WASD: MOVE &nbsp;|&nbsp; MOUSE: AIM &nbsp;|&nbsp; CLICK: SHOOT
      </div>
    </div>
  );
}

// ─── Game component ───────────────────────────────────────────────────────────
interface GameProps {
  onGameOver: (kills: number, time: number, won: boolean) => void;
}

export function Game({ onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(initGameState());
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const gameOverFiredRef = useRef(false);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const [hud, setHud] = useState<HUDData>({
    hp: 100,
    ammo: 30,
    reserveAmmo: 120,
    kills: 0,
    alive: 10,
    zoneTimer: 30,
    boost: 0,
  });

  useEffect(() => {
    const s = stateRef.current;

    const GAME_KEYS = new Set([
      "w",
      "a",
      "s",
      "d",
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
    ]);

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (GAME_KEYS.has(k)) e.preventDefault();
      s.keys.add(k);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      s.keys.delete(e.key.toLowerCase());
    };
    const onMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      s.mouseWorld = {
        x: e.clientX - rect.left + s.camera.x,
        y: e.clientY - rect.top + s.camera.y,
      };
    };
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) handleShoot(s);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);

    const loop = (ts: number) => {
      const dt = Math.min((ts - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = ts;

      if (dt > 0) {
        const gs = stateRef.current;
        update(gs, dt);
        const canvas = canvasRef.current;
        if (canvas) render(canvas, minimapRef.current, gs);

        const aliveBots = gs.bots.filter((b) => b.alive).length;
        setHud({
          hp: Math.max(0, Math.round(gs.player.hp)),
          ammo: gs.player.ammo,
          reserveAmmo: gs.player.reserveAmmo,
          kills: gs.killCount,
          alive: aliveBots,
          zoneTimer: Math.max(0, Math.ceil(gs.safeZone.shrinkTimer)),
          boost: Math.min(100, Math.round((gs.outOfZoneTime / 5) * 100)),
        });

        if (gs.gameOver && !gameOverFiredRef.current) {
          gameOverFiredRef.current = true;
          setTimeout(() => {
            onGameOverRef.current(
              gs.killCount,
              Math.round(gs.survivalTime),
              gs.won,
            );
          }, 2200);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame((ts) => {
      lastTimeRef.current = ts;
      rafRef.current = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {/* Mini header */}
      <div className="w-full flex items-center justify-between px-6 py-2 mb-1">
        <span
          className="font-display text-primary text-sm tracking-widest"
          style={{ textShadow: "0 0 10px rgba(242,162,58,0.6)" }}
        >
          ◈ BATTLEGROUNDS ONLINE
        </span>
        <span className="text-muted-foreground text-xs tracking-widest uppercase">
          WASD: Move &nbsp;|&nbsp; Mouse: Aim &nbsp;|&nbsp; Click: Shoot
        </span>
      </div>

      {/* Canvas + HUD */}
      <div
        style={{ position: "relative", width: CW, height: CH }}
        className="rounded border border-border shadow-[0_0_30px_rgba(0,0,0,0.8)]"
      >
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          data-ocid="game.canvas_target"
          style={{
            display: "block",
            cursor: "crosshair",
            borderRadius: "inherit",
          }}
        />

        {/* HUD layer */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {/* Minimap */}
          <div
            style={{ position: "absolute", top: 10, left: 10 }}
            data-ocid="game.panel"
          >
            <canvas
              ref={minimapRef}
              width={150}
              height={150}
              style={{
                display: "block",
                border: "1.5px solid #57B8FF",
                borderRadius: 4,
                boxShadow: "0 0 12px rgba(87,184,255,0.4)",
              }}
            />
            <div
              style={{
                fontSize: 9,
                color: "#57B8FF",
                textAlign: "center",
                marginTop: 2,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontFamily: "Rajdhani, sans-serif",
              }}
            >
              MINIMAP
            </div>
          </div>

          <HUDOverlay hud={hud} />
        </div>
      </div>
    </div>
  );
}
