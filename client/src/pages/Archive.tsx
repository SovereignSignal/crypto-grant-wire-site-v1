import { useState, useEffect } from "react";
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
import { Card } from "@/components/ui/card";
import { ExternalLink, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import SiteLayout from "@/components/SiteLayout";

// Image pool from Notion collection
const IMAGE_POOL = [
  "https://cdn.midjourney.com/fdc890c2-be99-4828-b59e-60fd86c5bec2/0_0.png",
  "https://cdn.midjourney.com/fdc890c2-be99-4828-b59e-60fd86c5bec2/0_1.png",
  "https://cdn.midjourney.com/fdc890c2-be99-4828-b59e-60fd86c5bec2/0_2.png",
  "https://cdn.midjourney.com/fdc890c2-be99-4828-b59e-60fd86c5bec2/0_3.png",
  "https://cdn.midjourney.com/aee194ba-a44c-49a8-a039-746426c285f9/0_1.png",
  "https://cdn.midjourney.com/08bbceb4-283a-4bfb-90e7-d345f9ff2755/0_2.png",
  "https://cdn.midjourney.com/aee194ba-a44c-49a8-a039-746426c285f9/0_2.png",
  "https://cdn.midjourney.com/aee194ba-a44c-49a8-a039-746426c285f9/0_3.png",
  "https://cdn.midjourney.com/7de67be0-ce2c-4da8-a501-ae331107e35b/0_3.png",
  "https://cdn.midjourney.com/08bbceb4-283a-4bfb-90e7-d345f9ff2755/0_1.png",
  "https://cdn.midjourney.com/f06fdaa1-51b5-4d74-9ec8-e563e2fd52bb/0_3.png",
  "https://cdn.midjourney.com/f06fdaa1-51b5-4d74-9ec8-e563e2fd52bb/0_2.png",
  "https://cdn.midjourney.com/f06fdaa1-51b5-4d74-9ec8-e563e2fd52bb/0_1.png",
  "https://cdn.midjourney.com/f3e6bc70-4784-4691-82ae-14d5818776f0/0_3.png",
  "https://cdn.midjourney.com/f3e6bc70-4784-4691-82ae-14d5818776f0/0_2.png",
  "https://cdn.midjourney.com/f3e6bc70-4784-4691-82ae-14d5818776f0/0_0.png",
  "https://cdn.midjourney.com/8d6042f6-0a63-4c9f-9218-d1f81a0db086/0_3.png",
  "https://cdn.midjourney.com/8d6042f6-0a63-4c9f-9218-d1f81a0db086/0_1.png",
  "https://cdn.midjourney.com/0d5a6030-f471-41ca-b549-be38c59cfd74/0_3.png",
  "https://cdn.midjourney.com/c87093cf-b950-4de1-a943-c061177993f8/0_2.png",
  "https://cdn.midjourney.com/d84ec444-d173-49cb-af36-5a17f6ae4626/0_3.png",
  "https://cdn.midjourney.com/a0bf2a48-173c-49b3-be70-d4841963f458/0_2.png",
  "https://cdn.midjourney.com/a0bf2a48-173c-49b3-be70-d4841963f458/0_1.png",
  "https://cdn.midjourney.com/26aec23d-2cf9-410f-90fd-d23435509fe6/0_3.png",
  "https://cdn.midjourney.com/26aec23d-2cf9-410f-90fd-d23435509fe6/0_1.png",
  "https://cdn.midjourney.com/26aec23d-2cf9-410f-90fd-d23435509fe6/0_0.png",
  "https://cdn.midjourney.com/471d4b10-2d8f-4720-96f6-2767311b1ea0/0_3.png",
  "https://cdn.midjourney.com/471d4b10-2d8f-4720-96f6-2767311b1ea0/0_0.png",
  "https://cdn.midjourney.com/092c2853-2838-4944-9164-cab7fdc68c72/0_0.png",
  "https://cdn.midjourney.com/992e4247-8723-4f26-ac80-208d98fc388b/0_1.png",
];

// Function to get a random image for an entry (deterministic based on entry ID)
function getEntryImage(entryId: number): string {
  return IMAGE_POOL[entryId % IMAGE_POOL.length];
}

export default function Archive() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

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
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
              <p className="mt-4 text-muted-foreground">Loading entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No entries found matching your criteria.</p>
            </div>
          ) : (
            <>
            {/* Entry count */}
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {entries.map((entry) => (
                <Card
                  key={entry.id}
                  className="overflow-hidden hover:border-orange-500/50 transition-all duration-300 bg-card/50 backdrop-blur-sm flex flex-col"
                >
                  {/* Entry Image */}
                  <div className="h-48 bg-gradient-to-br from-orange-500/20 to-cyan-500/20 relative overflow-hidden">
                    <img
                      src={getEntryImage(entry.id)}
                      alt={entry.title}
                      className="w-full h-full object-cover opacity-80"
                      loading="lazy"
                    />
                  </div>

                  {/* Entry Content */}
                  <div className="flex-1 p-5 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold mb-2 line-clamp-2">
                        {entry.title}
                      </h3>
                      {entry.publishedAt && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {format(new Date(entry.publishedAt), "MMM d, yyyy")}
                        </p>
                      )}

                      {entry.category && (
                        <span className="inline-block px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium mb-2">
                          {entry.category}
                        </span>
                      )}

                      {entry.tags && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {entry.tags
                            .split(",")
                            .map(tag => tag.trim())
                            .filter(Boolean)
                            .map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                      {entry.sourceUrl && (
                        <a
                          href={entry.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-400 font-medium transition-colors"
                        >
                          View Source
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
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
            </div>
          )}
        </div>
      </section>

    </SiteLayout>
  );
}
