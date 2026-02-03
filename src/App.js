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

  const BIRD_IMAGE = process.env.PUBLIC_URL + "/car.png";
  const PIPE_IMAGE = process.env.PUBLIC_URL + "/obs.png";

  /* ===== AUDIO ===== */
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

    if (birdY.current < 0 || birdY.current > GAME_HEIGHT - 100) {
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

      if (
        birdBox.right > pipeLeft &&
        birdBox.left < pipeRight &&
        (birdBox.top < topPipeBottom ||
          birdBox.bottom > bottomPipeTop)
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
    // STOP OLD AUDIO COMPLETELY
    gameOverAudio.current.pause();
    gameOverAudio.current.currentTime = 0;

    bgMusic.current.pause();
    bgMusic.current.currentTime = 0;

    birdY.current = GAME_HEIGHT / 2;
    velocity.current = 0;
    pipes.current = [];
    setScore(0);
    setGameOver(false);
    setStarted(true);

    gameRunning.current = true;
    frameRef.current = requestAnimationFrame(loop);

    // START BACKGROUND MUSIC FRESH
    bgMusic.current.play().catch(() => {});
  };

  const endGame = () => {
    if (!gameRunning.current) return;

    gameRunning.current = false;
    cancelAnimationFrame(frameRef.current);

    // STOP BACKGROUND MUSIC IMMEDIATELY
    bgMusic.current.pause();
    bgMusic.current.currentTime = 0;

    setGameOver(true);

    // PLAY GAME OVER MUSIC
    gameOverAudio.current.currentTime = 0;
    gameOverAudio.current.play().catch(() => {});
  };

  /* ===== UI ===== */
  return (
    <div style={outer}>
      <div style={gameBox}>

        {/*  SCROLLING TEXT – MOVED UP */}
        {gameOver && (
          <div style={marqueeWrapper}>
            <div style={marquee}>
              #TEERAARAREOO &nbsp; TEERAARAREOO &nbsp; THARARARARARAOOOOO &nbsp; THARARAOOOOO &nbsp; OOOOOOOO#
            </div>
          </div>
        )}

        <img
          src={process.env.PUBLIC_URL + "/finish.png"}
          alt="finish"
          style={destination}
        />

        {!started && (
          <button style={centerBtn} onClick={startGame}>
            Start fair and lovely
          </button>
        )}

        {gameOver && (
          <button style={centerBtn} onClick={startGame}>
            Nee life oo miracle raa babu
          </button>
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
          <button style={jumpBtn} onMouseDown={jump} onTouchStart={jump}>
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
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#111",
};

const gameBox = {
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  position: "relative",
  overflow: "hidden",
  backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)`,
  backgroundSize: "100% 100%",
};

/*  RED START BUTTON */
const centerBtn = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  padding: "14px 26px",
  fontSize: "18px",
  zIndex: 30,
  background: "#d60000",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
};

const jumpBtn = {
  position: "absolute",
  bottom: "25px",
  right: "25px",
  width: "80px",
  height: "80px",
  borderRadius: "60%",
  fontSize: "40px",
  background: "#ffcc00",
  border: "none",
  zIndex: 30,
};

const destination = {
  position: "absolute",
  right: "5px",
  top: "50%",
  transform: "translateY(-50%)",
  width: "100px",
  zIndex: 15,
  pointerEvents: "none",
};

/* RED STRIP – MOVED UP */
const marqueeWrapper = {
  position: "absolute",
  bottom: "60px", 
  width: "100%",
  height: "45px",
  overflow: "hidden",
  zIndex: 35,
};

const marquee = {
  position: "absolute",
  whiteSpace: "nowrap",
  fontSize: "20px",
  color: "#fff",
  fontWeight: "bold",
  lineHeight: "45px",
  paddingLeft: "100%",
  animation: "scrollText 8s linear infinite",
};

/* ===== KEYFRAMES ===== */
const style = document.createElement("style");
style.innerHTML = `
@keyframes scrollText {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}
`;
document.head.appendChild(style);
