import { createContext, useContext } from "react";

export const RecentsContext = createContext(null);

export function useRecentContext() {
    return useContext(RecentsContext);
}