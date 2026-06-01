import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { SONGS } from "../constants/dummy.data";
import apiClient from "../api/client";

export function useSearch() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Memoized filtered list
  const filtered = useMemo(() => {
    if (!search.trim()) {
      return SONGS;
    }
    return searchResults;
  }, [search, searchResults]);

  // Debounced search - ONLY runs when there is search text
  useEffect(() => {
    if (!search.trim()) return;

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      const toastId = toast.loading("Searching...");

      try {
        const { data } = await apiClient.get("/search-metadata-bylimit", {
          params: {
            query: search,
            limit: 20
          }
        });

        const results = Array.isArray(data) ? data : [];
        setSearchResults(results);

        toast.success(`Found ${results.length} results`, { id: toastId });
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
        toast.error("Search failed, showing suggestions", { id: toastId });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const clearSearch = useCallback(() => {
    setSearch("");
    setSearchResults([]);   // Safe here - not inside effect
  }, []);

  return {
    search,
    setSearch,
    filtered,
    isSearching,
    clearSearch
  };
}