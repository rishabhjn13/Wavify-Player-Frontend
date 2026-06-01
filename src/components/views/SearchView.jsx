import SongTable from '../SongTable';
import SectionHead from '../SectionHead';
import { saveSongToDB } from '../../api/songs';

const GENRES = [
    { g: "Electronic", c: "#4C1D95" }, { g: "Ambient", c: "#0F766E" },
    { g: "Indie", c: "#BE185D" },      { g: "Rock", c: "#7C2D12" },
    { g: "Chillout", c: "#1D4ED8" },   { g: "All", c: "#1e1635" },
];

const SearchView = ({ search, setSearch, filtered, song, playing, liked, toggleLike, play, recentSongs, setMenuPosition, setMenuSong }) => {
    return (
        <div className="fadein">
            {search ? (
                <>
                    <div style={{ fontSize: 13, color: "#5a507a", marginBottom: 14 }}>{filtered.length} results for "{search}"</div>
                    <SongTable
                        songs={filtered}
                        current={song}
                        playing={playing}
                        liked={liked}
                        onPlay={(s) => { play(s); saveSongToDB(s); }}
                        onLike={toggleLike}
                        setMenuPosition={setMenuPosition}
                        setMenuSong={setMenuSong}
                    />
                </>
            ) : (
                <>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#ddd6f3", marginBottom: 16 }}>Browse by genre</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginBottom: 28 }}>
                        {GENRES.map(({ g, c }) => (
                            <div key={g} onClick={() => setSearch(g === "All" ? "" : g)}
                                style={{ borderRadius: 12, height: 80, background: `linear-gradient(135deg,${c}cc,${c}44)`, display: "flex", alignItems: "flex-end", padding: "12px 14px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#fff", transition: "opacity .15s" }}
                                onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                                {g}
                            </div>
                        ))}
                    </div>
                    <SectionHead title="All Songs" />
                    <SongTable
                        songs={recentSongs}
                        current={song}
                        playing={playing}
                        liked={liked}
                        onPlay={play}
                        onLike={toggleLike}
                        setMenuPosition={setMenuPosition}
                        setMenuSong={setMenuSong}
                    />
                </>
            )}
        </div>
    );
};

export default SearchView;