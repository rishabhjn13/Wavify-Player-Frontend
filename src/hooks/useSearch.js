import { useState, useEffect } from "react";
import { SONGS } from "../constants/dummy.data";

export function useSearch(API_URL) {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(SONGS);

  useEffect(() => {
    if (!search.trim()) return;
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/search-metadata?query=${encodeURIComponent(search)}`);
        setFiltered(await res.json());
      } catch (err) { console.error("Search failed:", err); }
    }, 300);
    return () => clearTimeout(timeout);
  }, [API_URL, search]);

  return { search, setSearch, filtered };
}