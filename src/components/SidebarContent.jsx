export default function SidebarContent({ view, navTo, liked, playlists, activePL, setActivePL, setView, setSidebarOpen, openPlaylist }) {
    return (
        <>
            {/* Logo */}
            <div style={{ padding: "22px 20px 16px", flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>
                    <span style={{ color: "#a78bfa" }}>wa</span><span style={{ color: "#ddd6f3" }}>vify</span>
                </div>
                <div style={{ fontSize: 11, color: "#4a4060", marginTop: 1, letterSpacing: ".06em", textTransform: "uppercase" }}>Music Streaming</div>
            </div>

            {/* Nav */}
            <nav style={{ padding: "0 12px", flexShrink: 0 }}>
                {[
                    { id: "home", label: "Home", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
                    { id: "search", label: "Search", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg> },
                    { id: "liked", label: "Liked Songs", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> },
                ].map(n => (
                    <button key={n.id} className={`nav-item${view === n.id ? " active" : ""}`} onClick={() => navTo(n.id)}>
                        {n.icon}{n.label}
                        {n.id === "liked" && liked.size > 0 && (
                            <span style={{ marginLeft: "auto", fontSize: 10, background: "#1a1635", color: "#a78bfa", borderRadius: 10, padding: "1px 7px" }}>{liked.size}</span>
                        )}
                    </button>
                ))}
            </nav>

            <div style={{ height: 1, background: "#13112a", margin: "10px 20px" }} />

            {/* Library header */}

            <div style={{ padding: "0 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#4a4060", textTransform: "uppercase", letterSpacing: ".08em" }}>Your Library</span>
                <button className="iBtn" style={{ width: 24, height: 24 }} onClick={() => { setView("create"); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                </button>
            </div>

            {/* Playlists */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 12px" }}>
                <div className={`pl-li${view === "liked" ? " active-pl" : ""}`} onClick={() => navTo("liked")}>
                    <div style={{ width: 36, height: 36, borderRadius: 7, background: "linear-gradient(135deg,#7c3aed,#db2777)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#ddd6f3" }}>Liked Songs</div>
                        <div style={{ fontSize: 11, color: "#5a507a" }}>Playlist · {liked.size} songs</div>
                    </div>
                </div>
                {playlists.map(pl => (
                    <div key={pl.id}
                        className={`pl-li${activePL?.id === pl.id ? " active-pl" : ""}`}
                        onClick={() => { setActivePL(pl); setView("playlist"); if (setSidebarOpen) setSidebarOpen(false); openPlaylist(pl); }}>
                        <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: 7,
                            flexShrink: 0,
                            overflow: "hidden",
                            background: pl.thumbnail
                                ? "transparent"
                                : `linear-gradient(135deg, ${pl.color}cc, ${pl.color}44)`
                        }}>
                            {pl.thumbnail ? (
                                <img
                                    src={pl.thumbnail}
                                    alt={pl.name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: 7
                                    }}
                                    onError={(e) => {
                                        // Fallback if image fails to load
                                        e.target.style.display = 'none';
                                        e.target.parentElement.style.background = `linear-gradient(135deg, ${pl.color}cc, ${pl.color}44)`;
                                        // Optionally show music icon as final fallback
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 18,
                                    color: "#ddd6f3"
                                }}>
                                    ♫
                                </div>
                            )}
                        </div>

                        {/* Playlist Info */}
                        <div style={{ minWidth: 0 }}>
                            <div style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: "#ddd6f3",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>
                                {pl.name}
                            </div>
                            <div style={{
                                fontSize: 11,
                                color: "#5a507a"
                            }}>
                                Playlist · {pl.count} songs
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Profile footer */}
            <div style={{ padding: "12px 14px", borderTop: "1px solid #13112a", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, cursor: "pointer" }} onClick={() => { setView("profile"); if (setSidebarOpen) setSidebarOpen(false); }}>
                <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    flexShrink: 0, overflow: "hidden"
                }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/219/219970.png"
                        alt="pfp"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#ddd6f3" }}>Rishabh Jain</div>
                    <div style={{ fontSize: 11, color: "#5a507a" }}>@rishabhjn13</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a507a" strokeWidth="2" style={{ marginLeft: "auto", flexShrink: 0 }}><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
            </div>
        </>
    );
}
