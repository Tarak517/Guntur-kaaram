import React from "react";

export default function Pipe({
  x,
  gapY,
  gapSize,
  width,
  img,
  gameHeight,
}) {
  return (
    <>
      {/* Top pipe */}
      <img
        src={img}
        alt="pipe-top"
        style={{
          position: "absolute",
          left: x,
          top: 0,
          width: width,
          height: gapY,
        }}
      />

      {/* Bottom pipe */}
      <img
        src={img}
        alt="pipe-bottom"
        style={{
          position: "absolute",
          left: x,
          top: gapY + gapSize,
          width: width,
          height: gameHeight - (gapY + gapSize),
        }}
      />
    </>
  );
}
