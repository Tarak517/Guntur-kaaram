import React from "react";

export default function Bird({ y, img }) {
  return (
    <img
      src={img}
      alt="bird"
      style={{
        position: "absolute",
        top: y,
        left: 80,
        width: 120,
        height: 120,
        pointerEvents: "none",
      }}
    />
  );
}

export const BIRD_HITBOX = {
  width: 60,
  height: 60,
  offsetX: 30,
  offsetY: 30,
};
