import { SONGS, RECENT, PLAYLISTS } from '../../constants/dummy.data';
import SongTable from '../SongTable';
const ProfileView = ({ song, playing, liked, play, toggleLike, setMenuPosition, setMenuSong }) => {
    return (
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
)
}
export default ProfileView;