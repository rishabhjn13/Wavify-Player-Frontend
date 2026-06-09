import toast from "react-hot-toast";
import apiClient from "../api/client"
import { SONGS } from "../constants/dummy.data";
import { SearchContext } from "../context/SearchContext";
import { useState, useEffect, useCallback, useMemo } from "react";

export function SearchProvider({ children }) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return SONGS;
    return searchResults;
  }, [search, searchResults]);

  useEffect(() => {
    if (!search.trim()) return;

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await apiClient.get("/search-metadata-bylimit", {
          params: { query: search, limit: 20 }
        });

        const results = Array.isArray(data) ? data : [];
        setSearchResults(results);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
        toast.error("Search failed, showing suggestions");
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const clearSearch = useCallback(() => {
    setSearch("");
    setSearchResults([]);
  }, []);

  return (
    <SearchContext.Provider value={{ search, setSearch, filtered, isSearching, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
}