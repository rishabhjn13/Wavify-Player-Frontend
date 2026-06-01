import apiClient from "./client";
export const saveSongToDB = async (s) => {
    try {
        await apiClient.post("/songs", {
            song_id: s.id, // Change this to song_id if your backend expects that
            title: s.title,
            artist: s.artist,
            album: s.album || "",
            album_art: s.thumbnail || s.album_art || "",
            duration_sec: s.duration_sec || s.duration || 0,
            search_string: s.search_string || "",
        });
    } catch (err) {
        console.error("Failed to save song to db:", err);
    }
};