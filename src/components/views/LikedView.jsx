import { SONGS } from '../../constants/dummy.data';
import SongTable from '../SongTable';
import { saveSongToDB } from '../../utils/songUtils';
import useAudioPlayer from '../../hooks/useAudioPlayer';
import { useContextMenu } from "../../context/SongMenuContext";
import { useLikedSongsContext } from '../../context/LikedSongsContext';
import { usePlayerStore } from '../../stores/usePlayer.store';

const LikedView = () => {
    const { play, playing } = useAudioPlayer();
    const { liked, likedSongs, toggleLike } = useLikedSongsContext();
    const { setMenuPosition, setMenuSong } = useContextMenu();
    const currentSong = usePlayerStore((s) => s.currentSong());
    return (
        <div className="fadein">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 22, marginBottom: 28, background: "linear-gradient(135deg,#3b0d6e44,transparent)", borderRadius: 16, padding: "24px 24px 20px", flexWrap: "wrap" }}>
                <div style={{ width: 130, height: 130, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#db2777)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="58" height="58" viewBox="0 0 24 24" fill="#fff"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#5a507a", textTransform: "uppercase", letterSpacing: ".08em" }}>Playlist</div>
                    <div style={{ fontSize: 34, fontWeight: 800, color: "#f0ecff", letterSpacing: "-0.03em" }}>Liked Songs</div>
                    <div style={{ fontSize: 13, color: "#5a507a", marginTop: 4 }}>{liked.size} songs</div>
                    <button
                        onClick={() => { const first = SONGS.find(s => liked.has(s.id)); if (first) play(first); }}
                        style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, background: "#a78bfa", border: "none", color: "#08080f", borderRadius: 30, padding: "10px 26px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>Play
                    </button>
                </div>
            </div>

            <SongTable
                songs={likedSongs}
                current={currentSong}
                playing={playing}
                liked={liked}
                onPlay={(s) => { play(s); saveSongToDB(s); }}
                onLike={toggleLike}
                setMenuPosition={setMenuPosition}
                setMenuSong={setMenuSong}
            />
            {liked.size === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#3a3060", fontSize: 15 }}>
                    No liked songs yet — click ♥ to save songs here
                </div>
            )}
        </div>
    );
};

export default LikedView;