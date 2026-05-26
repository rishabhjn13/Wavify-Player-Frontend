import { useState, useRef, useEffect } from "react";

export function useContextMenu() {
  const [menuSong, setMenuSong] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [playlistSubmenu, setPlaylistSubmenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuSong || !menuRef.current) return;
    const { width, height } = menuRef.current.getBoundingClientRect();
    setMenuPosition(prev => ({
      x: prev.x + width > window.innerWidth ? prev.x - width : prev.x,
      y: prev.y + height > window.innerHeight ? prev.y - height - 16 : prev.y,
    }));
  }, [menuSong]);

  useEffect(() => {
    if (!menuSong) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuSong(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuSong]);

  const submenuSide = menuPosition.x + 215 + 190 > window.innerWidth ? "right" : "left";

  return { menuSong, setMenuSong, menuPosition, setMenuPosition,
           playlistSubmenu, setPlaylistSubmenu, menuRef, submenuSide };
}