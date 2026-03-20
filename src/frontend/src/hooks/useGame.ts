import type {
  BotState,
  Building,
  GameState,
  LootDrop,
  Tree,
} from "../types/game";

const WS = 1500;

const BOT_NAMES = [
  "Phantom_X",
  "Ghost99",
  "ShadowBlade",
  "Viper_Pro",
  "ReaperX",
  "StormRider",
  "FuryBolt",
  "HexMaster",
  "NovaKill",
  "IronFang",
];

function rnd(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function initGameState(): GameState {
  const trees: Tree[] = Array.from({ length: 15 }, () => ({
    pos: { x: rnd(100, WS - 100), y: rnd(100, WS - 100) },
    radius: 25,
  }));

  const buildings: Building[] = [
    { x: 250, y: 180, w: 130, h: 80 },
    { x: 520, y: 140, w: 110, h: 100 },
    { x: 820, y: 280, w: 160, h: 70 },
    { x: 320, y: 680, w: 110, h: 130 },
    { x: 1020, y: 480, w: 140, h: 95 },
    { x: 720, y: 880, w: 120, h: 85 },
    { x: 1230, y: 220, w: 100, h: 110 },
    { x: 100, y: 1080, w: 150, h: 75 },
  ];

  const loots: LootDrop[] = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    pos: { x: rnd(150, WS - 150), y: rnd(150, WS - 150) },
    type: i % 2 === 0 ? "ammo" : "health",
    picked: false,
  }));

  const bots: BotState[] = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    name: BOT_NAMES[i],
    pos: { x: rnd(200, WS - 200), y: rnd(200, WS - 200) },
    angle: 0,
    hp: 80,
    alive: true,
    wanderDir: { x: rnd(-1, 1), y: rnd(-1, 1) },
    wanderTimer: rnd(1, 3),
    shootTimer: rnd(0, 1.5),
  }));

  return {
    player: {
      pos: { x: WS / 2, y: WS / 2 },
      angle: 0,
      hp: 100,
      ammo: 30,
      reserveAmmo: 120,
    },
    bots,
    bullets: [],
    trees,
    buildings,
    loots,
    safeZone: {
      cx: WS / 2,
      cy: WS / 2,
      radius: 700,
      targetRadius: 700,
      shrinkTimer: 30,
      phase: 0,
    },
    killCount: 0,
    survivalTime: 0,
    gameOver: false,
    won: false,
    keys: new Set(),
    mouseWorld: { x: WS / 2, y: WS / 2 },
    camera: { x: WS / 2 - 400, y: WS / 2 - 300 },
    nextBulletId: 0,
    outOfZoneTime: 0,
  };
}
