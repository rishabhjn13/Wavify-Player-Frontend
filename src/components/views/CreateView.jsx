import AlbumArt from "../AlbumArt";
import { SONGS } from "../../constants/dummy.data";
import toast from "react-hot-toast";

const CreateView = ({ thumbnailPreview, handleThumbnailUpload, createName, setCreateName, createDescription, setCreateDescription, selectedColor, setSelectedColor, handleCreatePlaylist }) => {
    return (
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
                    <button className="iBtn" style={{ color: "#a78bfa" }} onClick={() => toast.info(`"${s.title}" added`)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                </div>
            ))}
        </div>
    )
};

export default CreateView;