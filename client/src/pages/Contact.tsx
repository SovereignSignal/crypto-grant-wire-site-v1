import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Satellite, Mail, Send } from "lucide-react";
import { Link } from "wouter";

export default function Contact() {

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
              <Link href="/contact" className="text-sm text-primary font-semibold">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">Get in Touch</h1>
            <p className="text-xl text-muted-foreground">
              Connect with Sov or submit grant program updates and funding opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* About Section */}
            <Card className="p-8 bg-card">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">
                I've been tracking crypto grants and funding mechanisms for years. The Grant Wire is how I share what I learn with builders, grant managers, and anyone navigating the funding landscape.
              </p>
            </Card>

            {/* Connect Section */}
            <Card className="p-8 bg-card">
              <h2 className="text-2xl font-bold mb-4">Connect</h2>
              <div className="space-y-4">
                <a 
                  href="https://twitter.com/sovereignsignal" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <span className="text-xl">𝕏</span>
                  </div>
                  <div>
                    <div className="font-semibold">X (Twitter)</div>
                    <div className="text-sm">@sovereignsignal</div>
                  </div>
                </a>

                <a 
                  href="https://t.me/cryptograntwire" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <span className="text-xl">📡</span>
                  </div>
                  <div>
                    <div className="font-semibold">Telegram</div>
                    <div className="text-sm">t.me/cryptograntwire</div>
                  </div>
                </a>

                <a 
                  href="https://sovereignsignal.substack.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <span className="text-xl">📰</span>
                  </div>
                  <div>
                    <div className="font-semibold">Substack</div>
                    <div className="text-sm">sovereignsignal.substack.com</div>
                  </div>
                </a>
              </div>
            </Card>
          </div>

          {/* Submit a Tip Section */}
          <Card className="p-8 bg-card">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Submit a Tip</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Share grant program updates, funding opportunities, or ecosystem developments that should be covered in the Grant Wire.
            </p>

            <a
              href="https://www.notion.so/sovs/13b000c0d59080cf8a88f085c7437552?v=13b000c0d59080d69f72000cca70d4ae"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button size="lg" className="w-full md:w-auto">
                <Send className="w-4 h-4 mr-2" />
                Submit a Tip
              </Button>
            </a>
          </Card>
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
