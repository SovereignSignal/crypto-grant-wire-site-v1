import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import {
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import SiteLayout from "@/components/SiteLayout";

const ITEMS_PER_PAGE = 6;
const CATEGORIES = ["All Categories", "Governance & Treasury", "Grant Programs", "Funding Opportunities", "Incentives", "Research & Analysis", "Tools & Infrastructure"];

export default function Archive() {
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const resultsTopRef = useRef<HTMLDivElement | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = trpc.grants.list.useQuery({
    search: searchQuery,
    category: category === "All Categories" ? undefined : category,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  });

  const entries = data?.entries || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  useEffect(() => {
    resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  return (
    <SiteLayout>
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Grant Wire <span className="text-primary">Archive</span>
          </h1>
          <p className="text-muted-foreground text-center mb-10">Search and filter grant wire entries</p>

          <div ref={resultsTopRef} />

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search entries..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="mt-4 text-muted-foreground">Loading entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No entries found matching your criteria.</p>
            </div>
          ) : (
            <>
              {/* Results count */}
              <p className="text-sm text-muted-foreground mb-6">
                Showing {entries.length} of {totalCount} entries
              </p>

              {/* Entries grid */}
              <div className="grid gap-4">
                {entries.map((entry) => {
                  const Row = entry.sourceUrl ? "a" : "div";
                  return (
                    <Row
                      key={entry.id}
                      {...(entry.sourceUrl
                        ? {
                            href: entry.sourceUrl,
                            target: "_blank",
                            rel: "noopener noreferrer",
                          }
                        : {})}
                      className="group block p-5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            {entry.category && (
                              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                                {entry.category}
                              </span>
                            )}
                            {entry.publishedAt && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(entry.publishedAt), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                            {entry.title}
                          </h3>
                          {entry.content && entry.content !== entry.title && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                          )}
                        </div>
                        {entry.sourceUrl && (
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </Row>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:border-primary/50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </SiteLayout>
  );
}
