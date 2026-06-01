import { useState } from 'react';
import toast from 'react-hot-toast';
import SongTable from '../SongTable';
import { saveSongToDB } from '../../api/songs';

const PlaylistView = ({ activePL, song, playing, liked, toggleLike, playSongFromPlaylist, setMenuPosition, setMenuSong, setPlMenuOpen, setPlMenuPos, playPlaylist }) => {
    const [sortBy, setSortBy] = useState(null); // "title" | "artist" | "duration"
    const [sortDir, setSortDir] = useState("asc");

    const handleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortBy(col); setSortDir("asc"); }
    };

    const sortedSongs = (activePL?.songs || []).slice().sort((a, b) => {
        if (!sortBy) return 0;
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortBy === "title") return a.title.localeCompare(b.title) * dir;
        if (sortBy === "artist") return a.artist.localeCompare(b.artist) * dir;
        if (sortBy === "duration") return (a.duration - b.duration) * dir;
        return 0;
    });

    const handlePlaylistMenuOpen = (e) => {
        const MENU_WIDTH = 200;
        const MENU_HEIGHT = 160;
        const RIGHT_PANEL_WIDTH = 300;
        const x = e.clientX + MENU_WIDTH > (window.innerWidth - RIGHT_PANEL_WIDTH) ? e.clientX - MENU_WIDTH : e.clientX;
        const y = e.clientY + MENU_HEIGHT > window.innerHeight ? e.clientY - MENU_HEIGHT : e.clientY;
        setPlMenuPos({ x, y });
        setPlMenuOpen(v => !v);
    };

    return (
        <div className="fadein">
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "flex-end", gap: 22, marginBottom: 28,
                background: `linear-gradient(135deg, ${activePL.color}22, transparent)`,
                borderRadius: 16, padding: "24px 24px 20px", flexWrap: "wrap"
            }}>
                <div style={{
                    width: 130, height: 130, borderRadius: 14, flexShrink: 0, overflow: "hidden",
                    background: activePL.thumbnail ? "transparent" : `linear-gradient(135deg, ${activePL.color}cc, ${activePL.color}44)`,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
                }}>
                    {activePL.thumbnail ? (
                        <img src={activePL.thumbnail} alt={activePL.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { e.target.style.display = "none"; e.target.parentElement.style.background = `linear-gradient(135deg, ${activePL.color}cc, ${activePL.color}44)`; }} />
                    ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, color: "#ddd6f3" }}>♫</div>
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#5a507a", textTransform: "uppercase", letterSpacing: ".08em" }}>Playlist</div>
                    <div style={{ fontSize: 34, fontWeight: 800, color: "#f0ecff", letterSpacing: "-0.03em" }}>{activePL.name}</div>
                    {activePL.description && <div style={{ fontSize: 14, color: "#a8a0c0", marginTop: 6, maxWidth: 420 }}>{activePL.description}</div>}
                    <div style={{ fontSize: 13, color: "#5a507a", marginTop: 6 }}>{activePL.count} songs · By You</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
                        <button onClick={() => playPlaylist(activePL)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#a78bfa", border: "none", color: "#08080f", borderRadius: 30, padding: "10px 26px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>Play
                        </button>
                        <button onClick={() => toast.info("Shuffle coming soon")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "1px solid #2a2050", color: "#c4b5fd", borderRadius: 30, padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Shuffle</button>
                        <button className="iBtn" onClick={handlePlaylistMenuOpen}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sort bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12, paddingLeft: 4 }}>
                {[["title", "Title"], ["artist", "Artist"], ["duration", "Duration"]].map(([col, label]) => (
                    <button key={col} onClick={() => handleSort(col)} style={{
                        background: sortBy === col ? "#1a1635" : "none",
                        border: `1px solid ${sortBy === col ? "#3a2f60" : "#1a1630"}`,
                        color: sortBy === col ? "#c4b5fd" : "#5a507a",
                        borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4
                    }}>
                        {label}
                        {sortBy === col && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                {sortDir === "asc"
                                    ? <path d="M12 19V5M5 12l7-7 7 7" />
                                    : <path d="M12 5v14M5 12l7 7 7-7" />}
                            </svg>
                        )}
                    </button>
                ))}
                {sortBy && (
                    <button onClick={() => { setSortBy(null); setSortDir("asc"); }} style={{ background: "none", border: "none", color: "#3a3060", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Reset</button>
                )}
            </div>

            <SongTable
                songs={sortedSongs}
                current={song}
                playing={playing}
                liked={liked}
                onPlay={(s) => {
                    const index = sortedSongs.findIndex(x => x.id === s.id);
                    playSongFromPlaylist(s, sortedSongs, index);
                    saveSongToDB(s);
                }}
                onLike={toggleLike}
                setMenuPosition={setMenuPosition}
                setMenuSong={setMenuSong}
            />
        </div>
    );
};

export default PlaylistView;