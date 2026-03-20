# Battle Royale Sample (Free Fire Style)

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- 2D top-down browser battle royale game built on HTML5 Canvas
- Player character controllable via WASD/arrow keys + mouse aim
- Shooting mechanic with left-click (limited ammo)
- 10 AI bots that move and shoot at the player
- Shrinking safe zone with damage outside the zone
- Loot system: weapons and ammo pickups scattered on map
- Map with trees, rocks, and buildings as cover
- HUD: health bar, ammo count, kills, players remaining, zone timer
- Mini-map in corner
- Game states: lobby/start screen, playing, game over
- Backend stores high scores (kills, survival time)

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Generate Motoko backend with high score storage
2. Build React shell with Canvas-based game engine
3. Implement game loop with requestAnimationFrame
4. Player movement, aiming, shooting
5. AI bot pathfinding and shooting
6. Shrinking zone logic
7. Loot/pickup system
8. HUD overlay components
9. Start screen and game over screen
10. Submit score to backend on game over
