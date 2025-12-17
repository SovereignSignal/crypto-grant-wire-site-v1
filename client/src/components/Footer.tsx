import { Link } from "wouter";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border py-12 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/CGWLogoSolo.png" alt="Crypto Grant Wire" className="h-8 w-auto" />
              <span className="font-display text-lg font-bold">
                <span className="text-orange-500">Crypto</span> Grant Wire
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Curated intelligence on crypto grants and funding
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-orange-500 transition-colors">
                Home
              </Link>
              <Link href="/archive" className="text-sm text-muted-foreground hover:text-orange-500 transition-colors">
                Archive
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-orange-500 transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex flex-col gap-2">
              <a
                href="https://x.com/sovereignsignal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-orange-500 transition-colors inline-flex items-center gap-2"
              >
                𝕏 @sovereignsignal
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://t.me/cryptograntwire"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-orange-500 transition-colors inline-flex items-center gap-2"
              >
                📡 Telegram Feed
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://sovereignsignal.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-orange-500 transition-colors inline-flex items-center gap-2"
              >
                📰 Substack
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Curated by{" "}
            <a
              href="https://x.com/sovereignsignal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-400 transition-colors"
            >
              Sov
            </a>
            {" "}•{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
