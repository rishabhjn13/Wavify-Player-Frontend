import { SONGS, RECENT, TRENDING, NEW_REL, ARTISTS, PLAYLISTS } from '../constants/dummy.data';
import Bars from './Bars';
import AlbumArt from './AlbumArt';
import SectionHead from './SectionHead';
import SongTable from './SongTable';

export default function MainContent({ view, song, playing, liked, activePL, activeArtist, setActivePL, setActiveArtist, setView, playlists, setPlaylists, play, toggleLike, notify, search, setSearch, filtered, createName, setCreateName, thumbnailPreview, handleThumbnailUpload, createDescription, setCreateDescription, handleCreatePlaylist, selectedColor, setSelectedColor, menuSong, setMenuSong, menuPosition, setMenuPosition }) {
    const navTo = (v) => { setView(v); setActivePL(null); setActiveArtist(null); };
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 769;

    return (
        <>
            {/* HOME */}
            {view === "home" && (
                <div className="fadein">
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", color: "#f0ecff", lineHeight: 1.1 }}>Good evening</div>
                        <div style={{ fontSize: 14, color: "#5a507a", marginTop: 4 }}>Here's what's been playing lately</div>
                    </div>

                    {/* Quick access */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 30 }}>
                        {RECENT.slice(0, 6).map(id => {
                            const s = SONGS.find(x => x.id === id);
                            return (
                                <div key={id} onClick={() => play(s)} style={{ background: "#0e0c1c", border: "1px solid #13112a", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 8px 8px", cursor: "pointer", transition: "background .15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#131022"}
                                    onMouseLeave={e => e.currentTarget.style.background = "#0e0c1c"}>
                                    <AlbumArt song={s} size={44} radius={7} />
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: song.id === s.id ? "#a78bfa" : "#ddd6f3" }}>{s.title}</div>
                                        <div style={{ fontSize: 11, color: "#5a507a" }}>{s.artist}</div>
                                    </div>
                                    {song.id === s.id && <Bars playing={playing} color="#a78bfa" />}
                                </div>
                            );
                        })}
                    </div>

                    <SectionHead title="Trending Now 🔥" />
                    <div className="hero-scroll" style={{ marginBottom: 28 }}>
                        {TRENDING.map(id => {
                            const s = SONGS.find(x => x.id === id);
                            return (
                                <div key={id} className="card" onClick={() => play(s)}>
                                    <AlbumArt song={s} size={140} radius={10} />
                                    <div style={{ marginTop: 11, fontSize: 13, fontWeight: 700, color: song.id === s.id ? "#a78bfa" : "#ddd6f3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
                                    <div style={{ fontSize: 11, color: "#5a507a", marginTop: 2 }}>{s.artist}</div>
                                    <div style={{ fontSize: 11, color: "#3a3060", marginTop: 1 }}>{s.plays} plays</div>
                                </div>
                            );
                        })}
                    </div>

                    <SectionHead title="New Releases ✨" />
                    <div className="hero-scroll" style={{ marginBottom: 28 }}>
                        {NEW_REL.map(id => {
                            const s = SONGS.find(x => x.id === id);
                            return (
                                <div key={id} className="card" onClick={() => play(s)}>
                                    <AlbumArt song={s} size={140} radius={10} />
                                    <div style={{ marginTop: 11, fontSize: 13, fontWeight: 700, color: song.id === s.id ? "#a78bfa" : "#ddd6f3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
                                    <div style={{ fontSize: 11, color: "#5a507a", marginTop: 2 }}>{s.artist}</div>
                                    <div style={{ display: "inline-block", marginTop: 6, fontSize: 10, background: "#1a1635", color: "#a78bfa", borderRadius: 6, padding: "2px 8px" }}>{s.genre}</div>
                                </div>
                            );
                        })}
                    </div>

                    <SectionHead title="All Songs" />
                    <SongTable songs={SONGS} current={song} playing={playing} liked={liked} onPlay={play} onLike={toggleLike} setMenuPosition={setMenuPosition} setMenuSong={setMenuSong} />
                </div>
            )}

            {/* SEARCH */}
            {view === "search" && (
                <div className="fadein">
                    {search ? (
                        <>
                            <div style={{ fontSize: 13, color: "#5a507a", marginBottom: 14 }}>{filtered.length} results for "{search}"</div>
                            <SongTable songs={filtered} current={song} playing={playing} liked={liked} onPlay={play} onLike={toggleLike} setMenuPosition={setMenuPosition} setMenuSong={setMenuSong} />
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#ddd6f3", marginBottom: 16 }}>Browse by genre</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginBottom: 28 }}>
                                {[
                                    { g: "Electronic", c: "#4C1D95" }, { g: "Ambient", c: "#0F766E" },
                                    { g: "Indie", c: "#BE185D" }, { g: "Rock", c: "#7C2D12" },
                                    { g: "Chillout", c: "#1D4ED8" }, { g: "All", c: "#1e1635" },
                                ].map(({ g, c }) => (
                                    <div key={g} onClick={() => setSearch(g === "All" ? "" : g)} style={{ borderRadius: 12, height: 80, background: `linear-gradient(135deg,${c}cc,${c}44)`, display: "flex", alignItems: "flex-end", padding: "12px 14px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#fff", transition: "opacity .15s" }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
                                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                                        {g}
                                    </div>
                                ))}
                            </div>
                            <SectionHead title="All Songs" />
                            <SongTable songs={SONGS} current={song} playing={playing} liked={liked} onPlay={play} onLike={toggleLike} setMenuPosition={setMenuPosition} setMenuSong={setMenuSong} />
                        </>
                    )}
                </div>
            )}

            {/* LIKED */}
            {view === "liked" && (
                <div className="fadein">
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 22, marginBottom: 28, background: "linear-gradient(135deg,#3b0d6e44,transparent)", borderRadius: 16, padding: "24px 24px 20px", flexWrap: "wrap" }}>
                        <div style={{ width: 130, height: 130, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#db2777)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="58" height="58" viewBox="0 0 24 24" fill="#fff"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#5a507a", textTransform: "uppercase", letterSpacing: ".08em" }}>Playlist</div>
                            <div style={{ fontSize: 34, fontWeight: 800, color: "#f0ecff", letterSpacing: "-0.03em" }}>Liked Songs</div>
                            <div style={{ fontSize: 13, color: "#5a507a", marginTop: 4 }}>{liked.size} songs</div>
                            <button onClick={() => { const first = SONGS.find(s => liked.has(s.id)); if (first) play(first); }} style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, background: "#a78bfa", border: "none", color: "#08080f", borderRadius: 30, padding: "10px 26px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>Play
                            </button>
                        </div>
                    </div>
                    <SongTable songs={SONGS.filter(s => liked.has(s.id))} current={song} playing={playing} liked={liked} onPlay={play} onLike={toggleLike} setMenuPosition={setMenuPosition} setMenuSong={setMenuSong} />
                    {liked.size === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "#3a3060", fontSize: 15 }}>No liked songs yet — click ♥ to save songs here</div>}
                </div>
            )}

            {/* PLAYLIST */}
            {view === "playlist" && activePL && (
                <div className="fadein">
                    {/* Hero Header with Thumbnail */}
                    <div style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 22,
                        marginBottom: 28,
                        background: `linear-gradient(135deg, ${activePL.color}22, transparent)`,
                        borderRadius: 16,
                        padding: "24px 24px 20px",
                        flexWrap: "wrap"
                    }}>

                        {/* Thumbnail / Cover Art */}
                        <div style={{
                            width: 130,
                            height: 130,
                            borderRadius: 14,
                            flexShrink: 0,
                            overflow: "hidden",
                            background: activePL.thumbnail
                                ? "transparent"
                                : `linear-gradient(135deg, ${activePL.color}cc, ${activePL.color}44)`,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
                        }}>
                            {activePL.thumbnail ? (
                                <img
                                    src={activePL.thumbnail}
                                    alt={activePL.name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.style.background = `linear-gradient(135deg, ${activePL.color}cc, ${activePL.color}44)`;
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 52,
                                    color: "#ddd6f3"
                                }}>
                                    ♫
                                </div>
                            )}
                        </div>

                        {/* Playlist Info */}
                        <div>
                            <div style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#5a507a",
                                textTransform: "uppercase",
                                letterSpacing: ".08em"
                            }}>
                                Playlist
                            </div>

                            <div style={{
                                fontSize: 34,
                                fontWeight: 800,
                                color: "#f0ecff",
                                letterSpacing: "-0.03em"
                            }}>
                                {activePL.name}
                            </div>

                            {activePL.description && (
                                <div style={{
                                    fontSize: 14,
                                    color: "#a8a0c0",
                                    marginTop: 6,
                                    maxWidth: 420
                                }}>
                                    {activePL.description}
                                </div>
                            )}

                            <div style={{
                                fontSize: 13,
                                color: "#5a507a",
                                marginTop: 6
                            }}>
                                {activePL.count} songs · By You
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                                <button
                                    onClick={() => {
                                        if (activePL.songs && activePL.songs.length > 0) {
                                            play(activePL.songs[0]);   // Play first song
                                        } else {
                                            notify("This playlist is empty");
                                        }
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        background: "#a78bfa",
                                        border: "none",
                                        color: "#08080f",
                                        borderRadius: 30,
                                        padding: "10px 26px",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        fontFamily: "inherit"
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                    Play
                                </button>

                                <button
                                    onClick={() => notify("Playlist shuffled!")}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        background: "none",
                                        border: "1px solid #2a2050",
                                        color: "#c4b5fd",
                                        borderRadius: 30,
                                        padding: "10px 22px",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        fontFamily: "inherit"
                                    }}
                                >
                                    Shuffle
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Song Table */}
                    {console.log(activePL.songs)}
                    <SongTable
                        songs={activePL.songs || []}
                        current={song}
                        playing={playing}
                        liked={liked}
                        onPlay={play}
                        onLike={toggleLike}
                        setMenuPosition={setMenuPosition}
                        setMenuSong={setMenuSong}
                    />
                </div>
            )}

            {/* ARTISTS */}
            {view === "artists" && !activeArtist && (
                <div className="fadein">
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#f0ecff", marginBottom: 6 }}>Artists</div>
                    <div style={{ fontSize: 14, color: "#5a507a", marginBottom: 22 }}>All artists in your library</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
                        {ARTISTS.map(a => (
                            <div key={a.name} className="card" onClick={() => setActiveArtist(a)} style={{ textAlign: "center", padding: "20px 14px" }}>
                                <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg,${a.color}cc,${a.color}44)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28, fontWeight: 700 }}>{a.name[0]}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd6f3" }}>{a.name}</div>
                                <div style={{ fontSize: 11, color: "#5a507a", marginTop: 3 }}>{a.songs.length} songs</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {view === "artists" && activeArtist && (
                <div className="fadein">
                    <button onClick={() => setActiveArtist(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontSize: 13, fontFamily: "inherit", marginBottom: 18 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m15 18-6-6 6-6" /></svg>All Artists
                    </button>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 22, marginBottom: 28, flexWrap: "wrap" }}>
                        <div style={{ width: 130, height: 130, borderRadius: "50%", background: `linear-gradient(135deg,${activeArtist.color}cc,${activeArtist.color}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, fontWeight: 800, flexShrink: 0 }}>{activeArtist.name[0]}</div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#5a507a", textTransform: "uppercase", letterSpacing: ".08em" }}>Artist</div>
                            <div style={{ fontSize: 36, fontWeight: 800, color: "#f0ecff", letterSpacing: "-0.03em" }}>{activeArtist.name}</div>
                            <div style={{ fontSize: 13, color: "#5a507a", marginTop: 4 }}>{activeArtist.songs.length} songs</div>
                            <button onClick={() => { const s = SONGS.find(x => x.id === activeArtist.songs[0]); if (s) play(s); }} style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, background: "#a78bfa", border: "none", color: "#08080f", borderRadius: 30, padding: "10px 26px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>Play Artist
                            </button>
                        </div>
                    </div>
                    <SongTable songs={activeArtist.songs.map(id => SONGS.find(x => x.id === id)).filter(Boolean)} current={song} playing={playing} liked={liked} onPlay={play} onLike={toggleLike} setMenuPosition={setMenuPosition} setMenuSong={setMenuSong} />
                </div>
            )}

            {/* CREATE */}
            {view === "create" && (
                <div className="fadein" style={{ maxWidth: 560 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#f0ecff", marginBottom: 6 }}>Create Playlist</div>
                    <div style={{ fontSize: 14, color: "#5a507a", marginBottom: 24 }}>Build your perfect collection</div>

                    <div style={{ background: "#0e0c1c", border: "1px solid #1a1630", borderRadius: 14, padding: 20, marginBottom: 18 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Playlist Details</div>

                        {/* Thumbnail Upload */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Cover Image</div>

                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div
                                    style={{
                                        width: 110,
                                        height: 110,
                                        borderRadius: 12,
                                        border: "2px dashed #2a2050",
                                        background: thumbnailPreview ? "transparent" : "#131022",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        position: "relative"
                                    }}
                                    onClick={() => document.getElementById('thumbnail-upload').click()}
                                >
                                    {thumbnailPreview ? (
                                        <img
                                            src={thumbnailPreview}
                                            alt="Preview"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div style={{ textAlign: "center", color: "#5a507a" }}>
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 5v14M5 12h14" />
                                            </svg>
                                            <div style={{ fontSize: 12, marginTop: 6 }}>Upload Image</div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <input
                                        type="file"
                                        id="thumbnail-upload"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleThumbnailUpload}
                                    />
                                    <button
                                        className="cbtn"
                                        style={{ padding: "8px 16px", fontSize: 13, width: "auto" }}
                                        onClick={() => document.getElementById('thumbnail-upload').click()}
                                    >
                                        Choose Image
                                    </button>
                                    <div style={{ fontSize: 11, color: "#5a507a", marginTop: 8 }}>
                                        Recommended: 300×300px or larger<br />
                                        JPG, PNG, WebP
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Name & Description */}
                        <input
                            className="cin"
                            placeholder="Playlist name…"
                            value={createName}
                            onChange={e => setCreateName(e.target.value)}
                            style={{ marginBottom: 10 }}
                        />

                        <input
                            className="cin"
                            placeholder="Add a description…"
                            value={createDescription}
                            onChange={e => setCreateDescription(e.target.value)}
                            style={{ marginBottom: 14 }}
                        />

                        {/* Color Picker */}
                        <div style={{ fontSize: 11, color: "#5a507a", marginBottom: 8 }}>Cover color (fallback)</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {["#7c3aed", "#0f766e", "#be185d", "#b45309", "#1d4ed8", "#065f46", "#4c1d95", "#831843"].map(c => (
                                <div
                                    key={c}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 7,
                                        background: c,
                                        cursor: "pointer",
                                        transition: "transform .15s",
                                        border: selectedColor === c ? "2px solid #c4b5fd" : "none"
                                    }}
                                    onClick={() => setSelectedColor(c)}
                                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Create Button */}
                    <button
                        className="cbtn"
                        style={{ marginBottom: 22 }}
                        onClick={handleCreatePlaylist}
                    >
                        Create Playlist
                    </button>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#5a507a", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Add Songs</div>
                    {SONGS.map(s => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 10px", borderRadius: 9, cursor: "pointer" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#0e0c1c"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <AlbumArt song={s} size={40} radius={7} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: "#ddd6f3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
                                <div style={{ fontSize: 11, color: "#5a507a" }}>{s.artist}</div>
                            </div>
                            <button className="iBtn" style={{ color: "#a78bfa" }} onClick={() => notify(`"${s.title}" added`)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* PROFILE */}
            {view === "profile" && (
                <div className="fadein">
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 22, marginBottom: 32, background: "linear-gradient(135deg,#3b0d6e33,transparent)", borderRadius: 16, padding: "28px 28px 24px", flexWrap: "wrap" }}>
                        <div style={{ width: 130, height: 130, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, fontWeight: 800, flexShrink: 0 }}>U</div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#5a507a", textTransform: "uppercase", letterSpacing: ".08em" }}>Profile</div>
                            <div style={{ fontSize: 36, fontWeight: 800, color: "#f0ecff", letterSpacing: "-0.03em" }}>User</div>
                            <div style={{ display: "flex", gap: 28, marginTop: 12, flexWrap: "wrap" }}>
                                {[["Songs", SONGS.length], ["Playlists", PLAYLISTS.length], ["Liked", liked.size]].map(([l, v]) => (
                                    <div key={l}><span style={{ fontWeight: 700, color: "#a78bfa" }}>{v}</span> <span style={{ fontSize: 13, color: "#5a507a" }}>{l}</span></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#ddd6f3", marginBottom: 14 }}>Recently Played</div>
                    <SongTable songs={RECENT.map(id => SONGS.find(x => x.id === id))} current={song} playing={playing} liked={liked} onPlay={play} onLike={toggleLike} setMenuPosition={setMenuPosition} setMenuSong={setMenuSong} />
                </div>
            )}

            {/* SETTINGS */}
            {view === "settings" && (
                <div className="fadein" style={{ maxWidth: 520 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#f0ecff", marginBottom: 24 }}>Settings</div>
                    {[
                        { title: "Account", items: ["Edit profile", "Change email", "Change password", "Delete account"] },
                        { title: "Playback", items: ["Audio quality", "Crossfade", "Equalizer", "Normalize volume"] },
                        { title: "Notifications", items: ["New releases", "Playlist updates", "Friend activity"] },
                        { title: "Privacy", items: ["Private session", "Listening history", "Social sharing"] },
                    ].map(sec => (
                        <div key={sec.title} style={{ background: "#0e0c1c", border: "1px solid #1a1630", borderRadius: 14, marginBottom: 14, overflow: "hidden" }}>
                            <div style={{ padding: "14px 18px", borderBottom: "1px solid #13112a", fontSize: 12, fontWeight: 700, color: "#5a507a", textTransform: "uppercase", letterSpacing: ".08em" }}>{sec.title}</div>
                            {sec.items.map(item => (
                                <div key={item} onClick={() => notify(`${item} — coming soon`)} style={{ display: "flex", alignItems: "center", padding: "13px 18px", cursor: "pointer", borderBottom: "1px solid #0d0b1a", fontSize: 14, color: "#c4b5fd", transition: "background .12s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#13112a"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    {item}
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3a3060" strokeWidth="2" style={{ marginLeft: "auto" }}><path d="m9 18 6-6-6-6" /></svg>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}