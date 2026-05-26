export default function Bars({ playing, color = "#a78bfa" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 14 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={playing ? `wbar wbar-${i}` : "wbar-s"} style={{
          width: 3, borderRadius: 2, background: color,
          height: playing ? undefined : [8, 5, 10, 6][i - 1],
        }} />
      ))}
    </div>
  );
}