import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Satellite, Search, Filter, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Archive() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Fetch categories
  const { data: categories } = trpc.grants.categories.useQuery();

  // Fetch entries with filters
  const { data, isLoading, error } = trpc.grants.list.useQuery({
    search: searchQuery || undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    page: currentPage,
    pageSize,
  });

  const entries = data?.entries || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                <Satellite className="w-6 h-6 text-primary" />
                <span className="font-bold text-xl">Grant Wire</span>
              </div>
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm hover:text-primary transition-colors">Home</Link>
              <Link href="/archive" className="text-sm text-primary font-semibold">Archive</Link>
              <Link href="/contact" className="text-sm hover:text-primary transition-colors">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="container">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">Grant Wire Archive</h1>
            <p className="text-xl text-muted-foreground">
              Search and filter {total.toLocaleString()} grant wire entries
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="w-full md:w-64">
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-8 text-center bg-destructive/10 border-destructive">
              <p className="text-destructive">Failed to load entries. Please try again later.</p>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && !error && entries.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No entries found matching your criteria.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
            </Card>
          )}

          {/* Entries List */}
          {!isLoading && !error && entries.length > 0 && (
            <div className="space-y-4">
              {entries.map((entry) => (
                <Card 
                  key={entry.id}
                  className="p-6 hover:border-primary transition-all bg-card"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <Link href={`/archive/${entry.slug}`}>
                          <h3 className="text-xl font-semibold hover:text-primary transition-colors cursor-pointer">
                            {entry.title}
                          </h3>
                        </Link>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                        {entry.category && (
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {entry.category}
                          </span>
                        )}
                        {entry.publishedAt && (
                          <span>
                            {new Date(entry.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      
                      {entry.content && (
                        <p className="text-muted-foreground line-clamp-2">
                          {entry.content}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {entry.sourceUrl && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          asChild
                        >
                          <a 
                            href={entry.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            Source
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      
                      <Button 
                        size="sm"
                        asChild
                      >
                        <Link href={`/archive/${entry.slug}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
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
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Satellite className="w-5 h-5 text-primary" />
                Grant Wire
              </h3>
              <p className="text-sm text-muted-foreground">
                Curated intelligence on crypto grants and funding opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/archive" className="text-muted-foreground hover:text-primary transition-colors">Archive</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://twitter.com/sovereignsignal" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    𝕏 @sovereignsignal
                  </a>
                </li>
                <li>
                  <a href="https://t.me/cryptograntwire" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    📡 Telegram
                  </a>
                </li>
                <li>
                  <a href="https://sovereignsignal.substack.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    📰 Substack
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
            <p>Curated by Sov • {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
