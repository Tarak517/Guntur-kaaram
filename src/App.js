import React, { useEffect, useRef, useState } from "react";
import Bird, { BIRD_HITBOX } from "./components/Bird";
import Pipe from "./components/Pipe";
import Score from "./components/Score";

/* ===== GAME CONFIG ===== */
const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;

const GRAVITY = 0.12;
const JUMP_FORCE = -3.2;
const PIPE_SPEED = 1.4;

const PIPE_WIDTH = 80;
const PIPE_GAP = 260;

const BIRD_X = 80;

export default function App() {
  const birdY = useRef(GAME_HEIGHT / 2);
  const velocity = useRef(0);
  const pipes = useRef([]);
  const frameRef = useRef(null);
  const gameRunning = useRef(false);

  const gameOverAudio = useRef(null);
  const bgMusic = useRef(null);

  const [renderBirdY, setRenderBirdY] = useState(birdY.current);
  const [renderPipes, setRenderPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const BIRD_IMAGE = process.env.PUBLIC_URL + "/bird.png";
  const PIPE_IMAGE = process.env.PUBLIC_URL + "/obstacle.png";

  /* ===== INIT AUDIO ===== */
  useEffect(() => {
    gameOverAudio.current = new Audio(process.env.PUBLIC_URL + "/gameover.mp3");
    bgMusic.current = new Audio(process.env.PUBLIC_URL + "/background.mp3");
    bgMusic.current.loop = true;
  }, []);

  /* ===== GAME LOOP ===== */
  const loop = () => {
    if (!gameRunning.current) return;

    velocity.current += GRAVITY;
    birdY.current += velocity.current;

    if (birdY.current < 0 || birdY.current > GAME_HEIGHT - 120) {
      endGame();
      return;
    }

    pipes.current.forEach((p) => (p.x -= PIPE_SPEED));

    if (
      pipes.current.length === 0 ||
      pipes.current[pipes.current.length - 1].x < GAME_WIDTH - 200
    ) {
      pipes.current.push({
        x: GAME_WIDTH,
        gapY: Math.random() * (GAME_HEIGHT - PIPE_GAP - 150) + 75,
        scored: false,
      });
    }

    pipes.current.forEach((p) => {
      const birdBox = {
        left: BIRD_X + BIRD_HITBOX.offsetX,
        right: BIRD_X + BIRD_HITBOX.offsetX + BIRD_HITBOX.width,
        top: birdY.current + BIRD_HITBOX.offsetY,
        bottom: birdY.current + BIRD_HITBOX.offsetY + BIRD_HITBOX.height,
      };

      const pipeLeft = p.x;
      const pipeRight = p.x + PIPE_WIDTH;
      const topPipeBottom = p.gapY;
      const bottomPipeTop = p.gapY + PIPE_GAP;

      const padding = 2;
      if (
        birdBox.right - padding > pipeLeft &&
        birdBox.left + padding < pipeRight &&
        (birdBox.top + padding < topPipeBottom ||
          birdBox.bottom - padding > bottomPipeTop)
      ) {
        endGame();
      }

      if (!p.scored && pipeRight < birdBox.left) {
        p.scored = true;
        setScore((s) => s + 1);
      }
    });

    pipes.current = pipes.current.filter((p) => p.x + PIPE_WIDTH > 0);

    setRenderBirdY(birdY.current);
    setRenderPipes([...pipes.current]);

    frameRef.current = requestAnimationFrame(loop);
  };

  /* ===== CONTROLS ===== */
  const jump = () => {
    if (!started || gameOver) return;
    velocity.current = JUMP_FORCE;
  };

  useEffect(() => {
    const key = (e) => e.code === "Space" && jump();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [started, gameOver]);

  /* ===== GAME STATE ===== */
  const startGame = () => {
    birdY.current = GAME_HEIGHT / 2;
    velocity.current = 0;
    pipes.current = [];
    setScore(0);
    setGameOver(false);
    setStarted(true);

    gameRunning.current = true;
    frameRef.current = requestAnimationFrame(loop);

    if (bgMusic.current) {
      bgMusic.current.pause();
      bgMusic.current.currentTime = 0;
      bgMusic.current.play().catch((err) =>
        console.warn("Autoplay blocked. Music will play after interaction.", err)
      );
    }

    if (gameOverAudio.current) {
      gameOverAudio.current.pause();
      gameOverAudio.current.currentTime = 0;
    }
  };

  const endGame = () => {
    if (!gameRunning.current) return;

    gameRunning.current = false;
    cancelAnimationFrame(frameRef.current);

    if (bgMusic.current) bgMusic.current.pause();

    setTimeout(() => {
      setGameOver(true);
      if (gameOverAudio.current) {
        gameOverAudio.current.currentTime = 0;
        gameOverAudio.current.play().catch((err) =>
          console.warn("Game over sound error:", err)
        );
      }
    }, 200);
  };

  /* ===== UI ===== */
  return (
    <div style={outer}>
      <div style={gameBox}>
        {!started && (
          <button style={centerBtn} onClick={startGame}>
            Start Game
          </button>
        )}

        {gameOver && (
          <>
            <div style={gameOverText}>😢 Game Over</div>
            <div style={marquee}>
              theerarerareoooo theerarerareoooo theerarerareoooo theerarerareoooo rarerooooooooooo
            </div>
            <button style={centerBtn} onClick={startGame}>
              Play Again
            </button>
          </>
        )}

        <Bird y={renderBirdY} img={BIRD_IMAGE} />

        {renderPipes.map((p, i) => (
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

        {started && !gameOver && (
          <button style={jumpBtn} onTouchStart={jump} onMouseDown={jump}>
            ⬆️
          </button>
        )}

        <Score score={score} />
      </div>
    </div>
  );
}

/* ===== STYLES ===== */
const outer = {
  height: "100vh",
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
  zIndex: 10,
};

const gameOverText = {
  position: "absolute",
  bottom: "160px",
  width: "100%",
  textAlign: "center",
  fontSize: "26px",
  color: "red",
  zIndex: 10,
};

const jumpBtn = {
  position: "absolute",
  bottom: "25px",
  right: "25px",
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  fontSize: "30px",
  border: "none",
  background: "#ffcc00",
  zIndex: 5,
};

const marquee = {
  position: "absolute",
  bottom: "120px",
  whiteSpace: "nowrap",
  fontSize: "22px",
  color: "#fff",
  animation: "scroll 8s linear infinite",
  zIndex: 10,
};

/* ===== KEYFRAMES ===== */
const style = document.createElement("style");
style.innerHTML = `
@keyframes scroll {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
`;
document.head.appendChild(style);
