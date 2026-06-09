import SongTable from '../SongTable';
import SectionHead from '../SectionHead';
import { saveSongToDB } from '../../utils/songUtils';

import useAudioPlayer from '../../hooks/useAudioPlayer';
import { useContextMenu } from '../../context/SongMenuContext';
import { useRecentContext } from '../../context/RecentsContext';
import { useLikedSongsContext } from '../../context/LikedSongsContext';
import { useSearchContext } from '../../context/SearchContext';
import { usePlayerStore } from '../../stores/usePlayer.store';
import { usePlaylistContext } from '../../context/PlaylistsContext';

const GENRES = [
    { g: "Electronic", c: "#4C1D95" }, { g: "Ambient", c: "#0F766E" },
    { g: "Indie", c: "#BE185D" }, { g: "Rock", c: "#7C2D12" },
    { g: "Chillout", c: "#1D4ED8" }, { g: "All", c: "#1e1635" },
];

const SearchView = () => {
    const { search, setSearch, filtered } = useSearchContext();
    const { play, playing } = useAudioPlayer();
    const currentSong = usePlayerStore((s) => s.currentSong());

    const { recentSongs } = useRecentContext();
    const { liked, toggleLike } = useLikedSongsContext();
    const { setMenuPosition, setMenuSong } = useContextMenu();
    const { playSongFromPlaylist } = usePlaylistContext();
    return (
        <div className="fadein">
            {search ? (
                <>
                    <div style={{ fontSize: 13, color: "#5a507a", marginBottom: 14 }}>{filtered.length} results for "{search}"</div>
                    <SongTable
                        songs={filtered}
                        current={currentSong}
                        playing={playing}
                        liked={liked}
                        onPlay={(s) => {
                            const index = filtered.findIndex(x => x.song_id === s.song_id);
                            playSongFromPlaylist(s, filtered, index);
                            saveSongToDB(s);
                        }}
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
                        current={currentSong}
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