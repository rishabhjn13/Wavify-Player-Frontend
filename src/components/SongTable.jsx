import Bars from "./Bars";
import AlbumArt from "./AlbumArt";

export default function SongTable({ songs, current, playing, liked, onPlay, onLike, setMenuPosition, setMenuSong, compact = false }) {
  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: compact ? "20px 36px 1fr 50px" : "20px 36px 1fr 80px 60px 50px",
        gap: 10, padding: "5px 14px 8px", borderBottom: "1px solid #0d0b1a", marginBottom: 4,
      }}>
        {(compact ? ["#", "", "Title", ""] : ["#", "", "Title", "Album", "Plays", ""]).map((h, i) => (
          <div key={i} style={{ fontSize: 11, fontWeight: 700, color: "#3a3060", textTransform: "uppercase", letterSpacing: ".06em" }}>{h}</div>
        ))}
      </div>
      {songs.filter(Boolean).map((s, i) => (
        <div
          key={s.id}
          className={`song-row${current.id === s.id ? " active-row" : ""}`}
          onClick={() => onPlay(s)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();

            const MENU_HEIGHT = 280;
            const MENU_WIDTH = 215;

            const x = e.clientX + MENU_WIDTH > window.innerWidth
              ? e.clientX - MENU_WIDTH
              : e.clientX;

            const y = e.clientY + MENU_HEIGHT > window.innerHeight
              ? e.clientY - MENU_HEIGHT
              : e.clientY;

            setMenuPosition({ x, y });
            setMenuSong(s);
          }}
          style={{
            display: "grid",
            gridTemplateColumns: compact ? "20px 36px 1fr 50px 40px" : "20px 36px 1fr 80px 60px 50px 40px",
            alignItems: "center",
            gap: 10,
            padding: "7px 14px",
            borderRadius: 8,
            cursor: "pointer",
            position: "relative"
          }}
        >
          <div style={{ fontSize: 12, color: "#3a3060", textAlign: "center" }}>
            {current.id === s.id ? <Bars playing={playing} color="#a78bfa" /> : <span>{i + 1}</span>}
          </div>

          <AlbumArt song={s} size={36} radius={6} />

          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 13.5,
              fontWeight: current.id === s.id ? 600 : 400,
              color: current.id === s.id ? "#a78bfa" : "#ddd6f3",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {s.title}
            </div>
            <div style={{ fontSize: 11.5, color: "#5a507a" }}>{s.artist}</div>
          </div>

          {!compact && <div style={{ fontSize: 12, color: "#5a507a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.album}</div>}
          {!compact && <div style={{ fontSize: 12, color: "#3a3060" }}>{s.plays}</div>}

          {/* Like Button */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              className={`iBtn${liked.has(s.id) ? " heart-lit" : ""}`}
              style={{ width: 26, height: 26 }}
              onClick={e => { e.stopPropagation(); onLike(s.id); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={liked.has(s.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Three Dots Menu Button */}
          <button
            className="iBtn"
            style={{ width: 28, height: 28, opacity: 0.7 }}
            onClick={(e) => {
              e.stopPropagation();

              const MENU_HEIGHT = 280;
              const MENU_WIDTH = 215;

              const x = e.clientX + MENU_WIDTH > window.innerWidth
                ? e.clientX - MENU_WIDTH
                : e.clientX;

              const y = e.clientY + MENU_HEIGHT > window.innerHeight
                ? e.clientY - MENU_HEIGHT
                : e.clientY;

              setMenuPosition({ x, y });
              setMenuSong(s);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>

        </div>
      ))}
    </div>
  );
}