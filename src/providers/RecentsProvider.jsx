
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/client";
import { fetchPlaylistWithSongs } from "../utils/playlistUtils";
import { RecentsContext } from "../context/RecentsContext";

export function RecentsProvider({ children }) {
    const [recentPlaylists, setRecentPlaylists] = useState([]);
    const [recentSongs, setRecentSongs] = useState([]);
    const [isLoadingRecents, setIsLoadingRecents] = useState(false);

    // ── Load recents on mount ─────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            setIsLoadingRecents(true);
            try {
                const [plRes, songsRes] = await Promise.all([
                    apiClient.get("/playlists/recently-played", { params: { limit: 8 } }),
                    apiClient.get("/recently-added")
                ]);

                if (plRes?.data?.length) {
                    const fullPlaylists = await Promise.all(
                        plRes.data.map(async (pl) => {
                            const populated = await fetchPlaylistWithSongs(pl, apiClient);
                            return { ...populated, thumbnail: populated.thumbnail ?? null };
                        })
                    );
                    setRecentPlaylists(fullPlaylists);
                }

                if (songsRes?.data?.length) {
                    setRecentSongs(songsRes.data.map((s) => ({
                        song_id: s.song_id,
                        title: s.title,
                        artist: s.artist,
                        album: s.album || "",
                        thumbnail: s.thumbnail,
                        duration: s.duration_sec || 0,
                        color: "#7C3AED"
                    })));
                }
            } catch (err) {
                console.error("Failed to load recents:", err);
            } finally {
                setIsLoadingRecents(false);
            }
        })();
    }, []);

    // ── Mark playlist as played + refresh ─────────────────────────────────────
    const markPlaylistPlayed = useCallback(async (playlistId) => {
        if (!playlistId) return;
        const toastId = toast.loading("Updating recents...");
        try {
            await apiClient.post(`/playlists/${playlistId}/played`);
            const res = await apiClient.get("/playlists/recently-played", { params: { limit: 8 } });
            if (res?.data) {
                setRecentPlaylists(res.data.map((pl) => ({
                    id: pl.id,
                    name: pl.name,
                    description: pl.description || "",
                    count: pl.song_count || 0,
                    color: pl.color || "#6D28D9",
                    thumbnail: pl.thumbnail ?? null,
                    songs: []
                })));
            }
            toast.success("Recently played updated", { id: toastId });
        } catch (err) {
            console.error("Failed to mark playlist as played:", err);
            toast.error("Failed to update recents", { id: toastId });
        }
    }, []);

    return (
        <RecentsContext.Provider value={{ recentPlaylists, recentSongs, isLoadingRecents, markPlaylistPlayed }}>
            {children}
        </RecentsContext.Provider>
    );
}