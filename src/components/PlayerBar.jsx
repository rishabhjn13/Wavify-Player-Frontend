import AlbumArt from "./AlbumArt";
import fmt from "../utils/fmt";

export default function PlayerBar({ song, playing, progress, toggleLike, liked, toggle, next, prev, shuffle, setShuffle, repeat, setRepeat, volume, setVolume, setRightPanel, setProgress, rightPanel, pct, audioRef, notify }) {
    return (
        <div>
            <div className="player-bar player-bar-desktop" style={{
                background: "#09081a", borderTop: "1px solid #131126",
                display: "grid", gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center", padding: "0 24px", gap: 16, zIndex: 20, height: 90,
            }}>
                {/* Left: song info */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                    <AlbumArt song={song} size={52} radius={9} />
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#f0ecff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.title}</div>
                        <div style={{ fontSize: 12, color: "#5a507a", marginTop: 1 }}>{song.artist} · {song.album}</div>
                    </div>
                    <button className={`iBtn${liked.has(song.id) ? " heart-lit" : ""}`} onClick={() => toggleLike(song.id)} style={{ marginLeft: 4, flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={liked.has(song.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </button>
                </div>

                {/* Center: controls + progress */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 420 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button className={`iBtn${shuffle ? " lit" : ""}`} onClick={() => { setShuffle(s => !s); notify(shuffle ? "Shuffle off" : "Shuffle on"); }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /></svg>
                        </button>
                        <button className="iBtn" onClick={prev} style={{ color: "#c4b5fd" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
                        </button>

                        {/* Play Button  */}
                        <button onClick={toggle} style={{ width: 46, height: 46, borderRadius: "50%", background: "#a78bfa", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 0 18px #a78bfa44", transition: "transform .1s,box-shadow .15s" }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 0 28px #a78bfa66"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 18px #a78bfa44"; }}>
                            {playing
                                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="#08080f"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                                : <svg width="18" height="18" viewBox="0 0 24 24" fill="#08080f"><polygon points="5 3 19 12 5 21 5 3" /></svg>}
                        </button>
                        <button className="iBtn" onClick={next} style={{ color: "#c4b5fd" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                        </button>
                        <button className={`iBtn${repeat ? " lit" : ""}`} onClick={() => { setRepeat(r => !r); notify(repeat ? "Repeat off" : "Repeat on"); }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
                        </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                        <span style={{ fontSize: 11, color: "#5a507a", minWidth: 34, textAlign: "right" }}>{fmt(progress)}</span>
                        <input type="range" className="pbar" min={0} max={song.duration} value={progress} onChange={e => {
                            const val = Number(e.target.value);
                            setProgress(val);
                            audioRef.current.currentTime = val;
                        }}
                            style={{ background: `linear-gradient(to right, #a78bfa ${pct}%, #1a1635 ${pct}%)` }} />
                        <span style={{ fontSize: 11, color: "#5a507a", minWidth: 34 }}>
                            {song.duration ? fmt(song.duration) : "0:00"}
                        </span>
                    </div>
                </div>

                {/* Right: volume */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                    <button className="iBtn" onClick={() => setRightPanel("queue")} style={{ color: rightPanel === "queue" ? "#a78bfa" : "#5a507a" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                    </button>
                    <button className="iBtn" onClick={() => setRightPanel("nowplaying")} style={{ color: rightPanel === "nowplaying" ? "#a78bfa" : "#5a507a" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="12" cy="12" r="4" /></svg>
                    </button>
                    <button className="iBtn" onClick={() => setVolume(v => v === 0 ? 75 : 0)} style={{ color: "#8070a8" }}>
                        {volume === 0
                            ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                            : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>}
                    </button>
                    <input type="range" className="vbar" min={0} max={100} value={volume} onChange={e => setVolume(Number(e.target.value))}
                        style={{ background: `linear-gradient(to right, #a78bfa ${volume}%, #1a1635 ${volume}%)` }} />
                </div>
            </div>
            <div className="player-bar player-bar-mobile">
                <div className="mobile-progress">
                    <div className="mobile-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="mobile-mini-player">
                    <AlbumArt song={song} size={42} radius={7} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#f0ecff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.title}</div>
                        <div style={{ fontSize: 11, color: "#5a507a" }}>{song.artist}</div>
                    </div>
                    <button className={`iBtn${liked.has(song.id) ? " heart-lit" : ""}`} onClick={() => toggleLike(song.id)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={liked.has(song.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    </button>
                    <button onClick={toggle} style={{ width: 40, height: 40, borderRadius: "50%", background: "#a78bfa", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        {playing
                            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#08080f"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                            : <svg width="16" height="16" viewBox="0 0 24 24" fill="#08080f"><polygon points="5 3 19 12 5 21 5 3" /></svg>}
                    </button>
                    <button className="iBtn" onClick={next}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#c4b5fd" }}><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                    </button>
                </div>
            </div>
        </div>

    );
}