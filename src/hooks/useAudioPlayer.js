import { useState, useRef, useEffect, useCallback } from "react";
import { SONGS } from "../constants/dummy.data";

export function useAudioPlayer(API_URL) {
    const [song, setSong] = useState(SONGS[0]);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(75);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState(false);
    const audioRef = useRef(new Audio());

    const play = useCallback(async (s) => {
        if (!s) return;
        setSong(s);
        setPlaying(false);
        setProgress(0);
        try {
            audioRef.current.pause();
            audioRef.current.src = "";
            const res = await fetch(`${API_URL}/get-audio?track=${encodeURIComponent(s.title)}`);
            const data = await res.json();
            if (!data?.stream_url) throw new Error("No stream URL");
            setSong(prev => ({ ...prev, duration: data.duration, thumbnail: s.thumbnail }));
            document.title = `${s.title} - ${s.artist} | wavify`;
            audioRef.current.src = data.stream_url;
            audioRef.current.play()
                .then(() => setPlaying(true))
                .catch(err => { if (err.name !== "AbortError") console.error(err); });
        } catch (err) {
            console.error("Audio fetch failed:", err);
        }
    }, [API_URL]);

    const toggle = () => {
        if (audioRef.current.paused) { audioRef.current.play(); setPlaying(true); }
        else { audioRef.current.pause(); setPlaying(false); }
    };

    const next = useCallback(() => {
        const idx = SONGS.findIndex(s => s.id === song.id);
        play(shuffle ? SONGS[Math.floor(Math.random() * SONGS.length)] : SONGS[(idx + 1) % SONGS.length]);
    }, [song, shuffle, play]);

    const prev = () => {
        if (progress > 4) { setProgress(0); return; }
        const idx = SONGS.findIndex(s => s.id === song.id);
        play(SONGS[(idx - 1 + SONGS.length) % SONGS.length]);
    };

    useEffect(() => {
        const audio = audioRef.current;
        const onTimeUpdate = () => setProgress(Math.floor(audio.currentTime));
        const onEnded = () => next();
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);
        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("ended", onEnded);
        };
    }, [next]);

    useEffect(() => {
        audioRef.current.volume = volume / 100;
    }, [volume]);

    return {
        song, setSong, playing, progress, setProgress, volume, setVolume,
        shuffle, setShuffle, repeat, setRepeat, play, toggle, next, prev, audioRef
    };
}