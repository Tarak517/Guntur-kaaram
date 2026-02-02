import React from "react";

export default function Score({ score }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 20,
        fontSize: "24px",
        fontWeight: "bold",
      }}
    >
      Score: {score}
    </div>
  );
}
