/**
 * @fileoverview Archive Page Component
 *
 * Search-first interface for browsing 3000+ funding updates.
 *
 * Features:
 * - Full-text search with 300ms debounce and autocomplete suggestions
 * - Category filtering via pill buttons
 * - Cursor-based "Load More" pagination
 * - Color-coded category badges
 * - External link cards to source content
 *
 * Data is fetched from the messages/summaries tables via tRPC,
 * automatically excluding entries pending review.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Search, Loader2, Rss, X } from "lucide-react";
import { format } from "date-fns";
import SiteLayout from "@/components/SiteLayout";

/**
 * Extracts the first URL from an array of extracted URLs.
 *
 * @param extractedUrls - Array of URLs extracted from the message
 * @returns The first URL or null if none exist
 */
function getSourceUrl(extractedUrls: string[] | null): string | null {
  if (!extractedUrls || extractedUrls.length === 0) return null;
  return extractedUrls[0];
}

/**
 * Tailwind CSS classes for category badge styling.
 * Each category has a unique color scheme for visual distinction.
 */
const CATEGORY_COLORS: Record<string, string> = {
  "Governance & Treasury": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "Grant Programs": "bg-green-500/10 text-green-400 border-green-500/30",
  "Funding Opportunities": "bg-amber-500/10 text-amber-400 border-amber-500/30",
  "Incentives": "bg-purple-500/10 text-purple-400 border-purple-500/30",
  "Research & Analysis": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  "Tools & Infrastructure": "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

export default function Archive() {
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [allMessages, setAllMessages] = useState<any[]>([]);

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      // Reset pagination when search changes
      setCursor(undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset pagination when categories change
  useEffect(() => {
    setCursor(undefined);
  }, [selectedCategories]);

  // Fetch categories
  const { data: categories } = trpc.messages.categories.useQuery();

  // Fetch search suggestions (only when search has 2+ chars)
  const { data: suggestions } = trpc.messages.suggestions.useQuery(
    { prefix: search, limit: 8 },
    { enabled: search.length >= 2 }
  );

  // Handle suggestion selection
  const selectSuggestion = useCallback((term: string) => {
    setSearch(term);
    setSearchQuery(term);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    setCursor(undefined);
    searchInputRef.current?.blur();
  }, []);

  // Handle keyboard navigation in suggestions
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!suggestions?.length || !showSuggestions) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
            selectSuggestion(suggestions[highlightedIndex].term);
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [suggestions, showSuggestions, highlightedIndex, selectSuggestion]
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle category selection
  const toggleCategory = useCallback((categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  }, []);

  // Fetch messages
  const { data, isLoading, isFetching } = trpc.messages.search.useQuery({
    query: searchQuery || undefined,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    cursor,
    limit: 20,
  });

  // Track whether this is a "Load More" request vs a fresh search
  const isLoadMore = useRef(false);

  // Accumulate messages for "Load More"
  useEffect(() => {
    if (data?.messages) {
      if (isLoadMore.current) {
        // Load more, append (avoid duplicates)
        setAllMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMessages = data.messages.filter((m: any) => !existingIds.has(m.id));
          return [...prev, ...newMessages];
        });
        isLoadMore.current = false;
      } else {
        // Fresh search, replace all
        setAllMessages(data.messages);
      }
    }
  }, [data]);

  const handleLoadMore = () => {
    if (data?.nextCursor) {
      isLoadMore.current = true;
      setCursor(data.nextCursor);
    }
  };

  // Calculate total for display
  const total = data?.total ?? 0;
  const hasMore = data?.nextCursor !== null;

  // Format category counts for display
  const categoryList = useMemo(() => {
    if (!categories) return [];
    return categories;
  }, [categories]);

  return (
    <SiteLayout>
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Grant Wire <span className="text-primary">Archive</span>
            </h1>
            <p className="text-muted-foreground mb-4">
              Search {isLoading ? "" : total.toLocaleString()} funding updates
            </p>
            <a
              href="/api/feeds/messages.rss"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Rss className="w-4 h-4" />
              Subscribe via RSS
            </a>
          </div>

          {/* Search Input with Autocomplete */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search grants, protocols, funding..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-12 py-4 bg-card border border-border rounded-xl text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
            {/* Clear search button */}
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setSearchQuery("");
                  setShowSuggestions(false);
                  setCursor(undefined);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-foreground transition-colors z-10"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.term}-${suggestion.type}`}
                    onClick={() => selectSuggestion(suggestion.term)}
                    className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                      index === highlightedIndex
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span className="font-medium">{suggestion.term}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        suggestion.type === "protocol"
                          ? "bg-blue-500/10 text-blue-400"
                          : suggestion.type === "category"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {suggestion.type === "protocol"
                        ? "Protocol"
                        : suggestion.type === "category"
                        ? "Category"
                        : "Term"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Pills (multi-select) */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategories([])}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategories.length === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              All
            </button>
            {categoryList.map((cat) => {
              const isSelected = selectedCategories.includes(cat.name);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                  }`}
                >
                  {cat.name}
                  <span className="ml-1.5 text-xs opacity-70">({cat.count})</span>
                </button>
              );
            })}
          </div>

          {/* Results Count */}
          {!isLoading && (
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery || selectedCategories.length > 0 ? (
                <>Found {total.toLocaleString()} results</>
              ) : (
                <>Showing {allMessages.length.toLocaleString()} of {total.toLocaleString()} entries</>
              )}
            </p>
          )}

          {/* Loading State (initial) */}
          {isLoading && allMessages.length === 0 && (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading entries...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && allMessages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No results found for "${searchQuery}"`
                  : "No entries found."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-4 text-primary hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Results Grid */}
          {allMessages.length > 0 && (
            <div className="space-y-4">
              {allMessages.map((msg) => {
                // Use title from API (summaries.title field), fallback to "Update"
                const title = msg.title || "Update";
                const sourceUrl = getSourceUrl(msg.extractedUrls);
                const categoryColor = msg.categoryName
                  ? CATEGORY_COLORS[msg.categoryName] || "bg-primary/10 text-primary border-primary/30"
                  : null;

                const CardWrapper = sourceUrl ? "a" : "div";
                const cardProps = sourceUrl
                  ? {
                      href: sourceUrl,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {};

                return (
                  <CardWrapper
                    key={msg.id}
                    {...cardProps}
                    className="group block p-5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Meta row */}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          {msg.categoryName && categoryColor && (
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full border ${categoryColor}`}
                            >
                              {msg.categoryName}
                            </span>
                          )}
                          {msg.timestamp && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(msg.timestamp), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                          {title}
                        </h3>

                        {/* Summary */}
                        {msg.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {msg.summary}
                          </p>
                        )}
                      </div>

                      {/* External link icon */}
                      {sourceUrl && (
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </CardWrapper>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && allMessages.length > 0 && (
            <div className="text-center mt-10">
              <button
                onClick={handleLoadMore}
                disabled={isFetching}
                className="px-8 py-3 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetching ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </SiteLayout>
  );
}
