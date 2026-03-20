export interface Vec2 {
  x: number;
  y: number;
}

export interface PlayerState {
  pos: Vec2;
  angle: number;
  hp: number;
  ammo: number;
  reserveAmmo: number;
}

export interface BotState {
  id: number;
  name: string;
  pos: Vec2;
  angle: number;
  hp: number;
  alive: boolean;
  wanderDir: Vec2;
  wanderTimer: number;
  shootTimer: number;
}

export interface BulletState {
  id: number;
  pos: Vec2;
  vel: Vec2;
  lifetime: number;
  fromPlayer: boolean;
}

export interface Tree {
  pos: Vec2;
  radius: number;
}

export interface Building {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LootDrop {
  id: number;
  pos: Vec2;
  type: "ammo" | "health";
  picked: boolean;
}

export interface SafeZone {
  cx: number;
  cy: number;
  radius: number;
  targetRadius: number;
  shrinkTimer: number;
  phase: number;
}

export interface GameState {
  player: PlayerState;
  bots: BotState[];
  bullets: BulletState[];
  trees: Tree[];
  buildings: Building[];
  loots: LootDrop[];
  safeZone: SafeZone;
  killCount: number;
  survivalTime: number;
  gameOver: boolean;
  won: boolean;
  keys: Set<string>;
  mouseWorld: Vec2;
  camera: Vec2;
  nextBulletId: number;
  outOfZoneTime: number;
}

export interface ScoreEntry {
  kills: number;
  time: number;
  won: boolean;
  date: string;
}
