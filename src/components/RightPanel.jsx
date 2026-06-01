import AlbumArt from "./AlbumArt";
import fmt from '../utils/fmt';
import Bars from "./Bars";
import { SONGS, ARTISTS } from "../constants/dummy.data";
import { usePlayerStore } from "../stores/usePlayer.store";

export default function RightPanel({ rightPanel, playing, liked, toggleLike, play, setView, setActiveArtist}) {
    const queue = usePlayerStore((s) => s.queue);
    const currentIndex = usePlayerStore((s) => s.currentIndex);
    const currentSong = queue[currentIndex] || null;

    if (rightPanel === "nowplaying") return (
        <div style={{ textAlign: "center", paddingTop: 16 }}>
            <div style={{
                margin: "0 auto 28px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%"
            }}>
                <AlbumArt song={currentSong} size={190} radius={16} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f0ecff", letterSpacing: "-0.02em" }}>{currentSong?.title ?? "Unknown Title"}</div>
            <div style={{ fontSize: 13, color: "#5a507a", marginTop: 4 }}>{currentSong?.artist ?? "Unknown Artist"}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
                <span style={{ fontSize: 11, background: "#1a1635", color: "#a78bfa", borderRadius: 6, padding: "3px 10px" }}>{currentSong?.genre ?? "Unknown Genre"}</span>
                <span style={{ fontSize: 11, background: "#13112a", color: "#5a507a", borderRadius: 6, padding: "3px 10px" }}>{currentSong?.album ?? "Unknown Album"}</span>
            </div>
            <div style={{ margin: "20px 0", padding: "14px", background: "#0e0c1c", borderRadius: 12, border: "1px solid #1a1630", textAlign: "left" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#3a3060", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Track Info</div>
                {[["Duration", fmt(currentSong?.duration)], ["Plays", currentSong?.plays], ["Year", currentSong?.year], ["Genre", currentSong?.genre]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #0d0b1a", fontSize: 12 }}>
                        <span style={{ color: "#5a507a" }}>{k}</span><span style={{ color: "#c4b5fd", fontWeight: 500 }}>{v}</span>
                    </div>
                ))}
            </div>
            <button onClick={() => toggleLike(currentSong?.id)} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "none", border: `1px solid ${liked.has(currentSong?.id) ? "#f472b688" : "#2a2050"}`, borderRadius: 30, padding: "9px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: liked.has(currentSong?.id) ? "#f472b6" : "#8070a8", transition: "all .15s" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill={liked.has(currentSong?.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                {liked.has(currentSong?.id) ? "Liked" : "Like"}
            </button>
        </div>
    );

    if (rightPanel === "queue") return (
        <>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#3a3060", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10, paddingLeft: 4 }}>Now Playing</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#130f22", borderRadius: 9, marginBottom: 16 }}>
                <AlbumArt song={currentSong} size={40} radius={7} />
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentSong?.title ?? "Unknown Title"}</div>
                    <div style={{ fontSize: 11, color: "#5a507a" }}>{currentSong?.artist ?? "Unknown Artist"}</div>
                </div>
                <Bars playing={playing} color="#a78bfa" />
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#3a3060", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10, paddingLeft: 4 }}>
                Next Up · {queue.slice(currentIndex + 1).length} songs
            </div>
            {queue.slice(currentIndex + 1).length === 0 && (
                <div style={{ fontSize: 12, color: "#3a3060", paddingLeft: 4 }}>No songs queued</div>
            )}
            {queue.slice(currentIndex + 1).map((s, i) => (
                <div key={`${s.id}-${i}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#100e1e"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => play(s)}>
                    <AlbumArt song={s} size={36} radius={6} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#ddd6f3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title ?? "Unknown Title"}</div>
                        <div style={{ fontSize: 11, color: "#5a507a" }}>{s.artist ?? "Unknown Artist"}</div>
                    </div>
                    <span style={{ fontSize: 11, color: "#3a3060" }}>{fmt(s.duration)}</span>
                </div>
            ))}
        </>
    );

    if (rightPanel === "related") return (
        <>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#3a3060", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12, paddingLeft: 4 }}>Similar Artists</div>
            {ARTISTS.map(a => (
                <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 9, cursor: "pointer", marginBottom: 4 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#100e1e"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => { setActiveArtist(a); setView("artists"); }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${a.color}cc,${a.color}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{a.name[0]}</div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#ddd6f3" }}>{a.name ?? "Unknown Artist"}</div>
                        <div style={{ fontSize: 11, color: "#5a507a" }}>{a.songs.length} songs</div>
                    </div>
                </div>
            ))}
            <div style={{ height: 1, background: "#13112a", margin: "14px 0" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#3a3060", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12, paddingLeft: 4 }}>More in {currentSong?.genre ?? "Unknown Genre"}</div>
            {SONGS.filter(s => s.genre === currentSong?.genre && s.id !== currentSong?.id).map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 4 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#100e1e"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => play(s)}>
                    <AlbumArt song={s} size={36} radius={6} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#ddd6f3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title ?? "Unknown Title"}</div>
                        <div style={{ fontSize: 11, color: "#5a507a" }}>{s.artist ?? "Unknown Artist"}</div>
                    </div>
                </div>
            ))}
        </>
    );

    return null;
}