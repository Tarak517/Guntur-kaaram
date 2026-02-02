import React, { useState, useEffect, useRef } from "react";
import Bird from "./components/Bird";
import Pipe from "./components/Pipe";
import Score from "./components/Score";
import GameOver from "./GameOver";
const GAME_HEIGHT = 800;
const GAME_WIDTH = 600;

const GRAVITY = 0.9;
const JUMP_FORCE = -10;
const PIPE_WIDTH = 80; // shrink to match visible pipe
const PIPE_GAP = 350;

function App() {
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([{ x: GAME_WIDTH, gapY: 200 }]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const bgMusic = useRef(null);
  const gameOverMusic = useRef(null);

  const BIRD_IMAGE = "/bird.png";
  const PIPE_IMAGE = "/obstacle.png";

  /* ================= JUMP ================= */
  const jump = () => {
    if (!started || gameOver) return;
    setVelocity(JUMP_FORCE);
  };

  /* ================= KEYBOARD ================= */
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") jump();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, gameOver]);

  /* ================= GAME LOOP ================= */
  useEffect(() => {
    if (!started || gameOver) return;

    const loop = setInterval(() => {
      setVelocity((v) => v + GRAVITY);

      setBirdY((y) => {
        const next = y + velocity;
        return Math.max(0, Math.min(GAME_HEIGHT - 120, next)); // bird height 120
      });

      setPipes((prev) => {
        let next = prev
          .map((p) => ({ ...p, x: p.x - 4 }))
          .filter((p) => p.x + PIPE_WIDTH > 0);

        // Add new pipe
        if (next[next.length - 1].x < GAME_WIDTH - 250) {
          next.push({
            x: GAME_WIDTH,
            gapY: Math.random() * (GAME_HEIGHT - PIPE_GAP),
          });
        }

        // Collision detection
        next.forEach((p) => {
          const birdTop = birdY + 30;     // shrink hitbox for top
          const birdBottom = birdY + 90;  // shrink hitbox for bottom
          const birdLeft = 120 + 30;      // shrink hitbox left
          const birdRight = 120 + 90;     // shrink hitbox right

          const pipeLeft = p.x;
          const pipeRight = p.x + PIPE_WIDTH;
          const pipeTop = p.gapY;
          const pipeBottom = p.gapY + PIPE_GAP;

          const hit =
            birdRight > pipeLeft &&
            birdLeft < pipeRight &&
            (birdTop < pipeTop || birdBottom > pipeBottom);

          if (hit) {
            setGameOver(true);
            bgMusic.current?.pause();
            gameOverMusic.current?.play();
          }

          if (p.x === 50) setScore((s) => s + 1);
        });

        return next;
      });
    }, 30);

    return () => clearInterval(loop);
  }, [started, gameOver, velocity, birdY]);

  /* ================= START / RESTART ================= */
  const startGame = () => {
    setStarted(true);

    bgMusic.current = new Audio("/background.mp3");
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.4;
    bgMusic.current.play();

    gameOverMusic.current = new Audio("/gameover.mp3");
    gameOverMusic.current.volume = 0.8;
  };

  const restartGame = () => {
    gameOverMusic.current?.pause();
    gameOverMusic.current.currentTime = 0;

    setBirdY(GAME_HEIGHT / 2);
    setVelocity(0);
    setPipes([{ x: GAME_WIDTH, gapY: 200 }]);
    setScore(0);
    setGameOver(false);
    setStarted(false);
  };

  /* ================= UI ================= */
  return (
    <div style={outer}>
      <div style={gameBox}>
        {!started && (
          <button style={{ ...centerBtn, zIndex: 10 }} onClick={startGame}>
            Start Game
          </button>
        )}

        {gameOver && (
          <>
            <div style={{ ...gameOverText, zIndex: 20 }}>
              <h1>😢 Game Over</h1>
            </div>
            <button
              style={{ ...centerBtn, zIndex: 20 }}
              onClick={restartGame}
            >
              <h1>Start Again</h1>
            </button>
          </>
        )}

        <Bird y={birdY} img={BIRD_IMAGE} />

        {pipes.map((p, i) => (
          <Pipe
            key={i}
            x={p.x}
            gapY={p.gapY}
            gapSize={PIPE_GAP}
            width={PIPE_WIDTH}
            img={PIPE_IMAGE}
            gameHeight={GAME_HEIGHT}
          />
        ))}

        {/* Jump Button */}
        {started && !gameOver && (
          <button
            onMouseDown={jump}
            onTouchStart={jump}
            style={{ ...jumpBtn, zIndex: 9 }}
          >
            ⬆️
          </button>
        )}

        <Score score={score} />
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const outer = {
  minHeight: "100vh",
  background: "#111",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const gameBox = {
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  background: "#87CEEB",
  position: "relative",
  overflow: "hidden",
};

const centerBtn = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  padding: "14px 26px",
  fontSize: "18px",
};

const gameOverText = {
  position: "absolute",
  bottom: "60px",
  width: "100%",
  textAlign: "center",
  fontSize: "28px",
  fontWeight: "bold",
  color: "#ff3333",
};

const jumpBtn = {
  position: "absolute",
  bottom: "30px",
  right: "30px",
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  fontSize: "28px",
  border: "none",
  background: "#ffcc00",
  cursor: "pointer",
};

export default App;
