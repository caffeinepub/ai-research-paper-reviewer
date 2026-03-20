import { useCallback, useState } from "react";
import { Game } from "./components/Game";
import { GameOver } from "./components/GameOver";
import { Lobby } from "./components/Lobby";

type Phase = "lobby" | "playing" | "gameover";

interface GameResult {
  kills: number;
  time: number;
  won: boolean;
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [result, setResult] = useState<GameResult>({
    kills: 0,
    time: 0,
    won: false,
  });
  const [gameKey, setGameKey] = useState(0);

  const handlePlay = useCallback(() => {
    setGameKey((k) => k + 1);
    setPhase("playing");
  }, []);

  const handleGameOver = useCallback(
    (kills: number, time: number, won: boolean) => {
      const r = { kills, time, won };
      setResult(r);
      setPhase("gameover");

      // Save score to localStorage
      const scores = JSON.parse(
        localStorage.getItem("battlegrounds_scores") || "[]",
      ) as Array<GameResult & { date: string }>;
      scores.push({ ...r, date: new Date().toISOString() });
      scores.sort((a, b) => b.kills - a.kills);
      localStorage.setItem(
        "battlegrounds_scores",
        JSON.stringify(scores.slice(0, 10)),
      );
    },
    [],
  );

  const handlePlayAgain = useCallback(() => {
    setGameKey((k) => k + 1);
    setPhase("playing");
  }, []);

  const handleBackToLobby = useCallback(() => {
    setPhase("lobby");
  }, []);

  return (
    <>
      {phase === "lobby" && <Lobby onPlay={handlePlay} />}
      {phase === "playing" && (
        <Game key={gameKey} onGameOver={handleGameOver} />
      )}
      {phase === "gameover" && (
        <GameOver
          result={result}
          onPlayAgain={handlePlayAgain}
          onBackToLobby={handleBackToLobby}
        />
      )}
    </>
  );
}
