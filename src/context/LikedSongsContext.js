import { createContext, useContext } from "react";
export const LikedSongsContext = createContext(null);
export function useLikedSongsContext() {
    return useContext(LikedSongsContext);
}