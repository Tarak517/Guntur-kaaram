export default function Score({ score }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        fontSize: 24,
        color: "#fff",
        fontWeight: "bold",
        textShadow: "2px 2px 4px #000",
      }}
    >
      Score: {score}
    </div>
  );
}
