import { useLikedSongsContext } from '../../context/LikedSongsContext';
import { usePlaylistContext } from '../../context/PlaylistsContext';
import { usePlayerStore } from '../../stores/usePlayer.store';
import { useContextMenu } from "../../context/SongMenuContext";
import { useRecentContext } from '../../context/RecentsContext';

import SongTable from '../SongTable';

const ProfileView = () => {
    const { play, playing, playlists } = usePlaylistContext();
    const { liked, toggleLike } = useLikedSongsContext();
    const { setMenuPosition, setMenuSong } = useContextMenu();
    const { recentSongs } = useRecentContext();
    const currentSong = usePlayerStore((s) => s.currentSong());
    return (
        <div className="fadein">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 22, marginBottom: 32, background: "linear-gradient(135deg,#3b0d6e33,transparent)", borderRadius: 16, padding: "28px 28px 24px", flexWrap: "wrap" }}>
                <div style={{
                    width: 112, height: 112, borderRadius: "50%",
                    flexShrink: 0, overflow: "hidden"
                }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/219/219970.png"
                        alt="pfp"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#5a507a", textTransform: "uppercase", letterSpacing: ".08em" }}>Profile</div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: "#f0ecff", letterSpacing: "-0.03em" }}>Rishabh Jain</div>
                    <div style={{ display: "flex", gap: 28, marginTop: 12, flexWrap: "wrap" }}>
                        {[["Songs", recentSongs.length], ["Playlists", playlists.length], ["Liked", liked.size]].map(([l, v]) => (
                            <div key={l}><span style={{ fontWeight: 700, color: "#a78bfa" }}>{v}</span> <span style={{ fontSize: 13, color: "#5a507a" }}>{l}</span></div>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#ddd6f3", marginBottom: 14 }}>Recently Played</div>
            <SongTable songs={recentSongs} current={currentSong} playing={playing} liked={liked} onPlay={play} onLike={toggleLike} setMenuPosition={setMenuPosition} setMenuSong={setMenuSong} />
        </div>
    )
}
export default ProfileView;