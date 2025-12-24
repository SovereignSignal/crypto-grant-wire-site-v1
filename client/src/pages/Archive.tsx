import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { format } from "date-fns";
import SiteLayout from "@/components/SiteLayout";

export default function Archive() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const resultsTopRef = useRef<HTMLDivElement | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = trpc.grants.list.useQuery({
    search: searchQuery,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    page: currentPage,
    pageSize,
  });

  const entries = data?.entries || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const hasActiveFilters = selectedCategory !== "all" || searchInput.trim().length > 0;

  useEffect(() => {
    resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategory("all");
    setCurrentPage(1);
    resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <SiteLayout>
      {/* Header */}
      <section className="pt-16 pb-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-center">
            Grant Wire Archive
          </h1>
          <p className="text-center text-muted-foreground text-lg mb-8">
            Search and filter grant wire entries
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search entries..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Governance & Treasury">Governance & Treasury</SelectItem>
                <SelectItem value="Grant Programs">Grant Programs</SelectItem>
                <SelectItem value="Funding Opportunities">Funding Opportunities</SelectItem>
                <SelectItem value="Incentives">Incentives</SelectItem>
                <SelectItem value="Research & Analysis">Research & Analysis</SelectItem>
                <SelectItem value="Tools & Infrastructure">Tools & Infrastructure</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Entries List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div ref={resultsTopRef} />
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
              <p className="mt-4 text-muted-foreground">Loading entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No entries found matching your criteria.</p>
              {hasActiveFilters ? (
                <div className="mt-6">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button variant="outline" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
                    Clear filters
                  </Button>
                </div>
              </div>

              <div className="max-w-4xl mx-auto border border-border rounded-xl overflow-hidden bg-card/30">
                <ul className="divide-y divide-border">
                  {entries.map((entry) => {
                    const tags = entry.tags
                      ? entry.tags
                        .split(",")
                        .map(tag => tag.trim())
                        .filter(Boolean)
                      : [];

                    const Row = entry.sourceUrl ? "a" : "div";

                    return (
                      <li key={entry.id}>
                        <Row
                          {...(entry.sourceUrl
                            ? {
                              href: entry.sourceUrl,
                              target: "_blank",
                              rel: "noopener noreferrer",
                            }
                            : {})}
                          className="block p-5 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-display text-lg font-semibold leading-snug">
                                {entry.title}
                              </h3>

                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                                {entry.publishedAt ? (
                                  <span>{format(new Date(entry.publishedAt), "MMM d, yyyy")}</span>
                                ) : null}

                                {entry.category ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium">
                                    {entry.category}
                                  </span>
                                ) : null}
                              </div>

                              {entry.content && entry.content !== entry.title ? (
                                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                                  {entry.content}
                                </p>
                              ) : null}

                              {tags.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {tags.slice(0, 6).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-block px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>

                            {entry.sourceUrl ? (
                              <div className="shrink-0 pt-1 text-orange-500">
                                <ExternalLink className="w-4 h-4" />
                              </div>
                            ) : null}
                          </div>
                        </Row>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="w-4 h-4" />
                First
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

    </SiteLayout>
  );
}
