import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import SiteLayout from "@/components/SiteLayout";

/**
 * Get first URL from extracted_urls array
 */
function getSourceUrl(extractedUrls: string[] | null): string | null {
  if (!extractedUrls || extractedUrls.length === 0) return null;
  return extractedUrls[0];
}

// Category colors for visual distinction
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [allMessages, setAllMessages] = useState<any[]>([]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      // Reset pagination when search changes
      setCursor(undefined);
      setAllMessages([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset pagination when category changes
  useEffect(() => {
    setCursor(undefined);
    setAllMessages([]);
  }, [selectedCategory]);

  // Fetch categories
  const { data: categories } = trpc.messages.categories.useQuery();

  // Fetch messages
  const { data, isLoading, isFetching } = trpc.messages.search.useQuery({
    query: searchQuery || undefined,
    category: selectedCategory || undefined,
    cursor,
    limit: 20,
  });

  // Accumulate messages for "Load More"
  useEffect(() => {
    if (data?.messages) {
      if (cursor === undefined) {
        // Fresh search, replace all
        setAllMessages(data.messages);
      } else {
        // Load more, append
        setAllMessages((prev) => [...prev, ...data.messages]);
      }
    }
  }, [data, cursor]);

  const handleLoadMore = () => {
    if (data?.nextCursor) {
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
            <p className="text-muted-foreground">
              Search {total > 0 ? total.toLocaleString() : "thousands of"} funding updates
            </p>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search grants, protocols, funding..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              All
            </button>
            {categoryList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                {cat.name}
                <span className="ml-1.5 text-xs opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>

          {/* Results Count */}
          {!isLoading && (
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery || selectedCategory ? (
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
