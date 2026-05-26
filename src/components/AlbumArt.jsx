
const AlbumArt = ({ song, size = 48, radius = 8 }) => {
  if (!song) return <div style={{ width: size, height: size, background: '#1a1635', borderRadius: radius }} />;
  console.log("Rendering AlbumArt for song:", song);
  const imageUrl = song.album_art || song.thumbnail;

  if (!imageUrl) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: song.color || "linear-gradient(135deg, #6D28D9cc, #6D28D944)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ddd6f3",
        fontSize: Math.floor(size * 0.45),
        flexShrink: 0,
      }}>
        ♫
      </div>
    );
  }

  return (
    <div style={{
      width: size,
      height: size,
      minWidth: size,
      borderRadius: radius,
      overflow: "hidden",
      flexShrink: 0
    }}>
      <img
        src={imageUrl}
        alt={song.title || ""}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    </div>
  );
};
export default AlbumArt;