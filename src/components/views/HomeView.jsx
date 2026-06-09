import { useState } from 'react';
import AlbumArt from '../AlbumArt';
import SectionHead from '../SectionHead';

import useAudioPlayer from '../../hooks/useAudioPlayer';

import { useUIStateContext } from '../../context/UIStateContext';
import { usePlaylistContext } from '../../context/PlaylistsContext';
import { useRecentContext } from '../../context/RecentsContext';
import { usePlayerStore } from '../../stores/usePlayer.store';

const HomeView = () => {
    const VITE_USER_NAME = import.meta.env.VITE_USER_NAME || "User";
    const daytime = useState(["morning", "afternoon", "evening", "night"][(new Date().getHours() / 6) | 0])[0];

    const { play } = useAudioPlayer();
    const currentSong = usePlayerStore((s) => s.currentSong());
    const { recentPlaylists, recentSongs } = useRecentContext();
    const { openPlaylist, setActivePL } = usePlaylistContext();
    const { setView, setSidebarOpen } = useUIStateContext();

    return (
        <div className="fadein">
            <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", color: "#f0ecff", lineHeight: 1.1 }}>Good {daytime}, {VITE_USER_NAME}</div>
                <div style={{ fontSize: 14, color: "#5a507a", marginTop: 4 }}>Here's what's been playing lately</div>
            </div>

            {/* Quick access */}
            {recentPlaylists.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 30 }}>
                    {recentPlaylists.map(pl => (
                        <div key={pl.id} onClick={() => {
                            setActivePL(pl);
                            setView("playlist");
                            if (setSidebarOpen) { setSidebarOpen(false) }
                            openPlaylist(pl)
                        }} style={{
                            background: "#0e0c1c", border: "1px solid #13112a", borderRadius: 10,
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "8px 12px 8px 8px", cursor: "pointer", transition: "background .15s"
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = "#131022"}
                            onMouseLeave={e => e.currentTarget.style.background = "#0e0c1c"}>

                            <div style={{
                                width: 44, height: 44, borderRadius: 7, flexShrink: 0, overflow: "hidden",
                                background: pl.thumbnail ? "transparent" : `linear-gradient(135deg, ${pl.color}cc, ${pl.color}44)`,
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                            }}>
                                {pl.thumbnail
                                    ? <img src={`http://localhost:8000${pl.thumbnail}`} alt={pl.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                                    : "♫"
                                }
                            </div>

                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#ddd6f3" }}>{pl.name}</div>
                                <div style={{ fontSize: 11, color: "#5a507a" }}>{pl.count} songs</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <SectionHead title="Recently Played" />
            <div className="hero-scroll" style={{ marginBottom: 28 }}>
                {recentSongs.map(s => (
                    <div key={s.song_id} className="card" onClick={() => { play(s); }}>
                        <AlbumArt song={s} size={140} radius={10} />
                        <div style={{ marginTop: 11, fontSize: 13, fontWeight: 700, color: currentSong && currentSong.song_id === s.song_id ? "#a78bfa" : "#ddd6f3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
                        <div style={{ fontSize: 11, color: "#5a507a", marginTop: 2 }}>{s.artist}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeView;