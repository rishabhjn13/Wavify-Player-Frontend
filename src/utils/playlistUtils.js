export const mapPlaylist = (pl) => ({
    id: pl.id,
    name: pl.name,
    description: pl.description || "",
    count: pl.song_count || 0,
    color: pl.color || "#6D28D9",
    thumbnail: pl.thumbnail || null,
    songs: []
});

export const fetchPlaylistWithSongs = async (playlist, apiClient) => {
    try {
        const { data: songs } = await apiClient.get(`/playlists/${playlist.id}/songs`);

        const fullSongs = await Promise.allSettled(
            songs.map(async (s) => {
                try {
                    const { data: meta } = await apiClient.get(`/songs/${s.song_id}`);
                    return {
                        song_id: s.song_id,
                        title: meta.title || s.song_title,
                        artist: meta.artist || "Unknown Artist",
                        album: meta.album || "",
                        thumbnail: meta.thumbnail || null,
                        duration_sec: meta.duration_sec || 0,
                        position: s.position,
                        color: "#7C3AED",
                    };
                } catch {
                    return {
                        song_id: s.song_id,
                        title: s.song_title,
                        artist: "Unknown Artist",
                        album: "",
                        thumbnail: null,
                        duration: 0,
                        position: s.position,
                        color: "#7C3AED",
                    };
                }
            })
        );

        return {
            ...mapPlaylist(playlist),
            songs: fullSongs
                .filter((r) => r.status === "fulfilled")
                .map((r) => r.value)
                .sort((a, b) => a.position - b.position),
            count: songs.length,
        };
    } catch (error) {
        console.error(`Failed to fetch songs for playlist ${playlist.id}:`, error);
        return mapPlaylist(playlist);
    }
};