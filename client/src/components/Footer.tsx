import { Link } from "wouter";
import { Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/30 bg-card/20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo & tagline */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/images/cgw-logo-solo.png"
                alt="Crypto Grant Wire"
                className="w-7 h-7"
              />
              <span className="text-base font-semibold">
                <span className="text-primary">Crypto</span>
                <span className="text-foreground">Grant</span>
                <span className="text-primary">Wire</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">Curated crypto funding intelligence</p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-6">
            <a
              href="https://x.com/sovereignsignal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://t.me/cryptograntwire"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Telegram"
            >
              <Send className="w-5 h-5" />
            </a>
            <a
              href="https://sovereignsignal.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Substack"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2025 Crypto Grant Wire. Built by @sovereignsignal</p>
          <a
            href="mailto:tips@cryptograntwire.com"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Submit a tip
          </a>
        </div>
      </div>
    </footer>
  );
}
