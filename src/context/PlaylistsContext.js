import { createContext, useContext } from "react";

export const PlaylistContext = createContext(null);

export function usePlaylistContext() {
    return useContext(PlaylistContext);
}