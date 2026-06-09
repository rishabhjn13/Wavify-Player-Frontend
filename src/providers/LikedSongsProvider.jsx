import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/client";
import { LikedSongsContext } from "../context/LikedSongsContext";

export function LikedSongsProvider({ children }) {
    const [liked, setLiked] = useState(new Set());
    const [likedSongs, setLikedSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ── Load on mount ─────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const { data } = await apiClient.get("/liked-songs");
                setLikedSongs(data || []);
                setLiked(new Set(data?.map(s => s.song_id) || []));
            } catch (err) {
                console.error("Failed to load liked songs:", err);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    // ── Toggle like with optimistic update ────────────────────────────────────
    const toggleLike = useCallback(async (song) => {
        const id = typeof song === "string" ? song : song.song_id;
        const isCurrentlyLiked = liked.has(id);
        if (!id) { toast.error("Invalid song"); return; }

        const toastId = toast.loading(isCurrentlyLiked ? "Removing..." : "Adding to Liked Songs...");

        // Optimistic update
        setLiked(prev => {
            const next = new Set(prev);
            isCurrentlyLiked ? next.delete(id) : next.add(id);
            return next;
        });

        try {
            if (isCurrentlyLiked) {
                await apiClient.delete(`/liked-songs/${id}`);
                toast.success("Removed from Liked Songs", { id: toastId });
            } else {
                await apiClient.post("/liked-songs", {
                    song_id: song.song_id,
                    title: song.title,
                    artist: song.artist,
                    album: song.album || "",
                    thumbnail: song.thumbnail || song.album_art || null,
                    duration_sec: song.duration_sec || song.duration || 0,
                });
                toast.success("Added to Liked Songs ♥", { id: toastId });
            }
            const { data } = await apiClient.get("/liked-songs");
            setLikedSongs(data || []);
        } catch (err) {
            console.error("Failed to toggle like:", err);
            // Revert optimistic update
            setLiked(prev => {
                const next = new Set(prev);
                isCurrentlyLiked ? next.add(id) : next.delete(id);
                return next;
            });
            toast.error("Failed to update liked songs", { id: toastId });
        }
    }, [liked]);

    return (
        <LikedSongsContext.Provider value={{ liked, likedSongs, toggleLike, isLoading }}>
            {children}
        </LikedSongsContext.Provider>
    );
}

