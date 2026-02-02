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
      <img
        src={img}
        alt="pipe-top"
        style={{
          position: "absolute",
          left: x,
          top: 0,
          width,
          height: gapY,
          objectFit: "cover",
        }}
      />

      <img
        src={img}
        alt="pipe-bottom"
        style={{
          position: "absolute",
          left: x,
          top: gapY + gapSize,
          width,
          height: gameHeight - (gapY + gapSize),
          objectFit: "cover",
        }}
      />
    </>
  );
}
