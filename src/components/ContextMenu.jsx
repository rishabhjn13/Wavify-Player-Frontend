import AlbumArt from "./AlbumArt";

export default function ContextMenu({
    menuSong,
    menuRef,
    menuPosition,
    liked,
    toggleLike,
    notify,
    playlists,
    addToPlaylist,
    navTo,
    // Submenu states
    playlistSubmenu,
    setPlaylistSubmenu,
    submenuSide,
    setMenuSong
}) {

    if (!menuSong) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                style={{ position: "fixed", inset: 0, zIndex: 999 }}
                onClick={() => setMenuSong(null)}
            />

            {/* Menu */}
            <div
                ref={menuRef}
                style={{
                    position: "fixed",
                    left: menuPosition.x,
                    top: menuPosition.y,
                    background: "#0e0c1c",
                    border: "1px solid #1a1630",
                    borderRadius: 12,
                    padding: "6px 0",
                    zIndex: 1000,
                    minWidth: 215,
                    overflow: "visible",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                }}
            >
                {/* Song Header */}
                <div style={{
                    padding: "10px 14px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderBottom: "1px solid #131126",
                    marginBottom: 4,
                }}>
                    <AlbumArt song={menuSong} size={34} radius={6} />
                    <div style={{ minWidth: 0 }}>
                        <div style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#f0ecff",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>
                            {menuSong.title}
                        </div>
                        <div style={{ fontSize: 11, color: "#5a507a", marginTop: 1 }}>
                            {menuSong.artist}
                        </div>
                    </div>
                </div>

                {/* Like */}
                <div className="ctx-item" onClick={() => { toggleLike(menuSong.id); setMenuSong(null); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24"
                        fill={liked.has(menuSong.id) ? "#f472b6" : "none"}
                        stroke={liked.has(menuSong.id) ? "#f472b6" : "#8070a8"}
                        strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span style={{ color: liked.has(menuSong.id) ? "#f472b6" : "#c4b5fd" }}>
                        {liked.has(menuSong.id) ? "Unlike" : "Like"}
                    </span>
                </div>

                {/* Add to Queue */}
                <div className="ctx-item" onClick={() => { notify("Added to queue"); setMenuSong(null); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8070a8" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    Add to queue
                </div>

                {/* Add to Playlist */}
                <div
                    className="ctx-item"
                    style={{ position: "relative" }}
                    onMouseEnter={() => setPlaylistSubmenu(true)}
                    onMouseLeave={() => setPlaylistSubmenu(false)}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8070a8" strokeWidth="2">
                        <path d="M21 15V6" />
                        <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                        <path d="M12 12H3" />
                        <path d="M16 6H3" />
                        <path d="M12 18H3" />
                    </svg>
                    Add to playlist
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5a507a" strokeWidth="2" style={{ marginLeft: "auto" }}>
                        <path d="m9 18 6-6-6-6" />
                    </svg>

                    {/* Submenu */}
                    {playlistSubmenu && (
                        <div style={{
                            position: "absolute",
                            top: -6,
                            left: submenuSide === "left" ? "100%" : "auto",
                            right: submenuSide === "right" ? "100%" : "auto",
                            background: "#0e0c1c",
                            border: "1px solid #1a1630",
                            borderRadius: 10,
                            padding: "6px 0",
                            minWidth: 190,
                            maxHeight: 240,
                            overflowY: "auto",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                            zIndex: 1001,
                        }}>
                            {playlists.length === 0 ? (
                                <div style={{ padding: "10px 14px", fontSize: 12, color: "#5a507a" }}>
                                    No playlists yet
                                </div>
                            ) : (
                                playlists.map(pl => (
                                    <div
                                        key={pl.id}
                                        className="ctx-item"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await addToPlaylist(pl.id, menuSong);
                                            notify(`Added to "${pl.name}"`);
                                            setMenuSong(null);
                                            setPlaylistSubmenu(false);
                                        }}
                                    >
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 5, flexShrink: 0,
                                            background: pl.color || "#1a1635",
                                            backgroundImage: pl.thumbnail ? `url(${pl.thumbnail})` : "none",
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                        }} />
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: 13, color: "#ddd6f3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {pl.name}
                                            </div>
                                            <div style={{ fontSize: 11, color: "#5a507a" }}>{pl.count} songs</div>
                                        </div>
                                    </div>
                                ))
                            )}

                            <div style={{ height: 1, background: "#131126", margin: "4px 0" }} />
                            <div className="ctx-item" onClick={() => { setMenuSong(null); navTo("create"); }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8070a8" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                <span style={{ color: "#8070a8", fontSize: 13 }}>New playlist</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Go to Artist */}
                <div className="ctx-item" onClick={() => { notify("Going to artist"); setMenuSong(null); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8070a8" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    Go to artist
                </div>
            </div>
        </>
    );
}