export const BIRD_HITBOX = {
  offsetX: 10,
  offsetY: 10,
  width: 40,
  height: 30,
};

export default function Bird({ y, img }) {
  return (
    <img
      src={img}
      alt=""
      style={{
        position: "absolute",
        left: 80,
        top: y,
        width: 90,
        height: 90,
      }}
    />
  );
}
