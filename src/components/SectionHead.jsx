export default function SectionHead({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#f0ecff", letterSpacing: "-0.02em" }}>{title}</div>
    </div>
  );
}
