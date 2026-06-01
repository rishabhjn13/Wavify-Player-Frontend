import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/client";

export function useLikedSongs() {
    const [liked, setLiked] = useState(new Set());
    const [likedSongs, setLikedSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load liked songs on mount
    useEffect(() => {
        const loadLikedSongs = async () => {
            setIsLoading(true);
            try {
                const { data } = await apiClient.get("/liked-songs");

                setLikedSongs(data || []);
                setLiked(new Set(data?.map(s => s.id) || []));
            } catch (err) {
                console.error("Failed to load liked songs:", err);
                // apiClient interceptor already shows toast
            } finally {
                setIsLoading(false);
            }
        };

        loadLikedSongs();
    }, []);

    // -------------------------------------------------------------------------
    // Toggle like with optimistic update
    // -------------------------------------------------------------------------

    const toggleLike = useCallback(async (song) => {
        const id = typeof song === "string" ? song : song.song_id;
        const isCurrentlyLiked = liked.has(id);

        if (!id) {
            toast.error("Invalid song");
            return;
        }

        const toastId = toast.loading(isCurrentlyLiked ? "Removing..." : "Adding to Liked Songs...");

        // Optimistic update
        setLiked(prev => {
            const newSet = new Set(prev);
            if (isCurrentlyLiked) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
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

            // Refresh liked songs list after successful toggle
            const { data } = await apiClient.get("/liked-songs");
            setLikedSongs(data || []);

        } catch (err) {
            console.error("Failed to toggle like:", err);

            // Revert optimistic update
            setLiked(prev => {
                const newSet = new Set(prev);
                if (isCurrentlyLiked) {
                    newSet.add(id);
                } else {
                    newSet.delete(id);
                }
                return newSet;
            });

            toast.error("Failed to update liked songs", { id: toastId });
        }
    }, [liked]);

    return {
        liked,
        likedSongs,
        toggleLike,
        isLoading
    };
}