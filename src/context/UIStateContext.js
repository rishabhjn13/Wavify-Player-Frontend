import { createContext, useContext } from "react";

export const UIStateContext = createContext(null);

export function useUIStateContext() {
    return useContext(UIStateContext);
}