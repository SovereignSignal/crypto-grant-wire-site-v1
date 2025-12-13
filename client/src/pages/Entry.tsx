import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Satellite, ArrowLeft, ExternalLink, Loader2, Calendar, Tag } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Entry() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: entry, isLoading, error } = trpc.grants.getBySlug.useQuery({ slug });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <header className="border-b border-border bg-card">
          <div className="container py-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                <img src="/CGWLogoSolo.png" alt="Crypto Grant Wire" className="h-10 w-auto" />
                <span className="font-bold text-xl">Grant Wire</span>
              </div>
            </Link>
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md">
            <p className="text-xl font-semibold mb-4">Entry Not Found</p>
            <p className="text-muted-foreground mb-6">
              The entry you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/archive">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Archive
              </Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                <img src="/CGWLogoSolo.png" alt="Crypto Grant Wire" className="h-10 w-auto" />
                <span className="font-bold text-xl">Grant Wire</span>
              </div>
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm hover:text-primary transition-colors">Home</Link>
              <Link href="/archive" className="text-sm hover:text-primary transition-colors">Archive</Link>
              <Link href="/contact" className="text-sm hover:text-primary transition-colors">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <Button 
            variant="ghost" 
            asChild 
            className="mb-8"
          >
            <Link href="/archive">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Archive
            </Link>
          </Button>

          <article>
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
                {entry.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                {entry.category && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                      {entry.category}
                    </span>
                  </div>
                )}
                
                {entry.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(entry.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </header>

            <Card className="p-8 mb-8 bg-card">
              <div className="prose prose-invert max-w-none">
                {entry.content ? (
                  <div className="whitespace-pre-wrap text-foreground">
                    {entry.content}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No additional content available.</p>
                )}
              </div>
            </Card>

            {entry.sourceUrl && (
              <div className="flex justify-center">
                <Button 
                  size="lg"
                  asChild
                  className="glow-orange"
                >
                  <a 
                    href={entry.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    View Original Source
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </Button>
              </div>
            )}
          </article>
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
