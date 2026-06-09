import { useRef, useEffect } from "react";
import { AudioContext } from "../context/AudioContext";
import { usePlayerStore } from "../stores/usePlayer.store";

export function AudioProvider({ children }) {
    const audioRef = useRef(new Audio());

    useEffect(() => {
        usePlayerStore.getState().setLastPlayedId(null);
    }, []);

    return (
        <AudioContext.Provider value={{ audioRef }}>
            {children}
        </AudioContext.Provider>
    );
}
