import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/client";

/**
 * Hook for managing recently played playlists and recently added songs.
 * Uses centralized apiClient with robust error handling and toast notifications.
 */
export function useRecents() {
    const [recentPlaylists, setRecentPlaylists] = useState([]);
    const [recentSongs, setRecentSongs] = useState([]);
    const [isLoadingRecents, setIsLoadingRecents] = useState(false);

    // -------------------------------------------------------------------------
    // Load recents on mount
    // -------------------------------------------------------------------------

    useEffect(() => {
        const fetchRecents = async () => {
            setIsLoadingRecents(true);
            try {
                const [plRes, songsRes] = await Promise.all([
                    apiClient.get("/playlists/recently-played", {
                        params: { limit: 8 }
                    }),
                    apiClient.get("/recently-added")
                ]);

                // Map playlists
                if (plRes?.data?.length) {
                    setRecentPlaylists(plRes.data.map((pl) => ({
                        id: pl.id,
                        name: pl.name,
                        description: pl.description || "",
                        count: pl.song_count || 0,
                        color: pl.color || "#6D28D9",
                        thumbnail: pl.thumbnail
                            ? `${apiClient.defaults.baseURL}${pl.thumbnail}`
                            : null,
                        songs: []
                    })));
                }

                // Map songs
                if (songsRes?.data?.length) {
                    setRecentSongs(songsRes.data.map((s) => ({
                        id: s.id,
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
                // Interceptor already shows appropriate toast for most errors
            } finally {
                setIsLoadingRecents(false);
            }
        };

        fetchRecents();
    }, []);

    // -------------------------------------------------------------------------
    // Mark playlist as played + refresh
    // -------------------------------------------------------------------------

    const markPlaylistPlayed = useCallback(async (playlistId) => {
        if (!playlistId) return;

        const toastId = toast.loading("Updating recents...");

        try {
            // Mark as played
            await apiClient.post(`/playlists/${playlistId}/played`);

            // Refresh recently played list
            const res = await apiClient.get("/playlists/recently-played", {
                params: { limit: 8 }
            });

            if (res?.data) {
                setRecentPlaylists(res.data.map((pl) => ({
                    id: pl.id,
                    name: pl.name,
                    description: pl.description || "",
                    count: pl.song_count || 0,
                    color: pl.color || "#6D28D9",
                    thumbnail: pl.thumbnail
                        ? `${apiClient.defaults.baseURL}${pl.thumbnail}`
                        : null,
                    songs: []
                })));
            }

            toast.success("Recently played updated", { id: toastId });
        } catch (err) {
            console.error("Failed to mark playlist as played:", err);
            // Interceptor already shows error toast, but we update the loading one
            toast.error("Failed to update recents", { id: toastId });
        }
    }, []);

    return {
        recentPlaylists,
        recentSongs,
        isLoadingRecents,
        markPlaylistPlayed,
    };
}