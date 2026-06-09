import { useState } from "react";
import { UIStateContext } from "../context/UIStateContext";


export function UIStateProvider({ children }) {
    const [view, setView] = useState("home");
    const [rightPanel, setRightPanel] = useState("queue");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeArtist, setActiveArtist] = useState(null);
    const [plMenuOpen, setPlMenuOpen] = useState(false);
    const [plMenuPos, setPlMenuPos] = useState({ x: 0, y: 0 });

    const state = { view, setView, rightPanel, setRightPanel, sidebarOpen, setSidebarOpen, activeArtist, setActiveArtist, plMenuOpen, setPlMenuOpen, plMenuPos, setPlMenuPos };
    return <UIStateContext.Provider value={state}>{children}</UIStateContext.Provider>;
}