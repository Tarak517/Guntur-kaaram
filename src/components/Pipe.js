// Pipe.js
export default function Pipe({ x, gapY, gapSize, width, img, gameHeight }) {
  return (
    <>
      {/* TOP PIPE (REVERSED) */}
      <img
        src={img}
        alt=""
        style={{
          position: "absolute",
          left: x,
          top: 0,
          width: width,
          height: gapY,
          transform: "rotate(180deg)",
        }}
      />

      {/* BOTTOM PIPE (NORMAL) */}
      <img
        src={img}
        alt=""
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
