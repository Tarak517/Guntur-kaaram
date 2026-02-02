import React from "react";

export default function GameOver() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "red",
        fontSize: "32px",
        fontWeight: "bold",
      }}
    >
      Game Over!
    </div>
  );
}
